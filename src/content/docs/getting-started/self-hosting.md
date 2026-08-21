---
title: Self-hosting
---

Wikistead's Community Edition is AGPL open source, and self-hosting is a first-class path — not a demo mode. The **canonical self-hosting guide ships inside the source repository** ([`docs/self-hosting.md`](https://github.com/wikistead/wikistead/blob/main/docs/self-hosting.md)), versioned with the exact code it deploys. This page orients you; the repository guide is the one to follow.

## The short version

```bash
git clone https://github.com/wikistead/wikistead
cd wikistead
cp .env.example .env      # three secrets are mandatory — the repository guide names them
pnpm install && pnpm dev:up
docker compose --profile apps up -d --build
```

Then open **https://dev.localhost**.

`docker compose up -d` on its own brings up the infrastructure only. The `apps` profile is what adds
the product — web, server, collab and the reverse proxy that puts them on one origin. Everything is
reached through that proxy, and the certificate is Caddy's internal one for a `.localhost` name, so
the browser warns until you run `caddy trust`; serving a real host name (`SITE_HOST=app.example.com`)
gets a real certificate over ACME instead.

For a production deployment (Kubernetes, TLS, backups, an external IdP), follow the repository guide — it covers both the single-host evaluation setup and the production path.

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

A self-hosted Community deployment gets every feature **unlimited** — there is no artificial cap to unlock. [What each plan includes](/reference/plan-contents/) shows exactly what each feature controls and what the Community column comes to.
