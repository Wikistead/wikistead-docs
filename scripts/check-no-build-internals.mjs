#!/usr/bin/env node
// #747: the documentation does not explain itself to the reader.
//
// The owner's ruling, at a page that opened by saying its table was measured rather than written and
// that a mismatch turns the build red: internal workings do not belong in front of a reader.
// The machinery was right; publishing it was not.
//
// It was never one page. The reference index opened with "generated, not written", two pages
// explained that an event list comes from released code, and the generated references carried
// SIXTY-EIGHT ticket and ADR numbers in their visible tables — `(#435 / ADR-169, EE)` sitting in a
// cell a customer reads. #748 is the same family arriving through a page's NAME.
//
// So this walks what a reader sees and refuses two shapes:
//
//   1. HOW THIS SITE IS BUILT — "generated from the released code", "the build goes red", and
//      their Japanese forms (the patterns below). A reader wants to know what the product does; who assembled the sentence is ours.
//   2. OUR OWN FILING — `#123`, `ADR-045`. Those name a ticket in a tracker the reader cannot open.
//
// ⚠️ WHAT IT DELIBERATELY ALLOWS, so nobody widens it by accident:
//   * HTML comments and frontmatter — not rendered, and the generated files carry a "do not edit by
//     hand" banner that developers need.
//   * A PRODUCT fact that happens to use the word "generated": the page-list macro generates a list,
//     and the MCP syntax reference is generated from the editor's own registry — that one is a
//     guarantee to the reader, not a note about our build.
//   * A version number or a heading like `H1-H3`. The pattern is anchored to `#` followed by digits
//     with a word boundary before it, which is how a ticket is written here.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const DOCS = join(root, 'src/content/docs')

/** Sentences about how this documentation is made. */
const BUILD_TALK = [
  /generated,\s*not written/i,
  /generated (?:straight )?from the (?:released|product'?s?) code/i,
  /extracted from the (?:released|product'?s?) code/i,
  /(?:turns?|goes) the build red/i,
  /(?:this page|the table) (?:is )?measured rather than written/i,
  /コードから生成/,
  /ビルド時に(?:抽出|生成)/,
  /ビルドが赤/,
  /測ったものです/,
]

/** Our own filing, in text a reader sees. */
const TICKET = /(?:^|[\s(（[「])#\d{2,}\b/
const ADR = /\bADR-\d{2,}\b/

/**
 * What a reader sees: the body, minus frontmatter and HTML comments.
 *
 * The generated references keep their "AUTO-GENERATED — DO NOT EDIT BY HAND" banner, which is a
 * comment and reaches nobody's screen. Stripping it here is the difference between a rule about the
 * reader and a rule about the file.
 */
function visible(text) {
  return text
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

/** A product fact that uses the word, kept with its reason attached. */
const ALLOWED = [
  { file: 'reference/macro-notation.md', why: 'the MCP reference is generated from the editor\'s own registry — a guarantee to the reader about the PRODUCT' },
  { file: 'ja/integrations/mcp.md', why: 'same guarantee, in Japanese' },
  { file: 'ja/editor/page-lists.md', why: 'the page-list macro generates a list — a product feature' },
  { file: 'editor/page-lists.md', why: 'same' },
]

const pages = []
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(md|mdx)$/.test(entry)) pages.push(p)
  }
}
walk(DOCS)

const problems = []
for (const p of pages) {
  const rel = relative(DOCS, p)
  const allowed = ALLOWED.find((a) => a.file === rel)
  const body = visible(readFileSync(p, 'utf8'))
  body.split('\n').forEach((line, i) => {
    const where = `${rel}:${i + 1}`
    if (!allowed && BUILD_TALK.some((rx) => rx.test(line))) {
      problems.push(`${where} tells the reader how this site is built: ${line.trim().slice(0, 110)}`)
    }
    if (TICKET.test(line) || ADR.test(line)) {
      problems.push(`${where} shows our own filing (a ticket or ADR number): ${line.trim().slice(0, 110)}`)
    }
  })
}

// A walk that reads nothing agrees with every possible state of the tree.
if (pages.length < 50) {
  console.error(`FAIL: only ${pages.length} page(s) walked — the scan is broken, not the docs clean`)
  process.exit(1)
}

if (problems.length) {
  for (const p of problems) console.error(`FAIL: ${p}`)
  console.error('')
  console.error('A reader wants to know what the product does. How the sentence got here, and which ticket')
  console.error('asked for it, are ours. If a generated page carries the number, the fix is in the source')
  console.error("repository's catalog prose — the page is rewritten from it on every build.")
  process.exit(1)
}

console.log(`OK: ${pages.length} page(s) walked, no build-internals and no ticket numbers in what a reader sees (${ALLOWED.length} product-fact exemption(s), each with a reason).`)
