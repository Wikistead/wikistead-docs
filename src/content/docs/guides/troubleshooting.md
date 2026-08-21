---
title: When something breaks
---

Start here when the product is doing something you did not ask for. Each entry names the thing you
would actually observe, because a symptom is what you have when you arrive.

## Sign-in

**Everyone in one workspace is suddenly refused, and the settings page you would fix it on needs a
sign-in.** That is the identity provider, not the product: an expired secret, a rotated certificate,
a client deleted at the provider's end. Recovery is an operator action with a break-glass runbook —
[tenant OIDC lockout recovery](https://github.com/wikistead/wikistead/blob/main/docs/runbooks/tenant-oidc-lockout-recovery.md).

**One person cannot get in and their phone is gone.** They can do this themselves with a recovery
code — see [Your account](/settings/account/). It resets every second factor, so it is a recovery,
not a shortcut.

**Sign-in works and then immediately signs out again.** The session cookie is marked `secure` in
production, so it is dropped on a plain `http://` origin. Serve the product over HTTPS; the
self-hosted [reverse proxy](/getting-started/self-hosting/) does that by default.

## Content

**A page you just imported looks empty.** Imports arrive as drafts, and the reading surface shows the
published version. Publish it, or open it in the editor to see the draft. The
[import report](/guides/import/) says this too, on the screen where the import finished.

**Search does not find a page you can see.** Indexing is a moment behind the edit that caused it.
When a page stays missing, the index and the permissions have diverged — the search entry is checked
against live permissions before it is shown, so the safe direction is the one you are seeing.

## Operations

**Everything is slow after a restart, then fine.** Caches are cold, including the permission cache.

**Permissions are wrong immediately after a restore.** The wiki and its permissions live in two
databases: the application's Postgres, and the permission store's own. **They have to be restored as
one unit, to the same moment.** Restoring one without the other produces a product that is
internally inconsistent rather than one that is merely out of date — pages whose permission tuples
describe a workspace that no longer looks like that.

In practice: take both snapshots from the same point in time, and restore both before letting anybody
back in — not the wiki first and the permissions after.

**The permission store cannot be rebuilt from the wiki.** Some of it can be re-derived
(memberships, the space tree, published pages), but a good deal of it exists nowhere else: who was
granted access to which space, whether a page is private or restricted, and every live share link.
Those are stored only in the permission store, so a backup of it is not optional and a resync is not
a substitute for one.

**The server refuses to start and says so.** That is deliberate: it fails on a missing encryption
key, on a permission store configured to keep tuples in memory, and on a secret that is published in
the public repository's own fixtures. Each message names the variable — every one of them is in the
[environment reference](/reference/environment-variables/).

## Still stuck

[How to get help](/guides/support/) has the places to ask, and what to include so the answer is
useful the first time.
