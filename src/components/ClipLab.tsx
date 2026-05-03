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
  type ClipTitleStyle,
  type ClipTransition,
} from '../lib/clipGenerator'
import { MediaCard } from './MediaCard'

type Props = {
  options: MediaItem[]
}

type SceneDraft = {
  id: string
  itemId: string
  label: string
  weight: number
  accent: string
  motion?: ClipMotion
  transition?: ClipTransition
  trimStart?: number
  trimEnd?: number
}

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

function createDraft(item: MediaItem): SceneDraft {
  return {
    id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    itemId: item.id,
    label: item.title,
    weight: 2,
    accent: item.accent,
    trimStart: 0,
    trimEnd: 1,
  }
}

export function ClipLab({ options }: Props) {
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([])
  const [sceneQueue, setSceneQueue] = useState<SceneDraft[]>(() =>
    options.slice(0, 4).map(createDraft),
  )
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const allOptions = useMemo(() => [...uploadedMedia, ...options], [options, uploadedMedia])
  const mediaMap = useMemo(
    () => new Map(allOptions.map((item) => [item.id, item])),
    [allOptions],
  )

  const selectedIds = useMemo(() => sceneQueue.map((scene) => scene.itemId), [sceneQueue])

  const queueScenes = useMemo<ClipScene[]>(
    () =>
      sceneQueue
        .map((draft) => {
          const item = mediaMap.get(draft.itemId)
          if (!item) return null
          const scene: ClipScene = {
            id: draft.id,
            item,
            label: draft.label,
            weight: draft.weight,
            accent: draft.accent,
          }
          if (draft.motion) {
            scene.motion = draft.motion
          }
          if (draft.transition) {
            scene.transition = draft.transition
          }
          if (draft.trimStart !== undefined) {
            scene.trimStart = draft.trimStart
          }
          if (draft.trimEnd !== undefined) {
            scene.trimEnd = draft.trimEnd
          }
          return scene
        })
        .filter((scene): scene is ClipScene => scene !== null),
    [mediaMap, sceneQueue],
  )

  const toggle = (item: MediaItem) => {
    setSceneQueue((current) => {
      const existingIndex = current.findIndex((scene) => scene.itemId === item.id)
      if (existingIndex >= 0) {
        return current.filter((scene) => scene.itemId !== item.id)
      }
      if (current.length >= 12) return [...current.slice(1), createDraft(item)]
      return [...current, createDraft(item)]
    })
  }

  const updateScene = (id: string, patch: Partial<SceneDraft>) => {
    setSceneQueue((current) =>
      current.map((scene) => (scene.id === id ? { ...scene, ...patch } : scene)),
    )
  }

  const moveScene = (id: string, direction: -1 | 1) => {
    setSceneQueue((current) => {
      const index = current.findIndex((scene) => scene.id === id)
      if (index < 0) return current
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.length) return current
      const next = [...current]
      const [scene] = next.splice(index, 1)
      next.splice(nextIndex, 0, scene)
      return next
    })
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
        id: `${current[index].itemId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      }
      const next = [...current]
      next.splice(index + 1, 0, clone)
      return next.slice(0, 12)
    })
  }

  const applyExportPreset = (presetName: string) => {
    const preset = exportPresets.find((item) => item.name === presetName)
    if (!preset) return
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

  const applyPreset = (presetName: string) => {
    const preset = studioPresets.find((item) => item.name === presetName)
    if (!preset) return
    setTransition(preset.transition)
    setMotion(preset.motion)
    setOverlay(preset.overlay)
    setTitleStyle(preset.titleStyle)
    setSubtitle(preset.subtitle)
  }

  const handleGenerate = async () => {
    if (queueScenes.length === 0) {
      setError('Choose at least one media asset for the clip.')
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
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Clip generation failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    const incoming: MediaItem[] = files
      .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
      .slice(0, 16)
      .map((file, index) => ({
        id: `upload-${file.name}-${index}-${Date.now()}`,
        title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        subtitle: file.type.startsWith('video/') ? 'Uploaded video clip' : 'Uploaded image',
        src: URL.createObjectURL(file),
        kind: file.type.startsWith('video/') ? 'video' : 'photo',
        poster: file.type.startsWith('video/') ? undefined : undefined,
        accent: palette[index % palette.length].value,
      }))

    setUploadedMedia((current) => [...incoming, ...current].slice(0, 16))
    setSceneQueue((current) => {
      const next = [...incoming.map(createDraft), ...current]
      return next.slice(0, 12)
    })
    event.target.value = ''
  }

  useEffect(() => {
    return () => {
      uploadedMedia.forEach((item) => {
        if (item.id.startsWith('upload-')) URL.revokeObjectURL(item.src)
      })
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl, uploadedMedia])

  return (
    <section className="clip-lab-shell">
      <div className="clip-lab-intro">
        <span className="pill">Clip Lab</span>
        <h3>Generate premium teaser clips with real control</h3>
        <p>
          Build a scene queue, reorder the flow, set emphasis, choose a transition language, tune
          motion and overlays, then export a branded teaser directly in-browser.
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
            <h4>Output Preset</h4>
            <div className="preset-row export-preset-row">
              {exportPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="preset-chip export-preset-chip"
                  onClick={() => applyExportPreset(preset.name)}
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
                  onClick={() => applyPreset(preset.name)}
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

          <div className="instruction-box">
            <strong>Enhancement Loop</strong>
            <ol>
              <li>Build a queue from the library or your own uploads.</li>
              <li>Trim clips, reorder scenes, and tune emphasis to control timing.</li>
              <li>Adjust scene-level transitions, motion, overlays, and title style.</li>
              <li>Generate, review, refine, and export again.</li>
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
        </aside>

        <div className="clip-workbench">
          <div className="scene-queue">
            <div className="scene-queue-header">
              <h4>Scene Queue</h4>
              <span>{queueScenes.length} scenes selected</span>
            </div>

            {sceneQueue.length === 0 ? (
              <div className="scene-empty">Select assets below to start building your sequence.</div>
            ) : (
              <div className="scene-list">
                {sceneQueue.map((scene, index) => {
                  const item = mediaMap.get(scene.itemId)
                  if (!item) return null

                  return (
                    <article key={scene.id} className="scene-row">
                      <div className="scene-row-media">
                        <img src={item.poster ?? item.src} alt={item.title} />
                        <span>{index + 1}</span>
                      </div>
                      <div className="scene-row-copy">
                        <input
                          value={scene.label}
                          onChange={(event) => updateScene(scene.id, { label: event.target.value })}
                          maxLength={32}
                        />
                        <div className="scene-row-kind">
                          <span>{item.kind === 'video' ? 'Video clip' : 'Still frame'}</span>
                        </div>
                        <div className="scene-row-meta">
                          <label>
                            <span>Emphasis</span>
                            <select
                              value={scene.weight}
                              onChange={(event) =>
                                updateScene(scene.id, { weight: Number(event.target.value) })
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
                              value={scene.accent}
                              onChange={(event) => updateScene(scene.id, { accent: event.target.value })}
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
                              value={scene.motion ?? 'inherit'}
                              onChange={(event) =>
                                updateScene(scene.id, {
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
                              value={scene.transition ?? 'inherit'}
                              onChange={(event) =>
                                updateScene(scene.id, {
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
                        {item.kind === 'video' ? (
                          <div className="scene-trim-panel">
                            <div className="trim-control">
                              <div className="trim-labels">
                                <span>Trim In</span>
                                <strong>{Math.round((scene.trimStart ?? 0) * 100)}%</strong>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={95}
                                step={1}
                                value={Math.round((scene.trimStart ?? 0) * 100)}
                                onChange={(event) => {
                                  const nextStart = Number(event.target.value) / 100
                                  const safeEnd = Math.max(nextStart + 0.05, scene.trimEnd ?? 1)
                                  updateScene(scene.id, { trimStart: nextStart, trimEnd: safeEnd })
                                }}
                              />
                            </div>
                            <div className="trim-control">
                              <div className="trim-labels">
                                <span>Trim Out</span>
                                <strong>{Math.round((scene.trimEnd ?? 1) * 100)}%</strong>
                              </div>
                              <input
                                type="range"
                                min={5}
                                max={100}
                                step={1}
                                value={Math.round((scene.trimEnd ?? 1) * 100)}
                                onChange={(event) => {
                                  const nextEnd = Number(event.target.value) / 100
                                  const safeStart = Math.min(scene.trimStart ?? 0, nextEnd - 0.05)
                                  updateScene(scene.id, { trimStart: safeStart, trimEnd: nextEnd })
                                }}
                              />
                            </div>
                            <p>Timeline handles control which slice of the source clip gets stitched in.</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="scene-row-actions">
                        <button onClick={() => moveScene(scene.id, -1)} disabled={index === 0}>
                          ↑
                        </button>
                        <button
                          onClick={() => moveScene(scene.id, 1)}
                          disabled={index === sceneQueue.length - 1}
                        >
                          ↓
                        </button>
                        <button onClick={() => duplicateScene(scene.id)}>+</button>
                        <button onClick={() => removeScene(scene.id)}>×</button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

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
