import { PaymentFailure } from '@/domain/checkout';
import { currentUser } from '@/infrastructure/server/supabase-auth';
import { noStore, secureCookies } from '@/infrastructure/server/auth-http';
import { paymentError } from '@/infrastructure/server/payment-http';
import { verifyOrder } from '@/infrastructure/server/payment-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const user = await currentUser(secureCookies(request));
    if (!user) throw new PaymentFailure('unauthorized', 401);
    const session = new URL(request.url).searchParams.get('session_id');
    if (!session || !/^cs_test_[A-Za-z0-9_]{1,250}$/.test(session)) throw new PaymentFailure('invalid_input');
    return Response.json(await verifyOrder(session, user.id), { headers: noStore });
  } catch (error) { return paymentError(error); }
}
