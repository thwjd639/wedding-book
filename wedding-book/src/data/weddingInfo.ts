// 결혼식 기본 정보 (정적 데이터)
// 배포 후 값이 바뀌면 이 파일만 수정하면 됩니다. (DB 왕복 없음)
export const weddingInfo = {
  groomName: '김정훈',
  brideName: '이유진',
  weddingDate: '2026-08-22', // YYYY-MM-DD
  weddingTime: '오후 1시',
  venueName: '그랜드조선 제주',
  venueAddress: '제주 서귀포시 중문관광로72번길 60',
  mapUrl: 'https://map.naver.com/p/search/그랜드조선제주',
  screenshotProtect: false, // 캡처 방지 켜고 싶으면 true로
} as const

export type WeddingInfo = typeof weddingInfo
