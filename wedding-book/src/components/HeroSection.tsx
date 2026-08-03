import heroImage from '../assets/hero.png'
import { weddingInfo } from '../data/weddingInfo'

function getDday(dateStr: string) {
  const weddingDate = new Date(dateStr + 'T12:00:00')
  const now = new Date()
  const diff = weddingDate.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

export default function HeroSection() {
  const dday = getDday(weddingInfo.weddingDate)

  return (
    <section id="hero">
      {/* 커버 사진 (정적 에셋) */}
      <div className="hero-cover">
        <img src={heroImage} alt="웨딩 커버" />
        <div className="hero-cover-overlay" />
      </div>

      {/* 웨딩 정보 */}
      <div className="hero-content">
        <div className="hero-badge">
          {dday > 0 ? `D-${dday}` : dday === 0 ? 'D-Day 🎉' : `D+${Math.abs(dday)}`}
        </div>

        <div className="hero-names">
          <span className="groom">{weddingInfo.groomName}</span>
          <span className="heart">♥</span>
          <span className="bride">{weddingInfo.brideName}</span>
        </div>

        <div className="hero-date">
          {new Date(weddingInfo.weddingDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })} {weddingInfo.weddingTime}
        </div>

        <div className="hero-location">
          <p>{weddingInfo.venueName}</p>
          <p className="address">{weddingInfo.venueAddress}</p>
        </div>

        <button
          className="map-btn"
          onClick={() => window.open(weddingInfo.mapUrl, '_blank')}
        >
          📍 오시는 길
        </button>
      </div>
    </section>
  )
}
