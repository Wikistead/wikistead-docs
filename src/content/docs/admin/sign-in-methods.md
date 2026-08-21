---
title: Authentication
---

**Admin → Authentication** decides how members prove who they are. It opens to admins and to holders of the carved-out *manage connections* power.

## Doors

A workspace offers one or both doors:

- **Email + password** — accounts local to the workspace.
- **Single sign-on (OIDC)** — your organisation's identity provider; members sign in there and arrive here.

The [sign-in screen](/guides/sign-in/) shows exactly the doors enabled here.

### Naming a connection

Every single sign-on connection you add carries a **name**, and that name is the button members press. Give it the word your organisation already uses for the provider ("Acme SSO", "Corp IdP") rather than a description of the technology — someone arriving at the sign-in screen has to recognise it before they press it.

Connections created before names were required are marked on this screen until you give them one. They keep signing people in meanwhile; what they lack is a label, and the sign-in screen calls each of them the generic "single sign-on" until it has one, which reads the same for two of them.

Google and Microsoft connections are the exception: they wear their own fixed branding and take no name.

## Second factors

The same tab holds the two-factor policy:

- **Stance** — second factors *required* or *optional* for password sign-ins. Turning the requirement **on** shows who it would lock out (members with no enrolled factor, counted from the roster) before you commit; turning it **off** asks for confirmation too, because lowering security deserves one.
- **Accepted methods** — authenticator app (TOTP) only, **passkeys** only, or both. The picker warns, with member counts, when a choice would strand people whose enrolled factors are no longer accepted.

Two guardrails are built in:

- The door and the enrolment endpoints *reject* methods the policy excludes — hiding them from the screen is convenience, the server is the wall.
- **Passkey-only workspaces cannot migrate to a new domain unchecked**: passkeys are bound to the domain they were registered on, so a domain move would lock out everyone. The flow refuses that combination instead of letting a confirmation click strand the whole tenant.

## Recovery

A member who loses their factor is restored by an admin's [factor reset](/admin/members/); an admin who loses their *door* follows the operator break-glass path in the self-hosting guide.
