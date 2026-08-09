-- 방문자 통계용 테이블
-- Supabase SQL Editor에서 실행하세요.

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table page_views enable row level security;

-- 누구나(비로그인 방문자 포함) 방문 기록을 남길 수 있어야 함
drop policy if exists "Anyone can log a page view" on page_views;
create policy "Anyone can log a page view"
on page_views
for insert
to anon, authenticated
with check (true);

-- 통계 조회는 로그인한 관리자만
drop policy if exists "Authenticated users can read page views" on page_views;
create policy "Authenticated users can read page views"
on page_views
for select
to authenticated
using (true);

create index if not exists page_views_created_at_idx on page_views (created_at);
