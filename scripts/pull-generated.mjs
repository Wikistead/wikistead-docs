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
// #748 (owner ruling): the pages land in `reference/` itself. `generated/` described HOW they are
// made, which is our concern, not the reader's — and it pushed every one of these pages behind a
// word that tells them nothing about the contents. That they are generated is worth saying, so each
// page says it, in a sentence, where it reads as the reassurance it is.
const DEST = join(root, 'src/content/docs/reference')
const sourceTag = existsSync(join(root, 'SOURCE_TAG')) ? readFileSync(join(root, 'SOURCE_TAG'), 'utf8').trim() : null

// Wrap a pulled Markdown file as a Starlight page (the generated files carry an H1, not frontmatter).
function toPage(src, dest) {
  const raw = readFileSync(src, 'utf8')
  // The H1 sits below the AUTO-GENERATED banner comment — find it anywhere, hoist it to the title.
  const m = raw.match(/^#\s+(.+)$/m)
  const title = m ? m[1] : 'Generated reference'
  const body = m ? raw.replace(m[0], '') : raw
  // #748 (owner ruling): the page SAYS it is generated, rather than living behind a folder called
  // `generated/`. The folder told the reader how we make the page — our concern, and a word that gave
  // them no clue what was inside. Said here instead, it reads as what it actually is: a reason to
  // trust the page, because it cannot drift from the product without CI noticing.
  const provenance = ':::note\nThis page is generated from the product\u2019s source, so it cannot drift from what the software actually does.\n:::'
  writeFileSync(dest, `---\ntitle: ${JSON.stringify(title)}\n---\n\n${provenance}\n${body}`)
}

// #706: the brand kit rides the same pull — tokens to the stylesheet layer, the mark to public/
// and the logo slot, the faces to public/brand/fonts (self-hosted, licences alongside). The docs
// therefore wear the RELEASED product's look; a hand copy would rot the day a token changes.
//
// #1255: brand pieces are `required` — modeled on lp's own pull-source.mjs (#696 §5), which has
// carried the same flag on the same pieces since #706. A missing REQUIRED piece is refused loudly
// (`process.exit(1)`) rather than silently falling back to whatever was last committed, which is how
// #1218's 3.2MB of retired UDEV Gothic files sat frozen here for weeks after the product dropped them
// — nothing ever went red. Every tag this pulls from today postdates #706 (the brand kit's own
// introduction), so the historical "pre-#706 source has no brand dir" case this leniency was written
// for no longer occurs in practice; `admin-tabs.json`/`screen-vocabulary.json` are NOT brand pieces
// (a CE-only source tree can legitimately lack them) and stay lenient.
const BRAND = [
  { from: 'brand/tokens.css', to: 'src/styles/brand-tokens.css', required: true },
  { from: 'brand/favicon.svg', to: 'public/favicon.svg', required: true },
  { from: 'brand/icon-solid.svg', to: 'src/assets/icon-solid.svg', required: true },
  // #709: the HEADER mark is the tile-less line mark, the same asset the
  // product's own header uses. `icon-solid.svg` carries a filled `<rect>` tile inside the asset, so
  // no amount of CSS removes the box the user asked about — the fix is choosing the other mark. It
  // rides the kit rather than being hand-copied, so it cannot drift from the released product.
  { from: 'brand/favicon.svg', to: 'src/assets/mark.svg', required: true },
  // #1223: UDEV Gothic (2 woff2 + its LICENSE) is gone — #1181 replaced it with Sarasa Fixed J as the
  // product's --font-body-vim face, and no docs-site stylesheet ever selected the "UDEV Gothic" family
  // (brand.css's @font-face for it was dead CSS pointing at these dead files). Not replaced with a
  // Sarasa entry: nothing here needs it — --wks-font-mono binds to "Wikistead Mono" alone.
  { from: 'brand/fonts/wikistead-mono-Regular.woff2', to: 'public/brand/fonts/wikistead-mono-Regular.woff2', required: true },
  { from: 'brand/fonts/wikistead-mono-Bold.woff2', to: 'public/brand/fonts/wikistead-mono-Bold.woff2', required: true },
  { from: 'brand/fonts/LICENSE-SourceCodePro.txt', to: 'public/brand/fonts/LICENSE-SourceCodePro.txt', required: true },
  // #731: the admin console's tab labels, as the PRODUCT spells them. Not a page — a table the
  // build checks the admin pages against (scripts/check-admin-tab-names.mjs), so the documentation
  // can be wrong about a name and be told so, instead of the two vocabularies drifting in separate
  // repositories the way they did.
  { from: 'admin-tabs.json', to: 'src/content/generated/admin-tabs.json', required: false },
  // #741: each screen's ACTIONS and STATES, as the product spells them. #731's table covers the tab
  // names and nothing below them — the button a reader must press, the badge that says what state a
  // row is in. Same reason it is pulled rather than written here: the words move when the product
  // renames them, and a copy would go red for being right.
  { from: 'screen-vocabulary.json', to: 'src/content/generated/screen-vocabulary.json', required: false },
]

function importFrom(dir, label) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  if (files.length === 0) throw new Error(`${dir} has no generated docs — refusing a silently empty reference`)
  mkdirSync(DEST, { recursive: true })
  for (const f of files) toPage(join(dir, f), join(DEST, f))
  for (const b of BRAND) {
    const src = join(dir, b.from)
    if (!existsSync(src)) {
      if (b.required) {
        console.error(`pull-generated: ${b.from} missing at ${label} — the brand kit is incomplete. Refusing a partial pull.`)
        process.exit(1)
      }
      console.log(`pull-generated: ${b.from} absent at source (a CE-only tree may legitimately lack it) — keeping the committed copy`)
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
