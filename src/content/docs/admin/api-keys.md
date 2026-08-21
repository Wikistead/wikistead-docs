---
title: API keys
---

**Admin → API keys** (admins) issues and inventories the workspace's API keys — the credentials scripts and integrations use against the REST API.

## Narrow by construction

A key is minted with **grants**, not with its owner's whole power:

- **Resource kinds × read/write** — e.g. *pages: read* plus *attachments: read*, and nothing else.
- **Space scoping** — optionally restrict the key to chosen spaces; the list shows each key's reach so you can audit what a key can touch long after minting it.

The raw secret is shown **once**, at creation. After that the console shows metadata only.

## Limits and revocation

Authenticated API traffic is rate-limited per key and per workspace (the limits depend on the plan — see [what each plan includes](/reference/plan-contents/)). Revoking a key is immediate.

## Members' own keys

Members can hold personal keys too, from [account settings](/settings/account/) — the workspace decides whether members may issue their own or only hold what admins minted. The REST API's canon is [`docs/api-reference.md`](https://github.com/wikistead/wikistead/blob/main/docs/api-reference.md) in the source repository.
