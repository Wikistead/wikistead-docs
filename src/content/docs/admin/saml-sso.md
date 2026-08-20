---
title: SAML SSO
sidebar:
  badge:
    text: EE
    variant: tip
wikisteadEeLevers:
  - samlSso
---

Sign in through your identity provider over SAML.

:::tip[EE]
This capability ships in the Cloud/Enterprise edition. This page describes what it does; how it is built is not part of the docs.
:::

## What it does

An entitled workspace can register its organisation's SAML identity provider as a sign-in door: members authenticate at the IdP (Okta, Entra ID, and the rest of the SAML world) and arrive in Wikistead — no workspace-local password involved. Configuration is per workspace, alongside the other [sign-in methods](/admin/sign-in-methods/).

For OIDC-speaking identity providers, [OIDC single sign-on](/admin/sign-in-methods/) is available without the Enterprise edition; SAML exists for the organisations whose IdP or policy requires it.

## Related

Pair with [SCIM provisioning](/admin/scim-provisioning/) so the directory that signs your members in also creates and deactivates them.
