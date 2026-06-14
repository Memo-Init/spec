---
title: "Phases & PRDs"
description: "A finalized memo becomes executable work through a chain of decompositions: topics become PRDs, PRDs are bundled and sequenced into phases, and a phase carries an orchestration role. This chapter..."
spec_version: "0.1.0"
spec_file: "08-phases-and-prds.md"
order: 8
section: "Specification"
normative: true
generated_at: "2026-06-14T10:31:30.607Z"
generated_from: "spec/v0.1.0/08-phases-and-prds.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/08-phases-and-prds.md."
---


A finalized memo becomes executable work through a chain of decompositions: topics become PRDs, PRDs are bundled and sequenced into phases, and a phase carries an orchestration role. This chapter defines that chain, the standard a PRD must meet to be implementable in a fresh context, the dependency tree that orders phases, and the lenses for cutting a memo into phases.

---

## Topics → PRDs → Phases

A finalized memo is decomposed in two steps.

1. **Topics → PRDs.** The memo's topics become **PRDs** (product requirement documents). The governing constraint is that **one PRD fits into one context**: a PRD MUST be self-contained and sized so that a single agent working in a fresh, empty context can implement it without needing to hold the rest of the memo in mind.
2. **PRDs → Phases.** PRDs are grouped into **phases**. A phase is a set of PRDs that are executed together as one unit of the rollout.

This decomposition is what makes a long memo executable: the memo is the authority, the PRDs are the discrete units, and the phases are the execution batches.

---

## Declared Context (Required Context Standard)

A PRD is implemented by an agent in a fresh, empty context, so the PRD **MUST** declare the context that agent needs. The declaration is a dedicated section — a "Required Context" table listing, per entry, the source and its path — and it is **mandatory** for every PRD.

The standard has two parts:

- **Declare, don't assume.** Each PRD **MUST** state which material is required to implement it, as a `| source | path |` table. An agent in an empty context can then assemble exactly what it needs without holding the rest of the memo in mind.
- **Reference, don't repeat.** Research and supporting material **MUST** be deposited as a file in the memo's `context/` directory, and the PRD **MUST** reference that file rather than copying its content into the PRD body. The PRD stays self-contained through the *pointer*, not through duplication — the same empty-context principle that governs handovers (see [09-contamination-context-handover.md](/specification/contamination-context-handover/)).

Depositing the material once in `context/` and pointing every consumer at it keeps a single source of truth: when the research changes, the deposited file changes, and the PRDs that point at it inherit the change without a fan-out of copies to maintain. Shared material lives in `context/` and is **referenced** by the PRDs that need it; it is never copied into a PRD body, so there is exactly one copy to keep correct.

A PRD is not handed to an agent as raw text. Its **first prompt** — the initial instruction that opens the agent's fresh context — is produced by the **Prompt-Generator** (see [15-prompt-generator.md](/specification/prompt-generator/)), which assembles the PRD's declared Required-Context entries into a single self-contained prompt. The PRD declares *what* context is needed; the Prompt-Generator turns that declaration into the *prompt* the agent receives.

### Worked example — a Required-Context table

A PRD that deepens this chapter might declare:

| source | path |
|--------|------|
| this chapter | `spec/v0.1.0/08-phases-and-prds.md` |
| deterministic rules | `context/deterministic-rules.md` |
| page-specific findings | `context/spec-drift-findings.md` (§08) |

The Prompt-Generator reads these entries and emits one prompt containing exactly this material — nothing from the rest of the memo.

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

A populated table reads concretely:

| phase-id | depends-on | can-parallel-with | rationale |
|----------|-----------|-------------------|-----------|
| P1 | — | — | foundation, must land first |
| P2 | P1 | P3, P4 | independent artifacts, no shared file |
| P3 | P1 | P2, P4 | independent artifacts, no shared file |
| P4 | P1 | P2, P3 | independent artifacts, no shared file |
| P5 | P2, P3, P4 | — | integration, needs all three |

Here P2, P3, and P4 each depend only on the foundation phase P1 and declare each other under `can-parallel-with`, so a runner may execute them concurrently; P5 waits for all three because it integrates their output.

---

## Phase-Planning

How a memo is cut into phases determines how well it executes — a poorly cut plan is a common cause of weak rollouts, especially on large problems. Phase-planning is therefore a first-class spec concept, not an incidental step.

### The chain — Topics → work-packages → Phases

A memo's **topics** are realized as **work-packages**, which are bundled into **phases**. A phase is not merely a list of work-packages: it carries an **orchestration role**. It bundles and sequences its work-packages, declares the phase's `depends-on` and `can-parallel-with` relations (the dependency tree above), and governs execution (the Lead / Worker / Evaluator roles of the rollout). The phase is the orchestration node of the plan.

### The three lenses for cutting phases

There are three ways to slice a memo into phases. The choice is a deliberate planning decision and SHOULD be stated explicitly.

| lens | how | pro | con |
|------|-----|-----|-----|
| **Topic lens** | phases follow the memo's topics | topical coherence, stays close to the memo | one topic touches many files → cross-file edits, **drift risk**, harder to parallelize |
| **Data-File lens** | phases follow the artifacts to be changed | disjoint files = **parallelizable**, each file touched **once** → no re-edit drift | one topic is spread across many file-phases; cross-cutting rules must be defined once and applied per file |
| **Foundation-first (hybrid)** | shared rules and new chapters first, then per-artifact | removes cross-cutting drift before detail work begins | more lead time before the first finished file |

### Choosing a lens by work type

- **Mechanical-per-artifact** work (e.g. a sweeping cleanup applied to every file) → **Data-File lens**: parallel and drift-free, with cross-cutting concerns defined once as rules and applied per file.
- **Feature-coherent** work → **Topic lens**: the phases match the feature topics.
- **Mixed or foundation-dependent** work → **Foundation-first**, landing the shared base first and then continuing with one of the other two lenses.

---

## Scope Discipline

A rollout produces only what its memo's scope declares. A phase MUST deliver exactly the artifact its memo defines and MUST NOT silently expand into adjacent work: a phase scoped to "write the specification text" does not also change a live system, because that would alter the work the dependency tree was planned against. Where a memo scopes a phase to specification text only, the corresponding implementation belongs to a separately scoped phase or memo.

Stating this in the phase chapter keeps the dependency tree honest — `depends-on` and `can-parallel-with` are only meaningful if each phase's actual output matches its declared output.

Scope discipline governs *which* work-packages a phase delivers; the discipline for *each unit a work-package produces* — that every required unit ends as **set**, **justified-omit**, or **blocked** and is never guessed — is the three-exit Worker-output rule defined in [13-orchestration.md](/specification/orchestration/).

---

## Related

- [05-memo-strategies.md](/specification/memo-strategies/) — the type endpoint (Strategy / Implementation / Sorting) that decides whether PRDs are produced at all.
- [12-rollout.md](/specification/rollout/) — how phases and PRDs are executed.
- [13-orchestration.md](/specification/orchestration/) — the state model that tracks phase and PRD progress.
- [15-prompt-generator.md](/specification/prompt-generator/) — produces a PRD's first prompt from its declared Required-Context.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — the empty-context principle behind the required-context standard and the pointer-not-copy rule.
- [18-multidimensionality.md](/specification/multidimensionality/) — phases that span multiple repositories.
