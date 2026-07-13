# 15. repos/

| | |
|---|---|
| Status | Draft |
| Depends on | [11-project-structure.md](./11-project-structure.md), [12-folders.md](./12-folders.md) |
| Related | [22-config.md](./22-config.md), [41-project-architecture.md](./41-project-architecture.md) |

`repos/` is the one place in a project where a git **remote** lives. It holds the project's repositories — and **only** the repositories — so that everything shareable is isolated behind an explicit boundary while the rest of the project stays local. Versioning itself is not confined this way: any folder **MAY** carry a local, remote-less git repository for backup and findability. What `repos/` reserves is the ability to attach a remote and push. This is the per-folder page for `repos/`; the rules it gathers are specified normatively in the chapters it links to.

---

## Folder Contract

| Field | Value |
|-------|-------|
| Name | `repos/` |
| Status | Mandatory |
| Level | Project |
| Entry-point | — |
| Convention | — |
| Purpose | The project's git repositories — one domain per repository; the only **remote-bearing** git units in the project. |
| Goes in | Git repositories under `repos/<name>/`, one per domain. |
| Does not | Non-repository material; any **remote** attached outside `repos/` (the project root and `.memo/` MAY carry a local, remote-less git for versioning, but never a remote). |

> The Folder Contract follows the fixed per-folder shape defined in the session conventions ([session/13-conventions.md](/session/conventions/)); its first six fields mirror this folder's row in the central contract table ([12-folders.md](./12-folders.md)).

---

## One Domain Per Repository

A repository under `repos/<name>/` is a **single-domain code unit**. A project is a coherent context that may hold several such repositories — one per domain — rather than a single repository carrying unrelated concerns. The project, not the repository, is the unit of organization (see [00-overview.md](./00-overview.md)); `repos/` is where that project's code is partitioned into domains, each its own git unit.

---

## Git Everywhere, Remote Only in `repos/`

Versioning and publication are two different acts, and the workbench draws its boundary at **publication**, not at git itself.

- **Git everywhere, for versioning.** Any folder in a project **MAY** carry its own local git repository — the project root, `.memo/`, the `spec/` workshop, a scratch folder — purely for backup, history, and findability. Such a repository has **no remote**: it records history locally and can never be pushed. This is already the lived practice: the project-local `spec/` workshop container keeps a local git with no remote, for provenance.
- **Remote only in `repos/`.** A git **remote** — the thing that makes a repository publishable — **MUST** only be attached to a repository under `repos/`. A remote on any folder outside `repos/` is refused (the remote gate, [22-config.md](./22-config.md)).

The consequence is still sharp, but re-grounded: material that needs to be shared is placed in a repository under `repos/`, where a remote is allowed; material that must stay local is versioned anywhere else, remote-less, and cannot be pushed because it has nowhere to push to. Pushing remains a deliberate act scoped to a single `repos/` repository, never something that can sweep up the whole project. The local guarantee ([11-project-structure.md](./11-project-structure.md)) rests on this confinement of **remotes**, not on the absence of git.

> **BREAKING.** This **inverts** the earlier semantics. Earlier drafts made `repos/` *the only place git lives* and treated any git repository outside `repos/` as a blocker — the local guarantee was grounded on the *absence of git* at the root and under `.memo/`. The norm is now **git everywhere for versioning, remote only in `repos/`**: a local, remote-less git outside `repos/` is normal and permitted, and the guarantee is grounded on the *confinement of remotes* instead. Any tool or check that flagged "a git repository outside `repos/`" **MUST** be re-pointed to flag "a *remote* outside `repos/`". The version implication of this breaking change is handled by a later step.

---

## Each Repository Declares Its Status

A repository declares its **status** — three axes, all stated once in the project configuration ([22-config.md](./22-config.md)): **visibility** (`private` or `public`), **remote** (`none` or a named URL), and **facing** (`inward` or `outward`). The facing axis drives the coordination convention (rule C1): an **outward** repository routes coordination through public **Issues**; an **inward** repository routes it through the **memo ID**. Visibility and remote are declared the same way and read by the **same enforcement** — the push gate consumes all three rather than inferring exposure from git state. The `facing` attribute is also the one the project-architecture bundle records per repository ([41-project-architecture.md](./41-project-architecture.md)), so a repository's role is stated in one vocabulary and read consistently by both the configuration and the architecture graph.

The declared status is not taken on trust. The workbench **health-check** and **git-security** verify it — the declared visibility, remote, and facing **MUST** match the repository's actual state — and a push is **gated** by the declared status (a push to a repository declared `inward` is blocked; see [23-hooks-contract.md](./23-hooks-contract.md)).

---

## Conformity Requirements

The `repos/` rules are structural and verified rather than trusted. The blocks below encode this chapter's binding `MUST`s prose-first — each `statement` faces how a project's code is partitioned, and each `check` faces the workbench health-check and git-security. They are the source the requirement store is harvested from ([../../v0.2.0/23-requirements.md](/specification/requirements/)).

That `repos/` holds only single-domain repositories and is the only home for a remote is a structural fact:

```requirement
{
  "id": "REQ-955",
  "title": "repos/ holds only single-domain repositories and is the only home for a remote",
  "statement": "Every entry under `repos/<name>/` MUST be a single-domain git repository, and `repos/` MUST be the only place a git remote is attached — no folder outside `repos/` carries a remote, though any folder MAY carry a local, remote-less git for versioning. `repos/` MUST NOT hold non-repository material, and a domain carrying unrelated concerns MUST be split into separate repositories rather than combined into one.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["repos", "git-structure"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each immediate child of `repos/` is a git repository",
      "No git remote is configured outside `repos/` in the project",
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

- [11-project-structure.md](./11-project-structure.md) — the local guarantee: `repos/` as the only sanctioned home for shareable code.
- [12-folders.md](./12-folders.md) — the folder contract this page is the registered entry for.
- [22-config.md](./22-config.md) — the per-repository status declaration (visibility, remote, facing), rule C1, and the remote gate that refuses a remote outside `repos/`.
- [41-project-architecture.md](./41-project-architecture.md) — the repositories as nodes in the project's architecture graph.
