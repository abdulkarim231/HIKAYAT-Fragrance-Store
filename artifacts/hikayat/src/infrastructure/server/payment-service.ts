import 'server-only';
import { createHash } from 'node:crypto';
import type Stripe from 'stripe';
import { getSqlDb } from '@/lib/db';
import { productSchema } from '@/domain/product-schema';
import { PaymentFailure, toMinorUnits, type CheckoutInput } from '@/domain/checkout';
import { getStripeSync, getUncachableStripeClient } from './stripe-client';

type Buyer = { id: string; email: string };
type StoredOrder = { id: string; user_id: string; total: string; status: 'pending' | 'paid'; stripe_session_id: string | null; checkout_fingerprint: string; created_at: Date };

export async function startCheckout(input: CheckoutInput, buyer: Buyer, origin: string) {
  const sync = await getStripeSync();
  const account = await sync.getAccountId();
  const pool = await getSqlDb();
  const client = await pool.connect();
  const normalized = { ...input, items: [...input.items].sort((a, b) => a.productId.localeCompare(b.productId)) };
  const fingerprint = createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  const stripe = getUncachableStripeClient();
  let order: StoredOrder;
  let stripeItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  try {
    await client.query('begin');
    await client.query('select pg_advisory_xact_lock(hashtextextended($1, 0))', [`${buyer.id}:${input.requestId}`]);
    const existing = await client.query<StoredOrder>(
      'select * from public.orders where user_id=$1 and checkout_request_id=$2 for update', [buyer.id, input.requestId],
    );
    if (existing.rows[0]) {
      order = existing.rows[0];
      if (order.checkout_fingerprint !== fingerprint) throw new PaymentFailure('catalog_changed', 409);
    } else {
      let total = 0;
      const snapshots: { productId: string; quantity: number; price: number }[] = [];
      for (const line of normalized.items) {
        const result = await client.query('select data from public.products where id=$1 and published=true for share', [line.productId]);
        const parsed = productSchema.safeParse(result.rows[0]?.data);
        if (!parsed.success) throw new PaymentFailure('catalog_changed', 409);
        const product = parsed.data;
        const minor = toMinorUnits(product.price);
        total += minor * line.quantity;
        snapshots.push({ ...line, price: product.price });
      }
      if (!Number.isSafeInteger(total) || total > 99_999_999) throw new PaymentFailure('invalid_input');
      const inserted = await client.query<StoredOrder>(
        `insert into public.orders(user_id,total,checkout_request_id,checkout_fingerprint,delivery)
         values($1,$2,$3,$4,$5) returning *`,
        [buyer.id, total / 100, input.requestId, fingerprint, input.delivery],
      );
      order = inserted.rows[0]!;
      for (const line of snapshots) {
        await client.query('insert into public.order_items(order_id,product_id,quantity,price) values($1,$2,$3,$4)',
          [order.id, line.productId, line.quantity, line.price]);
      }
    }
    const lines = await client.query(
      `select i.product_id,i.quantity,i.price from public.order_items i where i.order_id=$1 order by i.product_id`, [order.id],
    );
    for (const line of lines.rows) {
      const price = await client.query(
        `select pr.id from stripe.prices pr join stripe.products p on pr.product=p.id
         where pr._account_id=$1 and p._account_id=$1 and p.active=true and pr.active=true
         and p.metadata->>'hikayat_id'=$2 and pr.currency='sar' and pr.unit_amount=$3
         and pr.type='one_time' order by pr.created desc limit 1`,
        [account, line.product_id, toMinorUnits(Number(line.price))],
      );
      if (!price.rows[0]) throw new PaymentFailure('catalog_changed', 409);
      stripeItems.push({ price: price.rows[0].id, quantity: line.quantity });
    }
    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally { client.release(); }

  if (order.stripe_session_id) {
    const previous = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    if (!previous.livemode && previous.status === 'open' && previous.url) return { url: previous.url };
    if (!previous.livemode && previous.payment_status === 'paid') {
      return { url: `${origin}/checkout/success?session_id=${encodeURIComponent(previous.id)}` };
    }
    throw new PaymentFailure('catalog_changed', 409);
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    allowed_payment_method_types: ['card'],
    customer_email: buyer.email,
    client_reference_id: order.id,
    line_items: stripeItems,
    locale: input.locale,
    metadata: { hikayat_order_id: order.id, hikayat_user_id: buyer.id },
    payment_intent_data: { metadata: { hikayat_order_id: order.id, hikayat_user_id: buyer.id } },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?payment=cancelled`,
  }, { idempotencyKey: `hikayat:${buyer.id}:${input.requestId}` });
  if (session.livemode || !session.url || session.amount_total !== toMinorUnits(Number(order.total))) {
    throw new PaymentFailure('payment_unavailable', 503);
  }
  await pool.query('update public.orders set stripe_session_id=$1 where id=$2 and (stripe_session_id is null or stripe_session_id=$1)', [session.id, order.id]);
  return { url: session.url };
}

/** Stripe, not a URL parameter or browser response, decides whether an order is paid. */
export async function verifyOrder(sessionId: string, buyerId?: string) {
  const pool = await getSqlDb();
  const result = await pool.query<StoredOrder>(
    'select * from public.orders where stripe_session_id=$1' + (buyerId ? ' and user_id=$2' : ''),
    buyerId ? [sessionId, buyerId] : [sessionId],
  );
  const order = result.rows[0];
  if (!order) throw new PaymentFailure('not_found', 404);
  const session = await getUncachableStripeClient().checkout.sessions.retrieve(sessionId);
  if (session.livemode || session.currency !== 'sar'
    || session.metadata?.hikayat_order_id !== order.id
    || session.metadata?.hikayat_user_id !== order.user_id
    || session.client_reference_id !== order.id
    || session.amount_total !== toMinorUnits(Number(order.total))) {
    throw new PaymentFailure('payment_unavailable', 503);
  }
  if (session.payment_status === 'paid' && session.status === 'complete') {
    await pool.query("update public.orders set status='paid' where id=$1 and status='pending'", [order.id]);
    order.status = 'paid';
  }
  const items = await pool.query('select product_id,quantity,price from public.order_items where order_id=$1 order by product_id', [order.id]);
  return {
    id: order.id, status: order.status, total: Number(order.total), currency: 'SAR' as const,
    items: items.rows.map((i) => ({ productId: String(i.product_id), quantity: Number(i.quantity), price: Number(i.price) })),
  };
}

export async function processPaymentWebhook(payload: Buffer, signature: string) {
  const sync = await getStripeSync();
  // The sync library verifies the signature and maintains Stripe-owned data.
  await sync.processWebhook(payload, signature);
  const event = JSON.parse(payload.toString('utf8')) as Stripe.Event;
  if (event.livemode) throw new PaymentFailure('forbidden', 400);
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.hikayat_order_id) await verifyOrder(session.id);
  }
}
