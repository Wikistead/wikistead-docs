---
title: Roles
---

**Admin → Roles** shows every role the workspace knows — built-in and custom under **one framework** — and opens to admins and holders of the carved-out *manage roles* power.

## The model

- **One principal, one role.** A member holds exactly one role; changing it is a swap, never an accumulation.
- A role is a **named bundle of capabilities** — view, comment, edit, publish, delete, share, settings, moderate. Built-ins cover the common shapes; **custom roles** let you name your own bundle (the *reviewer* who comments and publishes but never edits).
- Roles choose what gets granted; the authorization system itself remains the single source of truth for every access decision. Grants already made keep working exactly as written even if the role that minted them changes later.

## Custom roles and plans

Defining and assigning custom roles depends on the plan (see [what each plan includes](/reference/plan-contents/)); built-in roles are free on every plan. On downgrade nothing is ripped out — already-assigned grants keep working, and only *new* definitions and assignments are gated.
