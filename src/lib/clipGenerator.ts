import type { MediaItem } from '../data/media'

export type ClipSettings = {
  title: string
  subtitle: string
  duration: 6 | 10 | 15
  accent: string
  scenes: MediaItem[]
}

const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1920
const FPS = 30

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  zoom: number,
) {
  const source =
    image instanceof HTMLImageElement || image instanceof HTMLVideoElement ? image : null
  const srcW = source?.width ?? CANVAS_WIDTH
  const srcH = source?.height ?? CANVAS_HEIGHT
  const srcRatio = srcW / srcH
  const destRatio = CANVAS_WIDTH / CANVAS_HEIGHT

  let drawW: number
  let drawH: number

  if (srcRatio > destRatio) {
    drawH = CANVAS_HEIGHT * zoom
    drawW = drawH * srcRatio
  } else {
    drawW = CANVAS_WIDTH * zoom
    drawH = drawW / srcRatio
  }

  const x = (CANVAS_WIDTH - drawW) / 2
  const y = (CANVAS_HEIGHT - drawH) / 2
  ctx.drawImage(image, x, y, drawW, drawH)
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  settings: ClipSettings,
  sceneTitle: string,
) {
  ctx.fillStyle = 'rgba(0,0,0,0.34)'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.fillStyle = settings.accent
  ctx.beginPath()
  ctx.roundRect(72, 82, 220, 54, 18)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.font = '700 28px Arial'
  ctx.fillText('CLIP LAB', 104, 118)

  ctx.fillStyle = '#f7f0e6'
  ctx.font = '700 74px Arial'
  ctx.fillText(settings.title, 72, 1460)

  ctx.font = '500 38px Arial'
  ctx.fillText(settings.subtitle, 76, 1540)

  ctx.fillStyle = settings.accent
  ctx.font = '700 32px Arial'
  ctx.fillText(sceneTitle.toUpperCase(), 76, 1645)

  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 2
  ctx.strokeRect(72, 1710, 936, 8)
}

function drawProgress(ctx: CanvasRenderingContext2D, progress: number, accent: string) {
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fillRect(72, 1710, 936, 8)
  ctx.fillStyle = accent
  ctx.fillRect(72, 1710, 936 * progress, 8)
}

export async function generateClip(settings: ClipSettings): Promise<Blob> {
  if (settings.scenes.length === 0) {
    throw new Error('Choose at least one media asset for the clip.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context could not be created.')

  const images = await Promise.all(
    settings.scenes.map((scene) => loadImage(scene.poster ?? scene.src)),
  )
  if (images.length === 0) {
    throw new Error('Clip assets could not be loaded.')
  }

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm'
  const stream = canvas.captureStream(FPS)
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5_500_000,
  })
  const chunks: BlobPart[] = []

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data)
  }

  const sceneCount = Math.max(settings.scenes.length, 1)
  const sceneDuration = settings.duration / sceneCount

  const result = new Promise<Blob>((resolve, reject) => {
    recorder.onerror = () => reject(new Error('Video recording failed.'))
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
  })

  recorder.start()
  const started = performance.now()

  try {
    await new Promise<void>((resolve, reject) => {
      const render = (timestamp: number) => {
        try {
          const elapsed = Math.max(0, (timestamp - started) / 1000)
          const progress = Math.min(elapsed / settings.duration, 1)
          const rawSceneIndex = Math.floor(elapsed / sceneDuration)
          const sceneIndex = Math.min(sceneCount - 1, Math.max(0, rawSceneIndex))
          const sceneElapsed = elapsed - sceneIndex * sceneDuration
          const localT = Math.max(0, Math.min(sceneElapsed / sceneDuration, 1))
          const zoom = 1 + localT * 0.09
          const currentImage = images[sceneIndex] ?? images[0]
          const currentScene = settings.scenes[sceneIndex] ?? settings.scenes[0]

          if (!currentImage || !currentScene) {
            throw new Error('Clip scene data is incomplete.')
          }

          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
          drawCoverImage(ctx, currentImage, zoom)

          const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
          gradient.addColorStop(0, 'rgba(0,0,0,0.22)')
          gradient.addColorStop(1, 'rgba(0,0,0,0.62)')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

          drawTextBlock(ctx, settings, currentScene.title)
          drawProgress(ctx, progress, settings.accent)

          if (elapsed < settings.duration) {
            requestAnimationFrame(render)
          } else {
            resolve()
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Clip rendering failed.'))
        }
      }

      requestAnimationFrame(render)
    })

    await wait(250)
  } finally {
    if (recorder.state !== 'inactive') recorder.stop()
  }

  return result
}
