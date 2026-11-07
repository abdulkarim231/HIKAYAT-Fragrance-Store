import { currentUser } from '@/infrastructure/server/supabase-auth';
import { authError, noStore, secureCookies } from '@/infrastructure/server/auth-http';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    return Response.json({ user: await currentUser(secureCookies(request)) }, { headers: noStore });
  } catch (error) { return authError(error); }
}
