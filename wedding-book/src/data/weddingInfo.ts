// 결혼식 기본 정보 (정적 데이터)
// 배포 후 값이 바뀌면 이 파일만 수정하면 됩니다. (DB 왕복 없음)
export const weddingInfo = {
  groomName: '장문복',
  brideName: '문소정',
  weddingDate: '2026-08-08', // YYYY-MM-DD
  weddingTime: '오후 12시',
  venueName: '그랜드 조선 제주',
  venueAddress: '제주 서귀포시 중문관광로72번길 60',
  mapUrl: 'https://map.naver.com/p/search/그랜드조선제주',
  screenshotProtect: true, // 캡처 방지 켜고 싶으면 true로
  heroVideoUrl: 'https://jkudxgmunztnuvpbwxkd.supabase.co/storage/v1/object/public/photos/hero/hero-video.MP4',
} as const

export type WeddingInfo = typeof weddingInfo
