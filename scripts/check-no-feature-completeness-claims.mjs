#!/usr/bin/env node
// #1291 (third instance of the #1174/#1175 family): shipped prose must never say a self-hosted
// Community build has "every feature" / "all features" unlimited. Unlimited is a CEILING on a
// resource LIMIT (no artificial cap to unlock); it says nothing about FEATURE AVAILABILITY. Five
// Cloud-only levers (SAML SSO, SCIM, the audit log, Access Transparency, analytics) have no
// enforcement code in a Community build at all — packages/ee-server, not part of the AGPL CE
// distribution — so "every feature is unlimited on self-host" reads as a promise the build cannot
// keep, regardless of any limit. #1174 fixed this in the plan matrix, #1175 in the self-host
// billing/usage tab copy; each fix was scoped to the ONE place it was found rather than to the
// sentence shape, and a third instance turned up in docs prose neither of those touched. This check
// is the sentence-shape guard those two were missing: it scans every shipped page (both locales),
// joining blank-line-separated paragraphs into one unit first (the historical defect's own corrected
// replacement wraps across two source lines — a strict single-line scan would miss both shapes), for
// the co-occurrence of a completeness claim and "unlimited" (English, or its Japanese equivalent per
// UNLIMITED_JA), and refuses if it finds one.
//
// Two distinct completeness shapes, added after #1291's own second design-review rejection
// — the FIRST version of this check used only COMPLETENESS/COMPLETENESS_JA and a strict per-line
// scan, and a scratch-revert of gen-doc.ts's old intro ("Self-hosted Community/Enterprise builds have
// every one of them enabled or unlimited") passed it silently, exit 0):
//   COMPLETENESS: the literal phrase "every feature(s)"/"all feature(s)". Scoped narrowly on purpose
//   — "every CE feature" / "CE-scoped row" (this repo's own corrected wording) does not match, since
//   a qualifier like "CE" breaks the immediately-adjacent word match.
//   PRONOUN_COMPLETENESS: "every one of them" / "all of them" — the historical defect's actual shape,
//   which never says "feature" at all. This pattern alone is NOT sufficient (a sentence about a
//   self-hosted ENTERPRISE build having "every one of them enabled" is legitimately true and stays
//   unflagged — EE genuinely does carry every lever's code); it only fires combined with the
//   paragraph also naming "Community", which is exactly what turns "every one of them" from a true
//   Enterprise-only claim into the false Community-inclusive one.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = join(root, 'src/content/docs')

const COMPLETENESS = /\b(every|all)\s+features?\b/i
const COMPLETENESS_JA = /(すべての機能|全機能)/
const PRONOUN_COMPLETENESS = /\b(every one|all)\s+of\s+them\b/i
const MENTIONS_COMMUNITY = /\bcommunity\b/i
const UNLIMITED = /\bunlimited\b/i
const UNLIMITED_JA = /無制限/

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

const findings = []
for (const abs of pages) {
  const text = readFileSync(abs, 'utf8')
  const rel = relative(DOCS, abs)
  const lines = text.split('\n')
  // Blank-line-separated paragraphs, not raw lines: the historical defect's own corrected
  // replacement wraps its claim across two adjacent source lines with no blank line between them —
  // a strict per-line scan reads each half in isolation and never sees the full sentence.
  let start = 0
  for (let i = 0; i <= lines.length; i++) {
    if (i < lines.length && lines[i].trim() !== '') continue
    if (i > start) {
      // Sentences within the paragraph, not the whole paragraph as one unit: a line-wrapped
      // sentence (no period until it ends) must stay one unit to catch the historical defect's
      // shape, but two DIFFERENT sentences sitting on adjacent lines with no blank line between
      // them (this repo's own corrected replacement text, one sentence about Enterprise and one
      // about Community) must NOT be merged into a false co-occurrence.
      const para = lines.slice(start, i).join(' ')
      for (const sentence of para.split(/(?<=[.!?])\s+/)) {
        const hasCompleteness = COMPLETENESS.test(sentence) || COMPLETENESS_JA.test(sentence)
          || (PRONOUN_COMPLETENESS.test(sentence) && MENTIONS_COMMUNITY.test(sentence))
        const hasUnlimited = UNLIMITED.test(sentence) || UNLIMITED_JA.test(sentence)
        if (hasCompleteness && hasUnlimited) {
          findings.push(`${rel}:${start + 1} claims every/all feature(s) is unlimited on self-host — unlimited is a limit ceiling, not a feature grant (say "every CE feature" / a resource by name instead)`)
        }
      }
    }
    start = i + 1
  }
}

// An empty walk agrees with everything (#719) — a check that read no files is not a pass.
if (pages.length === 0) {
  console.error('check-no-feature-completeness-claims: no pages walked — the content tree moved and this check measured nothing.')
  process.exit(1)
}

if (findings.length > 0) {
  for (const f of findings) console.error(`check-no-feature-completeness-claims: ${f}`)
  console.error(`\n${findings.length} place(s) claim self-host feature completeness from an unlimited resource limit (#1291).`)
  process.exit(1)
}

console.log(`check-no-feature-completeness-claims OK — ${pages.length} page(s) scanned, no feature-completeness claim riding on "unlimited".`)
