---
title: Access transparency
sidebar:
  badge:
    text: EE
    variant: tip
wikisteadEeLevers:
  - accessTransparency
---

When the operator touches your tenant, the access is disclosed to you.

:::tip[EE]
This capability ships in the Cloud/Enterprise edition. This page describes what it does; how it is built is not part of the docs.
:::

## What it is

Running a managed service sometimes requires the operator's break-glass access to a customer tenant — an incident, a legal obligation, a rescue. Access transparency turns that from something you trust into something you can **see**: every operator access to your tenant appears in a disclosure log inside your own admin console, with when and under what justification.

## Verifiable

Like the [audit log](/admin/audit-log/), the disclosure record is hash-chained and verifiable from the console — the operator cannot quietly trim its own trail.

## Where and who

The disclosure log lives on the **Admin → Audit log** tab, beside the workspace's own ledger — for admins and holders of the *view audit* power, where the workspace is entitled.
