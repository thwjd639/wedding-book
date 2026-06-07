import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Entry {
  id: string
  created_at: string
  sender_name: string | null
  phone: string
  message: string | null
  image_url: string | null
}

interface WeddingInfo {
  groom_name: string
  bride_name: string
  wedding_date: string
  wedding_time: string
  venue_name: string
  venue_address: string
  map_url: string
}

interface Props {
  session: any
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: Props) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'guestbook' | 'settings'>('guestbook')
  const [info, setInfo] = useState<WeddingInfo | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    fetchEntries()
    fetchInfo()
  }, [])

  async function fetchEntries() {
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setEntries(data)
    setLoading(false)
  }

  async function fetchInfo() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (!error && data) setInfo(data)
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제할까요?')) return
    const { error } = await supabase.from('guestbook').delete().eq('id', id)
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleSaveInfo() {
    if (!info) return
    setSaving(true)
    const { error } = await supabase
      .from('settings')
      .update({
        groom_name: info.groom_name,
        bride_name: info.bride_name,
        wedding_date: info.wedding_date,
        wedding_time: info.wedding_time,
        venue_name: info.venue_name,
        venue_address: info.venue_address,
        map_url: info.map_url,
      })
      .eq('id', 1)

    if (!error) {
      setSaveMsg('저장됐어요 ✅')
      setTimeout(() => setSaveMsg(''), 2000)
    }
    setSaving(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    onLogout()
  }

  function maskPhone(phone: string) {
    return phone.replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, '$1-****-$3')
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>💍 관리자 대시보드</h1>
        <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
      </div>

      {/* 탭 */}
      <div className="admin-tabs">
        <button
          className={tab === 'guestbook' ? 'tab active' : 'tab'}
          onClick={() => setTab('guestbook')}
        >
          방명록 관리
        </button>
        <button
          className={tab === 'settings' ? 'tab active' : 'tab'}
          onClick={() => setTab('settings')}
        >
          웨딩 정보 설정
        </button>
      </div>

      {/* 방명록 탭 */}
      {tab === 'guestbook' && (
        <>
          {loading ? (
            <p className="empty-msg">불러오는 중...</p>
          ) : entries.length === 0 ? (
            <p className="empty-msg">방명록이 없습니다.</p>
          ) : (
            <div className="admin-list">
              {entries.map((entry) => (
                <div key={entry.id} className="admin-card">
                  <div className="admin-card-info">
                    <p className="card-name">{entry.sender_name ?? '익명'}</p>
                    <p className="card-phone">{maskPhone(entry.phone)}</p>
                    {entry.message && <p className="card-message">{entry.message}</p>}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(entry.id)}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 웨딩 정보 설정 탭 */}
      {tab === 'settings' && info && (
        <div className="settings-form">
          <div className="settings-row">
            <label>신랑 이름</label>
            <input
              value={info.groom_name}
              onChange={(e) => setInfo({ ...info, groom_name: e.target.value })}
            />
          </div>
          <div className="settings-row">
            <label>신부 이름</label>
            <input
              value={info.bride_name}
              onChange={(e) => setInfo({ ...info, bride_name: e.target.value })}
            />
          </div>
          <div className="settings-row">
            <label>날짜</label>
            <input
              type="date"
              value={info.wedding_date}
              onChange={(e) => setInfo({ ...info, wedding_date: e.target.value })}
            />
          </div>
          <div className="settings-row">
            <label>시간</label>
            <input
              type="time"
              value={info.wedding_time}
              onChange={(e) => setInfo({ ...info, wedding_time: e.target.value })}
            />
          </div>
          <div className="settings-row">
            <label>장소 이름</label>
            <input
              value={info.venue_name}
              onChange={(e) => setInfo({ ...info, venue_name: e.target.value })}
            />
          </div>
          <div className="settings-row">
            <label>장소 주소</label>
            <input
              value={info.venue_address}
              onChange={(e) => setInfo({ ...info, venue_address: e.target.value })}
            />
          </div>
          <div className="settings-row">
            <label>지도 URL</label>
            <input
              value={info.map_url}
              onChange={(e) => setInfo({ ...info, map_url: e.target.value })}
            />
          </div>
          <div className="settings-bottom">
            {saveMsg && <span className="save-msg">{saveMsg}</span>}
            <button
              className="submit-btn"
              onClick={handleSaveInfo}
              disabled={saving}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}