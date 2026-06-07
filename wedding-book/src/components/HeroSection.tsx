import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface WeddingInfo {
  groom_name: string
  bride_name: string
  wedding_date: string
  wedding_time: string
  venue_name: string
  venue_address: string
  map_url: string
  cover_image_url: string | null
}

function getDday(dateStr: string) {
  const weddingDate = new Date(dateStr + 'T12:00:00')
  const now = new Date()
  const diff = weddingDate.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

export default function HeroSection() {
  const [info, setInfo] = useState<WeddingInfo | null>(null)

  useEffect(() => {
    fetchInfo()
  }, [])

  async function fetchInfo() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (!error && data) setInfo(data)
  }

  if (!info) return <section id="hero"><p className="empty-msg">불러오는 중...</p></section>

  const dday = getDday(info.wedding_date)

  return (
    <section id="hero">
      {/* 커버 사진 */}
      {info.cover_image_url && (
        <div className="hero-cover">
          <img src={info.cover_image_url} alt="웨딩 커버" />
          <div className="hero-cover-overlay" />
        </div>
      )}

      {/* 웨딩 정보 */}
      <div className="hero-content">
        <div className="hero-badge">
          {dday > 0 ? `D-${dday}` : dday === 0 ? 'D-Day 🎉' : `D+${Math.abs(dday)}`}
        </div>

        <div className="hero-names">
          <span className="groom">{info.groom_name}</span>
          <span className="heart">♥</span>
          <span className="bride">{info.bride_name}</span>
        </div>

        <div className="hero-date">
          {new Date(info.wedding_date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })} {info.wedding_time}
        </div>

        <div className="hero-location">
          <p>{info.venue_name}</p>
          <p className="address">{info.venue_address}</p>
        </div>

        <button
          className="map-btn"
          onClick={() => window.open(info.map_url, '_blank')}
        >
          📍 오시는 길
        </button>
      </div>
    </section>
  )
}