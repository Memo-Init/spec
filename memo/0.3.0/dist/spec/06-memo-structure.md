---
title: "Memo Structure"
description: "A memo has a stable on-disk shape: a numbered directory, a project prefix to avoid ID collisions, and an internal layout that the rest of the system relies on. This chapter defines how memos are..."
spec_version: "0.3.0"
spec_file: "06-memo-structure.md"
order: 6
section: "Specification"
normative: true
generated_at: "2026-07-17T23:43:43.034Z"
generated_from: "memo/0.3.0/draft/spec/06-memo-structure.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.3.0/draft/spec/06-memo-structure.md."
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
| `media/` | Memo-local images and assets (screenshots, mockups, exported diagrams) referenced by the revisions. |
| `transcripts/` | The dictated transcripts that fed the memo. |
| `rollout/` | Rollout artifacts: state files for crash recovery and the standing lessons-learned file. |
| `validation/` | Validation outputs produced during finalization and rollout. |

A memo MUST place its content under `revisions/` as discrete `REV-XX.md` files. Revisions MUST NOT be edited in place; each change produces a new file (see [07-revisions-and-questions.md](/specification/revisions-and-questions/)). Images and other assets live in `media/`, parallel to `context/`, and are referenced from a revision with a simple relative path (`![](media/screenshot-pencil-revision-2.png)`); filenames SHOULD be speaking (`media/screenshot-pencil-revision-2.png`, not `media/1.png`), and there is deliberately no revision-relative path scheme — one flat `media/` folder per memo keeps references trivial.

---

## Local, Never Uploaded — a Structural Guarantee

Memo content is **local** and is **never uploaded**. In this specification, "never uploaded" is not a behavioral rule that an agent is asked to remember and honor — it is a **structural guarantee**: the `.memo/` tree carries no git remote — and no remote-bearing parent tracks it — so there is no mechanism by which its content could be pushed (a local, remote-less git for versioning is permitted).

Making this structural rather than a rule matters: a structural guarantee cannot be forgotten under time pressure the way a rule can.

The consequences:

- The `.memo/` tree MUST NOT carry a git remote and MUST NOT be tracked by a remote-bearing parent repository (a local, remote-less git for versioning is permitted).
- The single legitimate exit point from local memo content to a remote is a deliberate, separate act — for instance, a published specification chapter or a GitHub issue — never an accidental push of memo internals. The git-security gate ([16-git-security-versioning.md](/specification/git-security-versioning/)) backs this up by scanning anything that does cross the boundary.

The practical effect is that hours of dictated reasoning, half-formed decisions, and private context can be preserved verbatim in the memo without any risk of exposure, which in turn is what makes context preservation ([04-input-pipeline.md](/specification/input-pipeline/)) safe to apply without self-censorship.

---

## The `media/` Asset Convention

Creative and visual assets that a memo produces — generated images, UI mockups, exported diagrams, and short videos — live under the memo's own `media/` folder: `.memo/memos/{NNN}-{slug}/media/`. The folder is part of the memo's on-disk structure (it appears in the directory layout above, parallel to `context/`), and assets are referenced from a revision with a simple relative path.

The line this specification draws is deliberate: the **storage location** of these assets, and the discipline below for producing them, are in scope here as structure. The **creative output itself** is not. How an art style is chosen, how an image-generator prompt is written, which video tooling renders a clip — that craft stays out of the process spec's scope, the same line the diagram chapter ([40-diagrams.md](/specification/diagrams/)) already draws between working decision-tool diagrams and presentation art. The structure owns *where the asset sits and the rules for handling it*; the creative chapters own *how the asset is made*.

Two handling rules are structural and apply regardless of the creative craft:

- **Wireframe first, refinement later.** A UI mockup is produced **black-and-white wireframe first, color and refinement later**. The first pass is a low-fidelity structural draft that exists to be argued with; color, polish, and dark-mode treatment come in later iterations once the structure is agreed. This staging mirrors the same structure-before-color discipline diagrams already follow (see [40-diagrams.md](/specification/diagrams/)).
- **A design file is reached through its editor, never read as text.** A UI design lives as a binary `.pen` design file, and that file is opened, queried, and edited **only through its dedicated editor tool**. It MUST NOT be read as plain text or scanned with text tools — its contents are not meaningful outside the editor, and treating it as text is a tooling error, not a shortcut.

---

## The Topic Store Write-Side

The topic store at `<memoDir>/_topics/` has two sides. Its read/coverage side — how derived topics are surveyed and how coverage is checked — is specified with the input pipeline ([04-input-pipeline.md](/specification/input-pipeline/)). This section adds the **write side**.

The topic store is **written during input processing**: as topics are extracted from the dictated transcripts and linked material, each one is **registered** into `_topics/` at the moment it is identified. Registration is therefore not a later bookkeeping step — it is part of input processing itself, and it runs before the memo body is authored. This matters because the topic store is the **head of the executable chain**: the registered topics are what the downstream machinery later expands into research, chapters, and rollout units. If a topic is never registered on the write side, nothing downstream can pick it up, so the write side existing and running inside input processing is what makes the rest of the chain reachable.

---

## Sub-Memos On Disk

A memo MAY spawn **sub-memos** — child memos that carve a contained piece of work out of a parent. Their on-disk relationship to the parent is structural:

- A sub-memo is a memo in its own right, with the same internal layout (`revisions/`, `_topics/`, `context/`, and the rest), placed under the parent so the parent–child relationship is visible on disk.
- The parent carries an **index that references its children**, so that from the parent alone one can enumerate every sub-memo it spawned. The index is the authoritative list of the parent's children; a child without a corresponding parent-index entry is an orphan and is treated as a structural defect.

This section specifies only the on-disk placement and the parent→child index. What a finalization gate does about *open* sub-memos — whether a parent may finalize while a child is still in flight — is a finalization concern and is defined with the quality and finalization rules ([11-quality-and-finalization.md](/specification/quality-and-finalization/)), not here.

---

## Building On a Prior Memo

When a memo builds on an earlier memo — continuing its work, depending on a decision it made, or extending a primitive it introduced — that dependency is **recorded** so it can later be verified rather than inferred. The record is a small, explicit pointer from the dependent memo to the one it builds on; it is enough to re-check, at any later point, that the thing being built on still holds. The broader cross-memo timeline — how memos relate over the whole life of a project — is kept in the history chapter ([26-memo-history.md](/specification/memo-history/)); here the point is only that the per-memo build-on dependency is captured at the structure level.

---

## Conformity Requirements

The memo-structure rules above are authored **prose-first** as declarative requirements (the prose-first guard, [35-memo-authoring.md](/specification/memo-authoring/) and [23-requirements.md](/specification/requirements/)): each rule's `statement` faces generation and its `check` faces the finalization/push gate, resolving to a ternary `PASS` / `BLOCKED` / `INCONCLUSIVE`. The blocks below are the machine-readable source the requirement store is **harvested** from. Each lift checks a concrete on-disk structure — a directory path, the absence of a git repository, a registered topic, a parent index — so every one earns a `binary` grade.

```requirement
{
  "id": "REQ-810",
  "title": "Canonical memo directory layout and numbering",
  "statement": "Each memo MUST live in a directory `.memo/memos/{NNN}-{slug}/` whose zero-padded numeric identifier stays stable for the life of the memo. The flat layout `.memo/{NNN}-{slug}/` is deprecated and read only as a legacy fallback; new memos MUST be created under `.memo/memos/`.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["memo-structure", "numbering"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each memo directory matches `.memo/memos/{NNN}-{slug}/` with a zero-padded numeric prefix",
      "A newly created memo is placed under `.memo/memos/`, never under the deprecated flat `.memo/{NNN}-{slug}/` path"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-811",
  "title": "The .memo tree carries no git remote",
  "statement": "The `.memo/` tree MUST NOT carry a git remote and MUST NOT be tracked by a remote-bearing parent repository, so memo content cannot be pushed by any mechanism; a local, remote-less git for versioning is permitted (git everywhere for versioning, remote only under `repos/`), and the guarantee rests on the confinement of remotes rather than the absence of git. 'Never uploaded' is a structural guarantee, not a behavioral rule an agent must remember; the only legitimate exit point to a remote is a separate, deliberate act (a published chapter or an issue), which the git-security gate scans.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["memo-structure", "local-guarantee"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No git remote is configured at or inside the `.memo/` tree",
      "No remote-bearing parent repository tracks `.memo/` content"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-812",
  "title": "Topic store write-side populated during input processing",
  "statement": "Each topic extracted from the dictated transcripts and linked material MUST be registered into the memo's `_topics/` store at the moment it is identified — during input processing, before the memo body is authored. The topic store is the head of the executable chain: a topic never registered on the write side cannot be picked up by any downstream research, chapter, or rollout step.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["memo-structure", "topic-store"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The memo's `_topics/` store carries an entry for every extracted topic",
      "Topic registration occurs during input processing, not as a later bookkeeping step after the body is written"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-813",
  "title": "Sub-memos are indexed by their parent",
  "statement": "A parent memo MUST carry an index that references every sub-memo it spawned, so the parent's children can be enumerated from the parent alone. A sub-memo uses the same internal layout as any memo and is placed under its parent on disk; a child without a corresponding parent-index entry is an orphan and is treated as a structural defect.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["memo-structure", "sub-memo"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each spawned sub-memo has a matching entry in its parent's child index",
      "Every sub-memo on disk resolves to a parent-index entry (no orphans)"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [04-input-pipeline.md](/specification/input-pipeline/) — input processing, where topics are registered into the topic store's write side.
- [07-revisions-and-questions.md](/specification/revisions-and-questions/) — the three-area revision structure and the question format.
- [12-rollout.md](/specification/rollout/) — the `rollout/` folder and the lessons-learned file.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — the security gate at the one exit point.
- [30-primitives.md](/specification/primitives/) — central glossary and concept map; the memo, revision, and block primitives summarized.
- [35-memo-authoring.md](/specification/memo-authoring/) — how a memo's content is authored well: tables, generated data payloads, conventions.
- [40-diagrams.md](/specification/diagrams/) — the structure-before-color discipline and the scope line between working diagrams and creative output.
- [26-memo-history.md](/specification/memo-history/) — the cross-memo timeline that the per-memo build-on dependency feeds.
