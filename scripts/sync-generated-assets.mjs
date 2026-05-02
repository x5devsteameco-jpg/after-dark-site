import fs from 'node:fs/promises'
import path from 'node:path'

const source = '/Users/Devon/Pictures/only fans assets/generated_campaign'
const target = '/Users/Devon/Documents/Only Fans Assets/after-dark-site/public/media'

await fs.mkdir(target, { recursive: true })
const entries = await fs.readdir(source)

for (const entry of entries) {
  if (!/\.(jpg|jpeg|png|mp4)$/i.test(entry)) continue
  await fs.copyFile(path.join(source, entry), path.join(target, entry))
}

console.log(`Synced ${entries.length} generated assets into ${target}`)
