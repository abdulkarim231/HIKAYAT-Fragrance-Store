-- Run as database administrator in Supabase SQL Editor.
-- All fixtures are rolled back; this does not send confirmation emails.
begin;

insert into auth.users (id, email, raw_user_meta_data, created_at)
values
  ('00000000-0000-4000-8000-000000000101', 'fixture-one@hikayat.invalid', '{"name":"Fixture One"}', now()),
  ('00000000-0000-4000-8000-000000000102', 'fixture-two@hikayat.invalid', '{"name":"Fixture Two"}', now());

insert into public.orders (id, user_id, total, status)
values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 685, 'pending'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', 545, 'paid');

insert into public.order_items (order_id, product_id, quantity, price)
values
  ('00000000-0000-4000-8000-000000000201', 'layali-oud', 1, 685),
  ('00000000-0000-4000-8000-000000000202', 'ward-taifi', 1, 545);

do $$
begin
  if (select name from public.users where id = '00000000-0000-4000-8000-000000000101') <> 'Fixture One' then
    raise exception 'Auth profile trigger failed';
  end if;
  begin
    update public.users set email = 'FIXTURE-TWO@HIKAYAT.INVALID'
    where id = '00000000-0000-4000-8000-000000000101';
    raise exception 'Duplicate email was accepted';
  exception when unique_violation then null;
  end;
  begin
    update public.orders set status = 'invalid'
    where id = '00000000-0000-4000-8000-000000000201';
    raise exception 'Invalid order status was accepted';
  exception when check_violation then null;
  end;
  begin
    insert into public.order_items (order_id, product_id, quantity, price)
    values ('00000000-0000-4000-8000-000000000201', 'layali-oud', 0, 685);
    raise exception 'Zero quantity was accepted';
  exception when check_violation then null;
  end;
  if has_table_privilege('anon', 'public.users', 'SELECT')
    or has_table_privilege('anon', 'public.orders', 'SELECT')
    or has_table_privilege('anon', 'public.order_items', 'SELECT') then
    raise exception 'Anonymous access to private data is allowed';
  end if;
  if has_table_privilege('authenticated', 'public.orders', 'INSERT')
    or has_table_privilege('authenticated', 'public.orders', 'UPDATE')
    or has_table_privilege('authenticated', 'public.order_items', 'INSERT')
    or has_column_privilege('authenticated', 'public.users', 'email', 'UPDATE') then
    raise exception 'Unsafe client write permission';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', true);

do $$
begin
  if (select count(*) from public.users) <> 1
    or (select count(*) from public.orders) <> 1
    or (select count(*) from public.order_items) <> 1 then
    raise exception 'Cross-user rows are visible or own rows are missing';
  end if;
  if exists (select 1 from public.orders where user_id <> '00000000-0000-4000-8000-000000000101') then
    raise exception 'Another user order was exposed';
  end if;
end;
$$;

reset role;
rollback;
select 'database rules verified; fixtures rolled back' as result;
