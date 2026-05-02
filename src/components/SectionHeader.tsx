type Props = {
  eyebrow?: string
  title: string
  body: string
}

export function SectionHeader({ eyebrow, title, body }: Props) {
  return (
    <div className="section-header">
      {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}
