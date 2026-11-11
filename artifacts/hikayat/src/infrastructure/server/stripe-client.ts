import 'server-only';
import Stripe from 'stripe';
import { StripeSync, runMigrations } from 'stripe-replit-sync';
import { getSqlConfig } from '@/lib/db';

/** Keys are read fresh on each call so rotation does not require a cached client reset.
 * Explicit Secrets also work on Vercel, where Replit connector credentials do not exist.
 */
export function getUncachableStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith('sk_test_')) throw new Error('A Stripe test secret key is required');
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 15_000 });
}

declare global {
  var hikayatStripeSync: Promise<StripeSync> | undefined;
}

/** Lazy runtime initialization; never connects during next build. */
export function getStripeSync(): Promise<StripeSync> {
  globalThis.hikayatStripeSync ??= initialize().catch((error: unknown) => {
    globalThis.hikayatStripeSync = undefined;
    throw error;
  });
  return globalThis.hikayatStripeSync;
}

async function initialize() {
  const stripe = getUncachableStripeClient();
  const config = await getSqlConfig();
  await runMigrations({ databaseUrl: config.connectionString!, ssl: config.ssl as Exclude<typeof config.ssl, boolean | undefined> });
  const sync = new StripeSync({
    poolConfig: config,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
    // Managed webhook signing secrets are securely stored by the sync library.
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  });
  const rawOrigin = process.env.APP_URL;
  if (!rawOrigin) throw new Error('APP_URL is required for the Stripe webhook');
  const origin = new URL(rawOrigin);
  if (origin.protocol !== 'https:' || origin.pathname !== '/') throw new Error('APP_URL must be an HTTPS origin');
  const base = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
  await sync.findOrCreateManagedWebhook(`${origin.origin}${base}/api/stripe/webhook`);
  await sync.syncBackfill({ object: 'all' });
  return sync;
}
