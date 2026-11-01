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
