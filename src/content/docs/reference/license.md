---
title: License and editions
documented-surfaces: none  # licensing and editions summary, not a product surface
---

## The short version

**The Community Edition is the source published at
[wikistead/wikistead](https://github.com/wikistead/wikistead), and it is AGPL-3.0.** You can run it,
modify it, and host it for your organisation. Enterprise features are proprietary and are not part of
that source.

Every bundled dependency is permissively licensed (MIT, Apache-2.0, BSD, ISC), so the AGPL obligation
concerns this code and not something in a dependency.

## What the Community Edition gives you

The whole product: real-time collaborative editing, spaces and pages, publishing, share links,
search, import from other tools, the API and the AI connector, and the administration console.
Single sign-on (OIDC) through your organisation's identity provider is part of it, configured per workspace.

## Cloud-only features

These five features are available on Cloud plans only. [What each plan includes](/reference/plan-contents/)
is the up-to-date list.

| Capability | What it is |
|---|---|
| **SCIM provisioning** | Members created, updated and deactivated by your directory rather than by hand. |
| **SAML single sign-on** | For organisations whose identity provider speaks SAML rather than OIDC. |
| **Audit log** | A tamper-evident, hash-chained ledger of administrative and security-relevant actions. |
| **Access transparency** | Disclosure to a workspace of operator break-glass access to its data. |
| **Analytics** | Per-viewer page analytics, with guests aggregated rather than named. |

In a Community Edition deployment these screens are **absent**.

## Cloud

Wikistead Cloud runs the same product, with these features available by plan.

## What the AGPL asks of you

If you modify Wikistead and offer it to people over a network, the licence asks you to offer them the
modified source. Running it unmodified for your own organisation asks nothing of you beyond keeping
the notices intact. The full text is in
[LICENSE](https://github.com/wikistead/wikistead/blob/main/LICENSE); this paragraph is a summary
and the text is what binds.
