---
title: Pages
---

A page is one Markdown document in a space's tree — drafted, published, linked, revised and exported as a unit.

## Drafts and publishing

A new page starts as a **draft**: visible to its creator only, marked with a draft badge. Press **Publish** to make it visible to everyone the space admits. Editing a published page marks it as having unpublished changes until you publish again — readers keep seeing the last published state while you work.

## Links that make themselves

Wikistead is link-first, and the cheapest link is a **mention**: write another page's title in your text and the title becomes a link to it. No bracket syntax to remember — naming a page *is* linking to it. Hovering a page link shows a preview card.

Every link feeds the reverse index: the page's **Related** panel lists its **backlinks** — every place this page is referenced — so a page always knows who points at it.

## Revisions

Publishing records a **revision**. The page's history lists every published version; open one to read it, compare, and **restore** it if needed. Nothing is ever silently rewritten — history is append-only, and drafts do not spam it (versions are cut when you publish, not on every keystroke).

## Structure

Pages nest into a tree per space. Drag a page in the sidebar to reparent or reorder it; a page's direct children can also be listed inside the page with [`:::children`](/editor/page-lists/). Deleting a page moves it to the space's trash.

## Getting content out

The page **⋯ menu** exports the current page as **Markdown** or **HTML** — the same document you wrote, not a lossy render. Macros degrade honestly (a diagram exports its source; an embed exports a link). Whole-space static export is part of [publishing](/publishing/public-spaces/).

## Comments

Readers with comment capability discuss a page in its comment panel — including anonymous guests arriving over a [share link](/guides/share-links/) whose capability allows it.
