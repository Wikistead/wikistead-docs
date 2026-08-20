---
title: Page lists
---

`:::children` renders an auto-updating list of **this page's direct child pages** — the block to put on any hub or index page so it never goes stale.

```md
:::children
:::
```

The body is empty: there is nothing to configure. Create or move a child page and the list follows; delete one and it disappears.

## Properties

- **Read-only and derived.** The list is display output — it is resolved when the page renders, never written into the document. The Markdown stays exactly the two lines above.
- **Permission-filtered per reader.** Each entry is confirmed against the reader's own access; a child the reader cannot view is absent from the list (and from its count).
- **On public and shared surfaces**, the list shows the snapshot baked at publish time for anonymous readers.

## Related

- For a list of pages carrying a tag (across the space, not just children), see [Tags](/editor/tags/).
- Backlinks — the pages that link *here* — live in the page's **Related** side panel, not in a macro.
