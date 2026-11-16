create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    check (order_number ~ '^OV-HD26-[0-9]{4}$'),
  first_name text not null check (char_length(btrim(first_name)) between 1 and 80),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 80),
  email text not null check (char_length(email) between 3 and 160),
  phone text not null check (char_length(phone) between 1 and 30),
  address text not null check (char_length(address) between 1 and 240),
  city text not null check (char_length(city) between 1 and 80),
  postal_code text not null check (char_length(postal_code) between 1 and 30),
  country text not null check (char_length(country) between 1 and 80),
  payment_method text not null
    check (payment_method in ('instapay', 'vodafone-cash', 'cod')),
  payment_reference text not null check (char_length(payment_reference) <= 160),
  items jsonb not null
    check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 30),
  subtotal numeric not null check (subtotal >= 0),
  shipping_fee numeric not null check (shipping_fee >= 0),
  total numeric not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_store_admin()
returns boolean
language sql
stable
as $$
  select
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false)
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'maro.mahrous67@gmail.com';
$$;

alter table public.orders enable row level security;

drop policy if exists "Visitors can submit pending orders" on public.orders;
create policy "Visitors can submit pending orders"
on public.orders
for insert
to anon, authenticated
with check (
  status = 'pending'
  and char_length(btrim(first_name)) between 1 and 80
  and char_length(btrim(last_name)) between 1 and 80
  and jsonb_typeof(items) = 'array'
  and jsonb_array_length(items) between 1 and 30
);

drop policy if exists "Store admins can read orders" on public.orders;
create policy "Store admins can read orders"
on public.orders
for select
to authenticated
using (public.is_store_admin());

drop policy if exists "Store admins can update orders" on public.orders;
create policy "Store admins can update orders"
on public.orders
for update
to authenticated
using (public.is_store_admin())
with check (public.is_store_admin());

drop policy if exists "Store admins can delete orders" on public.orders;
create policy "Store admins can delete orders"
on public.orders
for delete
to authenticated
using (public.is_store_admin());

revoke all on public.orders from anon, authenticated;
grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;
revoke all on function public.is_store_admin() from public, anon;
grant execute on function public.is_store_admin() to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end
$$;
