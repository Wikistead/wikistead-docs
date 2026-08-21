---
title: Composing Wikistead with other tools
---

Wikistead is built to sit *inside* your toolchain rather than replace it. Three surfaces do that work, and they are deliberately different from each other:

| Surface | Direction | Reach for it when |
| --- | --- | --- |
| [REST API](/integrations/recipes/#keep-an-external-index-in-sync) | You call Wikistead | A script needs to read, search, list or create — on your schedule |
| [Webhooks](/admin/webhooks/) | Wikistead calls you | Something happened and another system should react to it |
| [MCP connector](/integrations/mcp/) | An assistant works as you | An LLM assistant should read the workspace, and draft into it |

They compose. A webhook tells your service that a page was published; your service calls the REST API to read it; an assistant connected over MCP drafts the follow-up page for a human to publish. Nothing in that chain needed a Wikistead plugin — the [recipes](/integrations/recipes/) walk three of them end to end.

## One rule underneath all three

**Every surface is permission-checked the same way.** An API key reaches only what it was minted for and only what its holder could reach; a webhook never carries a draft or private page; an MCP tool acts as the member who authorised the connection and is refused whatever that member is refused. There is no integration path that sees more than a person would.

That rule is why the three surfaces can be handed out freely: giving a script a key, or an assistant a connection, does not create a second permission system to audit.

## Where the details live

- **API keys**: minting, narrowing by resource kind and space, revocation — [Admin → API keys](/admin/api-keys/).
- **Webhook events**: everything you can subscribe to is listed in [webhook events](/reference/webhook-events/).
- **REST canon**: the request-by-request specification is [`docs/api-reference.md`](https://github.com/wikistead/wikistead/blob/main/docs/api-reference.md) and its OpenAPI document in the source repository.
