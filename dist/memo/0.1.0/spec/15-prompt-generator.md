---
title: "Prompt Generator"
description: "A sub-agent's starting point must be exactly reproducible. Non-deterministic prompt generation drifts a little with every unit, and after hundreds of units nobody can say which sub-agent started from..."
spec_version: "0.1.0"
spec_file: "15-prompt-generator.md"
order: 15
section: "Specification"
normative: true
generated_at: "2026-07-07T21:34:26.628Z"
generated_from: "draft/memo/0.1.0/spec/15-prompt-generator.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/15-prompt-generator.md."
---


A sub-agent's starting point must be exactly reproducible. Non-deterministic prompt generation drifts a little with every unit, and after hundreds of units nobody can say which sub-agent started from which mission. The prompt generator makes the starting point reproducible: **same payload, same prompt, same hash, every time**. It is the producer of the deterministic initial prompt of an `AGENTS.md` agent (see [14-agents-skills-tasks.md](/specification/agents-skills-tasks/)).

The engine is deliberately small in code and maximal in validation, with no runtime dependencies.

---

## What It Is

A **deterministic prompt compositor**: a template plus typed placeholders go in; a substituted prompt plus metadata come out. There is **no LLM call** — pure composition plus validation. Every finding at any step is a **hard throw** with an AI-readable `PGEN-XXX` error code; there are no partial results, no empty strings, no torso prompts (a surviving `{{...}}` token fails the run), and no silent defaults.

The metadata records, for the template and the composed prompt and each placeholder, the **length** and a **sha256 hash** — the hash is what makes a starting point auditably reproducible.

---

## API

The module exposes one class with one public static method:

```
await PromptGenerator.generate( { template, placeholders, limits } ) → { prompt, metadata }
```

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `template` | object | Yes | `{ type: 'string', value }` or `{ type: 'file', filePath }`. Type `function` is not allowed for templates. The resolved template MUST contain at least one `{{KEY}}` token (key grammar `^[A-Z][A-Z0-9_]*$`). |
| `placeholders` | object | Yes | One entry per template token, at least one entry. Each entry is an object with an explicit `type` — shorthand values are rejected. |
| `limits` | object | No | Optional `{ maxPromptLength, maxPlaceholderValueLength }` (positive integers); omitted keys fall back to the exported defaults. |

The return value is `{ prompt, metadata }`: `prompt` is the fully composed string, guaranteed free of unresolved `{{...}}` tokens and within the length limits; `metadata` carries a provenance record (`source`, `length`, `hash`, and `filePath` / `functionName` where applicable) for the template, the composed prompt, and every placeholder.

The package entry additionally exports the frozen `ERROR_CODES` registry and the two default-limit constants. Validation runs as a fixed six-step pipeline (payload validation → template resolution → bidirectional coverage check → per-placeholder source resolution → composition guard → torso check + length limits); any step finding is a hard throw with a `PGEN-` code.

---

## Three Modes

Placeholders resolve from one of three typed sources:

| Mode | Source | Contract |
|------|--------|----------|
| `string` | A direct literal value | Non-empty, no null bytes |
| `file` | A file read completely as UTF-8 | Missing, empty/whitespace-only, or invalidly encoded file is a hard error (`PGEN-020/021/052`) |
| `function` | A callable invoked once with `args` as its single object parameter | MUST return **exactly** `{ status: true, text }` with a non-empty string `text` — shape, status, and text are each double-checked (`PGEN-031/032/033`) |

### The anonymous-function mode is central

The function mode is the central one: it lets a placeholder compute a dynamic value at composition time while staying inside the deterministic contract. The function — anonymous or named — receives `args` and MUST return exactly `{ status: true, text }`; a `false` status, a `'true'` string, a missing status, a wrong shape, or a non-string text each fail the run with a coded throw. This is how dynamic content enters a reproducible prompt without breaking determinism: the function is pure with respect to its `args`, so the same `args` yield the same `text` yield the same hash.

---

## Phase-Evaluator Use Case

The phase-evaluator order is built with a function placeholder. A function loads the phase's PRD plan (JSON), filters by phase, and emits the concrete order — for example "call PRDs 3, 10, 15 and evaluate them". The function returns `{ status: true, text }` with that order as `text`, and the generator composes it into the start-prompt deterministically.

---

## Dependency-Aware Ordering and the L1 PRD→PRD Edge

When the compositor derives one prompt per PRD from a memo's rollout plan, the order of the emitted prompts is **dependency-aware, not naive numeric**. This is the same function-placeholder pattern as the phase-evaluator order, applied to the whole batch — the engine itself is unchanged.

- **Topological order from `## Phase-Hints`.** The phases are ordered so that every phase follows the phases it `depends-on` (see [08-phases-and-prds.md](/specification/phases-and-prds/)). The ordering is a deterministic topological sort with a **stable numeric fallback**: among phases that are simultaneously ready, the lowest phase number runs first. A memo **without** phase hints therefore yields exactly the numeric order — the rule is additive, never destabilizing. A dependency cycle (or a dangling `depends-on`) is a **hard error**, not a silent re-order.
- **The L1 PRD→PRD edge in the prompt.** Each composed PRD prompt **names the PRD(s) it depends on**. This dependency edge — level-one, PRD to PRD — is rendered into the prompt through a placeholder, exactly like every other dynamic value, so it stays inside the deterministic contract (same plan in, same prompt, same hash). A PRD with no upstream PRD renders the explicit "no upstream PRD" state; an empty dependency list is a **valid** state (a root PRD), not a finding.
- **Bound to measured evidence.** Ordering is derived from the authored plan, not guessed: the source is the `## Phase-Hints` relations and the per-PRD dependency declarations. The producer stays the single bottleneck — the generator code is untouched and all of the per-memo dynamics live consumer-side (see [32-prompt-governance.md](/specification/prompt-governance/)).

---

## The Coverage Principle

A composed batch should **cover the memo's units**, and that coverage is **measured, not assumed**. The principle is the same honesty rule the goal layer applies: a green run is not proof of coverage; coverage is a number you compute against the real plan.

- **Soll (target).** Every unit the memo declares for implementation — each PRD in the rollout plan — should have exactly one composed prompt. The target is the full set of declared units.
- **Ist (actual).** The set of prompts the compositor actually emitted, counted against the declared units.
- **The dial.** Coverage is the Ist measured against the Soll: a ratio of composed prompts to declared units. A dial below the target is a **visible gap** (a unit with no composed prompt), not a silent omission — the same "the displayed context must coincide with the structure" rule the governance chapter states. The compositor reads the plan as the single source of the unit list, so the dial is computable and reviewable rather than asserted.

---

## Skills Integration

The prompt generator does not operate in isolation: it couples bidirectionally to the skill layer.

**Requirements as input.** The requirement text defined in the Requirements chapter (see [23-requirements.md](/specification/requirements/)) flows into prompt generation as payload content. A skill assembles the structured requirement payload and passes it to `PromptGenerator.generate()` as placeholders; the generator composes the final prompt deterministically from that input.

**Skills as callers.** A skill MAY invoke the generator directly. The skill supplies the template and placeholders; the generator returns `{ prompt, metadata }`. The composed prompt then drives a sub-agent invocation. This means the generator is not a standalone CLI tool but a composable primitive that the skill layer orchestrates.

**Flow direction.** Requirements → skill → generator → agent start-prompt. The generator is the boundary between human-authored requirement text and the deterministic per-invocation prompt that a sub-agent receives.

---

## Determinism and Agent Handover

The generator is a pure function over its payload: no silent defaults, no LLM call, fully hashable. Because the composed prompt and every placeholder carry a sha256 in the metadata, a start-prompt is auditable — two runs with the same payload are provably identical.

This is exactly what the agent layer needs: the generator produces the **deterministic initial prompt** of an `AGENTS.md` agent (see [14-agents-skills-tasks.md](/specification/agents-skills-tasks/)). The `AGENTS.md` file holds the standing operating rules; the generated start-prompt is the per-invocation order. The starting point is essential — and the generator makes it reproducible.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the `AGENTS.md` agents whose per-invocation start-prompt this generator produces.
- [13-orchestration.md](/specification/orchestration/) — the phase orchestration whose evaluator order is composed via the function-placeholder pattern.
- [12-rollout.md](/specification/rollout/) — the rollout in which deterministic start-prompts drive sub-agent work.
- [08-phases-and-prds.md](/specification/phases-and-prds/) — the `## Phase-Hints` dependency tree from which the topological PRD-prompt order is derived.
- [32-prompt-governance.md](/specification/prompt-governance/) — the governance that keeps this engine the sole, untouched prompt producer.
- [00-overview.md](/specification/overview/) — conformance language.
