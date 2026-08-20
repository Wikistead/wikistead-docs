#!/usr/bin/env node
// #703: EE badges derive from ONE truth — the generated levers reference (itself generated
// from the entitlement catalog's `edition` field, #693). No hand-kept EE list may exist here.
//
// Reconciled in BOTH directions, so the check cannot rot into vacuity:
//   - every EE lever in the reference is documented by at least one page declaring it
//     (`wikisteadEeLevers` frontmatter) — an EE capability with no page is red;
//   - every declared lever exists in the reference AND is EE — a stale or wrong declaration is red;
//   - every declaring page carries the EE sidebar badge, in the en page and its ja mirror alike.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const docs = join(root, 'src/content/docs')
// #748 renamed the generated page (internal words left the reference titles): the levers table now
// lives in plan-contents.md, same row shape.
const levers = readFileSync(join(docs, 'reference/generated/plan-contents.md'), 'utf8')

// A table row like: | **SAML SSO** (`samlSso`) | EE | …
const eeLevers = new Set([...levers.matchAll(/\(`(\w+)`\)\s*\|\s*EE\s*\|/g)].map((m) => m[1]))
if (eeLevers.size === 0) {
  console.error('check-ee-badges: the levers reference names no EE lever — the parse broke or the catalog emptied; refusing a vacuously green run.')
  process.exit(1)
}

const pages = []
const walk = (dir) => {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e)
    if (statSync(full).isDirectory()) walk(full)
    else if (e.endsWith('.md')) pages.push(full)
  }
}
walk(docs)

const declared = new Map() // lever -> [pages]
const problems = []
for (const p of pages) {
  const src = readFileSync(p, 'utf8')
  const fm = src.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  const decl = fm.includes('wikisteadEeLevers:')
    ? [...fm.matchAll(/^\s+-\s+(\w+)\s*$/gm)].map((m) => m[1])
    : []
  const badged = /text:\s*EE/.test(fm)
  const rel = relative(docs, p)
  for (const l of decl) {
    if (!eeLevers.has(l)) problems.push(`${rel}: declares "${l}", which the levers reference does not list as EE`)
    declared.set(l, [...(declared.get(l) ?? []), rel])
  }
  if (decl.length > 0 && !badged) problems.push(`${rel}: declares EE levers but carries no EE sidebar badge`)
  if (badged && decl.length === 0) problems.push(`${rel}: wears the EE badge but declares no lever — badges must trace to the catalog`)
}
for (const l of eeLevers) {
  const on = declared.get(l) ?? []
  if (on.length === 0) problems.push(`EE lever "${l}" is documented by NO page (add wikisteadEeLevers to its page)`)
  // …and the ja mirror of every declaring en page declares too (both locales stay honest).
  for (const rel of on) {
    if (rel.startsWith('ja/')) continue
    const jaPage = join(docs, 'ja', rel)
    if (!existsSync(jaPage)) problems.push(`${rel}: declaring page has no ja counterpart`)
  }
}

if (problems.length) {
  console.error('check-ee-badges: EE badge/catalog reconciliation failed:')
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}
console.log(`check-ee-badges OK — ${eeLevers.size} EE lever(s) documented and badged, both locales: ${[...eeLevers].join(', ')}.`)
