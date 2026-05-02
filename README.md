# After Dark Site

Cross Border x Legacy `After Dark Uncensored` is a Vite + React microsite that turns the existing campaign asset generator into a live media vault with in-browser clip generation.

## What It Does

- surfaces generated campaign assets as a polished visual library
- highlights featured products and promo creative
- exposes exported teaser clips and storyboard sheets
- generates new short-form teaser clips directly in the browser with `MediaRecorder`
- keeps the site deployable as a static Vercel project with no backend required

## Project Structure

- `src/data/media.ts`: structured media catalog used by the site
- `src/components/ClipLab.tsx`: clip builder UI
- `src/lib/clipGenerator.ts`: browser-side clip rendering and export
- `scripts/sync-generated-assets.mjs`: copies generator outputs into `public/media`
- `public/media`: deployable campaign assets consumed by the site

## How To Run

```bash
npm install
npm run dev
```

Open the local site and use it like this:

1. Browse the `Media Vault` to review available assets.
2. Open `Clip Lab`.
3. Select up to four visuals.
4. Set a headline, subhead, duration, and accent color.
5. Click `Generate clip`.
6. Preview and download the generated `.webm` teaser.

## Asset Workflow

Regenerate the source campaign pack:

```bash
python3 "/Users/Devon/Pictures/only fans assets/build_onlyfans_parody_assets.py"
```

Sync the latest generated assets into the website:

```bash
npm run sync:assets
```

Build for production:

```bash
npm run build
```

## Verification Checklist

- `npm run lint`
- `npm run build`
- verify the hero, vault, storyboard, and clip sections load correctly
- verify `Clip Lab` creates a preview and exposes a working download link

## Notes

- clip generation is browser-side and currently exports `.webm`
- exported MP4 campaign teasers from the Python pipeline are still included in the media vault
- the site avoids fake countdowns and invented launch claims on purpose
