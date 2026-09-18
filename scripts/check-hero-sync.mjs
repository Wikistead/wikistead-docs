#!/usr/bin/env node
// #1432 (following #1397's real incident): the docs homepage's reader-facing key
// claims (hero.title, hero.tagline, description) can drift between en and ja with nothing catching it
// — #718 updated the ja hero.title first, and en stayed on the retired copy until #1397 fixed it by
// hand, weeks later, when the owner happened to look at the live site.
//
// This is deliberately NOT a content-equality check — #718's own ruling is that ja prose is not a
// literal translation of en, so comparing the two languages' TEXT to each other would conflict with
// that ruling directly. Instead, modeled on standard translation-staleness tooling (gettext's fuzzy
// match, Crowdin's last-synced-source): src/content/hero-sync.json records the text BOTH languages
// carried the last time a human jointly reviewed them as saying the same thing. This check compares
// each language's CURRENT text against its own recorded value — a mismatch means "this field changed
// since the last joint review" (go re-read the pair and confirm, or update it), never "these two
// languages disagree" (#718 already settled that they are allowed to).
//
// A field with no recorded entry at all is a REFUSAL, not a pass — #892's "empty is not a pass" shape.
// That is deliberate for hero.tagline as of this check's own landing: the en/ja pair was never jointly
// reviewed (measured during design review — the ja tagline makes two extra product-pillar claims,
// roughly "links connect pages" and "publish anywhere," that the en tagline does not make), so this
// check starts red for that one field on purpose, naming the field a human needs to read rather than
// silently declaring it fine.
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
export const SYNC_PATH = join(root, 'src/content/hero-sync.json')

// The pages this check covers — today just the homepage hero, the one #1397 actually measured. A page
// added here needs both locale paths; nothing walks a directory guessing at pairs (unlike #1407's
// prose-citation layer, whose job IS to find every page — this one's job is to hold a short, curated
// list of pages whose reader-facing claims are considered marketing-critical enough to track).
export const PAGES = {
  index: { en: 'src/content/docs/index.mdx', ja: 'src/content/docs/ja/index.mdx' },
}

// One level of nesting only (`hero.tagline`), matching check-screen-vocabulary.mjs's own "no YAML
// dependency for one nested list" convention — a hand-rolled parser kept intentionally small rather
// than pulling in a YAML library for three known fields.
export const FIELDS = ['hero.title', 'hero.tagline', 'description']

/** The frontmatter block as raw text (between the opening and closing `---`), or null if unclosed. */
export function frontmatter(text) {
  return /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? null
}

function unquote(raw) {
  const s = raw.trim()
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replace(/\\"/g, '"')
  if (s.length >= 2 && s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1).replace(/''/g, "'")
  return s
}

/**
 * A single-line scalar value at `path` (`title`, or one level deep as `hero.tagline`) inside a
 * frontmatter block — quoted or bare. Known scope boundary (documented, not silently assumed): a
 * block-scalar (`>`/`|`) value is not read (returns null, which this check's caller treats as a
 * refusal, not a silent skip — see #1407's own quoted/block-scalar parsing for the harder version of
 * this problem, not reused here because these three fields are short marketing lines that have never
 * needed a block scalar in this tree; if one ever does, this returns null and the check goes red
 * naming the field, which is the correct failure direction).
 */
export function extractScalar(fm, path) {
  if (fm == null) return null
  const lines = fm.split('\n')
  const [top, nested] = path.split('.')
  if (!nested) {
    for (const line of lines) {
      const m = new RegExp(`^${top}:[ \\t]?(.*)$`).exec(line)
      if (m) return unquote(m[1])
    }
    return null
  }
  const start = lines.findIndex((l) => new RegExp(`^${top}:\\s*$`).test(l))
  if (start < 0) return null
  for (const line of lines.slice(start + 1)) {
    if (!/^\s+\S/.test(line)) break // dedented back out of the block
    const m = new RegExp(`^\\s+${nested}:[ \\t]?(.*)$`).exec(line)
    if (m) return unquote(m[1])
  }
  return null
}

/**
 * Runs the check against `root` (a docs-site tree) and `syncPath` (the hero-sync.json to check
 * against) — parameterised so tests can point both at a disposable fixture, per this project's own
 * "a pin must run the shipped code" rule (#1173) rather than re-deriving the logic.
 */
export function checkHeroSync({ treeRoot = root, syncPath = SYNC_PATH } = {}) {
  const problems = []
  let checked = 0
  if (!existsSync(syncPath)) {
    return { checked: 0, problems: [`no ${syncPath} — nothing recorded to check against`] }
  }
  const sync = JSON.parse(readFileSync(syncPath, 'utf8'))
  for (const [pageKey, locales] of Object.entries(PAGES)) {
    const enPath = join(treeRoot, locales.en)
    const jaPath = join(treeRoot, locales.ja)
    if (!existsSync(enPath) || !existsSync(jaPath)) continue // page pair not in this tree (fixture scope)
    const enFm = frontmatter(readFileSync(enPath, 'utf8'))
    const jaFm = frontmatter(readFileSync(jaPath, 'utf8'))
    for (const field of FIELDS) {
      checked++
      const enVal = extractScalar(enFm, field)
      const jaVal = extractScalar(jaFm, field)
      if (enVal == null || jaVal == null) {
        problems.push(`${pageKey}.${field}: could not read this field from ${enVal == null ? 'the en' : 'the ja'} page's frontmatter`)
        continue
      }
      const recorded = sync[pageKey]?.[field]
      if (!recorded) {
        problems.push(`${pageKey}.${field}: never jointly reviewed — no entry in ${syncPath.split('/').slice(-1)}. Read the en/ja pair together and add one.\n    en: ${enVal}\n    ja: ${jaVal}`)
        continue
      }
      if (recorded.en !== enVal) {
        problems.push(`${pageKey}.${field}: en text changed since the last joint review.\n    recorded: ${recorded.en}\n    current:  ${enVal}`)
      }
      if (recorded.ja !== jaVal) {
        problems.push(`${pageKey}.${field}: ja text changed since the last joint review.\n    recorded: ${recorded.ja}\n    current:  ${jaVal}`)
      }
    }
  }
  return { checked, problems }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { checked, problems } = checkHeroSync()
  if (checked === 0) {
    console.error('check-hero-sync: checked zero fields — an empty check is not a pass')
    process.exit(1)
  }
  if (problems.length) {
    console.error(`check-hero-sync FAILED — ${problems.length} of ${checked} field(s) need attention:`)
    for (const p of problems) console.error('  - ' + p)
    process.exit(1)
  }
  console.log(`check-hero-sync OK — ${checked} field(s) checked, all in sync with their last joint review.`)
}
