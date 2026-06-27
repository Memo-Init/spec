---
title: "Diagrams"
description: "A diagram is one of the cheapest ways to turn a paragraph of reasoning into something a reader grasps at a glance, and the viewer renders a wide range of diagram types with no extra work. Yet in..."
spec_version: "0.1.0"
spec_file: "40-diagrams.md"
order: 40
section: "Specification"
normative: false
generated_at: "2026-06-27T10:49:50.670Z"
generated_from: "spec/v0.1.0/40-diagrams.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/40-diagrams.md."
---


> **Informative.** This chapter offers diagram **recommendations**, not rules. Its purpose is to make the diagram variety the viewer already supports actually get used. The guidance lives here, in the open specification, rather than buried in a private skill, so that it is transparent and shared. Nothing in this chapter is a new normative requirement; the existing authoring rules in [35-memo-authoring.md](/specification/memo-authoring/) (portrait orientation, diagrams as first-class content) remain the binding ones.

A diagram is one of the cheapest ways to turn a paragraph of reasoning into something a reader grasps at a glance, and the viewer renders a wide range of diagram types with no extra work. Yet in practice the same one or two diagram shapes get reached for every time, and the rest of the range sits unused. The gap has never been capability — it is guidance: knowing which kind of picture fits which kind of question. This chapter closes that gap by stating, in the open, when a diagram helps and which type fits which intent.

---

## The Leading Question

Before adding a diagram to a topic, a blog post, or a memo chapter, ask one question:

> **Does a diagram or visual help the reader make a more informed or a faster decision?**

The answer routes the choice:

- **Yes** — include the diagram. A picture that speeds up or sharpens a decision earns its place.
- **No, or unclear** — check whether a *different* diagram type fits the intent better (the matrix below helps). When still in doubt, leave it out. A decorative diagram that carries no decision is noise.

There is a useful diagnostic hidden in this question. If, for a given topic, **no** diagram type fits at all — nothing structural, behavioural, quantitative, or temporal seems to apply — that is often a signal that the topic is **not yet thought through**. A well-understood topic almost always has a shape that some diagram can show. An inability to find any fitting visual is worth treating as feedback on the thinking, not only on the picture.

---

## Diagram Intent → Type

Pick the diagram from the **intent**, not from habit. The matrix below maps the intent a diagram serves to the concrete types that fit it. The Mermaid types are rendered by the viewer directly; the Vega entry is for quantitative charts.

| Intent | What you are showing | Fitting types |
|--------|----------------------|---------------|
| **Structure** | How parts relate, what contains what, system shape | Mermaid `flowchart`, C4-style diagrams |
| **Behavior** | How something moves through states, an ordered exchange | Mermaid `stateDiagram`, `sequenceDiagram` |
| **Data** | Entities and their relationships, the shape of a model | Mermaid `erDiagram`, `classDiagram` |
| **Time** | Order over time, a schedule, a path through stages | Mermaid `timeline`, `gantt`, `journey` |
| **Comparison** | Items placed against one or two axes, a quantitative measurement | Mermaid `quadrantChart`, Vega-Lite chart |

The matrix is a starting point, not an exhaustive list. The point is to choose by asking "what is the intent here?" and then reaching for the type that fits, rather than rendering everything as the one flowchart that happens to be familiar.

---

## Best Type Per Concept

The intent table above is general; this one is sharper. For the concepts that recur in these specifications, there is usually a single **best** Mermaid type — the one whose built-in shape *is* the idea, so the diagram needs no convention to be read. Reach for it first:

| Concept | Best type | Why it fits |
|---------|-----------|-------------|
| **Inheritance / tier model** (a base extended by layers above it) | `classDiagram` | the inheritance arrow (`<|--`) is exactly an extends-chain; no other type states "extends" natively. |
| **Gate / identity state** (ALLOW · DENY · fail-open; resolve → pinned → fixed) | `stateDiagram-v2` | a gate is a state machine, and a redirecting DENY is a self-loop back to the decision. |
| **Requirements** (`REQ-*` codes and what satisfies them) | `requirementDiagram` | the only type built for requirement → satisfier/verifier links — the highest-value type that usually sits unused. |
| **Folder tree / hierarchy** | `mindmap` | an indentation-based tree reads a containment hierarchy at a glance. |
| **Config cascade / layered structure** (base + overlays merged in order) | `block-beta` | stacked blocks show an overlay/merge order as a literal stack. |
| **Before / after, ordered exchange** (one call through two checkpoints) | `sequenceDiagram` | participants over a time axis are exactly an ordered exchange. |
| **Decision trees & linear pipelines** | `flowchart` | branch-and-merge logic and step sequences are what a flowchart is for. |

A **flowchart is justified only for genuine decision-trees and linear pipelines** — a `doctor` step sequence, a push gate's decision table, a branch on a condition. For every other intent above, the flowchart is the *wrong* default: pick the type whose shape already carries the meaning. These specifications now **dogfood the map** — `classDiagram`, `stateDiagram-v2`, `requirementDiagram`, `mindmap`, `block-beta`, and `sequenceDiagram` each appear as a worked example across the Session and Workbench families, so the variety is demonstrated, not only recommended. Generated-image and Excalidraw-style renderings stay **out of scope** for spec content (see "What the Viewer Renders" below); the map is Mermaid-only.

---

## Three Normative Contract Blocks

Diagrams are the *visual* shape-givers in these specifications. Beyond them, the spec carries three **normative contract code-blocks** — fenced templates that are **MUST** and lint-enforced, the textual counterpart to the diagram guidance here. They are named in one place so the "contract block" idea is visible alongside the diagram map; their definitions live on their own pages and are not restated:

- **The SOP-Page-Contract** — the required Setup / Health / Update / Extras + entry-points shape every SOP entry-point page realizes ([session · common-denominator](/session/common-denominator/)).
- **The Folder-Page-Contract** — the Name · Status · Level · Entry-point · Convention · Purpose fields every per-folder page opens with ([session · conventions](/session/conventions/)).
- **The Config boilerplate** — the annotated `.session/config.json` (JSONC) the cascade pages anchor on ([session · config-cascade](/session/config-cascade/)).

Unlike this chapter — which is informative diagram *guidance* — those three blocks are binding shapes a lint gate checks. They are referenced here, not duplicated.

---

## A Diagram Is a Decision Tool

Treat a diagram as a **decision tool**, not as illustration added after the fact. Its job is to make a choice clearer or quicker for whoever reads it — the developer weighing options, a future reader reconstructing why something is shaped the way it is.

Because a diagram is a decision tool, **several diagrams from different perspectives are explicitly encouraged**. A topic rarely has a single correct view: one diagram may show the structure, another the behaviour over time, a third the comparison that motivated the decision. Drawing two or three quick views of the same thing from different angles is a fast, visual way to work a perspective out — and it is cheap, because each diagram is a small fenced block. Reaching for *multiple* diagrams is a feature of good authoring, not redundancy to be trimmed.

---

## What the Viewer Renders, and What Stays Out of Scope

The viewer renders Mermaid (version 11.4.1) and all of its diagram types with **zero code work** — every fenced `mermaid` block becomes an SVG, and the matrix above lists types the viewer already supports today. The variety has always been available; the missing piece was guidance on using it, which is what this chapter supplies.

A few orientation and scope conventions hold:

- **Portrait is the default.** Diagrams are authored portrait (top-down) so they fit the viewer's narrow reading column without horizontal scrolling. This is the binding authoring rule from [35-memo-authoring.md](/specification/memo-authoring/); the recommendations here sit on top of it, they do not relax it.
- **Mermaid is preferred because it is code-near and human-verifiable.** A Mermaid diagram is text, diffs cleanly, and a reader can verify it against the system by reading it. Generated-image diagrams (for example a model-rendered picture of an architecture) stay **out of scope** for spec and memo content for exactly that reason: they are opaque, cannot be diffed, and cannot be verified by reading.
- **Art and hand-drawn styles stay decoupled.** Excalidraw-style or artistic renderings have their place in **docs, blog posts, and marketing**, where the audience and intent differ. They are deliberately kept separate from the memo and spec layer, whose diagrams are working decision tools rather than presentation pieces.

---

## Structure First, Color Later — Also for Mockups

The structure-before-color habit that already governs diagrams is the same discipline that governs UI mockups. A diagram is worked out as black-and-white structure first, and color is added only once the shape is right; a UI mockup follows the identical staging — a black-and-white wireframe first, color and refinement later. The reason is the same in both cases: settling the structure before the polish keeps the early conversation about what the picture *says*, not about how it looks. The asset side of this — where those mockups and exported diagrams are stored — is the `media/` asset convention in [06-memo-structure.md](/specification/memo-structure/).

---

## Related

- [35-memo-authoring.md](/specification/memo-authoring/) — diagrams as first-class memo content and the portrait-orientation rule these recommendations build on.
- [21-human-computer-interaction.md](/specification/human-computer-interaction/) — the canonical interaction diagram, a worked reference for Mermaid style.
- [06-memo-structure.md](/specification/memo-structure/) — the `media/` folder where exported or generated assets live.
- [00-overview.md](/specification/overview/) — conformance language and the Informative/Normative marking.
