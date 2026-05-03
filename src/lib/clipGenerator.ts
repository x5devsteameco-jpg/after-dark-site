import type { MediaItem } from '../data/media'

export type ClipFormat = 'story' | 'square' | 'landscape'
export type ClipTransition =
  | 'crossfade'
  | 'wipe-left'
  | 'wipe-up'
  | 'flash'
  | 'dip-black'
  | 'iris'
  | 'none'
export type ClipMotion = 'gentle-zoom' | 'push-in' | 'pan-left' | 'pan-right' | 'float-up' | 'static'
export type ClipOverlay = 'after-dark' | 'glass' | 'clean' | 'none'
export type ClipTitleStyle = 'neon' | 'minimal' | 'bold'
export type ClipQuality = 'standard' | 'high'

export type ClipScene = {
  id: string
  item: MediaItem
  label: string
  weight: number
  accent: string
  motion?: ClipMotion
}

export type ClipSettings = {
  title: string
  subtitle: string
  duration: number
  fps: 24 | 30
  format: ClipFormat
  quality: ClipQuality
  accent: string
  transition: ClipTransition
  transitionDuration: number
  motion: ClipMotion
  overlay: ClipOverlay
  titleStyle: ClipTitleStyle
  showSceneTitle: boolean
  showProgress: boolean
  showSafeFrame: boolean
  outroText: string
  scenes: ClipScene[]
}

type Dimensions = {
  width: number
  height: number
}

const FORMAT_DIMENSIONS: Record<ClipFormat, Dimensions> = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  landscape: { width: 1920, height: 1080 },
}

const QUALITY_BITRATE: Record<ClipQuality, number> = {
  standard: 5_500_000,
  high: 9_000_000,
}

type LoadedScene = {
  scene: ClipScene
  image: HTMLImageElement
}

type SceneSpan = {
  start: number
  end: number
  duration: number
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

function easeInOut(value: number) {
  return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2
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

function getDimensions(format: ClipFormat) {
  return FORMAT_DIMENSIONS[format]
}

function computeSceneSpans(scenes: ClipScene[], totalDuration: number): SceneSpan[] {
  const totalWeight = scenes.reduce((sum, scene) => sum + Math.max(1, scene.weight), 0)
  let cursor = 0

  return scenes.map((scene) => {
    const duration = (Math.max(1, scene.weight) / totalWeight) * totalDuration
    const span = {
      start: cursor,
      end: cursor + duration,
      duration,
    }
    cursor += duration
    return span
  })
}

function getMotionTransform(
  motion: ClipMotion,
  progress: number,
): { zoom: number; offsetX: number; offsetY: number } {
  const eased = easeInOut(progress)

  switch (motion) {
    case 'static':
      return { zoom: 1.01, offsetX: 0, offsetY: 0 }
    case 'push-in':
      return { zoom: 1.05 + 0.18 * eased, offsetX: 0, offsetY: 0 }
    case 'pan-left':
      return { zoom: 1.12, offsetX: -0.12 + 0.24 * eased, offsetY: 0 }
    case 'pan-right':
      return { zoom: 1.12, offsetX: 0.12 - 0.24 * eased, offsetY: 0 }
    case 'float-up':
      return { zoom: 1.09, offsetX: 0, offsetY: 0.1 - 0.2 * eased }
    case 'gentle-zoom':
    default:
      return { zoom: 1.04 + 0.08 * eased, offsetX: 0, offsetY: 0 }
  }
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  dims: Dimensions,
  motion: ClipMotion,
  localProgress: number,
  alpha = 1,
) {
  const source =
    image instanceof HTMLImageElement || image instanceof HTMLVideoElement ? image : null
  const srcW = source?.width ?? dims.width
  const srcH = source?.height ?? dims.height
  const srcRatio = srcW / srcH
  const destRatio = dims.width / dims.height
  const transform = getMotionTransform(motion, localProgress)

  let drawW: number
  let drawH: number

  if (srcRatio > destRatio) {
    drawH = dims.height * transform.zoom
    drawW = drawH * srcRatio
  } else {
    drawW = dims.width * transform.zoom
    drawH = drawW / srcRatio
  }

  const x = (dims.width - drawW) / 2 + transform.offsetX * dims.width
  const y = (dims.height - drawH) / 2 + transform.offsetY * dims.height

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.drawImage(image, x, y, drawW, drawH)
  ctx.restore()
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  dims: Dimensions,
  overlay: ClipOverlay,
  accent: string,
) {
  if (overlay === 'none') return

  if (overlay === 'after-dark') {
    const gradient = ctx.createLinearGradient(0, 0, 0, dims.height)
    gradient.addColorStop(0, 'rgba(0,0,0,0.14)')
    gradient.addColorStop(0.58, 'rgba(0,0,0,0.16)')
    gradient.addColorStop(1, 'rgba(0,0,0,0.64)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, dims.width, dims.height)

    ctx.fillStyle = accent + '18'
    ctx.beginPath()
    ctx.arc(dims.width * 0.82, dims.height * 0.2, dims.width * 0.1, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  if (overlay === 'glass') {
    ctx.fillStyle = 'rgba(12,12,18,0.2)'
    ctx.fillRect(0, 0, dims.width, dims.height)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(48, 48, dims.width - 96, dims.height - 96)
    return
  }

  if (overlay === 'clean') {
    const gradient = ctx.createLinearGradient(0, dims.height, dims.width, 0)
    gradient.addColorStop(0, 'rgba(0,0,0,0.38)')
    gradient.addColorStop(1, 'rgba(0,0,0,0.08)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, dims.width, dims.height)
  }
}

function drawSafeFrame(ctx: CanvasRenderingContext2D, dims: Dimensions) {
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  ctx.setLineDash([10, 10])
  ctx.strokeRect(dims.width * 0.06, dims.height * 0.06, dims.width * 0.88, dims.height * 0.88)
  ctx.restore()
}

function drawProgress(
  ctx: CanvasRenderingContext2D,
  dims: Dimensions,
  progress: number,
  accent: string,
) {
  const barWidth = dims.width * 0.74
  const x = dims.width * 0.08
  const y = dims.height * 0.91

  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.fillRect(x, y, barWidth, 8)
  ctx.fillStyle = accent
  ctx.fillRect(x, y, barWidth * clamp(progress), 8)
}

function drawTitleBlock(
  ctx: CanvasRenderingContext2D,
  dims: Dimensions,
  settings: ClipSettings,
  sceneLabel: string,
  accent: string,
) {
  const paddingX = dims.width * 0.08
  const storyY = dims.height * (settings.format === 'landscape' ? 0.76 : 0.74)

  if (settings.titleStyle === 'minimal') {
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.font = `${Math.round(dims.width * 0.027)}px Arial`
    ctx.fillText(settings.title.toUpperCase(), paddingX, storyY)
    ctx.font = `${Math.round(dims.width * 0.021)}px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.76)'
    ctx.fillText(settings.subtitle, paddingX, storyY + dims.height * 0.038)
  } else if (settings.titleStyle === 'bold') {
    ctx.fillStyle = accent
    ctx.font = `700 ${Math.round(dims.width * 0.075)}px Georgia`
    ctx.fillText(settings.title, paddingX, storyY)
    ctx.fillStyle = '#f4ead7'
    ctx.font = `700 ${Math.round(dims.width * 0.032)}px Arial`
    ctx.fillText(settings.subtitle.toUpperCase(), paddingX, storyY + dims.height * 0.048)
  } else {
    ctx.fillStyle = accent
    ctx.shadowColor = accent
    ctx.shadowBlur = 18
    ctx.font = `700 ${Math.round(dims.width * 0.076)}px Georgia`
    ctx.fillText(settings.title, paddingX, storyY)
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffcf8e'
    ctx.font = `${Math.round(dims.width * 0.05)}px cursive`
    ctx.fillText(settings.subtitle, paddingX, storyY + dims.height * 0.05)
  }

  if (settings.showSceneTitle) {
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.font = `700 ${Math.round(dims.width * 0.024)}px Arial`
    ctx.fillText(sceneLabel.toUpperCase(), paddingX, dims.height * 0.875)
  }

  if (settings.outroText.trim()) {
    ctx.fillStyle = 'rgba(255,255,255,0.62)'
    ctx.font = `${Math.round(dims.width * 0.022)}px Arial`
    ctx.fillText(settings.outroText, paddingX, dims.height * 0.95)
  }
}

function drawTransitionFrame(
  ctx: CanvasRenderingContext2D,
  current: LoadedScene,
  next: LoadedScene,
  dims: Dimensions,
  settings: ClipSettings,
  localProgress: number,
  transitionProgress: number,
) {
  const t = clamp(transitionProgress)

  if (settings.transition === 'none') {
    drawCoverImage(
      ctx,
      current.image,
      dims,
      current.scene.motion ?? settings.motion,
      localProgress,
    )
    return
  }

  if (settings.transition === 'crossfade') {
    drawCoverImage(
      ctx,
      current.image,
      dims,
      current.scene.motion ?? settings.motion,
      localProgress,
      1 - t,
    )
    drawCoverImage(ctx, next.image, dims, next.scene.motion ?? settings.motion, 0, t)
    return
  }

  if (settings.transition === 'wipe-left') {
    drawCoverImage(
      ctx,
      current.image,
      dims,
      current.scene.motion ?? settings.motion,
      localProgress,
    )
    ctx.save()
    ctx.beginPath()
    ctx.rect(dims.width * (1 - t), 0, dims.width * t, dims.height)
    ctx.clip()
    drawCoverImage(ctx, next.image, dims, next.scene.motion ?? settings.motion, 0)
    ctx.restore()
    return
  }

  if (settings.transition === 'wipe-up') {
    drawCoverImage(
      ctx,
      current.image,
      dims,
      current.scene.motion ?? settings.motion,
      localProgress,
    )
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, dims.height * (1 - t), dims.width, dims.height * t)
    ctx.clip()
    drawCoverImage(ctx, next.image, dims, next.scene.motion ?? settings.motion, 0)
    ctx.restore()
    return
  }

  if (settings.transition === 'flash') {
    drawCoverImage(
      ctx,
      current.image,
      dims,
      current.scene.motion ?? settings.motion,
      localProgress,
      1 - t,
    )
    drawCoverImage(ctx, next.image, dims, next.scene.motion ?? settings.motion, 0, t)
    ctx.save()
    ctx.globalAlpha = Math.sin(t * Math.PI)
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillRect(0, 0, dims.width, dims.height)
    ctx.restore()
    return
  }

  if (settings.transition === 'dip-black') {
    const fadeOut = clamp(1 - t * 2)
    const fadeIn = clamp((t - 0.5) * 2)
    drawCoverImage(
      ctx,
      current.image,
      dims,
      current.scene.motion ?? settings.motion,
      localProgress,
      fadeOut,
    )
    drawCoverImage(ctx, next.image, dims, next.scene.motion ?? settings.motion, 0, fadeIn)
    ctx.save()
    ctx.globalAlpha = t < 0.5 ? t * 1.6 : (1 - t) * 1.6
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, dims.width, dims.height)
    ctx.restore()
    return
  }

  if (settings.transition === 'iris') {
    drawCoverImage(
      ctx,
      current.image,
      dims,
      current.scene.motion ?? settings.motion,
      localProgress,
    )
    ctx.save()
    ctx.beginPath()
    ctx.arc(
      dims.width / 2,
      dims.height / 2,
      Math.max(dims.width, dims.height) * 0.85 * t,
      0,
      Math.PI * 2,
    )
    ctx.clip()
    drawCoverImage(ctx, next.image, dims, next.scene.motion ?? settings.motion, 0)
    ctx.restore()
  }
}

export async function generateClip(settings: ClipSettings): Promise<Blob> {
  if (settings.scenes.length === 0) {
    throw new Error('Choose at least one media asset for the clip.')
  }

  const dims = getDimensions(settings.format)
  const canvas = document.createElement('canvas')
  canvas.width = dims.width
  canvas.height = dims.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context could not be created.')

  const scenes = await Promise.all(
    settings.scenes.map(async (scene) => ({
      scene,
      image: await loadImage(scene.item.poster ?? scene.item.src),
    })),
  )

  const spans = computeSceneSpans(settings.scenes, settings.duration)
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm'
  const stream = canvas.captureStream(settings.fps)
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: QUALITY_BITRATE[settings.quality],
  })
  const chunks: BlobPart[] = []

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data)
  }

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
          const progress = clamp(elapsed / settings.duration)
          const sceneIndex = spans.findIndex((span) => elapsed >= span.start && elapsed <= span.end)
          const activeIndex = sceneIndex === -1 ? spans.length - 1 : sceneIndex
          const currentSpan = spans[activeIndex]
          const current = scenes[activeIndex]
          const next = scenes[activeIndex + 1]

          if (!currentSpan || !current) {
            throw new Error('Clip scene data is incomplete.')
          }

          const localElapsed = clamp((elapsed - currentSpan.start) / currentSpan.duration)
          const transitionWindow = Math.min(settings.transitionDuration, currentSpan.duration * 0.45)
          const timeUntilEnd = currentSpan.end - elapsed
          const inTransition = Boolean(next) && settings.transition !== 'none' && timeUntilEnd <= transitionWindow
          const transitionProgress = inTransition ? 1 - timeUntilEnd / transitionWindow : 0

          ctx.clearRect(0, 0, dims.width, dims.height)

          if (inTransition && next) {
            drawTransitionFrame(
              ctx,
              current,
              next,
              dims,
              settings,
              localElapsed,
              transitionProgress,
            )
          } else {
            drawCoverImage(
              ctx,
              current.image,
              dims,
              current.scene.motion ?? settings.motion,
              localElapsed,
            )
          }

          const activeAccent = current.scene.accent || settings.accent
          drawOverlay(ctx, dims, settings.overlay, activeAccent)
          drawTitleBlock(ctx, dims, settings, current.scene.label, activeAccent)

          if (settings.showProgress) {
            drawProgress(ctx, dims, progress, activeAccent)
          }

          if (settings.showSafeFrame) {
            drawSafeFrame(ctx, dims)
          }

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
