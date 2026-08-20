---
title: Self-hosting
---

Wikistead's Community Edition is AGPL open source, and self-hosting is a first-class path — not a demo mode. The **canonical self-hosting guide ships inside the source repository** ([`docs/self-hosting.md`](https://github.com/wikistead/wikistead/blob/master/docs/self-hosting.md)), versioned with the exact code it deploys. This page orients you; the repository guide is the one to follow.

## The short version

```bash
git clone https://github.com/wikistead/wikistead
cd wikistead
docker compose up -d
```

One compose file brings up the whole stack. For a production deployment (Kubernetes, TLS, backups, an external IdP), follow the repository guide — it covers both the single-host evaluation setup and the production path.

## What you are running

Wikistead is three application processes over a set of infrastructure services:

| Component | Role |
|---|---|
| `web` | The single-page app (the editor and every screen) |
| `server` | The API — tenants, spaces and pages, search, share links |
| `collab` | The real-time editing server (WebSocket, CRDT) |
| Postgres | The application database and the authorization store |
| OpenFGA | Authorization — the single source of truth for permissions |
| Meilisearch | Full-text search |
| Valkey | Real-time coordination and rate limiting |
| S3-compatible storage | Attachments (SeaweedFS by default; swappable for S3/R2) |

Two deployment invariants worth knowing before you start (the repository guide enforces both):

1. **One origin.** The web app, `/api` and `/collab` must be served from the same origin through a reverse proxy — never expose the API or collab ports directly.
2. **OpenFGA needs a persistent datastore.** Running it on the in-memory engine means a restart silently erases every permission in the system.

## Community Edition vs Cloud

Self-hosted CE resolves every feature lever as **unlimited** — there is no artificial cap to unlock. The [entitlement levers reference](/reference/generated/entitlement-levers/) is generated from the released code and shows exactly what each lever gates and what the Community column resolves to.
