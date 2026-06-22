---
title: "Memo Structure"
description: "A memo has a stable on-disk shape: a numbered directory, a project prefix to avoid ID collisions, and an internal layout that the rest of the system relies on. This chapter defines how memos are..."
spec_version: "0.1.0"
spec_file: "06-memo-structure.md"
order: 6
section: "Specification"
normative: true
generated_at: "2026-06-22T09:56:04.990Z"
generated_from: "spec/v0.1.0/06-memo-structure.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/06-memo-structure.md."
---


A memo has a stable on-disk shape: a numbered directory, a project prefix to avoid ID collisions, and an internal layout that the rest of the system relies on. This chapter defines how memos are numbered and structured so that their identifiers stay stable for the life of the memo.

## Numbering

Memos are numbered with **zero-padded** identifiers (for example, `001`, `017`, `138`). Each memo lives in a directory named `.memo/memos/{NNN}-{slug}/`. The numeric prefix is stable for the life of the memo and is the basis for the memo ID used in git references (see [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)). The flat layout `.memo/{NNN}-{slug}/` is **deprecated** and read only as a legacy fallback; new memos MUST be created under `.memo/memos/`.

### Project Prefix

When multiple projects share the same git repository, numeric memo IDs can collide. To prevent this, each project MAY declare a short **project prefix** (a concise, uppercase identifier, for example `CORE`, `API`, `WEB`). The prefix is stored in the project's `.memo/config.json`:

```json
{
  "projectPrefix": "CORE"
}
```

When a prefix is set, memo IDs in git commit messages and cross-project references SHOULD be written as `{PREFIX}-{NNN}` (for example, `CORE-017`). The `M` shorthand (from chapter 17) is optional and applies within a single project context. Within a single-project `.memo/` tree no prefix is required; the prefix is only mandatory when referencing memos across project boundaries in a shared repository.

---

## Directory Layout

A memo directory contains a fixed set of sub-folders, each with a single responsibility:

| Folder | Responsibility |
|--------|----------------|
| `revisions/` | The revision files `REV-XX.md` (zero-padded, two digits). The current memo content. |
| `_topics/` | Per-memo research topics and their derived notes. |
| `context/` | Memo-local context documents and linked source material. |
| `transcripts/` | The dictated transcripts that fed the memo. |
| `rollout/` | Rollout artifacts: state files for crash recovery and the standing lessons-learned file. |
| `validation/` | Validation outputs produced during finalization and rollout. |

A memo MUST place its content under `revisions/` as discrete `REV-XX.md` files. Revisions MUST NOT be edited in place; each change produces a new file (see [07-revisions-and-questions.md](/specification/revisions-and-questions/)).

---

## Local, Never Uploaded — a Structural Guarantee

Memo content is **local** and is **never uploaded**. In this specification, "never uploaded" is not a behavioral rule that an agent is asked to remember and honor — it is a **structural guarantee**: the `.memo/` tree contains no git repository, so there is no mechanism by which its content could be pushed.

Making this structural rather than a rule matters: a structural guarantee cannot be forgotten under time pressure the way a rule can.

The consequences:

- The `.memo/` tree MUST NOT be a git repository and MUST NOT be tracked by a parent repository.
- The single legitimate exit point from local memo content to a remote is a deliberate, separate act — for instance, a published specification chapter or a GitHub issue — never an accidental push of memo internals. The git-security gate ([16-git-security-versioning.md](/specification/git-security-versioning/)) backs this up by scanning anything that does cross the boundary.

The practical effect is that hours of dictated reasoning, half-formed decisions, and private context can be preserved verbatim in the memo without any risk of exposure, which in turn is what makes context preservation ([04-input-pipeline.md](/specification/input-pipeline/)) safe to apply without self-censorship.

---

## Related

- [07-revisions-and-questions.md](/specification/revisions-and-questions/) — the three-area revision structure and the question format.
- [12-rollout.md](/specification/rollout/) — the `rollout/` folder and the lessons-learned file.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — the security gate at the one exit point.
- [30-primitives.md](/specification/primitives/) — central glossary and concept map; the memo, revision, and block primitives summarized.
- [35-memo-authoring.md](/specification/memo-authoring/) — how a memo's content is authored well: tables, generated data payloads, conventions.
