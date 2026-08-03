import { useEffect } from 'react'
import './App.css'
import HeroSection from './components/HeroSection'
import IntroSection from './components/IntroSection'
import GallerySection from './components/GallerySection'
import GuestbookSection from './components/GuestbookSection'
import { weddingInfo } from './data/weddingInfo'

function App() {
  const screenshotProtect = weddingInfo.screenshotProtect

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

  // 스크롤 페이드인
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.fade-section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  
  return (
    <main className={screenshotProtect ? 'protect-on' : ''}>
      <HeroSection />
      <div className="fade-section"><IntroSection /></div>
      <div className="fade-section"><GallerySection /></div>
      <div className="fade-section"><GuestbookSection /></div>
    </main>
  )
}

export default App