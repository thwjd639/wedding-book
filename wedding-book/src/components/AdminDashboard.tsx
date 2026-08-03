import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import SortablePhotoGrid, { type AdminPhoto } from './SortablePhotoGrid'

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
  const [photos, setPhotos] = useState<AdminPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })

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
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress({ done: 0, total: files.length })

    // 현재까지의 최대 order_index부터 이어서 순서를 매김
    let nextOrderIndex =
      photos.length > 0 ? Math.max(...photos.map((p) => p.order_index ?? 0)) + 1 : 0

    for (const file of Array.from(files)) {
      const fileName = `${Date.now()}_${file.name}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(`wedding/${fileName}`, file)

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(uploadData.path)

        await supabase.from('photos').insert({
          url: urlData.publicUrl,
          album_name: '웨딩',
          order_index: nextOrderIndex,
        })

        nextOrderIndex += 1
      }

      setUploadProgress((prev) => ({ done: prev.done + 1, total: prev.total }))
    }

    await fetchPhotos()
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

  // 드래그로 순서를 바꾸면 화면에 즉시 반영하고, 바뀐 순서를 order_index로 일괄 저장
  async function handlePhotoReorder(next: AdminPhoto[]) {
    setPhotos(next)
    await Promise.all(
      next.map((photo, index) =>
        supabase.from('photos').update({ order_index: index }).eq('id', photo.id)
      )
    )
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
      .order('order_index', { ascending: true, nullsFirst: false })
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
            {uploading ? `업로드 중... (${uploadProgress.done}/${uploadProgress.total})` : '📷 사진 추가 (여러 장 선택 가능)'}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              disabled={uploading}
              hidden
            />
          </label>

          <p className="drag-hint">사진을 꾹 눌러 드래그하면 순서를 바꿀 수 있어요.</p>
          <SortablePhotoGrid
            photos={photos}
            onReorder={handlePhotoReorder}
            onDelete={handlePhotoDelete}
          />
        </div>
      )}
    </div>
  )
}