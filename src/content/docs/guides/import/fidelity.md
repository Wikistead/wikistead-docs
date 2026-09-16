---
title: What an import cannot carry
documented-surfaces: none  # spans the whole importer's limitations, not a single surface
---

**An import is not complete.** Most of a page arrives intact, and some things have no equivalent
here and do not.

## Not supported at all

- **Confluence: the HTML export only.** An XML space backup is not read, and neither is the REST API.
  If your export is an XML backup, re-export it as HTML from the space's export screen.
- **Obsidian block references.** `[[Note#^id]]` points at a paragraph, and Wikistead has no paragraph
  anchors, so the link resolves to the page and the reference is lost. A heading link is different:
  it loses the anchor, and the heading itself is still there to link to.
- **Notion callouts and toggles.** Notion writes them as raw HTML in its Markdown export. They come
  across as that HTML.
- **Confluence links to attached files.** The file is imported; a link to it is repaired when the
  archive carries the file, and reported when it does not.

## Everything else is in the report

The import's report lists what did not survive by name, with the page each one was on. For your
archive, that report is the complete answer.
