import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'

// ────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────
interface GuestbookEntry {
  id: string
  created_at: string
  sender_name: string | null
  phone: string
  message: string | null
  image_url: string | null
}

interface FormData {
  sender_name: string
  phone: string
  message: string
}

// ────────────────────────────────────────────
// 슬라이드존 — 최신 5개 자동재생
// ────────────────────────────────────────────
function GuestbookSlide({ entries }: { entries: GuestbookEntry[] }) {
  const [cur, setCur] = useState(0)
  const [fade, setFade] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const slides = entries.slice(0, 5).filter((e) => e.message)

  function goTo(idx: number) {
    setFade(false)
    setTimeout(() => {
      setCur(idx)
      setFade(true)
    }, 300)
  }

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCur((prev) => {
        const next = (prev + 1) % Math.max(slides.length, 1)
        setFade(false)
        setTimeout(() => setFade(true), 300)
        return next
      })
    }, 4000)
  }

  useEffect(() => {
    if (slides.length === 0) return
    setCur(0)
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [entries])

  if (slides.length === 0) return null

  const entry = slides[cur]

  return (
    <div className="gb-slide-zone">
      <p className="gb-slide-label">🏮 하객들이 남겨준 마음</p>
      <div className={`gb-slide-card ${fade ? 'gb-fade-in' : 'gb-fade-out'}`}>
        <p className="gb-slide-message">"{entry.message}"</p>
        <p className="gb-slide-from">— {entry.sender_name ?? '익명'}</p>
      </div>
      <div className="gb-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`gb-dot ${i === cur ? 'gb-dot--active' : ''}`}
            onClick={() => { goTo(i); startTimer() }}
            aria-label={`${i + 1}번째 메시지 보기`}
          />
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────
// 보드존 — 전체 타일
// ────────────────────────────────────────────
const TILE_COLORS = ['gb-tile--pink', 'gb-tile--teal', 'gb-tile--purple', 'gb-tile--amber']

function GuestbookBoard({ entries }: { entries: GuestbookEntry[] }) {
  return (
    <div className="gb-board-zone">
      <div className="gb-board-header">
        <span className="gb-board-title">모두의 축하 메시지</span>
        <span className="gb-board-count">{entries.length}명</span>
      </div>
      <div className="gb-board-grid">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className={`gb-tile ${TILE_COLORS[i % TILE_COLORS.length]} ${i === 0 ? 'gb-tile--new' : ''}`}
          >
            <p className="gb-tile-message">
              {entry.message
                ? entry.message.slice(0, 30) + (entry.message.length > 30 ? '...' : '')
                : '💌'}
            </p>
            <p className="gb-tile-name">{entry.sender_name ?? '익명'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────
// 메인 섹션
// ────────────────────────────────────────────
export default function GuestbookSection() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  useEffect(() => {
    fetchEntries()

    const channel = supabase
      .channel('guestbook-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'guestbook' },
        () => fetchEntries()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchEntries() {
    const { data, error } = await supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setEntries(data)
    setLoading(false)
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true)

    const { error } = await supabase.from('guestbook').insert({
      sender_name: data.sender_name || null,
      phone: data.phone,
      message: data.message || null,
      image_url: null,
    })

    if (!error) {
      reset()
      setSubmitted(true)
      fetchEntries()
      setTimeout(() => setSubmitted(false), 3000)
    }

    setSubmitting(false)
  }

  return (
    <section id="guestbook">
      <h2>방명록</h2>

      {/* 1. 작성 폼 */}
      <form className="guestbook-form" onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder="보내는 이 (선택)"
          {...register('sender_name')}
        />
        <input
          placeholder="연락처 (필수) 예: 010-1234-5678"
          {...register('phone', { required: '연락처를 입력해주세요' })}
        />
        {errors.phone && <span className="form-error">{errors.phone.message}</span>}
        <textarea
          placeholder="따뜻한 한마디 남겨주세요 💌"
          rows={3}
          {...register('message')}
        />
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? '전송 중...' : '축하 메시지 남기기 💌'}
        </button>
        {submitted && <p className="form-success">축하 메시지가 등록됐어요 🎉</p>}
      </form>

      {/* 2. 슬라이드존 */}
      {!loading && <GuestbookSlide entries={entries} />}

      {/* 3. 보드존 */}
      {loading ? (
        <p className="empty-msg">불러오는 중...</p>
      ) : entries.length === 0 ? (
        <p className="empty-msg">첫 번째 방명록을 남겨보세요! 💌</p>
      ) : (
        <GuestbookBoard entries={entries} />
      )}
    </section>
  )
}