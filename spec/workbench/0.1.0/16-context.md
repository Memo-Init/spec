# 16. context/

| | |
|---|---|
| Status | Draft |
| Depends on | [11-project-structure.md](./11-project-structure.md), [12-folders.md](./12-folders.md) |
| Related | [10-root-and-projects.md](./10-root-and-projects.md), [13-knowledge-format-okf.md](./13-knowledge-format-okf.md), [30-wiki.md](./30-wiki.md), [41-project-architecture.md](./41-project-architecture.md) |

`context/` is the project's store of **processed, authored knowledge** — the specifications, distilled research, and Markdown or PDF documents a memo draws on. It is the worked, readable side of a project's information, kept apart from raw input and from generated machinery. This is the per-folder page for `context/`; the distinctions it gathers are specified in the chapters it links to.

---

## Folder Contract

| Field | Value |
|-------|-------|
| Name | `context/` |
| Status | Mandatory |
| Level | Both |
| Entry-point | per-topic sub-folders |
| Convention | plain Markdown; OKF opt-in for `architecture-okf/` |
| Purpose | Processed, authored knowledge — specifications, distilled research, Markdown/PDF documents a memo draws on. |
| Goes in | Processed, derived documents, organized under a per-topic sub-folder. |
| Does not | Raw, unprocessed feeds (those go to `data/`); a generated artifact treated as the source it presents. |

> The Folder Contract follows the fixed per-folder shape defined in the session conventions ([session/13-conventions.md](/session/conventions/)); its first six fields mirror this folder's row in the central contract table ([12-folders.md](./12-folders.md)).

---

## Processed, Not Raw

`context/` holds **processed** material; raw feeds and dumps live in the optional `data/` folder. The split is by state of processing — `data/` is the input side, `context/` is the worked result produced from it (and from elsewhere). Keeping them apart stops raw dumps from polluting the readable research store; the full distinction is in [12-folders.md](./12-folders.md).

---

## The Primary, Immutable Source

`context/` is a project's **primary, immutable source**: the durable ground that memos and generated bundles are distilled *from*, never a derivative that can be regenerated. Because the project root is local ([11-project-structure.md](./11-project-structure.md)), the contents of `context/` stay on the machine by construction — which is exactly why sensitive, half-formed research can live here safely. A generated artifact (a wiki page, an architecture bundle) is a *presentation* of this source and never a replacement for it.

`context/` also exists at two scopes: the **global** `context/` at the workbench root holds cross-project standards, while a project's `context/` holds documents specific to it. A document must sit at the level at which it applies (see [10-root-and-projects.md](./10-root-and-projects.md)).

---

## Memo-Scoped Research vs. a Deliberate Promotion

Raw, in-progress research and "wild" downloaded data do not land in this `context/` by default — they live **memo-scoped**, in the owning memo's own `context/` folder (the memo specification routes proactive research there). Half-finished material accumulates with the memo that produced it, without polluting the project's curated store. This is a **positive convention, not a prohibition**: each kind of material has a home, and a memo's working research stays with that memo.

Promoting a document **up** into the project (or global) `context/` is therefore a **deliberate, curatorial act**, not a default landing spot. A piece of research earns its place here once it is processed and worth drawing on **across** the project — the move from memo-scoped working material to shared, authored knowledge is a decision made on purpose, not the path of least resistance. The split keeps this `context/` the worked, readable side it is meant to be ([Processed, Not Raw](#processed-not-raw)): raw bulk inputs belong in `data/` and throwaway scratch in `.tmp/` ([12-folders.md](./12-folders.md), [19-tmp.md](./19-tmp.md)).

---

## A Folder Speaks Its Own Domain Language

Different folders carry different **domain languages**, and `context/` is where several of them live as sub-folders rather than being merged into one format. The project architecture is stored under `context/architecture-okf/` in OKF ([41-project-architecture.md](./41-project-architecture.md), [13-knowledge-format-okf.md](./13-knowledge-format-okf.md)); other distilled research sits alongside it as plain Markdown. The workbench does not force one universal schema onto everything — it **separates by folder** and lets each sub-domain keep the convention that fits it. The layer that unifies these separated domains for retrieval is the wiki, which indexes across them as the project's search entry point ([30-wiki.md](./30-wiki.md)).

**OKF is opt-in per sub-folder; the default for a folder is plain Markdown.** OKF is **not** a `context/`-wide mandate — only `context/architecture-okf/` (and `.wiki/`) adopt it, and any other `context/` sub-folder is plain Markdown by default. The opt-in is made concrete in configuration: the per-folder OKF convention is bound through `.workbench/folder-lints.json` ([22-config.md](./22-config.md)), **scoped to `architecture-okf/` and `.wiki/` only**. The convention is binding exactly where that binding is present and nowhere else — its absence everywhere else is what keeps OKF from spreading across `context/`.

---

## Organize Under Per-Topic Sub-Folders

Content **MUST** be organized under a **per-topic sub-folder** of `context/` rather than left as loose files at the folder root. `context/architecture-okf/` is the established instance of this: a named sub-folder gathers one topic's material; other distilled research follows the same shape, one sub-folder per topic. The rationale is a **uniform, discoverable structure** across the workbench — when every project groups its `context/` the same way, a reader (and an agent indexing the folder) finds a topic by its sub-folder instead of sifting a flat heap of files, and the wiki can index a coherent domain rather than scattered documents. A single stray file at the root is tolerable, but a topic with more than one file belongs in its own sub-folder.

---

## Related

- [12-folders.md](./12-folders.md) — `data/` (raw) vs. `context/` (processed), and the folder contract this page is the registered entry for.
- [11-project-structure.md](./11-project-structure.md) — `context/` as the primary immutable source kept local.
- [10-root-and-projects.md](./10-root-and-projects.md) — the global vs. project `context/` distinction.
- [30-wiki.md](./30-wiki.md) — the wiki as the search layer that indexes across `context/`.
- [13-knowledge-format-okf.md](./13-knowledge-format-okf.md) — OKF, the opt-in convention used by the architecture bundle under `context/`.
- [22-config.md](./22-config.md) — `.workbench/folder-lints.json`, where the per-folder OKF convention is bound, scoped to `architecture-okf/` and `.wiki/`.
