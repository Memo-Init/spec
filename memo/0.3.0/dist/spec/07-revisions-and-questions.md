---
title: "Revisions"
description: "A memo evolves through revisions, and each revision carries the strict handover surface from the AI to the downstream machinery. This chapter defines the three-area revision structure and the..."
spec_version: "0.3.0"
spec_file: "07-revisions-and-questions.md"
order: 7
section: "Specification"
normative: true
generated_at: "2026-09-14T10:03:05.162Z"
generated_from: "memo/0.3.0/draft/spec/07-revisions-and-questions.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.3.0/draft/spec/07-revisions-and-questions.md."
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

Consequently the question-count cross-check (`MEMO-025`) applies only to the **markdown-only** path. When a json block is present it is authoritative and the heading count is not cross-checked against it — because **answered** questions keep their `### F{N}` records (the answered-pair below, read by [41-mental-model.md](/specification/mental-model/)) while **open** questions have no heading, so the two counts legitimately differ. What the renderer needs to draw a card — including each option's `kind` ∈ `{option, custom, topic, reframe, reoption}` — is one shared render contract; an invalid `kind` (e.g. `normal`) is rejected fail-loud when the revision is registered (`MEMO-033`), not silently dropped on the user's screen.

The JSON block delivers a machine-authoritative question set for the AI→software handover while keeping the markdown layer human-readable.

---

## Revision Authoring Mode

There is one authoring mode. Every revision regenerates all chapter sections in their entirety; the resulting `REV-XX.md` is a complete, standalone document.

> A revision MUST carry its whole content itself. Unchanged sections, answered questions and prior preamble content are carried forward **verbatim**. Content MUST NOT be replaced by a reference to an earlier revision. Naming an earlier revision as a **data object** — provenance, a measurement, a count — remains allowed.

The rule that a reference may replace content is the normative root of a measured loss: in the revision that exercised it, the `User-Auftrag` blocks fell from 18 to 1 and the evidence markers from 76 to 33, while the line diff stayed green. See [20-flow-full-vs-update-revisions.md](/specification/flow-full-vs-update-revisions/) for the completeness duty and its three enforcement stages.

### The Update-Revision Form Is Stock

Earlier loops also produced `REV-XX-update.md` files, which appended or replaced only the affected items. That form is **read, not written**: the existing files stay in place unchanged and are validated against their own schema, and no new one is produced.

### Open Questions Carry Forward in Full

An Update-Revision appends or replaces *chapter* content, but it MUST NOT thin out the open-question set. Every revision — Full **and** Update — MUST carry the **complete set of still-open questions** in its `questions-json` block, not merely the questions that are new since the prior revision. An open question leaves the set by exactly one path: it is **answered** and moves to the `## Answered Questions` records. It MUST NOT leave the set by silent omission. Carrying only the delta breaks continuity — a downstream reader (and the viewer, which renders the current revision's block) sees a shrunken set and the earlier open questions become invisible even though no decision was recorded for them.

Because the current block is thus always complete, the viewer keeps rendering "the newest block" and is correct. A **non-blocking viewer-lint (`WARN-010`)** guards the rule: when a revision's open-question set shrinks relative to its predecessor **without** a matching gain in answered questions, the shrink is unaccounted for and the viewer surfaces a warning. The lint never blocks; it makes a broken carry-forward visible rather than letting open questions vanish quietly.

There is no mode choice left to make, so there is no decision table. The revision number increments with every revision, and each revision's preamble MUST state which prior revision it builds on and summarize what was added or changed.

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

The rule: **you have to accept what the memo demands — including what arrives in a revision.** The well-known "accept the multi-topic input, do not split it" instinct is anchored at the *initial* input ([01-philosophy.md](/specification/philosophy/), [05-memo-strategies.md](/specification/memo-strategies/)); this is its revision-time companion. Mechanically a revision is still append-only (a new `REV-XX.md`, never an in-place edit), and the added scope becomes new chapters and new `### F{N}` questions in that next revision. The only sanctioned way to split off work is an explicit user question (per C7, [29-behavioral-guardrails.md](/specification/behavioral-guardrails/)); absent that recorded decision the work stays in the current memo. Deferring a genuinely out-of-scope finding is likewise a parked research note in the memo's `context/` (memo-scoped), not a follow-up memo (C8).

---

## The Question Lifecycle

A memo's question stock grows over time. Questions get answered, some turn out to be irrelevant, some are superseded by a better-put question, some are re-formulated, and some are re-opened because the answer did not hold. Six things can happen to a question; a status axis that knows only "open" and "answered" can express two of them, and the other four then live in prose or not at all.

The lifecycle is therefore **data**, on two carriers.

### Status Is a Closed List of Four

A question's status MUST be one of exactly four values:

| Status | Meaning |
|--------|---------|
| `open` | The question stands and is waiting for a decision. |
| `answered` | A decision was taken and is recorded as the answered-question pair below. |
| `irrelevant` | The question stopped counting without ever being decided. |
| `replaced` | A different question supersedes it; the edge to the successor is recorded. |

A value outside this list MUST be rejected fail-loud when it is written — never normalized to a neighbouring value, because a normalized typo silently changes what a question means.

**`reframed` is NOT a status.** A re-formulated question keeps its `F{N}` id and stays `open`; only its wording changes. It is therefore recorded as an *event* (below), and the discarded wording is preserved there. Giving it a status of its own would mean every widget filter, every count and the blocker gate needed an exception for a question that is, in fact, simply still open.

**`reoptioned` is not a status either.** The second re-formulation — the one that re-writes the **answer options** rather than the question — leaves the question just as `open`, under the same `F{N}` id, and is recorded as its own event with the discarded option set. The two are kept apart because they preserve different data and are gated differently, not because they sit at different points of the lifecycle.

### Retirement Demands a Reason

`irrelevant` and `replaced` are the two states that take a question out of the active stock. Both MUST carry a non-empty reason, and the write MUST be refused when it is missing. There is no default reason and no silent retirement: a question that stops counting without a stated "why" is indistinguishable from a question that was quietly deleted, and deleting questions is exactly what this lifecycle exists to prevent.

`replaced` additionally MUST name its successor as an **edge** — the id of the question that supersedes it, and that id MUST resolve to a question of the same memo. Recorded as data rather than as prose, the genealogy of a question stays navigable backwards.

### Every Transition Leaves an Event

Beside the question itself an **appending event journal** records the transitions. It only ever grows: no row is updated and no row is deleted, which is what lets it survive a re-projection that rewrites the question stock wholesale.

Seven event kinds are defined, one per thing that can happen: `asked`, `answered`, `reframed`, `replaced`, `irrelevant`, `reopened`, `reoptioned`. Each event records the status it came from, the status it went to, and — for `replaced`, `irrelevant`, `reopened` and `reoptioned` — a non-empty reason. A `reframed` event carries the **discarded wording** of the question, and a `reoptioned` event the **discarded option set**, preserved verbatim including each option's `kind` — so neither kind of re-formulation destroys what stood before it.

`reopened` is the transition that the two-value axis could not express at all: an answer that did not hold takes the question back to `open`, with the reason on the record rather than in somebody's memory.

`reoptioned` is the event for the fault that has no status at all: the question stands, and its **answer options** go past the decision. Its write is **gated** — the question wording MUST be unchanged (re-writing the question under the cover of new options is a `reframed` event), the option set MUST really differ (a re-formulation that changes nothing is refused, not journalled as a no-op), the new set MUST retain at least two real `option` rows, and no option may be written in the `- **A:**` form instead of a discrete `A) text` line. The gate refuses fail-loud; it never records a doubtful row.

### Nothing Is Deleted

The rule these carriers serve is one sentence: **a question never disappears from the stock.** It changes status and leaves an event with a reason. A stock that shrinks without a matching event is a loss, not a cleanup — the same principle the carry-forward-in-full rule above applies to the open set.

---

## Deferred Questions

Retired questions — `irrelevant` and `replaced` — are rendered in a section of their own, `## Deferred Questions`, **beside** the answered-questions area and never inside it. Two reasons, and both are structural rather than cosmetic:

- The answered area is the **decision record** the cross-memo preference model reads. A question that was retired was never decided; folding it in would put a non-decision into the record the model learns from.
- The alternative form — striking the question through in the open list — carries **no reason**. Styling cannot state why something stopped counting, and the reason is the whole point of a retirement.

Each entry states its **mark** (`irrelevant`, or `replaced by F{N}` when the edge resolves) and its **reason**, each on a line of its own. The section is **conditional**: with an empty retired stock it is omitted entirely, with no heading and no placeholder body — an empty section would claim a stock that does not exist.

A retired question also leaves the interactive surface: it gets no answer widget and no pre-fill row, and the question counter reports it as its own third figure rather than letting it vanish out of "open". Count and parse must agree; a question that leaves one figure without entering another is a silent difference.

---

## The Answered-Question Pair

When a question is answered, the answered-questions area records more than the decision — it records the **pairing** of what the AI recommended against what the developer actually decided. This pairing is a first-class artefact, and its on-disk format is two literal field lines:

```
**AI-Empfehlung war:** <the recommendation the AI had made>
**User-Entscheidung:** <the decision the developer actually took>
```

The two German labels `**AI-Empfehlung war:**` and `**User-Entscheidung:**` are the literal artefact format — they are written verbatim, in exactly this form, as the answered-question pair. The value on the first line is the AI's prior recommendation; the value on the second line is the developer's actual choice, which may agree with the recommendation or overrule it.

Two further field lines are **optional and are written only when they carry something**: `**Beantwortet in:**` names the revision the decision fell in, and `**Anmerkung:**` carries the remark that belongs to it. An unfilled field produces **no line at all** — a label over an empty value states a datum that does not exist. Together with the pair they are the decision's context; without them the record shrinks to the bare pair and a reader can no longer tell when, or under which caveat, the decision was taken.

The answered area is additionally **split by the provenance of the answer** into two H3 subsections — `### Vom User beantwortet` and `### Von der KI im Namen des Users beantwortet`. Every `### F{N}` block inherits the provenance of the nearest preceding subsection heading; without a split every block reads as answered by the developer. A subsection is written **only when it holds at least one question**, so an empty heading never claims a group that does not exist. The split is what keeps the on-behalf barrier of the finalization gate effective ([34-question-interface.md](/specification/question-interface/)): an answer the agent gave in the developer's name MUST be recognizable as such after the roundtrip through the file, or the barrier has nothing to bite on.

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

## Conformity Requirements

The revision and question-format rules above are authored **prose-first** as declarative requirements (the prose-first guard, [35-memo-authoring.md](/specification/memo-authoring/) and [23-requirements.md](/specification/requirements/)): each rule's `statement` faces generation and its `check` faces the finalization/push gate, resolving to a ternary `PASS` / `BLOCKED` / `INCONCLUSIVE`. The blocks below are the machine-readable source the requirement store is **harvested** from. The lifts here are the parse-and-structure rules — a section being present, a question parsing, a file never overwritten — each a hard rule with a `binary` grade.

```requirement
{
  "id": "REQ-1015",
  "title": "A retired question states its reason and its edge",
  "statement": "A question's status MUST be one of the four values `open`, `answered`, `irrelevant`, `replaced`; any other value MUST be refused fail-loud and MUST NOT be normalized. `irrelevant` and `replaced` MUST carry a non-empty reason, and `replaced` MUST additionally name a successor question id that resolves within the same memo. Every transition MUST append exactly one event row (`asked`, `answered`, `reframed`, `replaced`, `irrelevant`, `reopened`, `reoptioned`), a `reframed` event MUST preserve the discarded wording and a `reoptioned` event MUST preserve the discarded option set together with a non-empty reason. A `reoptioned` write MUST be refused when the question wording changed, when the option set did not change, or when fewer than two real `option` rows remain. No question row is ever deleted. `reframed` and `reoptioned` are events, not statuses: a re-formulated question keeps its id and stays `open`.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["revisions", "question-lifecycle"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A status outside {open, answered, irrelevant, replaced} is refused with a naming error",
      "A status of irrelevant or replaced without a reason is refused",
      "A status of replaced without a successor id that resolves in the same memo is refused",
      "Every status transition appends exactly one event row carrying from-status and to-status",
      "A reframed event preserves the previous question wording and leaves the status at open",
      "A reoptioned event preserves the discarded option set with its reason, leaves the status at open, and is refused when the wording changed or the option set did not"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-820",
  "title": "Mandatory revision areas are present",
  "statement": "A revision file (`REV-XX.md`) MUST contain all three structural areas — the `## Preamble`, the tagged chapter body, and the machine-readable `## Open Questions` / `## Answered Questions` areas — and the first revision MUST carry every mandatory section even when empty. The question areas are the strict AI-to-software handover and are parsed, so their presence is structural, not optional.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["revisions", "memo-structure"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "REV-XX.md contains a Preamble area, a tagged chapter body, and Open/Answered Questions areas",
      "REV-01 carries every mandatory section even when the section is empty"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-821",
  "title": "Open questions are authored in the parsable F-format",
  "statement": "Each open question MUST be authored in the parsable question format: an `### F{N} — Title` H3 block with `Background`, `Question`, and `AI Recommendation` field lines, and options written as bare discrete lines (`A)`, `B)`, …). A bold option marker (`**A)**`) does NOT parse and MUST NOT be used, and free-floating bare letter tokens in question prose MUST be avoided, since either produces a question that reaches the render gate with zero options.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["revisions", "question-format"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "memo-view",
    "tactic": "question-format-parse",
    "verify": [
      "Parse the revision's question area with the viewer's question parser",
      "Assert every authored question yields a non-empty option set"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-822",
  "title": "questions-json is the single authored source for open questions",
  "statement": "When a `questions-json` block is present it is the single authored source for the open questions: the human-readable markdown is generated from it deterministically and is not hand-written, so the two cannot drift. An open question therefore carries no `### F{N}` mirror — it lives in the json block only — and each option's `kind` MUST be one of the shared render-contract values; an invalid `kind` is rejected fail-loud when the revision is registered, never silently dropped on the reader's screen.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["revisions", "question-format", "questions-json"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "memo-view",
    "tactic": "questions-json-authority",
    "verify": [
      "When a questions-json block exists, confirm the markdown question area is generated from it and not independently authored",
      "Assert an option with an invalid kind is rejected at revision registration rather than silently dropped"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-823",
  "title": "Revisions are append-only",
  "statement": "A revision MUST NOT be edited in place: every change produces a new `REV-XX.md`, zero-padded two digits, no suffix, standalone — and the first revision MUST be `REV-01.md`. The historical `REV-XX-update.md` form stays readable stock and is never written again, never converted and never removed. An existing revision file is never overwritten; the full on-disk history of states is what makes a contaminated revision recoverable by a clean fresh-context rewrite.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["revisions", "append-only"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No existing revision file is modified in place; each change adds a new REV-XX.md",
      "No new REV-XX-update.md is written; the existing update files stay unchanged",
      "The first revision is REV-01.md with no suffix"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-824",
  "title": "A revision-prepare artefact precedes every revision",
  "statement": "Before each revision is written, a preparation file `REV-{NN}-prepare.md` MUST be produced as a first-class on-disk artefact documenting the agent's interpretation of the feedback, the planned per-chapter changes, and any revision blockers. The prepare file exists before the `REV-XX.md` it plans, so the revision is a deliberate execution of a documented intention rather than an improvised generation.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["revisions", "revision-prepare"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "For each revision REV-XX.md a corresponding REV-XX-prepare.md exists on disk",
      "The prepare file records the feedback interpretation, the planned per-chapter changes, and any blockers"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [04-input-pipeline.md](/specification/input-pipeline/) — input processing that runs before each revision is generated.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — context rot and contamination; the fresh-context rewrite that append-only history makes possible.
- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — the gate that requires the open-questions area to be empty.
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the authoring skills that implement the question format.
- [34-question-interface.md](/specification/question-interface/) — the scoring discipline and the `questions-json` mandate that builds on this format.
- [41-mental-model.md](/specification/mental-model/) — the cross-memo preference model derived from the answered-question pairs.
