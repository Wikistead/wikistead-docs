---
title: Webhooks
---

**Admin → Webhooks** (admins) subscribes external systems to the workspace's events: register an endpoint URL, pick the events, and Wikistead delivers signed HTTP calls as things happen — the push half of composing Wikistead with other tools.

## Events

What you can subscribe to is the things that happen in a workspace — a page published, a member joined, and the rest. The complete list is [webhook events](/reference/webhook-events/). New product features arrive with their events.

## What is never emitted

Webhooks respect visibility: **drafts and private content do not produce events** to your endpoints. A webhook is a projection of what happened, shaped by the same rules a reader faces — not a side channel around them.

## Operating

Each hook shows its delivery state; a hook you disable stops receiving without being forgotten. Where a plan does not include webhooks, creating one is gated but hooks that already exist keep delivering (see [what each plan includes](/reference/plan-contents/)).
