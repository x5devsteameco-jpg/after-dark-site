import { useMemo, useState } from 'react'
import './App.css'
import { ClipLab } from './components/ClipLab'
import { MediaCard } from './components/MediaCard'
import { SectionHeader } from './components/SectionHeader'
import { featuredProducts, heroStats, mediaLibrary, storyboardLibrary, type MediaKind } from './data/media'

const tabs: Array<{ key: MediaKind | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'video', label: 'Clips' },
  { key: 'promo', label: 'Promos' },
  { key: 'story', label: 'Stories' },
  { key: 'carousel', label: 'Carousel' },
  { key: 'reel', label: 'Reel Covers' },
]

function App() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['key']>('all')

  const filteredMedia = useMemo(() => {
    if (activeTab === 'all') return mediaLibrary
    return mediaLibrary.filter((item) => item.kind === activeTab)
  }, [activeTab])

  const clipOptions = useMemo(
    () => mediaLibrary.filter((item) => ['promo', 'carousel', 'story', 'reel'].includes(item.kind)),
    [],
  )

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p>Cross Border x Legacy</p>
          <strong>After Dark Uncensored</strong>
        </div>
        <nav>
          <a href="#drops">Drops</a>
          <a href="#features">Features</a>
          <a href="#vault">Vault</a>
          <a href="#clip-lab">Clip Lab</a>
          <a href="#pipeline">Pipeline</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="hero-kicker">Live campaign vault</p>
            <h1>After Dark is now a living content machine.</h1>
            <p className="hero-body">
              Cross Border x Legacy now has a polished home for campaign drops, truthful promo
              creative, vertical stories, exported teasers, and a built-in Clip Lab that can spin
              up fresh short-form content directly in the browser.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#clip-lab">
                Open Clip Lab
              </a>
              <a className="secondary-action" href="#vault">
                Browse the vault
              </a>
            </div>
            <div className="stats-grid">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-main">
              <img src="/media/collage_luxury_campaign.jpg" alt="Cross Border After Dark collage" />
              <div className="hero-chip hero-chip-top">Cherry Limeade x The Rolled Fashioned</div>
            </div>
            <div className="hero-visual-strip">
              <article>
                <img src="/media/feature_sheet_tonights_features.jpg" alt="Tonight's features sheet" />
                <span>Tonight’s features</span>
              </article>
              <article>
                <video
                  src="/media/teaser_01_cherry_limeade.mp4"
                  poster="/media/reel_cover_01.jpg"
                  muted
                  autoPlay
                  loop
                  playsInline
                />
                <span>Live teaser export</span>
              </article>
            </div>
            <div className="hero-chip hero-chip-bottom">Generated campaign pack + live clip tools</div>
          </div>
        </section>

        <section className="section" id="drops">
          <SectionHeader
            eyebrow="Featured drops"
            title="The campaign pack now behaves like a real content system."
            body="Promo cards, exported clips, stories, and campaign posters all live in one polished surface with consistent styling, clear metadata, and direct reuse."
          />
          <div className="drops-grid">
            {mediaLibrary
              .filter((item) => ['promo', 'video', 'collage'].includes(item.kind))
              .slice(0, 6)
              .map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
          </div>
        </section>

        <section className="section feature-band" id="features">
          <div className="feature-sheet">
            <img
              src="/media/feature_sheet_tonights_features.jpg"
              alt="Tonight's features campaign sheet"
            />
          </div>
          <div className="feature-copy">
            <SectionHeader
              eyebrow="Tonight’s features"
              title="Cherry Limeade. The Rolled Fashioned. Slurricane."
              body="The editorial tone stays hot and cinematic, while the product story stays clear, truthful, and easy to use for real campaign work."
            />
            <div className="product-stack">
              {featuredProducts.map((product) => (
                <article key={product.name} className="product-card" style={{ ['--accent' as string]: product.accent }}>
                  <h3>{product.name}</h3>
                  <small>{product.detail}</small>
                  <p>{product.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="vault">
          <SectionHeader
            eyebrow="Media vault"
            title="Filter the campaign library by format and keep it moving."
            body="The vault exposes clips, stories, promo cards, reel covers, and carousel posts in one place so the site feels like a live content floor, not a dead archive."
          />
          <div className="vault-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={activeTab === tab.key ? 'active' : ''}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="vault-grid">
            {filteredMedia.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className="section board-section">
          <SectionHeader
            eyebrow="Storyboard passes"
            title="The motion side is documented, not improvised."
            body="Shot-order boards now sit beside stills and exported teasers, creating a clean handoff from creative direction to edit instead of file chaos and guesswork."
          />
          <div className="storyboard-grid">
            {storyboardLibrary.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <ClipLab options={clipOptions} />

        <section className="section pipeline-section" id="pipeline">
          <SectionHeader
            eyebrow="Creator workflow"
            title="The site is wired to the generator on purpose."
            body="The Python asset builder produces the campaign pack, the site ingests those outputs into a deployable media vault, and the browser-side Clip Lab lets you generate new short-form teasers without leaving the web UI."
          />
          <div className="pipeline-grid">
            <article className="pipeline-card">
              <span>01</span>
              <h3>Generate</h3>
              <p>
                <code>build_onlyfans_parody_assets.py</code> produces banners, cards, storyboards,
                clips, and manifests.
              </p>
            </article>
            <article className="pipeline-card">
              <span>02</span>
              <h3>Sync</h3>
              <p>
                Campaign outputs are copied into <code>public/media</code> so the website ships
                self-contained on Vercel.
              </p>
            </article>
            <article className="pipeline-card">
              <span>03</span>
              <h3>Compose</h3>
              <p>
                The site assembles vault views, feature rails, promo modules, and the live Clip Lab
                from that content set.
              </p>
            </article>
            <article className="pipeline-card">
              <span>04</span>
              <h3>Export</h3>
              <p>
                Users can preview and download short clips directly in-browser with no fake timers
                and no invented promo claims.
              </p>
            </article>
          </div>
          <div className="code-panel">
            <pre>{`npm run sync:assets
python3 "/Users/Devon/Pictures/only fans assets/build_onlyfans_parody_assets.py"
npm run dev`}</pre>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <p>Cross Border x Legacy</p>
          <strong>After Dark Uncensored</strong>
        </div>
        <div>
          <span>Quick start</span>
          <p>Browse the vault, open Clip Lab, select up to four visuals, generate a teaser, and download it directly from the site.</p>
        </div>
        <a href="#clip-lab">Generate another clip</a>
      </footer>
    </div>
  )
}

export default App
