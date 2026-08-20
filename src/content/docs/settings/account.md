---
title: Account settings
---

Your personal settings live at **Settings → Account** — everything here is yours alone, and none of it needs an admin. Seven tabs:

| Tab | What it holds |
|---|---|
| **Profile** | Display name (override what your identity provider sent) and avatar. |
| **Editor** | Your editing style — including the [Vim mode](/editor/vim/) keymap toggle. |
| **Theme** | Light / dark / system. |
| **Notifications** | How your [watches](/guides/notifications/) reach you. |
| **API keys** | Personal API keys you hold — issue them here where the workspace allows members to; otherwise the tab lists what you have. |
| **Security** | Your second factors: enrol an authenticator app (TOTP), register passkeys, and remove either. Which methods the workspace accepts is [tenant policy](/admin/sign-in-methods/). |
| **Data** | **Export everything you can see** as one Markdown ZIP. |

## Two things worth knowing

- **The export is deliberately personal.** Taking your visible knowledge out is every member's right on every plan (Open formats) — which is why it lives here and not in the admin console. It is view-filtered: you export what you can read.
- **Settings are per-account, not per-workspace-fiat.** Your keymap, theme and notification preferences follow *you*; admins decide policy (which sign-in doors and factor methods exist), you decide preference within it.

## Reference

The complete, generated catalog of account settings — every key, type and default, extracted from the released code — is in the [account settings reference](/reference/generated/account-settings/).
