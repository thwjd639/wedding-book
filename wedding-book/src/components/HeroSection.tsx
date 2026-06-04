import { useEffect, useState } from 'react'

const WEDDING_DATE = new Date('2026-08-08T12:00:00')
const KAKAO_MAP_URL = 'https://naver.me/Grmatssb'

function getDday() {
  const now = new Date()
  const diff = WEDDING_DATE.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

export default function HeroSection() {
  const [dday, setDday] = useState(getDday())

  useEffect(() => {
    const timer = setInterval(() => {
      setDday(getDday())
    }, 1000 * 60)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="hero">
      <div className="hero-badge">
        {dday > 0 ? `D-${dday}` : dday === 0 ? 'D-Day 🎉' : `D+${Math.abs(dday)}`}
      </div>

      <div className="hero-names">
        <span className="groom">홍길동</span>
        <span className="heart">♥</span>
        <span className="bride">김영희</span>
      </div>

      <div className="hero-date">
        2025년 8월 8일 금요일
      </div>

      <div className="hero-location">
        <p>그랜드 조선 제주</p>
        <p className="address">제주 서귀포시 중문관광로72번길 60</p>
      </div>

      <button
        className="map-btn"
        onClick={() => window.open(KAKAO_MAP_URL, '_blank')}
      >
        📍 오시는 길
      </button>
    </section>
  )
}