// 업로드 전 브라우저에서 이미지를 리사이즈 + 압축합니다.
// 원본 파일이 크더라도 사진첩/관리자 화면에서 훨씬 빠르게 로드되도록 하기 위함입니다.
const MAX_DIMENSION = 1920 // 긴 변 기준 최대 픽셀
const JPEG_QUALITY = 0.8

export async function compressImage(file: File): Promise<File> {
  // 이미 충분히 작은 파일이거나 gif처럼 압축이 애매한 포맷은 그대로 둡니다.
  if (file.type === 'image/gif' || file.size < 300 * 1024) {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(bitmap, 0, 0, width, height)

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  )
  if (!blob) return file

  // 확장자를 .jpg로 맞춰서 새 File 객체 생성
  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], newName, { type: 'image/jpeg' })
}
