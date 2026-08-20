---
title: Webhooks
---

**Admin → Webhooks** (admins) subscribes external systems to the workspace's events: register an endpoint URL, pick the events, and Wikistead delivers signed HTTP calls as things happen — the push half of composing Wikistead with other tools.

## Events

The subscribable vocabulary is the workspace's **domain events** — page published, member joined, and the rest. The complete list is generated from the released code: [domain events reference](/reference/generated/domain-events/). New product features arrive with their events; the reference moves with the release.

## What is never emitted

Webhooks respect visibility: **drafts and private content do not produce events** to your endpoints. A webhook is a projection of what happened, shaped by the same rules a reader faces — not a side channel around them.

## Operating

Each hook shows its delivery state; a hook you disable stops receiving without being forgotten. Where webhooks are a plan lever, creation is gated but already-created hooks keep delivering (see [entitlement levers](/reference/generated/entitlement-levers/)).
