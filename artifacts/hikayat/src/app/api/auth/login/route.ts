import { signIn } from '@/infrastructure/server/supabase-auth';
import { authError, noStore, readCredentials, secureCookies, validateOrigin } from '@/infrastructure/server/auth-http';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    validateOrigin(request);
    const { email, password } = await readCredentials(request);
    const user = await signIn(email, password, secureCookies(request));
    return Response.json({ user, authenticated: true, requiresConfirmation: false }, { headers: noStore });
  } catch (error) { return authError(error); }
}
