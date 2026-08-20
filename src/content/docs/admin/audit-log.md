---
title: Audit log
sidebar:
  badge:
    text: EE
    variant: tip
wikisteadEeLevers:
  - auditLog
---

A tamper-evident ledger of administrative and security-relevant actions — who did what, to what, when.

:::tip[EE]
This capability ships in the Cloud/Enterprise edition. This page describes what it does; how it is built is not part of the docs.
:::

## What it records

Security-relevant operations across the workspace: membership and role changes, sign-in policy changes (with before/after values), share-link and access events, administrative configuration. Each entry names the actor, the action, the target and the time.

## Tamper-evident

Entries form a **hash chain**: each one is cryptographically bound to everything before it, and the console can verify the chain end to end. An edited or removed entry breaks verification — the log can prove not only what happened, but that nobody rewrote the record of it.

## Where and who

**Admin → Audit log.** It opens to admins and to holders of the carved-out *view audit* power — so a compliance reviewer can read the ledger without holding any other administrative capability.
