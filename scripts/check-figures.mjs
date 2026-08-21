#!/usr/bin/env node
// #708/#709: every captured image must reach the page as a PICTURE.
//
// The defect this exists for: the figures were inserted after "the second line starting with ```",
// which on the diagrams and drawings pages is INSIDE a ````-wrapped example. Markdown was still
// valid, the build was still green, and two pages shipped their screenshot as a line of literal
// text in a code sample. Nothing in the toolchain objects to that — an image that fails to be an
// image is only visible if something looks at the built HTML.
//
// So this walks the CAPTURED files and asserts each is referenced by a page AND emitted as an <img>
// in dist, in BOTH locales. Discovery from the assets directory, not a list: an image added
// tomorrow is in scope on the day it lands.
//
//   pnpm build && node scripts/check-figures.mjs
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SHOTS = join(root, 'src/assets/screenshots')
const DOCS = join(root, 'src/content/docs')
const DIST = join(root, 'dist')

if (!existsSync(DIST)) {
  console.error('check-figures: no dist/ — run `pnpm build` first.')
  process.exit(1)
}

const images = readdirSync(SHOTS).filter((f) => f.endsWith('.png'))
if (images.length === 0) {
  console.error('check-figures: no captured images found — refusing a vacuously green run.')
  process.exit(1)
}

function pagesReferencing(name) {
  const out = []
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (e.name.endsWith('.md') || e.name.endsWith('.mdx')) {
        if (readFileSync(p, 'utf8').includes(`screenshots/${name}`)) out.push(p)
      }
    }
  }
  walk(DOCS)
  return out
}

// The page's built HTML: src/content/docs/editor/tables.md → dist/editor/tables/index.html
function distPageFor(src) {
  const rel = src.slice(DOCS.length + 1).replace(/\.(md|mdx)$/, '')
  return join(DIST, rel === 'index' ? '' : rel, 'index.html')
}

const problems = []
for (const img of images) {
  const stem = basename(img, '.png')
  const pages = pagesReferencing(img)
  if (pages.length === 0) { problems.push(`${img}: captured but referenced by no page`); continue }
  const locales = new Set(pages.map((p) => (p.slice(DOCS.length + 1).startsWith('ja/') ? 'ja' : 'en')))
  if (!locales.has('en') || !locales.has('ja')) {
    problems.push(`${img}: only in ${[...locales].join(', ')} — en and ja must carry the same figures`)
  }
  for (const page of pages) {
    const out = distPageFor(page)
    if (!existsSync(out)) { problems.push(`${img}: ${page} has no built page at ${out}`); continue }
    const html = readFileSync(out, 'utf8')
    // Astro rewrites the src to a hashed /_astro/<stem>.<hash>.png; an <img> carrying it is the proof
    // that the reference was markdown IMAGE syntax and not text inside a fence.
    const rendered = new RegExp(`<img[^>]+src="[^"]*_astro/${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.[^"]*"`).test(html)
    if (!rendered) problems.push(`${img}: referenced by ${page} but no <img> for it in the built page — it is probably inside a code fence`)
  }
}

if (problems.length) {
  console.error('check-figures FAILED:')
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}
console.log(`check-figures OK — ${images.length} captured image(s), each rendered as an <img> in en and ja.`)
