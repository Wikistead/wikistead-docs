---
title: Search
documented-surfaces: [doc-code-map:search-semantics]
---

Search covers page titles and page bodies. Titles outrank bodies, so a page named for what you typed
comes first even when another page repeats the words more often.

## What you can find

**Only what you can already open.** A page you cannot view is not a result you see ranked low — it
is not a result at all, and search never becomes a way to learn that a page exists.

**Access you hold through a group counts.** A page shared with a group you belong to is findable the
same way a page shared with you directly is.

Guests searching through a share link see results from the space the link opened.

## Japanese, Chinese and Korean

Japanese text has no spaces to split on, so search uses a segmenter rather than whitespace: 東京都
matches a body containing 東京都庁, and スカイツリー matches wherever it appears in the text. Segmentation
for Japanese, Chinese, Korean and English applies to titles and bodies alike, including text that
mixes Japanese with English words.

## What is not searched

Draft bodies are not searchable by other people, because a draft is not visible to them at all.
Attachments are indexed by name, not by their contents.
