---
title: "Memo Structure & Local Guarantee"
description: "Memos are numbered with **zero-padded** identifiers (for example, `001`, `017`, `138`). Each memo lives in a directory named `{NNN}-{slug}`. The numeric prefix is stable for the life of the memo and..."
spec_version: "0.1.0"
spec_file: "06-memo-structure.md"
order: 6
section: "Specification"
normative: true
generated_at: "2026-06-10T23:29:45.219Z"
generated_from: "spec/v0.1.0/06-memo-structure.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/06-memo-structure.md."
---

| | |
|---|---|
| Status | Draft |
| Depends on | [05-memo-strategies.md](/specification/memo-strategies/) |
| Related | [07-revisions-and-questions.md](/specification/revisions-and-questions/), [12-rollout.md](/specification/rollout/), [16-git-security-versioning.md](/specification/git-security-versioning/) |

> **Normative.** Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](/specification/overview/) (Conformance).

---

## Numbering

Memos are numbered with **zero-padded** identifiers (for example, `001`, `017`, `138`). Each memo lives in a directory named `{NNN}-{slug}`. The numeric prefix is stable for the life of the memo and is the basis for the memo ID used in git references (see [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)).

---

## Directory Layout

A memo directory contains a fixed set of sub-folders, each with a single responsibility:

| Folder | Responsibility |
|--------|----------------|
| `revisions/` | The revision files `REV-XX.md` (zero-padded, two digits). The current memo content. |
| `transcripts/` | The dictated transcripts that fed the memo. |
| `rollout/` | Rollout artifacts: state files for crash recovery and the standing lessons-learned file. |
| `validation/` | Validation outputs produced during finalization and rollout. |

A memo MUST place its content under `revisions/` as discrete `REV-XX.md` files. Revisions MUST NOT be edited in place; each change produces a new file (see [07-revisions-and-questions.md](/specification/revisions-and-questions/)).

---

## Local, Never Uploaded — a Structural Guarantee

Memo content is **local** and is **never uploaded**. In this specification, "never uploaded" is not a behavioral rule that an agent is asked to remember and honor — it is a **structural guarantee**: the `.memo/` tree contains no git repository, so there is no mechanism by which its content could be pushed.

This is the verified correction of an earlier framing. The earlier model stated "never uploaded" as a rule one had to follow; the verified system makes it structural. A structural guarantee cannot be forgotten under time pressure the way a rule can.

The consequences:

- The `.memo/` tree MUST NOT be a git repository and MUST NOT be tracked by a parent repository.
- The single legitimate exit point from local memo content to a remote is a deliberate, separate act — for instance, a published specification chapter or a GitHub issue — never an accidental push of memo internals. The git-security gate ([16-git-security-versioning.md](/specification/git-security-versioning/)) backs this up by scanning anything that does cross the boundary.

The practical effect is that hours of dictated reasoning, half-formed decisions, and private context can be preserved verbatim in the memo without any risk of exposure, which in turn is what makes context preservation ([04-input-pipeline.md](/specification/input-pipeline/)) safe to apply without self-censorship.

---

## Related

- [07-revisions-and-questions.md](/specification/revisions-and-questions/) — the three-area revision structure and the question format.
- [12-rollout.md](/specification/rollout/) — the `rollout/` folder and the lessons-learned file.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — the security gate at the one exit point.
