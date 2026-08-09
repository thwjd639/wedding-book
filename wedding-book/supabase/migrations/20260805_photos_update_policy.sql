-- 관리자(로그인된 사용자)가 사진 순서(order_index)를 변경할 수 있도록 RLS 정책 추가
-- Supabase SQL Editor에서 실행하세요.

alter table photos enable row level security;

drop policy if exists "Authenticated users can update photos" on photos;

create policy "Authenticated users can update photos"
on photos
for update
to authenticated
using (true)
with check (true);
