---
title: Account settings
documented-surfaces: [web-route:/settings/account/*, capability:factor:totp, capability:factor:passkey, capability:factor:recovery-code, doc-code-map:account-settings]
---

Your personal settings live at **Settings → Account** — everything here is yours alone, and none of it needs an admin. Seven tabs:

| Tab | What it holds |
|---|---|
| **Profile** | Display name (override what your identity provider sent) and avatar. |
| **Editor** | Your editing style — including the [Vim mode](/editor/vim/) keymap toggle. |
| **Theme** | Light / dark / system. |
| **Notifications** | How your [watches](/guides/notifications/) reach you. |
| **API keys** | Personal API keys you hold — issue them here where the workspace allows members to; otherwise the tab lists what you have. |
| **Security** | Your second factors: enrol an authenticator app (TOTP), register passkeys, and remove either. Also your **recovery codes** and **linking sign-in methods** — see below. Which methods the workspace accepts is [tenant policy](/admin/sign-in-methods/). |
| **Data** | **Export everything you can see** as one Markdown ZIP. |

## Recovery codes

If the phone or key holding your second factor is gone, **recovery codes get you back into your own account without anyone else's help.** They are on the Security tab, under your factors.

- **Ten single-use codes, shown once.** Copy them when they appear — nothing can show them to you again. Keep them somewhere you can reach *without* the device you would be recovering from.
- **Creating a set asks you to confirm it is you** — a code from your authenticator, your passkey, or your password. A session on its own is not enough.
- **Using one is a reset, not a shortcut.** It removes *every* second factor from your account, retires the rest of the set, and signs out all your sessions. You then enrol a new authenticator and create a fresh set. This is the same thing an admin's [factor reset](/admin/members/) does — you can just do it yourself.
- **You are emailed when a set is created and when a code is used.** If either message arrives and it was not you, that is the signal to act.
- **Creating a new set retires the one you have.** There is never more than one live set, so a printout you replaced is worthless.
- **Everyone who can hold a second factor can hold codes**, whatever their role.
- **Self-hosting:** on by default. An operator who wants admin-reset-only can set `SECOND_FACTOR_RECOVERY=off`, and the tab says so.

## Linking a sign-in method

If you signed in with a password, you can add one of the workspace's OIDC sign-in methods to your same account — or the other way round — instead of ending up with two separate accounts.

- **Add it from here, not from a fresh sign-in.** Signing in through a provider tied to an address you already hold never merges accounts on its own; it is refused, and told to come here instead. Linking only ever happens from inside the account you already have.
- **Confirm it is you first** — the same three proofs as recovery codes: an authenticator code, a passkey, or your password. Then you are sent to the provider, and back.
- **It signs in as the SAME member.** Your pages, history and permissions do not change — you have simply gained a second way to reach the same account.
- **An identity already linked to someone else is refused.** Two people cannot claim the same upstream sign-in.
- **Linking clears any display-name override you had set**, and locks the Profile tab's name field to what the provider sends from then on — the same rule that already applies to anyone who signs in through a provider (see Profile above).

## Two things worth knowing

- **Export is available to every member on every plan.** You export what you can read.
- **These settings follow you.** Your keymap, theme and notification preferences are per account, on every device. Admins set policy (which sign-in methods and factors exist); you choose within it.

## Reference

The complete catalog of account settings — every key, type and default — is in the [account settings reference](/reference/account-settings/).
