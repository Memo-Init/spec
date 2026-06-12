---
title: "Workbench Overview"
description: "This is the entry point for the **workbench sub-spec** of the memo-init specification. The workbench is the meta-orchestration layer that holds all projects, their tools, and their shared..."
spec_version: "0.1.0"
spec_file: "00-overview.md"
order: 0
section: "Workbench"
normative: false
generated_at: "2026-06-12T20:53:10.474Z"
generated_from: "spec/workbench/00-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/00-overview.md."
---


> **Informative.** This document introduces the workbench sub-spec, its scope, and its independent versioning. It is written in prose and does not itself carry normative requirements. The chapters it indexes use normative language as marked.

This is the entry point for the **workbench sub-spec** of the memo-init specification. The workbench is the meta-orchestration layer that holds all projects, their tools, and their shared conventions. This sub-spec documents the project-level organization — folder structures, requirements profiles, the tools registry, strands, the two wiki types, and the trash policy — that surrounds the per-memo workflow described in the core specification.

---

## The Workbench Is Its Own Sub-Spec

The workbench is documented as an **independent sub-spec**, not as additional chapters of the core specification. The reason is one of concern separation:

- The **core specification** (`spec/vX.Y.Z/00..18`) describes a single memo's lifecycle — input, revisions, questions, phases, PRDs, rollout, git flow. It reasons about *one memo at a time*.
- The **workbench sub-spec** (this document) describes the *environment* in which memos live — how projects are laid out on disk, which tools and requirements a memo can pull in, how a single memo splits its work into named strands, and how knowledge and deleted material are kept. It reasons about *the project and the workbench around the memo*.

Keeping these concerns in separate documents lets each evolve at its own pace.

---

## Independent Versioning

This sub-spec is **versioned independently** from the core specification. A change to the workbench's project structure or its requirements model does not force a core-spec version bump, and a core-spec version bump does not retroactively re-version the workbench sub-spec.

- The core specification lives under a version directory (`spec/vX.Y.Z/`); the workbench sub-spec lives under `spec/workbench/` and carries its own version line.
- The authoritative, machine-readable version numbers for both the core spec and any sub-spec are recorded in `data/refs.manual.json`. Version numbers **MUST NOT** be hardcoded in prose; consumers read them from the refs data (see core-spec chapter on versioning).
- A reader landing on a workbench chapter should treat it as describing the workbench at its own version, cross-referencing the core spec only where a chapter explicitly does so.

---

## Thinking in Projects, Not Repositories

The defining mental shift of the workbench is that the unit of organization is the **project**, not the repository.

- A repository is a single-domain code unit. A project is a coherent context that may contain several repositories, plus its memos, its context documents, its scripts, and its tooling.
- A memo lives inside a project and coordinates the project's repositories (see core-spec multidimensionality chapter). The project is therefore the boundary of a sharp, coherent context.
- The workbench level does **not** develop code. It organizes, plans, and structures. Code development happens inside `projects/{name}/repos/`.

This distinction is what [01-project-structure.md](/specification/project-structure/) makes concrete.

---

## What the Workbench Level Checks

The workbench level has two recurring verification concerns, both about *the environment* rather than about *code correctness*:

1. **Folder structures.** Each project under `projects/` is expected to follow the mandatory layout. The workbench audit walks the structure and reports missing or unexpected folders and files.
2. **Tool reachability.** Globally linked command-line tools must resolve and respond. The workbench checks that the helpers it relies on are installed and reachable before a memo assumes them.

These checks are descriptive of the real audit performed at the workbench level; the normative details of the structure being checked live in [01-project-structure.md](/specification/project-structure/).

---

## Global Helpers

The workbench exposes a small set of **global** command-line helpers that are available to every project. Two that are specific to the workbench level:

| Helper | Role |
|--------|------|
| `get-sheet` | Retrieve data from external spreadsheets for use inside a project. |
| `depwatch` | Supply-chain security watchdog — looks up and scans dependencies before they are installed. |

These helpers are global because they serve cross-project concerns (data ingestion, dependency safety) rather than the logic of any single project. A project **MAY** rely on a global helper being reachable; the workbench tool-reachability check exists precisely so that reliance is verified rather than assumed.

---

## Sub-Spec Document Index

| Document | Title | Mode |
|----------|-------|------|
| `00-overview.md` | Workbench Sub-Spec — Overview | Informative |
| `01-project-structure.md` | Project Structure & Local Guarantee | Normative |
| `02-requirements.md` | Requirements Profiles (`.memo/requirements/`) | Normative |
| `03-tools-registry.md` | Tools Registry (`.memo/tools/`) | Normative (Recommendation) |
| `04-strands.md` | Strands — One Memo, Many Topics | Normative |
| `05-wiki.md` | Wiki Types — Project Wiki & Memo Wiki | Normative |
| `06-trash.md` | Trash — No Deletion, Only `.trash/` | Normative |

---

## Related

- [01-project-structure.md](/specification/project-structure/) — the mandatory project layout and the local guarantee.
- [02-requirements.md](/specification/requirements/) — requirements profiles as data.
- [03-tools-registry.md](/specification/tools-registry/) — the per-memo tools registry.
- [04-strands.md](/specification/strands/) — splitting one memo into named strands.
- [05-wiki.md](/specification/wiki/) — project wiki versus the timeline-aware memo wiki.
- [06-trash.md](/specification/trash/) — the no-deletion trash policy.
