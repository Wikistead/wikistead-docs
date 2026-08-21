#!/usr/bin/env node
// #734 / ADR-237 §2.3: the declared areas are actually there, and nothing is filed nowhere.
//
// Two directions, both measured rather than argued:
//
//   1. Every page in `PROMISED_PAGES` exists in the ROOT locale. A translation missing it is
//      check-translation-coverage's business; an area with no page AT ALL is this one's.
//   2. Every content page lives in a section `SECTIONS` declares. Dropping a file into a new
//      directory currently creates a sidebar group silently, because every section is
//      `autogenerate` — so the new directory has to be declared before its pages appear.
//
// The limitation is in ia-spine.mjs, where the list lives, and it is not a small one: nothing here
// can notice an area nobody thought of. That is why the file says so instead of this check quietly
// implying coverage it cannot deliver.
//
//   pnpm check:ia-spine     (runs inside `pnpm build`)
import { readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROOT_LOCALE, TRANSLATIONS } from './locales.mjs'
import { SECTIONS, PROMISED_PAGES } from './ia-spine.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = join(root, 'src/content/docs')

const problems = []

// ── 1. the promised pages exist ────────────────────────────────────────────────────────────────
for (const { page, why } of PROMISED_PAGES) {
  if (!existsSync(join(DOCS, page))) {
    problems.push(`${page} is promised by the IA spine and does not exist (${ROOT_LOCALE}) — ${why}`)
  }
}

// ── 2. every page belongs to a declared section ────────────────────────────────────────────────
const declared = new Set(SECTIONS.map((s) => s.dir))
const pages = []
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry)
    if (statSync(abs).isDirectory()) {
      // A translation mirrors the root tree; its sections are the root's sections.
      if (dir === DOCS && TRANSLATIONS.includes(entry)) { walk(abs); continue }
      walk(abs)
      continue
    }
    if (!/\.(md|mdx)$/.test(entry)) continue
    pages.push(relative(DOCS, abs))
  }
}
walk(DOCS)

for (const page of pages) {
  const parts = page.split('/')
  // Strip the locale prefix, then take the section directory. A page at the very top of the tree
  // (index.mdx) is the landing page and belongs to no section by design.
  const rest = TRANSLATIONS.includes(parts[0]) ? parts.slice(1) : parts
  if (rest.length < 2) continue
  const section = rest[0]
  if (!declared.has(section)) {
    problems.push(`${page} sits in the undeclared section "${section}" — add it to SECTIONS in scripts/ia-spine.mjs, or file the page in an existing one`)
  }
}

// A walk that came back empty would satisfy both rules above perfectly (#719's lesson), so the
// numbers are printed and an empty one is an error rather than a pass.
if (pages.length === 0) {
  console.error('check-ia-spine: the content walk found no pages at all — the walk is broken, not the coverage.')
  process.exit(1)
}

if (problems.length > 0) {
  for (const p of problems) console.error(`check-ia-spine: ${p}`)
  console.error(`\n${problems.length} IA problem(s). See ADR-237 §2.3.`)
  process.exit(1)
}

console.log(
  `check-ia-spine OK — ${PROMISED_PAGES.length} promised page(s) present, ` +
  `${pages.length} page(s) across ${SECTIONS.length} declared section(s).`,
)
