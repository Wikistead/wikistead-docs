---
title: Tables
---

Wikistead has two table forms, and moves between them for you: standard **GFM pipe tables** for everything simple, and the **`:::table` macro** — an HTML-bodied table — the moment you need merged cells or alignment a pipe table cannot express.

## Pipe tables (the default)

```md
| Area          | Owner | Status |
| ------------- | ----- | ------ |
| Announcement  | Mia   | done   |
| Demo          | Rin   | draft  |
```

A pipe table renders as a real table in place, and you edit it with the mouse: click into a cell to type, and use the table controls to add or remove rows and columns. Every edit is committed per operation, so collaborators see each change as it happens.

## Rich tables — `:::table`

When you merge cells or set a non-default alignment, the table is **promoted** automatically to the `:::table` form, whose body is a plain HTML table:

```md
:::table
<table>
  <thead>
    <tr><th>Quarter</th><th colspan="2">Targets</th></tr>
  </thead>
  <tbody>
    <tr><td>Q1</td><td>Ship the editor</td><td>Ship the docs</td></tr>
  </tbody>
</table>
:::
```

`rowspan` / `colspan` and alignment survive here. The same mouse editing applies — you rarely need to touch the HTML by hand, but it is there, readable, whenever you want it.

## Open formats: demotion is automatic

The promotion works in both directions. If you later remove the merge and the alignment, the table is **demoted back to a plain pipe table** — the document always sits at the most standard Markdown level that can express it. Nothing gets stuck in the rich form.

## Notes

- Cell content is text with line breaks; the renderer builds cells from text nodes, never raw HTML injection — pasting hostile markup into a cell cannot script the page.
- Exports preserve the table: pipe tables export as GFM, `:::table` exports with its HTML body intact.
