# 03. Input Paths — Four Transcript Types

| | |
|---|---|
| Status | Draft |
| Depends on | [02-memo-sop-entrypoint.md](./02-memo-sop-entrypoint.md) |
| Related | [04-input-pipeline.md](./04-input-pipeline.md), [05-memo-strategies.md](./05-memo-strategies.md), [07-revisions-and-questions.md](./07-revisions-and-questions.md) |

> **Normative.** Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](./00-overview.md) (Conformance).

---

## Four Transcript Types

Every input to the memo system arrives as a **transcript**. The transcript server produces exactly four transcript types. The first line of the transcript — a mandatory default header — declares the type, and the type determines the follow-up flow. An implementation MUST recognize all four types and MUST reject a transcript whose first line matches none of them.

The type names are English. The type historically named `frei` in the toolkit code is renamed to `free` in this specification and system. This rename is a tracked change in the parser and is **specified-but-not-yet-implemented**: the specification fixes the name `free`, while the corresponding code rename in the parser is follow-up work.

| Type | Purpose | Follow-up flow |
|------|---------|----------------|
| `memo-init` | Start a new memo. | Input pipeline → `memo-init` (a new memo; its location is determined there). |
| `revision` | Feedback on an existing revision. | Input pipeline → `memo-revision-*` (generate → execute → evaluate). |
| `free` | Free transcription, no memo intent. | Input pipeline only. No revision, no memo. |
| `plan-start` | Start or extend a plan. | Input pipeline → `memo-plan-*` (create plan, select memos). |

---

## Type Carries Identity Only for `revision`

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

`free` is a system rename of the toolkit code type `frei`. A `free` transcript runs through the input pipeline (completeness → transcription-error scan → topic extraction → context preservation) and then stops. It produces neither a revision nor a memo. It is the path for capturing dictated thinking that is not yet a work order.

---

## Deterministic Activation

When the input is a transcript-server URL, the default header in the response **is** the activation: once the header is parsed, the pipeline and the type-dependent follow-up run autonomously, with no further developer prompt between fetch and pipeline start. This deterministic activation is specified in [04-input-pipeline.md](./04-input-pipeline.md). Other input forms (for example, dictated files pasted directly) MAY still ask a clarifying question; only the URL mode runs autonomously.

---

## Related

- [04-input-pipeline.md](./04-input-pipeline.md) — the five-step pipeline every type runs through, and the URL-header activation.
- [05-memo-strategies.md](./05-memo-strategies.md) — the strategy dimension, orthogonal to the transcript type.
- [07-revisions-and-questions.md](./07-revisions-and-questions.md) — what the `revision` flow produces.
