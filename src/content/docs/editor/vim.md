---
title: Vim mode
documented-surfaces: none  # no ledger surface of its own; its settings live on settings/account.md
---

Turn it on with **Vim** in the editor's toolbar, or press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>V</kbd> — rebindable in Settings → Account → Editor, and only live while you are actually editing (it does nothing while you are reading).

**Vim is unavailable on touch devices and in WYSIWYG mode.** The button stays visible, disabled, with a tooltip naming which of the two applies. Switch to Live or Source view, or use a keyboard and mouse, and it comes back on its own — your Vim preference is untouched either way.

## Where it starts

Settings → Account → Editor → **Keymap**:

- **Follow this device's last choice**
- **Always start in Vim**
- **Always start off**

## Saving and quitting

`:w` publishes and keeps you in the editor. `:wq` publishes and returns you to the page. `:q` leaves the editor without publishing.

## The system clipboard

Settings → Account → Editor → **Vim system clipboard**:

- **Off** (default) — yanks and deletes stay in Vim's own registers; `"+y` / `"+p` are the bridge to the system clipboard.
- **Paste** — a bare `p` / `P` pastes what you copied outside the editor instead (a bare URL auto-links, the same as <kbd>Ctrl</kbd>+<kbd>V</kbd>); counts, named registers and everything else still work the way Vim always does.

## Other settings, same tab

- **Monospace while vim is on** — on by default, so the font itself tells you which mode you're in.
- You can hide the **Vim** button for yourself; the shortcut keeps working either way.

## Notes

- Inside a table cell or another macro's editing surface, <kbd>Esc</kbd> leaves Vim's insert mode first and the surface itself second.
- A rendered table, diagram or drawing moves and deletes as a single block under Vim's motions — see [When something breaks](/guides/troubleshooting/) if that surprises you mid-edit.
