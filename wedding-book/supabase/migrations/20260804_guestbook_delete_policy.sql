-- 관리자(로그인된 사용자)가 방명록 항목을 삭제할 수 있도록 RLS 정책 추가
-- Supabase SQL Editor에서 실행하세요.

-- 혹시 RLS 자체가 꺼져 있다면 켜기 (이미 켜져 있다면 에러 없이 무시됨)
alter table guestbook enable row level security;

-- 기존에 동일 이름 정책이 있으면 충돌 방지를 위해 먼저 제거
drop policy if exists "Authenticated users can delete guestbook entries" on guestbook;

create policy "Authenticated users can delete guestbook entries"
on guestbook
for delete
to authenticated
using (true);
