---
title: Markdown notation
documented-surfaces: [doc-code-map:plain-markdown-notation-highlight-footnote-math]
---

A cheat sheet for the notation the editor renders — one line per mark, plus an example. For macros (`:::` directives and fenced-code blocks like diagrams), see [Macro notation](/reference/macro-notation/).

## CommonMark & GFM

| Notation | Example |
| --- | --- |
| Heading | `# H1` … `###### H6` |
| Bold | `**bold**` |
| Italic | `*italic*` |
| Strikethrough | `~~strikethrough~~` |
| Inline code | `` `code` `` |
| Link | `[text](/p/<pageId>)` (internal) or `[text](https://example.com)` |
| Blockquote | `> quoted text` |
| Bullet list | `- item` |
| Numbered list | `1. item` |
| Task list | `- [ ] todo` / `- [x] done` |
| Table | `\| a \| b \|` (standard GFM pipe table) |
| Horizontal rule | `---` |

## Tags (frontmatter)

A page's tags live in a leading YAML frontmatter block, the first thing in the document:

```md
---
tags: [recipes, dinner]
---
```

Tags are plain strings (case-insensitive); there is no inline `#tag` notation.

## Highlight

```md
==highlighted==
```

Renders as `<mark>`. Space-flanked `=` (`a == b`) stays literal, so comparisons in code samples are unaffected.

## Footnotes

```md
A claim that needs a source.[^1]

[^1]: The note itself, on its own line.
```

The reference `[^1]` can sit anywhere in the body; its definition line is collected and numbered wherever it's written.

## Math

Inline math sits between single `$`:

```md
The area is $\pi r^2$.
```

Block math sits between `$$` on its own lines:

```md
$$
E = mc^2
$$
```

Both render via KaTeX. A `$` inside inline `` `code` `` or a fenced code block is left alone — it's never read as math there.

## Code fence attributes

The info string after a fence's language tag follows the industry convention and round-trips attributes it doesn't understand:

````md
```ts title="app.ts" showLineNumbers {1,3-5}
const x = 1
```
````

- `title="…"` labels the fence.
- `showLineNumbers` turns on line numbers.
- `{1,3-5}` highlights lines 1, 3, 4 and 5 (comma-separated single lines or ranges).

## Next

- [Macro notation](/reference/macro-notation/) — callouts, tables, diagrams, embeds and every other `:::` directive or fenced macro.
- [The editor](/editor/callouts/) — how these render live as you type.
