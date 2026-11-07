import 'server-only';
import { randomBytes, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { supabaseSettings } from './supabase-settings';

const ACCESS = 'hikayat-access';
const REFRESH = 'hikayat-refresh';
const VERIFIER = 'hikayat-pkce';
const publicUser = z.object({ id: z.string(), email: z.string().email() });
const tokenResponse = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number().positive(),
  user: publicUser,
});
export type AuthUser = z.infer<typeof publicUser>;
export type AuthCode = 'invalid_credentials' | 'email_not_confirmed' | 'weak_password' | 'invalid_input' | 'rate_limited' | 'auth_unavailable' | 'signup_failed' | 'forbidden';

export class AuthFailure extends Error {
  constructor(public code: AuthCode, public status = 400) { super(code); }
}

function settings() {
  try { return supabaseSettings(); } catch { throw new AuthFailure('auth_unavailable', 503); }
}

async function authRequest(path: string, body?: object, token?: string, method = 'POST') {
  const { url, key } = settings();
  let response: Response;
  try {
    response = await fetch(new URL(`/auth/v1/${path}`, url), {
      method,
      headers: {
        apikey: key,
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(12_000),
    });
  } catch { throw new AuthFailure('auth_unavailable', 503); }
  const result: unknown = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = z.object({ code: z.string().optional(), error_code: z.string().optional() }).safeParse(result);
    const providerCode = code.success ? (code.data.code ?? code.data.error_code) : '';
    if (response.status === 429) throw new AuthFailure('rate_limited', 429);
    if (response.status >= 500) throw new AuthFailure('auth_unavailable', 503);
    if (providerCode === 'email_not_confirmed') throw new AuthFailure('email_not_confirmed');
    if (providerCode === 'weak_password') throw new AuthFailure('weak_password');
    // Avoid disclosing whether an email address exists.
    throw new AuthFailure('invalid_credentials');
  }
  return result;
}

async function saveSession(input: unknown, secure: boolean) {
  const session = tokenResponse.parse(input);
  const jar = await cookies();
  const options = { httpOnly: true, secure, sameSite: 'lax' as const, path: '/' };
  jar.set(ACCESS, session.access_token, { ...options, maxAge: Math.min(session.expires_in, 3600) });
  jar.set(REFRESH, session.refresh_token, { ...options, maxAge: 60 * 60 * 24 * 30 });
  return session.user;
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS);
  jar.delete(REFRESH);
  jar.delete(VERIFIER);
}

export async function signIn(email: string, password: string, secure: boolean) {
  const result = await authRequest('token?grant_type=password', { email, password });
  return saveSession(result, secure);
}

export async function signUp(email: string, password: string, origin: string, secure: boolean) {
  if (password.length < 8) throw new AuthFailure('weak_password');
  const verifier = randomBytes(48).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const jar = await cookies();
  const callback = `${origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/auth/callback`;
  const result = await authRequest(`signup?redirect_to=${encodeURIComponent(callback)}`, {
    email,
    password,
    code_challenge: challenge,
    code_challenge_method: 's256',
  });
  const session = tokenResponse.safeParse(result);
  if (session.success) {
    const user = await saveSession(session.data, secure);
    return { user, authenticated: true, requiresConfirmation: false };
  }
  // The email confirmation callback exchanges a one-time code on the server.
  const signup = z.object({ id: z.string() }).passthrough().safeParse(result);
  const nestedSignup = z.object({ user: z.object({ id: z.string() }) }).safeParse(result);
  if (!signup.success && !nestedSignup.success) throw new AuthFailure('signup_failed');
  jar.set(VERIFIER, verifier, {
    httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24,
  });
  return { user: null, authenticated: false, requiresConfirmation: true };
}

export async function confirmSignUp(code: string, secure: boolean) {
  const jar = await cookies();
  const verifier = jar.get(VERIFIER)?.value;
  if (!verifier) throw new AuthFailure('invalid_credentials');
  const result = await authRequest('token?grant_type=pkce', { auth_code: code, code_verifier: verifier });
  await saveSession(result, secure);
  jar.delete(VERIFIER);
}

export async function currentUser(secure: boolean): Promise<AuthUser | null> {
  const jar = await cookies();
  const access = jar.get(ACCESS)?.value;
  const refresh = jar.get(REFRESH)?.value;
  if (!access && !refresh) return null;
  if (access) {
    try {
      return publicUser.parse(await authRequest('user', undefined, access, 'GET'));
    } catch (error) {
      if (error instanceof AuthFailure && error.status >= 500) throw error;
    }
  }
  if (refresh) {
    try {
      return await saveSession(await authRequest('token?grant_type=refresh_token', { refresh_token: refresh }), secure);
    } catch (error) {
      if (error instanceof AuthFailure && error.status >= 500) throw error;
    }
  }
  await clearSession();
  return null;
}

export async function signOut() {
  const jar = await cookies();
  const access = jar.get(ACCESS)?.value;
  if (access) {
    try {
      await authRequest('logout?scope=local', undefined, access);
    } catch (error) {
      // An already-expired session is safe to clear. On upstream failure keep
      // cookies so the user can retry revoking the refresh session.
      if (error instanceof AuthFailure && error.status >= 500) throw error;
    }
  }
  await clearSession();
}
