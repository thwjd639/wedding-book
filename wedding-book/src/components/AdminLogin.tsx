import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  onLogin: (session: any) => void
}

export default function AdminLogin({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    } else {
      onLogin(data.session)
    }

    setLoading(false)
  }

  return (
    <div className="admin-login">
      <h1>💍 관리자 로그인</h1>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="form-error">{error}</p>}
      <button onClick={handleLogin} disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </div>
  )
}