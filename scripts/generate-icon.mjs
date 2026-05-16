// Generates the 1024x1024 app icon PNG for iOS/Android distribution.
// Usage: node scripts/generate-icon.mjs
import sharp from 'sharp'
import { existsSync } from 'fs'
import { dirname } from 'path'

const SIZE = 1024
const RADIUS = SIZE * 0.22 // rounded square

const IOS_OUT = 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'
const ANDROID_OUT = 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png'

async function generate() {
  // Build SVG with gradient background + soccer ball
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#064e3b"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
      <clipPath id="round">
        <rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}"/>
      </clipPath>
    </defs>
    <rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="url(#bg)"/>
    <text
      x="50%" y="54%"
      dominant-baseline="middle"
      text-anchor="middle"
      font-size="${Math.round(SIZE * 0.52)}"
      clip-path="url(#round)"
    >⚽</text>
  </svg>`

  // flatten removes alpha channel — required by the App Store
  const png = await sharp(Buffer.from(svg))
    .flatten({ background: '#064e3b' })
    .png()
    .toBuffer()

  for (const out of [IOS_OUT, ANDROID_OUT]) {
    const dir = dirname(out)
    if (!existsSync(dir)) {
      console.log(`Skipping ${out} (platform not added yet)`)
      continue
    }
    await sharp(png).resize(SIZE, SIZE).toFile(out)
    console.log(`✓ ${out}`)
  }
}

generate().catch((e) => { console.error(e); process.exit(1) })
