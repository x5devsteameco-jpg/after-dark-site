import { useMemo, useState } from 'react'
import './App.css'
import { ClipLab } from './components/ClipLab'
import type { MediaKind } from './data/media'
import {
  clipLibrary,
  featuredDrops,
  footerColumns,
  generatorSteps,
  mediaVaultItems,
  navLinks,
  tonightFeatures,
} from './data/media'

const vaultTabs: Array<{ key: MediaKind | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'reel', label: 'Reels' },
  { key: 'story', label: 'Stories' },
  { key: 'carousel', label: 'Carousels' },
  { key: 'promo', label: 'Promos' },
]

function ratingDots(count: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={index < count ? 'active' : ''}>
      ★
    </span>
  ))
}

function App() {
  const [activeTab, setActiveTab] = useState<(typeof vaultTabs)[number]['key']>('all')

  const filteredVault = useMemo(() => {
    if (activeTab === 'all') return mediaVaultItems.slice(0, 6)
    return mediaVaultItems.filter((item) => item.kind === activeTab).slice(0, 6)
  }, [activeTab])

  return (
    <div className="after-dark-page">
      <header className="site-header">
        <a className="brand-lockup" href="#">
          <div className="brand-mark">
            <span>CB</span>
          </div>
          <div className="brand-type">
            <p>Cross Border x Legacy</p>
            <strong>After Dark</strong>
          </div>
        </a>

        <nav className="site-nav">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <a className="subscribe-button" href="#clip-lab">
          Subscribe Now
        </a>
      </header>

      <main className="site-main">
        <section className="hero-shell">
          <div className="hero-copy">
            <p className="hero-kicker">Cross Border x Legacy</p>
            <h1>After Dark</h1>
            <h2>Uncensored</h2>
            <div className="hero-heart">♡</div>
            <ul className="hero-bullets">
              <li>Premium content.</li>
              <li>Exclusive access.</li>
              <li>Zero regrets.</li>
            </ul>
            <div className="hero-actions">
              <a className="unlock-button" href="#clip-lab">
                Unlock Exclusive Content
              </a>
            </div>
            <p className="hero-note">Private drops. Premium terps. No apologies.</p>
          </div>

          <div className="hero-stage">
            <img
              className="hero-stage-art"
              src="/media/source-imports/two-can-story.png"
              alt="Cross Border x Legacy After Dark hero artwork"
            />
          </div>
        </section>

        <section className="panel" id="drops">
          <div className="panel-header">
            <h3>Featured Drops</h3>
            <a href="#vault">View All Drops →</a>
          </div>

          <div className="featured-drops-grid">
            {featuredDrops.map((drop) => (
              <article key={drop.title} className="drop-card" style={{ ['--accent' as string]: drop.accent }}>
                <div className="drop-visual">
                  <img src={drop.src} alt={drop.title} />
                  <span className="drop-badge">{drop.badge}</span>
                </div>
                <div className="drop-copy">
                  <p>{drop.eyebrow}</p>
                  <h4>{drop.title}</h4>
                  <span>{drop.description}</span>
                </div>
                <button aria-label={`Open ${drop.title}`}>→</button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="features">
          <div className="panel-header">
            <h3>Tonight’s Features</h3>
            <p>Hand-picked. Highly rated.</p>
          </div>

          <div className="features-grid">
            {tonightFeatures.map((feature) => (
              <article key={feature.name} className="feature-card" style={{ ['--accent' as string]: feature.accent }}>
                <div className="feature-image">
                  <img src={feature.image} alt={feature.name} />
                </div>
                <div className="feature-copy">
                  <h4>{feature.name}</h4>
                  <small>{feature.kicker}</small>
                  <ul>
                    {feature.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <div className="rating-list">
                    {feature.ratings.map((rating) => (
                      <div key={rating.label} className="rating-row">
                        <span>{rating.label}</span>
                        <div>{ratingDots(rating.value)}</div>
                      </div>
                    ))}
                  </div>
                  <a href="#clip-lab">Explore</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel" id="vault">
          <div className="panel-header">
            <h3>Media Vault</h3>
            <a href="#clip-lab">View All Media →</a>
          </div>

          <div className="vault-tabs">
            {vaultTabs.map((tab) => (
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
            {filteredVault.map((item) => {
              const isVideo = item.src.endsWith('.mp4')

              return (
                <article key={item.id} className="vault-card" style={{ ['--accent' as string]: item.accent }}>
                  <div className="vault-frame">
                    {isVideo ? (
                      <video src={item.src} poster={item.poster} muted playsInline controls preload="metadata" />
                    ) : (
                      <img src={item.src} alt={item.title} />
                    )}
                    <div className="vault-overlay">
                      <h4>{item.title}</h4>
                      <span>{item.duration ?? item.subtitle}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="panel generator-panel" id="pipeline">
          <div className="panel-header">
            <h3>Behind The Scenes: Generator</h3>
          </div>

          <div className="generator-steps">
            {generatorSteps.map((step, index) => (
              <article key={step.title} className="step-card">
                <div className="step-icon">{step.icon}</div>
                <h4>{step.title}</h4>
                <p>{step.body}</p>
                {index < generatorSteps.length - 1 ? <span className="step-line" /> : null}
              </article>
            ))}
          </div>

          <div className="generator-cta">
            <div className="generator-cta-copy">
              <div className="generator-cta-icon">♡</div>
              <div>
                <strong>Exclusive content. Straight to your inbox.</strong>
                <p>Or skip the fake wait and open the clip studio right now.</p>
              </div>
            </div>
            <div className="generator-cta-actions">
              <input aria-label="Email" placeholder="Enter your email" />
              <a href="#clip-lab">Unlock Access</a>
            </div>
          </div>
        </section>

        <section className="panel clip-panel" id="clip-lab">
          <div className="panel-header">
            <h3>Clip Studio</h3>
            <p>Upload your own images or use the built-in library from any computer.</p>
          </div>
          <ClipLab options={clipLibrary} />
        </section>
      </main>

      <footer className="site-footer" id="footer">
        <div className="footer-brand">
          <div className="brand-mark">
            <span>CB</span>
          </div>
          <div className="brand-type">
            <p>Cross Border x Legacy</p>
            <strong>After Dark</strong>
          </div>
        </div>

        <div className="footer-links">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              {column.links.map((link) => (
                <a key={link} href="#">{link}</a>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-side">
          <strong>Premium content. Exclusive access. Zero regrets.</strong>
          <span>18+ only. Cannabis-infused products.</span>
        </div>
      </footer>
    </div>
  )
}

export default App
