import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { composePhotoWithFrame, savePhotoToDevice } from '../lib/photoFrame'
import { weddingInfo } from '../data/weddingInfo'
import CameraCapture from './CameraCapture'

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
            {entry.image_url && (
              <img className="gb-tile-photo" src={entry.image_url} alt="하객 사진" loading="lazy" />
            )}
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
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>()
  const messageValue = watch('message') ?? ''

  // 방명록 첨부 사진 (촬영 → 프레임 합성 → 미리보기)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  function setPhoto(blob: Blob) {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoBlob(blob)
    setPhotoPreview(URL.createObjectURL(blob))
  }

  function handleAddPhotoClick() {
    // 브라우저가 실시간 카메라 미리보기를 지원하면 자체 카메라 화면을 띄우고,
    // 아니면 기존 방식(기기 기본 카메라 앱 호출)으로 폴백
    if (navigator.mediaDevices) {
      setCameraOpen(true)
    } else {
      photoInputRef.current?.click()
    }
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setComposing(true)
    try {
      const blob = await composePhotoWithFrame(file, weddingInfo.guestbookFrameUrl)
      setPhoto(blob)
    } catch {
      alert('사진 처리에 실패했어요. 다시 시도해주세요.')
    } finally {
      setComposing(false)
      e.target.value = ''
    }
  }

  function removePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoBlob(null)
    setPhotoPreview(null)
  }

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

    let imageUrl: string | null = null
    if (photoBlob) {
      const fileName = `guestbook/${Date.now()}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, photoBlob, { contentType: 'image/jpeg' })

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(uploadData.path)
        imageUrl = urlData.publicUrl
      }
    }

    const { error } = await supabase.from('guestbook').insert({
      sender_name: data.sender_name || null,
      phone: data.phone,
      message: data.message || null,
      image_url: imageUrl,
    })

    if (!error) {
      reset()
      removePhoto()
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
          placeholder="따뜻한 한마디 남겨주세요 💌 (최대 150자)"
          rows={3}
          maxLength={150}
          {...register('message', {
            maxLength: { value: 150, message: '150자 이내로 입력해주세요' },
          })}
        />
        <div className="char-count">{messageValue.length}/150</div>
        {errors.message && <span className="form-error">{errors.message.message}</span>}

        {/* 사진 첨부 (선택) */}
        {photoPreview ? (
          <div className="gb-photo-preview">
            <img src={photoPreview} alt="첨부한 사진 미리보기" />
            <div className="gb-photo-actions">
              <button type="button" onClick={handleAddPhotoClick}>
                다시 찍기
              </button>
              <button type="button" onClick={() => photoBlob && savePhotoToDevice(photoBlob)}>
                💾 저장
              </button>
              <button type="button" onClick={removePhoto}>
                사진 빼기
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="gb-photo-btn"
            onClick={handleAddPhotoClick}
            disabled={composing}
          >
            {composing ? '사진 처리 중...' : '📸 사진 추가 (선택)'}
          </button>
        )}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelect}
          hidden
        />

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? '전송 중...' : '축하 메시지 남기기 💌'}
        </button>
        {submitted && <p className="form-success">축하 메시지가 등록됐어요 🎉</p>}
      </form>

      {cameraOpen && (
        <CameraCapture
          frameUrl={weddingInfo.guestbookFrameUrl}
          onConfirm={(blob) => {
            setPhoto(blob)
            setCameraOpen(false)
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}

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