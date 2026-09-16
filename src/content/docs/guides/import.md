---
title: Importing from another tool
documented-surfaces: [capability:import:obsidian, capability:import:notion, capability:import:confluence, capability:import:docmost, capability:import:outline, doc-code-map:import-dialects-and-the-fidelity-report, doc-code-map:import-screen]
---

Upload an export from another wiki and Wikistead recreates it as pages in a space. The format is
recognised from the archive itself, so you upload the file your old tool gave you.

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
it, and the reading view and exports show nothing until the page is published.

The report at the end names what did not survive, item by item:

- **Links between imported pages are rewritten** to point at their new pages. A link that pointed
  outside the export is left as it was and counted.
- **Attachments come across** and are re-uploaded through the normal upload path, so the storage
  quota applies. A file the quota refuses is listed with its reason.
- **A feature of the tool you are leaving that Wikistead has no equivalent for is named.** An
  Obsidian Canvas or a Dataview block, or a Confluence macro Wikistead cannot interpret. None of
  these becomes a page; the report says which page each one was on and what it was.
- **Markup we cannot read is named too, and the archive still comes in.** Confluence's older storage
  format (`ac:` tags) sometimes survives inside an HTML export. Those elements are not converted; the
  report names each one, the text inside them is kept, and the rest of the archive imports normally.
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

One import runs per space at a time. A second upload while one is running is refused, and the screen
takes you to the import that is already running so you can watch it finish.

## Permissions

Importing requires edit access to the target space; the same permission rules apply as when a person
writes the pages. Guests cannot import.
