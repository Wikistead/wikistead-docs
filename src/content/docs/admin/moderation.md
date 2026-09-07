---
title: Moderation
documented-surfaces: [admin-surface:moderation]
screens:
  admin-surface:moderation: [shrinkLabel, wordsLabel]
---

**Admin → Moderation** (admins) configures the workspace's **publish-boundary abuse filter** — the automatic checks that run when content is published to an audience:

- **Mass-delete guard** — a publish that shrinks a page below a configurable ratio of its former size is flagged instead of silently going out; vandalism over a shared edit link does not become the published version unreviewed.
- **Banned words** — a workspace-private word list that publishes are screened against. The list is moderation intelligence: admins can read and edit it, ordinary members cannot.

These settings are the workspace **floor**. Each space can add its own stricter layer — extra banned words, a tighter shrink ratio — in the space's [Moderation tab](/guides/space-settings/), where its moderators also work the queue of flagged and reported content.

Moderation exists because [share links](/guides/share-links/) and [public surfaces](/publishing/public-spaces/) open your workspace to people you have not vetted — the filter is the seatbelt that makes that openness safe to keep on.
