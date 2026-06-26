---
title: "Question Interface"
description: "The question interface is the primary surface between the user and the agent: most decisions a memo records pass through it. This chapter defines the discipline that surface carries — every option is..."
spec_version: "0.1.0"
spec_file: "34-question-interface.md"
order: 34
section: "Specification"
normative: true
generated_at: "2026-06-26T16:04:18.195Z"
generated_from: "spec/v0.1.0/34-question-interface.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/34-question-interface.md."
---


The question interface is the primary surface between the user and the agent: most decisions a memo records pass through it. This chapter defines the discipline that surface carries — every option is evaluated and the evaluation is communicated, and the recommendation is made from a **holistic project view** rather than driven by the immediate context. It specifies the evaluation axes (deliberately lenses, not rigid rules), the two channels that present questions, and the deterministic write-format that removes a recurring parser failure. It does not re-define the raw question syntax — that lives in [07-revisions-and-questions.md](/specification/revisions-and-questions/); this chapter adds the reasoning layer above it.

## The Question Interface Is the Main Interface

Almost every decision in a memo is reached through a question: a memo question (`### F{N}`) or a tool-driven prompt. Because the interface carries that much weight, it is held to a discipline of its own — it is not a neutral pass-through of choices but a place where each choice is weighed, the weighing is shown, and the recommendation reflects the project as a whole. Treating the question interface as a first-class object is what lets the rest of this specification rely on the quality of the decisions that flow through it.

## Options Are Scored, and the Score Is Communicated

Every option offered to the user MUST carry an **evaluation**, and that evaluation MUST be communicated alongside the option — not kept implicit in the agent's reasoning. The accompanying **recommendation** is made from a **holistic project view**: the long-term health of the project and the maintainer's vantage, not whatever is locally convenient in the current context.

- **Long-term + maintainer lens.** The recommendation reads each option as the person who will maintain it a year from now would, not as the person racing to close the current step.
- **Maintenance risk belongs in both places.** A maintenance risk is named in the **recommendation** *and* in the **options** it concerns — never hidden so the recommended path looks cleaner than it is.
- **The conflict is explicit.** "Keep everything maintained" is not a free maximum: changing nothing is itself often the wrong call. The trade-off between preserving and improving is stated, not silently resolved toward inaction.
- **Reasoning depth.** A recommendation weighs the alternatives it rejects; an option presented without the reasoning that ranks it is incomplete.

## The Evaluation Axes Are Lenses, Not Rules

Options are scored on **qualitative axes expressed as words**, not as hard numbers — a lightweight, comparable reading without a theatre of invented scores. The axes are **perspectives that help view an implementation from several angles**; they are decision aids, **not rigid prescriptions**. The hard guards stay hard: 100 % feature completeness and no unilateral deferral are not negotiated away by any axis (see [29-behavioral-guardrails.md](/specification/behavioral-guardrails/), C6 and C7).

- **Maintainability** — long-term maintainability from the maintainer's view; no hybrid sprawl that doubles the surface that can drift (see [33-maintenance.md](/specification/maintenance/), [27-landing-the-plane.md](/specification/landing-the-plane/)).
- **Spread (possibility space)** — keep the space of options genuinely broad; avoid *sham-breadth*, where every "option" is a variant of one pre-decision. In scoring, keep two things **separate**: the breadth of the space and the evaluation of the individual options within it.
- **Defer-Last** — its own axis: any option that defers work (a follow-up memo, a sub-memo, a "later") MUST **name the planning overhead it incurs** explicitly. There is no flat penalty for deferring — a blanket deduction would be unfair (cf. the explicit conflict above) — but the cost is made visible rather than waved through. This axis is the scoring counterpart of guardrail C7 ([29-behavioral-guardrails.md](/specification/behavioral-guardrails/)): deferral is the user's decision, and its price is shown.
- **Minimal-Code** — prefer the smallest solution that fully does the job (detailed below). It is a **lens, not a prescription**, and it is gated hard: it applies **only at 100 % feature completeness** — minimalism is never an excuse to cut a feature or to defer it. This axis couples to Defer-Last: a "smaller" option that quietly defers work is not actually smaller.

## Minimal-Code: the YAGNI Cascade

The Minimal-Code lens asks, before writing code, whether the code needs to be written at all. It runs as a short cascade and stops at the first step that is satisfied:

1. **Does this need to exist?** (YAGNI) — if not, stop here.
2. **Does the standard library already do it?**
3. **Is there a native platform feature for it?**
4. **Does an already-installed dependency cover it?**
5. **Is it one line?**
6. Otherwise: the **minimum that works**.

The lens is **a perspective, not a mandate**: it adds one more angle on an implementation, alongside the other axes, and never overrides the hard guard. The smallest solution counts **only when the feature is 100 % complete** — minimalism must never become feature-cutting or silent deferral (it is coupled to the Defer-Last axis). A ledger of the shortcuts a minimal path takes is an optional aid to Defer-Last visibility.

**Origin.** The root of the idea is **YAGNI — "You Aren't Gonna Need It"** from Extreme Programming: Ron Jeffries, *"You're NOT gonna need it!"*, 4 April 1998. YAGNI is exactly step 1 of the cascade ("does this need to exist?"). A related line, not the root, is Jeff Atwood's *"The Best Code is No Code At All"* (2007) and R. P. Gabriel's *"Worse is Better"* (1989/91). The lens was prompted by the **Ponytail** plugin (motto *"the best code is the code you never wrote"*); it is adopted here as the lens, not as a tool.

## Two Channels, One Discipline

Questions reach the user through two channels, and **both carry the same discipline** defined above:

- **Memo questions** — the `### F{N}` blocks whose raw format is specified in [07-revisions-and-questions.md](/specification/revisions-and-questions/).
- **The interactive question tool** — a structured prompt presented directly in the session.

Whichever channel is used, each option is scored, the score is communicated, the recommendation comes from the holistic view, and every question still offers a "keep working" option (guardrail C2, [29-behavioral-guardrails.md](/specification/behavioral-guardrails/)). The channel is a delivery detail; the reasoning discipline is invariant across it.

## The Mental Model Biases the Recommendation

The recommendation a question carries is not formed in a vacuum: it is **biased by the User Mental Model** (see [41-mental-model.md](/specification/mental-model/)), the project-global portrait of how the developer tends to decide across the memo sequence. When an option set maps onto a known decision axis — minimal-first versus complete, work-in versus defer, sober versus narrative — the agent's recommendation tilts toward the developer's learned leaning, so the recommended option is more often the one the developer would have chosen anyway. This is the whole point of carrying a mental model forward: better recommendations, fewer rounds.

The coupling is strictly **advisory**. The mental model **does not enable auto-answering**. Knowing a tendency is not knowing the answer to *this* question, and the developer's right of decision is not delegable. A biased recommendation is still a recommendation attached to a question the developer answers; the questions stay essential and the developer decides. The model raises the quality of the recommendation; it never closes the question on the developer's behalf.

## AI-on-Behalf and the Answer-Split

The answered-questions record a memo carries is not a single undifferentiated list. It is **split by who answered**:

- **Answered by the developer** — the questions the developer decided directly. These are the canonical decision record, and the source the mental model is later derived from.
- **Answered by the AI on the developer's behalf** — questions the agent pre-answered, recorded explicitly as such so the provenance of each decision stays visible. An on-behalf answer is never disguised as a developer answer; the split is what keeps the record honest.

The agent MAY pre-answer on the developer's behalf **only above a high confidence bar** — the finalize guard. The bar exists because pre-answering is a delegation of the developer's decision right, and that delegation is only safe when the agent is highly confident the developer would have decided the same way (most often because a mental-model axis points strongly and consistently in one direction). **Below the bar, the question is not pre-answered — it is surfaced to the developer** as an open question. There is no silent middle ground: either the confidence clears the finalize guard and the on-behalf answer is recorded as on-behalf, or the question is shown. This is the mechanism that lets the agent pre-think more without ever quietly taking a decision that was the developer's to make.

## The Deterministic Question Format

The memo-question channel rendered incorrectly often enough to be a recurring defect, and the fix is to make the format deterministic rather than to keep patching a fragile parser.

### Why a Deterministic Block (the Phantom-Trap)

The legacy markdown parser locates options by scanning for an inline marker (`([A-H])[):.]`). That marker also matches harmless prose — an abbreviation like "z. B." or a metadata back-reference such as `(A)` in an answer line — so a **phantom option** is invented and the real option is lost. The marker scan cannot reliably tell a declaration from prose, which is why a parser fix alone is not enough.

### The questions-json Mandate

Questions MUST be authored as a **`questions-json` block** (the block's syntax and field schema are defined in [07-revisions-and-questions.md](/specification/revisions-and-questions/)). In that block, options are **JSON objects**, never recovered by an inline marker scan, so the phantom-trap is **structurally eliminated** rather than mitigated. When the block is present it is **authoritative** (07's authority rule); this chapter elevates that from "authoritative when present" to **required for questions** — the deterministic block is the canonical way to pose a question.

#### The Question-Object Fields

Each question object in the block is authored with **English** field names. These are the canonical names docs and authors use:

| Field | Type | Meaning |
|-------|------|---------|
| `id` | string | The question id, e.g. `F1` (1:1 with the `### F{N}` heading). |
| `title` | string | A short title shown next to the id. |
| `background` | string | One or two sentences that reconstruct the context. |
| `question` | string | The question itself, with all options spelled out. |
| `recommendation` | string | The agent's recommendation plus its one-line reasoning. |
| `type` | `single` \| `multi` | Single-choice or multiple-choice. |
| `options` | object[] | The real options, each `{ key, label, kind }`. |
| `preselected` | number[] | Optional explicit pre-selection by option index. |
| `answered` | boolean | Whether the question has been answered. |

The parser is **tolerant**: for back-compat it still accepts the legacy German field names — `frage` (for `question`), `hintergrund` (for `background`), `typ` (for `type`), and `aiRecommendation`/`ai_recommendation` (for `recommendation`). When both spellings are present on the same object the German name wins, so existing blocks keep parsing unchanged. New blocks SHOULD use the English names above. The `custom` ("reject") and `topic` ("skip via topic") options are injected by the parser and MUST NOT be authored as extra option rows.

### Interplay with the Question-Count Gate

The **question-count lint gate (MEMO-025)** applies to the **markdown-only** path: when a memo carries no `questions-json` block, every `### F{N}` heading MUST parse into exactly one question and vice versa, so a heading the parser silently misses is still caught.

When a `questions-json` block **is** present it is the single source (07's authority rule), and the count gate **does not** cross-check the `### F{N}` heading count against it. This is the single-source split defined in [07-revisions-and-questions.md](/specification/revisions-and-questions/): **open** questions live in the json block only — there is no hand-written `### F{N}` mirror, the human-readable form is generated by `renderQuestionsMarkdown` — while **answered** questions keep their `### F{N}` decision records (the `AI recommendation` vs `user decision` pair that [41-mental-model.md](/specification/mental-model/) reads). The two artefacts legitimately differ in count, so cross-checking them would misfire; the json is trusted instead. Authoring rule: **pose open questions only as `questions-json`, never as extra `### F{N}` headings.** What the renderer needs to draw a question as a card — including each option's `kind` ∈ `{option, custom, topic}` — is the one shared render contract; an invalid `kind` is rejected fail-loud at registration (MEMO-033), not silently dropped at the screen.

## Related

- [07-revisions-and-questions.md](/specification/revisions-and-questions/) — the raw `### F{N}` and `questions-json` format and the authority rule this chapter builds on.
- [21-human-computer-interaction.md](/specification/human-computer-interaction/) — where the user interacts with questions in the viewer; the canonical interaction model.
- [29-behavioral-guardrails.md](/specification/behavioral-guardrails/) — C2 (every question keeps a "keep working" option), C6 (verification before "done"), C7 (deferral is the user's decision); the hard guards the axes never override.
- [31-goals.md](/specification/goals/) — the holistic, intent-level view the recommendation is made from.
- [41-mental-model.md](/specification/mental-model/) — the User Mental Model that biases each recommendation (advisory, never a question-killer) and the source of the answered-by-developer record.
- [05-memo-strategies.md](/specification/memo-strategies/) — the memo strategy the question interface drives.
