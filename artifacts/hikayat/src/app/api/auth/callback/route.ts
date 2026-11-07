import { NextResponse } from 'next/server';
import { confirmSignUp } from '@/infrastructure/server/supabase-auth';
import { secureCookies } from '@/infrastructure/server/auth-http';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? url.host;
  const protocol = secureCookies(request) ? 'https:' : 'http:';
  const destination = new URL(`${protocol}//${host}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`);
  try {
    const code = url.searchParams.get('code');
    if (!code || code.length > 4096) throw new Error('Invalid confirmation.');
    await confirmSignUp(code, secureCookies(request));
    destination.searchParams.set('auth', 'confirmed');
  } catch {
    destination.searchParams.set('auth', 'confirmation_failed');
  }
  return NextResponse.redirect(destination, { headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
