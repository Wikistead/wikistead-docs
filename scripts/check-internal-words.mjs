#!/usr/bin/env node
// #748 (ruled once, re-opened once): the documentation does not hand the reader our vocabulary.
//
// The rename that started this moved the page TITLES and the URLs — `Entitlement levers` became
// `What each plan includes`, `reference/generated/` lost its directory — and the first check written
// for it read the built HTML for `generated` in URLs. That was zero, and it was zero honestly; it
// just was not the acceptance. **The words a reader clicks on** were untouched: fourteen links still
// said "entitlement levers" and "domain events", including the two on the reference index, which is
// the first page anybody lands on. A check that reads addresses passes straight through the prose.
//
// So this one reads what a person reads: link text and body copy, both locales.
//
// WHAT IS EXEMPT, and why it is not a loophole:
//
//   * GENERATED pages carry the product's own words because they ARE the product's words — the
//     lever catalogue's summaries, the environment catalogue's sentences. Rewording them means
//     editing the generator in the source repository, which is a different change in a different
//     tree. They are found by the stamp the pull puts on every page it writes (the same marker the
//     translation check uses, and for the same reason: the generators disagree about their own
//     banner wording, so reading the banner would be reading three spellings).
//   * A SOURCE ATTRIBUTION (`entitlements/src/catalog.ts`) names a file. Renaming a file in prose
//     would make the pointer wrong, which is worse than the jargon.
//
// Anything else is a finding. `pnpm check:internal-words` (runs inside `pnpm build`).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = join(root, 'src/content/docs')

/**
 * The stamp `pull-generated` writes onto every page it brings over. Exported for #759 / ADR-244
 * §3.5's declaration checker, which needs the identical page-level generated-page exemption this
 * check already has — importing the constant means the two cannot name the stamp differently and
 * drift apart the way the two frontmatter parsers almost did (ADR-244 §3.5, condition (a)).
 */
export const GENERATED_MARK = 'This page is generated from the product'

/**
 * Words that belong to the implementation, with what a reader is offered instead.
 *
 * Kept short on purpose: a long list of banned words becomes a thesaurus nobody reads, and the ones
 * here are the ones a reader has actually met on this site.
 */
const INTERNAL = [
  { re: /\bentitlements?\b/i, use: '"what the plan includes" / 「プランに含まれるもの」' },
  { re: /\bdomain events?\b/i, use: '"webhook events" / 「Webhook のイベント」' },
  { re: /ドメインイベント/, use: '「Webhook のイベント」' },
  { re: /エンタイトルメント/, use: '「プランに含まれるもの」' },
  // `lever` is the catalogue's word for one switchable feature. A reader has no such unit.
  { re: /\b(feature|plan) levers?\b/i, use: '"feature" / 「機能」' },
  { re: /\blevers?\b/i, use: '"feature" / 「機能」' },
]

/** A line that only points at a source file is naming a path, not using a word. */
const IS_ATTRIBUTION = /src\/[a-z/-]+\.ts|packages\/[a-z-]+\//

const pages = []
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry)
    if (statSync(abs).isDirectory()) { walk(abs); continue }
    if (!/\.(md|mdx)$/.test(entry)) continue
    pages.push(abs)
  }
}
walk(DOCS)

let generated = 0
const findings = []
for (const abs of pages) {
  const text = readFileSync(abs, 'utf8')
  if (text.includes(GENERATED_MARK)) { generated += 1; continue }
  const rel = relative(DOCS, abs)
  text.split('\n').forEach((line, i) => {
    if (IS_ATTRIBUTION.test(line)) return
    for (const { re, use } of INTERNAL) {
      const m = re.exec(line)
      if (!m) continue
      findings.push(`${rel}:${i + 1} says "${m[0]}" to the reader — say ${use}`)
      break
    }
  })
}

// An empty walk agrees with everything (#719). Both numbers are printed so a run that stopped
// reading is visible as a number rather than as a pass.
if (pages.length === 0) {
  console.error('check-internal-words: no pages walked — the content tree moved and this check measured nothing.')
  process.exit(1)
}
if (generated === 0) {
  console.error('check-internal-words: no generated page was recognised — the pull stamp changed, and every generated page is about to be reported as prose.')
  process.exit(1)
}

if (findings.length > 0) {
  for (const f of findings) console.error(`check-internal-words: ${f}`)
  console.error(`\n${findings.length} place(s) where the reader is handed our vocabulary (#748).`)
  process.exit(1)
}

console.log(`check-internal-words OK — ${pages.length - generated} authored page(s) read, ${generated} generated page(s) exempt.`)
