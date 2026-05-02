export type MediaKind = 'promo' | 'story' | 'carousel' | 'reel' | 'video' | 'board' | 'photo'

export type MediaItem = {
  id: string
  title: string
  subtitle: string
  src: string
  kind: MediaKind
  poster?: string
  accent: string
  duration?: string
}

export type FeaturedDrop = {
  badge: string
  eyebrow: string
  title: string
  description: string
  src: string
  accent: string
}

export type TonightFeature = {
  name: string
  kicker: string
  image: string
  accent: string
  bullets: string[]
  ratings: Array<{ label: string; value: number }>
}

export type GeneratorStep = {
  title: string
  body: string
  icon: string
}

export const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Drops', href: '#drops' },
  { label: 'Media Vault', href: '#vault' },
  { label: 'Behind The Scenes', href: '#pipeline' },
  { label: 'About', href: '#footer' },
]

export const featuredDrops: FeaturedDrop[] = [
  {
    badge: 'VIP Drop',
    eyebrow: "Tonight's Feature",
    title: 'The Rolled Fashioned',
    description: 'Smooth. Balanced. Timeless. Crafted for those who appreciate the finer things.',
    src: '/media/source-imports/legacy-hero.jpeg',
    accent: '#ff9f43',
  },
  {
    badge: 'VIP Drop',
    eyebrow: "Tonight's Feature",
    title: 'Cherry Limeade',
    description: 'Tart cherry. Zesty lime. High impact. No apologies.',
    src: '/media/source-imports/cherry-limeade-dark.jpg',
    accent: '#ff5aa4',
  },
  {
    badge: 'Exclusive',
    eyebrow: "Tonight's Feature",
    title: 'Slurricane Live Rosin',
    description: 'Small jar. Big effect. Just how you like it.',
    src: '/media/source-imports/green-room-jar.jpeg',
    accent: '#8dff64',
  },
  {
    badge: 'Close Friends',
    eyebrow: 'New Drop',
    title: 'Slurricane Drops',
    description: "Limited runs. Loud terps. Don't sleep on this one.",
    src: '/media/source-imports/slurricane-cloud.jpg',
    accent: '#d98cff',
  },
]

export const tonightFeatures: TonightFeature[] = [
  {
    name: 'Cherry Limeade',
    kicker: 'Cross Border Beverage',
    image: '/media/source-imports/cherry-limeade-dark.jpg',
    accent: '#ff5aa4',
    bullets: ['Tart cherry', 'Zesty lime', 'High impact'],
    ratings: [
      { label: 'Flavour', value: 5 },
      { label: 'Potency', value: 5 },
      { label: 'Smoothness', value: 5 },
    ],
  },
  {
    name: 'The Rolled Fashioned',
    kicker: 'Legacy Beverage',
    image: '/media/source-imports/legacy-hero.jpeg',
    accent: '#ff9f43',
    bullets: ['Smooth', 'Balanced', 'Timeless'],
    ratings: [
      { label: 'Flavour', value: 5 },
      { label: 'Potency', value: 5 },
      { label: 'Smoothness', value: 5 },
    ],
  },
  {
    name: 'Slurricane Live Rosin',
    kicker: 'Cross Border 1 g Rosin',
    image: '/media/source-imports/green-room-jar.jpeg',
    accent: '#8dff64',
    bullets: ['Potent', 'Clean', 'Loud'],
    ratings: [
      { label: 'Flavour', value: 5 },
      { label: 'Potency', value: 5 },
      { label: 'Smoothness', value: 5 },
    ],
  },
]

export const mediaVaultItems: MediaItem[] = [
  {
    id: 'vault-after-dark',
    title: 'After Dark Teaser',
    subtitle: 'Campaign opener',
    src: '/media/teaser_01_cherry_limeade.mp4',
    poster: '/media/promo_after_dark.jpg',
    kind: 'video',
    accent: '#ff9f43',
    duration: '0:15',
  },
  {
    id: 'vault-cherry-story',
    title: 'Cherry Limeade Story',
    subtitle: 'Vertical social',
    src: '/media/source-imports/cherry-limeade-video.mp4',
    poster: '/media/source-imports/cherry-limeade-dark.jpg',
    kind: 'story',
    accent: '#ff5aa4',
    duration: '0:20',
  },
  {
    id: 'vault-slurricane-spotlight',
    title: 'Slurricane Spotlight',
    subtitle: 'Highlight creative',
    src: '/media/source-imports/slurricane-title-card.jpg',
    kind: 'promo',
    accent: '#d98cff',
    duration: '0:16',
  },
  {
    id: 'vault-private-access',
    title: 'Private Access Unboxing',
    subtitle: 'Crate reveal',
    src: '/media/source-imports/crate-video.mp4',
    poster: '/media/source-imports/crate-hero.jpeg',
    kind: 'carousel',
    accent: '#c79c5c',
    duration: '0:18',
  },
  {
    id: 'vault-rolled-reel',
    title: 'The Rolled Fashioned Reel',
    subtitle: 'Amber hero',
    src: '/media/source-imports/rolled-fashioned-video.mp4',
    poster: '/media/source-imports/legacy-hero.jpeg',
    kind: 'reel',
    accent: '#ff9f43',
    duration: '0:15',
  },
  {
    id: 'vault-green-room',
    title: 'Green Room Vibes',
    subtitle: 'Rosin mood piece',
    src: '/media/source-imports/green-room-video.mp4',
    poster: '/media/source-imports/green-room-jar.jpeg',
    kind: 'video',
    accent: '#8dff64',
    duration: '0:14',
  },
  {
    id: 'vault-feature-board',
    title: 'Feature Board',
    subtitle: 'Two-can poster creative',
    src: '/media/source-imports/feature-board.png',
    kind: 'promo',
    accent: '#ff9f43',
  },
  {
    id: 'vault-two-can-story',
    title: 'Two Can Story',
    subtitle: 'Vertical dual-brand art',
    src: '/media/source-imports/two-can-story.png',
    kind: 'story',
    accent: '#ff5aa4',
  },
  {
    id: 'vault-poster',
    title: 'After Dark Poster',
    subtitle: 'Wide social banner',
    src: '/media/source-imports/after-dark-poster.png',
    kind: 'promo',
    accent: '#ff9f43',
  },
  {
    id: 'vault-temple-ball',
    title: 'Temple Ball',
    subtitle: 'Concentrate product plate',
    src: '/media/source-imports/temple-ball.jpeg',
    kind: 'photo',
    accent: '#8dff64',
  },
]

export const clipLibrary: MediaItem[] = [
  {
    id: 'clip-legacy',
    title: 'Legacy Hero',
    subtitle: 'Rolled Fashioned still',
    src: '/media/source-imports/legacy-hero.jpeg',
    kind: 'photo',
    accent: '#ff9f43',
  },
  {
    id: 'clip-cherry',
    title: 'Cherry Limeade Bar',
    subtitle: 'Black can hero',
    src: '/media/source-imports/cherry-limeade-dark.jpg',
    kind: 'photo',
    accent: '#ff5aa4',
  },
  {
    id: 'clip-crate',
    title: 'Crate Hero',
    subtitle: 'Private access shot',
    src: '/media/source-imports/crate-hero.jpeg',
    kind: 'photo',
    accent: '#c79c5c',
  },
  {
    id: 'clip-green',
    title: 'Green Room Jar',
    subtitle: 'Live rosin hero',
    src: '/media/source-imports/green-room-jar.jpeg',
    kind: 'photo',
    accent: '#8dff64',
  },
  {
    id: 'clip-slurricane',
    title: 'Slurricane Cloud',
    subtitle: 'Pink drop creative',
    src: '/media/source-imports/slurricane-cloud.jpg',
    kind: 'photo',
    accent: '#d98cff',
  },
  {
    id: 'clip-board',
    title: 'Feature Board',
    subtitle: 'Dual-brand layout',
    src: '/media/source-imports/feature-board.png',
    kind: 'photo',
    accent: '#ff9f43',
  },
  {
    id: 'clip-story',
    title: 'Two Can Story',
    subtitle: 'Vertical campaign art',
    src: '/media/source-imports/two-can-story.png',
    kind: 'photo',
    accent: '#ff5aa4',
  },
  {
    id: 'clip-poster',
    title: 'After Dark Poster',
    subtitle: 'Wide social concept',
    src: '/media/source-imports/after-dark-poster.png',
    kind: 'photo',
    accent: '#ff9f43',
  },
]

export const generatorSteps: GeneratorStep[] = [
  {
    icon: '✦',
    title: 'Idea Spark',
    body: 'Concepts born from the culture.',
  },
  {
    icon: '▣',
    title: 'Asset Generation',
    body: 'AI-powered visuals. Built for impact.',
  },
  {
    icon: '✎',
    title: 'Brand Crafting',
    body: 'Tone, typography, and layout.',
  },
  {
    icon: '◈',
    title: 'Campaign Build',
    body: 'Carousels, reels, promos, and assets.',
  },
  {
    icon: '➜',
    title: 'Ready To Drop',
    body: 'Premium content delivered nightly.',
  },
]

export const footerColumns = [
  {
    title: 'Explore',
    links: ['Features', 'Drops', 'Media Vault', 'Behind The Scenes', 'About'],
  },
  {
    title: 'Support',
    links: ['Membership', 'FAQ', 'Contact', 'Privacy Policy', 'Terms Of Use'],
  },
  {
    title: 'Stay Connected',
    links: ['Instagram', 'X (Twitter)', 'YouTube', 'Newsletter'],
  },
]
