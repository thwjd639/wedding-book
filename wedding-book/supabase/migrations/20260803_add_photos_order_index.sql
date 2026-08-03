-- photos 테이블에 정렬용 order_index 컬럼 추가
-- Supabase 대시보드 SQL Editor에서 실행하면 됩니다.

alter table photos
  add column if not exists order_index bigint;

-- 기존 데이터는 업로드 시각(created_at) 순서를 그대로 order_index로 이관
update photos
set order_index = extract(epoch from created_at)::bigint
where order_index is null;

-- 새로 업로드되는 사진도 항상 정렬 기준을 갖도록 인덱스 추가 (선택)
create index if not exists photos_order_index_idx on photos (order_index);
