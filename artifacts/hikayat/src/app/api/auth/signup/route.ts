import { signUp } from '@/infrastructure/server/supabase-auth';
import { authError, noStore, readCredentials, secureCookies, validateOrigin } from '@/infrastructure/server/auth-http';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const origin = validateOrigin(request);
    const { email, password } = await readCredentials(request);
    return Response.json(await signUp(email, password, origin, secureCookies(request)), { headers: noStore });
  } catch (error) { return authError(error); }
}
