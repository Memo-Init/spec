---
title: "context/"
description: "`context/` is the project's store of **processed, authored knowledge** — the specifications, distilled research, and Markdown or PDF documents a memo draws on. It is the worked, readable side of a..."
workbench_version: "0.1.0"
spec_file: "16-context.md"
order: 16
section: "Workbench"
normative: true
generated_at: "2026-06-26T15:10:37.273Z"
generated_from: "spec/workbench/0.1.0/16-context.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/16-context.md."
---


`context/` is the project's store of **processed, authored knowledge** — the specifications, distilled research, and Markdown or PDF documents a memo draws on. It is the worked, readable side of a project's information, kept apart from raw input and from generated machinery. This is the per-folder page for `context/`; the distinctions it gathers are specified in the chapters it links to.

---

## Processed, Not Raw

`context/` holds **processed** material; raw feeds and dumps live in the optional `data/` folder. The split is by state of processing — `data/` is the input side, `context/` is the worked result produced from it (and from elsewhere). Keeping them apart stops raw dumps from polluting the readable research store; the full distinction is in [12-folders.md](/specification/folders/).

---

## The Primary, Immutable Source

`context/` is a project's **primary, immutable source**: the durable ground that memos and generated bundles are distilled *from*, never a derivative that can be regenerated. Because the project root is local ([11-project-structure.md](/specification/project-structure/)), the contents of `context/` stay on the machine by construction — which is exactly why sensitive, half-formed research can live here safely. A generated artifact (a wiki page, an architecture bundle) is a *presentation* of this source and never a replacement for it.

`context/` also exists at two scopes: the **global** `context/` at the workbench root holds cross-project standards, while a project's `context/` holds documents specific to it. A document must sit at the level at which it applies (see [10-root-and-projects.md](/specification/root-and-projects/)).

---

## A Folder Speaks Its Own Domain Language

Different folders carry different **domain languages**, and `context/` is where several of them live as sub-folders rather than being merged into one format. The project architecture is stored under `context/architecture-okf/` in OKF ([41-project-architecture.md](/specification/project-architecture/), [13-knowledge-format-okf.md](/specification/knowledge-format-okf/)); other distilled research sits alongside it as plain Markdown. The workbench does not force one universal schema onto everything — it **separates by folder** and lets each sub-domain keep the convention that fits it. The layer that unifies these separated domains for retrieval is the wiki, which indexes across them as the project's search entry point ([30-wiki.md](/specification/wiki/)).

---

## Organize Under Per-Topic Sub-Folders

Content **MUST** be organized under a **per-topic sub-folder** of `context/` rather than left as loose files at the folder root. `context/architecture-okf/` is the established instance of this: a named sub-folder gathers one topic's material; other distilled research follows the same shape, one sub-folder per topic. The rationale is a **uniform, discoverable structure** across the workbench — when every project groups its `context/` the same way, a reader (and an agent indexing the folder) finds a topic by its sub-folder instead of sifting a flat heap of files, and the wiki can index a coherent domain rather than scattered documents. A single stray file at the root is tolerable, but a topic with more than one file belongs in its own sub-folder.

---

## Related

- [12-folders.md](/specification/folders/) — `data/` (raw) vs. `context/` (processed), and the folder contract this page is the registered entry for.
- [11-project-structure.md](/specification/project-structure/) — `context/` as the primary immutable source kept local.
- [10-root-and-projects.md](/specification/root-and-projects/) — the global vs. project `context/` distinction.
- [30-wiki.md](/specification/wiki/) — the wiki as the search layer that indexes across `context/`.
- [13-knowledge-format-okf.md](/specification/knowledge-format-okf/) — OKF, the convention used by the architecture bundle under `context/`.
