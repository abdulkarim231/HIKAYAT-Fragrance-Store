import { checkoutSchema, PaymentFailure } from '@/domain/checkout';
import { currentUser } from '@/infrastructure/server/supabase-auth';
import { noStore, secureCookies, validateOrigin } from '@/infrastructure/server/auth-http';
import { paymentError } from '@/infrastructure/server/payment-http';
import { startCheckout } from '@/infrastructure/server/payment-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const origin = validateOrigin(request);
    const user = await currentUser(secureCookies(request));
    if (!user) throw new PaymentFailure('unauthorized', 401);
    if (Number(request.headers.get('content-length') ?? 0) > 16_384) throw new PaymentFailure('invalid_input');
    const body = await request.text();
    if (body.length > 16_384) throw new PaymentFailure('invalid_input');
    let parsed;
    try { parsed = checkoutSchema.safeParse(JSON.parse(body)); } catch { throw new PaymentFailure('invalid_input'); }
    if (!parsed.success) throw new PaymentFailure('invalid_input');
    const base = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
    return Response.json(await startCheckout(parsed.data, user, `${origin}${base}`), { headers: noStore });
  } catch (error) { return paymentError(error); }
}
