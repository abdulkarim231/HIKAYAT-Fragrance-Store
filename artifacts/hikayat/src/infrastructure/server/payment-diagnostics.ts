import 'server-only';

// Only fixed labels may reach logs. Never serialize errors, stacks, messages,
// request bodies, URLs, or provider responses: they can contain credentials/PII.
const providerCodes = new Set([
  'ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT',
  'SELF_SIGNED_CERT_IN_CHAIN', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'CERT_HAS_EXPIRED', 'ERR_TLS_CERT_ALTNAME_INVALID',
  '28P01', '28000', '3D000', '42P01', '42703', '42501',
  '23502', '23503', '23505', '23514', '53300', '57014',
  'api_key_expired', 'resource_missing', 'parameter_unknown',
  'parameter_invalid_empty', 'parameter_invalid_integer',
  'idempotency_key_in_use', 'rate_limit', 'invalid_api_key',
]);
const providerTypes = new Set([
  'StripeAuthenticationError', 'StripePermissionError',
  'StripeInvalidRequestError', 'StripeConnectionError',
  'StripeAPIError', 'StripeRateLimitError', 'StripeIdempotencyError',
]);
const knownReasons: Record<string, string> = {
  'SUPABASE_DATABASE_URL is required': 'database_url_missing',
  'A Supabase Session pooler PostgreSQL URI is required': 'database_url_invalid',
  'A Stripe test secret key is required': 'stripe_test_key_missing_or_invalid',
  'APP_URL is required for the Stripe webhook': 'app_url_missing',
  'APP_URL must be an HTTPS origin': 'app_url_invalid',
  'Connection terminated due to connection timeout': 'database_connection_timeout',
  'timeout exceeded when trying to connect': 'database_connection_timeout',
};

type Environment = Record<string, string | undefined>;
type ConfigurationState = 'missing' | 'invalid' | 'present';

function urlState(raw: string | undefined, valid: (url: URL) => boolean): ConfigurationState {
  if (!raw) return 'missing';
  try { return valid(new URL(raw)) ? 'present' : 'invalid'; }
  catch { return 'invalid'; }
}

export function paymentDiagnostic(error: unknown, env: Environment = process.env) {
  let reason = 'unclassified';
  let providerCode = 'unclassified';
  let providerType = 'unclassified';
  let current = error;
  // Network libraries sometimes wrap the useful machine code in a cause.
  for (let depth = 0; depth < 5 && current && typeof current === 'object'; depth++) {
    const value = current as Record<string, unknown>;
    if (typeof value.message === 'string' && Object.hasOwn(knownReasons, value.message)) {
      reason = knownReasons[value.message]!;
    }
    if (typeof value.code === 'string' && providerCodes.has(value.code)) providerCode = value.code;
    if (typeof value.type === 'string' && providerTypes.has(value.type)) providerType = value.type;
    current = value.cause;
  }
  return {
    reason, providerCode, providerType,
    configuration: {
      STRIPE_SECRET_KEY: !env.STRIPE_SECRET_KEY ? 'missing'
        : env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'present' : 'invalid',
      SUPABASE_DATABASE_URL: urlState(env.SUPABASE_DATABASE_URL, (url) =>
        ['postgres:', 'postgresql:'].includes(url.protocol) && url.hostname.endsWith('.pooler.supabase.com')),
      APP_URL: urlState(env.APP_URL, (url) => url.protocol === 'https:' && url.pathname === '/'),
    },
  };
}
