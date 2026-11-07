import { signOut } from '@/infrastructure/server/supabase-auth';
import { authError, noStore, validateOrigin } from '@/infrastructure/server/auth-http';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    validateOrigin(request, false);
    await signOut();
    return Response.json({ user: null }, { headers: noStore });
  } catch (error) { return authError(error); }
}
