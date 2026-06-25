---
title: "Root and Projects"
description: "The workbench has **two structural levels**: the workbench root, and the projects beneath it. They have different layouts and different jobs, and keeping them distinct is a precondition for..."
workbench_version: "0.1.0"
spec_file: "10-root-and-projects.md"
order: 10
section: "Workbench"
normative: true
generated_at: "2026-06-25T18:01:17.107Z"
generated_from: "spec/workbench/0.1.0/10-root-and-projects.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/10-root-and-projects.md."
---


The workbench has **two structural levels**: the workbench root, and the projects beneath it. They have different layouts and different jobs, and keeping them distinct is a precondition for everything else in this spec. This chapter draws that boundary; the per-project layout itself is specified in [12-folders.md](/specification/folders/), and the local guarantee that protects both levels in [11-project-structure.md](/specification/project-structure/).

---

## The Workbench Root

The workbench root (for example a `ressources/` directory, or an equivalent workbench root) is the meta-orchestration layer. It does **not** hold project work directly; it holds the machinery shared across all projects. A workbench root **MUST** provide:

| Path | Purpose |
|------|---------|
| `projects/` | Contains every individual project, one directory each. |
| `cli/` | CLIs and tools shared across all projects (for example `memo-view`, `depwatch`). |
| `context/` | Global documents shared across all projects — mental models, standards, cross-project specifications. |
| `templates/` | Templates for new projects and for skills. |

The root level **organizes**; it does not develop code. Code lives inside the projects, under `repos/` (see [00-overview.md](/specification/overview/)).

---

## The Projects Beneath It

Every project lives under `projects/{name}/` and carries its **own** structure — a workbench-like layout, scaled to a single project. That per-project structure (which folders are mandatory, which are optional, and what each is for) is specified in [12-folders.md](/specification/folders/).

The relationship is deliberately self-similar but not identical: the root organizes *projects*, a project organizes its *repositories, memos, context, and tooling*. A reader should not confuse the two — a folder name that exists at the root (for example `context/`) also exists per project, but at a different scope.

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

## Related

- [11-project-structure.md](/specification/project-structure/) — the local guarantee that protects both levels.
- [12-folders.md](/specification/folders/) — the mandatory and optional folders of a single project.
- [00-overview.md](/specification/overview/) — projects-not-repositories framing.
