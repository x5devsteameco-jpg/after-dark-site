import fs from 'node:fs/promises'
import path from 'node:path'

const cwd = process.cwd()
const argSource = process.argv[2]
const envSource = process.env.SOURCE_MEDIA_DIR
const source = argSource
  ? path.resolve(cwd, argSource)
  : envSource
    ? path.resolve(cwd, envSource)
    : path.resolve(cwd, 'seed-assets')
const target = path.resolve(cwd, 'public/media')

async function main() {
  try {
    const stats = await fs.stat(source)
    if (!stats.isDirectory()) throw new Error(`${source} is not a directory`)
  } catch {
    console.error(`Asset source not found: ${source}`)
    console.error('Usage: npm run sync:assets -- /path/to/asset-folder')
    console.error('Or set SOURCE_MEDIA_DIR, or place files in ./seed-assets')
    process.exit(1)
  }

  await fs.mkdir(target, { recursive: true })
  const entries = await fs.readdir(source)
  let copied = 0

  for (const entry of entries) {
    if (!/\.(jpg|jpeg|png|mp4|webp)$/i.test(entry)) continue
    await fs.copyFile(path.join(source, entry), path.join(target, entry))
    copied += 1
  }

  console.log(`Synced ${copied} assets from ${source} into ${target}`)
}

await main()
