-- Run this entire file in the Supabase SQL Editor after replacing the email below
-- with the one administrator email used to create the Supabase Auth user.

create table if not exists public.furniture_counts (
  item_id text primary key,
  item_name text not null,
  total bigint not null default 0 check (total >= 0)
);

insert into public.furniture_counts (item_id, item_name) values
  ('bed', '포근한 수납 침대'),
  ('sofa', '3인용 패브릭 소파'),
  ('desk', '깔끔한 화이트 책상'),
  ('lamp', '무드 스탠드 조명'),
  ('rug', '포근한 사각 러그'),
  ('luxury_rug', '고급진 러그'),
  ('omons_bed', 'O몬스 침대')
on conflict (item_id) do update set item_name = excluded.item_name;

alter table public.furniture_counts enable row level security;
revoke all on table public.furniture_counts from anon, authenticated;
grant select on table public.furniture_counts to authenticated;

drop policy if exists "Only the project admin can view furniture counts" on public.furniture_counts;
create policy "Only the project admin can view furniture counts"
  on public.furniture_counts
  for select
  to authenticated
  using (
    lower(coalesce((select auth.jwt() ->> 'email'), '')) = lower('ADMIN_EMAIL_HERE')
  );

create or replace function public.record_furniture_usage(p_counts jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  item record;
  item_total bigint;
begin
  if p_counts is null or jsonb_typeof(p_counts) <> 'object' then
    raise exception 'Invalid furniture counts';
  end if;

  for item in select key, value from jsonb_each_text(p_counts)
  loop
    if item.value !~ '^[0-9]{1,4}$' then
      raise exception 'Invalid furniture count';
    end if;

    item_total := item.value::bigint;
    if item_total < 1 then
      raise exception 'Furniture counts must be positive';
    end if;

    update public.furniture_counts
      set total = total + item_total
      where item_id = item.key;
  end loop;
end;
$$;

revoke all on function public.record_furniture_usage(jsonb) from public, authenticated;
grant execute on function public.record_furniture_usage(jsonb) to anon, authenticated;

create or replace function public.reset_furniture_counts()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce((select auth.jwt() ->> 'email'), '')) <> lower('ADMIN_EMAIL_HERE') then
    raise exception using errcode = '42501', message = 'Administrator access required';
  end if;

  update public.furniture_counts set total = 0;
end;
$$;

revoke all on function public.reset_furniture_counts() from public, anon;
grant execute on function public.reset_furniture_counts() to authenticated;
