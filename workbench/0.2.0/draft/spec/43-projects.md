# 43. projects/

| | |
|---|---|
| Status | Draft |
| Depends on | [10-root-and-projects.md](./10-root-and-projects.md), [12-folders.md](./12-folders.md) |
| Related | [11-project-structure.md](./11-project-structure.md) |

`projects/` is the workbench root's **container of all projects** — one directory per project, each carrying its own project-level structure. It is a mandatory ROOT-level folder (a workbench root MUST provide it, [10-root-and-projects.md](./10-root-and-projects.md)), and it is easy to overlook precisely because it is where all the actual work then lives. This page owns the `projects/` spec; [10-root-and-projects.md](./10-root-and-projects.md) owns the root-vs-project boundary.

---

## Folder Contract

```folder
{
  "name":       "projects/",
  "status":     "mandatory",
  "level":      "root",
  "entryPoint": null,
  "convention": null,
  "purpose":    "The workbench root's container of all projects — one directory per project, each with its own project-level structure.",
  "goesIn":     "One directory per project, projects/<name>/, each following the project folder contract.",
  "doesNot":    "Cross-project machinery (that is cli/, templates/, or the root context/); project code directly (that lives inside each project's repos/).",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](./12-folders.md)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## A Root-Level Folder, Not a Project-Level One

The workbench has two structural levels — the workbench root and the projects beneath it. `projects/` is one of the four folders a workbench root MUST provide (alongside `cli/`, the root `context/`, and `templates/`). Every project lives under `projects/<name>/` and carries its own structure, scaled to a single project ([12-folders.md](./12-folders.md)). The root ORGANIZES projects; it does not develop code — code lives inside each project under `repos/`.

---

## The Root Inventory

Naming the workbench root's required folders as a small inventory keeps `projects/` from being read in isolation — `projects/` (all projects), `cli/` (shared CLIs and tools), the root `context/` (cross-project standards, the one folder that also exists per project), and `templates/` (templates for new projects and skills). `projects/` is governed by the Root-SOP, not the Projects-SOP ([10-root-and-projects.md](./10-root-and-projects.md)).

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [10-root-and-projects.md](./10-root-and-projects.md) — the root-vs-project boundary and the root inventory.
- [11-project-structure.md](./11-project-structure.md) — the local guarantee protecting both levels.
- [12-folders.md](./12-folders.md) — the per-project folder contract each `projects/<name>/` follows.
