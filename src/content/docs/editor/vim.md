---
title: Vim mode
---

Wikistead ships a real Vim mode — modal editing on top of CodeMirror's Vim engine, not a veneer of keybindings. Toggle it with the **Vim** switch in the editor's bottom bar; the setting is yours (per account), and flipping it mid-session never disconnects you from the live document — collaboration and presence keep running through the toggle.

## What works

Normal / insert / visual modes, motions, operators, counts, registers, search — the Vim vocabulary you expect from the underlying engine, applied to a document that is rendering itself as you type.

## Vim among the macros

The interesting part is how Vim meets the rendered blocks. A table, diagram, drawing or layout container is an **atom** to Vim:

- `j` / `k` cross a rendered block as **one** motion stop — a fifty-line diagram is one step, not fifty.
- The caret never lands *inside* a rendered widget uninvited; a block is selected as a whole.
- `dd` on a block deletes the whole block — fence, body and all.
- To edit inside one, press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> — the deliberate "enter the block" action.

This keeps the mental model honest: what looks like one thing on screen behaves as one thing under `d`, `y` and movement.

## The system clipboard

Out of the box Vim mode is register-pure: what you copy outside the editor and what you yank inside it stay separate, and `"+y` / `"+p` are the explicit bridge — exactly what a Vim hand expects.

If you would rather have a plain `p` / `P` paste what you copied elsewhere, switch **Settings → Account → Editor → Vim system clipboard** to **Paste**. In that mode a bare URL auto-links on paste, the same as <kbd>Ctrl</kbd>+<kbd>V</kbd>, while counts (`3p`), named registers (`"ap`) and everything else keep Vim's own behaviour. Yank and delete never write the system clipboard in either mode.

## Notes

- Vim mode is per-user: your teammates see the same page, each with their own editing style.
- Inside macro editing surfaces (a table cell, a layout slot), <kbd>Esc</kbd> first leaves Vim's insert mode, then exits the surface — the key does what a Vim hand expects at each level.
