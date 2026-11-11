import 'server-only';
import { PaymentFailure } from '@/domain/checkout';
import { AuthFailure } from './supabase-auth';
import { noStore } from './auth-http';

export function paymentError(error: unknown) {
  const failure = error instanceof PaymentFailure || error instanceof AuthFailure
    ? error : new PaymentFailure('payment_unavailable', 503);
  // Never log provider response bodies, request bodies, credentials or delivery data.
  if (failure.status >= 500) console.error('[payment] Service unavailable');
  return Response.json({ code: failure.code }, { status: failure.status, headers: noStore });
}
