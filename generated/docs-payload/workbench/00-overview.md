---
title: "Overview"
description: "This is the entry point for the **Workbench specification** — a standalone sibling of the memo-init core specification. The workbench is the meta-orchestration layer that holds all projects, their..."
workbench_version: "0.1.0"
spec_file: "00-overview.md"
order: 0
section: "Workbench"
normative: false
generated_at: "2026-06-24T20:40:20.473Z"
generated_from: "spec/workbench/0.1.0/00-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/00-overview.md."
---


> **Informative.** This document introduces the Workbench spec, its scope, and its place among the sibling specifications. It is written in prose and does not itself carry normative requirements. The chapters it indexes use normative language as marked.

This is the entry point for the **Workbench specification** — a standalone sibling of the memo-init core specification. The workbench is the meta-orchestration layer that holds all projects, their tools, and their shared conventions. This spec documents the project-level organization — folder structures, the CLI and script conventions, the manual `.workbench/` configuration, the wiki, and the trash policy — that surrounds the per-memo workflow described in the core specification.

---

## A Sibling Spec, Not a Sub-Spec

The Workbench spec is a **standalone sibling** of the core specification, not a subordinate set of chapters under it. The memo-init repository hosts **three sibling spec families** side by side in one repository, each with its own version line:

| Family | Directory | Concern |
|--------|-----------|---------|
| **Core specification** | `spec/v0.1.0/` | A single memo's lifecycle — input, revisions, questions, phases, PRDs, rollout, git flow. Reasons about *one memo at a time*. |
| **Workbench** (this spec) | `spec/workbench/0.1.0/` | The environment in which memos live — project layout, CLIs and scripts, configuration, the wiki, trash. Reasons about *the project and the workbench around the memo*. |
| **SOP** | `spec/sop/0.1.0/` | The thin connecting layer that makes the various SOPs predictable — what a SOP contains and where to find it. |

This mirrors the established multi-family pattern (a single spec repository hosting parallel, independently versioned spec families as sibling directories). Keeping these concerns in separate, peer documents lets each evolve at its own pace.

---

## Hierarchy — Where This Spec Sits

The Workbench spec is **not** the highest authority. The core specification defines the conformance vocabulary (the RFC 2119 / BCP 14 key words) and the memo lifecycle; this spec does **not** redefine them. A normative requirement in a Workbench chapter is interpreted under the conformance block of the core specification.

Within that shared vocabulary, the Workbench spec is otherwise self-contained: it owns its own version line, its own chapter map, and its own published navigation section. A reader landing on a Workbench chapter should treat it as describing the workbench at its own version, cross-referencing the core spec only where a chapter explicitly does so.

---

## Independent Versioning

This spec is **versioned independently** from the core specification. A change to the workbench's project structure or its CLI conventions does not force a core-spec version bump, and a core-spec version bump does not retroactively re-version the Workbench spec.

- The core specification lives under `spec/v0.1.0/`; the Workbench spec lives under `spec/workbench/0.1.0/` and carries its own version line.
- The authoritative, machine-readable version numbers for every family are recorded in `data/refs.manual.json` — the core spec under the `spec` key, this spec under the `workbench` key, and the SOP spec under the `sop` key. Version numbers **MUST NOT** be hardcoded in prose; consumers read them from the refs data, and the build stamps each chapter with its family's version (`workbench_version`).

---

## Two Levels: Workbench and Project

The Workbench spec describes **two levels** of operation, Workbench and Project. The machine tier — global, deterministic enforcement of policy via Claude Code hooks — is deliberately **out of scope** for this spec and is left to a future, separate machine-tier specification. The division of responsibility is recorded in [02-sop-entrypoint.md](/specification/sop-entrypoint/): the workbench *declares* policy, the machine tier *enforces* it.

---

## Thinking in Projects, Not Repositories

The defining mental shift of the workbench is that the unit of organization is the **project**, not the repository.

- A repository is a single-domain code unit. A project is a coherent context that may contain several repositories, plus its memos, its context documents, its scripts, and its tooling.
- A memo lives inside a project and coordinates the project's repositories. The project is therefore the boundary of a sharp, coherent context.
- The workbench level does **not** develop code. It organizes, plans, and structures. Code development happens inside `projects/{name}/repos/`.

This distinction is what [11-project-structure.md](/specification/project-structure/) makes concrete, and the separation of the workbench root from the projects beneath it is drawn in [10-root-and-projects.md](/specification/root-and-projects/).

---

## What the Workbench Level Checks

The workbench level has two recurring verification concerns, both about *the environment* rather than about *code correctness*:

1. **Folder structures.** Each project under `projects/` is expected to follow the mandatory layout. The workbench audit walks the structure and reports missing or unexpected folders and files.
2. **Tool reachability.** Globally linked command-line tools must resolve and respond. The workbench checks that the helpers it relies on are installed and reachable before a memo assumes them.

These checks are descriptive of the real audit performed at the workbench level; the normative details of the structure being checked live in [11-project-structure.md](/specification/project-structure/), and the health-check scripts that perform them in [21-environment-scripts.md](/specification/environment-scripts/).

---

## Global Helpers

The workbench exposes a small set of **global** command-line helpers that are available to every project. The following are specific to the workbench level:

| Helper | Role |
|--------|------|
| `get-sheet` | Retrieve data from external spreadsheets for use inside a project. |
| `depwatch` | Supply-chain security watchdog — looks up and scans dependencies before they are installed. |
| `flowmcp` | Service-tool router — search, list, and call external API tools without per-project installation. |

These helpers are global because they serve cross-project concerns (data ingestion, dependency safety) rather than the logic of any single project. A project **MAY** rely on a global helper being reachable; the workbench tool-reachability check exists precisely so that reliance is verified rather than assumed. The CLI convention these helpers follow is described in [20-cli.md](/specification/cli/).

---

## Scope of This Spec

This spec covers the workbench's **specification text and conventions**. Two things are deliberately out of scope and deferred:

- **The machine tier** (hook-based enforcement) — a separate future spec (see above and [02-sop-entrypoint.md](/specification/sop-entrypoint/)).
- **Simplification of the operative `CLAUDE.md` files** — a backlog research concern, not part of this spec.

---

## Document Index

The Workbench spec contains the following chapters, grouped into the navigation categories Introduction, Folders, CLI & Scripts, Tools, and Reference. (Requirements, Tools Registry, Strands, and Memo History are core chapters and are linked from there.)

| Document | Title | Group | Mode |
|----------|-------|-------|------|
| `00-overview.md` | Overview | Introduction | Informative |
| `01-philosophy.md` | Philosophy | Introduction | Informative |
| `02-sop-entrypoint.md` | Workbench-SOP & the Two-Level Model | Introduction | Normative |
| `10-root-and-projects.md` | Root and Projects | Folders | Normative |
| `11-project-structure.md` | Project Structure & Local Guarantee | Folders | Normative |
| `12-folders.md` | Project Folders — Mandatory and Optional | Folders | Normative |
| `13-knowledge-format-okf.md` | Knowledge Format — OKF Conformance | Folders | Normative |
| `14-project-architecture.md` | Project Architecture | Folders | Normative |
| `20-cli.md` | CLI Convention — Branch/Leaf | CLI & Scripts | Normative |
| `21-environment-scripts.md` | Environment & Health Scripts | CLI & Scripts | Normative |
| `22-config.md` | The `.workbench/` Configuration | CLI & Scripts | Normative |
| `23-hooks-contract.md` | Hooks Contract | CLI & Scripts | Normative |
| `24-skills-scope.md` | Skills in the Workbench Scope | CLI & Scripts | Normative |
| `30-wiki.md` | The Wiki — Entry Point | Tools | Normative |
| `31-browser-automation.md` | Browser Automation | Tools | Normative |
| `32-trash.md` | Trash — No Deletion, Only `.trash/` | Tools | Normative |
| `40-architecture-diagram.md` | Architecture Diagram | Reference | Informative |
