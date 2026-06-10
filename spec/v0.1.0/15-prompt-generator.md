# 15. Prompt Generator

| Field | Value |
|-------|-------|
| Status | Draft |
| Depends on | [14-agents-skills-tasks.md](./14-agents-skills-tasks.md) |
| Related | [13-orchestration.md](./13-orchestration.md), [12-rollout.md](./12-rollout.md), [16-git-security-versioning.md](./16-git-security-versioning.md), [00-overview.md](./00-overview.md) |

> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](./00-overview.md) (Conformance Language). RFC 2119 / BCP 14 keywords are used.

This chapter is **normative** for the prompt-generator contract, the three placeholder modes, and the validation discipline. It documents the **real verified engine** (177/177 tests green, zero runtime dependencies).

---

## Purpose

A sub-agent's starting point must be exactly reproducible. Non-deterministic prompt generation drifts a little with every unit, and after hundreds of units nobody can say which sub-agent started from which mission. The prompt generator makes the starting point reproducible: **same payload, same prompt, same hash, every time**. It is the producer of the deterministic initial prompt of an `AGENTS.md` agent (see [14-agents-skills-tasks.md](./14-agents-skills-tasks.md)).

The engine is deliberately small in code and maximal in validation, with no runtime dependencies.

---

## What It Is

A **deterministic prompt compositor**: a template plus typed placeholders go in; a substituted prompt plus metadata come out. There is **no LLM call** — pure composition plus validation. Every finding at any stage is a **hard throw** with an AI-readable `PGEN-XXX` error code; there are no partial results, no empty strings, no torso prompts (a surviving `{{...}}` token fails the run), and no silent defaults.

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

The package entry additionally exports the frozen `ERROR_CODES` registry and the two default-limit constants. Validation runs as a fixed six-stage pipeline (payload validation → template resolution → bidirectional coverage check → per-placeholder source resolution → composition guard → torso check + length limits); any stage finding is a hard throw with a `PGEN-` code.

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

> **Note on `buildStepPlan`:** this pattern is demonstrated as `buildStepPlan` in the engine's README and test fixtures, but it is **not** an importable `src/` export. The package entry exports only `PromptGenerator`, `ERROR_CODES`, and the two default-limit constants (verified). A consumer adopting the pattern MUST rebuild the function locally rather than importing it.

---

## Determinism and Agent Handover

The generator is a pure function over its payload: no silent defaults, no LLM call, fully hashable. Because the composed prompt and every placeholder carry a sha256 in the metadata, a start-prompt is auditable — two runs with the same payload are provably identical.

This is exactly what the agent layer needs: the generator produces the **deterministic initial prompt** of an `AGENTS.md` agent (see [14-agents-skills-tasks.md](./14-agents-skills-tasks.md)). The `AGENTS.md` file holds the standing operating rules; the generated start-prompt is the per-invocation order. The starting point is essential — and the generator makes it reproducible.

---

## Related

- [14-agents-skills-tasks.md](./14-agents-skills-tasks.md) — the `AGENTS.md` agents whose per-invocation start-prompt this generator produces.
- [13-orchestration.md](./13-orchestration.md) — the phase orchestration whose evaluator order is composed via the function-placeholder pattern.
- [12-rollout.md](./12-rollout.md) — the rollout in which deterministic start-prompts drive sub-agent work.
- [00-overview.md](./00-overview.md) — conformance language.
