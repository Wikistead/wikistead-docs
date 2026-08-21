#!/usr/bin/env node
// #748: an internal link that no longer resolves must be RED, not a 404 the reader finds.
//
// This site had no such check, which is why renaming a section was a scary manual sweep: forty-odd
// references, counted by hand, verified by reading. A rename is exactly when links break, and "we
// looked carefully" is not a method — #748's own instruction was that a hand-edited sweep needs a
// check in the same change.
//
// It reads the BUILT site rather than the Markdown, for two reasons. The build is where a link's
// final URL exists (locale prefixes, slugs, trailing slashes), and reading the source would make the
// check agree with the source about a mistake they both contain. Every same-origin href in every
// built page must land on a page the build also produced.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

if (!existsSync(dist)) {
  console.error('check-internal-links: no dist/ — run `astro build` first (this check reads the built site).')
  process.exit(1)
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { out.push(...walk(p)); continue }
    if (name.endsWith('.html')) out.push(p)
  }
  return out
}

const pages = walk(dist)
// Every URL the build can serve: /a/b/ comes from dist/a/b/index.html, /a/b.html from itself.
const served = new Set()
for (const p of pages) {
  const rel = p.slice(dist.length).replace(/\\/g, '/')
  served.add(rel.replace(/index\.html$/, ''))
  served.add(rel)
}

const problems = []
let checked = 0
for (const p of pages) {
  const from = p.slice(dist.length)
  const html = readFileSync(p, 'utf8')
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1]
    // Same-origin, page-shaped links only: not mailto/http/anchors, and not asset paths the build
    // emits for its own machinery (pagefind, images, fonts).
    if (!href.startsWith('/')) continue
    if (/^\/(pagefind|_astro|favicon|brand|fonts|images|screenshots)\b/.test(href)) continue
    if (/\.(png|jpe?g|svg|webp|woff2?|css|js|json|xml|txt|ico|pdf)$/i.test(href)) continue
    const path = href.split('#')[0].split('?')[0]
    if (!path || path === '/') continue
    checked += 1
    const withSlash = path.endsWith('/') ? path : path + '/'
    if (!served.has(withSlash) && !served.has(path) && !served.has(path + '.html')) {
      problems.push(`${from} → ${href}`)
    }
  }
}

// An empty walk is a broken check, not a clean site (#719).
if (pages.length === 0) problems.push('dist/ contains no pages — nothing was checked')
if (checked === 0) problems.push('no internal links were examined — the matcher stopped working')

if (problems.length) {
  console.error(`check-internal-links FAILED — ${problems.length} link(s) point at nothing:`)
  for (const p of problems.slice(0, 40)) console.error('  - ' + p)
  if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`)
  process.exit(1)
}
console.log(`check-internal-links OK — ${checked} internal link(s) across ${pages.length} built page(s), all resolve`)
