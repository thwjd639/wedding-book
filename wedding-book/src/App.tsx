import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'
import HeroSection from './components/HeroSection'
import GallerySection from './components/GallerySection'
import GuestbookSection from './components/GuestbookSection'

function App() {
  const [screenshotProtect, setScreenshotProtect] = useState(false)

  useEffect(() => {
    supabase
      .from('settings')
      .select('screenshot_protect')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) setScreenshotProtect(data.screenshot_protect)
      })
  }, [])

  useEffect(() => {
    if (screenshotProtect) {
      // 우클릭 방지
      const handleContextMenu = (e: MouseEvent) => e.preventDefault()
      // 드래그 방지
      const handleDragStart = (e: DragEvent) => e.preventDefault()
      // 키보드 캡처 방지 (PrintScreen 등)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'PrintScreen') e.preventDefault()
        if (e.ctrlKey && e.key === 'p') e.preventDefault()
      }
      // 이미지 우클릭/드래그 방지
      const handleImgContextMenu = (e: MouseEvent) => {
        if ((e.target as HTMLElement).tagName === 'IMG') e.preventDefault()
      }

      document.addEventListener('contextmenu', handleContextMenu)
      document.addEventListener('contextmenu', handleImgContextMenu)
      document.addEventListener('dragstart', handleDragStart)
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none' // 모바일 Safari

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu)
        document.removeEventListener('contextmenu', handleImgContextMenu)
        document.removeEventListener('dragstart', handleDragStart)
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.userSelect = ''
        document.body.style.webkitUserSelect = ''
      }
    }
  }, [screenshotProtect])

  return (
    <main className={screenshotProtect ? 'protect-on' : ''}>
      <HeroSection />
      <GallerySection />
      <GuestbookSection />
    </main>
  )
}

export default App