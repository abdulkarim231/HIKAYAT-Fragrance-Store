import 'server-only';
import { z } from 'zod';
import { AuthFailure } from './supabase-auth';

export const noStore = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

export function secureCookies(request: Request) {
  return process.env.NODE_ENV === 'production'
    || request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() === 'https'
    || new URL(request.url).protocol === 'https:';
}

/** Reject cross-origin mutations and require explicit JSON requests. */
export function validateOrigin(request: Request, requireJson = true) {
  const origin = request.headers.get('origin');
  const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host'))?.split(',')[0]?.trim();
  if (!origin || !host || new URL(origin).host !== host || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new AuthFailure('forbidden', 403);
  }
  if (requireJson && !request.headers.get('content-type')?.startsWith('application/json')) throw new AuthFailure('invalid_input');
  return origin;
}

const credentials = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
}).strict();

export async function readCredentials(request: Request) {
  if (Number(request.headers.get('content-length') ?? 0) > 8192) throw new AuthFailure('invalid_input');
  const text = await request.text();
  if (text.length > 8192) throw new AuthFailure('invalid_input');
  try {
    return credentials.parse(JSON.parse(text));
  } catch { throw new AuthFailure('invalid_input'); }
}

export function authError(error: unknown) {
  const failure = error instanceof AuthFailure ? error : new AuthFailure('auth_unavailable', 503);
  return Response.json({ code: failure.code }, { status: failure.status, headers: noStore });
}
