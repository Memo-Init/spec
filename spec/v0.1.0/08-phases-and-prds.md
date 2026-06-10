# 08. Phases, PRDs & the Dependency Tree

| | |
|---|---|
| Status | Draft |
| Depends on | [07-revisions-and-questions.md](./07-revisions-and-questions.md) |
| Related | [05-memo-strategies.md](./05-memo-strategies.md), [12-rollout.md](./12-rollout.md), [13-orchestration.md](./13-orchestration.md), [18-multidimensionality.md](./18-multidimensionality.md) |

> **Normative.** Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](./00-overview.md) (Conformance).

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

For the bootstrap specifically: the rollout produces the **organization, the repositories, and the specification text**. Chapters that describe new behavior of the existing toolkit skills — the standing lessons-learned file ([12-rollout.md](./12-rollout.md)), the worktree-cleanup enforcement ([16-git-security-versioning.md](./16-git-security-versioning.md)), the question hybrid ([07-revisions-and-questions.md](./07-revisions-and-questions.md)), and the requirements→quality-gates wiring ([11-quality-and-finalization.md](./11-quality-and-finalization.md)) — deliver only their specification text in this rollout. Their implementation in the live skills is follow-up work. No live skill is modified by the bootstrap rollout.

Stating the scope clause in the phase chapter keeps the dependency tree honest: a phase that the memo defines as "write the spec text" MUST NOT silently expand into "change the live skill," because that would change the work the dependency tree was planned against.

---

## Related

- [05-memo-strategies.md](./05-memo-strategies.md) — the type endpoint (Strategy / Implementation / Sorting) that decides whether PRDs are produced at all.
- [12-rollout.md](./12-rollout.md) — how phases and PRDs are executed.
- [13-orchestration.md](./13-orchestration.md) — the state model that tracks phase and PRD progress.
- [18-multidimensionality.md](./18-multidimensionality.md) — phases that span multiple repositories.
