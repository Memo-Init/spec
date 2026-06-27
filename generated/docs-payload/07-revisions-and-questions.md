---
title: "Revisions"
description: "A memo evolves through revisions, and each revision carries the strict handover surface from the AI to the downstream machinery. This chapter defines the three-area revision structure and the..."
spec_version: "0.1.0"
spec_file: "07-revisions-and-questions.md"
order: 7
section: "Specification"
normative: true
generated_at: "2026-06-27T01:35:51.713Z"
generated_from: "spec/v0.1.0/07-revisions-and-questions.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/07-revisions-and-questions.md."
---


A memo evolves through revisions, and each revision carries the strict handover surface from the AI to the downstream machinery. This chapter defines the three-area revision structure and the machine-readable question areas that make the AI-to-software handover normative.

## The Three-Area Revision Structure

A revision file (`REV-XX.md`) is organized into three areas. An implementation MUST produce all three.

1. **`## Preamble`** — what changed since the previous revision and what the reader should watch next. The preamble is the human-facing summary of the delta.
2. **Chapters** — the body of the memo, one `##`-level chapter per topic, each carrying its category tag.
3. **`## Open Questions` / `## Answered Questions`** — the machine-readable question areas. Open questions are the strict handover surface from the AI to the downstream machinery; answered questions record the decisions and where they were made.

The question areas are the **strict AI→software handover**: this is the defined transition from a human-readable revision to machine processing in the plan. Because they are parsed, their format is normative.

---

## The Valid Question Format

Each question is an H3 block. The format below is the one the viewer's question parser accepts; an implementation MUST author questions exactly this way.

```
### F{N} — Title

**Background:** background prose, one line.

**Question:** the question prose, one line.

**AI Recommendation:** the recommendation prose, one line.

**Type:** multi

A) first option
B) second option
C) third option
```

Normative rules:

- **Heading.** Each question MUST begin with `### F{N} — Title`. Heading matching is case-insensitive (`### F1`, `### f1`, `### F1 —` all parse identically), and the id is normalized.
- **Fields.** `**Background:**`, `**Question:**`, and `**AI Recommendation:**` are field lines, each on its own line, separated by blank lines.
- **Options are BARE lines.** Options MUST be written as bare lines `A)`, `B)`, `C)` — one discrete line per option. The parser also tolerates `A:`, `A.`, the loose parenthesized forms `(A)`, and an optional leading `Option ` prefix, but the bare `A) ...` discrete-line form is the canonical authoring shape.
- **Bold markers do NOT parse.** A bold marker `**A)**` does **not** parse as an option. This is a frequent authoring mistake; it produces a question that reaches the render gate with zero options.
- **No letter tokens in prose.** Bare letter tokens such as `DB.` or a stray `(A)` inside the `Background`/`Question` prose MUST be avoided. The parser strips metadata field lines before scanning, so back-references like `**User-Decision:** A — …` in answered questions do not become phantom options — but free-floating letter tokens in question prose can still mis-parse.
- **Type.** `**Type:** multi` marks a question whose options are independently selectable (multiple checkable options). Its absence means a single-choice question.

Answered questions are written as a single-line variant — `### F{N} — Title — **AI:** … **User:** … **Answered in:** REV-XX` — from which the parser strips the trailing meta to recover the bare title.

---

## The Strong-Validation Hybrid

The question handover uses a **hybrid**: a lenient human-readable markdown F-format alongside a deterministic, parse-safe JSON block. This design decouples human authoring flexibility from machine-authoritative correctness.

- **Lenient markdown F-format.** The `### F{N}` markdown described above is forgiving by design — it tolerates several option-marker variants so that imperfect authoring still parses where possible.
- **Deterministic `questions-json` block.** A fenced ```` ```questions-json ```` code block carries the questions as a JSON array of question objects. This block is parse-safe and deterministic.

```questions-json
[
  {
    "id": "F1",
    "title": "Example question",
    "background": "background",
    "question": "the question",
    "recommendation": "the recommendation",
    "type": "single",
    "options": [
      { "key": "A", "label": "first option", "kind": "option" },
      { "key": "B", "label": "second option", "kind": "option" }
    ],
    "answered": false
  }
]
```

Authority rule — **single source (open questions):** when a `questions-json` block is present, it is the **single authored source** for the open questions. The parser (`parseQuestionJsonBlock`) treats it as the source of truth, and the human-readable markdown is **generated** from it deterministically (`renderQuestionsMarkdown`) — it is **not** written by hand, so the two cannot drift and the whole render-vs-validate mismatch class disappears structurally. An open question therefore carries **no** `### F{N}` mirror; it lives in the json block only. A malformed block never crashes the parse path: it yields a not-found result with an error string that the validator translates into a validation code, rather than throwing. When no `questions-json` block exists, the lenient markdown parse applies.

Consequently the question-count cross-check (`MEMO-025`) applies only to the **markdown-only** path. When a json block is present it is authoritative and the heading count is not cross-checked against it — because **answered** questions keep their `### F{N}` records (the answered-pair below, read by [41-mental-model.md](/specification/mental-model/)) while **open** questions have no heading, so the two counts legitimately differ. What the renderer needs to draw a card — including each option's `kind` ∈ `{option, custom, topic}` — is one shared render contract; an invalid `kind` (e.g. `normal`) is rejected fail-loud when the revision is registered (`MEMO-033`), not silently dropped on the user's screen.

The JSON block delivers a machine-authoritative question set for the AI→software handover while keeping the markdown layer human-readable.

---

## Full-Revision vs. Update-Revision Modes

When generating or updating a revision, the implementation MUST choose between two authoring modes based on the scope of changes.

### Full-Revision Mode

The implementation MUST use Full-Revision mode when:

- The prior revision is structurally incomplete or requires significant restructuring.
- More than half of the existing chapter sections need substantive rewrites.
- A finalization gate requires a clean, self-contained document for review.
- The revision is the first in a new memo (no prior REV exists).

In Full-Revision mode, the implementation regenerates all chapter sections in their entirety. The resulting `REV-XX.md` is a complete, standalone document.

### Update-Revision Mode

The implementation MUST use Update-Revision mode when:

- The prior revision is structurally sound and only a bounded set of items changes.
- New questions must be appended without altering already-answered or stable sections.
- The dataset is large enough that full regeneration would produce an unwieldy document (practical threshold: when unchanged sections exceed 80% of the prior revision's content).

In Update-Revision mode, the implementation appends or replaces only the affected items. Unchanged sections, answered questions, and prior preamble content are carried forward verbatim or referenced by revision number rather than re-emitted.

### Decision Criteria Summary

| Signal | Mode |
|--------|------|
| First revision in memo | Full |
| Structural rework needed | Full |
| Finalization gate | Full |
| Bounded new questions only | Update |
| Large stable prior revision | Update |
| Appending to answered-questions log | Update |

The revision number increments regardless of mode. An Update-Revision's preamble MUST state which prior revision it builds on and summarize what was added or changed.

---

## Revisions Are Append-Only

A revision MUST NOT be edited in place. Each change produces a new `REV-XX.md` file. In-place edits have caused data loss in practice; the append-only rule is a guardrail against it. The revision number is zero-padded and two digits.

### Why Append-Only — Contaminated-Revision Rescue

Append-only is not only a safeguard against accidental overwrites; it is the infrastructure that makes a contaminated revision **recoverable**. A revision is written from a context, and a context degrades as it fills ([09-contamination-context-handover.md](/specification/contamination-context-handover/)). If the state at, say, REV-6 or REV-7 turns out to be written out of a degraded context, the rescue path is concrete and only possible because every prior state still exists on disk: read **all** revisions in order, analyze what is contaminated and what is sound, and write a complete, clean **REV-8** from a fresh context. The full history of states is the raw material for that clean rewrite.

A revision is **expensive** — it represents many tokens of reasoning. This is what makes a living-edit-of-a-single-file approach risky for this particular artifact. We respect that approach; it is a reasonable design in many settings, and the trade-off here is specific, not a verdict on it. The trade-off is this: when a single growing file is the only copy, a highly filled state (a file that has grown into the hundreds of thousands of tokens) is itself subject to context rot, and there is no earlier clean state to fall back to. On the private `.memo/` layer there is also no git history (the tree is structurally local and un-versioned, see [06-memo-structure.md](/specification/memo-structure/)), so an in-place corruption of that one file is total loss of **both** the memo and the tokens that went into it. Separate revision files give back exactly the fallback that git would otherwise provide.

Context is also driven up **from the outside**, not only by the memo's own growth. A research pass that drives a browser (for example Playwright) or sweeps many sources pours external material into the working context and fills it faster than the prose alone would. That is a second, independent reason to commit a new state as a **new revision** rather than mutating the current file in place: the next clean state should start from a deliberate, readable snapshot, not from a file that has absorbed an unbounded amount of external context.

---

## Scope May Grow Across Revisions

A memo's scope is allowed to **grow** while it is being revised. When the user adds a new request mid-revision — a topic, a fix, a whole extra part — that request is **taken into the same memo and worked through there**. It is never unilaterally exported into a follow-up memo, a sub-memo, or a "later" container.

The rule: **you have to accept what the memo demands — including what arrives in a revision.** The well-known "accept the multi-topic input, do not split it" instinct is anchored at the *initial* input ([01-philosophy.md](/specification/philosophy/), [05-memo-strategies.md](/specification/memo-strategies/)); this is its revision-time companion. Mechanically a revision is still append-only (a new `REV-XX.md`, never an in-place edit), and the added scope becomes new chapters and new `### F{N}` questions in that next revision. The only sanctioned way to split off work is an explicit user question (per C7, [29-behavioral-guardrails.md](/specification/behavioral-guardrails/)); absent that recorded decision the work stays in the current memo. Deferring a genuinely out-of-scope finding is likewise a parked research note in `context/`, not a follow-up memo (C8).

---

## The Answered-Question Pair

When a question is answered, the answered-questions area records more than the decision — it records the **pairing** of what the AI recommended against what the developer actually decided. This pairing is a first-class artefact, and its on-disk format is two literal field lines:

```
**AI-Empfehlung war:** <the recommendation the AI had made>
**User-Entscheidung:** <the decision the developer actually took>
```

The two German labels `**AI-Empfehlung war:**` and `**User-Entscheidung:**` are the literal artefact format — they are written verbatim, in exactly this form, as the answered-question pair. The value on the first line is the AI's prior recommendation; the value on the second line is the developer's actual choice, which may agree with the recommendation or overrule it.

The pairing is what makes a memo's answered questions more than a decision log. Read across many memos, the accumulated `AI-Empfehlung war` ↔ `User-Entscheidung` pairs are the raw material from which a cross-memo preference model is later derived — the systematic record of where the developer tends to follow the AI and where they tend to overrule it. A bare decision without its paired recommendation cannot feed that model; the pairing is the point. The downstream model that consumes these pairs is defined in its own chapter ([41-mental-model.md](/specification/mental-model/)).

---

## The Revision-Prepare Artefact

Before each revision is written, a preparation and reflection file `REV-{NN}-prepare.md` is produced. It is a **first-class artefact, not scratch** — it is written deliberately, kept on disk, and stands as the record of how the upcoming revision was planned.

The prepare file documents three things:

- **The interpretation of the feedback.** How the agent understood the user's feedback for this revision — restated in the agent's own words so that the interpretation itself is on the record and can be checked against what the user meant.
- **The planned per-chapter changes.** Which chapters will change and how, laid out before any revision content is written, so the revision is executed against a plan rather than improvised.
- **Any revision blockers.** Open obstacles that would prevent a clean revision — missing information, an unresolved contradiction, a decision the agent cannot make autonomously. A recorded blocker is the signal to pause and ask rather than to write a revision on a shaky basis.

Because the prepare file exists before the `REV-XX.md` it plans, the revision becomes a deliberate execution of a documented intention rather than a single uninterrupted generation.

---

## The Feedback-Coverage Gate

After a revision is written, a **mandatory check** verifies that **every** feedback point the user raised was actually incorporated. The gate compares the recorded feedback (from the prepare artefact above) against the revision that was produced and confirms each point is addressed.

The gate is **auto-iterating within a bound**: if it finds feedback points that were missed, it does not immediately escalate — it revises again to close the gap, up to a bounded number of attempts. Only when the bound is exhausted and gaps remain does it stop auto-iterating and **ask the user**. This keeps the common case — a point or two slipped through — self-correcting without a round-trip, while still surfacing a genuinely stuck revision to the developer rather than silently shipping an incomplete one.

---

## Related

- [04-input-pipeline.md](/specification/input-pipeline/) — input processing that runs before each revision is generated.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — context rot and contamination; the fresh-context rewrite that append-only history makes possible.
- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — the gate that requires the open-questions area to be empty.
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the authoring skills that implement the question format.
- [34-question-interface.md](/specification/question-interface/) — the scoring discipline and the `questions-json` mandate that builds on this format.
- [41-mental-model.md](/specification/mental-model/) — the cross-memo preference model derived from the answered-question pairs.
