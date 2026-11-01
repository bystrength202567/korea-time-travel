-- 달빛 한국사 여행: Supabase SQL Editor에 그대로 붙여 넣고 Run 하세요.
-- 회원 정보(members)와 학습 기록(progress)을 저장하고, 각 회원은 자기 정보만 읽고 쓸 수 있어요(RLS).

create table if not exists public.members (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null check (char_length(name) between 1 and 20),
  country text not null,
  age_group text not null check (age_group in ('14plus', 'under14')),
  guardian_email text,
  consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  -- 만 14세 미만은 보호자 이메일이 있어야 해요
  constraint guardian_required check (age_group = '14plus' or guardian_email is not null)
);

create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stamps jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.members enable row level security;
alter table public.progress enable row level security;

create policy "members: read own" on public.members for select using (auth.uid() = id);
create policy "members: insert own" on public.members for insert with check (auth.uid() = id);
create policy "members: update own" on public.members for update using (auth.uid() = id);
create policy "progress: read own" on public.progress for select using (auth.uid() = user_id);
create policy "progress: insert own" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress: update own" on public.progress for update using (auth.uid() = user_id);

-- 회원 탈퇴: 로그인한 본인의 계정과 모든 기록을 지워요 (members·progress는 cascade로 함께 지워져요)
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = public
as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ===== 방문자 수 (2026-11 추가) =====
-- 브라우저에서 무작위로 만든 방문 번호와 날짜만 저장해요 (누구인지 알 수 없어요).
-- 표에는 정책(policy)을 두지 않아 아무도 직접 읽거나 쓸 수 없고, 아래 함수로만 기록하고 숫자만 돌려줘요.
create table if not exists public.site_visits (
  day date not null,
  visitor_id text not null check (char_length(visitor_id) between 8 and 64),
  primary key (day, visitor_id)
);
alter table public.site_visits enable row level security;

create or replace function public.record_visit(vid text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  d date := (now() at time zone 'Asia/Seoul')::date;
begin
  if vid !~ '^[A-Za-z0-9-]{8,64}$' then
    raise exception 'invalid visitor id';
  end if;
  insert into public.site_visits (day, visitor_id) values (d, vid) on conflict do nothing;
  return json_build_object(
    'today', (select count(*) from public.site_visits where day = d),
    'total', (select count(distinct visitor_id) from public.site_visits)
  );
end;
$$;
revoke all on function public.record_visit(text) from public;
grant execute on function public.record_visit(text) to anon, authenticated;
