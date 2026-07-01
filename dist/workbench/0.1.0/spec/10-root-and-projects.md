---
title: "Root and Projects"
description: "The workbench has **two structural levels**: the workbench root, and the projects beneath it. They have different layouts and different jobs, and keeping them distinct is a precondition for..."
workbench_version: "0.1.0"
spec_file: "10-root-and-projects.md"
order: 10
section: "Workbench"
normative: true
generated_at: "2026-07-01T01:33:48.544Z"
generated_from: "draft/workbench/0.1.0/spec/10-root-and-projects.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/workbench/0.1.0/spec/10-root-and-projects.md."
---


The workbench has **two structural levels**: the workbench root, and the projects beneath it. They have different layouts and different jobs, and keeping them distinct is a precondition for everything else in this spec. This chapter draws that boundary; the per-project layout itself is specified in [12-folders.md](/specification/folders/), and the local guarantee that protects both levels in [11-project-structure.md](/specification/project-structure/). Each level is governed by its own thin SOP — a **Root-SOP** and a **Projects-SOP**, both instances of the common SOP standard ([the Session spec's SOP area](/session/sop/)).

---

## The Workbench Root

The workbench root (for example a `ressources/` directory, or an equivalent workbench root) is the meta-orchestration layer. It does **not** hold project work directly; it holds the machinery shared across all projects. A workbench root **MUST** provide:

| Path | Purpose |
|------|---------|
| `projects/` | Contains every individual project, one directory each. |
| `cli/` | CLIs and tools shared across all projects (for example `memo-view`). |
| `context/` | Global documents shared across all projects — mental models, standards, cross-project specifications. |
| `templates/` | Templates for new projects and for skills. |

The root level **organizes**; it does not develop code. Code lives inside the projects, under `repos/` (see [00-overview.md](/specification/overview/)).

---

## The Projects Beneath It

Every project lives under `projects/{name}/` and carries its **own** structure, scaled to a single project. That per-project structure (which folders are mandatory, which are optional, and what each is for) is specified in [12-folders.md](/specification/folders/).

The two levels must not be confused. The root organizes *projects*; a project organizes its *repositories, memos, context, and tooling*. A folder name that exists at the root (for example `context/`) also exists per project, but at a different scope. The boundary is a clean cut, not a resemblance: the root level never holds project work directly, and a project never holds the cross-project machinery. The next section makes the cut governing — one thin SOP per level.

---

## Two Thin SOPs — Root-SOP and Projects-SOP

Each level is governed by its **own** thin SOP. Both are instances of the common SOP standard ([the Session spec's SOP area](/session/sop/)): each **declares that it is an instance of that standard and extends it**, and each realizes the standard's **Setup**, **Health**, and **Update** for its own scope rather than restating the standard. Keeping them as two distinct SOPs — instead of one self-similar procedure that blurs both levels — is what makes the Root-vs-Project boundary operational.

| SOP | Governs | Folders in scope | Realizes |
|-----|---------|------------------|----------|
| **Root-SOP** | the workbench-root level — organize, do not develop | `cli/`, `context/`, `projects/`, `templates/`; the shared tools | Setup / Health / Update for the **root** scope: does each project exist with the expected structure, are the shared tools reachable. |
| **Projects-SOP** | the project level — the project's own work | `repos/`, `context/`, `.memo/`, `design/` (the project-level folders, [12-folders.md](/specification/folders/)) | Setup / Health / Update for the **project** scope: the project's memos, repositories, context, and tooling. |

- The **Root-SOP** is the procedure for the meta-orchestration layer: it sets up the root-level folders, checks that every project beneath it carries the expected structure and that shared tools are reachable, and brings the root up to date. It does no project work.
- The **Projects-SOP** is the procedure for working *inside* one project: it sets up and checks a single project's folders, drives the project's own work (memos, repositories, tooling), and keeps the project current.

Both SOPs are **thin**: each **references the SOP standard** for the meaning of Setup, Health, Update, and Extras instead of restating it, and adds only what is specific to its scope. They are named as the two workbench instances in the SOP [instance register](/session/instances/). The workbench-SOP entry point ([02-sop-entrypoint.md](/specification/sop-entrypoint/)) routes to whichever of the two applies based on **where the agent is** — the Root-SOP at the workbench root, the Projects-SOP inside a project. An agent therefore reads exactly one of the two for the level it is operating at, and the level it is operating at is decided by its location.

---

## The Context Hierarchy

`context/` exists at **both** levels, and the distinction is load-bearing:

| Level | Path | Holds |
|-------|------|-------|
| **Global** | `<root>/context/` | Standards and mental models that apply across all projects. |
| **Project** | `projects/{name}/context/` | Documents specific to one project — its specifications, its deep-research output. |

A document **MUST** be placed at the level at which it applies. A cross-project standard belongs in the global `context/`; a project-specific specification belongs in that project's `context/`. Misplacing a document (a project detail at the root, or a global standard buried in one project) is a structural finding the workbench audit surfaces.

---

## Both Levels Are Local

Neither the workbench root nor any project root is a git repository. This is the structural basis of the **local guarantee**, specified in full in [11-project-structure.md](/specification/project-structure/): material that has no enclosing repository cannot be pushed, so memos, context, and research stay on the developer's machine by construction. Only the repositories under each project's `repos/` are git units.

---

## Where Policy Lives

Workbench-level policy — the conventions both levels obey — belongs in **this specification** and in the **`.workbench/` configuration** ([22-config.md](/specification/config/)). A `CLAUDE.md` is a **thin pointer**: it tells an agent which SOP to read ("read the workbench-SOP" at the root, "read the Projects-SOP" inside a project), and states the *why* and *when* of that scope. It is **not** the place where conventions are defined or enforced. The same division of responsibility applies as elsewhere in this spec: the spec and the configuration **declare** policy; the machine tier **enforces** it ([22-config.md](/specification/config/)); and `CLAUDE.md` merely **points** at both.

The motivating problem is duplication. Today three `CLAUDE.md` files — a global one, the workbench-root one, and each project's — carry overlapping and workbench-specific policy: the four-stage process appears in all three, the "no follow-up memos" rule in two, and folder conventions, the `.memo/` internal layout, branch-naming, and inward/outward repo routing are scattered across them. Three independent copies of one rule drift apart and contradict each other. The remedy is to keep each policy in **one** authoritative place and let `CLAUDE.md` point there.

The following categories of content **MUST** move out of `CLAUDE.md` into this spec or the `.workbench/` configuration, and `CLAUDE.md` **MUST** reference them rather than restate them:

| Content | Authoritative home |
|---------|--------------------|
| Folder conventions (which folders exist, mandatory vs optional, at which level) | this spec ([12-folders.md](/specification/folders/)) |
| The `.memo/` internal layout | this spec ([11-project-structure.md](/specification/project-structure/), [17-memo-store.md](/specification/memo-store/)) |
| Branch-naming | this spec |
| Inward/outward repo routing (rule C1) | the `.workbench/` configuration ([22-config.md](/specification/config/)) |

Once a convention lives in its authoritative home, a `CLAUDE.md` adds value only as a **signpost** to it — never as a second, divergent copy. This keeps a single source for each rule and confines `CLAUDE.md` to orientation.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [11-project-structure.md](/specification/project-structure/) — the local guarantee that protects both levels.
- [12-folders.md](/specification/folders/) — the mandatory and optional folders of a single project.
- [02-sop-entrypoint.md](/specification/sop-entrypoint/) — the workbench-SOP entry point that routes to the Root-SOP or the Projects-SOP.
- [22-config.md](/specification/config/) — the `.workbench/` configuration, where policy is declared.
- [00-overview.md](/specification/overview/) — projects-not-repositories framing.
- [The Session spec's SOP area](/session/sop/) — the common SOP standard of which the Root-SOP and Projects-SOP are instances.
