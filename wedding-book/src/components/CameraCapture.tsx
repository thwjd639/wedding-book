import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { composePhotoFromVideo } from '../lib/photoFrame'

interface Props {
  frameUrl: string
  onConfirm: (blob: Blob) => void
  onClose: () => void
}

export default function CameraCapture({ frameUrl, onConfirm, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      setReady(false)
      setError(null)
      stopStream()

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setReady(true)
      } catch {
        setError('카메라를 사용할 수 없어요. 브라우저 카메라 권한을 확인해주세요.')
      }
    }

    startCamera()
    return () => {
      cancelled = true
      stopStream()
    }
  }, [facingMode])

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  async function handleCapture() {
    if (!videoRef.current) return
    setCapturing(true)
    try {
      const blob = await composePhotoFromVideo(videoRef.current, frameUrl, facingMode === 'user')
      setPreviewBlob(blob)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch {
      setError('사진 촬영에 실패했어요. 다시 시도해주세요.')
    } finally {
      setCapturing(false)
    }
  }

  function handleRetake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewBlob(null)
    setPreviewUrl(null)
  }

  function handleConfirm() {
    if (!previewBlob) return
    onConfirm(previewBlob)
    stopStream()
  }

  function handleClose() {
    stopStream()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    onClose()
  }

  return createPortal(
    <div className="camera-modal">
      <div className="camera-modal-inner">
        <button className="camera-close" onClick={handleClose} aria-label="닫기">✕</button>

        {error ? (
          <div className="camera-error">
            <p>{error}</p>
            <button className="camera-error-btn" onClick={handleClose}>닫기</button>
          </div>
        ) : previewUrl ? (
          <>
            <div className="camera-frame-wrap">
              <img className="camera-preview-img" src={previewUrl} alt="촬영한 사진 미리보기" />
            </div>
            <div className="camera-actions">
              <button className="camera-btn camera-btn--ghost" onClick={handleRetake}>다시 찍기</button>
              <button className="camera-btn camera-btn--primary" onClick={handleConfirm}>이 사진 사용</button>
            </div>
          </>
        ) : (
          <>
            <div className="camera-frame-wrap">
              <video
                ref={videoRef}
                className={`camera-video ${facingMode === 'user' ? 'camera-video--mirror' : ''}`}
                muted
                playsInline
                autoPlay
              />
              {frameUrl && <img className="camera-frame-overlay" src={frameUrl} alt="" />}
              {!ready && <div className="camera-loading">카메라 준비 중...</div>}
            </div>
            <div className="camera-actions">
              <button
                className="camera-btn camera-btn--ghost"
                onClick={() => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))}
              >
                🔄 전환
              </button>
              <button
                className="camera-btn camera-btn--shutter"
                onClick={handleCapture}
                disabled={!ready || capturing}
                aria-label="촬영"
              />
              <button className="camera-btn camera-btn--ghost" onClick={handleClose}>취소</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
