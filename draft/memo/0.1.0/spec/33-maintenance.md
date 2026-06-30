# 33. Maintenance

| Field | Value |
|-------|-------|
| Status | Draft |
| Depends on | [./28-drift.md](./28-drift.md), [./26-memo-history.md](./26-memo-history.md) |
| Related | [./26-memo-history.md](./26-memo-history.md), [./27-landing-the-plane.md](./27-landing-the-plane.md), [./19-internal-vs-external-communication.md](./19-internal-vs-external-communication.md), [./30-primitives.md](./30-primitives.md), [./31-goals.md](./31-goals.md), [./32-prompt-governance.md](./32-prompt-governance.md) |

Maintenance is a first-class concern, not a side effect of building. A system that is only ever extended accretes surface faster than it sheds it, and every un-maintained unit eventually drifts from the source it was derived from or from the better approach that has since arrived. This chapter names maintenance as a cross-cutting discipline and gives it the same measuring apparatus a goal has — a store, a lifecycle, a score object, a second deterministic axis, a board, and a gated acting path — so the backward view is as concrete as the forward one. It is the deliberate twin of [31-goals.md](./31-goals.md): the goal-scoring chapter read in reverse.

## The Backward View — Goals Forward, Maintenance Backward

A goal and a maintenance unit are the two poles of the same timeline, and the difference is direction.

- **A goal points forward.** It is the bow that splits the water — new features, build-out, pushing the boundary out. It names an intent not yet reached, that several memos work toward. A goal arises from *wanting* (see [31-goals.md](./31-goals.md)).
- **Maintenance points backward.** It *arises from what has already been delivered*. Before the first source existed there was no drift to find — without an original there is no copy that can diverge. Once something ships, more and more of it must be kept in sync: a growing field of recurring work that every delivered unit trails behind it. Maintenance arises from *what was delivered*.
- **The coupling.** The more goals are met, the more maintenance is left behind (hopefully not too much). A fulfilled goal **migrates toward the stern** over time — what was "new build-out" yesterday is "a page to keep current" today. That migration *is* the triage rule: value lost because of something **new** is a goal; value lost because of **drift** of something existing is maintenance.

This is why the chapter is structured as a mirror of [31-goals.md](./31-goals.md): every goal-scoring building block has a maintenance twin, so the two halves of the ship are measured the same way.

## Maintenance Is Changing AND Reducing

The instinct under maintenance pressure is to add — a flag, a branch, a compatibility shim. The cheaper instinct is almost always the wrong one. The more valuable and more expensive instinct is the **deletion question**: what can now be removed, retired, or collapsed. Reduction is maintenance in its highest form because it shrinks the surface that can drift, where addition grows it.

The recurring anti-pattern is the **hybrid**: keeping both the old path and the new path "just in case." A hybrid doubles the maintained surface and guarantees the two halves will diverge, because no author updates both. Landing the plane ([27](./27-landing-the-plane.md)) is the discipline that closes this out — a change is not maintained until the thing it replaced is gone.

## Drift Breaks in Two Directions

Maintenance has to watch two independent kinds of movement:

- **The world drifts (outward, loud).** An upstream source-of-truth moves — a dependency is renamed, a spec is re-published, an API changes. The local copy that pinned the old version is now stale. This is the drift that [28](./28-drift.md) models.
- **The model improves (inward, quiet).** No external thing changed; a better approach simply arrived. The existing implementation is still "correct" but is no longer how the system would be built today. Nothing breaks, so nothing signals — which is exactly why it needs a deliberate measure.

A maintenance discipline that only watches the first direction misses half the decay. This chapter names the second direction so it can be measured rather than merely felt.

## The Maintenance Category — a Roof, Not an Eleventh Primitive

Maintenance is a **cross-cutting concern** that sits above several existing chapters rather than beside them: Landing ([27](./27-landing-the-plane.md)), Drift ([28](./28-drift.md)), internal-vs-external communication ([19](./19-internal-vs-external-communication.md)), Goals ([31](./31-goals.md)), and Prompt Governance ([32](./32-prompt-governance.md)). What it adds is a **measuring organ** — a scorecard of freshness and blast-radius per unit, plus a maintainer role that reads change and reports decay.

It is a cross-cutting **score**, not a new primitive. The primitives remain **exactly ten** ([30](./30-primitives.md)); maintenance measures across them rather than joining them. Treating maintenance as an eleventh primitive would be a category error — it has no standalone artifact of its own, only a reading taken over the artifacts the primitives already define. This is the one place the maintenance mirror deliberately *breaks* symmetry with goals: a goal is a primitive, maintenance is a roof.

## The Card-Store and Lifecycle

The maintenance reading is kept in a **card store** under `.memo/maintenance/` — one **card** per repo, the maintenance unit (mirroring the goal store, which holds one entry per cross-memo intent). Card ids follow `M\d{3}`. Where the goal set is open and discovered, the card set is bound to the repo topology: there is one card per repo, so the set grows only when a repo is added.

A card's lifecycle is a **three-level status**, carried in the score envelope as `maintStatus`:

- `ok` — fresh enough; no action owed.
- `stale` — drifted from its source; action owed when the blast-radius justifies it.
- `critical` — drifted with wide blast; action owed now.

Unlike a goal, a maintenance card never "completes" — there is no `abgeschlossen`. A repo is always being kept current; the status is a current reading, not a terminal state. That asymmetry is deliberate: the bow can reach a destination, the stern never does.

## Scoring Mode

Like a goal, a maintenance card is **measured against real state**, never against a self-report.

- **Never in the working session.** A card is **never** scored in the same session that did the work — a session that built the change will report it healthy and hide the drift. Scoring runs in a **fresh context**, one agent per repo, an unbiased reader of the real diff.
- **Distrust PASS.** A green report is not evidence. The fresh-context reader inspects the actual commits since each edge's provenance pin, the real dependency graph, and the source heads — not a claim.
- **A single score is a strict object.** One card's score is `{ pct, status, findings, signals, confidence, evidence }`: a freshness percentage, the `maintStatus`, the concrete drift findings, the machine signals behind them, the provenance of the judgement, and evidence pointers. `pct` is the fresh-context freshness reading; the blast-radius (below) is computed deterministically and auto-filled by the CLI.

This fresh-context, distrust-PASS, strict-object posture is the **shared scoring head** specified once in [23-requirements.md](./23-requirements.md) (The Grading Model); maintenance scoring follows that head and adds only its domain axes (freshness `pct` + blast-radius), rather than restating the contract.

## Blast-Radius — the Second Axis

A card is scored on **two independent axes**, mirroring the goal split of a subjective and a deterministic axis ([31](./31-goals.md)).

- **Freshness** — how current the unit is versus its source. Monotone: higher is fresher. This is the judgement axis (the `pct`), and it is the gap to be closed, not the trigger.
- **Blast-radius** — how far the unit's drift would propagate if left to rot, computed **deterministically** from the dependency graph (who consumes it, transitively, and whether any consumer is externally visible). This is the cost axis, and it is the trigger.

The two are independent: a unit can be very stale with a narrow blast (rot it later) or only mildly stale with a wide blast (fix it now). A **handelnder** maintenance action is therefore gated on the *pair* — act only when the card is not fresh **and** its blast-radius is at or above the gating threshold; otherwise report and move on. The threshold is the **same gating value used to gate goal optimization** ([31](./31-goals.md), "Readiness — the Second Axis"); the number is defined there and is deliberately **not restated here** — a second copy of the value would be a drift candidate from day one ([28](./28-drift.md), single-source-of-truth).

## The Board

Scoring all cards produces a **board** — the standard output, exactly as for goals. It is a table of `Repo | Freshness % | Blast | maintStatus | Missing`, sorted worst-first, followed by a summary line of the form `N ok · M stale · K critical · Ø Freshness X %`, plus a `worstStatus` (the worst card's status) and a `releaseReady` flag (true only when no card is `critical`). This board, not a single number, is the deliverable, and the `releaseReady` flag is what a pre-rollout health check reads (see [./26-memo-history.md](./26-memo-history.md) and the project-health projection).

## Gated Re-Verification

Every declared dependency edge carries a **provenance pin** — `verifiedAtSha`, the commit of the source at which the edge was last verified. With the pin, staleness is a *count* (commits on the source since the pin), not a guess; without it, staleness is unmeasurable. An explicit pin on every edge is a maintainability precondition, not an optional nicety.

**Re-verification** is the gated *acting* path, the maintenance twin of llm-initiated goal optimization. It re-stamps `verifiedAtSha` after a fresh-context check that the edge still holds at the source's current head — but only when the gate qualifies (`status != ok` AND blast-radius at or above the threshold). It is git-centric and forward-only: it never rewrites history and never deletes. Marking an edge fresh without re-checking it would merely hide drift, so the stamp always follows a check, and a card that does not qualify is reported, not re-blessed.

## Maintenance and the Chronicle

Maintenance, like goals, derives from the **chronicle** ([26-memo-history.md](./26-memo-history.md)) — it is read backward where a goal is read forward. The chronicle is updated first; from its narrated timeline the project sorts each cluster of change with the **NEW/DRIFT triage**: value lost because of something **new** becomes a goal (the forward bow), value lost because of **drift** of something existing becomes maintenance (the backward stern). The chronicle is therefore the shared run-up to *both* derivations, which is why it SHOULD carry all of a memo's topics (the completeness its WARN-only coverage check guards). Because cards are bound to the repo topology rather than discovered open-endedly, the chronicle drives the *goal* set more than the *card* set; cross-repo drift clusters that the chronicle surfaces are findings on existing cards rather than new cards.

## Coverage Beyond the LLM — Mechanism Assignment

Not every drift class is best caught by an LLM reading code. Each class is assigned to the deterministic mechanism that covers it, so the LLM maintainer is the integrator of machine evidence rather than its sole source:

| Drift class | Deterministic mechanism |
|-------------|-------------------------|
| Secret / credential exposure | secrets scan at the commit and push gate |
| Dependency supply-chain rot | dependency-advisory watch over the lockfile |
| Source-copy divergence | the idempotent lint/CI gate ([28](./28-drift.md)) |
| Pinned-source staleness | provenance-pin compared against the source head (commit count) |
| Behavioral regression | runtime guardrails ([29](./29-behavioral-guardrails.md)) plus local exit codes |

A maintenance discipline must also keep an explicit **blind-spots list** — the drift classes for which no mechanism yet exists — declared openly rather than left as a silent gap, so coverage is honest about its own edges.

## Autonomy Boundary

The maintainer is **reporting-autonomous**: it reads the diff, clusters changes, traverses the affected graph, renders the board and an evidence trail, and *proposes* removals. It is **acting only behind a gate or human approval**: re-blessing an edge, deleting anything, or spawning new work all require the gate to qualify or a person to decide. The system never commits on its own, and deletion always goes to a recoverable trash, never a destructive remove. "When a human decides" is an explicit output of every maintenance run, not an implicit default.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [26-memo-history.md](./26-memo-history.md) — the chronicle, the shared run-up that maintenance is derived from (backward) just as goals are (forward).
- [27-landing-the-plane.md](./27-landing-the-plane.md) — reduction and graceful completion; the deletion question this chapter builds on.
- [28-drift.md](./28-drift.md) — the outward drift direction, the idempotent lint/CI gate, and the single-source-of-truth rule that keeps the gating threshold uncopied.
- [19-internal-vs-external-communication.md](./19-internal-vs-external-communication.md) — the inward/outward axis that separates the two drift directions.
- [30-primitives.md](./30-primitives.md) — the ten primitives this chapter measures across but does not extend.
- [31-goals.md](./31-goals.md) — the goal-scoring chapter this one mirrors: store, lifecycle, score object, second deterministic axis, board, gated acting path.
- [32-prompt-governance.md](./32-prompt-governance.md) — the governed-default discipline maintenance also relies on.
