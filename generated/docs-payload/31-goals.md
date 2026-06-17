---
title: "Goals"
description: "A **goal** is the triggering **intent** behind work — the feature or outcome that several memos serve — and it is the only primitive that sits *above* a single memo (see..."
spec_version: "0.1.0"
spec_file: "31-goals.md"
order: 31
section: "Specification"
normative: true
generated_at: "2026-06-17T12:44:44.572Z"
generated_from: "spec/v0.1.0/31-goals.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/31-goals.md."
---


A **goal** is the triggering **intent** behind work — the feature or outcome that several memos serve — and it is the only primitive that sits *above* a single memo (see [30-primitives.md](/specification/primitives/)). Where a memo is the highest authority over its own rollout, a goal expresses an intent that persists across the memo sequence and outlives any one memo. A goal is defined by the intent it pursues, not by the surface it happens to touch: "a website" is a surface, "the project has a current public presence online" is the intent. Because the intent cross-cuts repos and memos, a goal is the natural unit at which to ask the honest question a single PASS-report cannot answer: *how far along is this, really?*

---

## What a Goal Is

A goal is a **cross-memo intent**, tracked with its own id (`G\d{3}`, e.g. `G001`) in a project-global store, separate from any single memo.

- **Intent, not surface.** A goal names the outcome that work serves, not a visible proxy for it. Scoring and grouping are done against the intent; a surface label ("the viewer", "the website") is at best a description of what the intent currently touches.
- **Spans several memos.** Many memos can contribute to one goal, and the goal persists while individual memos are finalized and rolled out. The cross-memo timeline a goal is read against is the memo history (see [26-memo-history.md](/specification/memo-history/)).
- **Research-only is not an open goal.** A goal that has only been researched, with no work intended yet, is not counted as an *open* goal in the working sense; it is a noted intent until work begins.
- **Stated explicitly.** A goal SHOULD be stated explicitly so the memos that serve it can be related back to it, and so its progress can be measured rather than assumed.

---

## Lifecycle

A goal has a deliberately simple, **fluid** lifecycle: `offen` → `abgeschlossen`, and back again when needed.

- **Completion is developer-declared.** A goal moves to `abgeschlossen` only when the developer declares it done — in practice around a high-but-not-perfect bar (≈95 %), with safety never traded away for the last few percent. A programmatic check MAY *suggest* completion, but the suggestion never flips the status on its own.
- **Re-openable.** Because understanding evolves, a goal that was closed MAY be re-opened. The status is a current judgement, not an irreversible gate.
- **Succession.** A goal keeps its base name across the work it spans; a follow-up stage is only introduced when there is genuinely new build on top, never to rename completed work. The base concept stays "goal".

---

## Scoring Mode

The value of a goal is that it is **measured against real state**, not against a self-report.

- **Never in the working session.** A goal is **never** scored in the same session that worked on it. A session that did the work will report "all done" and hide the gap (the lesson of an earlier episode where a working session declared a large requirement set complete and lost the real state). Scoring therefore runs in a **fresh context** — a separate, unbiased reader of the actual artifacts.
- **Distrust PASS.** A green conformity report is not evidence. The fresh-context reader inspects the real artifacts — files, wiring, tests actually run, real usage — and measures how far the **intent** is met, not whether a report is green.
- **A single score is a strict object.** One goal's score is `{ pct, done, missing, status, confidence, evidence }`: a percentage, what is genuinely there, what real work is still open, the lifecycle status, the provenance of the judgement, and concrete evidence pointers.
- **The board is the standard output.** Scoring all goals produces a board — a table of `Goal | % | Status | what is really missing`, sorted worst-first, followed by a summary line of the form `N open · M closed · Ø X %`, and a written report. This board, not a single number, is the deliverable.

---

## Friction and Recurrence

Goal progress is read alongside the **friction** the work encountered, because repeated returns to the same goal are a signal.

- **Not every return is friction.** Adding something new, pivoting deliberately, or extending scope are normal and carry no negative signal.
- **Rework and lost-in-translation are friction.** Re-implementing the same thing, or losing intent between hand-offs, is friction and is worth surfacing.
- **A recurrence heuristic.** Returning to the same goal a few times (≈ up to three implementation passes) is expectable; many returns (≈ six or more) is an alarm that the intent is not being met the way the work assumes.

---

## Goal vs ChroniC

A goal and the chronicle ([13-orchestration.md](/specification/orchestration/)) are **complementary**, and must not be confused.

- **ChroniC narrates; it does not grade.** The chronicle tells the story of what happened, in order, including the friction and the reversals — honestly, never flattering, and explicitly **not** a score.
- **A goal measures.** A goal carries the metric: how far the intent is met, at real state, in a fresh context.
- Read together, the chronicle says *what we did and where we turned*, and the goal says *how far that got us toward the intent*. Neither substitutes for the other.

---

## Related

- [30-primitives.md](/specification/primitives/) — the central glossary; the goal primitive is summarized there and specified in full here.
- [26-memo-history.md](/specification/memo-history/) — the cross-memo timeline a goal is read against.
- [00-overview.md](/specification/overview/) — mission and authority model (the memo is the authority; the goal spans the sequence).
- [13-orchestration.md](/specification/orchestration/) — where the chronicle lives, the complementary narrative to a goal's measurement.
- [06-memo-structure.md](/specification/memo-structure/) — the `.memo/` tree the goal store and score reports live beside.
