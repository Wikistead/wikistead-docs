---
title: Diagrams
documented-surfaces: [macro:fence:mermaid, macro:fence:plantuml]
---

Diagrams are fenced code blocks with a language tag — standard Markdown, rendered in place. The text stays the canonical form; the picture is derived from it.

## Mermaid

````md
```mermaid
graph LR
  Draft --> Review --> Launch
  Review --> Draft
```
````

![The fence above, rendered.](../../../assets/screenshots/diagrams.png)

Mermaid renders directly in the editor — flowcharts, sequence diagrams, state machines and the rest of the Mermaid language. The block renders as a diagram; putting the caret on it (or pressing <kbd>Ctrl</kbd>+<kbd>Enter</kbd>) opens the source for editing, with the rendering updating as you type.

## PlantUML

````md
```plantuml
@startuml
Alice -> Bob: hello
@enduml
```
````

PlantUML is different by design: its renderer cannot be bundled (GPL, and it needs a Java runtime), so **by default the block shows its source** — always-valid Markdown, no external dependency. When your operator configures an external render service (Kroki or a PlantUML server) in the deployment, the same block renders as a diagram. Either way the text in the page is identical, so documents move between deployments without edits.

## Why fences?

A diagram-as-code-fence is portable: any Markdown tool shows at least the source, GitHub renders Mermaid natively, and exports carry the block verbatim. You are never locked into Wikistead to read your own diagrams.

For freehand drawing (boxes and arrows with a mouse), see [Drawings](/editor/drawings/).
