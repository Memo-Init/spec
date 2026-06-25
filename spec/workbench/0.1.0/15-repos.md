# 15. The `repos/` Folder

| | |
|---|---|
| Status | Draft |
| Depends on | [11-project-structure.md](./11-project-structure.md), [12-folders.md](./12-folders.md) |
| Related | [22-config.md](./22-config.md), [41-project-architecture.md](./41-project-architecture.md) |

`repos/` is the one place in a project where git lives. It holds the project's repositories — and **only** the repositories — so that everything shareable is isolated behind an explicit boundary while the rest of the project stays local. This is the per-folder page for `repos/`; the rules it gathers are specified normatively in the chapters it links to.

---

## One Domain Per Repository

A repository under `repos/<name>/` is a **single-domain code unit**. A project is a coherent context that may hold several such repositories — one per domain — rather than a single repository carrying unrelated concerns. The project, not the repository, is the unit of organization (see [00-overview.md](./00-overview.md)); `repos/` is where that project's code is partitioned into domains, each its own git unit.

---

## The Only Git Units in the Project

Every repository under `repos/` is its own git unit, and they are the **only** git units in the project. Neither the project root nor `.memo/` is a repository — that absence is the structural basis of the local guarantee ([11-project-structure.md](./11-project-structure.md)). The consequence is sharp: material that needs to be shared is placed in a repository under `repos/`, and material that must stay local is kept anywhere outside it. Pushing is therefore a deliberate act scoped to a single repository, never something that can sweep up the whole project.

---

## Each Repository Declares Its Facing

A repository is classified **inward** or **outward** facing, and the classification is declared once in the project configuration ([22-config.md](./22-config.md)). The facing drives the coordination convention (rule C1): an **outward** repository routes coordination through public **Issues**; an **inward** repository routes it through the **memo ID**. The same `facing` attribute is the one the project-architecture bundle records per repository ([41-project-architecture.md](./41-project-architecture.md)), so a repository's role is stated in one vocabulary and read consistently by both the configuration and the architecture graph.

---

## Related

- [11-project-structure.md](./11-project-structure.md) — the local guarantee: `repos/` as the only sanctioned home for shareable code.
- [12-folders.md](./12-folders.md) — the folder contract this page is the registered entry for.
- [22-config.md](./22-config.md) — the `facing` declaration and rule C1.
- [41-project-architecture.md](./41-project-architecture.md) — the repositories as nodes in the project's architecture graph.
