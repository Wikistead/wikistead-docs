---
title: Billing
documented-surfaces: [admin-surface:billing, admin-surface:usage, doc-code-map:storage-quota-and-attachment-limits]
screens:
  admin-surface:billing: [upgradePro, manage]
  admin-surface:usage: [usageTitle]
---

**Admin → Billing** (admins) is where a Cloud workspace sees its commercial state: the current **plan**, **seat** usage against the plan's limit, and **storage** consumption. A workspace on the free tier sees **Upgrade to Pro**; any Cloud workspace with billing already set up sees **Manage billing**, which opens the billing portal.

Three principles shape everything on this tab:

- **Guests are never billed.** Seats count members; people arriving over [share links](/guides/share-links/) cost nothing, however many collaborate.
- **Downgrades are non-destructive.** Going over a lower plan's limits blocks *new* growth (new invites, new uploads) — it never removes members or deletes content. What a downgrade does to each feature is in [what each plan includes](/reference/plan-contents/).
- **Self-hosted Community has no billing to do** — every CE resource limit is unlimited there (a small set of Cloud-only features simply have no code to run in CE, regardless of any limit); this tab concerns the managed Cloud.

## Storage

Storage is a running total of two things: **file attachments** and **page history** (every published revision a page has). Unlike AI usage, it isn't a monthly counter — it's the total currently on file, so it doesn't reset each period, and it appears on its own line rather than inside a monthly usage summary.

The number shown today is a measurement only — it does not yet block anything. New attachments still upload and pages still publish however large the total gets. When enforcement is switched on for a plan, only *new* page creation and *new* publishing are blocked once a workspace's storage reaches its plan's limit; editing existing pages, and everything already published, is never affected. A workspace approaching that limit sees a notice once it crosses 90% of it.

## Self-hosted Community: the same tab, titled Usage

On a self-hosted build, admins see **Admin → Usage** instead — the same screen, with no plan, no billing, and no upgrade prompt. What remains is a **This period** read-out of what this deployment has used (AI usage today), for a self-hoster tracking their own costs; nothing here is capped or billed.
