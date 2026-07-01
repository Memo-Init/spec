---
title: "Input Paths"
description: "Every input to the memo system arrives as a transcript, and a mandatory header on its first line selects the flow that follows. This chapter defines the four transcript types the system recognizes..."
spec_version: "0.1.0"
spec_file: "03-input-paths.md"
order: 3
section: "Specification"
normative: true
generated_at: "2026-07-01T00:36:59.539Z"
generated_from: "draft/memo/0.1.0/spec/03-input-paths.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/03-input-paths.md."
---


Every input to the memo system arrives as a transcript, and a mandatory header on its first line selects the flow that follows. This chapter defines the four transcript types the system recognizes and the follow-up path each one routes into.

## Four Transcript Types

Every input to the memo system arrives as a **transcript**. The transcript server produces exactly four transcript types. The first line of the transcript — a mandatory default header — declares the type, and the type determines the follow-up flow. An implementation MUST recognize all four types and MUST reject a transcript whose first line matches none of them.

| Type | Purpose | Follow-up flow |
|------|---------|----------------|
| `memo-init` | Start a new memo. | Input pipeline → `memo-init` (a new memo; its location is determined there). |
| `revision` | Feedback on an existing revision. | Input pipeline → `memo-revision-*` (generate → execute → evaluate). |
| `free` | Attached input bound to a specific memo — not a standalone work order. | Input pipeline only. No revision, no memo. |
| `plan-start` | Start or extend a plan. | Input pipeline → `memo-plan-*` (create plan, select memos). |

---

## Type Identity

Only the `revision` type carries a memo number and revision fields, because only a revision is bound to an existing memo. The other three types — `memo-init`, `free`, and `plan-start` — deliberately carry **no** memo number and **no** revision field.

The absence of those fields for `memo-init`, `free`, and `plan-start` is correct and MUST NOT trigger a hard error. An implementation MUST extract memo number, memo name, revision id, and memo path **only** for the `revision` type.

---

## Context Mode per Type

Each type implies a context mode — whether the follow-up runs in the current conversation thread or in a fresh, empty context.

| Type | Context mode | Rationale |
|------|--------------|-----------|
| `memo-init` | empty context | A new memo starts unbiased; its place is decided fresh. |
| `revision` | in-thread | Feedback is applied to a memo already under discussion. |
| `free` | in-thread | A free transcription is consumed where it was spoken. |
| `plan-start` | empty context | A plan is assembled from finalized memos without prior bias. |

---

## The `free` Type

A `free` transcript is attached input bound to a specific memo — not an unstructured, open-ended dictation. It runs through the input pipeline (completeness → transcription-error scan → topic extraction → context preservation) and then stops. It produces neither a revision nor a memo. It is the path for capturing additional dictated context that belongs to an existing memo but does not constitute a new work order.

---

## Viewer

The Viewer is the component that bridges a raw transcript and the memo system. It accepts a transcript (audio or text), generates a transcript-server URL for that transcript, and — when the URL is called — returns a text file whose content is the structured prompt (the full pipeline invocation). The default header in that text-file response is the deterministic activation trigger: the presence of this header is what the pipeline reads to identify the transcript type and to start the type-dependent follow-up without any additional prompt.

The Viewer therefore has two outputs: (1) the transcript-server URL (a reference the user or system can pass as input), and (2) the structured prompt text returned when that URL is fetched.

---

## Deterministic Activation

When the input is a transcript-server URL produced by the Viewer, the default header in the fetched response **is** the activation: once the header is parsed, the pipeline and the type-dependent follow-up run autonomously, with no further developer prompt between fetch and pipeline start. This deterministic activation is specified in [04-input-pipeline.md](/specification/input-pipeline/). Other input forms (for example, dictated files pasted directly) MAY still ask a clarifying question; only the Viewer-sourced URL mode runs autonomously.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [04-input-pipeline.md](/specification/input-pipeline/) — the five-step pipeline every type runs through, and the URL-header activation.
- [05-memo-strategies.md](/specification/memo-strategies/) — the strategy dimension, orthogonal to the transcript type.
- [07-revisions-and-questions.md](/specification/revisions-and-questions/) — what the `revision` flow produces.
