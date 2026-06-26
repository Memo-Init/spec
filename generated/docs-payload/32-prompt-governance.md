---
title: "Prompt Governance"
description: "The single most consequential moment of any spawned task is its **initial prompt**. An error at that first point does not stay small: it is multiplied across the whole batch — a flawed initial prompt..."
spec_version: "0.1.0"
spec_file: "32-prompt-governance.md"
order: 32
section: "Specification"
normative: true
generated_at: "2026-06-26T18:22:47.793Z"
generated_from: "spec/v0.1.0/32-prompt-governance.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/32-prompt-governance.md."
---


The single most consequential moment of any spawned task is its **initial prompt**. An error at that first point does not stay small: it is multiplied across the whole batch — a flawed initial prompt repeated over forty PRDs is forty flawed starts, not one. Empirically the first one or two prompts in a hand-written batch are excellent and the quality then crumbles ("the crumbling stone") as the orchestrator tires. Prompt governance is the discipline that holds every initial prompt to the same controllable quality floor by routing it through a single, watched **bottleneck**: the prompt generator ([15-prompt-generator.md](/specification/prompt-generator/)). Where chapter 15 specifies the *engine* (deterministic, hash-stable, dependency-free), this chapter specifies the *governance* — that the engine MUST be the default path for initial prompts, not an optional sharpening step, and that its use is measured as a goal.

---

## The Bottleneck Principle

The prompt generator is not "a small module off to the side"; it is the **channel through which input to new processes is controlled, channelled, and monitored**.

- **A template with enforced placeholders, never indirect steering.** Governance MUST be expressed as a template/harness whose placeholders are mandatorily filled — a missing placeholder produces an **error**, never half a prompt (the torso check, [15-prompt-generator.md](/specification/prompt-generator/)). The anti-pattern it replaces is indirect steering through skills ("just say this and that, and hope it goes well"), which leaves nothing derivable and degrades silently.
- **A lever and a single point of failure at once.** Fully realized, the generator SHOULD be involved in roughly nine of ten initial prompts. That concentration is exactly why it MUST be centrally watchable and actually watched — the governance goal (below) is the watch.
- **Quality floor, with an intervention door.** The bottleneck is deterministic but MUST leave room for necessary AI additions: the lower quality bound is never undercut, while the LLM still contributes what only it can. Governance fixes the floor, not the ceiling.

---

## Two Cases: Homogeneous PRD and Heterogeneous Research

Two work shapes pass through the same bottleneck, and the spec treats them as one governed mechanism with two configurations.

- **Case B — PRD generation (homogeneous).** Highly automatable: at finalization the memo's phase plan ([08-phases-and-prds.md](/specification/phases-and-prds/)) is the source from which **one composed prompt per PRD** is derived. This is the **default** PRD-prompt path; free-form per-PRD prompting is the deprecated fallback, not the norm. PRD generation is a governed step in its own right — generation is **not** execution — and it MUST be **dependency-aware, not naive numeric**: the composed prompts are ordered topologically from the `## Phase-Hints` relations, and each PRD prompt carries the **L1 PRD→PRD dependency edge** (the upstream PRD(s) it depends on). See the dependency-ordering and coverage sections of [15-prompt-generator.md](/specification/prompt-generator/) for the engine-side contract.
- **Case A — research at memo-init (heterogeneous).** Research prompts are diverse, but they MUST still run through a harness rather than ad-hoc text: a research-prompt template, a config, and a bridge that tags each research output with its **topic id** so the topic store links back to the produced research file.
- **The common denominator.** Both cases need the same bottleneck — deterministic, with an intervention door — so the quality floor is never undercut regardless of how heterogeneous the work is.

---

## CLI Abstraction and the Generator-Code Boundary

Governance draws a hard line between *what the LLM touches* and *what stays a stable library*.

- **The LLM knows only the CLI.** A conforming consumer MUST drive the generator exclusively through the `memo prompt compose` leaf (or an equivalent leaf), which demands defined, typed inputs. The LLM does not know the engine internals; it knows the CLI contract. As more of the prompt is carried by the template, the consumer MUST be told what it still has to contribute — that shifting boundary is the substance of the interaction, and the AI's own input is kept minimal, only where essential.
- **The generator code stays untouched (the boundary).** The dynamic part — per-memo data structures, the `buildUnits` configuration, and the rendering of context into the prompt — MUST live **consumer-side** (in the core CLI and its templates), through the generator's already-typed `function` placeholder sources. The prompt-generator module remains a stable, deterministic library; its code is **not** modified to serve a given memo. Keeping the single point of failure small and unchanged is a normative constraint, not a preference.

---

## Dependency-Aware PRD Generation Stays Governed

Making PRD generation dependency-aware does **not** loosen the governance — it tightens it, under the same constraints that hold for every other composed prompt.

- **The compositor stays the SOLE prompt producer.** Topological ordering and the L1 PRD→PRD edge are realized as an **extension of the existing compositor**, not as a rival prompt path. There is exactly one producer of initial prompts; dependency-awareness does not introduce a second one.
- **The generator code stays untouched.** The ordering pass and the dependency-edge rendering live **consumer-side**, through the generator's already-typed `function` placeholder sources — the same boundary the previous section draws. The prompt-generator module is not modified to make PRD generation dependency-aware.
- **Bidirectional memo validation still applies.** A dependency-aware batch is still validated both ways against the memo (every memo unit covered; no composed prompt without a memo basis). Reordering changes the sequence, never the set.
- **Bound to measured evidence.** The order is **derived** from the authored `## Phase-Hints` and the per-PRD dependency declarations, never guessed. Absent hints, the order is the stable numeric fallback. The dependency tree is reviewable because it is read from the plan, not asserted by the producer.

---

## Requirements Injection

Prompt governance is the **application side** of the requirements layer ([23-requirements.md](/specification/requirements/)): the answer to "how are requirements applied?" is "through the generator."

- **The chain is deterministic.** Block-bound requirements resolve through the existing match engine and are rendered into the composed prompt through a single injection placeholder (the `REQUIREMENTS_INJECTION` token). Same requirements in, same rendered block out; an empty result is a valid state, not a finding, and maps to a fixed placeholder rather than a throw.
- **Data side and author side are distinct.** A populated requirements store is the data side; a memo *binding* requirements via its block-meta fences is the author side. Governance carries the injection mechanism; it does not by itself author the bindings. The author side is tracked as its own goal (requirements calibration) and MUST NOT be conflated with the application-side goal here.

---

## Per-Memo PRD Inputs

Memos differ sharply, and each PRD needs exactly its own documents. Governance therefore specifies a **per-memo data structure** from which prompts are generated rather than hand-written.

- **One structure per memo, rendered not retyped.** The displayed context MUST coincide with the structure: PRDs are generated **from** the structure. Per PRD the structure holds a precise `needs[]` file list (path plus source), the resolved requirements, the applicable **tools** (tool-requirements via the tools registry, [24-tools-registry.md](/specification/tools-registry/)), and a topic id linking the PRD to its researched files.
- **The reading goal.** The guiding intent is: *a human reads the memo, but everything is prepared so the AI can work through it as automatically as possible* — with the intervention door still open. The "Required Context" table of a PRD is **rendered from this structure**, mirroring the requirements-injection mechanic onto a "PRD inputs" source, consumer-side, with the generator code unchanged.

---

## Governance: the Prompt-Governance Goal

Because the generator is both a lever and a single point of failure, it MUST be measured, not assumed.

- **A goal that names the mechanism.** A goal — **Prompt Governance / Initial-Prompt Harness** — asserts that the initial prompts of all spawned agents run through a controlled harness with a guaranteed minimum quality floor — deterministic, driven by the LLM through the CLI, with room for necessary additions — across both cases (PRD homogeneous, research heterogeneous). It is the application side of the requirements goal and is kept **separate** from it; the only coupling is the injection placeholder.
- **Measured in a fresh context.** Like every goal ([31-goals.md](/specification/goals/)), this goal is scored against real state in a fresh context, never in the session that built the wiring. A green report is not evidence that the bottleneck is actually the default path; the fresh-context reader inspects whether the composed path is genuinely used.

---

## Related

- [15-prompt-generator.md](/specification/prompt-generator/) — the engine this chapter governs: the deterministic, hash-stable producer whose code stays untouched.
- [23-requirements.md](/specification/requirements/) — the requirements layer whose application side is prompt governance (the injection chain).
- [08-phases-and-prds.md](/specification/phases-and-prds/) — the phase plan that is the source for one composed prompt per PRD (Case B).
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the agents whose deterministic initial prompt the generator produces.
- [31-goals.md](/specification/goals/) — the goal primitive; the prompt-governance goal measures this mechanism in a fresh context.
- [30-primitives.md](/specification/primitives/) — the central glossary the prompt-governance vocabulary ties back to.
