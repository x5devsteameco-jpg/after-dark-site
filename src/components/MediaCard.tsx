import type { MediaItem } from '../data/media'

type Props = {
  item: MediaItem
  selectable?: boolean
  selected?: boolean
  onToggle?: (item: MediaItem) => void
}

export function MediaCard({ item, selectable, selected, onToggle }: Props) {
  const isVideo = item.kind === 'video' || item.src.toLowerCase().endsWith('.mp4')

  return (
    <article
      className={`media-card ${selected ? 'selected' : ''} ${selectable ? 'selectable' : ''}`}
      style={{ ['--accent' as string]: item.accent }}
      onClick={selectable && onToggle ? () => onToggle(item) : undefined}
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      onKeyDown={
        selectable && onToggle
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onToggle(item)
              }
            }
          : undefined
      }
    >
      <div className="media-frame">
        {isVideo ? (
          <video src={item.src} poster={item.poster} muted playsInline controls preload="metadata" />
        ) : (
          <img src={item.src} alt={item.title} loading="lazy" />
        )}
      </div>
      <div className="media-copy">
        <span>{item.kind}</span>
        <h3>{item.title}</h3>
        <p>{item.subtitle}</p>
      </div>
    </article>
  )
}
