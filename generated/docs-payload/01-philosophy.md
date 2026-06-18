---
title: "Philosophy"
description: "The memo system rests on a small set of convictions about how an autonomous agent and a developer should work together: that planning outranks coding, that context is finite and must be spent..."
spec_version: "0.1.0"
spec_file: "01-philosophy.md"
order: 1
section: "Specification"
normative: false
generated_at: "2026-06-18T08:05:50.176Z"
generated_from: "spec/v0.1.0/01-philosophy.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/01-philosophy.md."
---


> **Informative.** This chapter describes the philosophy and interaction model behind the memo system. It is written in prose; the normative requirements that operationalize it live in the chapters it points to.

The memo system rests on a small set of convictions about how an autonomous agent and a developer should work together: that planning outranks coding, that context is finite and must be spent deliberately, and that work is surfaced rather than deferred. This chapter sets out those convictions and the interaction model they imply, before the later chapters turn them into normative rules.

---

## Planning Is the Most Important Activity

In agentic engineering, planning is the single most important activity. An autonomous agent can write a great deal of code quickly, but code written without a plan tends to be code that has to be repaired. The memo system is built on the conviction that the developer's leverage is highest **before** implementation — in shaping the work order — and that the cost of a missing decision grows the further into a rollout it is discovered.

The success definition for the whole system follows directly from this: success is that, after implementation, the software works immediately, with as little repair as possible. Every measure in the system is subordinate to that goal.

---

## The Guardrail (Highway) Analogy

The memo system does not try to drive the car. It builds **guardrails** — the kind that line a highway. Within the guardrails, autonomous execution can move fast and stay on the road; outside them, it drifts into invented behavior, dropped context, and rework.

A guardrail is a constraint that is cheap to set up and expensive to omit:

- A complete topic list is a guardrail against silently dropping a requirement.
- A preserved context block is a guardrail against the agent interpreting instead of knowing.
- A phase dependency tree is a guardrail against executing work in an order that cannot succeed.
- A finalization gate is a guardrail against starting a rollout on an under-specified memo.

The guardrails are not bureaucracy. Each one exists because its absence has, in practice, produced a concrete failure.

---

## The Memo-SOP Defines the Guardrails

The guardrails are not ad hoc. They are defined by the **memo-SOP** — the Standard Operating Procedure that describes the complete path from a dictated transcript to an executed rollout. The SOP is the single source of truth for what the guardrails are, in what order they apply, and which one is in force at any given moment. The canonical entry point that explains the SOP — and that an agent re-enters after a context reset — is described in [02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/).

---

## Expect Long, Dense Initial Transcripts

The system is designed around a specific expectation: the **initial input is a long, dense, dictated transcript**, not a tidy bullet list. A developer thinking out loud produces hours of reasoning, background, and half-formed decisions in a single pass.

Two consequences follow, both treated as guardrails:

1. **Nothing in the transcript may be silently dropped.** The input pipeline ([04-input-pipeline.md](/specification/input-pipeline/)) exists precisely because long transcripts are easy to truncate, mis-transcribe, or summarize away. Every linked file MUST be read in full before any response; every topic MUST be extracted; all context MUST be preserved.
2. **The default input language is spoken language.** The transcript is the natural artifact of dictation. The system meets the developer where the thinking happens rather than forcing premature structure.

---

## The Interaction Model

The division of labor is explicit:

| Actor | Responsibility |
|-------|----------------|
| **Developer** | Plans. Provides long input, answers open questions, decides design trade-offs, and triggers finalization. |
| **AI** | Implements. Processes input, drafts and revises the memo, runs quality checks autonomously, and — after finalization — executes the rollout as autonomously as possible. |

Two rules anchor this model:

- **The AI never finalizes autonomously.** Finalization is exclusively developer-triggered. Experience shows the AI finalizes chronically too early; making finalization the one step that requires an explicit human trigger is a deliberate guardrail. See [11-quality-and-finalization.md](/specification/quality-and-finalization/).
- **After finalization, the AI does not ask permission for each step.** The memo was worked out jointly; once the rollout begins, everything is already agreed. The only legitimate interruption is a genuine design decision. See [12-rollout.md](/specification/rollout/).

The throughline is that the human invests effort up front, inside the guardrails, so that the machine can run the rest with minimal supervision and a high probability that the result works on the first try.

---

## Prioritization Is the Developer's Decision

A direct consequence of the interaction model: the AI MUST NOT decide what is important. Prioritizing, down-ranking, or setting a threshold on the work order is the developer's exclusive responsibility. **Every item is equally important unless the developer says otherwise.** If a dictated transcript contains fifteen things, all fifteen are worked through, each one as important as the next. The AI MAY ask questions (asking is explicitly encouraged) and MAY raise essential technical objections, but it MUST NOT silently drop, down-rank, or unilaterally threshold any item.

The reasoning chain is operational, not stylistic:

1. **Implementation cost starts at memo-init.** Removing or unevenly weighting a work item mid-stream raises the cost of every feature already implemented — the dropped small feature must later be redone, including fresh research.
2. **In aggregate, small features matter as much as large ones.**
3. **Importance is not surveyable during the process** — only in hindsight, in review, from accumulated experience.
4. **Context limitation.** The AI works from an in-memory context that always starts empty. The developer carries the experience of well over a hundred memos; the AI would have to read on the order of a hundred-and-thirty memos (tens of hours, a large share of the weekly budget) merely to make one informed small-feature prioritization. There is, as yet, no context large enough for that. (The wiki system works toward this but does not yet replace it.)

## No Quick Wins

The system does not chase "quick wins." Provider prompts tend to push quick wins because they do not assume plan-based work; the memo system does. **We work plans and we land planes** (see the landing discipline in the rollout). A quick win pulled out of sequence is a prioritization decision in disguise — and prioritization is the developer's decision (above).

## Work It In Instead of Deferring

Problems that surface during a run are **worked in** during the running phase, not exported into a follow-up memo. A follow-up memo is expensive: it costs the developer hours, forces the research to be redone from scratch, and adds revision rounds — turning a small button-color change into a phantom multi-day effort. Plans MAY be arbitrarily long; the AI MAY keep working a problem as long as needed and has the resources to do so. The hard limits are unchanged (no commits or pushes without approval); "work it in" never means "act outside the guardrails." Concerns that are not genuine blockers go into the rollout preface, not into a stop. See the rollout chapter for the preface/concern channel.

---

## Related

- [00-overview.md](/specification/overview/) — mission and verified-system framing.
- [02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/) — the SOP that defines the guardrails.
- [04-input-pipeline.md](/specification/input-pipeline/) — the pipeline that protects long transcripts.
- [12-rollout.md](/specification/rollout/) — autonomous execution within the guardrails.
