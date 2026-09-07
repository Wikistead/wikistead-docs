---
title: Drawings
documented-surfaces: [macro:fence:excalidraw]
---

For sketches, whiteboards and boxes-and-arrows, Wikistead embeds [Excalidraw](https://excalidraw.com/) — the hand-drawn-style canvas — as a fenced block:

````md
```excalidraw
```
````

![A stored scene, rendered on the page.](../../../assets/screenshots/drawings.png)

You never write the block by hand. Insert a drawing from the editor's macro palette, then press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> (or the edit control on the block) to open the full Excalidraw canvas in a modal: shapes, arrows, freehand, text, the whole tool. Close the modal and the drawing renders in place in the page.

## What is stored

The fence body is the drawing's scene data (Excalidraw's own JSON). That means:

- The page remains one plain-text Markdown document — a drawing is data inside a fence, not a binary attachment.
- The scene is portable: the same JSON opens in Excalidraw anywhere.
- Version history and collaboration treat the drawing like any other text edit.

## Collaborating on a drawing

While the modal is open, edits flow live — two people can work the same canvas at once, and the result is written back into the page when the drawing closes.

## Theme

Strokes drawn in the default colour follow the reader's light/dark theme, so a sketch made in dark mode does not vanish on a light screen. Colours you picked explicitly stay exactly as picked.
