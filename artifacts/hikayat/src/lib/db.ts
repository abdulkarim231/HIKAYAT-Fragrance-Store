import 'server-only';
import type { Pool, PoolConfig } from 'pg';

interface DatabaseRequest {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: object;
  /** Request-scoped token; never retained by the shared client. */
  accessToken?: string;
}

interface DatabaseConnection {
  request(path: string, options?: DatabaseRequest): Promise<Response>;
}

declare global {
  var hikayatDatabase: DatabaseConnection | undefined;
  var hikayatSqlPool: Pool | undefined;
}
/** Direct server-only SQL uses the same Supabase database, not a second database. */
export async function getSqlConfig(): Promise<PoolConfig> {
  const { supabaseCa } = await import('@/infrastructure/server/supabase-ca');
  const raw = process.env.SUPABASE_DATABASE_URL;
  if (!raw) throw new Error('SUPABASE_DATABASE_URL is required');
  const url = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)
    || !url.hostname.endsWith('.pooler.supabase.com')) {
    throw new Error('A Supabase Session pooler PostgreSQL URI is required');
  }
  // Do not let URI query parameters override verified TLS options.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(key);
  return {
    connectionString: url.toString(),
    ssl: { ca: supabaseCa, rejectUnauthorized: true },
    max: 3,
    connectionTimeoutMillis: 12_000,
    idleTimeoutMillis: 20_000,
    allowExitOnIdle: true,
  };
}

export async function getSqlDb(): Promise<Pool> {
  if (!globalThis.hikayatSqlPool) {
    const [{ default: pg }, config] = await Promise.all([import('pg'), getSqlConfig()]);
    globalThis.hikayatSqlPool ??= new pg.Pool(config);
  }
  return globalThis.hikayatSqlPool;
}

function createConnection(): DatabaseConnection {
  const rawUrl = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!rawUrl || !key) throw new Error('supabase_settings_missing');
  let url: URL;
  try { url = new URL(rawUrl); } catch { throw new Error('supabase_url_invalid'); }
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co')) throw new Error('supabase_url_invalid');
  let legacyAnon = false;
  try {
    legacyAnon = JSON.parse(Buffer.from(key.split('.')[1] ?? '', 'base64url').toString('utf8')).role === 'anon';
  } catch { /* Modern publishable keys are not JWTs. */ }
  if (!key.startsWith('sb_publishable_') && !legacyAnon) throw new Error('supabase_public_key_invalid');

  // Supabase REST uses Node's pooled HTTP transport. Cache this stateless
  // connection facade across warm Vercel invocations, not a user's session.
  return Object.freeze({
    async request(path: string, options: DatabaseRequest = {}) {
      if (!path.startsWith('/rest/v1/') && !path.startsWith('/auth/v1/')) {
        throw new Error('supabase_path_invalid');
      }
      const token = options.accessToken ?? (legacyAnon ? key : undefined);
      return fetch(new URL(path, url), {
        method: options.method ?? 'GET',
        headers: {
          apikey: key,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(12_000),
      });
    },
  });
}

/** Lazy initialization avoids requiring secrets during Next.js build analysis. */
export function getDb(): DatabaseConnection {
  globalThis.hikayatDatabase ??= createConnection();
  return globalThis.hikayatDatabase;
}
