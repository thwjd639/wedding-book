import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface StatsProps {
  guestbookCount: number
  photoCount: number
}

export default function AdminStats({ guestbookCount, photoCount }: StatsProps) {
  const [loading, setLoading] = useState(true)
  const [totalViews, setTotalViews] = useState(0)
  const [todayViews, setTodayViews] = useState(0)
  const [dailyCounts, setDailyCounts] = useState<{ label: string; count: number }[]>([])

  async function fetchStats() {
    setLoading(true)

    // 전체 방문 수
    const { count: total } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
    setTotalViews(total ?? 0)

    // 최근 7일 방문 기록을 가져와서 날짜별로 집계
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const { data: recent } = await supabase
      .from('page_views')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    const buckets = new Map<string, number>()
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo)
      d.setDate(d.getDate() + i)
      const key = d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      buckets.set(key, 0)
    }

    let todayCount = 0
    const todayKey = new Date().toDateString()
    ;(recent ?? []).forEach((row) => {
      const d = new Date(row.created_at)
      const key = d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
      buckets.set(key, (buckets.get(key) ?? 0) + 1)
      if (d.toDateString() === todayKey) todayCount++
    })

    setTodayViews(todayCount)
    setDailyCounts(Array.from(buckets, ([label, count]) => ({ label, count })))
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const maxCount = Math.max(1, ...dailyCounts.map((d) => d.count))

  if (loading) return <p className="empty-msg">불러오는 중...</p>

  return (
    <div className="stats-tab">
      <div className="stats-cards">
        <div className="stats-card">
          <p className="stats-card-value">{totalViews}</p>
          <p className="stats-card-label">누적 방문</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-value">{todayViews}</p>
          <p className="stats-card-label">오늘 방문</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-value">{guestbookCount}</p>
          <p className="stats-card-label">방명록</p>
        </div>
        <div className="stats-card">
          <p className="stats-card-value">{photoCount}</p>
          <p className="stats-card-label">사진</p>
        </div>
      </div>

      <p className="stats-chart-title">최근 7일 방문 추이</p>
      <div className="stats-chart">
        {dailyCounts.map((d) => (
          <div key={d.label} className="stats-bar-col">
            <div className="stats-bar-track">
              <div
                className="stats-bar-fill"
                style={{ height: `${(d.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="stats-bar-count">{d.count}</span>
            <span className="stats-bar-label">{d.label}</span>
          </div>
        ))}
      </div>

      <p className="stats-note">
        방문 수는 메인 페이지가 로드된 횟수 기준이라, 같은 사람이 여러 번 들어오면 중복으로 잡혀요.
      </p>
    </div>
  )
}
