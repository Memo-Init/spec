---
title: ".trash/"
description: "Work in a project is exploratory and often half-formed. Material that looks discardable today may be needed tomorrow, and an irreversible deletion in an autonomous loop is a class of mistake that..."
workbench_version: "0.1.0"
spec_file: "32-trash.md"
order: 32
section: "Workbench"
normative: true
generated_at: "2026-06-27T01:24:20.547Z"
generated_from: "spec/workbench/0.1.0/32-trash.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/32-trash.md."
---


Work in a project is exploratory and often half-formed. Material that looks discardable today may be needed tomorrow, and an irreversible deletion in an autonomous loop is a class of mistake that cannot be undone. The workbench therefore replaces deletion with **recoverable trashing**.

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

## `.tmp/` Is Scratch Space, Not a Trash Can

`.tmp/` is the project's optional **scratch / temporary working area**: a place for ephemeral, transient material produced while working — intermediate output, throwaway drafts, captures that need not persist. It is a registered, optional folder ([12-folders.md](/specification/folders/)) and sits beside `.trash/`, but the two are distinct and **MUST NOT** be conflated:

- **`.trash/`** holds material that *was* knowledge and is being removed; it is the recoverable deletion target, emptied only by a human. Routing a removal here preserves provenance.
- **`.tmp/`** holds material that was *never* durable knowledge to begin with — scratch that is expected to be discarded. Content in `.tmp/` is transient and **is not committed** as durable knowledge.

`.tmp/` also differs from `data/` and `context/`, the two **durable** tiers: `data/` keeps raw inputs and `context/` keeps the processed result, both retained; `.tmp/` keeps neither — it is working space whose contents may be cleared at any time without loss ([12-folders.md](/specification/folders/)). Because it is local-only working material, `.tmp/` is never pushed. Specialized captures (`proofs/`, `snapshots/`) **MAY** live under `.tmp/` when they are ephemeral rather than durable ([12-folders.md](/specification/folders/)).

---

## Related

- [11-project-structure.md](/specification/project-structure/) — the `.trash/` folder and the local guarantee that contains it.
- [12-folders.md](/specification/folders/) — the folder contract registering `.trash/` and `.tmp/`, and the `data/`/`context/` durable tiers.
- [00-overview.md](/specification/overview/) — workbench spec scope.
