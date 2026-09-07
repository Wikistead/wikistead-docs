---
title: MCP connector
documented-surfaces: [capability:mcp:list_spaces, capability:mcp:list_pages, capability:mcp:get_page, capability:mcp:get_backlinks, capability:mcp:search, capability:mcp:get_syntax_reference, capability:mcp:create_page, capability:mcp:publish_page, capability:mcp:edit_body, capability:mcp:create_comment]
---

Wikistead speaks **MCP** (Model Context Protocol), so an assistant that supports it — Claude, an editor extension, your own agent — can read your workspace and draft into it *as you*, without anyone pasting page contents into a chat window.

## Connecting

Point the assistant at your workspace's MCP endpoint, `https://<your-workspace-host>/api/mcp`. Authorisation is OAuth: the assistant discovers the endpoints from the workspace itself, registers, and sends you through a normal sign-in and consent screen. What comes back is a token bound to **you** — it is not a workspace-wide key, and it grants nothing you do not already have.

Whether a member may connect an assistant at all is an admin decision, taken per sign-in connection: **Admin → Authentication** carries an *AI tool access (MCP)* switch on each connection. Turning it off refuses the connector to everyone who signs in that way, without touching how they sign in.

## The tools

| Tool | What it does |
| --- | --- |
| `list_spaces`, `list_pages` | Find the way around the workspace |
| `get_page` | Read a page's published Markdown |
| `search` | Full-text search, permission-filtered like the search box |
| `get_backlinks` | What links here |
| `get_syntax_reference` | The macro notation, generated from the live registry |
| `create_page` | Create a page (it lands as a draft) |
| `edit_body` | Append a block, or replace the section under a heading, in a page's **draft** |
| `publish_page` | Record a public revision of a draft |
| `create_comment` | Comment on a page |

The read tools work on every plan. The **write tools depend on the plan** (`mcpWrite` — see [what each plan includes](/reference/plan-contents/)); where they are off, the read tools and everything already created keep working.

## What an assistant cannot do

- **It cannot exceed you.** Every tool call is checked against your permissions at call time. A page you cannot edit is a page the assistant cannot edit, and it is refused with the same uninformative answer a stranger gets — the assistant does not learn that the page exists.
- **It cannot publish by accident.** `edit_body` writes the *draft*. Publishing is a separate tool call, so "the assistant tidied the page" and "the assistant changed what readers see" are two different events, and the second one is recorded as a revision with an author.
- **It cannot invent notation.** `get_syntax_reference` is generated from the same macro registry the editor uses, so an assistant writing a callout or a table writes the notation this product actually parses.

## Working with drafts

`edit_body` edits the live draft, which means an editor with the page open sees the change appear as it happens — the assistant is another cursor, not a background process rewriting files. Two consequences worth knowing:

- Edits are **additive by shape**: append a block, or replace one heading's section. There is no "rewrite the whole page" call, so an assistant cannot quietly discard the parts it was not asked about.
- If the collaboration service is momentarily unreachable the tool says so and the assistant can retry. It never falls back to overwriting the published text.
