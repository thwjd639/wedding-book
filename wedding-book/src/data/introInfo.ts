export interface PersonIntro {
  role: '신랑' | '신부'
  name: string
  mbti: string
  hobby: string
  specialty: string
  icon: string // 성격을 상징하는 이모지 한 개
  leadLine: string // 태그라인 앞 문장
  tagline: string // 굵게 강조되는 문구
  taglineSuffix: string // 태그라인 뒤에 이어지는 조사+문장 (예: '이 되겠습니다.')
  closingLines: string[] // 마무리 다짐 문장 (줄 단위)
  photo: string // public 폴더 기준 경로. 없으면 자동으로 이니셜 아바타로 대체됨
}

export const groomIntro: PersonIntro = {
  role: '신랑',
  name: '김정훈',
  mbti: 'ENFJ',
  hobby: '신부 생각하기',
  specialty: '신부 웃게 하기',
  icon: '🌳',
  leadLine: '항상 든든하고 다정한',
  tagline: '나무 같은 남편',
  taglineSuffix: '이 되겠습니다.',
  closingLines: ['신부 웃음 지킴이는', '제가 평생 맡겠습니다.'],
  photo: '/intro/groom.jpg',
}

export const brideIntro: PersonIntro = {
  role: '신부',
  name: '이유진',
  mbti: 'ISTP',
  hobby: '신랑 놀리기',
  specialty: '신랑이랑 놀기',
  icon: '☀️',
  leadLine: '곁을 밝히는 따뜻한',
  tagline: '햇살 같은 아내',
  taglineSuffix: '가 되겠습니다.',
  closingLines: ['신랑 하루의 비타민 역할,', '평생 책임질게요.'],
  photo: '/intro/bride.jpg',
}
