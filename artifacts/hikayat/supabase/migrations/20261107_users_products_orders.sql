-- Supabase Auth owns credentials. This table stores profiles only.
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  created_at timestamptz not null default now(),
  constraint users_name_length check (char_length(name) <= 200)
);
create unique index users_email_unique on public.users (lower(email));

-- Keep profiles in sync for signup, email changes and Auth metadata updates.
create function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is not null then
    insert into public.users (id, name, email, created_at)
    values (
      new.id,
      left(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 200),
      new.email,
      coalesce(new.created_at, now())
    )
    on conflict (id) do update set
      email = excluded.email,
      name = case
        when new.raw_user_meta_data->>'name' is not null then excluded.name
        else public.users.name
      end;
  end if;
  return new;
end;
$$;
revoke all on function public.sync_auth_user_profile() from public, anon, authenticated;

create trigger sync_hikayat_auth_user
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_auth_user_profile();

insert into public.users (id, name, email, created_at)
select id, left(coalesce(raw_user_meta_data->>'name', split_part(email, '@', 1)), 200),
       email, coalesce(created_at, now())
from auth.users where email is not null
on conflict (id) do nothing;

alter table public.users enable row level security;
revoke all on public.users from anon, authenticated;
grant select on public.users to authenticated;
grant update (name) on public.users to authenticated;
create policy "Read own profile" on public.users
for select to authenticated using ((select auth.uid()) = id);
create policy "Update own profile name" on public.users
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Expose the requested product fields as typed, generated columns while
-- preserving the existing localized fragrance payload and product IDs.
alter table public.products
  add column name jsonb generated always as (data->'name') stored,
  add column description jsonb generated always as (data->'description') stored,
  add column price numeric(12,2) generated always as ((data->>'price')::numeric) stored,
  add column image text generated always as (data->>'image') stored,
  add column category text generated always as (data->>'category') stored,
  add constraint products_price_valid check (price is not null and price >= 0),
  add constraint products_category_valid check (category is not null and category in ('men', 'women', 'unisex')),
  add constraint products_name_valid check (name is not null and jsonb_typeof(name) = 'object'),
  add constraint products_description_valid check (description is not null and jsonb_typeof(description) = 'object'),
  add constraint products_image_valid check (image is not null and length(image) > 0);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);
create index orders_user_created on public.orders (user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0 and quantity <= 99),
  price numeric(12,2) not null check (price >= 0)
);
create index order_items_order on public.order_items(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
revoke all on public.orders, public.order_items from anon, authenticated;
grant select on public.orders, public.order_items to authenticated;

create policy "Read own orders" on public.orders
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Read own order items" on public.order_items
for select to authenticated using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = (select auth.uid())
  )
);

-- No public write policies: clients cannot forge prices, totals or paid status.
-- A future trusted checkout must create orders and line items atomically.
