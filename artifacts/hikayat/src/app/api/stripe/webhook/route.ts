import { processPaymentWebhook } from '@/infrastructure/server/payment-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature || Number(request.headers.get('content-length') ?? 0) > 1_048_576) {
    return Response.json({ received: false }, { status: 400 });
  }
  try {
    const payload = Buffer.from(await request.arrayBuffer());
    if (payload.length > 1_048_576) return Response.json({ received: false }, { status: 400 });
    await processPaymentWebhook(payload, signature);
    return Response.json({ received: true });
  } catch {
    return Response.json({ received: false }, { status: 400 });
  }
}
