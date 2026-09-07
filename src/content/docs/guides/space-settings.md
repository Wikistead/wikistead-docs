---
title: Space settings
documented-surfaces: [web-route:/spaces/:spaceId/settings/*]
---

Each space has its own settings, reached from the gear on the space in the sidebar. Six tabs, in order:

| Tab | What it holds |
|---|---|
| **General** | Name, accent colour, icon, home page — the space's identity. |
| **Members** | Who can enter this space and with what access — the space-level roster. |
| **Pages** | The space's pages, in an administrable list. |
| **Analytics** | The space's page-view dashboard *(Cloud/Enterprise; where entitled)*. |
| **Trash** | Deleted pages, restorable until emptied. |
| **Moderation** | The patrol queue for reported content in this space. |

## Who sees which tabs

The tab strip is permission-shaped. A space **manager** gets all of it. Other roles open exactly the tab that *is* their power: a **moderator** enters settings and finds the Moderation tab; someone granted **access management** finds Members — and nothing else. No tab is ever shown locked.

## Space access vs. workspace admin

Space settings govern *this* space. Workspace-wide concerns — the member directory, sign-in methods, roles, billing — live in the [admin console](/admin/). The rule: a space manager shapes their space; a workspace admin shapes the workspace.

## Trash, not a shredder

Deleting a page moves it to the space's trash tab, where it can be restored. Emptying trash is the explicit, destructive step — deletion alone never destroys content.
