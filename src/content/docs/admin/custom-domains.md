---
title: Custom domains
screens:
  admin-surface:domains: [verify, verified, pending, release]
---

**Admin → Domains** serves your workspace on a hostname you own — `wiki.example.com` instead of the
address it was created with.

## Adding one

Add the domain, publish the DNS record the screen shows you, then verify. Verification is what proves
you control the name; until it passes, the domain is listed as pending and nothing is served on
it. Once it passes the domain is listed as verified.

The record has three parts, and the screen names each one: the type (TXT), the host, and the value.
The host and the value copy separately, because a DNS panel takes them in different boxes. If
verification answers that the record was not found, the usual reason is that DNS has not spread yet.
Wait a few minutes and verify again.

**Release** takes effect immediately, and adding the domain back means proving ownership again.

## What changes for the people already signed in

**Passkeys are tied to the hostname they were created on.** Moving the workspace to a new host makes
every existing passkey unusable, and their owners have to enrol again on the new address. The screen
says how many members that is before you confirm.

If the workspace accepts **passkeys only** as its second factor, verifying is refused outright: with
no other factor to fall back on, the move would lock out everyone at once. Allow another second
factor first, then move.

## Certificates

The certificate for a custom domain is issued by the deployment, not by this screen. On a self-hosted
install that is your reverse proxy's job; the guide covers it under
[self-hosting](/getting-started/self-hosting/).

## Availability

Custom domains are a paid feature, and dropping to a plan without them releases the domains — the workspace
returns to the hostname it was created with rather than keeping a name it is no longer paying for.
Nothing is deleted; the domain can be added again after upgrading, with ownership proven again.
