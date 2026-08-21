---
title: Search
---

Search covers page titles and page bodies. Titles outrank bodies, so a page named for what you typed
comes first even when another page repeats the words more often.

## What you can find

**Only what you can already open.** Results are filtered by your access twice: the index is queried
with your visibility, and every hit is confirmed against the authorisation service before it reaches
the screen. A page you cannot view is not a result you see ranked low — it is not a result at all,
and search never becomes a way to learn that a page exists.

Guests searching through a share link are scoped to the space the link opened, for the same reason.

## Japanese, Chinese and Korean

Japanese text has no spaces to split on, so search uses a segmenter rather than whitespace: 東京都
matches a body containing 東京都庁, and スカイツリー matches wherever it appears in the text. The
segmenters for Japanese, Chinese, Korean and English are applied deliberately to titles and bodies
rather than guessed per page — automatic detection is unreliable on short queries and on Japanese
text with a few English words in it, which is most technical writing.

## What is not searched

Draft bodies are not searchable by other people, because a draft is not visible to them at all.
Attachments are indexed by name, not by their contents.
