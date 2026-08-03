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

  // 히어로 배경 영상 (Supabase Storage에 올린 뒤 공개 URL을 여기에 붙여넣으세요)
  // GitHub 레포가 public이라 public/ 폴더에 직접 넣으면 원본이 그대로 노출됩니다.
  // Storage > photos 버킷 > hero/hero-video.mp4 로 업로드 후,
  // "Get public URL" 눌러서 나온 주소를 아래에 넣으면 됩니다.
  // 비워두면(빈 문자열) 자동으로 정적 이미지(hero.png)만 보여줍니다.
  heroVideoUrl: '',
} as const

export type WeddingInfo = typeof weddingInfo
