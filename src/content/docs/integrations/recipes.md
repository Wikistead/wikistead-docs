---
title: Recipes
---

Three integrations that work with today's product and no added capability. Each names which surface does which half, because the division is not arbitrary: **webhooks tell you something happened, the REST API answers questions, and page bodies are written through [MCP](/integrations/mcp/)**.

## Tell Slack when a page is published

The push half is a webhook; the detail comes from a REST read.

**1. Mint a key.** [Admin → API keys](/admin/api-keys/): grant *pages: read* and nothing else. This integration never writes.

**2. Register the hook.** [Admin → Webhooks](/admin/webhooks/): your endpoint URL, subscribed to `page.published`. Keep the signing secret it gives you.

**3. Verify, then react.** Every delivery carries `x-wikistead-timestamp` and `x-wikistead-signature`. The signature is `sha256=` followed by the HMAC-SHA256 of `<timestamp>.<raw body>`, keyed with your secret — computed over the **raw** body, so verify before parsing:

```js
import { createHmac, timingSafeEqual } from 'node:crypto'

function verify(rawBody, headers, secret) {
  const ts = headers['x-wikistead-timestamp']
  const sent = headers['x-wikistead-signature'] ?? ''
  // Reject replays of an old delivery before spending anything on the body.
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false
  const mine = 'sha256=' + createHmac('sha256', secret).update(`${ts}.${rawBody}`).digest('hex')
  const a = Buffer.from(mine), b = Buffer.from(sent)
  return a.length === b.length && timingSafeEqual(a, b)
}
```

**4. Read what changed.** The event carries ids, not content — deliberately, so a webhook cannot become a content side channel. Fetch the page with the key from step 1:

```bash
curl -H "Authorization: Bearer wks_..." \
  https://team.example.com/api/pages/$PAGE_ID/published
```

Then post the title and link to Slack. Answer the webhook `2xx` as soon as you have verified it — anything else counts as a failed delivery and is retried.

**What you will not see.** Drafts and private pages produce no events at all, so a "someone published something" bot cannot leak work in progress. If your channel looks quiet, that is usually the honest answer rather than a broken hook.

## Have an assistant draft the weekly digest

Page **bodies** are written through the MCP connector, not the REST API — which also means this recipe runs as a person, with that person's permissions, and finishes with a human deciding to publish.

Connect the assistant once ([MCP connector](/integrations/mcp/)), then ask it for the digest. What it does under the hood:

1. `search` for the week's activity, and `list_pages` to see where things live. Both are permission-filtered, so the digest can only mention what you can already read.
2. `create_page` for *Weekly digest — week 34*. It lands as a **draft**, visible to you and to editors of the space.
3. `edit_body` with `op: "append"` to write the sections, one block at a time. It can also `replace_section` under a heading, which is how the digest gets updated rather than duplicated when you ask for a revision.
4. **You** publish — or you edit it first, since the draft is a live page you can open and type into while the assistant is still working.

The order matters and is worth keeping: an assistant that drafts is a colleague, an assistant that publishes is a broadcaster. `publish_page` exists, so an agent *can* be trusted with the last step deliberately; it just is not the default shape of this recipe.

## Keep an external index in sync

The composition of both halves, and the honest limits of each.

- **Trigger**: subscribe to `page.published`, `page.trashed` and `page.deleted`. That is the complete set of moments the readable corpus changes.
- **Fetch**: `GET /api/pages/{pageId}/published` for the Markdown, or `GET /api/pages/{pageId}/export` when you want the page with its attachments. For a first full load, `GET /api/spaces/{spaceId}/export` gives you the whole space at once instead of a walk.
- **Authorise**: one key with *pages: read*, scoped to the spaces you actually index. The key's reach is shown in the console, so an audit six months later does not depend on remembering.
- **Do not** try to push content back through REST: there is no endpoint that writes a page body, because the body is a live collaborative document rather than a field. Write-back is what the MCP `edit_body` tool is for, and it goes through the same editing path a person does.

**Rate limits** apply per key and per workspace ([what each plan includes](/reference/plan-contents/)), so a re-index of a large space should walk at the pace the events arrive rather than in one burst.
