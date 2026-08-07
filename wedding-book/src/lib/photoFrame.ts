// 하객이 찍은 사진을 정사각형 프레임(그레타 프레임)에 합성합니다.
// 프레임 이미지는 1080x1080 PNG, 가운데 (80,80)~(1000,1000) 영역이 투명해야 합니다.
const CANVAS_SIZE = 1080
const WINDOW = { x: 80, y: 80, size: 920 } // 사진이 들어갈 투명 창 영역

export async function composePhotoWithFrame(
  photoFile: File,
  frameUrl: string
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('캔버스를 초기화할 수 없어요')

  const photoBitmap = await createImageBitmap(photoFile)

  // 사진을 정사각형 창에 꽉 채우도록 크롭(object-fit: cover와 동일한 방식)
  const srcSize = Math.min(photoBitmap.width, photoBitmap.height)
  const srcX = (photoBitmap.width - srcSize) / 2
  const srcY = (photoBitmap.height - srcSize) / 2

  ctx.drawImage(
    photoBitmap,
    srcX,
    srcY,
    srcSize,
    srcSize,
    WINDOW.x,
    WINDOW.y,
    WINDOW.size,
    WINDOW.size
  )

  // 프레임이 등록돼 있으면 사진 위에 겹쳐 그림 (없으면 사진만 남음)
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
