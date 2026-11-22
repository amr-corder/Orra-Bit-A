create table if not exists public.admin_session_locks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  session_id uuid not null,
  locked_at timestamptz not null default now()
);

alter table public.admin_session_locks enable row level security;
revoke all on table public.admin_session_locks from anon, authenticated;

create or replace function public.is_store_admin()
returns boolean
language sql
stable
set search_path = ''
as $function$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'maro.mahrous67@gmail.com';
$function$;

revoke all on function public.is_store_admin() from public, anon;
grant execute on function public.is_store_admin() to authenticated;

create or replace function public.claim_admin_session()
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_session_id uuid;
  affected_rows integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'maro.mahrous67@gmail.com' then
    raise exception 'Admin access is required';
  end if;

  current_session_id := nullif(auth.jwt() ->> 'session_id', '')::uuid;
  if current_session_id is null then
    raise exception 'Admin session ID is missing';
  end if;

  insert into public.admin_session_locks (user_id, session_id)
  values (auth.uid(), current_session_id)
  on conflict (user_id) do update
    set session_id = excluded.session_id,
        locked_at = now()
    where public.admin_session_locks.session_id = excluded.session_id
      or public.admin_session_locks.locked_at < now() - interval '5 minutes';

  get diagnostics affected_rows = row_count;
  return affected_rows = 1;
end;
$function$;

create or replace function public.release_admin_session()
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_session_id uuid;
  affected_rows integer;
begin
  if auth.uid() is null then
    return false;
  end if;

  current_session_id := nullif(auth.jwt() ->> 'session_id', '')::uuid;
  if current_session_id is null then
    return false;
  end if;

  delete from public.admin_session_locks
  where user_id = auth.uid()
    and session_id = current_session_id;

  get diagnostics affected_rows = row_count;
  return affected_rows = 1;
end;
$function$;

revoke all on function public.claim_admin_session() from public, anon;
revoke all on function public.release_admin_session() from public, anon;
grant execute on function public.claim_admin_session() to authenticated;
grant execute on function public.release_admin_session() to authenticated;
