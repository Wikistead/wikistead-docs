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
| **Security** | Your second factors: enrol an authenticator app (TOTP), register passkeys, and remove either. Also your **recovery codes** — see below. Which methods the workspace accepts is [tenant policy](/admin/sign-in-methods/). |
| **Data** | **Export everything you can see** as one Markdown ZIP. |

## Recovery codes

If the phone or key holding your second factor is gone, **recovery codes get you back into your own account without anyone else's help.** They are on the Security tab, under your factors.

- **Ten single-use codes, shown once.** Copy them when they appear — nothing can show them to you again. Keep them somewhere you can reach *without* the device you would be recovering from.
- **Creating a set asks you to confirm it is you** — a code from your authenticator, your passkey, or your password. A session on its own is not enough; if it were, anyone who took your session could mint themselves a permanent way past your second factor.
- **Using one is a reset, not a shortcut.** It removes *every* second factor from your account, retires the rest of the set, and signs out all your sessions. You then enrol a new authenticator and create a fresh set. This is the same thing an admin's [factor reset](/admin/members/) does — you can just do it yourself.
- **You are emailed when a set is created and when a code is used.** If either message arrives and it was not you, that is the signal to act.
- **Creating a new set retires the one you have.** There is never more than one live set, so a printout you replaced is worthless.
- **Everyone who can hold a second factor can hold codes.** Not admins only, and not dependent on how many people are in the workspace: losing a device has nothing to do with your role or your colleagues, who cannot find your phone either.
- **Self-hosting:** on by default. An operator who wants admin-reset-only can set `SECOND_FACTOR_RECOVERY=off`, and the tab says so rather than offering a button that would be refused.

## Two things worth knowing

- **The export is deliberately personal.** Taking your visible knowledge out is every member's right on every plan (Open formats) — which is why it lives here and not in the admin console. It is view-filtered: you export what you can read.
- **Settings are per-account, not per-workspace-fiat.** Your keymap, theme and notification preferences follow *you*; admins decide policy (which sign-in doors and factor methods exist), you decide preference within it.

## Reference

The complete catalog of account settings — every key, type and default — is in the [account settings reference](/reference/account-settings/).
