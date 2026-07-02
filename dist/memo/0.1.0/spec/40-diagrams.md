---
title: "Diagrams"
description: "A diagram is one of the cheapest ways to turn a paragraph of reasoning into something a reader grasps at a glance, and the viewer renders a wide range of diagram types with no extra work. Yet in..."
spec_version: "0.1.0"
spec_file: "40-diagrams.md"
order: 40
section: "Specification"
normative: true
generated_at: "2026-07-02T15:15:37.997Z"
generated_from: "draft/memo/0.1.0/spec/40-diagrams.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/40-diagrams.md."
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

## Conformity Requirements

This chapter is **informative** — its recommendations introduce no new blocker. What the few blocks below do is **lift already-declared diagram rules** into machine-readable, harvestable form ([23-requirements.md](/specification/requirements/)): the diagram-category entries the requirements chapter already lists ("diagram labels are in the artifact's language; the diagram type fits the data flow") and the decision-tool intent of this chapter. They are authored at **advisory strength** (`warning` / `info`), consistent with the informative framing, and they add no force beyond the binding portrait-orientation rule that the memo-authoring chapter owns — that rule is referenced, not restated here. Generated-image and artistic renderings remain out of scope, so these blocks are Mermaid-and-Vega only.

The core discipline is choosing the type from the **intent**, not from habit; whether a type fits is a quality spectrum a fresh-context reviewer judges, so this rule earns an object `grade`:

```requirement
{
  "id": "REQ-894",
  "title": "Diagram type fits the intent",
  "statement": "A diagram SHOULD be chosen so its built-in shape carries the intent — structure, behavior, data, time, or comparison — reaching for the best-fit Mermaid type for the concept rather than defaulting every picture to a flowchart; a flowchart is justified only for genuine decision-trees and linear pipelines.",
  "scope": { "repos": [], "categories": ["diagram"], "tags": ["diagram", "type-fit"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer reads the diagram and its surrounding intent and judges whether the chosen type fits, per the intent→type and best-type-per-concept maps. PASS when the type's shape matches the intent; BLOCKED when a flowchart (or another mismatched type) is used where a fitter type exists; INCONCLUSIVE when the intent cannot be determined from context.",
    "verify": [
      "Identify the diagram's intent from the surrounding text",
      "Judge whether the chosen Mermaid type is the best fit for that intent"
    ]
  },
  "grade": { "dimension": "diagram-type fit", "weight": 100 }
}
```

A diagram is an artifact like any other, so its labels follow one language and do not mix — the diagram-scope instance of one-language-per-artifact, a hard yes/no judged read, hence `binary`:

```requirement
{
  "id": "REQ-895",
  "title": "One language per diagram, labels in the artifact's language",
  "statement": "Within a single diagram, node labels and annotations MUST use one consistent language (the diagram artifact's language), never mixed; this is the diagram-scope instance of the one-language-per-artifact rule.",
  "scope": { "repos": [], "categories": ["diagram"], "tags": ["diagram", "label-language"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A reviewer reads every label and annotation in the diagram and judges whether they are all in one language. PASS when consistent; BLOCKED when languages are mixed within the same diagram; INCONCLUSIVE when a label's language is indeterminate.",
    "verify": [
      "Enumerate every node label and annotation in the diagram",
      "Assert a single consistent language across them"
    ]
  },
  "grade": "binary"
}
```

A diagram earns its place only by making a decision faster or sharper; that decision value is a spectrum a reviewer judges, so this rule carries an object `grade`:

```requirement
{
  "id": "REQ-896",
  "title": "A diagram is included only when it aids a decision",
  "statement": "A diagram SHOULD be included only when it helps the reader make a faster or more informed decision; a decorative diagram that carries no decision SHOULD be left out, and an inability to find any fitting diagram type for a topic SHOULD be read as a signal the topic is not yet thought through.",
  "scope": { "repos": [], "categories": ["diagram"], "tags": ["diagram", "decision-tool"] },
  "severity": "info",
  "check": {
    "kind": "evaluator",
    "rubric": "A reviewer judges whether the diagram aids a reader's decision or is decorative. PASS when it carries a decision; surfaced as a note (not blocked) when it is decorative; INCONCLUSIVE when its decision value cannot be assessed.",
    "verify": [
      "Assess whether the diagram sharpens or speeds a reader's decision"
    ]
  },
  "grade": { "dimension": "diagram decision-value", "weight": 100 }
}
```

Spec and memo diagrams are working decision tools, so they are text the reader can diff and verify, not opaque renderings — a deterministic form check, so `binary`:

```requirement
{
  "id": "REQ-897",
  "title": "Spec and memo diagrams are text-based, not generated images",
  "statement": "A diagram in spec or memo content MUST be a text-based, diffable form — a fenced `mermaid` block (or a Vega-Lite spec for a quantitative chart) — and MUST NOT be an opaque generated-image or hand-drawn/artistic rendering; those renderings belong to docs, blog, and marketing, kept decoupled from the spec and memo layer.",
  "scope": { "repos": [], "categories": ["diagram"], "tags": ["diagram", "text-based"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Every diagram in spec/memo content is a fenced `mermaid` block or a Vega-Lite spec",
      "No generated-image or artistic rendering is embedded as a spec/memo diagram"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [35-memo-authoring.md](/specification/memo-authoring/) — diagrams as first-class memo content and the portrait-orientation rule these recommendations build on.
- [21-human-computer-interaction.md](/specification/human-computer-interaction/) — the canonical interaction diagram, a worked reference for Mermaid style.
- [06-memo-structure.md](/specification/memo-structure/) — the `media/` folder where exported or generated assets live.
- [00-overview.md](/specification/overview/) — conformance language and the Informative/Normative marking.
