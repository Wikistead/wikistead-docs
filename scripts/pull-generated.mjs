#!/usr/bin/env node
// Pull the generated references from the source repository (ADR-225 §3).
//
// The site documents a RELEASED version: SOURCE_TAG (file at the repo root, `vX.Y.Z`) pins the
// tag the build pulls docs/generated/*.md from. Modes, in order:
//   1. SOURCE_REPO_DIR set (or a parent checkout present, the dev-overlay position): copy from
//      that working tree — the dev loop, documented as such in the output.
//   2. SOURCE_TAG resolvable in a SOURCE_REPO_URL clone: shallow-fetch the tag, copy, and verify
//      the pulled `.source-version` marker equals the tag's version (torn-pull guard). The marker
//      is emitted by the source repo from #180 — until that lands, its absence is reported and
//      tolerated (the guard arms itself the day the marker exists).
//   3. Neither: keep the committed snapshot under src/content/docs/reference/ and say so loudly.
// Never silent — every mode prints what it did.
import { cpSync, existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DEST = join(root, 'src/content/docs/reference/generated')
const sourceTag = existsSync(join(root, 'SOURCE_TAG')) ? readFileSync(join(root, 'SOURCE_TAG'), 'utf8').trim() : null

// Wrap a pulled Markdown file as a Starlight page (the generated files carry an H1, not frontmatter).
function toPage(src, dest) {
  const raw = readFileSync(src, 'utf8')
  // The H1 sits below the AUTO-GENERATED banner comment — find it anywhere, hoist it to the title.
  const m = raw.match(/^#\s+(.+)$/m)
  const title = m ? m[1] : 'Generated reference'
  const body = m ? raw.replace(m[0], '') : raw
  writeFileSync(dest, `---\ntitle: ${JSON.stringify(title)}\n---\n\n${body}`)
}

// #706: the brand kit rides the same pull — tokens to the stylesheet layer, the mark to public/
// and the logo slot, the faces to public/brand/fonts (self-hosted, licences alongside). The docs
// therefore wear the RELEASED product's look; a hand copy would rot the day a token changes.
const BRAND = [
  { from: 'brand/tokens.css', to: 'src/styles/brand-tokens.css' },
  { from: 'brand/favicon.svg', to: 'public/favicon.svg' },
  { from: 'brand/icon-solid.svg', to: 'src/assets/icon-solid.svg' },
  { from: 'brand/fonts/udevgothic-Regular.woff2', to: 'public/brand/fonts/udevgothic-Regular.woff2' },
  { from: 'brand/fonts/udevgothic-Bold.woff2', to: 'public/brand/fonts/udevgothic-Bold.woff2' },
  { from: 'brand/fonts/wikistead-mono-Regular.woff2', to: 'public/brand/fonts/wikistead-mono-Regular.woff2' },
  { from: 'brand/fonts/wikistead-mono-Bold.woff2', to: 'public/brand/fonts/wikistead-mono-Bold.woff2' },
  { from: 'brand/fonts/LICENSE-UDEVGothic.txt', to: 'public/brand/fonts/LICENSE-UDEVGothic.txt' },
  { from: 'brand/fonts/LICENSE-SourceCodePro.txt', to: 'public/brand/fonts/LICENSE-SourceCodePro.txt' },
]

function importFrom(dir, label) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  if (files.length === 0) throw new Error(`${dir} has no generated docs — refusing a silently empty reference`)
  mkdirSync(DEST, { recursive: true })
  for (const f of files) toPage(join(dir, f), join(DEST, f))
  for (const b of BRAND) {
    const src = join(dir, b.from)
    if (!existsSync(src)) {
      // Pre-#706 sources have no brand dir; the committed copies stay (loud, not fatal).
      console.log(`pull-generated: brand piece missing at source (${b.from}) — keeping the committed copy`)
      continue
    }
    mkdirSync(join(root, b.to, '..'), { recursive: true })
    cpSync(src, join(root, b.to))
  }
  const marker = join(dir, '.source-version')
  if (existsSync(marker)) {
    const v = readFileSync(marker, 'utf8').trim()
    if (sourceTag && `v${v}` !== sourceTag) {
      console.error(`pull-generated: torn pull — marker says ${v}, SOURCE_TAG says ${sourceTag}`)
      process.exit(1)
    }
    console.log(`pull-generated: ${files.length} file(s) from ${label} (source version ${v})`)
  } else {
    console.log(`pull-generated: ${files.length} file(s) from ${label} (no .source-version marker yet — #180 emits it; the torn-pull guard arms itself then)`)
  }
}

const devTree = process.env.SOURCE_REPO_DIR ?? join(root, '..', 'docs', 'generated')
if (existsSync(devTree)) {
  importFrom(devTree, `the dev checkout (${devTree})`)
} else if (sourceTag && process.env.SOURCE_REPO_URL) {
  const tmp = mkdtempSync(join(tmpdir(), 'wikistead-docs-pull-'))
  execFileSync('git', ['clone', '--depth', '1', '--branch', sourceTag, process.env.SOURCE_REPO_URL, tmp], { stdio: 'inherit' })
  importFrom(join(tmp, 'docs', 'generated'), `${process.env.SOURCE_REPO_URL}@${sourceTag}`)
} else if (existsSync(DEST) && readdirSync(DEST).length > 0) {
  console.log('pull-generated: no source available — KEEPING the committed snapshot (set SOURCE_REPO_URL + SOURCE_TAG, or build from the dev overlay).')
} else {
  console.error('pull-generated: no source and no committed snapshot — the reference section would be empty. Refusing.')
  process.exit(1)
}
