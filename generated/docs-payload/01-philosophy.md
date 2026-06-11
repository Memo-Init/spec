---
title: "Guardrail Philosophy & Interaction Model"
description: "In agentic engineering, planning is the single most important activity. An autonomous agent can write a great deal of code quickly, but code written without a plan tends to be code that has to be..."
spec_version: "0.1.0"
spec_file: "01-philosophy.md"
order: 1
section: "Specification"
normative: false
generated_at: "2026-06-11T03:38:25.870Z"
generated_from: "spec/v0.1.0/01-philosophy.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/01-philosophy.md."
---


> **Informative.** This chapter describes the philosophy and interaction model behind the memo system. It is written in prose; the normative requirements that operationalize it live in the chapters it points to.

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

## Related

- [00-overview.md](/specification/overview/) — mission and verified-system framing.
- [02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/) — the SOP that defines the guardrails.
- [04-input-pipeline.md](/specification/input-pipeline/) — the pipeline that protects long transcripts.
- [12-rollout.md](/specification/rollout/) — autonomous execution within the guardrails.
