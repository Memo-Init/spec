---
title: "Phases & PRDs"
description: "A finalized memo becomes executable work through a chain of decompositions: topics become PRDs, PRDs are bundled and sequenced into phases, and a phase carries an orchestration role. This chapter..."
spec_version: "0.1.0"
spec_file: "08-phases-and-prds.md"
order: 8
section: "Specification"
normative: true
generated_at: "2026-06-20T12:43:33.617Z"
generated_from: "spec/v0.1.0/08-phases-and-prds.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/08-phases-and-prds.md."
---


A finalized memo becomes executable work through a chain of decompositions: topics become PRDs, PRDs are bundled and sequenced into phases, and a phase carries an orchestration role. This chapter defines that chain, the standard a PRD must meet to be implementable in a fresh context, the dependency tree that orders phases, and the lenses for cutting a memo into phases.

---

## Topics → PRDs → Phases

A finalized memo is decomposed in two steps.

1. **Topics → PRDs.** The memo's topics become **PRDs** (product requirement documents). The governing constraint is that **one PRD fits into one context**: a PRD MUST be self-contained and sized so that a single agent working in a fresh, empty context can implement it without needing to hold the rest of the memo in mind.
2. **PRDs → Phases.** PRDs are grouped into **phases**. A phase is a **sequential, mandatory unit** of the rollout: it bundles PRDs that **MUST** be executed together and in order, and it **MUST** declare its dependencies on other phases. The `depends-on` relation is not optional decoration — it is a **mandatory characteristic** of a phase, because a phase that depends on another may not start until that other has completed (the `## Phase-Hints` dependency tree below). A phase is therefore not merely a "batch": it is a sequenced, dependency-bearing unit.

This decomposition is what makes a long memo executable: the memo is the authority, the PRDs are the discrete units, and the phases are the sequential, dependency-bearing execution units. Following the `depends-on` edges across phases traces out the **strands** of the memo — a strand is the **dependency closure over phases**, the chain that *emerges* when the `## Phase-Hints` edges are walked transitively (see [25-strands.md](/specification/strands/)). Strands are derived from these phase dependencies, never assigned thematically; many phases typically resolve into one or two large strands.

---

## What a PRD is (the corrected definition)

"PRD" stands for **Product Requirements Document**, but in this spec the term carries a sharper, working meaning: a PRD is a **chunk of work-packages** sized to fit one context. We **chunk work-packages** so each fits into a single fresh, empty context; a work-package too large to fit one context is **split (chunked)** into several PRDs.

This yields three rules that govern how PRDs map onto features and threads:

- **Multiple PRDs may form one feature.** A feature is not one PRD by definition. A theoretically large feature is chunked across **multiple PRDs**, each self-contained, and the feature emerges from their combination — the memo, not any single PRD, remains the authority over the whole feature.
- **Every PRD runs in exactly one thread.** A PRD is implemented by **one** agent in **one thread** with a fresh, empty context. A PRD is never split across threads; if work would need more than one thread, that is the signal to chunk it into more PRDs (one thread each), not to run a single PRD across several.
- **PRDs are derived from blocks and follow phase/strand.** PRDs are not free-floating: they are derived from the memo's blocks and take their order from the phase they belong to and the strand that phase resolves into (the `depends-on` closure above).

In short: a PRD is the unit we chunk *down to* so it fits one context and runs in one thread, and a feature is what we compose *up from* one or more such PRDs.

---

## PRD-Cap and Smart-Zone

The "one PRD fits into one context" rule above is qualitative; this section makes it numeric. The qualitative rule still governs — a PRD that does not fit a single fresh context is mis-sized regardless of its token count — and the numbers below **concretize** it rather than replace it.

- **Cap = one third (1/3) of the context window, per PRD.** A PRD's declared context plus its working headroom MUST stay within **1/3 of the context window**. The cap is measured **per PRD, not per phase**: a phase may bundle several PRDs whose combined size far exceeds 1/3, because each PRD is implemented in its own fresh, empty thread — the cap applies to each thread's PRD individually.
- **Smart-Zone = one quarter (1/4) of the context window.** Below roughly **1/4** of the window, attention has not yet degraded — this is the **smart zone**, the band a PRD SHOULD aim to sit inside. The cap (1/3) is the hard ceiling; the smart-zone (1/4) is the target band where the agent works at full quality. The headroom between 1/4 and 1/3 is deliberate slack, not budget to plan against.

At a 1M context window these fractions are concretely:

| marker | fraction | tokens at 1M | meaning |
|--------|----------|--------------|---------|
| Smart-Zone | 1/4 | ~250k | target band — attention not yet degraded |
| Cap | 1/3 | ~333k | hard ceiling per PRD — must not be exceeded |

The smart-zone (1/4) marker is also the heuristic that `memo-reset-recommend` uses as the *reason* behind its token threshold: when context fill leaves the smart zone, a reset becomes worth recommending at a phase boundary. The reset algorithm itself lives in `memo-reset-recommend` (see [13-orchestration.md](/specification/orchestration/)); this chapter only declares the smart-zone marker it consumes.

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

## Post-Phase Drift Elimination

This chapter owns the **post-phase drift-elimination step** that the drift escalation rule defers to ([28-drift.md](/specification/drift/)). When drift is discovered *while a phase is running*, the phase is never aborted to chase it — aborting fragments the work and tends to spawn new partial copies. Instead the finding is recorded and the elimination is scheduled as a dedicated step that runs **after the current phase completes**, before the next phase begins.

The step is bounded by three rules so it composes with the dependency tree:

- **After, never mid-phase.** The in-flight phase finishes coherently; only then does the elimination run. This guarantees the still-wrong source is repaired before the next phase can read it and spawn another copy.
- **Its own fresh context.** The elimination is a separate work unit in a clean context (the empty-context principle), so the contaminated session that surfaced the drift does not carry the wrong value into the fix.
- **Fix-at-source, then gate.** The step resolves the drift at its source-of-truth (the [28-drift.md](/specification/drift/) protocol) and leaves the idempotent lint/CI gate — owned by [13-orchestration.md](/specification/orchestration/) — in place so the eliminated drift cannot re-enter. A discovered drift is therefore closed at a real point in the dependency tree, not deferred as a standing note.

---

## Related

- [05-memo-strategies.md](/specification/memo-strategies/) — the type endpoint (Strategy / Implementation / Sorting) that decides whether PRDs are produced at all.
- [12-rollout.md](/specification/rollout/) — how phases and PRDs are executed.
- [13-orchestration.md](/specification/orchestration/) — the state model that tracks phase and PRD progress.
- [15-prompt-generator.md](/specification/prompt-generator/) — produces a PRD's first prompt from its declared Required-Context.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — the empty-context principle behind the required-context standard and the pointer-not-copy rule.
- [18-multidimensionality.md](/specification/multidimensionality/) — phases that span multiple repositories.
- [28-drift.md](/specification/drift/) — the drift error-class whose escalation rule defers to the post-phase elimination step this chapter owns.
- [25-strands.md](/specification/strands/) — a strand is the dependency closure over the phases defined here; it emerges from the `## Phase-Hints` edges.
- [30-primitives.md](/specification/primitives/) — central glossary and concept map; the Topic → work-package → Phase → PRD chain in one place.
