---
title: Admin console
---

The admin console (**Admin** in the sidebar, `/admin`) is where the workspace itself is run: members, roles, sign-in policy, keys, webhooks, branding, billing.

## Who sees what

The console shows each caller **exactly the surfaces their permissions open** — nothing more, and never a locked tab. Most tabs open to workspace **admins**; a few powers can be carved out and granted on their own, and their holders reach exactly their tab:

- **Sign-in methods** — the *manage connections* power.
- **Roles** — the *manage roles* power.
- **Audit log** — the *view audit* power.

The client does not decide this: it asks the server which surfaces are open and renders that answer, and every route double-checks on entry regardless of what any menu showed.

## The tabs

Members & invites · Spaces · Branding · Authentication · API keys · Webhooks · Audit log *(EE)* · Analytics *(EE)* · Roles · Embeds · Public access · Moderation · Billing · Orphaned drafts — each has its own page in this section; the Public tab is documented under [Publishing](/publishing/public-spaces/).
