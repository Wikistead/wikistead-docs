---
title: Macro notation
---

The canonical syntax of every built-in macro, on one page. Everything here is standard-Markdown-shaped: data blocks are **code fences with a language tag**, Markdown-bodied blocks are **`:::` directives** — no private syntax.

Full guides: [Callouts](/editor/callouts/) · [Tables](/editor/tables/) · [Diagrams](/editor/diagrams/) · [Drawings](/editor/drawings/) · [Layout](/editor/layout-macros/) · [Embeds](/editor/embeds/) · [Tags](/editor/tags/) · [Page lists](/editor/page-lists/) · [Tasks](/editor/tasks/)

## Callouts

```md
:::note
Body markdown.
:::
```

Types: `note`, `info`, `tip`, `warning`, `danger`. Optional label: `:::warning[Before you migrate]`.

## Collapsible & layout

- Details/disclosure: `:::details[Summary]` … `:::`
- Columns: `:::columns` with inner `:::column` items … `:::`
- Tabs: `:::tabs` with inner `:::tab[Label]` items … `:::`

## Task list with a progress ring

```md
:::todo[My tasks]
- [ ] a task
- [x] done
:::
```

Plain GFM `- [ ]` task lists also work without the wrapper.

## Diagrams (fenced code)

- Mermaid: ` ```mermaid ` … diagram text … closing fence.
- PlantUML: ` ```plantuml ` … `@startuml` … `@enduml` … closing fence (renders as source unless the deployment configures a render service).
- Excalidraw: ` ```excalidraw ` (drawn in the editor; the body is scene JSON).

## Dynamic lists (read-only)

- Pages carrying a tag: `:::tagged` … `<tag name>` … `:::`
- This page's child pages: `:::children` … `:::` (empty body)

## Embeds & transclusion

- Embed another page's content: `:::embed-page` … `<pageId>` … `:::`
- Embed an allowlisted external URL: `:::embed-external` … `<url>` … `:::`

## Tables (rich)

Standard GFM pipe tables work everywhere. For merged cells and alignment: `:::table` … an HTML `<table>` … `:::`.

## Code fences

The info string follows the industry convention and round-trips unknown attributes:

````md
```ts title="app.ts" showLineNumbers {1,3-5}
const x = 1
```
````

## For AI assistants

A machine-readable version of this reference is served over the workspace's [MCP connector](https://modelcontextprotocol.io/) (`get_syntax_reference`), generated from the same registry the editor runs — an assistant writing into your workspace reads the same notation contract as this page.
