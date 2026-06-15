---
title: "Trash"
description: "Work in a project is exploratory and often half-formed. Material that looks discardable today may be needed tomorrow, and an irreversible deletion in an autonomous loop is a class of mistake that..."
spec_version: "0.1.0"
spec_file: "06-trash.md"
order: 6
section: "Workbench"
normative: true
generated_at: "2026-06-15T10:49:59.632Z"
generated_from: "spec/workbench/06-trash.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/06-trash.md."
---


Work in a project is exploratory and often half-formed. Material that looks discardable today may be needed tomorrow, and an irreversible deletion in an autonomous loop is a class of mistake that cannot be undone. The workbench therefore replaces deletion with **recoverable trashing**.

---

## No Deletion — Only `.trash/`

Removing material from a project **MUST** route through the project-local `.trash/` folder (see [01-project-structure.md](/specification/project-structure/)).

- "Removing" a file or folder means **moving** it into `.trash/`, not erasing it. The material remains on disk, recoverable, until a human decides otherwise.
- `.trash/` is **manual**. It is emptied by a person, deliberately — never automatically by a script, a cleanup routine, or an autonomous loop. Automatic emptying would re-create the irreversible-loss risk the policy exists to remove.
- Because `.trash/` lives inside the local project (under the local guarantee of [01-project-structure.md](/specification/project-structure/)), trashed material never leaves the machine and is never pushed.

Superseded knowledge — for example, an outdated wiki page — is trashed, not deleted, so its provenance can still be recovered if needed.

---

## `rm -rf` Is Forbidden

Destructive recursive removal is **forbidden**.

- `rm -rf` (and equivalent destructive, recursive, irreversible removals) **MUST NOT** be used on project material. Such a command erases without recovery and bypasses the `.trash/` safety net entirely.
- Tooling that needs to "delete" **MUST** instead move the target into `.trash/` (a timestamped move), preserving recoverability.
- This prohibition is absolute for project content: there is no scenario in normal project work that requires an irreversible recursive delete, because the recoverable move accomplishes the same intent safely.

---

## Related

- [01-project-structure.md](/specification/project-structure/) — the `.trash/` folder and the local guarantee that contains it.
- [00-overview.md](/specification/overview/) — sub-spec scope.
