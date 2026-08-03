import { useState } from 'react'
import heroImage from '../assets/hero.png'
import { weddingInfo } from '../data/weddingInfo'

// public/hero-video.mp4 에 저화질(720p, 5~10초 루프, 5MB 이하 권장) 영상을 넣어주세요.
const HERO_VIDEO_SRC = '/hero-video.mp4'

function getDday(dateStr: string) {
  const weddingDate = new Date(dateStr + 'T12:00:00')
  const now = new Date()
  const diff = weddingDate.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

export default function HeroSection() {
  const dday = getDday(weddingInfo.weddingDate)
  const [videoFailed, setVideoFailed] = useState(false)

  return (
    <section id="hero">
      {/* 커버 배경: 정적 영상 (실패 시 정적 이미지로 폴백) */}
      <div className="hero-cover">
        {!videoFailed ? (
          <video
            className="hero-cover-video"
            src={HERO_VIDEO_SRC}
            poster={heroImage}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <img src={heroImage} alt="웨딩 커버" />
        )}
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
