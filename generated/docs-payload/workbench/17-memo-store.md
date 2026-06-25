---
title: "The `.memo/` Folder"
description: "`.memo/` is the on-disk footprint of the **memo system** — the workbench's weightiest add-on, and its recommended default mode of working ([26-addons.md](./26-addons.md)). This is the per-folder page..."
workbench_version: "0.1.0"
spec_file: "17-memo-store.md"
order: 17
section: "Workbench"
normative: true
generated_at: "2026-06-25T18:46:44.485Z"
generated_from: "spec/workbench/0.1.0/17-memo-store.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/17-memo-store.md."
---


`.memo/` is the on-disk footprint of the **memo system** — the workbench's weightiest add-on, and its recommended default mode of working ([26-addons.md](/specification/addons/)). This is the per-folder page for `.memo/`: it specifies the folder's *role* and *top-level layout* in the workbench. The memo *lifecycle* — input, revisions, questions, phases, rollout — is the subject of the core specification ([../../v0.1.0/06-memo-structure.md](/specification/memo-structure/)) and is not restated here.

---

## The Footprint of an Add-On

`.memo/` is the data area the memo-system add-on reserves in a project, in the pattern every add-on follows: the tool is provided globally, and its per-project working data is written under a declared folder ([26-addons.md](/specification/addons/)). Its dot prefix marks it as generated, local machinery — and because the project root is local, `.memo/` is **never a git repository** and its contents never leave the machine ([11-project-structure.md](/specification/project-structure/)). The memo system is the recommended default, which is why a real project almost always carries `.memo/`; the workbench *core*, however, does not depend on it ([12-folders.md](/specification/folders/)).

---

## Top-Level Layout

`.memo/` separates the **memos** from the **shared stores** they draw on. Memos live under `.memo/memos/`, one directory per memo; the stores sit directly under `.memo/`, independent of any single memo:

| Path | Holds |
|------|-------|
| `memos/<NNN-slug>/` | One memo each — its revisions, topics, context, transcripts, validation, and rollout working files. |
| `_requirements/` | The requirements store — registry, schema, and reports. |
| `_references/` | Shared reference material cited across memos. |
| `transcripts/` | Staged input transcripts before they become a memo or a revision. |
| `chronic/` | The narrated chronicle — a flat, append-only record across memos. |
| `plans/` | Plans, each composed of one or more finalized memos. |
| `strands/` | Emergent cross-memo strands. |
| `_archive/` | Frozen legacy material that predates the current numbering. |
| `config.json` | The project's memo configuration, including its branch/ID prefix. |

The canonical layout places memos under `.memo/memos/<NNN-slug>/`; a flat legacy layout (`<NNN-slug>/` directly under `.memo/`) **MAY** still be read for backward compatibility but is not the target for new memos.

---

## Related

- [26-addons.md](/specification/addons/) — the add-on model `.memo/` is the heaviest instance of.
- [11-project-structure.md](/specification/project-structure/) — why `.memo/` is never a git repository.
- [12-folders.md](/specification/folders/) — the folder contract and the core-vs-add-on split this page is the registered entry for.
- [../../v0.1.0/06-memo-structure.md](/specification/memo-structure/) — the memo structure and lifecycle the core specification owns.
- [../../v0.1.0/02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/) — the memo SOP entry point.
