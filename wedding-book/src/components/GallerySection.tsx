import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { createPortal } from 'react-dom'

interface Photo {
  id: string
  url: string
  album_name: string
  order_index: number | null
}

const PAGE_SIZE = 9

export default function GallerySection() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  async function fetchPhotos() {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('order_index', { ascending: true, nullsFirst: false })
    if (!error && data) setPhotos(data)
    setLoading(false)
  }

  function openPhoto(index: number) {
    setSelectedIndex(index)
    document.body.style.overflow = 'hidden'
  }

  function closePhoto() {
    setSelectedIndex(null)
    document.body.style.overflow = ''
  }

  function showPrev() {
    setSelectedIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length))
  }

  function showNext() {
    setSelectedIndex((i) => (i === null ? null : (i + 1) % photos.length))
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'Escape') closePhoto()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIndex, photos.length])

  const visiblePhotos = photos.slice(0, visibleCount)
  const hasMore = visibleCount < photos.length
  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null

  // 스와이프 제스처 (드래그 추종 + 일정 거리 넘으면 다음/이전 사진)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStartX = useRef(0)
  const SWIPE_THRESHOLD = 60

  function handlePointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX
    setDragging(true)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return
    setDragX(e.clientX - dragStartX.current)
  }

  function endDrag() {
    if (!dragging) return
    setDragging(false)
    if (dragX > SWIPE_THRESHOLD) {
      showPrev()
    } else if (dragX < -SWIPE_THRESHOLD) {
      showNext()
    }
    setDragX(0)
  }

  return (
    <>
      <section id="gallery">
        <h2>사진첩</h2>
        {loading ? (
          <p className="empty-msg">불러오는 중...</p>
        ) : photos.length === 0 ? (
          <p className="empty-msg">사진이 없습니다.</p>
        ) : (
          <>
            <div className="photo-grid">
              {visiblePhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  className="photo-grid-item"
                  onClick={() => openPhoto(index)}
                  aria-label="사진 확대 보기"
                >
                  <img src={photo.url} alt="웨딩 사진" loading="lazy" draggable={false} />
                </button>
              ))}
            </div>
            {hasMore && (
              <button
                className="load-more-btn"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                더보기 ({photos.length - visibleCount}장 남음)
              </button>
            )}
          </>
        )}
      </section>

      {/* 라이트박스 */}
      {selectedPhoto && createPortal(
        <div className="lightbox" onClick={closePhoto}>
          <div
            className="lightbox-inner"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            <img
              src={selectedPhoto.url}
              alt="확대 사진"
              style={{
                transform: `translateX(${dragX}px)`,
                transition: dragging ? 'none' : 'transform 0.25s ease',
                touchAction: 'pan-y',
              }}
              draggable={false}
            />
            <button className="lightbox-close" onClick={closePhoto}>✕</button>
            {photos.length > 1 && (
              <>
                <button
                  className="lightbox-nav lightbox-prev"
                  onClick={showPrev}
                  aria-label="이전 사진"
                >
                  ‹
                </button>
                <button
                  className="lightbox-nav lightbox-next"
                  onClick={showNext}
                  aria-label="다음 사진"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
