import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { createPortal } from 'react-dom'

interface Photo {
  id: string
  url: string
  album_name: string
}

export default function GallerySection() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const dragStartX = useRef(0)
  const isDragging = useRef(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const isMouseDown = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  useEffect(() => {
    fetchPhotos()
  }, [])

  async function fetchPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setPhotos(data)
    setLoading(false)
  }

  function onMouseDown(e: React.MouseEvent) {
    isMouseDown.current = true
    isDragging.current = false
    startX.current = e.pageX - (sliderRef.current?.offsetLeft ?? 0)
    scrollLeft.current = sliderRef.current?.scrollLeft ?? 0
  }
  
  function onMouseMove(e: React.MouseEvent) {
    if (!isMouseDown.current) return
    const x = e.pageX - (sliderRef.current?.offsetLeft ?? 0)
    const walk = x - startX.current
    if (Math.abs(walk) > 5) isDragging.current = true
    if (sliderRef.current) sliderRef.current.scrollLeft = scrollLeft.current - walk
  }
  
  function onMouseUp() {
    isMouseDown.current = false
  }

  function openPhoto(url: string) {
    setSelected(url)
    document.body.style.overflow = 'hidden'
  }

  function closePhoto() {
    setSelected(null)
    document.body.style.overflow = ''
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePhoto()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <>
      <section id="gallery">
        <h2>사진첩</h2>
        {loading ? (
          <p className="empty-msg">불러오는 중...</p>
        ) : photos.length === 0 ? (
          <p className="empty-msg">사진이 없습니다.</p>
        ) : (
          <div
            className="photo-slider"
            ref={sliderRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="photo-slide-item"
                onMouseDown={(e) => {
                  dragStartX.current = e.clientX
                  isDragging.current = false
                }}
                onMouseMove={(e) => {
                  if (Math.abs(e.clientX - dragStartX.current) > 5) {
                    isDragging.current = true
                  }
                }}
                onMouseUp={() => {
                  if (!isDragging.current) openPhoto(photo.url)
                }}
                onTouchStart={(e) => {
                  dragStartX.current = e.touches[0].clientX
                  isDragging.current = false
                }}
                onTouchMove={(e) => {
                  if (Math.abs(e.touches[0].clientX - dragStartX.current) > 5) {
                    isDragging.current = true
                  }
                }}
                onTouchEnd={() => {
                  if (!isDragging.current) openPhoto(photo.url)
                }}
              >
                <img src={photo.url} alt="웨딩 사진" draggable={false} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 라이트박스 */}
      {selected && createPortal(
        <div className="lightbox" onClick={closePhoto}>
          <img src={selected} alt="확대 사진" />
          <button className="lightbox-close" onClick={closePhoto}>✕</button>
        </div>,
        document.body
      )}
    </>
  )
}