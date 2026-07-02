---
title: "Goals"
description: "A **goal** is the triggering **intent** behind work — the feature or outcome that several memos serve — and it is the only primitive that sits *above* a single memo (see..."
spec_version: "0.1.0"
spec_file: "31-goals.md"
order: 31
section: "Specification"
normative: true
generated_at: "2026-07-02T13:49:37.873Z"
generated_from: "draft/memo/0.1.0/spec/31-goals.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/31-goals.md."
---


A **goal** is the triggering **intent** behind work — the feature or outcome that several memos serve — and it is the only primitive that sits *above* a single memo (see [30-primitives.md](/specification/primitives/)). Where a memo is the highest authority over its own rollout, a goal expresses an intent that persists across the memo sequence and outlives any one memo. A goal is defined by the intent it pursues, not by the surface it happens to touch: "a website" is a surface, "the project has a current public presence online" is the intent. Because the intent cross-cuts repos and memos, a goal is the natural unit at which to ask the honest question a single PASS-report cannot answer: *how far along is this, really?* A goal is the **forward** pole — the bow that splits the water; its backward twin is maintenance, the stern that trails delivered work (see [33-maintenance.md](/specification/maintenance/)). Both are derived from the same chronicle, sorted by the NEW/DRIFT triage.

---

## What a Goal Is

A goal is a **cross-memo intent**, tracked with its own id (`G\d{3}`, e.g. `G001`) in a project-global store, separate from any single memo.

- **Intent, not surface.** A goal names the outcome that work serves, not a visible proxy for it. Scoring and grouping are done against the intent; a surface label ("the viewer", "the website") is at best a description of what the intent currently touches.
- **Spans several memos.** Many memos can contribute to one goal, and the goal persists while individual memos are finalized and rolled out. The cross-memo timeline a goal is read against is the memo history (see [26-memo-history.md](/specification/memo-history/)).
- **Research-only is not an open goal.** A goal that has only been researched, with no work intended yet, is not counted as an *open* goal in the working sense; it is a noted intent until work begins.
- **Stated explicitly — AI-discovered, developer-approved.** A goal SHOULD be stated explicitly so the memos that serve it can be related back to it, and so its progress can be measured rather than assumed. Noticing that a goal is *missing* is the AI's job — most naturally during `score-all`, where a build-out memo that no goal owns is a coverage gap the board should surface. Creating the goal, however, is **never** unilateral: the AI *proposes* the missing goal (a candidate intent + memos) and the developer **approves** it before it is seeded — the mirror of completion being developer-declared (see Lifecycle).

---

## Lifecycle

A goal has a deliberately simple, **fluid** lifecycle: `offen` → `abgeschlossen`, and back again when needed.

- **Creation is developer-approved, AI-discovered.** A goal is born when the developer approves it, not when the AI decides to. The AI is *expected* to find a missing goal — a finalized, rolled-out build-out memo that produced real artifacts yet is owned by no goal is a coverage gap — and to propose it with a candidate intent and memos. It is seeded only on the developer's go-ahead; the AI never writes a goal into the store on its own. This is the symmetric counterpart to *Completion is developer-declared*: both ends of the lifecycle are the developer's call, while the discovery and the measurement are the AI's.
- **Completion is developer-declared.** A goal moves to `abgeschlossen` only when the developer declares it done — in practice around a high-but-not-perfect bar (≈95 %), with safety never traded away for the last few percent. A programmatic check MAY *suggest* completion, but the suggestion never flips the status on its own.
- **Re-openable.** Because understanding evolves, a goal that was closed MAY be re-opened. The status is a current judgement, not an irreversible gate.
- **Succession.** A goal keeps its base name across the work it spans; a follow-up stage is only introduced when there is genuinely new build on top, never to rename completed work. The base concept stays "goal". When a successor stage is recorded, the goal's `stufeOf` field points at the **successor** goal id (the goal that succeeds this one) — never the predecessor.

---

## Scoring Mode

The value of a goal is that it is **measured against real state**, not against a self-report.

- **Never in the working session.** A goal is **never** scored in the same session that worked on it. A session that did the work will report "all done" and hide the gap (the lesson of an earlier episode where a working session declared a large requirement set complete and lost the real state). Scoring therefore runs in a **fresh context** — a separate, unbiased reader of the actual artifacts.
- **Distrust PASS.** A green conformity report is not evidence. The fresh-context reader inspects the real artifacts — files, wiring, tests actually run, real usage — and measures how far the **intent** is met, not whether a report is green.
- **A single score is a strict object.** One goal's score is `{ pct, readiness, done, missing, status, confidence, evidence }`: a percentage, the deterministic readiness axis (below), what is genuinely there, what real work is still open, the lifecycle status, the provenance of the judgement, and concrete evidence pointers. Only `pct` is the fresh-context LLM judgement; `readiness` is computed deterministically.

The scoring posture above — fresh context, doer-not-grader, distrust-PASS, a strict score object, and a subjective measure paired with a deterministic second axis — is the **shared scoring head** specified once in [23-requirements.md](/specification/requirements/) (The Grading Model). Goal scoring follows that head and adds only its domain axes (`pct` + `readiness`); it does not restate the contract.
- **Milestone vs evergreen — `pct` reads by `kind`.** Every goal carries a native `kind`: `milestone` (a completable goal — `pct` is **progress toward a reachable done-state**) or `evergreen` (an ongoing Dauerstrang that never closes — `pct` is **backlog-coverage of the strand right now**). The kind makes the reading of `pct` machine-distinguishable rather than inferred from the intent prose; an evergreen goal stays `offen` by nature. A goal seeded before the field existed derives a default from its intent cadence (a Dauerstrang/cadence intent → evergreen, otherwise milestone), but the persisted field is authoritative.
- **The board is the standard output.** Scoring all goals produces a board — a table of `Goal | Kind | % | Readiness | Status | what is really missing`, sorted worst-first, followed by a summary line of the form `N open · M closed · Ø X %`, and a written report. This board, not a single number, is the deliverable.

---

## Readiness — the Second Axis

A goal is measured on **two independent axes**. `pct` answers *how far done*; **readiness** (Bearbeitungsreife) answers a different question: *how much grounding exists to act on the goal autonomously*. The two are separable — sufficiency of context is not the same as completion (the RAG "Sufficient Context" distinction) — so a goal can be near-done with thin grounding, or far from done with rich grounding.

- **Deterministic, not an LLM guess.** Readiness is computed from machine-countable signals — topics recorded across the goal's memos, cross-references between memos, revision depth, and chronicle coverage — consistent with the principle *machine evidence over self-report*. It is therefore not subject to the fresh-context rule and is auto-filled when a score is persisted; the developer never estimates it by hand.
- **Monotone polarity.** Higher readiness means **more** ready to act. The term "data density" / "information density" is deliberately **rejected**: in information theory it measures uncertainty (higher = more unknown), which would invert the meaning.
- **A gate, not just a display.** Readiness is the trigger for the optimization path below: a threshold (default `0.65`, calibratable on the real distribution) decides whether a goal is grounded enough to be optimized autonomously. `pct` does **not** gate — it is the *target gap* (the room left to improve).

---

## LLM-Initiated Optimization

There are **two ways into a memo**. The first is user-initiated (a spoken or typed transcript). The second is **llm-initiated**: a goal evaluation is distilled into a full follow-up memo that brings one open goal honestly over the line. Both reuse the same memo-init mechanics; the difference is the input provenance and the `Initiator` key (see [09-contamination-context-handover.md](/specification/contamination-context-handover/)).

- **The trigger is readiness, gated.** A goal qualifies for the autonomous path only when it is `offen` AND `readiness >= 0.65`. A goal that is open but below the bar is **not ready** — the honest move is to build grounding first or ask the developer, never to fabricate an optimization.
- **Honest target, not a claimed number.** The path commits to *aspiration* (95 %, the optimum — not a pressure target) **and** a *defensible target value* (committed) to which the work binds — the mechanical share it can genuinely close. A real improvement, even only to ~88 %, beats a claimed 95 % followed by hallucination.
- **Decisions stay questions.** The remaining gap is classified: mechanical parts (content + wiring) are closed autonomously; architecture/scope decisions and anti-cheat items that need an external producer run are surfaced as **visible questions** in the follow-up memo, never silently deferred. A memo that claims completion instead of showing these questions is a form/honesty break.
- **Autonomy is judged in a fresh context.** Whether the remaining gap is mechanically closable is decided by a fresh-context reader (never the working session), the same unbiased mechanism used for scoring.

---

## Friction and Recurrence

Goal progress is read alongside the **friction** the work encountered, because repeated returns to the same goal are a signal.

- **Not every return is friction.** Adding something new, pivoting deliberately, or extending scope are normal and carry no negative signal.
- **Rework and lost-in-translation are friction.** Re-implementing the same thing, or losing intent between hand-offs, is friction and is worth surfacing.
- **A recurrence heuristic.** Returning to the same goal a few times (≈ up to three implementation passes) is expectable; many returns (≈ six or more) is an alarm that the intent is not being met the way the work assumes.

---

## Goal vs Chronicle

A goal and the chronicle ([26-memo-history.md](/specification/memo-history/)) are **complementary**, and must not be confused.

- **The chronicle narrates; it does not grade.** The chronicle tells the story of what happened, in order, including the friction and the reversals — honestly, never flattering, and explicitly **not** a score.
- **A goal measures.** A goal carries the metric: how far the intent is met, at real state, in a fresh context.
- Read together, the chronicle says *what we did and where we turned*, and the goal says *how far that got us toward the intent*. Neither substitutes for the other.
- **The chronicle is the mandatory run-up to goal derivation — but not an auto-pipeline.** Deriving goals from the project's own history reads the chronicle first: its order, its breakpoints, and its thematic clusters surface themes that dozens of isolated memo folders hide, so no theme is swallowed. The chronicle is therefore a **required pre-step** of goal derivation, **not** a deterministic auto-pipeline — the human/LLM clustering decision stays the core of it. This anchor only holds when the chronicle is **reliably complete**, which is why it leans on the chronicle's WARN-only topic-coverage check ([13-orchestration.md](/specification/orchestration/)): a chronicle entry that omits a memo's registered topics is flagged so the run-up can be trusted.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [30-primitives.md](/specification/primitives/) — the central glossary; the goal primitive is summarized there and specified in full here.
- [26-memo-history.md](/specification/memo-history/) — the cross-memo timeline a goal is read against.
- [00-overview.md](/specification/overview/) — mission and authority model (the memo is the authority; the goal spans the sequence).
- [13-orchestration.md](/specification/orchestration/) — where the chronicle lives, the complementary narrative to a goal's measurement.
- [06-memo-structure.md](/specification/memo-structure/) — the `.memo/` tree the goal store and score reports live beside.
