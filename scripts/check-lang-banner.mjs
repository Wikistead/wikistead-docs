#!/usr/bin/env node
// #713-S5: a reader whose browser language isn't a site locale (en/ja) gets an honest banner
// instead of silent English, per ADR-228's ruling that docs stays en/ja while the app grows ten
// more languages. This walks the BUILT site (matching check-translation-coverage.mjs's own
// discipline) rather than trusting the source, so a future refactor that quietly drops the banner
// or its text is caught the same way an untranslated page already is.
//
//   pnpm build   (this runs as part of the chain, after `astro build`)
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LOCALES, localePath } from './locales.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(root, 'dist')

if (!existsSync(DIST)) {
  console.error('check-lang-banner: no dist/ — run `pnpm build` first.')
  process.exit(1)
}

// The text this check expects, read from the SAME i18n files the component reads at build time —
// not retyped here, which would let the two silently disagree the way #718's own notice text did
// before it was pinned.
const I18N_DIR = join(root, 'src/content/i18n')
const KEY = 'docsBanner.unsupportedLanguage'

const problems = []

for (const locale of LOCALES) {
  const i18nFile = join(I18N_DIR, `${locale}.json`)
  if (!existsSync(i18nFile)) {
    problems.push(`no src/content/i18n/${locale}.json — the banner has no text for this locale`)
    continue
  }
  const dict = JSON.parse(readFileSync(i18nFile, 'utf8'))
  const expected = dict[KEY]
  if (!expected) {
    problems.push(`src/content/i18n/${locale}.json is missing the "${KEY}" key`)
    continue
  }

  const homePath = localePath(DIST, locale, 'index.html')
  if (!existsSync(homePath)) {
    problems.push(`locale "${locale}" built no home page (${homePath} missing)`)
    continue
  }
  const html = readFileSync(homePath, 'utf8')

  if (!html.includes('id="wks-lang-banner"')) {
    problems.push(`${locale}/index.html: no #wks-lang-banner element — the override is not wired or was reverted`)
    continue
  }
  // ⚠️ break-check target: the banner must be hidden BY DEFAULT (server-rendered), since only the
  // client script — which cannot run at build time — knows the reader's actual language.
  if (!/id="wks-lang-banner"[^>]*\bhidden\b/.test(html)) {
    problems.push(`${locale}/index.html: #wks-lang-banner is not \`hidden\` by default — it would flash for every reader, including ones on a supported locale`)
  }
  // HTML-encodes apostrophes etc.; comparing the encoded form the browser will actually escape.
  const encoded = expected.replace(/'/g, '&#39;').replace(/"/g, '&quot;')
  if (!html.includes(encoded)) {
    problems.push(`${locale}/index.html: banner does not contain the ${locale} i18n string ("${expected}")`)
  }

  // The client script must read the site's locales from config, not a hardcoded list — the same
  // property locales.mjs's own assertLocalesMatchConfig protects for every other guard here.
  const scriptMatch = html.match(/siteLangs\s*=\s*"(\[.*?\])"/);
  if (!scriptMatch) {
    problems.push(`${locale}/index.html: could not find the banner's serialized siteLangs — did the script's variable name change?`)
  } else {
    const langs = JSON.parse(scriptMatch[1].replace(/\\"/g, '"'));
    const sorted = [...langs].sort();
    const wanted = [...LOCALES].sort();
    if (sorted.join(',') !== wanted.join(',')) {
      problems.push(`${locale}/index.html: banner's siteLangs is [${sorted.join(', ')}], expected [${wanted.join(', ')}] — it has drifted from the site's real locales`)
    }
  }
}

if (problems.length > 0) {
  console.error('check-lang-banner FAILED:')
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}

console.log(`check-lang-banner OK — ${LOCALES.length} locale(s) checked (${LOCALES.join(', ')}), banner present/hidden/correctly-worded on each`)
