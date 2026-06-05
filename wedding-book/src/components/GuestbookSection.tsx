import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'

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
  image: FileList
}

export default function GuestbookSection() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

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

  async function onSubmit(data: FormData) {
    setSubmitting(true)

    let image_url = null

    // 사진 업로드 (선택)
    if (data.image?.[0]) {
      const file = data.image[0]
      const fileName = `${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(`guestbook/${fileName}`, file)

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(uploadData.path)
        image_url = urlData.publicUrl
      }
    }

    const { error } = await supabase.from('guestbook').insert({
      sender_name: data.sender_name || null,
      phone: data.phone,
      message: data.message || null,
      image_url,
    })

    if (!error) {
      reset()
      fetchEntries()
    }

    setSubmitting(false)
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  function maskPhone(phone: string) {
    return phone.replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, '$1-****-$3')
  }

  return (
    <section id="guestbook">
      <h2>방명록</h2>

      {/* 작성 폼 */}
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
        <div className="form-bottom">
          <label className="photo-label">
            📷 사진 추가
            <input type="file" accept="image/*" {...register('image')} hidden />
          </label>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? '전송 중...' : '전송'}
          </button>
        </div>
      </form>

      {/* 피드 */}
      <div className="guestbook-feed">
        {loading ? (
          <p className="empty-msg">불러오는 중...</p>
        ) : entries.length === 0 ? (
          <p className="empty-msg">첫 번째 방명록을 남겨보세요! 💌</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="guestbook-card">
              <div className="card-header">
                <div className="avatar">
                  {entry.sender_name?.[0] ?? '?'}
                </div>
                <div>
                  <p className="card-name">{entry.sender_name ?? '익명'}</p>
                  <p className="card-phone">{maskPhone(entry.phone)}</p>
                </div>
                <span className="card-date">{formatDate(entry.created_at)}</span>
              </div>
              {entry.image_url && (
                <img className="card-img" src={entry.image_url} alt="첨부 사진" />
              )}
              {entry.message && (
                <p className="card-message">{entry.message}</p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}