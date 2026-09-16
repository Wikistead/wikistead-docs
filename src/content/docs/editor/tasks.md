---
title: Tasks
documented-surfaces: [macro:directive:todo]
---

Task lists are standard GFM — and the checkboxes are **interactive**: any reader with edit access clicks a box and the underlying Markdown flips between `- [ ]` and `- [x]`, live for every collaborator.

```md
- [x] write the announcement
- [x] rehearse the demo
- [ ] capture the screenshots
- [ ] ship it
```

![A checklist on the read surface; the boxes are clickable there too.](../../../assets/screenshots/tasks.png)


## The progress ring — `:::todo`

Wrap a task list in `:::todo` to promote it into a tinted panel with a **progress ring** (done / total), optionally labelled:

```md
:::todo[Launch checklist]
- [x] write the announcement
- [ ] ship it
:::
```

The body stays a real GFM task list — the same interactive checkboxes, now with a count. The page header also shows an overall done/total chip for the tasks on the page, so a checklist page reads its own status at a glance.

## What tasks are not

Tasks are plain Markdown: no assignees, due dates or boards. They suit checklists inside a page — runbooks, launch pages, meeting notes — and export as GFM to any other tool. For project tracking, [embed a tracker](/editor/embeds/).
