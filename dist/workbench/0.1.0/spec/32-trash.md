---
title: ".trash/"
description: "Work in a project is exploratory and often half-formed. Material that looks discardable today may be needed tomorrow, and an irreversible deletion in an autonomous loop is a class of mistake that..."
workbench_version: "0.1.0"
spec_file: "32-trash.md"
order: 32
section: "Workbench"
normative: true
generated_at: "2026-06-30T23:17:19.700Z"
generated_from: "draft/workbench/0.1.0/spec/32-trash.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/workbench/0.1.0/spec/32-trash.md."
---


Work in a project is exploratory and often half-formed. Material that looks discardable today may be needed tomorrow, and an irreversible deletion in an autonomous loop is a class of mistake that cannot be undone. The workbench therefore replaces deletion with **recoverable trashing**.

---

## Folder Contract

| Field | Value |
|-------|-------|
| Name | `.trash/` |
| Status | Mandatory |
| Level | Project |
| Entry-point | — |
| Convention | — |
| Purpose | The recoverable deletion target — the project-local folder removals route through instead of erasing. |
| Goes in | Material being removed, moved here (timestamped) so it stays recoverable until a human empties it. |
| Does not | Scratch that was never knowledge (that is `.tmp/`, see [19-tmp.md](/specification/tmp/)); it is emptied only by a human, never automatically. |

> The Folder Contract follows the fixed per-folder shape defined in the session conventions ([session/13-conventions.md](/session/conventions/)); its first six fields mirror this folder's row in the central contract table ([12-folders.md](/specification/folders/)).

---

## No Deletion — Only `.trash/`

Removing material from a project **MUST** route through the project-local `.trash/` folder (see [11-project-structure.md](/specification/project-structure/)).

- "Removing" a file or folder means **moving** it into `.trash/`, not erasing it. The material remains on disk, recoverable, until a human decides otherwise.
- `.trash/` is **manual**. It is emptied by a person, deliberately — never automatically by a script, a cleanup routine, or an autonomous loop. Automatic emptying would re-create the irreversible-loss risk the policy exists to remove.
- Because `.trash/` lives inside the local project (under the local guarantee of [11-project-structure.md](/specification/project-structure/)), trashed material never leaves the machine and is never pushed.

Superseded knowledge — for example, an outdated wiki page — is trashed, not deleted, so its provenance can still be recovered if needed.

---

## `rm -rf` Is Forbidden

Destructive recursive removal is **forbidden**.

- `rm -rf` (and equivalent destructive, recursive, irreversible removals) **MUST NOT** be used on project material. Such a command erases without recovery and bypasses the `.trash/` safety net entirely.
- Tooling that needs to "delete" **MUST** instead move the target into `.trash/` (a timestamped move), preserving recoverability.
- This prohibition is absolute for project content: there is no scenario in normal project work that requires an irreversible recursive delete, because the recoverable move accomplishes the same intent safely.

---

## `.tmp/` Is Scratch, Not a Trash Can

`.tmp/` sits beside `.trash/` but is its opposite, and the two **MUST NOT** be conflated: `.trash/` holds material that *was* knowledge and is being removed — recoverable, emptied only by a human — whereas `.tmp/` holds material that was *never* durable knowledge, scratch expected to be discarded. The `.tmp/` folder is specified in full on its own page ([19-tmp.md](/specification/tmp/)); the tier model that sets `.tmp/` against the durable `data/`/`context/` tiers is owned by [12-folders.md](/specification/folders/).

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [11-project-structure.md](/specification/project-structure/) — the `.trash/` folder and the local guarantee that contains it.
- [12-folders.md](/specification/folders/) — the folder contract registering `.trash/` and `.tmp/`, and the `data/`/`context/` durable tiers.
- [19-tmp.md](/specification/tmp/) — the `.tmp/` scratch folder this page contrasts with but does not specify.
- [00-overview.md](/specification/overview/) — workbench spec scope.
