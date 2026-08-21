// #718: the Japanese docs keep the #585 ruling and the #671 vocabulary, by machine.
//
// WHY A DISCOVERY CHECK, not a list of files: the 181 dashes this retired were written page by page
// while a pin existed one directory away (apps/web's no-dash-copy-585) that simply did not look here.
// A checked-in list of "pages we cleaned" would have the same blind spot the day page 43 arrives. So
// the walk starts at the TREE and every `.md`/`.mdx` under it is in scope, forever.
//
// SCOPE IS ja ONLY (#718, the owner's ruling): English prose keeps its em
// dashes, because in English they are ordinary. A check that also scanned en would quietly overturn
// that ruling, so the walk is rooted at the ja directory and cannot reach en at all.
//
// `reference/**` is excluded: those pages are pulled from the product and rewriting them
// here would be undone by the next pull (and the generator, not this site, owns their wording).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JA_TERMS, BANNED_PUNCTUATION } from './ja-glossary.mjs'
import { TRANSLATIONS, assertLocalesMatchConfig } from './locales.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const DOCS = join(root, 'src/content/docs')
const EXCLUDE = /(^|\/)reference\/generated\//

// #713 / ADR-228: the prose rules are PER LANGUAGE, because they are a language's rules — the #585
// punctuation ruling and the #671 vocabulary are about Japanese, and applying them to German would be
// nonsense. So the walk covers every configured translation, and a translation with no rule set yet is
// REPORTED rather than silently skipped: "nobody wrote rules for French" is a fact worth seeing on the
// day French arrives, not a gap that looks like a pass.
const RULES = { ja: { terms: JA_TERMS, punctuation: BANNED_PUNCTUATION, structure: true } }

// #718: the families the second read-through found, which no word list can catch.
//
// (1) A heading that is a whole sentence. The site's headings are noun phrases, except where a
//     translated "You can verify…" or "Links that make themselves" came through as one, and then the
//     sidebar and the table of contents carry two styles at once. The rule is about the last few
//     characters, so it is checkable; the fix never is a word swap.
// (2) The EE notice, which is duplicated verbatim in five pages. When it was reworded in one, the
//     other four kept the old sentence — so the check is that they are all the same string, not that
//     they say any particular thing.
const DECLARATIVE_HEADING = /(ます|です)。?$/
const EE_NOTICE_OPEN = /^:::tip\[EE\]\s*$/


function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.mdx?$/.test(p)) out.push(p)
  }
  return out
}

// Prose only. A fenced block is notation (`:::tagged`, a mermaid arrow, a table separator) and a
// frontmatter delimiter is structure — flagging those would train everyone to ignore this check.
// A link's TARGET is not prose: `/ja/reference/plan-contents/` is a route this site
// does not own (the page is generated, and #697's ledger binds the path). Only the visible text is
// judged, so the glossary can ban a word without renaming a URL.
export function stripLinkTargets(line) {
  return line.replace(/\]\([^)]*\)/g, ']()').replace(/`[^`]*`/g, '``')
}

export function proseOf(text) {
  const lines = text.split('\n')
  const out = []
  let inFence = false
  let inFrontmatter = false
  lines.forEach((line, i) => {
    if (i === 0 && line.trim() === '---') { inFrontmatter = true; out.push(''); return }
    if (inFrontmatter) { if (line.trim() === '---') inFrontmatter = false; out.push(''); return }
    if (/^\s*(```|````|~~~)/.test(line)) { inFence = !inFence; out.push(''); return }
    out.push(inFence ? '' : line)
  })
  return out
}

assertLocalesMatchConfig()
const problems = []
const headingProblems = []
const eeNotices = []
const unruled = []
let scanned = 0
for (const locale of TRANSLATIONS) {
  const rules = RULES[locale]
  if (!rules) { unruled.push(locale); continue } // includes both "absent" and the explicit `null`
  const files = walk(join(DOCS, locale)).filter((f) => !EXCLUDE.test(relative(root, f).replace(/\\/g, '/')))
  scanned += files.length
  for (const file of files) {
    const rel = relative(root, file)
    const lines = proseOf(readFileSync(file, 'utf8'))
    lines.forEach((line, i) => {
      for (const { re, name, fix } of rules.punctuation) {
        if (new RegExp(re.source).test(line)) problems.push(`${rel}:${i + 1} ${name} — ${fix}`)
      }
      const visible = stripLinkTargets(line)
      for (const { banned, use, why, re } of rules.terms) {
        // A plain substring by default. `re` is for the few words whose ban has a legitimate
        // exception (a Vim compound carved out of a broader ban — the regex in ja-glossary.mjs).
        const hit = re ? new RegExp(re.source).test(visible) : visible.includes(banned)
        if (hit) problems.push(`${rel}:${i + 1} 「${banned}」→「${use}」（${why}）`)
      }
      if (rules.structure) {
        const heading = /^#{2,}\s+(.*\S)\s*$/.exec(line)
        if (heading && DECLARATIVE_HEADING.test(stripLinkTargets(heading[1]))) {
          headingProblems.push(`${rel}:${i + 1} 見出し「${heading[1]}」が文になっています — 名詞句か体言止めに`)
        }
        if (EE_NOTICE_OPEN.test(line.trim())) eeNotices.push({ where: `${rel}:${i + 2}`, text: (lines[i + 1] ?? '').trim() })
      }
    })
  }
}

// The EE notice: same sentence everywhere, or the rewording only half landed.
if (eeNotices.length > 1) {
  const [first, ...rest] = eeNotices
  for (const n of rest) {
    if (n.text !== first.text) {
      problems.push(`${n.where} EE の断り書きが ${first.where} と違います — 5 ページで同じ 1 文にしてください`)
    }
  }
}
problems.push(...headingProblems)
// A configured language with no entry in RULES is FATAL, not a warning. A warning is how a language
// ships unchecked while the line above says OK — the same silent-skip shape that let 181 dashes into
// the Japanese pages while a pin sat one directory away (#718). Acknowledging the gap is allowed, but
// it has to be written down: put `<locale>: null` in RULES, with the reason, and it becomes a choice
// somebody made rather than a language nobody noticed.
const unacknowledged = unruled.filter((l) => !(l in RULES))
if (unacknowledged.length) {
  console.error(`check-ja-prose: ${unacknowledged.join(', ')} ${unacknowledged.length === 1 ? 'is' : 'are'} configured but ${unacknowledged.length === 1 ? 'has' : 'have'} no prose rules.`)
  console.error('Add a rule set to RULES (see ja-glossary.mjs), or record the decision as `<locale>: null` with a reason.')
  process.exit(1)
}
for (const l of unruled) {
  console.warn(`check-ja-prose: ${l} has no prose rules by decision (RULES[${l}] = null) — its pages are not checked.`)
}

// PIN 2 (the check is not vacuously green). Two ways this file could pass while measuring nothing:
// the walk finds no pages, or the matcher stopped matching. Both are asserted here rather than
// trusted — a green line that means "I scanned 0 files" is the failure mode this repository keeps
// meeting (a spec sat green for eleven days on an empty list, #719).
const FLOOR = 40
if (scanned < FLOOR) {
  console.error(`check-ja-prose: only ${scanned} translated page(s) found (expected ≥ ${FLOOR}) — the walk is broken, not the prose`)
  process.exit(1)
}
// #713: a language configured but unruled is not an excuse for the floor to pass on the others'
// backs. If EVERY translation is unruled there is nothing being checked at all, and that is fatal.
if (unruled.length === TRANSLATIONS.length) {
  console.error(`check-ja-prose: no configured translation has prose rules (${unruled.join(', ')}) — refusing a vacuously green run`)
  process.exit(1)
}
const canary = proseOf('本文——ダッシュ入り\n\n```\n:::tagged — inside a fence\n```\n')
const canaryHits = canary.filter((l) => /—/.test(l)).length
if (canaryHits !== 1) {
  console.error(`check-ja-prose: the matcher is broken — the self-test expected exactly 1 prose hit (and 0 inside the fence), got ${canaryHits}`)
  process.exit(1)
}
// …and the link-target stripper must strip the TARGET while keeping the visible text judgeable,
// otherwise banning a word would silently stop working for every line that contains a link.
const stripped = stripLinkTargets('[プラン別の機能一覧](/ja/reference/plan-contents/) と entitlement の話')
if (stripped.includes('entitlement-levers') || !stripped.includes('entitlement の話')) {
  console.error('check-ja-prose: the link-target stripper is broken — it must hide the URL and keep the prose')
  process.exit(1)
}

if (problems.length) {
  console.error(`check-ja-prose FAILED — ${problems.length} issue(s) in the Japanese docs:\n`)
  for (const p of problems.slice(0, 60)) console.error(`  ${p}`)
  if (problems.length > 60) console.error(`  … and ${problems.length - 60} more`)
  console.error('\n#718: 記号は読点・句点・括弧で置き換え、用語は製品 UI の呼び方に揃えます（scripts/ja-glossary.mjs）。')
  process.exit(1)
}
console.log(`check-ja-prose OK — ${scanned} translated page(s) across ${TRANSLATIONS.length - unruled.length} language(s), no banned punctuation, glossary respected.`)
