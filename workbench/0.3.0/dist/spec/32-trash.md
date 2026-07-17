---
title: ".trash/"
description: "Work in a project is exploratory and often half-formed. Material that looks discardable today may be needed tomorrow, and an irreversible deletion in an autonomous loop is a class of mistake that..."
workbench_version: "0.3.0"
spec_file: "32-trash.md"
order: 32
section: "Workbench"
normative: true
generated_at: "2026-07-17T23:43:43.034Z"
generated_from: "workbench/0.3.0/draft/spec/32-trash.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: workbench/0.3.0/draft/spec/32-trash.md."
---


Work in a project is exploratory and often half-formed. Material that looks discardable today may be needed tomorrow, and an irreversible deletion in an autonomous loop is a class of mistake that cannot be undone. The workbench therefore replaces deletion with **recoverable trashing**.

---

## Folder Contract

```folder
{
  "name":       ".trash/",
  "status":     "mandatory",
  "level":      "project",
  "entryPoint": null,
  "convention": null,
  "purpose":    "The recoverable deletion target — the project-local folder removals route through instead of erasing.",
  "goesIn":     "Material being removed, moved here (timestamped) so it stays recoverable until a human empties it.",
  "doesNot":    "Scratch that was never knowledge (that is .tmp/, see [19-tmp.md](/workbench/tmp/)); it is emptied only by a human, never automatically.",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](/workbench/folders/)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## No Deletion — Only `.trash/`

Removing material from a project **MUST** route through the project-local `.trash/` folder (see [11-project-structure.md](/workbench/project-structure/)).

- "Removing" a file or folder means **moving** it into `.trash/`, not erasing it. The material remains on disk, recoverable, until a human decides otherwise.
- `.trash/` is **manual**. It is emptied by a person, deliberately — never automatically by a script, a cleanup routine, or an autonomous loop. Automatic emptying would re-create the irreversible-loss risk the policy exists to remove.
- Because `.trash/` lives inside the local project (under the local guarantee of [11-project-structure.md](/workbench/project-structure/)), trashed material never leaves the machine and is never pushed.

Superseded knowledge — for example, an outdated wiki page — is trashed, not deleted, so its provenance can still be recovered if needed.

---

## `rm -rf` Is Forbidden

Destructive recursive removal is **forbidden**.

- `rm -rf` (and equivalent destructive, recursive, irreversible removals) **MUST NOT** be used on project material. Such a command erases without recovery and bypasses the `.trash/` safety net entirely.
- Tooling that needs to "delete" **MUST** instead move the target into `.trash/` (a timestamped move), preserving recoverability.
- This prohibition is absolute for project content: there is no scenario in normal project work that requires an irreversible recursive delete, because the recoverable move accomplishes the same intent safely.

---

## `.tmp/` Is Scratch, Not a Trash Can

`.tmp/` sits beside `.trash/` but is its opposite, and the two **MUST NOT** be conflated: `.trash/` holds material that *was* knowledge and is being removed — recoverable, emptied only by a human — whereas `.tmp/` holds material that was *never* durable knowledge, scratch expected to be discarded. The `.tmp/` folder is specified in full on its own page ([19-tmp.md](/workbench/tmp/)); the tier model that sets `.tmp/` against the durable `data/`/`context/` tiers is owned by [12-folders.md](/workbench/folders/).

---

## Per-Memo Subfolders

`.trash/` segments its contents by the active memo id, mirroring `.tmp/` ([19-tmp.md](/workbench/tmp/)): discarded material lands under `.trash/<memo-id>/`, one subfolder per memo, so recovery can be reasoned about one memo at a time.

- **Discarding routes into the memo's subfolder.** Consistent with the move-not-delete rule above, "removing" material while a memo is active means **moving** it into that memo's subfolder — `.trash/<memo-id>/` — not erasing it. The material stays recoverable there until a human empties it.
- **`undefined/` is the fallback.** When no memo is active, `<memo-id>` is the literal `undefined`, so discards land in `.trash/undefined/`. A removal always has a valid target and never has to fall back to erasing.

Segmentation is purely organizational: it changes *where under* `.trash/` a discard lands, never *whether* it is recoverable. Every subfolder, `.trash/undefined/` included, stays under the manual-empty guarantee — emptied only by a human, never automatically.

---

## The No-Delete Guarantee (Workbench-Wide)

The move-not-delete rule is not a local convenience of one folder — it is a **workbench-wide guarantee**. Across the whole workbench, root and every project, **nothing is hard-deleted**. Discarding material means **moving** it into `.trash/<memo-id>/`; it is never erased in place.

- **Every discard has a valid target, coupled to the active session.** The `<memo-id>` segment is the active session's memo id, so a removal is always attributable to the work that made it. When no memo is active the segment is the literal `undefined` (`.trash/undefined/`, above), so a discard **always** has a valid target and never has to fall back to erasing. The guarantee is coupled to a valid session precisely so that the target is always well-defined.
- **The guarantee spans the workbench.** It is the universal discipline over all workbench work; the mechanism is the project-local `.trash/<memo-id>/` (aligned with the `.tmp/<memo-id>/` scratch convention, [19-tmp.md](/workbench/tmp/)). No cleanup routine, autonomous loop, or tool may bypass it with an in-place delete.
- **`.trash/` is the only home for a removal.** A tool that needs to "delete" moves the target into `.trash/<memo-id>/`; the irreversible recursive delete (`rm -rf`) forbidden above has no exception anywhere in the workbench.

This section states the guarantee prose-first; the block below is its machine-readable form.

---

## Conformity Requirements

The no-delete guarantee is a binding workbench-wide rule, so it is authored here prose-first as a checkable requirement. Its `statement` faces every act that removes material, and its `check` faces the structure audit and any tooling that discards; it is the source the requirement store is harvested from ([23-requirements.md](/specification/requirements/)).

That a removal is always a recoverable move into `.trash/<memo-id>/`, never a hard delete, is a hard yes/no rule, so its `grade` is `binary`:

```requirement
{
  "id": "REQ-982",
  "title": "Removal is a recoverable move into .trash/<memo-id>/, never a hard delete",
  "statement": "Across the workbench — root and every project — material MUST NOT be hard-deleted; removing it means MOVING it into `.trash/<memo-id>/`, where `<memo-id>` is the active session's memo id (or the literal `undefined` when none is active, so a discard always has a valid target). `.trash/` MUST be emptied only by a human, never automatically by a script, cleanup routine, or autonomous loop, and the irreversible recursive delete (`rm -rf`) MUST NOT be used on workbench material.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["trash", "no-delete", "recoverability"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A discard lands under `.trash/<memo-id>/`, never erased in place",
      "The `<memo-id>` target is the active memo id, or the literal `undefined` when none is active",
      "`.trash/` is emptied only by a human, never automatically",
      "No tool performs an irreversible recursive delete (`rm -rf`) on workbench material"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [11-project-structure.md](/workbench/project-structure/) — the `.trash/` folder and the local guarantee that contains it.
- [12-folders.md](/workbench/folders/) — the folder contract registering `.trash/` and `.tmp/`, and the `data/`/`context/` durable tiers.
- [19-tmp.md](/workbench/tmp/) — the `.tmp/` scratch folder this page contrasts with but does not specify.
- [00-overview.md](/workbench/overview/) — workbench spec scope.
