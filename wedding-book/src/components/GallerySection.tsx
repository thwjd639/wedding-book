import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Photo {
  id: string
  url: string
  album_name: string
}

export default function GallerySection() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <section id="gallery">
      <h2>사진첩</h2>
      {loading ? (
        <p className="empty-msg">불러오는 중...</p>
      ) : photos.length === 0 ? (
        <p className="empty-msg">사진이 없습니다.</p>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-item">
              <img src={photo.url} alt="웨딩 사진" />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}