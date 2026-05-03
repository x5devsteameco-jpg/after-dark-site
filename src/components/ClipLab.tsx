import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from 'react'
import type { MediaItem } from '../data/media'
import {
  generateClip,
  type ClipFormat,
  type ClipMotion,
  type ClipOverlay,
  type ClipQuality,
  type ClipScene,
  type ClipSceneKind,
  type ClipTitleStyle,
  type ClipTransition,
} from '../lib/clipGenerator'
import { MediaCard } from './MediaCard'

type Props = {
  options: MediaItem[]
}

type SceneDraft = {
  id: string
  kind: ClipSceneKind
  itemId?: string
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

type SavedPreset = {
  id: string
  name: string
  createdAt: string
  settings: {
    format: ClipFormat
    duration: number
    fps: 24 | 30
    quality: ClipQuality
    transition: ClipTransition
    transitionDuration: number
    motion: ClipMotion
    overlay: ClipOverlay
    titleStyle: ClipTitleStyle
    showSceneTitle: boolean
    showProgress: boolean
    showSafeFrame: boolean
    subtitle: string
    outroText: string
  }
}

type ExportHistoryEntry = {
  id: string
  createdAt: string
  title: string
  format: ClipFormat
  duration: number
  sceneCount: number
}

const SAVED_PRESETS_KEY = 'after-dark-saved-presets-v2'
const EXPORT_HISTORY_KEY = 'after-dark-export-history-v2'

const palette = [
  { name: 'Neon Pink', value: '#ff5aa4' },
  { name: 'Amber', value: '#ff8c3c' },
  { name: 'Green Room', value: '#76ff6e' },
  { name: 'Purple Haze', value: '#c77dff' },
]

const formatOptions: Array<{ value: ClipFormat; label: string }> = [
  { value: 'story', label: 'Story 9:16' },
  { value: 'square', label: 'Square 1:1' },
  { value: 'landscape', label: 'Landscape 16:9' },
]

const transitionOptions: Array<{ value: ClipTransition; label: string }> = [
  { value: 'crossfade', label: 'Crossfade' },
  { value: 'wipe-left', label: 'Wipe Left' },
  { value: 'wipe-up', label: 'Wipe Up' },
  { value: 'flash', label: 'Flash Pop' },
  { value: 'dip-black', label: 'Dip to Black' },
  { value: 'iris', label: 'Iris Reveal' },
  { value: 'none', label: 'Hard Cut' },
]

const motionOptions: Array<{ value: ClipMotion; label: string }> = [
  { value: 'gentle-zoom', label: 'Gentle Zoom' },
  { value: 'push-in', label: 'Push In' },
  { value: 'pan-left', label: 'Pan Left' },
  { value: 'pan-right', label: 'Pan Right' },
  { value: 'float-up', label: 'Float Up' },
  { value: 'static', label: 'Static' },
]

const overlayOptions: Array<{ value: ClipOverlay; label: string }> = [
  { value: 'after-dark', label: 'After Dark' },
  { value: 'glass', label: 'Glass' },
  { value: 'clean', label: 'Clean' },
  { value: 'none', label: 'None' },
]

const titleStyleOptions: Array<{ value: ClipTitleStyle; label: string }> = [
  { value: 'neon', label: 'Neon' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
]

const qualityOptions: Array<{ value: ClipQuality; label: string }> = [
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
]

const exportPresets = [
  {
    name: 'OF Teaser',
    format: 'story' as ClipFormat,
    duration: 12,
    fps: 30 as const,
    quality: 'high' as ClipQuality,
    transition: 'crossfade' as ClipTransition,
    transitionDuration: 0.45,
    motion: 'gentle-zoom' as ClipMotion,
    overlay: 'after-dark' as ClipOverlay,
    titleStyle: 'neon' as ClipTitleStyle,
    showProgress: true,
    showSceneTitle: true,
    subtitle: 'Premium content. Exclusive access. Zero regrets.',
    outroText: 'Unlock the next drop.',
  },
  {
    name: 'IG Reel',
    format: 'story' as ClipFormat,
    duration: 15,
    fps: 30 as const,
    quality: 'high' as ClipQuality,
    transition: 'wipe-left' as ClipTransition,
    transitionDuration: 0.35,
    motion: 'push-in' as ClipMotion,
    overlay: 'glass' as ClipOverlay,
    titleStyle: 'bold' as ClipTitleStyle,
    showProgress: false,
    showSceneTitle: true,
    subtitle: 'Built for the scroll. Styled for the save.',
    outroText: 'Tap in after dark.',
  },
  {
    name: 'Story Burst',
    format: 'story' as ClipFormat,
    duration: 8,
    fps: 30 as const,
    quality: 'high' as ClipQuality,
    transition: 'flash' as ClipTransition,
    transitionDuration: 0.2,
    motion: 'float-up' as ClipMotion,
    overlay: 'clean' as ClipOverlay,
    titleStyle: 'minimal' as ClipTitleStyle,
    showProgress: false,
    showSceneTitle: false,
    subtitle: 'Fast cuts. Loud mood.',
    outroText: 'Swipe up for more.',
  },
  {
    name: 'Product Spotlight',
    format: 'square' as ClipFormat,
    duration: 10,
    fps: 24 as const,
    quality: 'high' as ClipQuality,
    transition: 'dip-black' as ClipTransition,
    transitionDuration: 0.6,
    motion: 'static' as ClipMotion,
    overlay: 'glass' as ClipOverlay,
    titleStyle: 'bold' as ClipTitleStyle,
    showProgress: false,
    showSceneTitle: true,
    subtitle: 'Clean framing. Premium finish.',
    outroText: 'Feature the hero.',
  },
]

const studioPresets = [
  {
    name: 'After Dark',
    accent: '#ff5aa4',
    transition: 'crossfade' as ClipTransition,
    motion: 'gentle-zoom' as ClipMotion,
    overlay: 'after-dark' as ClipOverlay,
    titleStyle: 'neon' as ClipTitleStyle,
    subtitle: 'Premium content. Exclusive access. Zero regrets.',
  },
  {
    name: 'Amber Luxe',
    accent: '#ff8c3c',
    transition: 'dip-black' as ClipTransition,
    motion: 'push-in' as ClipMotion,
    overlay: 'glass' as ClipOverlay,
    titleStyle: 'bold' as ClipTitleStyle,
    subtitle: 'Smooth pours. Warm glow. Premium temptation.',
  },
  {
    name: 'Green Room',
    accent: '#76ff6e',
    transition: 'wipe-up' as ClipTransition,
    motion: 'float-up' as ClipMotion,
    overlay: 'clean' as ClipOverlay,
    titleStyle: 'minimal' as ClipTitleStyle,
    subtitle: 'Small jar. Big effect. Clean and loud.',
  },
]

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createDraft(item: MediaItem): SceneDraft {
  return {
    id: createId(item.id),
    kind: 'media',
    itemId: item.id,
    label: item.title,
    body: item.subtitle,
    weight: 2,
    accent: item.accent,
    trimStart: 0,
    trimEnd: 1,
  }
}

function createCardDraft(kind: 'text' | 'cta', accent: string): SceneDraft {
  return {
    id: createId(kind),
    kind,
    label: kind === 'cta' ? 'Unlock the Drop' : 'Tonight’s Feature',
    body:
      kind === 'cta'
        ? 'Subscriber-only access. Premium content. Zero regrets.'
        : 'Insert a clean text beat between product scenes to pace the reel.',
    ctaLabel: kind === 'cta' ? 'UNLOCK ACCESS' : '',
    weight: 2,
    accent,
    trimStart: 0,
    trimEnd: 1,
  }
}

function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

async function createVideoPoster(src: string): Promise<string | undefined> {
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'metadata'
  video.src = src

  return new Promise((resolve) => {
    const cleanup = () => {
      video.onloadeddata = null
      video.onerror = null
    }

    video.onloadeddata = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, video.videoWidth || 720)
      canvas.height = Math.max(1, video.videoHeight || 1280)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        cleanup()
        resolve(undefined)
        return
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      cleanup()
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }

    video.onerror = () => {
      cleanup()
      resolve(undefined)
    }

    video.load()
  })
}

export function ClipLab({ options }: Props) {
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([])
  const [sceneQueue, setSceneQueue] = useState<SceneDraft[]>(() =>
    options.slice(0, 4).map(createDraft),
  )
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null)
  const [title, setTitle] = useState('Tonight’s Features')
  const [subtitle, setSubtitle] = useState('Cherry Limeade. The Rolled Fashioned. Slurricane.')
  const [outroText, setOutroText] = useState('Premium content. Exclusive access. Zero regrets.')
  const [duration, setDuration] = useState(12)
  const [fps, setFps] = useState<24 | 30>(30)
  const [format, setFormat] = useState<ClipFormat>('story')
  const [quality, setQuality] = useState<ClipQuality>('high')
  const [transition, setTransition] = useState<ClipTransition>('crossfade')
  const [transitionDuration, setTransitionDuration] = useState(0.45)
  const [motion, setMotion] = useState<ClipMotion>('gentle-zoom')
  const [overlay, setOverlay] = useState<ClipOverlay>('after-dark')
  const [titleStyle, setTitleStyle] = useState<ClipTitleStyle>('neon')
  const [showSceneTitle, setShowSceneTitle] = useState(true)
  const [showProgress, setShowProgress] = useState(true)
  const [showSafeFrame, setShowSafeFrame] = useState(false)
  const [customPresetName, setCustomPresetName] = useState('')
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>(() =>
    readStoredJson<SavedPreset[]>(SAVED_PRESETS_KEY, []),
  )
  const [exportHistory, setExportHistory] = useState<ExportHistoryEntry[]>(() =>
    readStoredJson<ExportHistoryEntry[]>(EXPORT_HISTORY_KEY, []),
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const allOptions = useMemo(() => [...uploadedMedia, ...options], [options, uploadedMedia])
  const mediaMap = useMemo(
    () => new Map(allOptions.map((item) => [item.id, item])),
    [allOptions],
  )

  const selectedIds = useMemo(
    () =>
      sceneQueue
        .filter((scene) => scene.kind === 'media' && scene.itemId)
        .map((scene) => scene.itemId as string),
    [sceneQueue],
  )

  const queueScenes = useMemo<ClipScene[]>(
    () => {
      const scenes: ClipScene[] = []

      for (const draft of sceneQueue) {
        if (draft.kind === 'media') {
          const item = draft.itemId ? mediaMap.get(draft.itemId) : null
          if (!item) continue
          scenes.push({
            id: draft.id,
            kind: draft.kind,
            item,
            label: draft.label,
            body: draft.body,
            ctaLabel: draft.ctaLabel,
            weight: draft.weight,
            accent: draft.accent,
            motion: draft.motion,
            transition: draft.transition,
            trimStart: draft.trimStart,
            trimEnd: draft.trimEnd,
          })
          continue
        }

        scenes.push({
          id: draft.id,
          kind: draft.kind,
          label: draft.label,
          body: draft.body,
          ctaLabel: draft.ctaLabel,
          weight: draft.weight,
          accent: draft.accent,
          motion: draft.motion,
          transition: draft.transition,
        })
      }

      return scenes
    },
    [mediaMap, sceneQueue],
  )

  const resolvedSelectedSceneId =
    selectedSceneId && sceneQueue.some((scene) => scene.id === selectedSceneId)
      ? selectedSceneId
      : sceneQueue[0]?.id ?? null

  const selectedScene = useMemo(
    () => sceneQueue.find((scene) => scene.id === resolvedSelectedSceneId) ?? null,
    [resolvedSelectedSceneId, sceneQueue],
  )

  const selectedMedia =
    selectedScene?.kind === 'media' && selectedScene.itemId
      ? mediaMap.get(selectedScene.itemId)
      : undefined

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SAVED_PRESETS_KEY, JSON.stringify(savedPresets))
  }, [savedPresets])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(exportHistory))
  }, [exportHistory])

  useEffect(() => {
    return () => {
      uploadedMedia.forEach((item) => {
        if (item.id.startsWith('upload-')) {
          URL.revokeObjectURL(item.src)
        }
      })
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl, uploadedMedia])

  const updateScene = (id: string, patch: Partial<SceneDraft>) => {
    setSceneQueue((current) =>
      current.map((scene) => (scene.id === id ? { ...scene, ...patch } : scene)),
    )
  }

  const removeScene = (id: string) => {
    setSceneQueue((current) => current.filter((scene) => scene.id !== id))
  }

  const duplicateScene = (id: string) => {
    setSceneQueue((current) => {
      const index = current.findIndex((scene) => scene.id === id)
      if (index < 0) return current
      const clone = {
        ...current[index],
        id: createId(current[index].kind),
      }
      const next = [...current]
      next.splice(index + 1, 0, clone)
      return next.slice(0, 16)
    })
  }

  const reorderScene = (sourceId: string, targetId: string) => {
    setSceneQueue((current) => {
      const sourceIndex = current.findIndex((scene) => scene.id === sourceId)
      const targetIndex = current.findIndex((scene) => scene.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return current
      const next = [...current]
      const [source] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, source)
      return next
    })
  }

  const toggle = (item: MediaItem) => {
    setSceneQueue((current) => {
      const exists = current.some((scene) => scene.kind === 'media' && scene.itemId === item.id)
      if (exists) {
        return current.filter((scene) => !(scene.kind === 'media' && scene.itemId === item.id))
      }
      if (current.length >= 16) return [...current.slice(1), createDraft(item)]
      return [...current, createDraft(item)]
    })
  }

  const addCardScene = (kind: 'text' | 'cta') => {
    const draft = createCardDraft(kind, palette[kind === 'cta' ? 0 : 1].value)
    setSceneQueue((current) => [...current, draft].slice(0, 16))
    setSelectedSceneId(draft.id)
  }

  const applyExportPreset = (preset: SavedPreset['settings'] | (typeof exportPresets)[number]) => {
    setFormat(preset.format)
    setDuration(preset.duration)
    setFps(preset.fps)
    setQuality(preset.quality)
    setTransition(preset.transition)
    setTransitionDuration(preset.transitionDuration)
    setMotion(preset.motion)
    setOverlay(preset.overlay)
    setTitleStyle(preset.titleStyle)
    setShowProgress(preset.showProgress)
    setShowSceneTitle(preset.showSceneTitle)
    setSubtitle(preset.subtitle)
    setOutroText(preset.outroText)
  }

  const applyStudioPreset = (presetName: string) => {
    const preset = studioPresets.find((item) => item.name === presetName)
    if (!preset) return
    setTransition(preset.transition)
    setMotion(preset.motion)
    setOverlay(preset.overlay)
    setTitleStyle(preset.titleStyle)
    setSubtitle(preset.subtitle)
  }

  const saveCurrentPreset = () => {
    const name = customPresetName.trim()
    if (!name) {
      setError('Give your preset a name before saving it.')
      return
    }

    const nextPreset: SavedPreset = {
      id: createId('preset'),
      name,
      createdAt: new Date().toISOString(),
      settings: {
        format,
        duration,
        fps,
        quality,
        transition,
        transitionDuration,
        motion,
        overlay,
        titleStyle,
        showSceneTitle,
        showProgress,
        showSafeFrame,
        subtitle,
        outroText,
      },
    }

    setSavedPresets((current) => [nextPreset, ...current].slice(0, 8))
    setCustomPresetName('')
    setError(null)
  }

  const deleteSavedPreset = (id: string) => {
    setSavedPresets((current) => current.filter((preset) => preset.id !== id))
  }

  const handleGenerate = async () => {
    if (queueScenes.length === 0) {
      setError('Choose at least one scene for the clip.')
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const blob = await generateClip({
        title,
        subtitle,
        duration,
        fps,
        format,
        quality,
        accent: queueScenes[0]?.accent ?? palette[0].value,
        transition,
        transitionDuration,
        motion,
        overlay,
        titleStyle,
        showSceneTitle,
        showProgress,
        showSafeFrame,
        outroText,
        scenes: queueScenes,
      })

      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(blob))
      setExportHistory((current) => [
        {
          id: createId('export'),
          createdAt: new Date().toISOString(),
          title,
          format,
          duration,
          sceneCount: queueScenes.length,
        },
        ...current,
      ].slice(0, 8))
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Clip generation failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    const incoming = await Promise.all(
      files
        .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
        .slice(0, 16)
        .map(async (file, index) => {
          const src = URL.createObjectURL(file)
          const isVideo = file.type.startsWith('video/')
          const poster = isVideo ? await createVideoPoster(src) : undefined
          const item: MediaItem = {
            id: createId(`upload-${index}`),
            title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
            subtitle: isVideo ? 'Uploaded video clip' : 'Uploaded image',
            src,
            poster,
            kind: isVideo ? 'video' : 'photo',
            accent: palette[index % palette.length].value,
          }
          return item
        }),
    )

    const drafts = incoming.map(createDraft)
    setUploadedMedia((current) => [...incoming, ...current].slice(0, 24))
    setSceneQueue((current) => [...drafts, ...current].slice(0, 16))
    setSelectedSceneId(drafts[0]?.id ?? null)
    event.target.value = ''
  }

  const sceneCountLabel = `${sceneQueue.length} scenes`

  return (
    <section className="clip-lab-shell">
      <div className="clip-lab-intro">
        <span className="pill">Clip Lab</span>
        <h3>Generate premium teaser clips with real control</h3>
        <p>
          Drag timeline strips, stitch stills with uploaded videos, inject text beats and CTA cards,
          then save presets and export a branded teaser directly in-browser.
        </p>
      </div>

      <div className="clip-lab-grid">
        <aside className="clip-controls">
          <div className="control-cluster">
            <h4>Campaign Copy</h4>
            <label>
              <span>Headline</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={40} />
            </label>
            <label>
              <span>Subhead</span>
              <input
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                maxLength={90}
              />
            </label>
            <label>
              <span>Outro line</span>
              <input
                value={outroText}
                onChange={(event) => setOutroText(event.target.value)}
                maxLength={96}
              />
            </label>
          </div>

          <div className="control-cluster">
            <h4>Export Modes</h4>
            <div className="preset-row export-preset-row">
              {exportPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="preset-chip export-preset-chip"
                  onClick={() => applyExportPreset(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <div className="inline-controls triple">
              <label>
                <span>Format</span>
                <select value={format} onChange={(event) => setFormat(event.target.value as ClipFormat)}>
                  {formatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Duration</span>
                <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
                  {[8, 10, 12, 15, 20, 30].map((value) => (
                    <option key={value} value={value}>
                      {value} sec
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Quality</span>
                <select value={quality} onChange={(event) => setQuality(event.target.value as ClipQuality)}>
                  {qualityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="inline-controls triple">
              <label>
                <span>FPS</span>
                <select value={fps} onChange={(event) => setFps(Number(event.target.value) as 24 | 30)}>
                  <option value={24}>24 fps</option>
                  <option value={30}>30 fps</option>
                </select>
              </label>
              <label>
                <span>Transition</span>
                <select
                  value={transition}
                  onChange={(event) => setTransition(event.target.value as ClipTransition)}
                >
                  {transitionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Transition Pace</span>
                <select
                  value={transitionDuration}
                  onChange={(event) => setTransitionDuration(Number(event.target.value))}
                >
                  {[0.2, 0.35, 0.45, 0.6, 0.8].map((value) => (
                    <option key={value} value={value}>
                      {value.toFixed(2)} sec
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="control-cluster">
            <h4>Style Engine</h4>
            <div className="preset-row">
              {studioPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="preset-chip"
                  onClick={() => applyStudioPreset(preset.name)}
                  style={{ '--preset-accent': preset.accent } as CSSProperties}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <div className="inline-controls triple">
              <label>
                <span>Motion</span>
                <select value={motion} onChange={(event) => setMotion(event.target.value as ClipMotion)}>
                  {motionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Overlay</span>
                <select value={overlay} onChange={(event) => setOverlay(event.target.value as ClipOverlay)}>
                  {overlayOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Title Style</span>
                <select
                  value={titleStyle}
                  onChange={(event) => setTitleStyle(event.target.value as ClipTitleStyle)}
                >
                  {titleStyleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="toggle-grid">
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={showSceneTitle}
                  onChange={(event) => setShowSceneTitle(event.target.checked)}
                />
                <span>Scene label</span>
              </label>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={showProgress}
                  onChange={(event) => setShowProgress(event.target.checked)}
                />
                <span>Progress bar</span>
              </label>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={showSafeFrame}
                  onChange={(event) => setShowSafeFrame(event.target.checked)}
                />
                <span>Safe frame</span>
              </label>
            </div>
          </div>

          <div className="control-cluster">
            <h4>Save This Build</h4>
            <div className="save-preset-row">
              <input
                value={customPresetName}
                onChange={(event) => setCustomPresetName(event.target.value)}
                placeholder="Name this preset"
              />
              <button type="button" className="preset-chip save-preset-button" onClick={saveCurrentPreset}>
                Save preset
              </button>
            </div>
            {savedPresets.length > 0 ? (
              <div className="saved-preset-list">
                {savedPresets.map((preset) => (
                  <article key={preset.id} className="saved-preset-card">
                    <button type="button" className="saved-preset-main" onClick={() => applyExportPreset(preset.settings)}>
                      <strong>{preset.name}</strong>
                      <span>{preset.settings.format} • {preset.settings.duration}s</span>
                    </button>
                    <button
                      type="button"
                      className="saved-preset-delete"
                      aria-label={`Delete ${preset.name}`}
                      onClick={() => deleteSavedPreset(preset.id)}
                    >
                      ×
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <p className="helper-copy">Save your favorite builds here for one-click reuse.</p>
            )}
          </div>

          <div className="instruction-box">
            <strong>Enhancement Loop</strong>
            <ol>
              <li>Build the timeline from media, text cards, and CTA scenes.</li>
              <li>Drag strips to reorder and use scene-level overrides where needed.</li>
              <li>Trim uploaded clips to the best moment before stitching.</li>
              <li>Generate, review, save a preset, then export again if needed.</li>
            </ol>
          </div>

          <label>
            <span>Bring your own assets</span>
            <input type="file" accept="image/*,video/*" multiple onChange={handleUpload} />
          </label>

          <button className="generate-button" disabled={isGenerating} onClick={handleGenerate}>
            {isGenerating ? 'Generating clip…' : 'Generate clip'}
          </button>

          {error ? <p className="error-message">{error}</p> : null}

          {previewUrl ? (
            <div className="clip-preview">
              <video src={previewUrl} controls playsInline loop />
              <a href={previewUrl} download="after-dark-custom-clip.webm">
                Download clip
              </a>
            </div>
          ) : null}

          <div className="control-cluster">
            <h4>Export History</h4>
            {exportHistory.length > 0 ? (
              <div className="history-list">
                {exportHistory.map((entry) => (
                  <article key={entry.id} className="history-card">
                    <strong>{entry.title}</strong>
                    <span>{entry.format} • {entry.duration}s • {entry.sceneCount} scenes</span>
                    <small>{new Date(entry.createdAt).toLocaleString()}</small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="helper-copy">Your recent exports will show up here after generation.</p>
            )}
          </div>
        </aside>

        <div className="clip-workbench">
          <div className="scene-queue timeline-queue">
            <div className="scene-queue-header">
              <div>
                <h4>Timeline Builder</h4>
                <span>{sceneCountLabel}</span>
              </div>
              <div className="timeline-toolbar">
                <button type="button" className="preset-chip" onClick={() => addCardScene('text')}>
                  Add Text Card
                </button>
                <button type="button" className="preset-chip" onClick={() => addCardScene('cta')}>
                  Add CTA Card
                </button>
              </div>
            </div>

            {sceneQueue.length === 0 ? (
              <div className="scene-empty">Select assets below to start building your sequence.</div>
            ) : (
              <div className="timeline-strip-list">
                {sceneQueue.map((scene, index) => {
                  const media =
                    scene.kind === 'media' && scene.itemId ? mediaMap.get(scene.itemId) : undefined
                  const isSelected = selectedScene?.id === scene.id
                  const thumb = media?.poster ?? media?.src

                  return (
                    <article
                      key={scene.id}
                      className={`timeline-strip ${isSelected ? 'selected' : ''}`}
                      style={
                        {
                          '--accent': scene.accent,
                          '--strip-span': Math.max(1, scene.weight),
                          flexBasis: `${160 + scene.weight * 38}px`,
                        } as CSSProperties
                      }
                      draggable
                      onDragStart={() => setDraggedSceneId(scene.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (draggedSceneId) reorderScene(draggedSceneId, scene.id)
                        setDraggedSceneId(null)
                      }}
                      onDragEnd={() => setDraggedSceneId(null)}
                      onClick={() => setSelectedSceneId(scene.id)}
                    >
                      <div className="timeline-thumb">
                        {thumb ? <img src={thumb} alt={scene.label} /> : <div className="timeline-card-art">{scene.kind.toUpperCase()}</div>}
                        <span>{index + 1}</span>
                      </div>
                      <div className="timeline-copy">
                        <strong>{scene.label}</strong>
                        <small>{scene.kind === 'media' ? media?.kind ?? 'media' : `${scene.kind} card`}</small>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          {selectedScene ? (
            <div className="timeline-editor">
              <div className="scene-queue-header">
                <div>
                  <h4>Scene Inspector</h4>
                  <span>{selectedScene.kind === 'media' ? 'Media scene' : `${selectedScene.kind} card`}</span>
                </div>
                <div className="timeline-toolbar">
                  <button type="button" className="preset-chip" onClick={() => duplicateScene(selectedScene.id)}>
                    Duplicate
                  </button>
                  <button type="button" className="preset-chip destructive-chip" onClick={() => removeScene(selectedScene.id)}>
                    Remove
                  </button>
                </div>
              </div>

              <div className="timeline-editor-grid">
                <div className="timeline-editor-preview">
                  {selectedScene.kind === 'media' && selectedMedia ? (
                    selectedMedia.kind === 'video' ? (
                      <video src={selectedMedia.src} poster={selectedMedia.poster} muted playsInline controls preload="metadata" />
                    ) : (
                      <img src={selectedMedia.poster ?? selectedMedia.src} alt={selectedScene.label} />
                    )
                  ) : (
                    <div className={`generated-card-preview ${selectedScene.kind}`}>
                      <span>{selectedScene.kind === 'cta' ? 'CTA' : 'TEXT'}</span>
                      <strong>{selectedScene.label}</strong>
                      <p>{selectedScene.body}</p>
                      {selectedScene.kind === 'cta' ? <em>{selectedScene.ctaLabel || 'UNLOCK ACCESS'}</em> : null}
                    </div>
                  )}
                </div>

                <div className="timeline-editor-fields">
                  <label>
                    <span>Scene Title</span>
                    <input
                      value={selectedScene.label}
                      onChange={(event) => updateScene(selectedScene.id, { label: event.target.value })}
                      maxLength={40}
                    />
                  </label>

                  {selectedScene.kind !== 'media' ? (
                    <label>
                      <span>Body Copy</span>
                      <textarea
                        value={selectedScene.body ?? ''}
                        onChange={(event) => updateScene(selectedScene.id, { body: event.target.value })}
                        rows={4}
                      />
                    </label>
                  ) : null}

                  {selectedScene.kind === 'cta' ? (
                    <label>
                      <span>CTA Label</span>
                      <input
                        value={selectedScene.ctaLabel ?? ''}
                        onChange={(event) => updateScene(selectedScene.id, { ctaLabel: event.target.value })}
                        maxLength={24}
                      />
                    </label>
                  ) : null}

                  <div className="scene-row-meta">
                    <label>
                      <span>Emphasis</span>
                      <select
                        value={selectedScene.weight}
                        onChange={(event) =>
                          updateScene(selectedScene.id, { weight: Number(event.target.value) })
                        }
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Accent</span>
                      <select
                        value={selectedScene.accent}
                        onChange={(event) => updateScene(selectedScene.id, { accent: event.target.value })}
                      >
                        {palette.map((swatch) => (
                          <option key={swatch.value} value={swatch.value}>
                            {swatch.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Motion</span>
                      <select
                        value={selectedScene.motion ?? 'inherit'}
                        onChange={(event) =>
                          updateScene(selectedScene.id, {
                            motion:
                              event.target.value === 'inherit'
                                ? undefined
                                : (event.target.value as ClipMotion),
                          })
                        }
                      >
                        <option value="inherit">Match global</option>
                        {motionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Next Transition</span>
                      <select
                        value={selectedScene.transition ?? 'inherit'}
                        onChange={(event) =>
                          updateScene(selectedScene.id, {
                            transition:
                              event.target.value === 'inherit'
                                ? undefined
                                : (event.target.value as ClipTransition),
                          })
                        }
                      >
                        <option value="inherit">Match global</option>
                        {transitionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {selectedScene.kind === 'media' && selectedMedia?.kind === 'video' ? (
                    <div className="scene-trim-panel">
                      <div className="trim-control">
                        <div className="trim-labels">
                          <span>Trim In</span>
                          <strong>{Math.round((selectedScene.trimStart ?? 0) * 100)}%</strong>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={95}
                          step={1}
                          value={Math.round((selectedScene.trimStart ?? 0) * 100)}
                          onChange={(event) => {
                            const nextStart = Number(event.target.value) / 100
                            const safeEnd = Math.max(nextStart + 0.05, selectedScene.trimEnd ?? 1)
                            updateScene(selectedScene.id, { trimStart: nextStart, trimEnd: safeEnd })
                          }}
                        />
                      </div>
                      <div className="trim-control">
                        <div className="trim-labels">
                          <span>Trim Out</span>
                          <strong>{Math.round((selectedScene.trimEnd ?? 1) * 100)}%</strong>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={100}
                          step={1}
                          value={Math.round((selectedScene.trimEnd ?? 1) * 100)}
                          onChange={(event) => {
                            const nextEnd = Number(event.target.value) / 100
                            const safeStart = Math.min(selectedScene.trimStart ?? 0, nextEnd - 0.05)
                            updateScene(selectedScene.id, { trimStart: safeStart, trimEnd: nextEnd })
                          }}
                        />
                      </div>
                      <p>Trim handles decide which slice of this source clip gets stitched into the export.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="clip-options">
            {allOptions.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                selectable
                selected={selectedIds.includes(item.id)}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
