---
title: SCIM provisioning
sidebar:
  badge:
    text: EE
    variant: tip
wikisteadEeLevers:
  - scim
---

Provision and deprovision members automatically from your IdP over SCIM.

:::tip[EE]
This capability ships in the Cloud/Enterprise edition. This page describes what it does; how it is built is not part of the docs.
:::

## What it does

**Admin → SCIM** is where an entitled workspace issues a **SCIM token** and points its identity provider's provisioning at Wikistead's SCIM 2.0 endpoints. From then on the directory drives the roster:

- A person added to the app in your IdP **becomes a member** without an invite.
- A person removed there is **deactivated** here — offboarding happens where HR already does it, not as a second checklist.
- Attribute updates flow through the same channel.

## Boundaries worth knowing

- SCIM deactivation is the same **reversible, non-destructive** deactivation as the [members screen](/admin/members/): content and history stay.
- A deactivated member's **second factors are not silently deleted** — credential removal is an explicit act, so a rehired member is not quietly weaker than before.
- Guests are untouched by SCIM: they were never directory entries to begin with.

Pair with [SAML SSO](/admin/saml-sso/) for the full IdP-run lifecycle: the directory signs members in, creates them, and switches them off.
