---
title: "Phases, PRDs & the Dependency Tree"
description: "A finalized memo is decomposed in two steps."
spec_version: "0.1.0"
spec_file: "08-phases-and-prds.md"
order: 8
section: "Specification"
normative: true
generated_at: "2026-06-11T03:44:50.158Z"
generated_from: "spec/v0.1.0/08-phases-and-prds.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/08-phases-and-prds.md."
---


> **Normative.** Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](/specification/overview/) (Conformance).

---

## Topics → PRDs → Phases

A finalized memo is decomposed in two steps.

1. **Topics → PRDs.** The memo's topics become **PRDs** (product requirement documents). The governing constraint is that **one PRD fits into one context**: a PRD MUST be self-contained and sized so that a single agent working in a fresh, empty context can implement it without needing to hold the rest of the memo in mind.
2. **PRDs → Phases.** PRDs are grouped into **phases**. A phase is a set of PRDs that are executed together as one unit of the rollout.

This decomposition is what makes a long memo executable: the memo is the authority, the PRDs are the discrete units, and the phases are the execution batches.

---

## `## Phase-Hints` — the Dependency Tree

A finalized memo carries a `## Phase-Hints` section that declares the relationships between phases. This section **is** the dependency tree of the rollout. Each phase entry declares two relations:

- `depends-on` — phases that MUST complete before this phase may start.
- `can-parallel-with` — phases that MAY run concurrently with this phase.

The two relations are **symmetric** and MUST be authored consistently: if phase P2 declares `can-parallel-with: P9`, then phase P9 MUST declare `can-parallel-with: P2`. An implementation reads `## Phase-Hints` to derive execution order; absent an explicit hint, phases run sequentially (the memo retains authority over ordering).

A `## Phase-Hints` table has the shape:

| phase-id | depends-on | can-parallel-with | rationale |
|----------|-----------|-------------------|-----------|
| P1 | — | — | foundation, sequential |
| P2 | P1 | P7, P8, P9 | independent of the viewer / prompt-generator / core strands |
| … | … | … | … |

The `rationale` column documents *why* a relation holds, so the dependency tree is reviewable rather than asserted.

---

## The Bootstrap-Scope Clause

A memo's rollout produces only what the memo's scope declares. For the bootstrap memo from which this specification is induced, the scope is explicit and central, and it generalizes to a rule worth stating here:

> A rollout produces the artifacts its memo declares. Where a chapter specifies new behavior for an existing live system, the rollout produces the **specification text** for that behavior; the corresponding **live-code change** is follow-up work in a separate memo, not part of the current rollout.

For the bootstrap specifically: the rollout produces the **organization, the repositories, and the specification text**. Chapters that describe new behavior of the existing toolkit skills — the standing lessons-learned file ([12-rollout.md](/specification/rollout/)), the worktree-cleanup enforcement ([16-git-security-versioning.md](/specification/git-security-versioning/)), the question hybrid ([07-revisions-and-questions.md](/specification/revisions-and-questions/)), and the requirements→quality-gates wiring ([11-quality-and-finalization.md](/specification/quality-and-finalization/)) — deliver only their specification text in this rollout. Their implementation in the live skills is follow-up work. No live skill is modified by the bootstrap rollout.

Stating the scope clause in the phase chapter keeps the dependency tree honest: a phase that the memo defines as "write the spec text" MUST NOT silently expand into "change the live skill," because that would change the work the dependency tree was planned against.

---

## Related

- [05-memo-strategies.md](/specification/memo-strategies/) — the type endpoint (Strategy / Implementation / Sorting) that decides whether PRDs are produced at all.
- [12-rollout.md](/specification/rollout/) — how phases and PRDs are executed.
- [13-orchestration.md](/specification/orchestration/) — the state model that tracks phase and PRD progress.
- [18-multidimensionality.md](/specification/multidimensionality/) — phases that span multiple repositories.
