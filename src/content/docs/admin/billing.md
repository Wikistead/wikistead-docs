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
- **Self-hosted Community has no billing to do** — every feature is unlimited there; this tab concerns the managed Cloud.

## Self-hosted Community: the same tab, titled Usage

A self-hosted build never loads the Stripe-backed billing code at all, so admins there see **Admin → Usage** instead — the same underlying screen, with no plan, no billing, and no upgrade prompt. What remains is a **This period** read-out of what this deployment has metered (AI tokens today), useful for a self-hoster tracking their own costs even though nothing here is capped or billed for.
