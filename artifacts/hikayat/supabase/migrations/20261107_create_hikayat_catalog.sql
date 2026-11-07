-- Supabase is the only catalog database. No privileged browser access.
create table public.hikayat_products (
  id text primary key,
  data jsonb not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint hikayat_product_object check (jsonb_typeof(data) = 'object'),
  constraint hikayat_product_id check (data->>'id' = id)
);

alter table public.hikayat_products enable row level security;
revoke all on table public.hikayat_products from anon, authenticated;
grant select on table public.hikayat_products to anon, authenticated;

create policy "Read published fragrance catalog"
on public.hikayat_products for select
to anon, authenticated
using (published = true);
