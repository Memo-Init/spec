# memo-init Tone-Guide

> **Internal calibration document.** A lens for every piece of content (Hero, Overview, Philosophy, Memo-SOP, Input, Strategies, Quality, Rollout, Orchestration, Agents, Prompt-Generator, Git & Security, Workbench, Spec chapters).
> Derived from the memo's own evidence discipline (FAKT / ANNAHME / VERMUTUNG) and its honest framing of estimates and deviations. A prior project's tone-guide serves as the structural model.

## Base tonality

| Property | Setting |
|----------|---------|
| Register | Factual, precise, no hype adjectives. The system describes itself; it does not sell itself. |
| Language | **English only** across the spec and public docs. (Memos themselves are German per the workbench language matrix, but everything published here — spec, README, website — is English.) |
| Buzzwords | **Avoid:** "revolutionary", "next-generation", "AI-native", "game-changing" as hero adjectives. **Allowed:** when factually grounded (e.g. "hands-off rollout" describes a concrete property; "deterministic start prompt" is a measurable fact). |
| Personalization | No persona address ("For X"). Content speaks through substance. |
| Code / artifacts | Deterministic claims must be shown, not asserted — hashable prompt, state files, test counts (e.g. "177/177 tests green") rather than "thoroughly tested". |
| Diagrams | Mermaid for structures, **TD / Top-Down** only (better on mobile). |
| Positioning | **Neutral.** The system is positioned as a method — memo → PRD → rollout with agents as a base layer and guardrails — not as a product, a framework, or a brand. |

## Evidence discipline (the core differentiator)

The memo system's signature is honesty about what is known. This carries directly into the docs and is the single strongest trust signal for the Evaluating Decision-Maker.

| Evidence level | Meaning | How it surfaces in docs |
|----------------|---------|--------------------------|
| **FAKT** (fact) | Verified against real code / a passing test | State it plainly, cite the source (file, test count). |
| **ANNAHME** (assumption) | A reasoned design decision, not yet proven | Frame as a decision, name the rationale, don't dress it as fact. |
| **VERMUTUNG** (conjecture) | An estimate or hypothesis | **Mark it explicitly** — e.g. "estimated ~40–60%, an estimate, not measured". |

**Rule:** never let a VERMUTUNG read like a FAKT. A marked estimate is a feature, not a weakness — it is exactly what earns Anders's trust and reflects Aaron's discipline.

## Tone per section

| Section | Allowed tone | Example |
|---------|--------------|---------|
| Hero / Landing | Crisp, clear, slightly pointed | "Plan in a memo, roll out hands-off. Guardrails included." |
| Overview / What is it | Factual, narrative, no marketing | "The memo system replaces plan mode: a long transcript becomes a structured memo, finalized behind quality gates, then rolled out hands-off." |
| Philosophy | Explanatory, with the guardrails analogy, no hype | "Planning is the most important part of agile engineering. The system builds guardrails — the autobahn, not the open field." |
| Memo-SOP | Procedural, step-numbered, the canonical entry point | "memo-sop is the entry skill that explains the whole workflow — and the re-entry point after a reset." |
| Rollout | Precise about hands-off + guardrails | "After finalization, nothing is touched by hand. Generate → Execute → Evaluate runs at every level, with state files and crash-recovery." |
| Specification | Precise, with IDs, RFC-2119 keywords | "A memo MUST pass all quality gates before finalization." |
| Reference | Dry, complete | API surface of the prompt-generator, error codes (`PGEN-XXX`). |
| Git & Security | Deterministic, rule-shaped | "The git flow is deterministic. Worktree cleanup is non-skippable work, not optional." |

## Forbidden patterns (with alternatives)

| Bad | Better |
|-----|--------|
| "Revolutionary AI-native development system" | "A memo-driven planning method with hands-off rollout" |
| "Game-changing autonomous coding" | "Generate → Execute → Evaluate, with quality gates and crash-recovery" |
| "It just works" | "177/177 tests green (`npm test`)" — a fact, with its source |
| "Fully tested and reliable" | "Each public method is tested; coverage reported in CI" |
| "For Decision Makers" | "Overview" (Anders finds it himself) |
| "For Developers" | "Philosophy" + "Rollout" (Priya finds it herself) |
| "~50% valid" (stated as fact) | "estimated ~40–60%, an estimate, not measured" |
| "Production-grade, battle-tested" (no evidence) | "Run daily across ~138 memos in production use" — a concrete, verifiable claim |
| "Set it and forget it" | "Hands-off after finalization, with verify/rollback on risky live-system steps" |
| API key hardcoded in a snippet (`api_key="sk-..."`) | `api_key=process.env.X` + a note; never a real or mock secret |

## Sharpen, don't expand (3-question test)

Every content proposal is checked against three questions before it ships:

- [ ] Does this proposal **sharpen** an existing statement, or only add a new one?
- [ ] Can it be folded into an **existing** page instead of creating a new one?
- [ ] Does the target page become **shorter and clearer** with this, or just longer?

**Application:**
- If 2+ answers are "no" → revise or reject.
- If "yes, but the persona reason is missing" → name the persona gap explicitly (e.g. "closes Priya-friction: shows where she plugs into the pipeline").
- If all "yes" → ship it.

## Honesty about scope (memo-specific rule)

The memo itself draws a hard line between the bootstrap (org + repos + spec text) and follow-up work (live-skill/code changes). Docs must keep that line visible: when a chapter describes future behavior of the live skills, say so. Never present planned follow-up work as already-shipped behavior. This protects Aaron's live system and Anders's trust simultaneously.

## Mermaid rule

| Allowed | Forbidden |
|---------|-----------|
| `flowchart TD` (Top-Down) | `flowchart LR` (Left-Right) |
| `graph TD` | — |

Rationale: TD reads better on all screen sizes, especially mobile. LR diagrams clip on narrow viewports.

## Blog (release/feature posts)

The blog is a different register from the spec: narrative is allowed, the spec's "no hype"
rule is not a ban on warmth here. The reference for the corridor is a problem-first,
first-person-plural ("we") release post with concrete numbers instead of superlatives —
human *within* the evidence discipline. Three guardrails specific to blog posts:

| Guardrail | Meaning |
|-----------|---------|
| **Human, but honest** | Narrative and warm, yet every fact cited and every estimate marked. Evidence discipline stays — it is the trust signal, not a cost. |
| **Outward-facing** | Written for a new visitor with no project context. No internal process narration, no insider terms, no memo numbers; explain a term before using it. Wins over narrative depth when they conflict. |
| **Humble, not boastful** | No superiority claims. Convergence with prior art is told as convergence ("and"), never as a race we won — big claims attract negativity. |

Operational conventions (cadence, skeleton, frontmatter, snapshot comments) live in the
site repo's `BLOG-CONVENTION.md`; this entry sets only the tone.

## Audit trail

Source: the memo system's evidence discipline, scope-separation rule, and honest framing of estimates/deviations. Structural model: an earlier project's persona tone-guide. Blog section added later for release-communication.
