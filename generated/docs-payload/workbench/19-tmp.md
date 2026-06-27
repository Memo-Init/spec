---
title: ".tmp/"
description: "`.tmp/` is the project's **ephemeral scratch** folder: a dot-prefixed, machine-local area for throwaway working files that no part of the project depends on. It is the scratch counterpart to..."
workbench_version: "0.1.0"
spec_file: "19-tmp.md"
order: 19
section: "Workbench"
normative: true
generated_at: "2026-06-27T09:35:23.180Z"
generated_from: "spec/workbench/0.1.0/19-tmp.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/19-tmp.md."
---


`.tmp/` is the project's **ephemeral scratch** folder: a dot-prefixed, machine-local area for throwaway working files that no part of the project depends on. It is the scratch counterpart to `.trash/` — where `.trash/` holds *recoverable* deletions, `.tmp/` holds files that were never meant to last at all. This page **owns** the `.tmp/` specification; [12-folders.md](/specification/folders/) owns the durable/scratch tier model, and [32-trash.md](/specification/trash/) points here rather than re-specifying scratch.

---

## Folder Contract

| Field | Value |
|-------|-------|
| Name | `.tmp/` |
| Status | Optional |
| Level | Project |
| Entry-point | — |
| Convention | — |
| Purpose | Ephemeral scratch — throwaway working files no part of the project depends on. |
| Goes in | Transient, discardable working material: intermediate output, scratch copies, staging for a multi-step operation. |
| Does not | The sole copy of anything that matters; durable knowledge; committed content (it is gitignored). |

> The Folder Contract follows the fixed per-folder shape defined in the session conventions ([session/13-conventions.md](/session/conventions/)); its first six fields mirror this folder's row in the central contract table ([12-folders.md](/specification/folders/)).

---

## What `.tmp/` Is For

`.tmp/` holds intermediate output that a tool or an agent produces while doing work and does not need afterwards — a half-rendered artifact, a scratch copy, a staging area for a multi-step operation. It is the right home for "I need somewhere to put this for a moment" so that such files do not litter the authored folders (`context/`, `repos/`, `design/`).

It carries a **leading dot** because it holds machine-generated, non-authored content — the same rule that dots `.trash/`, `.wiki/`, and `.memo/` and leaves `repos/`, `context/`, and `design/` undotted ([12-folders.md](/specification/folders/)). It is **gitignored**: nothing in `.tmp/` is ever committed.

---

## The Throwaway Guarantee

Two rules make `.tmp/` safe to rely on as scratch:

- **Safe to delete at any time.** Any process — a cleanup script, an agent, the user — MAY empty `.tmp/` without warning. A tool that writes to `.tmp/` MUST treat its contents as volatile.
- **Never the only copy.** `.tmp/` MUST NOT hold the sole copy of anything that matters. Material worth keeping belongs in an authored folder or, when it is a deliberate deletion, in `.trash/` ([32-trash.md](/specification/trash/)) — which is recoverable, where `.tmp/` is not.

The distinction from `.trash/` is the point: a deletion routed to `.trash/` is a thing the user might want back; a file in `.tmp/` is a thing no one will ever want back.

---

## Related

- [32-trash.md](/specification/trash/) — the recoverable-deletion folder `.tmp/` is the throwaway counterpart to.
- [12-folders.md](/specification/folders/) — the folder contract and the dot/no-dot rule that classes `.tmp/` as machine-local.
- [16-context.md](/specification/context/) — the authored research store, where material worth keeping goes instead of `.tmp/`.
