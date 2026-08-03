import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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
  const [tab, setTab] = useState<'guestbook' | 'photos'>('guestbook')
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchEntries()
    fetchPhotos()
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

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
  
    setUploading(true)
    const fileName = `${Date.now()}_${file.name}`
  
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(`wedding/${fileName}`, file)
  
    if (!uploadError && uploadData) {
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(uploadData.path)
  
      const { error } = await supabase.from('photos').insert({
        url: urlData.publicUrl,
        album_name: '웨딩',
      })
  
      if (!error) fetchPhotos()
    }
  
    setUploading(false)
    e.target.value = ''
  }
  
  async function handlePhotoDelete(id: string, url: string) {
    if (!confirm('사진을 삭제할까요?')) return
  
    const path = url.split('/photos/')[1]
    await supabase.storage.from('photos').remove([path])
    await supabase.from('photos').delete().eq('id', id)
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleExportPDF() {
    const element = document.getElementById('guestbook-print')
    if (!element) return
  
    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
  
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
  
    let heightLeft = imgHeight
    let position = 0
  
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
  
    pdf.save('방명록.pdf')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    onLogout()
  }

  function maskPhone(phone: string) {
    return phone.replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, '$1-****-$3')
  }

  async function fetchPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setPhotos(data)
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
          className={tab === 'photos' ? 'tab active' : 'tab'}
          onClick={() => setTab('photos')}
        >
          사진 업로드
        </button>
      </div>

      {/* 방명록 탭 */}
      {tab === 'guestbook' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button className="pdf-btn" onClick={handleExportPDF}>
              📄 PDF 출력
            </button>
          </div>
          {loading ? (
            <p className="empty-msg">불러오는 중...</p>
          ) : entries.length === 0 ? (
            <p className="empty-msg">방명록이 없습니다.</p>
          ) : (
            <div className="admin-list" id="guestbook-print">
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

      {/* 사진 업로드 탭 */}        
      {tab === 'photos' && (
        <div className="photos-tab">
          <label className="upload-label">
            {uploading ? '업로드 중...' : '📷 사진 추가'}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
              hidden
            />
          </label>

          <div className="admin-photo-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="admin-photo-item">
                <img src={photo.url} alt="웨딩 사진" />
                <button
                  className="photo-delete-btn"
                  onClick={() => handlePhotoDelete(photo.id, photo.url)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}