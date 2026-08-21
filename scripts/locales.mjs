// #713 / ADR-228: ONE list of this site's locales, so the guards stop naming
// `ja` in five places.
//
// The property being preserved is the one that matters when a third language arrives: a half-translated
// language must turn the BUILD red, not sit there quietly missing pages. That only holds if every guard
// walks the same list, and if the list cannot drift from what the site actually serves — so this is
// reconciled against astro.config.mjs rather than trusted.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** The source language. It lives at the root of the content tree (no directory of its own). */
export const ROOT_LOCALE = 'en'
/** Every language that mirrors the root under a directory of its own. Add a language HERE and in astro.config. */
export const TRANSLATIONS = ['ja']
export const LOCALES = [ROOT_LOCALE, ...TRANSLATIONS]

/**
 * Fail if this list and the site's own locale configuration disagree.
 *
 * Without it, adding `de` to astro.config would ship a German section that no guard inspects — which is
 * precisely the failure the ADR asked to prevent, arriving through the door marked "the guards are
 * generalised now".
 */
export function assertLocalesMatchConfig() {
  const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8')
  const block = config.match(/locales:\s*\{([\s\S]*?)\n\s{6}\}/)?.[1]
  if (!block) throw new Error('locales.mjs: could not find the `locales` block in astro.config.mjs — the reconciliation would be vacuous')
  const declared = [...block.matchAll(/^\s*(\w[\w-]*)\s*:\s*\{/gm)].map((m) => m[1])
  const configured = declared.map((k) => (k === 'root' ? ROOT_LOCALE : k)).sort()
  const ours = [...LOCALES].sort()
  if (configured.join(',') !== ours.join(',')) {
    throw new Error(
      `locales.mjs: astro.config serves [${configured.join(', ')}] but the guards walk [${ours.join(', ')}].\n` +
      'Add the language to BOTH, or a whole locale ships without any of the checks looking at it.',
    )
  }
  return LOCALES
}

/** The content directory for a locale: the root language has none, a translation has its own. */
export function localeDir(docsRoot, locale) {
  return locale === ROOT_LOCALE ? docsRoot : join(docsRoot, locale)
}

/** The path of `rel` (a root-relative page path) inside `locale`. */
export function localePath(docsRoot, locale, rel) {
  return locale === ROOT_LOCALE ? join(docsRoot, rel) : join(docsRoot, locale, rel)
}
