# After Dark Site

Cross Border x Legacy `After Dark Uncensored` is a Vite + React microsite that turns the existing campaign asset generator into a live media vault with in-browser clip generation.

## What It Does

- surfaces generated campaign assets as a polished visual library
- highlights featured products and promo creative
- exposes exported teaser clips and storyboard sheets
- generates new short-form teaser clips directly in the browser with `MediaRecorder`
- supports a draggable timeline with scene strips, duplication, and per-scene emphasis
- supports text cards and CTA cards directly inside the timeline
- supports branded export presets such as `OF Teaser`, `IG Reel`, `Story Burst`, and `Product Spotlight`
- supports scene-level transition overrides, timeline trimming for video scenes, and mixed image/video stitching
- supports saved presets, export history, and generated thumbnail cards for uploaded videos
- supports style presets, transition tuning, motion tuning, overlay modes, and title treatments
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
3. Build a scene queue from the built-in library or your own uploaded images and videos.
4. Drag timeline strips to reorder, duplicate, relabel, and weight scenes to control pacing.
5. Choose a branded export preset or dial in output format, duration, quality, FPS, transitions, motion, overlays, and title style manually.
6. Add text cards and CTA cards anywhere in the sequence.
7. Override individual scenes with their own motion and transition behavior.
8. Use the trim handles on video scenes to choose which slice of the source clip gets stitched into the timeline.
9. Save the build as a reusable preset, generate, preview, and download the finished `.webm` teaser.

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

Inside the website itself, `Clip Studio` also supports uploading your own images and videos directly from the browser, so clip generation is not tied to one machine.

Build for production:

```bash
npm run build
```

## Verification Checklist

- `npm run lint`
- `npm run build`
- verify the hero, vault, storyboard, and clip sections load correctly
- verify `Clip Lab` creates a preview and exposes a working download link
- verify drag-reordering, text cards, and CTA cards work in-browser
- verify queue edits, branded presets, transitions, and per-scene motion overrides work in-browser
- verify uploaded video scenes expose trim handles and export correctly in a mixed media sequence

## Notes

- clip generation is browser-side and currently exports `.webm`
- exported MP4 campaign teasers are included in the media vault
- uploaded browser assets stay local to the current session unless you add them to the repo yourself
