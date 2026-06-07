import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminLogin from '../components/AdminLogin'
import AdminDashboard from '../components/AdminDashboard'

export default function AdminPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <p style={{ textAlign: 'center', marginTop: '80px' }}>불러오는 중...</p>

  if (!session) return <AdminLogin onLogin={setSession} />

  return <AdminDashboard session={session} onLogout={() => setSession(null)} />
}