import { useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminLogin from '../components/AdminLogin'
import AdminDashboard from '../components/AdminDashboard'

export default function AdminPage() {
  const [session, setSession] = useState<any>(null)

  if (!session) {
    return <AdminLogin onLogin={setSession} />
  }

  return <AdminDashboard session={session} onLogout={() => setSession(null)} />
}