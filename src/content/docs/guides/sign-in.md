---
title: Signing in
---

Members sign in at `/login`. Which doors the screen offers is your admin's choice ([Admin → Sign-in methods](/admin/sign-in-methods/)): **email + password**, **single sign-on** through your organisation's identity provider, or both.

Guests never see this screen — a [share link](/guides/share-links/) needs no account at all.

## Joining a workspace

You become a member through an **invitation**: follow the invite link, prove who you are through one of the tenant's sign-in methods, and you land in the workspace with the role the invite carried. Accounts are not open-registration — someone lets you in.

## Second factors

If the workspace requires (or offers) a second factor, you will meet it right after the password step:

- **Authenticator app (TOTP)** — six digits from your phone.
- **Passkeys** — your device's Face ID / fingerprint / security key; where the policy allows passkey-only, this is the entire second step.

Which methods are accepted — authenticator only, passkeys only, or both — is tenant policy. You enrol and manage your factors in [account settings](/settings/account/); if the policy demands a factor you have not enrolled yet, sign-in walks you through enrolment first.

## Locked out?

- **Forgot password** on the sign-in screen starts an email reset (for password-door tenants).
- Lost second factor: another admin can reset your factors from the members screen.
- For the operator-level break-glass path (the last admin locked out), see the self-hosting guide in the source repository.
