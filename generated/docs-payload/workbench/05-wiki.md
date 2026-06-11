---
title: "Wiki Types — Project Wiki & Memo Wiki"
description: "This chapter is **normative** for the distinction between the two wiki types and for the memo-ID stamping that makes the memo wiki timeline-aware."
spec_version: "0.1.0"
spec_file: "05-wiki.md"
order: 5
section: "Workbench"
normative: true
generated_at: "2026-06-11T03:44:50.158Z"
generated_from: "spec/workbench/05-wiki.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/05-wiki.md."
---


> Normative language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119] [RFC8174]. RFC 2119 keywords are used.

This chapter is **normative** for the distinction between the two wiki types and for the memo-ID stamping that makes the memo wiki timeline-aware.

---

## Purpose

A project accumulates knowledge that outlives any single memo. That knowledge needs a home that is more durable than a memo revision but less rigid than the specification. The workbench recognizes **two kinds of wiki**, each with a different relationship to time, and they **MUST NOT** be conflated.

---

## The Project Wiki (`.wiki/`)

The **project wiki** is the LLM-generated knowledge base under `.wiki/` (see [01-project-structure.md](/specification/project-structure/)). It is built and maintained from the project's context documents and finalized memos.

- The project wiki **assumes its data is current.** A page states what is true now; it does not, by itself, carry the timeline that would let a reader judge whether a statement has since gone stale.
- It is optimized for **answering questions** about the project as it stands. A query against the project wiki returns the present-tense understanding.
- The project wiki is **local-only** and is never pushed (consistent with the local guarantee of [01-project-structure.md](/specification/project-structure/)).

This currency assumption is the project wiki's strength (simple, present-tense answers) and its limitation (staleness is not self-evident).

---

## The Memo Wiki (NEW) — Timeline-Aware

The **memo wiki** is the new, timeline-aware counterpart. Where the project wiki assumes currency, the memo wiki makes time **explicit**.

- Every fact recorded in the memo wiki **MUST** carry the **memo ID** of the memo it originated from (the `M{NNN}-...` identifier; see the core-spec git-workflow chapter and [04-strands.md](/specification/strands/)).
- Because each fact is stamped with its originating memo, **staleness is detectable.** A reader can see which memo a statement came from, locate later memos that touched the same subject, and judge whether the statement still holds. A fact whose memo has been superseded is visibly suspect rather than silently wrong.
- The memo wiki is therefore a **timeline of knowledge** keyed by memo. It does not assume currency; it records provenance and lets currency be **inferred** from the memo timeline.

A memo-wiki entry **MUST NOT** record a fact without its originating memo ID — an unstamped fact would reintroduce exactly the silent-staleness problem the memo wiki exists to solve.

---

## When to Use Which

| Need | Wiki |
|------|------|
| A present-tense answer about the project as it stands | Project wiki (`.wiki/`) |
| A fact with provenance, where staleness must be detectable | Memo wiki |
| Knowledge that must be cross-checked against the memo timeline | Memo wiki |

The two coexist: the project wiki gives fast present-tense answers; the memo wiki gives auditable, time-stamped provenance. A project **SHOULD** keep them distinct so the currency assumption of one never silently contaminates the provenance discipline of the other.

---

## Related

- [01-project-structure.md](/specification/project-structure/) — the optional `.wiki/` folder and the local guarantee.
- [06-trash.md](/specification/trash/) — superseded wiki material is trashed, not deleted.
- [04-strands.md](/specification/strands/) — strands and memo IDs that the memo wiki stamps onto facts.
- [00-overview.md](/specification/overview/) — sub-spec scope.
