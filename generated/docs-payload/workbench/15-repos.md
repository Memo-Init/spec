---
title: "repos/"
description: "`repos/` is the one place in a project where git lives. It holds the project's repositories — and **only** the repositories — so that everything shareable is isolated behind an explicit boundary..."
workbench_version: "0.1.0"
spec_file: "15-repos.md"
order: 15
section: "Workbench"
normative: true
generated_at: "2026-06-26T13:58:57.404Z"
generated_from: "spec/workbench/0.1.0/15-repos.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/15-repos.md."
---


`repos/` is the one place in a project where git lives. It holds the project's repositories — and **only** the repositories — so that everything shareable is isolated behind an explicit boundary while the rest of the project stays local. This is the per-folder page for `repos/`; the rules it gathers are specified normatively in the chapters it links to.

---

## One Domain Per Repository

A repository under `repos/<name>/` is a **single-domain code unit**. A project is a coherent context that may hold several such repositories — one per domain — rather than a single repository carrying unrelated concerns. The project, not the repository, is the unit of organization (see [00-overview.md](/specification/overview/)); `repos/` is where that project's code is partitioned into domains, each its own git unit.

---

## The Only Git Units in the Project

Every repository under `repos/` is its own git unit, and they are the **only** git units in the project. Neither the project root nor `.memo/` is a repository — that absence is the structural basis of the local guarantee ([11-project-structure.md](/specification/project-structure/)). The consequence is sharp: material that needs to be shared is placed in a repository under `repos/`, and material that must stay local is kept anywhere outside it. Pushing is therefore a deliberate act scoped to a single repository, never something that can sweep up the whole project.

---

## Each Repository Declares Its Status

A repository declares its **status** — three axes, all stated once in the project configuration ([22-config.md](/specification/config/)): **visibility** (`private` or `public`), **remote** (`none` or a named URL), and **facing** (`inward` or `outward`). The facing axis drives the coordination convention (rule C1): an **outward** repository routes coordination through public **Issues**; an **inward** repository routes it through the **memo ID**. Visibility and remote are declared the same way and read by the **same enforcement** — the push gate consumes all three rather than inferring exposure from git state. The `facing` attribute is also the one the project-architecture bundle records per repository ([41-project-architecture.md](/specification/project-architecture/)), so a repository's role is stated in one vocabulary and read consistently by both the configuration and the architecture graph.

The declared status is not taken on trust. The workbench **health-check** and **git-security** verify it — the declared visibility, remote, and facing **MUST** match the repository's actual state — and a push is **gated** by the declared status (a push to a repository declared `inward` is blocked; see [23-hooks-contract.md](/specification/hooks-contract/)).

---

## Related

- [11-project-structure.md](/specification/project-structure/) — the local guarantee: `repos/` as the only sanctioned home for shareable code.
- [12-folders.md](/specification/folders/) — the folder contract this page is the registered entry for.
- [22-config.md](/specification/config/) — the per-repository status declaration (visibility, remote, facing) and rule C1.
- [41-project-architecture.md](/specification/project-architecture/) — the repositories as nodes in the project's architecture graph.
