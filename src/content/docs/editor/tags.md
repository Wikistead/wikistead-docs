---
title: Tags
documented-surfaces: [macro:directive:tagged]
---

Tags live in the page's **frontmatter** — the standard YAML block at the very top of the document, the same convention every static-site generator reads:

```md
---
tags: [decision, infra]
---

# Why we picked Postgres
```

![A `:::tagged` list, gathering every page with that tag.](../../../assets/screenshots/tags.png)


In the editor the frontmatter renders as a compact row of tag chips at the top of the page. Add and remove tags right on the chips (with suggestions from the tags already in use); put the caret inside the block to edit the raw YAML whenever you prefer. Other frontmatter fields you add by hand are preserved verbatim — Wikistead displays tags and leaves the rest of your metadata alone.

## Listing pages by tag

`:::tagged` renders an auto-updating list of the pages whose tags include a given tag — the body's first line names it:

```md
:::tagged
decision
:::
```

- Tag matching is case-insensitive; tags are plain strings, so the same frontmatter means the same thing in any Markdown tool.
- The list is **permission-filtered per reader**: a page the reader cannot view is absent from the list and the count.
- Like [`:::children`](/editor/page-lists/), the list is display output — the document stores only the query.

## Why frontmatter?

Because it is the one metadata convention the Markdown world already agrees on. Export a Wikistead page and its tags travel with it, readable by Hugo, Jekyll, Obsidian or a text editor — no sidecar database to lose.
