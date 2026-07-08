---
title: "repos/"
description: "`repos/` is the one place in a project where git lives. It holds the project's repositories — and **only** the repositories — so that everything shareable is isolated behind an explicit boundary..."
workbench_version: "0.1.0"
spec_file: "15-repos.md"
order: 15
section: "Workbench"
normative: true
generated_at: "2026-07-08T12:09:11.029Z"
generated_from: "draft/workbench/0.1.0/spec/15-repos.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/workbench/0.1.0/spec/15-repos.md."
---


`repos/` is the one place in a project where git lives. It holds the project's repositories — and **only** the repositories — so that everything shareable is isolated behind an explicit boundary while the rest of the project stays local. This is the per-folder page for `repos/`; the rules it gathers are specified normatively in the chapters it links to.

---

## Folder Contract

| Field | Value |
|-------|-------|
| Name | `repos/` |
| Status | Mandatory |
| Level | Project |
| Entry-point | — |
| Convention | — |
| Purpose | The project's git repositories — one domain per repository; the only git units in the project. |
| Goes in | Git repositories under `repos/<name>/`, one per domain. |
| Does not | Non-repository material; any second git root (the project root and `.memo/` are never repositories). |

> The Folder Contract follows the fixed per-folder shape defined in the session conventions ([session/13-conventions.md](/session/conventions/)); its first six fields mirror this folder's row in the central contract table ([12-folders.md](/workbench/folders/)).

---

## One Domain Per Repository

A repository under `repos/<name>/` is a **single-domain code unit**. A project is a coherent context that may hold several such repositories — one per domain — rather than a single repository carrying unrelated concerns. The project, not the repository, is the unit of organization (see [00-overview.md](/workbench/overview/)); `repos/` is where that project's code is partitioned into domains, each its own git unit.

---

## The Only Git Units in the Project

Every repository under `repos/` is its own git unit, and they are the **only** git units in the project. Neither the project root nor `.memo/` is a repository — that absence is the structural basis of the local guarantee ([11-project-structure.md](/workbench/project-structure/)). The consequence is sharp: material that needs to be shared is placed in a repository under `repos/`, and material that must stay local is kept anywhere outside it. Pushing is therefore a deliberate act scoped to a single repository, never something that can sweep up the whole project.

---

## Each Repository Declares Its Status

A repository declares its **status** — three axes, all stated once in the project configuration ([22-config.md](/workbench/config/)): **visibility** (`private` or `public`), **remote** (`none` or a named URL), and **facing** (`inward` or `outward`). The facing axis drives the coordination convention (rule C1): an **outward** repository routes coordination through public **Issues**; an **inward** repository routes it through the **memo ID**. Visibility and remote are declared the same way and read by the **same enforcement** — the push gate consumes all three rather than inferring exposure from git state. The `facing` attribute is also the one the project-architecture bundle records per repository ([41-project-architecture.md](/workbench/project-architecture/)), so a repository's role is stated in one vocabulary and read consistently by both the configuration and the architecture graph.

The declared status is not taken on trust. The workbench **health-check** and **git-security** verify it — the declared visibility, remote, and facing **MUST** match the repository's actual state — and a push is **gated** by the declared status (a push to a repository declared `inward` is blocked; see [23-hooks-contract.md](/workbench/hooks-contract/)).

---

## Conformity Requirements

The `repos/` rules are structural and verified rather than trusted. The blocks below encode this chapter's binding `MUST`s prose-first — each `statement` faces how a project's code is partitioned, and each `check` faces the workbench health-check and git-security. They are the source the requirement store is harvested from ([../../v0.1.0/23-requirements.md](/specification/requirements/)).

That `repos/` holds only single-domain repositories and is the only git location is a structural fact:

```requirement
{
  "id": "REQ-955",
  "title": "repos/ holds only single-domain repositories and is the only git location",
  "statement": "Every entry under `repos/<name>/` MUST be a single-domain git repository, and these MUST be the only git units in the project — neither the project root nor the memo store is a repository. `repos/` MUST NOT hold non-repository material, and a domain carrying unrelated concerns MUST be split into separate repositories rather than combined into one.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["repos", "git-structure"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each immediate child of `repos/` is a git repository",
      "No git repository exists outside `repos/` in the project",
      "No non-repository material sits directly under `repos/`"
    ]
  },
  "grade": "binary"
}
```

A declared status that contradicts the repository's real git state is a hard failure, so the verification rule's `grade` is `binary`:

```requirement
{
  "id": "REQ-956",
  "title": "A repository's declared status matches its real git state",
  "statement": "Each repository's declared three-axis status — visibility, remote, facing — MUST match reality: a repository declared `outward` MUST actually have its named remote, and one declared `inward` MUST have no remote (or `none`). The status is declared once in the project configuration and verified, not trusted; a declaration that contradicts the repository's real git state is a failure that the health-check and git-security surface.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["repos", "git-status", "facing"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each repository declared `outward` has its named remote configured",
      "Each repository declared `inward` has no remote, or `none`",
      "Every repository under `repos/` carries a declared status record"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [11-project-structure.md](/workbench/project-structure/) — the local guarantee: `repos/` as the only sanctioned home for shareable code.
- [12-folders.md](/workbench/folders/) — the folder contract this page is the registered entry for.
- [22-config.md](/workbench/config/) — the per-repository status declaration (visibility, remote, facing) and rule C1.
- [41-project-architecture.md](/workbench/project-architecture/) — the repositories as nodes in the project's architecture graph.
