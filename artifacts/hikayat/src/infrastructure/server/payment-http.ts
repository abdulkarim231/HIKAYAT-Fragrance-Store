import 'server-only';
import { PaymentFailure } from '@/domain/checkout';
import { AuthFailure } from './supabase-auth';
import { noStore } from './auth-http';
import { paymentDiagnostic } from './payment-diagnostics';

export function paymentError(error: unknown) {
  const failure = error instanceof PaymentFailure || error instanceof AuthFailure
    ? error : new PaymentFailure('payment_unavailable', 503);
  // Keep the public error generic, but make server logs actionable and safe.
  if (failure.status >= 500) {
    console.error('[payment] Service unavailable', JSON.stringify(paymentDiagnostic(error)));
  }
  return Response.json({ code: failure.code }, { status: failure.status, headers: noStore });
}
