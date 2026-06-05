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

interface Props {
  session: any
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: Props) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setEntries(data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제할까요?')) return
    const { error } = await supabase.from('guestbook').delete().eq('id', id)
    if (!error) setEntries((prev) => prev.filter((e) => e.id !== id))
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

      <h2>방명록 관리</h2>

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
    </div>
  )
}