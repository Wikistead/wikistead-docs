---
title: Tasks
---

Task lists are standard GFM — and the checkboxes are **interactive**: any reader with edit access clicks a box and the underlying Markdown flips between `- [ ]` and `- [x]`, live for every collaborator.

```md
- [x] write the announcement
- [x] rehearse the demo
- [ ] capture the screenshots
- [ ] ship it
```

## The progress ring — `:::todo`

Wrap a task list in `:::todo` to promote it into a tinted panel with a **progress ring** (done / total), optionally labelled:

```md
:::todo[Launch checklist]
- [x] write the announcement
- [ ] ship it
:::
```

The body stays a real GFM task list — the same interactive checkboxes, now with a count. The page header also shows an overall done/total chip for the tasks on the page, so a checklist page reads its own status at a glance.

## Knowledge first, not a task tracker

Tasks in Wikistead are deliberately just Markdown: no assignees, no due dates, no board. They are for the checklists that live *inside* knowledge — runbooks, launch pages, meeting notes — and because they are plain GFM, they export everywhere and mean the same thing in every tool. For real project tracking, [compose Wikistead with a tracker](/editor/embeds/) instead of turning pages into one.
