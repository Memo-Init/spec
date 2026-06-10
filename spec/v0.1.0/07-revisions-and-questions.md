# 07. Revisions & the Question Format

| | |
|---|---|
| Status | Draft |
| Depends on | [06-memo-structure.md](./06-memo-structure.md) |
| Related | [04-input-pipeline.md](./04-input-pipeline.md), [11-quality-and-finalization.md](./11-quality-and-finalization.md), [14-agents-skills-tasks.md](./14-agents-skills-tasks.md) |

> **Normative.** Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](./00-overview.md) (Conformance).

---

## The Three-Area Revision Structure

A revision file (`REV-XX.md`) is organized into three areas. An implementation MUST produce all three.

1. **`## Vorwort` (preamble)** — what changed since the previous revision and what the reader should watch next. The preamble is the human-facing summary of the delta.
2. **Chapters** — the body of the memo, one `##`-level chapter per topic, each carrying its category tag.
3. **`## Offene Fragen` / `## Beantwortete Fragen` (open / answered questions)** — the machine-readable question areas. Open questions are the strict handover surface from the AI to the downstream machinery; answered questions record the decisions and where they were made.

The question areas are the **strict AI→software handover**: this is the defined transition from a human-readable revision to machine processing in the plan. Because they are parsed, their format is normative.

---

## The Valid Question Format

Each question is an H3 block. The format below is the one the viewer's question parser accepts; an implementation MUST author questions exactly this way.

```
### F{N} — Title

**Hintergrund:** background prose, one line.

**Frage:** the question prose, one line.

**AI-Empfehlung:** the recommendation prose, one line.

**Typ:** multi

A) first option
B) second option
C) third option
```

Normative rules:

- **Heading.** Each question MUST begin with `### F{N} — Title`. Heading matching is case-insensitive (`### F1`, `### f1`, `### F1 —` all parse identically), and the id is normalized.
- **Fields.** `**Hintergrund:**`, `**Frage:**`, and `**AI-Empfehlung:**` are field lines, each on its own line, separated by blank lines.
- **Options are BARE lines.** Options MUST be written as bare lines `A)`, `B)`, `C)` — one discrete line per option. The parser also tolerates `A:`, `A.`, the loose parenthesized forms `(A)`, and an optional leading `Option ` prefix, but the bare `A) ...` discrete-line form is the canonical authoring shape.
- **Bold markers do NOT parse.** A bold marker `**A)**` does **not** parse as an option. This is a frequent authoring mistake; it produces a question that reaches the render gate with zero options.
- **No letter tokens in prose.** Bare letter tokens such as `DB.` or a stray `(A)` inside the `Hintergrund`/`Frage` prose MUST be avoided. The parser strips metadata field lines before scanning, so back-references like `**User-Entscheidung:** A — …` in answered questions do not become phantom options — but free-floating letter tokens in question prose can still mis-parse.
- **Type.** `**Typ:** multi` marks a question whose options are independently selectable (multiple checkable options). Its absence means a single-choice question.

Answered questions are written as a single-line variant — `### F{N} — Title — **AI:** … **User:** … **Beantwortet in:** REV-XX` — from which the parser strips the trailing meta to recover the bare title.

---

## The Recurring Mis-Format Is an Authoring Error, Not a Viewer Bug

It is a verified clarification that the recurring failure to format questions correctly is **not** a memo-viewer bug. The viewer's parser is correct. The failure is a **recurring LLM authoring error** — an estimated validity rate of roughly 40–60 percent (an *estimate*, not a measurement), most likely because the exact format is incompletely captured in the authoring skills. The characteristic breakers are bold option markers `**A)**` and stray letter tokens (`DB.`) in the prose.

The remedy has two parts:

1. **Fix the authoring skills** so the exact format is fully specified at the point of authoring. This is **specified-but-not-yet-implemented**: the specification fixes the format here; correcting the authoring skills is follow-up work.
2. **Strong validation via a hybrid** (see next section).

---

## The Strong-Validation Hybrid

To make the handover robust against the authoring error, the question handover uses a **hybrid**: a lenient human-readable markdown F-format alongside a deterministic, parse-safe JSON block.

- **Lenient markdown F-format.** The `### F{N}` markdown described above is forgiving by design — it tolerates several option-marker variants so that imperfect authoring still parses where possible.
- **Deterministic `questions-json` block.** A fenced ```` ```questions-json ```` code block carries the questions as a JSON array of question objects. This block is parse-safe and deterministic.

```questions-json
[
  {
    "id": "F1",
    "title": "Example question",
    "hintergrund": "background",
    "frage": "the question",
    "aiRecommendation": "the recommendation",
    "typ": "single",
    "options": [
      { "key": "A", "label": "first option", "kind": "option" },
      { "key": "B", "label": "second option", "kind": "option" }
    ],
    "answered": false
  }
]
```

Authority rule: **when a `questions-json` block is present, it is authoritative.** The parser (`parseQuestionJsonBlock`) treats it as the source of truth, and the human-readable markdown is rendered from it deterministically (`renderQuestionsMarkdown`), so the two cannot drift. A malformed block never crashes the parse path: it yields a not-found result with an error string that the validator can translate into a validation code, rather than throwing. When no `questions-json` block exists, the lenient markdown parse applies.

This hybrid is the strong validation: authoring may remain forgiving in markdown, but a memo that carries the JSON block gets a deterministic, machine-authoritative question set for the AI→software handover.

---

## Revisions Are Append-Only

A revision MUST NOT be edited in place. Each change produces a new `REV-XX.md` file. In-place edits have caused data loss in practice; the append-only rule is a guardrail against it. The revision number is zero-padded and two digits.

---

## Related

- [04-input-pipeline.md](./04-input-pipeline.md) — input processing that runs before each revision is generated.
- [11-quality-and-finalization.md](./11-quality-and-finalization.md) — the gate that requires the open-questions area to be empty.
- [14-agents-skills-tasks.md](./14-agents-skills-tasks.md) — the authoring skills that the format fix targets.
