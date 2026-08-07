// 하객이 찍은 사진을 정사각형 프레임(그레타 프레임)에 합성합니다.
// 프레임 이미지는 1080x1080 PNG, 사진과 겹쳐질 자리를 제외한 부분은 투명해야 합니다.
const CANVAS_SIZE = 1080

export async function composePhotoWithFrame(
  photoFile: File,
  frameUrl: string
): Promise<Blob> {
  const bitmap = await createImageBitmap(photoFile)
  return composeFromSource(bitmap, bitmap.width, bitmap.height, frameUrl)
}

// 카메라 미리보기(video 엘리먼트)에서 현재 프레임을 그대로 캡처해 합성
// mirror: 전면 카메라 프리뷰가 거울모드(좌우반전)로 보였다면 true로 넘겨서 결과물도 동일하게 반전
export async function composePhotoFromVideo(
  video: HTMLVideoElement,
  frameUrl: string,
  mirror: boolean
): Promise<Blob> {
  return composeFromSource(video, video.videoWidth, video.videoHeight, frameUrl, mirror)
}

async function composeFromSource(
  source: CanvasImageSource,
  srcWidth: number,
  srcHeight: number,
  frameUrl: string,
  mirror = false
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('캔버스를 초기화할 수 없어요')

  // 정사각형으로 가운데 크롭 (object-fit: cover와 동일한 방식)
  const cropSize = Math.min(srcWidth, srcHeight)
  const cropX = (srcWidth - cropSize) / 2
  const cropY = (srcHeight - cropSize) / 2

  if (mirror) {
    ctx.save()
    ctx.translate(CANVAS_SIZE, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(source, cropX, cropY, cropSize, cropSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
  if (mirror) ctx.restore()

  if (frameUrl) {
    const frameImg = await loadImage(frameUrl)
    ctx.drawImage(frameImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('이미지 생성 실패'))),
      'image/jpeg',
      0.88
    )
  })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// 합성된 사진을 하객 폰에 저장. 가능하면 공유시트(사진에 저장 포함)를 띄우고,
// 지원 안 되는 환경에서는 일반 다운로드로 폴백합니다.
export async function savePhotoToDevice(blob: Blob) {
  const fileName = `wedding-photo-${Date.now()}.jpg`
  const file = new File([blob], fileName, { type: 'image/jpeg' })

  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean
    share?: (data: { files: File[] }) => Promise<void>
  }

  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file] })
      return
    } catch {
      // 사용자가 공유를 취소한 경우 등 - 다운로드로 폴백하지 않고 조용히 종료
      return
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
