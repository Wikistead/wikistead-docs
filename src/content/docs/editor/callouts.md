---
title: Callouts
---

Callouts (admonitions) put a tinted, icon-carrying panel around a block of Markdown — for the sentence the reader must not miss. Five types ship, each its own directive:

```md
:::note
A neutral remark.
:::

:::info
Background the reader may want.
:::

:::tip
The shortcut worth knowing.
:::

:::warning
Something that can go wrong.
:::

:::danger
Something destructive or irreversible.
:::
```

## Labels

Any callout can carry a heading of its own, in square brackets on the opening line:

```md
:::warning[Before you migrate]
Export a backup first — the migration rewrites every page id.
:::
```

## The body stays Markdown

A callout's content is ordinary Markdown — lists, links, code fences and even other macros render inside it. In the editor the panel renders in place; putting the caret inside reveals the `:::` fences so you can edit the raw form at any time.

## Notes

- Types are case-insensitive (`:::WARNING` is `:::warning`).
- An unknown type (`:::something`) renders as a `note` rather than breaking — the same convention Obsidian uses.
- Exported Markdown keeps the `:::` directive verbatim; it is a widely-understood container syntax, and the content inside is standard Markdown either way.
