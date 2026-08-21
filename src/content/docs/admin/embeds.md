---
title: Embeds
---

**Admin → Embeds** (admins) holds the **allowlist of external hosts** that [`:::embed-external`](/editor/embeds/) may load. This list is the workspace's trust decision about third-party content:

- A URL whose host is on the list renders as a **sandboxed iframe** in pages.
- Any other URL **degrades to a plain link** — never a blocked frame, never an arbitrary iframe someone can be tracked or attacked through.

Add the hosts your team actually composes with — the dashboard tool, the video host, the design tool — and nothing else. The narrower this list, the smaller the set of third parties that ever executes inside your pages. Page embeds (`:::embed-page`) are unrelated to this list; they embed your own workspace's pages under each reader's own permissions.
