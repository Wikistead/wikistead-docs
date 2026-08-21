#!/usr/bin/env node
// #709: the hero's size, as a NUMBER.
//
// "Legible at display width" was the acceptance for two rounds and it bounced twice, because prose
// cannot be measured and everyone involved could believe the image had got bigger. The ratio can:
//
//   scale = displayed CSS width ÷ the APP CSS width the image contains
//
// The second term is not a guess: the capture records the viewport it shot at (`appCssWidth`) and its
// device pixel ratio in src/assets/screenshots/manifest.json, and this reads them. At scale 1.0 the
// app's 14px text is 14px on the docs page; the floor is 0.85 (≈12px), which is the #709 ruling.
//
// The page is served from `dist/` by this script on an EPHEMERAL port. That is deliberate: measuring
// somebody else's `astro preview` on a fixed port is exactly how the last round got a false reading
// (a stale checkout answered on 4332). A server this process starts cannot be another worktree's.
//
//   node scripts/check-hero-scale.mjs
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(root, 'dist')
const MANIFEST = join(root, 'src/assets/screenshots/manifest.json')
const MIN_SCALE = 0.85
// Every width where the image is SHOWN is measured. 1440 is the desktop reading, 768 is the tablet
// one that the first version of this fix missed entirely (Starlight caps the image at 20rem below its
// own breakpoint, so the desktop fix left a 0.32 ratio one step down). Phones are excluded because the
// stylesheet hides the image there; the check asserts that too, so "excluded" cannot quietly become
// "shown and tiny".
const VIEWPORTS = [1440, 768]
const HIDDEN_BELOW = 390

if (!existsSync(DIST)) {
  console.error('check-hero-scale: no dist/ — run `pnpm build` first.')
  process.exit(1)
}
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'))
const hero = manifest['editor-live-preview.png']
if (!hero?.appCssWidth || !hero?.dpr) {
  console.error('check-hero-scale: the hero has no appCssWidth/dpr in the capture manifest — re-run the capture.\n' +
    'Without them the ratio would be computed from a guess, which is the thing this check exists to replace.')
  process.exit(1)
}

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.xml': 'application/xml' }
const server = createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0])
  let file = join(DIST, url)
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) { res.statusCode = 404; return res.end('not found') }
  res.setHeader('content-type', MIME[extname(file)] ?? 'application/octet-stream')
  res.end(readFileSync(file))
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

const browser = await chromium.launch()
const problems = []
try {
  for (const [locale, path] of [['en', '/'], ['ja', '/ja/']]) {
   for (const VIEWPORT of VIEWPORTS) {
    const label = `${locale}@${VIEWPORT}`
    const page = await browser.newPage({ viewport: { width: VIEWPORT, height: 1000 } })
    await page.goto(`${base}${path}`, { waitUntil: 'load' })
    const shot = await page.evaluate(() => {
      const img = document.querySelector('.hero > img')
      if (!img) return null
      const r = img.getBoundingClientRect()
      return { displayed: r.width, natural: img.naturalWidth, src: img.getAttribute('src') }
    })
    if (!shot) { problems.push(`${label}: the splash hero has no image`); continue }
    // The served page must be THIS build; a hashed asset name is the fingerprint that says so.
    if (!/_astro\/editor-live-preview\./.test(shot.src ?? '')) {
      problems.push(`${label}: the hero image is ${shot.src} — not the built hero asset`)
      continue
    }
    const appWidth = shot.natural / hero.dpr
    // The manifest must AGREE with the file, or its numbers are a story about an older capture and
    // the ratio below is fiction. This is what makes `appCssWidth` load-bearing rather than a note.
    if (Math.abs(appWidth - hero.appCssWidth) > 1) {
      problems.push(`${label}: the hero is ${appWidth}px of app but the manifest claims ${hero.appCssWidth}px — the manifest is stale, re-run the capture`)
      continue
    }
    const scale = shot.displayed / appWidth
    const px14 = 14 * scale
    const line = `${label}: ${Math.round(shot.displayed)}px shown for ${Math.round(appWidth)}px of app → scale ${scale.toFixed(2)} (14px text reads at ${px14.toFixed(1)}px)`
    if (scale < MIN_SCALE) problems.push(`${line} — below the ${MIN_SCALE} floor`)
    else console.log(`OK ${line}`)
    await page.close()
   }
   // The phone case: hidden on purpose (see brand.css). If it ever comes back it comes back tiny.
   const small = await browser.newPage({ viewport: { width: HIDDEN_BELOW, height: 900 } })
   await small.goto(`${base}${path}`, { waitUntil: 'load' })
   const visible = await small.evaluate(() => {
     const img = document.querySelector('.hero > img')
     return img ? getComputedStyle(img).display !== 'none' : false
   })
   if (visible) problems.push(`${locale}@${HIDDEN_BELOW}: the hero image is shown on a phone, where no frame can reach the floor`)
   await small.close()
  }
} finally {
  await browser.close()
  server.close()
}

if (problems.length) {
  console.error('\ncheck-hero-scale FAILED:')
  for (const p of problems) console.error(`  ${p}`)
  console.error('\nRaise the ratio by widening the frame (src/styles/brand.css) or by capturing a narrower slice\n' +
    'of the app (scripts/capture/capture-screens.mjs). A sharper image at the same frame does not move it.')
  process.exit(1)
}
console.log(`check-hero-scale OK — ${MIN_SCALE}+ scale in both locales at ${VIEWPORTS.join('px, ')}px, and hidden at ${HIDDEN_BELOW}px.`)
