---
title: "Project Folders — Mandatory and Optional"
description: "Every project under `projects/{name}/` **MUST** follow a single, predictable layout. A predictable layout is what lets the workbench audit check structure mechanically and what lets a memo assume..."
workbench_version: "0.1.0"
spec_file: "12-folders.md"
order: 12
section: "Workbench"
normative: true
generated_at: "2026-06-24T21:18:51.000Z"
generated_from: "spec/workbench/0.1.0/12-folders.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/12-folders.md."
---


Every project under `projects/{name}/` **MUST** follow a single, predictable layout. A predictable layout is what lets the workbench audit check structure mechanically and what lets a memo assume where its context, repositories, and scripts are without searching. This chapter is the authoritative folder contract; the root-vs-project split is in [10-root-and-projects.md](/specification/root-and-projects/), and the local guarantee that protects the layout in [11-project-structure.md](/specification/project-structure/).

---

## The Folder Contract

Folder names are load-bearing identifiers and are reproduced verbatim. The workbench audit reports any missing mandatory path as a structural finding and any unexpected top-level entry for review.

| Path | Status | Purpose |
|------|--------|---------|
| `.claude/` | Mandatory | Claude Code settings and project-local skills. |
| `.memo/` | Mandatory | Memos and their shared stores; see [11-project-structure.md](/specification/project-structure/). |
| `.trash/` | Mandatory | Recoverable trash; the deletion target (see [32-trash.md](/specification/trash/)). |
| `context/` | Mandatory | **Processed** data — specifications, distilled research, Markdown/PDF documents. |
| `repos/` | Mandatory | The project's git repositories (one domain per repository). |
| `scripts/` | Mandatory | Environment and health scripts (see [21-environment-scripts.md](/specification/environment-scripts/)). |
| `ABOUT.md` | Mandatory | Project documentation for humans. |
| `CLAUDE.md` | Mandatory | The runbook for the AI. |
| `data/` | Optional | **Raw** data — feeds and source material, as ingested, before processing. |
| `.workbench/` | Optional | The manual project configuration (see [22-config.md](/specification/config/)). |
| `.playwright/` | Optional | Browser-automation session, scripts, and output — only when the project does browser automation (see [31-browser-automation.md](/specification/browser-automation/)). |
| `.wiki/` | Optional | LLM-generated project wiki, an OKF-conformant knowledge bundle (see [30-wiki.md](/specification/wiki/)). |
| `proofs/` | Optional | Proofs captured when a view changes (see "Specialized folders" below). |
| `snapshots/` | Optional | Application snapshots (see "Specialized folders" below). |
| `.tmp/` | Optional | Working scratch space; ephemeral material that may be discarded. |

A project **MUST NOT** omit a mandatory folder. A project **MAY** add any optional folder when it needs it.

---

## `data` Is Raw, `context` Is Processed

The distinction between `data/` and `context/` is by **state of processing**, and it is the reason both exist:

- **`data/`** holds **raw** material — feeds, dumps, and source files exactly as they arrive. It is the input side.
- **`context/`** holds **processed** material — the Markdown, PDFs, and distilled research produced *from* the raw data (and from elsewhere). It is the worked, readable side that memos draw on.

A project that only ever works with processed documents has a `context/` and no `data/`; a project that ingests raw feeds keeps them in `data/` and writes the distilled result into `context/`. Keeping the two apart prevents raw dumps from polluting the readable research store.

---

## Specialized Folders May Live Under `.tmp/`

`proofs/` and `snapshots/` are **specialized**: they matter to projects that capture view proofs or application snapshots and are irrelevant to others. Such a project **MAY** keep them as top-level folders, or **MAY** place them under `.tmp/` when the captured material is ephemeral and need not persist. Either placement is conformant; the choice follows from whether the proofs and snapshots are kept as durable artifacts or as throwaway working material.

---

## `.playwright/` Is Optional

Browser automation is not universal. A project carries `.playwright/` **only if** it actually performs browser automation; a project that does none **MUST NOT** be expected to have it. When present, the folder follows the normative conventions in [31-browser-automation.md](/specification/browser-automation/).

---

## `.workbench/` Carries the Configuration

The optional `.workbench/` folder is where a project's **manual** configuration lives — the declaration of what is specific to the project, including the inward/outward-facing classification of its repositories. The configuration is manual, not auto-generated, and is the single source from which deterministic enforcement is derived. Its fields and derivation are specified in [22-config.md](/specification/config/).

---

## Related

- [10-root-and-projects.md](/specification/root-and-projects/) — the workbench-root vs. project split.
- [11-project-structure.md](/specification/project-structure/) — the local guarantee that protects this layout.
- [22-config.md](/specification/config/) — the `.workbench/` configuration.
- [32-trash.md](/specification/trash/) — why deletion routes through `.trash/`.
