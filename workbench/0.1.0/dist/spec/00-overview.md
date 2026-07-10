---
title: "Overview"
description: "This is the entry point for the **Workbench specification** — a standalone sibling of the memo-init core specification. The workbench is the meta-orchestration layer that holds all projects, their..."
workbench_version: "0.1.0"
spec_file: "00-overview.md"
order: 0
section: "Workbench"
normative: false
generated_at: "2026-07-10T11:54:59.268Z"
generated_from: "workbench/0.1.0/draft/spec/00-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: workbench/0.1.0/draft/spec/00-overview.md."
---


> **Informative.** This document introduces the Workbench spec, its scope, and its place among the sibling specifications. It is written in prose and does not itself carry normative requirements. The chapters it indexes use normative language as marked.

This is the entry point for the **Workbench specification** — a standalone sibling of the memo-init core specification. The workbench is the meta-orchestration layer that holds all projects, their tools, and their shared conventions. This spec documents the project-level organization — folder structures, the CLI and script conventions, the manual `.workbench/` configuration, the wiki, and the trash policy — that surrounds the per-memo workflow described in the core specification.

The core message: the workbench is **a connecting layer, not a container**. It connects AI-native projects and tools — the memo system, the global helpers (described below by role), and the small CLIs — rather than owning or holding them. Historically that connection was purely deterministic; today it is deterministic **and** non-deterministic. The SOP is the non-deterministic entry point that expects deterministic tools beneath it: an **entry point and a signpost** that routes downward rather than holding everything. This complements the framing above — the spec is specification text and conventions, and what those conventions describe is a thin connecting layer.

---

## A Sibling Spec, Not a Sub-Spec

The Workbench spec is a **standalone sibling** of the core specification, not a subordinate set of chapters under it. The memo-init repository hosts **four sibling spec families** side by side in one repository, each with its own version line:

| Family | Directory | Concern |
|--------|-----------|---------|
| **Core specification** (memo) | `draft/memo/0.1.0/spec/` | A single memo's lifecycle — input, revisions, questions, phases, PRDs, rollout, git flow. Reasons about *one memo at a time*. |
| **Workbench** (this spec) | `draft/workbench/0.1.0/spec/` | The environment in which memos live — project layout, CLIs and scripts, configuration, the wiki, trash. Reasons about *the project and the workbench around the memo*. |
| **Session** | `draft/session/0.1.0/spec/` | The session genesis layer; it also carries the **SOP area** — the thin connecting layer that makes the various SOPs predictable (what a SOP contains and where to find it). The SOP, once framed as its own family, now lives here as that area. |
| **Meta-spec** | `draft/spec/0.1.0/spec/` | The specification-of-specifications: the per-chapter format, categories, and publishing rules every family follows, so a new family is added by following a document rather than reverse-engineering the build. |

This mirrors the established multi-family pattern (a single spec repository hosting parallel, independently versioned spec families as sibling directories). Keeping these concerns in separate, peer documents lets each evolve at its own pace.

---

## Hierarchy — Where This Spec Sits

The Workbench spec is **not** the highest authority. The core specification defines the conformance vocabulary (the RFC 2119 / BCP 14 key words) and the memo lifecycle; this spec does **not** redefine them. A normative requirement in a Workbench chapter is interpreted under the conformance block of the core specification.

Within that shared vocabulary, the Workbench spec is otherwise self-contained: it owns its own version line, its own chapter map, and its own published navigation section. A reader landing on a Workbench chapter should treat it as describing the workbench at its own version, cross-referencing the core spec only where a chapter explicitly does so.

---

## Independent Versioning

This spec is **versioned independently** from the core specification. A change to the workbench's project structure or its CLI conventions does not force a core-spec version bump, and a core-spec version bump does not retroactively re-version the Workbench spec.

- The core specification lives under `draft/memo/0.1.0/spec/`; the Workbench spec lives under `draft/workbench/0.1.0/spec/` and carries its own version line.
- The authoritative, machine-readable version numbers for every family are recorded in `data/refs.manual.json` — the core spec under the `memo` key, this spec under the `workbench` key, the Session spec under the `session` key, and the meta-spec under the `meta-spec` key. Version numbers **MUST NOT** be hardcoded in prose; consumers read them from the refs data, and the build stamps each chapter with its family's version (`workbench_version`).

---

## Two Levels: Workbench and Project

The Workbench spec describes **two levels** of operation, Workbench and Project. The machine tier — global, deterministic enforcement of policy via Claude Code hooks — is deliberately **out of scope** for this spec and is left to a future, separate machine-tier specification. The division of responsibility is recorded in [02-sop-entrypoint.md](/workbench/sop-entrypoint/): the workbench *declares* policy, the machine tier *enforces* it.

---

## Thinking in Projects, Not Repositories

The defining mental shift of the workbench is that the unit of organization is the **project**, not the repository.

- A repository is a single-domain code unit. A project is a coherent context that may contain several repositories, plus its memos, its context documents, its scripts, and its tooling.
- A memo lives inside a project and coordinates the project's repositories. The project is therefore the boundary of a sharp, coherent context.
- The workbench level does **not** develop code. It organizes, plans, and structures. Code development happens inside `projects/{name}/repos/`.

This distinction is what [11-project-structure.md](/workbench/project-structure/) makes concrete, and the separation of the workbench root from the projects beneath it is drawn in [10-root-and-projects.md](/workbench/root-and-projects/).

The workbench **core** — its folders, CLIs, and conventions — is independent of the memo system: a project can use the layout without any memo ever being written, even though the memo system is the recommended custom folder that normally drives it. The core-vs-custom folder split among the registered folders is drawn in [12-folders.md](/workbench/folders/).

---

## What the Workbench Level Checks

The workbench level has two recurring verification concerns, both about *the environment* rather than about *code correctness*:

1. **Folder structures.** Each project under `projects/` is expected to follow the mandatory layout. The workbench audit walks the structure and reports missing or unexpected folders and files.
2. **Tool reachability.** Globally linked command-line tools must resolve and respond. The workbench checks that the helpers it relies on are installed and reachable before a memo assumes them.

These checks are descriptive of the real audit performed at the workbench level; the normative details of the structure being checked live in [11-project-structure.md](/workbench/project-structure/), and the health-check scripts that perform them in [21-environment-scripts.md](/workbench/environment-scripts/).

---

## Global Helpers

The workbench exposes a small set of **global** command-line helpers that are available to every project. The following are specific to the workbench level:

| Helper role | What it serves |
|-------------|----------------|
| Data ingestion | Retrieve external data (for example spreadsheets) for use inside a project. |
| Dependency safety | A supply-chain watchdog that looks up and scans dependencies before they are installed. |
| Service-tool routing | Search, list, and call external API tools without per-project installation. |

The helpers are listed here by **role**, not by name: the concrete tool set is the developer's private inventory, declared per project rather than enumerated in this published spec.

These helpers are global because they serve cross-project concerns (data ingestion, dependency safety) rather than the logic of any single project. A project **MAY** rely on a global helper being reachable; the workbench tool-reachability check exists precisely so that reliance is verified rather than assumed. The CLI convention these helpers follow is described in [20-cli.md](/workbench/cli/).

---

## Scope of This Spec

This spec covers the workbench's **specification text and conventions**. Two things are deliberately out of scope and deferred:

- **The machine tier** (hook-based enforcement) — a separate future spec (see above and [02-sop-entrypoint.md](/workbench/sop-entrypoint/)).
- **Simplification of the operative `CLAUDE.md` files** — a backlog research concern, not part of this spec.

---

## Navigation Categories

The Workbench spec's chapters are grouped into the navigation categories **Introduction**, **Root**, **Projects**, **Folders**, **CLI & Scripts**, **Tools**, **Wiki**, **Core**, and **Bridge**. (Requirements, Tools Registry, Strands, and Memo History are core chapters and are linked from there.) The published sidebar lists each chapter under its category, so this overview names the category structure rather than re-listing every chapter — the on-disk chapter set and the sidebar are the authoritative per-chapter index.

Three categories carry a meaning worth stating here:

- **Core** is the config (`.workbench/`, the producing side), the hooks contract (the consuming side), the validation overview that indexes that enforcement, and the **Architecture** chapter (the two-level diagram together with the project repo-graph) — a mutually-defining policy/enforcement/structure core, distinct from the general CLI/Scripts. There is no separate **Reference** category: the architecture chapters that once stood there are merged into one and moved here.
- **Folders** holds the registered-folder pages and the things that attach to folders: the folder contract, the per-folder pages, the **custom folder model** (the tools that reserve a folder, reunited with the folder taxonomy that introduces them), and the trash policy.
- **Wiki** is the project's discovery system as its own category. Its **storage formats** include OKF (the structured architecture format) and `design.md` (the design format); both therefore sit conceptually under the wiki rather than standing alone.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [01-philosophy.md](/workbench/philosophy/) — the guardrail philosophy and interaction model this overview sits on.
- [02-sop-entrypoint.md](/workbench/sop-entrypoint/) — the SOP entry point and the declare-vs-enforce split between the workbench and the machine tier.
- [10-root-and-projects.md](/workbench/root-and-projects/) — the separation of the workbench root from the projects beneath it.
- [11-project-structure.md](/workbench/project-structure/) — the mandatory per-project layout this overview points at.
- [12-folders.md](/workbench/folders/) — the core-vs-custom registered-folder split the navigation categories reflect.
