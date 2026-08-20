---
title: Layout macros
---

Three container directives arrange Markdown instead of adding to it: **columns**, **tabs** and **details**. Each body is ordinary Markdown — anything the editor renders elsewhere renders inside them.

## Columns

```md
:::columns
:::column
Left side — a list, a table, an image.
:::
:::column
Right side.
:::
:::
```

Items sit side by side on wide screens. The container stays a stable frame while you edit: click a column to edit its content in place, and use the per-item controls to add or remove columns.

## Tabs

```md
:::tabs
:::tab[macOS]
Instructions for macOS.
:::
:::tab[Windows]
Instructions for Windows.
:::
:::
```

Each `:::tab[Label]` becomes one tab; readers switch between them. Good for per-platform steps and before/after comparisons where only one variant matters at a time.

## Details (disclosure)

```md
:::details[What the migration touches]
The long answer, collapsed by default.
:::
```

A collapsible section with the label as its summary line — the standard place for an aside too long to inline.

## Editing model

Containers are edited **in place**: clicking into a slot opens an inline editor for that slot's Markdown, and the frame never collapses while you work. The raw `:::` form remains available (Source mode) and is what exports carry — a reader without Wikistead still sees each item's content in order.
