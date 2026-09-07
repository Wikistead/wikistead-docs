---
title: Members & invites
documented-surfaces: [admin-surface:members, web-route:/invite]
screens:
  admin-surface:members: [suspend, reactivate, resetFactors, sendInvite]
---

**Admin → Members** (admins) is the workspace's member directory: invite, assign roles, suspend, and reset a locked-out member's second factors.

## Inviting

Invites go out by email and carry a **role**; the invitee proves their identity through one of the workspace's [sign-in methods](/admin/sign-in-methods/) and lands with that role. Where the plan has a seat limit, creating an invite over the cap **warns** — the limit is enforced at the moment the invite is *accepted*, because that is when a seat is actually taken. **Send invite** sends it.

## The roster

Each row is one member: identity, role, and whether they hold a second factor — so you can see who a factor-requirement would lock out *before* you flip it. Guests are deliberately absent: people arriving over [share links](/guides/share-links/) are not members and never appear here.

## Suspending

**Suspend** is reversible and non-destructive: the member loses access, their content and history stay, and **Bring back** restores them. Nothing about leaving destroys knowledge.

## Second-factor reset

An admin can **Reset two-factor authentication** from a member's row — the recovery path when a phone is lost. The member signs in with their remaining door and enrols factors afresh. (Members remove their own factors in [account settings](/settings/account/); this reset exists for the locked-out case.)
