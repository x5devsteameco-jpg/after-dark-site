import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import type { MediaItem } from '../data/media'
import { generateClip } from '../lib/clipGenerator'
import { MediaCard } from './MediaCard'

type Props = {
  options: MediaItem[]
}

const palette = [
  { name: 'Neon Pink', value: '#ff5aa4' },
  { name: 'Amber', value: '#ff8c3c' },
  { name: 'Green Room', value: '#76ff6e' },
]

export function ClipLab({ options }: Props) {
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>(options.slice(0, 3).map((item) => item.id))
  const [title, setTitle] = useState('Tonight’s Features')
  const [subtitle, setSubtitle] = useState('Cherry Limeade. The Rolled Fashioned. Slurricane.')
  const [duration, setDuration] = useState<6 | 10 | 15>(6)
  const [accent, setAccent] = useState(palette[0].value)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const allOptions = useMemo(() => [...uploadedMedia, ...options], [options, uploadedMedia])

  const selectedMedia = useMemo(
    () => allOptions.filter((item) => selectedIds.includes(item.id)),
    [allOptions, selectedIds],
  )

  const toggle = (item: MediaItem) => {
    setSelectedIds((current) => {
      if (current.includes(item.id)) return current.filter((id) => id !== item.id)
      if (current.length >= 4) return [...current.slice(1), item.id]
      return [...current, item.id]
    })
  }

  const handleGenerate = async () => {
    if (selectedMedia.length === 0) {
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
        accent,
        scenes: selectedMedia,
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

    const incoming = files
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 12)
      .map((file, index) => ({
        id: `upload-${file.name}-${index}-${Date.now()}`,
        title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        subtitle: 'Uploaded image',
        src: URL.createObjectURL(file),
        kind: 'photo' as const,
        accent: palette[index % palette.length].value,
      }))

    setUploadedMedia((current) => [...incoming, ...current].slice(0, 12))
    setSelectedIds((current) => {
      const next = [...incoming.map((item) => item.id), ...current]
      return Array.from(new Set(next)).slice(0, 4)
    })
    event.target.value = ''
  }

  useEffect(() => {
    return () => {
      uploadedMedia.forEach((item) => {
        if (item.id.startsWith('upload-')) URL.revokeObjectURL(item.src)
      })
    }
  }, [uploadedMedia])

  return (
    <section className="clip-lab-shell" id="clip-lab">
      <div className="clip-lab-intro">
        <span className="pill">Clip Lab</span>
        <h3>Generate custom teaser clips inside the website</h3>
        <p>
          Pick up to four campaign assets, set the headline, choose a colour mood, and export a
          branded short-form clip directly in-browser.
        </p>
      </div>

      <div className="clip-lab-grid">
        <aside className="clip-controls">
          <label>
            <span>Headline</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={36} />
          </label>
          <label>
            <span>Subhead</span>
            <input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              maxLength={72}
            />
          </label>
          <div className="inline-controls">
            <label>
              <span>Duration</span>
              <select
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value) as 6 | 10 | 15)}
              >
                <option value={6}>6 sec</option>
                <option value={10}>10 sec</option>
                <option value={15}>15 sec</option>
              </select>
            </label>
            <label>
              <span>Accent</span>
              <select value={accent} onChange={(event) => setAccent(event.target.value)}>
                {palette.map((swatch) => (
                  <option key={swatch.value} value={swatch.value}>
                    {swatch.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="instruction-box">
            <strong>How it works</strong>
            <ol>
              <li>Select 1-4 campaign visuals below.</li>
              <li>Set the headline and mood colour.</li>
              <li>Click generate to render a downloadable short clip.</li>
            </ol>
          </div>
          <label>
            <span>Bring your own assets</span>
            <input type="file" accept="image/*" multiple onChange={handleUpload} />
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
    </section>
  )
}
