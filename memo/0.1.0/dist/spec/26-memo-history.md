---
title: "Chronicle (Memo History)"
description: "The **chronicle** is the project's timeline and its single entry point. Memos do not stand alone: they accumulate into a cumulative sequence — memo 0 is followed by memo 1, then memo 2, and so on —..."
spec_version: "0.1.0"
spec_file: "26-memo-history.md"
order: 26
section: "Specification"
normative: true
generated_at: "2026-07-10T11:08:29.606Z"
generated_from: "memo/0.1.0/draft/spec/26-memo-history.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.1.0/draft/spec/26-memo-history.md."
---


The **chronicle** is the project's timeline and its single entry point. Memos do not stand alone: they accumulate into a cumulative sequence — memo 0 is followed by memo 1, then memo 2, and so on — and read in order they tell the story of how the project evolved. The chronicle is the narrated record of that story; it is the artifact that gives an AI a sense of time across a project's lifetime, and the place a reader starts to understand the whole timeline before descending into any single memo beneath it. ("Memo History" is the chapter's earlier name and remains a valid alias.)

A timeline that only ran straight would be a list, not a history. What makes it a history is that the story can turn. A **breakpoint** — a point at which the direction of the project changes, an earlier decision is reversed, or the approach is fundamentally redrawn — MUST be recorded on the timeline at the memo where it happens. If the project turns at memo 23, the chronicle carries that breakpoint at position 23; everything written before it was written under the old direction, everything after under the new one.

---

## Timeline with Breakpoints

The chronicle is a sequence of memos ordered by their number, plus the breakpoints that mark where the story changed direction.

- The sequence is **cumulative**: each memo MAY assume the decisions and state established by the memos before it, and the chain `0 → 1 → 2 → …` is read as a continuous narrative of the project.
- A **breakpoint** is a recorded turn on that sequence. When a memo reverses, supersedes, or redirects a decision made earlier, that breakpoint MUST be marked on the timeline at the memo where it occurs, naming what changed. A breakpoint is not a deletion: the superseded memos remain (see *Coupling to State Preservation*); the breakpoint records that, from this point on, the project reads them differently.
- Reading the timeline, an AI can locate any memo relative to the breakpoints that surround it and so know which direction the project was facing when that memo was written.

> Terminology: earlier drafts called this turn a *pivot*. The normative term is **breakpoint**, matching the lived mechanism (`memo chronic add`) and one term per concept.

---

## Why the Timeline Exists

An AI does not, on its own, understand time. Two memos placed in front of it look equally present; it cannot tell from their content alone which one was written first, which one superseded the other, or whether a statement made long ago still holds today. The chronicle supplies that missing temporal grounding.

The purpose of the chronicle is to let a reader **judge whether information from an earlier memo still holds at a later one**. Consider a statement made in memo 20. By the time the project reaches memo 130, is that statement still true? Without a chronicle the question is unanswerable — the AI has no way to know what happened in between. With the timeline, the answer is mechanical: walk from memo 20 forward to memo 130 and check whether any breakpoint between them reversed or redirected the statement. If a breakpoint at memo 23 changed the direction the statement depended on, the information from memo 20 no longer holds; if nothing on the path touched it, it still stands.

This is the core value of the chapter. The timeline turns "does this old decision still apply?" from a guess into a traversal of recorded breakpoints.

---

## The Store and the Entry Schema

The chronicle is not only a concept — it is a lived store with a normative shape. It lives as flat, append-only Markdown under `.memo/chronic/`, written by the canonical `memo chronic add` command (the deliberate-simplicity principle: flat text, no database). Files roll over at roughly ten memos per file.

Each memo contributes **exactly one** narrated entry, and the entries form a chain — entry N references entry N-1 — so the timeline reads continuously and a missing link is visible. An entry has this shape:

| Field | Required | Purpose |
|-------|----------|---------|
| heading `### {memo-id} — {title}` | yes | anchors the entry to its memo (idempotency: one entry per memo) |
| previous-entry reference | yes | the N→N-1 chain; "first entry" for N=1 |
| narrated body | yes | what happened, what was tried, what was given up — **narrated, never graded** (no scores, no "good/bad") |
| breakpoint marker | when one occurs | one line per change of direction; omitted when none |
| `topics[]` | optional | the memo's topic coverage (id + rough % + one sentence); the chronicle SHOULD carry **all** of the memo's topics so it can serve as the complete entry point |
| `related` | optional | the repos/areas the memo touched — quick sight of its blast surface |
| `research` | optional | pointers (relative paths) into the memo's large research under `context/` (see [10-proactive-research.md](/specification/proactive-research/)) — pointers, not duplicates |
| `fastEntry` | optional | a distilled one-line core: distill once, re-enter fast next time |
| `pointers` | optional | deep-navigation anchors (`label → ref`, where `ref` is a file:line, memo id, or spec chapter) for fast traversal down into the memo |

All fields beyond the required core are **additive**: an entry without them is valid, and older entries stay valid unchanged. The optional fields are what let the chronicle act as the entry point — from one narrated line a reader descends through `related`/`research`/`pointers` into the memo, its revisions, and its `context/` research beneath.

---

## Coupling to State Preservation

The chronicle works only because memos are kept. Memos are **time documents** — persistent records of the decisions, rationale, and open questions captured at the moment they were made (see [18-multidimensionality.md](/specification/multidimensionality/)). Because the system preserves that state rather than discarding superseded memos, the timeline has something to point at: every position on it resolves to a memo that still exists and can still be read in its original form.

A breakpoint therefore never erases the memos before it. The superseded decisions stay on the record, exactly as written; the breakpoint only records that the project turned away from them. State preservation is what makes the chronicle honest — the old direction is still visible, so the turn can be understood — and the chronicle is what makes state preservation useful, because it tells a reader how to interpret each preserved state relative to the turns that came after it.

---

## The Chronicle Feeds Goals and Maintenance

The chronicle is updated first, and the rest of the project reads it. From the narrated timeline the project derives both its forward and its backward views: new intent becomes a goal ([31-goals.md](/specification/goals/), read against the chronicle as its run-up), and delivered work becomes maintenance ([33-maintenance.md](/specification/maintenance/), the drift that accrues behind shipped features). This is why the chronicle SHOULD carry all of a memo's topics: completeness is the precondition for it to serve as the ground those derivations stand on. The ordering and the new/drift split are specified in [31-goals.md](/specification/goals/) and [33-maintenance.md](/specification/maintenance/).

---

## Distinction from the Project Wiki

The chronicle is not the project wiki, and the two MUST NOT be conflated.

- The **wiki** is a *query tool* (registered in [24-tools-registry.md](/specification/tools-registry/)): a way to ask "how does the workbench do X right now?" and get the current, consolidated answer. It is organized by topic and reflects the present state.
- The **chronicle** is a *chronological, narrated record of breakpoints*: it answers "when did the project decide X, and has that decision been turned since?" It is organized by time and reflects the sequence of change.

A topic in the wiki tells you the current answer; the chronicle tells you how that answer came to be and whether an older form of it is still valid. The two are complementary: the wiki is consulted for the present, the chronicle for the temporal validity of the past. Each refers to the other rather than duplicating it — the wiki does not carry the breakpoint timeline, and the chronicle does not carry consolidated topic pages.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [18-multidimensionality.md](/specification/multidimensionality/) — memos as time documents and the state-preservation model the timeline depends on.
- [10-proactive-research.md](/specification/proactive-research/) — large research goes to `context/`, the target of an entry's `research` pointers.
- [31-goals.md](/specification/goals/) — the forward view derived from the chronicle (a goal is read against the timeline).
- [33-maintenance.md](/specification/maintenance/) — the backward view derived from the chronicle (drift behind delivered features).
- [24-tools-registry.md](/specification/tools-registry/) — the project wiki as a query tool, distinct from the chronological chronicle.
- [00-overview.md](/specification/overview/) — conformance language.
