---
title: How to get help
documented-surfaces: none  # where to ask for help, not a product surface
---

## Where to ask

- **A question, or something that might be a bug** — open an issue on the
  [repository](https://github.com/wikistead/wikistead/issues). Questions are welcome there; a
  question that turns out to be a defect becomes one without anybody re-filing it.
- **A security problem** — do **not** open an issue. Follow
  [SECURITY.md](https://github.com/wikistead/wikistead/blob/main/SECURITY.md), which says where to
  send it and what to expect.
- **Something in the documentation is wrong** — that is a bug too, and worth reporting. A page that
  describes a screen that no longer exists costs a reader more than a missing page does.

## What to include

The three things that decide whether the first reply is useful:

1. **What you saw, and what you expected instead.** The exact message, if there was one.
2. **How you are running it** — self-hosted or hosted, and for self-hosted, how (the compose profile,
   Kubernetes, something of your own) and which version.
3. **Whether it happens again.** Once is a report; every time is a reproduction, and the difference
   changes what anybody can do about it.

If the server logged something, include the log line rather than a summary of it. The messages are
written to be diagnostic — several of them name the exact setting that is wrong.

## What not to include

Secrets. Not the encryption key, not a token, not a database URL with a password in it. If a
configuration file is relevant, replace the values and say that you did.
