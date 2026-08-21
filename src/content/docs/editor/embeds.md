---
title: Embeds & transclusion
---

Two directives bring outside content into a page: `:::embed-page` embeds **another Wikistead page**, `:::embed-external` embeds **an allowlisted external URL**. Both are inserted from the macro palette with a picker — the raw form exists for portability, not for hand-typing.

## Embed a page (transclusion)

```md
:::embed-page
<pageId>
:::
```

![In the editor an embed is one selected block: the other page's content, managed as a single object rather than pasted text.](../../../assets/screenshots/embeds.png)


The target page's content renders inside the current one and stays live — edit the source page and every embed follows. Two properties matter:

- **Permission-checked per reader.** An embed never widens access: a reader who cannot view the target page sees nothing there, even if they can view the page containing the embed.
- **The source stays canonical.** The document stores only the reference; exports degrade the embed to a link rather than freezing a copy.

Insert one from the palette (**Embed a page**) and pick the target — retarget any time with <kbd>Ctrl</kbd>+<kbd>Enter</kbd>.

## Embed an external URL

```md
:::embed-external
https://example.com/dashboard
:::
```

External embeds render as a **sandboxed iframe**, and only for hosts your admin has allowlisted (**Admin → Embeds**). A URL whose host is not on the list degrades to a plain link — never a broken frame, and never an arbitrary iframe a visitor can be tracked through.

This is a deliberate trust boundary: embeds are how you compose Wikistead with dashboards, videos and design tools, and the allowlist is how an admin decides which third parties get to run inside your pages.

## Export behaviour

Both embeds **degrade to links** in Markdown/HTML export — the honest representation of content that lives elsewhere (Open formats: an export never contains a broken or privileged frame).
