import 'server-only';

export function supabaseSettings() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const rawUrl = process.env.SUPABASE_URL;
  if (!key || !rawUrl) throw new Error('supabase_settings_missing');
  let url: URL;
  try { url = new URL(rawUrl.trim()); } catch { throw new Error('supabase_url_invalid'); }
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co')) throw new Error('supabase_url_invalid');
  const publicKey = key.trim();
  let legacyAnon = false;
  try {
    legacyAnon = JSON.parse(Buffer.from(publicKey.split('.')[1] ?? '', 'base64url').toString('utf8')).role === 'anon';
  } catch { /* Not a legacy JWT; modern publishable keys do not use JWT format. */ }
  if (!publicKey.startsWith('sb_publishable_') && !legacyAnon) {
    throw new Error('supabase_public_key_invalid');
  }
  return { url, key: publicKey, legacyAnon };
}
