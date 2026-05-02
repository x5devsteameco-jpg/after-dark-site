export type MediaKind = 'promo' | 'story' | 'carousel' | 'reel' | 'video' | 'board' | 'collage'

export type MediaItem = {
  id: string
  title: string
  subtitle: string
  src: string
  kind: MediaKind
  poster?: string
  accent: string
}

export const featuredProducts = [
  {
    name: 'Cherry Limeade',
    detail: 'Cross Border 355 mL beverage',
    note: 'Tart cherry, zesty lime, sparkling late-night energy.',
    accent: '#ff5aa4',
  },
  {
    name: 'The Rolled Fashioned',
    detail: 'Legacy 355 mL beverage',
    note: 'Bronzed, smooth, and built for the people with expensive taste.',
    accent: '#ff8c3c',
  },
  {
    name: 'Slurricane Rosin',
    detail: 'Cross Border 1 g concentrate',
    note: 'Small jar, big effect, and enough attitude to own the green room.',
    accent: '#76ff6e',
  },
]

export const heroStats = [
  { label: 'Asset modes', value: '9' },
  { label: 'Generated outputs', value: '29' },
  { label: 'Clip exports', value: '3 live + custom lab' },
]

export const mediaLibrary: MediaItem[] = [
  {
    id: 'promo-featured',
    title: "Tonight's Features",
    subtitle: 'Feature-sheet style campaign creative',
    src: '/media/promo_featured_products.jpg',
    kind: 'promo',
    accent: '#c79c5c',
  },
  {
    id: 'promo-private',
    title: 'Curated Selection',
    subtitle: 'Truthful promo without fake countdowns',
    src: '/media/promo_private_access.jpg',
    kind: 'promo',
    accent: '#ff8c3c',
  },
  {
    id: 'promo-after-dark',
    title: 'After Dark',
    subtitle: 'Brand-safe premium teaser card',
    src: '/media/promo_after_dark.jpg',
    kind: 'promo',
    accent: '#ff5aa4',
  },
  {
    id: 'story-feature',
    title: "Tonight's Features Story",
    subtitle: 'Vertical story tease',
    src: "/media/story_01_tonight's_features.jpg",
    kind: 'story',
    accent: '#ff8c3c',
  },
  {
    id: 'story-private',
    title: 'Private Access Story',
    subtitle: 'Crate-first vertical drop',
    src: '/media/story_02_private_access.jpg',
    kind: 'story',
    accent: '#c79c5c',
  },
  {
    id: 'story-premium',
    title: 'Premium Temptation Story',
    subtitle: 'Green-room vertical tease',
    src: '/media/story_03_premium_temptation.jpg',
    kind: 'story',
    accent: '#76ff6e',
  },
  {
    id: 'carousel-vip',
    title: 'VIP Drop',
    subtitle: 'Hero carousel card',
    src: '/media/carousel_01_vip_drop.jpg',
    kind: 'carousel',
    accent: '#ff5aa4',
  },
  {
    id: 'carousel-unlock',
    title: 'Unlock This',
    subtitle: 'Crate carousel card',
    src: '/media/carousel_02_unlock_this.jpg',
    kind: 'carousel',
    accent: '#c79c5c',
  },
  {
    id: 'carousel-toxic',
    title: 'Toxic In A Hot Way',
    subtitle: 'Green-room carousel card',
    src: '/media/carousel_03_toxic_in_a_hot_way.jpg',
    kind: 'carousel',
    accent: '#76ff6e',
  },
  {
    id: 'carousel-slurricane',
    title: 'Slurricane',
    subtitle: 'Creator spotlight carousel card',
    src: '/media/carousel_04_slurricane.jpg',
    kind: 'carousel',
    accent: '#ff5aa4',
  },
  {
    id: 'reel-1',
    title: 'Cherry Limeade Reel',
    subtitle: 'Export-ready teaser cover',
    src: '/media/reel_cover_01.jpg',
    kind: 'reel',
    accent: '#ff5aa4',
  },
  {
    id: 'reel-2',
    title: 'Rolled Fashioned Reel',
    subtitle: 'Amber hero reel cover',
    src: '/media/reel_cover_02.jpg',
    kind: 'reel',
    accent: '#ff8c3c',
  },
  {
    id: 'reel-3',
    title: 'Green Room Reel',
    subtitle: 'Rosin teaser reel cover',
    src: '/media/reel_cover_03.jpg',
    kind: 'reel',
    accent: '#76ff6e',
  },
  {
    id: 'video-1',
    title: 'Cherry Limeade Teaser',
    subtitle: '6-second exported MP4 clip',
    src: '/media/teaser_01_cherry_limeade.mp4',
    poster: '/media/reel_cover_01.jpg',
    kind: 'video',
    accent: '#ff5aa4',
  },
  {
    id: 'video-2',
    title: 'Rolled Fashioned Teaser',
    subtitle: '6-second exported MP4 clip',
    src: '/media/teaser_02_rolled_fashioned.mp4',
    poster: '/media/reel_cover_02.jpg',
    kind: 'video',
    accent: '#ff8c3c',
  },
  {
    id: 'video-3',
    title: 'Green Room Teaser',
    subtitle: '6-second exported MP4 clip',
    src: '/media/teaser_03_green_room.mp4',
    poster: '/media/reel_cover_03.jpg',
    kind: 'video',
    accent: '#76ff6e',
  },
  {
    id: 'collage',
    title: 'Luxury Campaign Collage',
    subtitle: 'Multi-panel high-drama poster',
    src: '/media/collage_luxury_campaign.jpg',
    kind: 'collage',
    accent: '#ff8c3c',
  },
]

export const storyboardLibrary: MediaItem[] = [
  {
    id: 'board-vip',
    title: 'VIP Drop Storyboard',
    subtitle: 'Shot order for the can hero teaser',
    src: '/media/storyboard_vip_drop.jpg',
    kind: 'board',
    accent: '#ff5aa4',
  },
  {
    id: 'board-unlock',
    title: 'Unlock Storyboard',
    subtitle: 'Truthful crate-led teaser sequence',
    src: '/media/storyboard_unlock_this.jpg',
    kind: 'board',
    accent: '#c79c5c',
  },
  {
    id: 'board-green',
    title: 'Green Room Storyboard',
    subtitle: 'Rosin-centric motion breakdown',
    src: '/media/storyboard_green_room.jpg',
    kind: 'board',
    accent: '#76ff6e',
  },
]
