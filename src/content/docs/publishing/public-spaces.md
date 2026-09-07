---
title: Public spaces & pages
documented-surfaces: [admin-surface:public, web-route:/pub/space/:spaceId, web-route:/pub/:pageId]
screens:
  admin-surface:public: [toggleTitle]
---

How you write and how you publish are separate decisions. The same page can stay private, open to the team, or go public on the web — publishing is a setting, not a migration.

## The three audiences

| Audience | How they get in |
|---|---|
| **Members** | Sign in; see what their access grants. |
| **Guests** | A [share link](/guides/share-links/) — capability-scoped, revocable. |
| **The anonymous web** | *Public* pages and spaces, readable by anyone at a URL — no link required. |

## Going public

Public exposure is off until a workspace admin turns on **Allow public pages in this workspace** (**Admin → Public access**). With it enabled:

- **Publish a page publicly** — the page becomes readable at its public URL, as its last *published* version.
- **A public space** — the space's published, public pages appear as a read-only site with its own tree navigation.

Two invariants hold everywhere on the public surface:

- **Only published content.** Drafts and unpublished edits are never visible publicly, whatever else is configured.
- **Read-only, existence-hiding.** Anonymous readers can read exactly what was made public; anything else answers as if it did not exist.

Dynamic blocks (page lists, tag lists) render for anonymous readers as the snapshot baked when the page was published — the public surface never queries your workspace live.

## Custom domains

A workspace can serve its public surface from its own domain (docs.your-company.com) — added and verified in the workspace's settings, where the deployment and the plan allow it (see [what each plan includes](/reference/plan-contents/)).

## Getting everything out

Publishing to the web is one exit; taking your content with you is another, and it is never gated:

- **Page** → Markdown (`.md`, or a `.zip` with images when the page has a subtree or attachments).
- **Page as HTML** — a self-contained, sanitised HTML file of the published version.
- **Space** → one Markdown ZIP of everything you can view; a selection of pages can be exported the same way from the space's Pages tab.
- **Workspace** → the whole thing as one Markdown ZIP, on every plan.

Exports are view-filtered per caller — you export what you can read, nothing more.
