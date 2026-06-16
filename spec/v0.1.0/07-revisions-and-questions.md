# 07. Revisions

| | |
|---|---|
| Status | Draft |
| Depends on | [06-memo-structure.md](./06-memo-structure.md) |
| Related | [04-input-pipeline.md](./04-input-pipeline.md), [11-quality-and-finalization.md](./11-quality-and-finalization.md), [14-agents-skills-tasks.md](./14-agents-skills-tasks.md) |

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
    "aiRecommendation": "the recommendation",
    "type": "single",
    "options": [
      { "key": "A", "label": "first option", "kind": "option" },
      { "key": "B", "label": "second option", "kind": "option" }
    ],
    "answered": false
  }
]
```

Authority rule: **when a `questions-json` block is present, it is authoritative.** The parser (`parseQuestionJsonBlock`) treats it as the source of truth, and the human-readable markdown is rendered from it deterministically (`renderQuestionsMarkdown`), so the two cannot drift. A malformed block never crashes the parse path: it yields a not-found result with an error string that the validator can translate into a validation code, rather than throwing. When no `questions-json` block exists, the lenient markdown parse applies.

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

---

## Related

- [04-input-pipeline.md](./04-input-pipeline.md) — input processing that runs before each revision is generated.
- [11-quality-and-finalization.md](./11-quality-and-finalization.md) — the gate that requires the open-questions area to be empty.
- [14-agents-skills-tasks.md](./14-agents-skills-tasks.md) — the authoring skills that implement the question format.
