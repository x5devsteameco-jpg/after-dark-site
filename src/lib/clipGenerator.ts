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
export type ClipMotion =
  | 'gentle-zoom'
  | 'push-in'
  | 'pan-left'
  | 'pan-right'
  | 'float-up'
  | 'static'
export type ClipOverlay = 'after-dark' | 'glass' | 'clean' | 'none'
export type ClipTitleStyle = 'neon' | 'minimal' | 'bold'
export type ClipQuality = 'standard' | 'high'
export type ClipSceneKind = 'media' | 'text' | 'cta'

export type ClipScene = {
  id: string
  kind: ClipSceneKind
  item?: MediaItem
  label: string
  body?: string
  ctaLabel?: string
  weight: number
  accent: string
  motion?: ClipMotion
  transition?: ClipTransition
  trimStart?: number
  trimEnd?: number
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

type LoadedScene = {
  scene: ClipScene
  kind: 'image' | 'video' | 'canvas'
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  sourceDuration: number
  lastSeekTime?: number
}

type SceneSpan = {
  start: number
  end: number
  duration: number
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
    image.onerror = () => reject(new Error(`Image could not be loaded: ${src}`))
    image.src = src
  })
}

function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'

    const cleanup = () => {
      video.onloadedmetadata = null
      video.oncanplay = null
      video.onerror = null
    }

    video.onloadedmetadata = () => {
      video.currentTime = 0
    }

    video.oncanplay = () => {
      cleanup()
      resolve(video)
    }

    video.onerror = () => {
      cleanup()
      reject(new Error(`Video could not be loaded: ${src}`))
    }

    video.src = src
    video.load()
  })
}

function isVideoItem(item: MediaItem) {
  return item.kind === 'video' || item.src.toLowerCase().endsWith('.mp4')
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
  source: CanvasImageSource,
  dims: Dimensions,
  motion: ClipMotion,
  localProgress: number,
  alpha = 1,
) {
  const input =
    source instanceof HTMLImageElement ||
    source instanceof HTMLVideoElement ||
    source instanceof HTMLCanvasElement
      ? source
      : null
  const srcW =
    input instanceof HTMLVideoElement
      ? input.videoWidth
      : input instanceof HTMLCanvasElement
        ? input.width
        : input?.width ?? dims.width
  const srcH =
    input instanceof HTMLVideoElement
      ? input.videoHeight
      : input instanceof HTMLCanvasElement
        ? input.height
        : input?.height ?? dims.height
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
  ctx.drawImage(source, x, y, drawW, drawH)
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

function getSceneTransition(scene: ClipScene, fallback: ClipTransition) {
  return scene.transition ?? fallback
}

function getSceneTrim(scene: ClipScene) {
  const start = clamp(scene.trimStart ?? 0, 0, 0.96)
  const end = clamp(scene.trimEnd ?? 1, start + 0.04, 1)
  return { start, end }
}

function getSceneSourceProgress(scene: ClipScene, localProgress: number) {
  const trim = getSceneTrim(scene)
  return trim.start + (trim.end - trim.start) * clamp(localProgress)
}

async function seekVideo(source: HTMLVideoElement, time: number) {
  if (!Number.isFinite(source.duration) || source.duration <= 0) return

  const maxTime = Math.max(0, source.duration - 0.04)
  const target = clamp(time, 0, maxTime)

  if (Math.abs(source.currentTime - target) < 1 / 60) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      source.onseeked = null
      source.onerror = null
    }

    source.onseeked = () => {
      cleanup()
      resolve()
    }

    source.onerror = () => {
      cleanup()
      reject(new Error('Video seeking failed.'))
    }

    source.currentTime = target
  })
}

async function prepareSourceFrame(loaded: LoadedScene, sourceProgress: number) {
  if (loaded.kind !== 'video') return

  const absoluteTime = loaded.sourceDuration * clamp(sourceProgress)
  if (loaded.lastSeekTime !== undefined && Math.abs(loaded.lastSeekTime - absoluteTime) < 1 / 60) {
    return
  }

  await seekVideo(loaded.source as HTMLVideoElement, absoluteTime)
  loaded.lastSeekTime = absoluteTime
}

function drawGraphicCardToCanvas(
  scene: ClipScene,
  dims: Dimensions,
  accent: string,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = dims.width
  canvas.height = dims.height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return canvas
  }

  const base = ctx.createLinearGradient(0, 0, dims.width, dims.height)
  base.addColorStop(0, '#0b0604')
  base.addColorStop(0.45, '#1a100a')
  base.addColorStop(1, '#060403')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, dims.width, dims.height)

  ctx.fillStyle = `${accent}18`
  ctx.fillRect(dims.width * 0.08, dims.height * 0.08, dims.width * 0.84, dims.height * 0.84)

  ctx.strokeStyle = `${accent}88`
  ctx.lineWidth = 4
  ctx.strokeRect(dims.width * 0.08, dims.height * 0.08, dims.width * 0.84, dims.height * 0.84)

  ctx.fillStyle = '#f3a14b'
  ctx.font = `700 ${Math.round(dims.width * 0.03)}px Arial`
  ctx.fillText('AFTER DARK INSERT', dims.width * 0.12, dims.height * 0.18)

  ctx.fillStyle = accent
  ctx.font = `700 ${Math.round(dims.width * 0.082)}px Georgia`
  wrapText(ctx, scene.label, dims.width * 0.12, dims.height * 0.32, dims.width * 0.72, dims.height * 0.085)

  ctx.fillStyle = '#f0e1ca'
  ctx.font = `${Math.round(dims.width * 0.032)}px Arial`
  wrapText(
    ctx,
    scene.body ?? 'Exclusive content built right inside the timeline.',
    dims.width * 0.12,
    dims.height * 0.58,
    dims.width * 0.74,
    dims.height * 0.045,
  )

  if (scene.kind === 'cta') {
    const buttonX = dims.width * 0.12
    const buttonY = dims.height * 0.76
    const buttonW = dims.width * 0.42
    const buttonH = dims.height * 0.08
    ctx.fillStyle = 'rgba(0,0,0,0.42)'
    ctx.fillRect(buttonX, buttonY, buttonW, buttonH)
    ctx.strokeStyle = accent
    ctx.lineWidth = 3
    ctx.strokeRect(buttonX, buttonY, buttonW, buttonH)
    ctx.fillStyle = accent
    ctx.font = `700 ${Math.round(dims.width * 0.03)}px Arial`
    ctx.fillText(scene.ctaLabel ?? 'UNLOCK ACCESS', buttonX + dims.width * 0.04, buttonY + buttonH * 0.62)
  }

  return canvas
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/)
  let line = ''
  let cursorY = y

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word
    if (ctx.measureText(nextLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY)
      line = word
      cursorY += lineHeight
    } else {
      line = nextLine
    }
  }

  if (line) {
    ctx.fillText(line, x, cursorY)
  }
}

async function loadSceneSource(scene: ClipScene, dims: Dimensions): Promise<LoadedScene> {
  if (scene.kind === 'text' || scene.kind === 'cta') {
    const source = drawGraphicCardToCanvas(scene, dims, scene.accent)
    return {
      scene,
      kind: 'canvas',
      source,
      sourceDuration: 1,
    }
  }

  if (!scene.item) {
    throw new Error('Media scene is missing its source asset.')
  }

  if (isVideoItem(scene.item)) {
    const source = await loadVideo(scene.item.src)
    return {
      scene,
      kind: 'video',
      source,
      sourceDuration: Number.isFinite(source.duration) && source.duration > 0 ? source.duration : 1,
      lastSeekTime: -1,
    }
  }

  const source = await loadImage(scene.item.poster ?? scene.item.src)
  return {
    scene,
    kind: 'image',
    source,
    sourceDuration: 1,
  }
}

function drawTransitionFrame(
  ctx: CanvasRenderingContext2D,
  current: LoadedScene,
  next: LoadedScene,
  dims: Dimensions,
  transition: ClipTransition,
  globalMotion: ClipMotion,
  currentLocalProgress: number,
  nextLocalProgress: number,
  transitionProgress: number,
) {
  const t = clamp(transitionProgress)
  const currentMotion = current.scene.motion ?? globalMotion
  const nextMotion = next.scene.motion ?? globalMotion

  if (transition === 'none') {
    drawCoverImage(ctx, current.source, dims, currentMotion, currentLocalProgress)
    return
  }

  if (transition === 'crossfade') {
    drawCoverImage(ctx, current.source, dims, currentMotion, currentLocalProgress, 1 - t)
    drawCoverImage(ctx, next.source, dims, nextMotion, nextLocalProgress, t)
    return
  }

  if (transition === 'wipe-left') {
    drawCoverImage(ctx, current.source, dims, currentMotion, currentLocalProgress)
    ctx.save()
    ctx.beginPath()
    ctx.rect(dims.width * (1 - t), 0, dims.width * t, dims.height)
    ctx.clip()
    drawCoverImage(ctx, next.source, dims, nextMotion, nextLocalProgress)
    ctx.restore()
    return
  }

  if (transition === 'wipe-up') {
    drawCoverImage(ctx, current.source, dims, currentMotion, currentLocalProgress)
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, dims.height * (1 - t), dims.width, dims.height * t)
    ctx.clip()
    drawCoverImage(ctx, next.source, dims, nextMotion, nextLocalProgress)
    ctx.restore()
    return
  }

  if (transition === 'flash') {
    drawCoverImage(ctx, current.source, dims, currentMotion, currentLocalProgress, 1 - t)
    drawCoverImage(ctx, next.source, dims, nextMotion, nextLocalProgress, t)
    ctx.save()
    ctx.globalAlpha = Math.sin(t * Math.PI)
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillRect(0, 0, dims.width, dims.height)
    ctx.restore()
    return
  }

  if (transition === 'dip-black') {
    const fadeOut = clamp(1 - t * 2)
    const fadeIn = clamp((t - 0.5) * 2)
    drawCoverImage(ctx, current.source, dims, currentMotion, currentLocalProgress, fadeOut)
    drawCoverImage(ctx, next.source, dims, nextMotion, nextLocalProgress, fadeIn)
    ctx.save()
    ctx.globalAlpha = t < 0.5 ? t * 1.6 : (1 - t) * 1.6
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, dims.width, dims.height)
    ctx.restore()
    return
  }

  if (transition === 'iris') {
    drawCoverImage(ctx, current.source, dims, currentMotion, currentLocalProgress)
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
    drawCoverImage(ctx, next.source, dims, nextMotion, nextLocalProgress)
    ctx.restore()
  }
}

export async function generateClip(settings: ClipSettings): Promise<Blob> {
  if (settings.scenes.length === 0) {
    throw new Error('Choose at least one scene for the clip.')
  }

  const dims = getDimensions(settings.format)
  const canvas = document.createElement('canvas')
  canvas.width = dims.width
  canvas.height = dims.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context could not be created.')

  const scenes = await Promise.all(settings.scenes.map((scene) => loadSceneSource(scene, dims)))
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
  const frameDurationMs = 1000 / settings.fps
  const totalFrames = Math.max(1, Math.ceil(settings.duration * settings.fps))
  const started = performance.now()

  try {
    for (let frameIndex = 0; frameIndex <= totalFrames; frameIndex += 1) {
      const elapsed = Math.min(settings.duration, frameIndex / settings.fps)
      const progress = clamp(elapsed / settings.duration)
      const sceneIndex = spans.findIndex(
        (span, index) =>
          elapsed >= span.start && (elapsed < span.end || index === spans.length - 1),
      )
      const activeIndex = sceneIndex === -1 ? spans.length - 1 : sceneIndex
      const currentSpan = spans[activeIndex]
      const current = scenes[activeIndex]
      const next = scenes[activeIndex + 1]

      if (!currentSpan || !current) {
        throw new Error('Clip scene data is incomplete.')
      }

      const localProgress =
        currentSpan.duration === 0
          ? 0
          : clamp((elapsed - currentSpan.start) / currentSpan.duration)
      const currentSourceProgress = getSceneSourceProgress(current.scene, localProgress)

      const activeTransition = next ? getSceneTransition(current.scene, settings.transition) : 'none'
      const transitionWindow = Math.min(settings.transitionDuration, currentSpan.duration * 0.45)
      const timeUntilEnd = currentSpan.end - elapsed
      const inTransition =
        Boolean(next) &&
        activeTransition !== 'none' &&
        transitionWindow > 0 &&
        timeUntilEnd <= transitionWindow
      const transitionProgress = inTransition ? 1 - timeUntilEnd / transitionWindow : 0

      await prepareSourceFrame(current, currentSourceProgress)

      let nextLocalProgress = 0
      if (next && inTransition) {
        nextLocalProgress = clamp(transitionProgress * 0.8)
        const nextSourceProgress = getSceneSourceProgress(next.scene, nextLocalProgress)
        await prepareSourceFrame(next, nextSourceProgress)
      }

      ctx.clearRect(0, 0, dims.width, dims.height)

      if (next && inTransition) {
        drawTransitionFrame(
          ctx,
          current,
          next,
          dims,
          activeTransition,
          settings.motion,
          localProgress,
          nextLocalProgress,
          transitionProgress,
        )
      } else {
        drawCoverImage(
          ctx,
          current.source,
          dims,
          current.scene.motion ?? settings.motion,
          localProgress,
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

      const targetTime = started + (frameIndex + 1) * frameDurationMs
      const delay = targetTime - performance.now()
      if (delay > 0) {
        await wait(delay)
      }
    }

    await wait(180)
  } finally {
    if (recorder.state !== 'inactive') recorder.stop()
  }

  return result
}
