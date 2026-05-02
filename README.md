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

The website is already deployable as-is because the current asset pack is committed into `public/media`.

If you want to swap in a new batch of assets on any computer, use one of these options:

```bash
npm run sync:assets -- /path/to/asset-folder
```

```bash
SOURCE_MEDIA_DIR=/path/to/asset-folder npm run sync:assets
```

Or create a local `seed-assets/` folder in the repo root and run:

```bash
npm run sync:assets
```

Inside the website itself, `Clip Studio` also supports uploading your own images directly from the browser, so clip generation is not tied to one machine.

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
- exported MP4 campaign teasers are included in the media vault
- uploaded browser assets stay local to the current session unless you add them to the repo yourself
