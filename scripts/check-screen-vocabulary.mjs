#!/usr/bin/env node
// #741 / ADR-239: the documentation calls a screen's actions and states what the screen calls them.
//
// #731's check compares the docs' name for each admin TAB with the product's label, and sees nothing
// below it. What a reader actually hunts for is one level down: the button they must press, the badge
// telling them what state a row is in. The page written during #731 itself drifted on three of them —
// a familiar synonym where the product's own verb or state badge says otherwise (the self-test rows
// below hold the pairs) — and one was in quotation marks, presented as the words on the screen. A
// reader finds nothing.
//
// HOW IT KNOWS WHAT A PARAGRAPH IS ABOUT (ADR-239, the hard part): it does not read the prose. The
// page DECLARES which operations of a surface it covers, in its frontmatter, and the declaration is a
// stable key rather than a word:
//
//   screens:
//     admin-surface:domains: [verify, verified, pending, release]
//     # or, for one the page genuinely does not describe:
//     # admin-surface:domains: [verify, "pending:none:the page never describes a row's state"]
//
// TWO REJECTED DESIGNS, recorded so the next person does not walk into them (ADR-239):
//   - requiring every product string on the page: the domains surface has 25 of them, mostly body
//     prose and toasts, so the check is either vacuous or deafening;
//   - a list of wrong synonyms: the very word one page misused is CORRECT elsewhere in this
//     product (watches, second factors, deactivation — six live uses), so that check goes red at
//     pages that are right.
//
// WHAT IT CANNOT DO, said plainly: a page that uses the product's word in one paragraph and a wrong
// synonym in another passes. The declaration proves the right word is present, not that no other word
// is used for the same thing — catching that needs the synonym list above, and its cost is red pages
// that are correct.
//
//   pnpm check:screen-vocabulary     (runs inside `pnpm build`)
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TRANSLATIONS, ROOT_LOCALE } from './locales.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const TABLE = join(root, 'src/content/generated/screen-vocabulary.json')
const DOCS = join(root, 'src/content/docs')

// Which pages carry a `screens:` declaration. Discovered from the pages themselves rather than listed
// here: a page that claims a surface is checked because it claims it, so a new page arms itself.
import { readdirSync, statSync } from 'node:fs'
function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (name.endsWith('.md') || name.endsWith('.mdx')) out.push(p)
  }
  return out
}

if (!existsSync(TABLE)) {
  console.error(`check-screen-vocabulary: ${TABLE} is missing — run \`pnpm pull:generated\` (it carries the product's own words).`)
  process.exit(1)
}
const { surfaces } = JSON.parse(readFileSync(TABLE, 'utf8'))
const surfaceIds = Object.keys(surfaces ?? {})
if (surfaceIds.length === 0) {
  console.error('check-screen-vocabulary: the pulled vocabulary has no surfaces — refusing a vacuously green run')
  process.exit(1)
}
for (const id of surfaceIds) {
  if (Object.keys(surfaces[id]).length === 0) {
    console.error(`check-screen-vocabulary: surface "${id}" has an empty vocabulary — a surface with no words cannot be documented wrongly, which is not a pass`)
    process.exit(1)
  }
}

/** The frontmatter block, as raw lines — no YAML dependency for one nested list. */
function declarations(text) {
  const fm = /^---\n([\s\S]*?)\n---/.exec(text)?.[1]
  if (!fm) return null
  const start = fm.split('\n').findIndex((l) => /^screens:\s*$/.test(l))
  if (start < 0) return null
  const out = {}
  for (const line of fm.split('\n').slice(start + 1)) {
    if (!/^\s+\S/.test(line)) break // dedented back out of the block
    const m = /^\s+([^:\s]+(?::[^:\s]+)?):\s*\[(.*)\]\s*$/.exec(line)
    if (!m) continue
    out[m[1]] = m[2].split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
  }
  return out
}

// ⚠️ WHOLE-WORD, NOT SUBSTRING. #731 was vacuously green for a round because a short tab label
// sits inside a longer one as a substring, and the trap is worse here where the vocabulary is short
// verbs. Japanese has no word boundaries, so the rule is: the product's string must appear, and the
// characters touching it must not extend it into a longer run of the SAME script — a verb's kanji
// stem inside its negated and done forms is rejected either way (the self-test rows below hold the
// concrete pairs), which is the tab-label failure in its Japanese form.
//
// HIRAGANA NEXT TO A MATCH IS GRAMMAR, NOT WORD-FORMATION, and is always allowed. Every real trap
// here extends the word with KANJI (see the self-test rows); what follows the verb in a sentence
// is a particle. The strict version of this rule was written first and its own self-test rejected it:
// it refused the verb followed by its particle and passed only because the page happens to bold
// the button, which
// would have made markdown emphasis an accidental requirement of the check.
const SCRIPT = (ch) => {
  if (!ch) return 'edge'
  if (/[぀-ゟ]/.test(ch)) return 'hiragana'
  if (/[゠-ヿ]/.test(ch)) return 'katakana'
  if (/[一-鿿]/.test(ch)) return 'kanji'
  if (/[A-Za-z0-9]/.test(ch)) return 'latin'
  return 'edge'
}
function mentions(raw, rawWord) {
  // Case-insensitive for Latin: a button labelled "Verify" is the same WORD as "verify" in a
  // sentence, and demanding the capital would only teach writers to shout. The defect this check
  // exists for is a DIFFERENT word for the same button, which case never disguises.
  const text = raw.toLowerCase()
  const word = rawWord.toLowerCase()
  const wordStart = SCRIPT(word[0])
  const wordEnd = SCRIPT(word[word.length - 1])
  let from = 0
  for (;;) {
    const at = text.indexOf(word, from)
    if (at < 0) return false
    const before = SCRIPT(text[at - 1])
    const after = SCRIPT(text[at + word.length])
    // Latin runs use the usual boundary; CJK uses "the neighbour is not more of the same script",
    // which is what keeps a kanji-plus-kana verb from matching inside a longer one.
    const free = (side, edge) => side === 'edge' || side === 'hiragana' || side !== edge
    const okBefore = free(before, wordStart)
    const okAfter = free(after, wordEnd)
    if (okBefore && okAfter) return true
    from = at + 1
  }
}

// SELF-TEST. Both of these were WRONG in this file before they were measured, and both were green:
// the frontmatter leak passed a page that never said "Release" (its own declaration carries the word
// `release`), and a substring rule would pass a verb's kanji stem for the verb. A matcher that
// cannot be shown to
// reject is not a matcher.
for (const [text, word, want, why] of [
  ['then verify the domain', 'Verify', true, 'Latin, different case, is the same word'],
  ['Releasing a domain', 'Release', false, 'a longer Latin word is not a mention of the button'],
  ['検証するを押します', '検証する', true, 'the plain form, as the page names a button'],
  ['「未検証」と表示され', '検証する', false, 'a different state entirely'],
  ['検証済みになります', '検証', false, 'the 認証 / 2 要素認証 trap, in Japanese'],
  ['解放するときは', '解放する', true, 'a particle after the word is grammar, not another word'],
  ['ドメインの解放はすぐに', '解放する', false, 'the noun form is not the button'],
  ['2 要素認証の設定', '認証', false, 'the trap itself'],
  ['「未検証」と表示され', '未検証', true, 'the state badge, quoted as the screen shows it'],
]) {
  if (mentions(text, word) !== want) {
    console.error(`check-screen-vocabulary: SELF-TEST failed — ${JSON.stringify(word)} in ${JSON.stringify(text)} should be ${want} (${why})`)
    process.exit(1)
  }
}

const problems = []
let pagesScanned = 0
let comparisons = 0

for (const file of walk(DOCS)) {
  const raw = readFileSync(file, 'utf8')
  const claimed = declarations(raw)
  if (!claimed) continue
  // ⚠️ MATCH THE BODY, NEVER THE FRONTMATTER. Measured while writing this: the declaration line
  // `admin-surface:domains: [verify, verified, pending, release]` contains the English words for its
  // own keys, so a page that says "Releasing" in every sentence and never "Release" passed — the page
  // was being checked against its own claim. The claim is the question; the body is the answer.
  const text = raw.replace(/^---\n[\s\S]*?\n---/, '')
  const rel = file.slice(DOCS.length + 1)
  const locale = TRANSLATIONS.find((l) => rel.startsWith(`${l}/`)) ?? ROOT_LOCALE
  pagesScanned++
  for (const [surface, entries] of Object.entries(claimed)) {
    const vocab = surfaces[surface]
    if (!vocab) {
      problems.push(`${rel}: claims surface "${surface}", which the product's vocabulary does not have — the surface was renamed or removed`)
      continue
    }
    const excused = new Map()
    const wanted = []
    for (const entry of entries) {
      const [key, ...rest] = entry.split(':')
      if (rest.length && rest[0] === 'none') {
        const why = rest.slice(1).join(':').trim()
        if (!why) problems.push(`${rel}: "${key}" is excluded with no reason — write \`${key}:none:<why>\``)
        excused.set(key, why)
      } else wanted.push(key)
    }
    for (const key of [...wanted, ...excused.keys()]) {
      if (!vocab[key]) {
        problems.push(`${rel}: claims "${key}" on ${surface}, which the product no longer has — the page documents something that was removed`)
      }
    }
    // Both directions (ADR-239 (c)): an operation cannot be quietly dropped from a page that is
    // supposed to document the surface.
    for (const key of Object.keys(vocab)) {
      if (!wanted.includes(key) && !excused.has(key)) {
        problems.push(`${rel}: ${surface} has "${key}" (${vocab[key][locale]}) and the page neither covers it nor says why — add it, or \`${key}:none:<why>\``)
      }
    }
    for (const key of wanted) {
      const word = vocab[key]?.[locale]
      if (!word) continue
      comparisons++
      if (!mentions(text, word)) {
        problems.push(`${rel}: the product calls "${key}" ${JSON.stringify(word)} and the page never uses that word — a reader looking for it on the screen finds nothing`)
      }
    }
  }
}

// #719: a run that scanned nothing is not a pass. The declaration is what arms a page, so zero pages
// means either the frontmatter convention broke or nobody has armed one yet — both are red.
if (pagesScanned === 0) {
  console.error('check-screen-vocabulary: no page declares a `screens:` block — nothing was compared, which is not a pass')
  process.exit(1)
}
if (comparisons === 0) {
  console.error('check-screen-vocabulary: every claimed operation was excused — nothing was compared, which is not a pass')
  process.exit(1)
}

if (problems.length) {
  for (const p of problems) console.error(`check-screen-vocabulary: ${p}`)
  process.exit(1)
}
console.log(`check-screen-vocabulary OK — ${comparisons} word(s) compared across ${pagesScanned} declaring page(s), ${surfaceIds.length} surface(s)`)
