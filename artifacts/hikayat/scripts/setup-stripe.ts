import { readFile } from 'node:fs/promises';
import { getSqlDb } from '../src/lib/db';
import { getStripeSync, getUncachableStripeClient } from '../src/infrastructure/server/stripe-client';
import { productSchema } from '../src/domain/product-schema';
import { toMinorUnits } from '../src/domain/checkout';

/** Manual, repeatable setup. Never runs during a Vercel build. Test mode only. */
async function main() {
  const sync = await getStripeSync();
  const pool = await getSqlDb();
  await pool.query(await readFile(new URL('../supabase/migrations/20261111_stripe_checkout.sql', import.meta.url), 'utf8'));
  const stripe = getUncachableStripeClient();
  const result = await pool.query('select data from public.products where published=true order by id');
  let count = 0;
  for (const row of result.rows) {
    const p = productSchema.parse(row.data);
    const existing = await stripe.products.search({ query: `metadata['hikayat_id']:'${p.id}' AND active:'true'`, limit: 1 });
    const product = existing.data[0] ?? await stripe.products.create({
      name: p.name.en,
      description: p.description.en,
      metadata: { hikayat_id: p.id, name_ar: p.name.ar, category: p.category },
    }, { idempotencyKey: `hikayat-product:${p.id}` });
    const amount = toMinorUnits(p.price);
    const lookupKey = `hikayat:${p.id}:sar:${amount}`;
    const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
    if (!prices.data.length) await stripe.prices.create({
      product: product.id, currency: 'sar', unit_amount: amount, lookup_key: lookupKey,
    }, { idempotencyKey: `hikayat-price:${p.id}:${amount}` });
    count++;
  }
  await sync.syncBackfill({ object: 'all' });
  // Revoke grants again after sync migrations; Stripe data and signing secrets stay server-only.
  await pool.query('revoke all on schema stripe from public, anon, authenticated; revoke all on all tables in schema stripe from public, anon, authenticated');
  console.info(`Stripe test setup completed for ${count} existing catalog products.`);
  await pool.end();
  await sync.postgresClient.pool.end();
}

main().catch(() => {
  console.error('Stripe setup failed. Check server secrets and database connectivity; no credentials were logged.');
  process.exit(1);
});
