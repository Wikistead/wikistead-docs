---
title: Webhooks
documented-surfaces: [admin-surface:webhooks, doc-code-map:webhook-delivery-and-signing]
screens:
  admin-surface:webhooks: ["disabled", "create:none:the page describes registering an endpoint not the Add button by name", "delete:none:the page does not describe removing a webhook"]
---

**Admin → Webhooks** (admins) subscribes external systems to the workspace's events: register an endpoint URL, pick the events, and Wikistead delivers signed HTTP calls as things happen — the push half of composing Wikistead with other tools.

## Events

What you can subscribe to is the things that happen in a workspace — a page published, a member joined, and the rest. The complete list is [webhook events](/reference/webhook-events/).

## What is never emitted

Webhooks respect visibility: **drafts and private content do not produce events** to your endpoints. A webhook cannot be used to read content its recipient could not see.

## Operating

Each hook shows its delivery state — live, or **Disabled** if you turn it off; a disabled hook stops receiving without being forgotten. Where a plan does not include webhooks, creating one is gated but hooks that already exist keep delivering (see [what each plan includes](/reference/plan-contents/)).
