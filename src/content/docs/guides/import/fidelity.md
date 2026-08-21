---
title: What an import cannot carry
---

**An import is not complete.** Most of a page arrives intact, and some things have no equivalent
here and do not.

## Not supported at all

- **Confluence: the HTML export only.** An XML space backup is not read, and neither is the REST API.
  The API would mean holding your Confluence credentials and making outbound calls from the import,
  which is a much larger thing to trust than reading a file you uploaded. If your export is an XML
  backup, re-export it as HTML from the space's export screen.
- **Obsidian block references.** `[[Note#^id]]` points at a paragraph, and Wikistead has no paragraph
  anchors, so the link resolves to the page and the reference is lost. A heading link is different:
  it loses the anchor, and the heading itself is still there to link to.
- **Notion callouts and toggles.** Notion writes them as raw HTML in its Markdown export. They come
  across as the markup they are rather than being guessed into something else.
- **Confluence links to attached files.** The file is imported; a link to it is repaired when the
  archive carries the file, and reported when it does not.

## Everything else it could not carry, it names

The import's report lists what did not survive by name, with the page each one was on. That is the
answer for your archive: it is measured on the files you uploaded rather than promised in advance.
