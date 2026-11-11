-- Non-destructive additions; existing catalog, profiles and order RLS stay intact.
alter table public.orders add column if not exists checkout_request_id uuid;
alter table public.orders add column if not exists checkout_fingerprint text;
alter table public.orders add column if not exists stripe_session_id text;
alter table public.orders add column if not exists delivery jsonb;
create unique index if not exists orders_checkout_request
  on public.orders(user_id, checkout_request_id);
create unique index if not exists orders_stripe_session
  on public.orders(stripe_session_id);

-- Stripe's sync schema is server-only and must never expose webhook secrets via REST.
revoke all on schema stripe from public, anon, authenticated;
revoke all on all tables in schema stripe from public, anon, authenticated;
alter default privileges in schema stripe revoke all on tables from public, anon, authenticated;
