---
title: "Maintenance"
description: "Maintenance is a first-class concern, not a side effect of building. A system that is only ever extended accretes surface faster than it sheds it, and every un-maintained unit eventually drifts from..."
spec_version: "0.1.0"
spec_file: "33-maintenance.md"
order: 33
section: "Specification"
normative: true
generated_at: "2026-06-18T23:43:31.907Z"
generated_from: "spec/v0.1.0/33-maintenance.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/33-maintenance.md."
---


Maintenance is a first-class concern, not a side effect of building. A system that is only ever extended accretes surface faster than it sheds it, and every un-maintained unit eventually drifts from the source it was derived from or from the better approach that has since arrived. This chapter names maintenance as a cross-cutting discipline: what it covers, why it breaks in two directions at once, how it is measured, and where the boundary between reporting and acting sits. It does not introduce a new primitive — it is the measuring roof over several existing ones.

## Maintenance Is Changing AND Reducing

The instinct under maintenance pressure is to add — a flag, a branch, a compatibility shim. The cheaper instinct is almost always the wrong one. The more valuable and more expensive instinct is the **deletion question**: what can now be removed, retired, or collapsed. Reduction is maintenance in its highest form because it shrinks the surface that can drift, where addition grows it.

The recurring anti-pattern is the **hybrid**: keeping both the old path and the new path "just in case." A hybrid doubles the maintained surface and guarantees the two halves will diverge, because no author updates both. Landing the plane ([27](/specification/landing-the-plane/)) is the discipline that closes this out — a change is not maintained until the thing it replaced is gone.

## Drift Breaks in Two Directions

Maintenance has to watch two independent kinds of movement:

- **The world drifts (outward, loud).** An upstream source-of-truth moves — a dependency is renamed, a spec is re-published, an API changes. The local copy that pinned the old version is now stale. This is the drift that [28](/specification/drift/) models.
- **The model improves (inward, quiet).** No external thing changed; a better approach simply arrived. The existing implementation is still "correct" but is no longer how the system would be built today. Nothing breaks, so nothing signals — which is exactly why it needs a deliberate measure.

A maintenance discipline that only watches the first direction misses half the decay. This chapter names the second direction so it can be measured rather than merely felt.

## The Maintenance Category — a Roof, Not an Eleventh Primitive

Maintenance is a **cross-cutting concern** that sits above several existing chapters rather than beside them: Landing ([27](/specification/landing-the-plane/)), Drift ([28](/specification/drift/)), internal-vs-external communication ([19](/specification/internal-vs-external-communication/)), Goals ([31](/specification/goals/)), and Prompt Governance ([32](/specification/prompt-governance/)). What it adds is a **measuring organ** — a scorecard of freshness and blast-radius per unit, plus a maintainer role that reads change and reports decay.

It is a cross-cutting **score**, not a new primitive. The primitives remain **exactly ten** ([30](/specification/primitives/)); maintenance measures across them rather than joining them. Treating maintenance as an eleventh primitive would be a category error — it has no standalone artifact of its own, only a reading taken over the artifacts the primitives already define.

## Two Axes — Freshness and Blast-Radius

A maintenance unit is scored on two orthogonal axes, mirroring the goal-scoring split of a subjective and a deterministic axis ([31](/specification/goals/)):

- **Freshness** — how current the unit is versus its source. Monotone: higher is fresher. This is the judgement axis.
- **Blast-radius** — how far the unit's drift would propagate if left to rot, computed deterministically from the dependency graph (who consumes it, transitively, and whether any consumer is externally visible). This is the cost axis.

The two are independent: a unit can be very stale with a narrow blast (rot it later) or only mildly stale with a wide blast (fix it now). A **handelnder** maintenance action is therefore gated on the *pair* — act only when the unit is not fresh **and** its blast-radius is wide enough; otherwise report and move on. Freshness alone never forces action; it is the gap to be closed, not the trigger.

## Provenance and Re-Verification

Every declared dependency edge carries a **provenance pin** — the commit of the source at which the edge was last verified. With the pin, staleness is a *count* (commits on the source since the pin), not a guess; without it, staleness is unmeasurable. This is why an explicit pin on every edge is a maintainability precondition, not an optional nicety.

**Re-verification** re-stamps the pin after a fresh-context check that the edge still holds at the source's current head. It is git-centric and forward-only: it never rewrites history and never deletes. Marking an edge fresh without re-checking it would merely hide drift, so the stamp always follows a check.

## Autonomy Boundary

The maintainer is **reporting-autonomous**: it reads the diff, clusters changes, traverses the affected graph, renders the board and an evidence trail, and *proposes* removals. It is **acting only behind a gate or human approval**: re-blessing an edge, deleting anything, or spawning new work all require the gate to qualify or a person to decide. The system never commits on its own, and deletion always goes to a recoverable trash, never a destructive remove. "When a human decides" is an explicit output of every maintenance run, not an implicit default.

## Coverage Beyond the LLM — Mechanism Assignment

Not every drift class is best caught by an LLM reading code. Each class is assigned to the deterministic mechanism that covers it, so the LLM maintainer is the integrator of machine evidence rather than its sole source:

| Drift class | Deterministic mechanism |
|-------------|-------------------------|
| Secret / credential exposure | secrets scan at the commit and push gate |
| Dependency supply-chain rot | dependency-advisory watch over the lockfile |
| Source-copy divergence | the idempotent lint/CI gate ([28](/specification/drift/)) |
| Pinned-source staleness | provenance-pin compared against the source head (commit count) |
| Behavioral regression | runtime guardrails ([29](/specification/behavioral-guardrails/)) plus local exit codes |

A maintenance discipline must also keep an explicit **blind-spots list** — the drift classes for which no mechanism yet exists — declared openly rather than left as a silent gap, so coverage is honest about its own edges.

---

## Related

- [27-landing-the-plane.md](/specification/landing-the-plane/) — reduction and graceful completion; the deletion question this chapter builds on.
- [28-drift.md](/specification/drift/) — the outward drift direction and the idempotent lint/CI gate this chapter's coverage table points at.
- [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/) — the inward/outward axis that separates the two drift directions.
- [30-primitives.md](/specification/primitives/) — the ten primitives this chapter measures across but does not extend.
- [31-goals.md](/specification/goals/) — the goal-scoring split (subjective + deterministic axis) that the freshness/blast-radius pair mirrors.
- [32-prompt-governance.md](/specification/prompt-governance/) — the governed-default discipline maintenance also relies on.
