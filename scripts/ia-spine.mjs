// The areas this documentation promises to cover, declared (#734 / ADR-237 §2.3).
//
// Everything else this project trusts is a discovery walk: the surface ledger asks the product what
// it registers, the tab-name check asks the product what it calls things. That works because those
// things EXIST in code. This file is for the other kind of page — troubleshooting, how to get help,
// license and editions, upgrading — which corresponds to no product artifact at all. There is no
// registry to walk, because there is no thing.
//
// The comparison that raised the ticket found those areas missing entirely, and nothing had noticed:
// the sidebar is `autogenerate` per section, so a page dropped in a directory appears and an area
// nobody ever created is invisible — including to a human reading the sidebar.
//
// ⚠️ WHAT THIS CANNOT DO, said here rather than implied: it cannot notice an area nobody declared.
// A hand list is exactly the thing this project has watched go stale within a week, and pretending
// otherwise would build another guard that cannot fail. The honest mitigation is not a cleverer
// check — it is re-reading this list against what readers actually ask for when a phase closes, and
// that is a ticket, not a CI job.
//
// What it CAN do, and does:
//   * a declared area whose page is missing in the root locale → red
//   * a page that belongs to no declared section                → red (a page cannot be filed nowhere)
//
// Translations are not this check's business: a page missing in `ja` is reported by
// check-translation-coverage, and reporting it twice would make one of the two the wrong place to fix it.

/**
 * The sections of the site. Every content directory must appear here, so a new section cannot be
 * created by dropping a file into a new folder — which is how a page ends up in a sidebar group
 * nobody named.
 */
export const SECTIONS = [
  { dir: 'getting-started', label: 'Getting started' },
  { dir: 'editor', label: 'Editor' },
  { dir: 'guides', label: 'Guides' },
  { dir: 'publishing', label: 'Publishing' },
  { dir: 'integrations', label: 'Integrations' },
  { dir: 'admin', label: 'Admin' },
  { dir: 'settings', label: 'Settings' },
  { dir: 'reference', label: 'Reference' },
]

/**
 * The pages the product promises a reader will find, with the reason each one is promised.
 *
 * Pages NOT listed here are perfectly legitimate — most of the site is surface-derived and already
 * has a stronger guarantee from the ledger. This list is the reader-derived half: the pages that
 * exist because somebody needs them, not because some code registered something.
 */
export const PROMISED_PAGES = [
  {
    page: 'guides/troubleshooting.md',
    why: 'The first thing a self-hoster needs when it breaks. The runbooks existed with no entrance to them.',
  },
  {
    page: 'guides/support.md',
    why: 'Where to go when the documentation does not answer it. Both competitors have one; this project had a SECURITY.md and an issue template.',
  },
  {
    page: 'reference/license.md',
    why: 'The first question somebody evaluating a self-hosted wiki asks, previously answered in a README paragraph.',
  },
  {
    page: 'getting-started/self-hosting.md',
    why: 'The install path. It is promised rather than assumed because losing it would be silent otherwise.',
  },
  {
    page: 'reference/index.md',
    why: 'The entrance to the generated catalogues, which are the thing this documentation has that comparable products do not.',
  },
]
