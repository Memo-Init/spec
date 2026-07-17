---
title: "context/"
description: "`context/` is the project's store of **processed, authored knowledge** — the specifications, distilled research, and Markdown or PDF documents a memo draws on. It is the worked, readable side of a..."
workbench_version: "0.3.0"
spec_file: "16-context.md"
order: 16
section: "Workbench"
normative: true
generated_at: "2026-07-17T23:43:43.034Z"
generated_from: "workbench/0.3.0/draft/spec/16-context.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: workbench/0.3.0/draft/spec/16-context.md."
---


`context/` is the project's store of **processed, authored knowledge** — the specifications, distilled research, and Markdown or PDF documents a memo draws on. It is the worked, readable side of a project's information, kept apart from raw input and from generated machinery. This is the per-folder page for `context/`; the distinctions it gathers are specified in the chapters it links to.

---

## Folder Contract

```folder
{
  "name":       "context/",
  "status":     "mandatory",
  "level":      "both",
  "entryPoint": "per-topic sub-folders",
  "convention": "plain Markdown; OKF opt-in for architecture-okf/",
  "purpose":    "Processed, authored knowledge — specifications, distilled research, Markdown/PDF documents a memo draws on.",
  "goesIn":     "Processed, derived documents, organized under a per-topic sub-folder.",
  "doesNot":    "Raw, unprocessed feeds (those go to data/); a generated artifact treated as the source it presents.",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](/workbench/folders/)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## Processed, Not Raw

`context/` holds **processed** material; raw feeds and dumps live in the optional `data/` folder. The split is by state of processing — `data/` is the input side, `context/` is the worked result produced from it (and from elsewhere). Keeping them apart stops raw dumps from polluting the readable research store; the full distinction is in [12-folders.md](/workbench/folders/).

---

## The Primary, Immutable Source

`context/` is a project's **primary, immutable source**: the durable ground that memos and generated bundles are distilled *from*, never a derivative that can be regenerated. Because the project root is local ([11-project-structure.md](/workbench/project-structure/)), the contents of `context/` stay on the machine by construction — which is exactly why sensitive, half-formed research can live here safely. A generated artifact (a wiki page, an architecture bundle) is a *presentation* of this source and never a replacement for it.

`context/` also exists at two scopes: the **global** `context/` at the workbench root holds cross-project standards, while a project's `context/` holds documents specific to it. A document must sit at the level at which it applies (see [10-root-and-projects.md](/workbench/root-and-projects/)).

---

## Memo-Scoped Research vs. a Deliberate Promotion

Raw, in-progress research and "wild" downloaded data do not land in this `context/` by default — they live **memo-scoped**, in the owning memo's own `context/` folder (the memo specification routes proactive research there). Half-finished material accumulates with the memo that produced it, without polluting the project's curated store. This is a **positive convention, not a prohibition**: each kind of material has a home, and a memo's working research stays with that memo.

Promoting a document **up** into the project (or global) `context/` is therefore a **deliberate, curatorial act**, not a default landing spot. A piece of research earns its place here once it is processed and worth drawing on **across** the project — the move from memo-scoped working material to shared, authored knowledge is a decision made on purpose, not the path of least resistance. The split keeps this `context/` the worked, readable side it is meant to be ([Processed, Not Raw](#processed-not-raw)): raw bulk inputs belong in `data/` and throwaway scratch in `.tmp/` ([12-folders.md](/workbench/folders/), [19-tmp.md](/workbench/tmp/)).

---

## A Folder Speaks Its Own Domain Language

Different folders carry different **domain languages**, and `context/` is where several of them live as sub-folders rather than being merged into one format. The project architecture is stored under `context/architecture-okf/` in OKF ([41-project-architecture.md](/workbench/project-architecture/), [13-knowledge-format-okf.md](/workbench/knowledge-format-okf/)); other distilled research sits alongside it as plain Markdown. The workbench does not force one universal schema onto everything — it **separates by folder** and lets each sub-domain keep the convention that fits it. The layer that unifies these separated domains for retrieval is the wiki, which indexes across them as the project's search entry point ([30-wiki.md](/workbench/wiki/)).

**OKF is opt-in per sub-folder; the default for a folder is plain Markdown.** OKF is **not** a `context/`-wide mandate — only `context/architecture-okf/` (and `.wiki/`) adopt it, and any other `context/` sub-folder is plain Markdown by default. The opt-in is made concrete in configuration: the per-folder OKF convention is bound through `.workbench/folder-lints.json` ([22-config.md](/workbench/config/)), **scoped to `architecture-okf/` and `.wiki/` only**. The convention is binding exactly where that binding is present and nowhere else — its absence everywhere else is what keeps OKF from spreading across `context/`.

---

## Organize Under Per-Topic Sub-Folders

Content **MUST** be organized under a **per-topic sub-folder** of `context/` rather than left as loose files at the folder root. `context/architecture-okf/` is the established instance of this: a named sub-folder gathers one topic's material; other distilled research follows the same shape, one sub-folder per topic. The rationale is a **uniform, discoverable structure** across the workbench — when every project groups its `context/` the same way, a reader (and an agent indexing the folder) finds a topic by its sub-folder instead of sifting a flat heap of files, and the wiki can index a coherent domain rather than scattered documents. A single stray file at the root is tolerable, but a topic with more than one file belongs in its own sub-folder.

---

## Conformity Requirements

The `context/` organization rules are checkable against the folder's own shape. The blocks below encode this chapter's binding rules prose-first — each `statement` faces how content is filed, and each `check` faces the structure audit and the write-time lint binding. They are the source the requirement store is harvested from ([23-requirements.md](/specification/requirements/)).

Per-topic organization is a structural fact about where content sits:

```requirement
{
  "id": "REQ-957",
  "title": "context/ content is organized under per-topic sub-folders",
  "statement": "Content under `context/` MUST be organized in a per-topic sub-folder rather than left as loose files at the folder root, so that every project groups its `context/` the same way and the wiki can index a coherent domain. A single stray file at the root is tolerable; a topic with more than one file MUST live in its own sub-folder.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["context", "structure"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each topic with more than one file lives under its own sub-folder of `context/`",
      "No topic spreads multiple loose files across the `context/` root"
    ]
  },
  "grade": "binary"
}
```

The opt-in scoping of OKF is the presence-or-absence of a binding, a hard yes/no fact:

```requirement
{
  "id": "REQ-958",
  "title": "OKF is opt-in per sub-folder, scoped to the architecture and wiki bundles",
  "statement": "OKF MUST NOT be a `context/`-wide mandate. The default for a folder is plain Markdown; only the `architecture-okf/` sub-folder of `context/` (and the project wiki) adopt OKF. The opt-in MUST be expressed as a folder-lint binding scoped to exactly those folders — its absence everywhere else is what keeps OKF from spreading across the rest of `context/`.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["context", "okf", "convention"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "An OKF folder-lint binding exists for `context/architecture-okf/` and the wiki",
      "No OKF binding covers any other `context/` sub-folder",
      "Sub-folders without an OKF binding are treated as plain Markdown"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [12-folders.md](/workbench/folders/) — `data/` (raw) vs. `context/` (processed), and the folder contract this page is the registered entry for.
- [11-project-structure.md](/workbench/project-structure/) — `context/` as the primary immutable source kept local.
- [10-root-and-projects.md](/workbench/root-and-projects/) — the global vs. project `context/` distinction.
- [30-wiki.md](/workbench/wiki/) — the wiki as the search layer that indexes across `context/`.
- [13-knowledge-format-okf.md](/workbench/knowledge-format-okf/) — OKF, the opt-in convention used by the architecture bundle under `context/`.
- [22-config.md](/workbench/config/) — `.workbench/folder-lints.json`, where the per-folder OKF convention is bound, scoped to `architecture-okf/` and `.wiki/`.
