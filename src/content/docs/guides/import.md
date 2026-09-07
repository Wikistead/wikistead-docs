---
title: Importing from another tool
documented-surfaces: [capability:import:obsidian, capability:import:notion, capability:import:confluence, capability:import:docmost, capability:import:outline, doc-code-map:import-dialects-and-the-fidelity-report, doc-code-map:import-screen]
---

Upload an export from another wiki and Wikistead recreates it as pages in a space. Four formats are
recognised from the archive itself, so you upload the file your old tool gave you rather than telling
us what it is.

| Source | What to upload |
|---|---|
| **Obsidian** | A zip of the vault folder |
| **Notion** | The official Markdown & CSV export |
| **Confluence** | The HTML export |
| **Docmost** | The Markdown export of a page or a space |
| **Wikistead** | A zip this product exported (used for moving content between workspaces) |

## Running one

Open the space, then **Space settings → Import**. Choose the archive and start it. The report appears
on that screen when the import finishes.

Imported pages are **published as they arrive**. If you would rather read them over before anybody
else does, turn the publish switch off before starting and everything lands as a draft instead. A
large archive runs as a background job instead of finishing on the spot — see below.

## What arrives, and what does not

**Pages arrive published**, so they are readable the moment the import finishes. In a public space
that also means readable from outside the workspace, and the screen says so before you start.

**If you turn publishing off**, everything lands as a draft: only people who can edit the space see
it, the read surface says the page is empty, and an export of it comes back empty too. All three are
the same fact — a draft has no published version, and that is what those surfaces show.

The report you get at the end names what did not survive, item by item, rather than counting it:

- **Links between imported pages are rewritten** to point at their new pages. A link that pointed
  outside the export is left exactly as it was and counted, rather than guessed at.
- **Attachments come across** and are re-uploaded through the normal upload path, so the storage
  quota applies. A file the quota refuses is listed with its reason — it is never dropped silently.
- **A feature of the tool you are leaving that Wikistead has no equivalent for is named.** An
  Obsidian Canvas or a Dataview block, or a Confluence macro Wikistead cannot interpret. None of
  these becomes a page; the report says which page each one was on and what it was.
- **Markup we cannot read is named too, and the archive still comes in.** Confluence's older storage
  format (`ac:` tags) sometimes survives inside an HTML export. Those elements are not converted, but
  the report names each one and the text inside them is kept, so the pages beside them arrive
  normally rather than the whole upload being refused.
- **Titles** come from the folder and file names unless the archive carries a manifest of its own.
  A Docmost export is the exception in the other direction: its file names cannot hold every
  character a title can (a `/` is dropped), so the title is taken from the heading at the top of each
  file, which is where the original survives. That heading is not repeated in the page body.
- **A Docmost page icon is not carried over.** Pages here do not have one. The report names each page
  that had an icon, so a workspace that used them for navigation can see what to redo.

## Large imports

Up to a couple of hundred pages the import finishes in the request. Above that it becomes a job: you
get an import id immediately and the page follows its progress. **The report outlives the
connection** — closing the tab does not lose it, and the same id shows it again later.

One import runs per space at a time. A second upload while one is running is refused rather than
queued, so two archives cannot interleave into the same tree. The screen then takes you to the import
that is already going, so you can watch that one finish instead of guessing when to try again.

## Permissions

Importing requires edit access to the target space, and every page is created through the same path
the editor uses — so nothing an import writes escapes the rules that apply when a person writes it.
Guests cannot import: the route is closed to share-link visitors entirely.
