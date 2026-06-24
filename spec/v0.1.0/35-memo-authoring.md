# 35. Memo Authoring

| Field | Value |
|-------|-------|
| Status | Draft |
| Depends on | [./06-memo-structure.md](./06-memo-structure.md), [./05-memo-strategies.md](./05-memo-strategies.md) |
| Related | [./30-primitives.md](./30-primitives.md), [./01-philosophy.md](./01-philosophy.md), [./10-proactive-research.md](./10-proactive-research.md), [./34-question-interface.md](./34-question-interface.md) |

Where [06-memo-structure.md](./06-memo-structure.md) defines the on-disk shape of a memo, this chapter defines how a memo is **written well**: what a memo is from the author's vantage, and the conventions that keep its content legible and cheap to maintain — when to reach for a table, when to stop hand-typing one and generate it from a data structure instead, and how large data is carried so it serves both the reader and the sub-agents the memo spawns. These conventions are deliberately small and lean toward determinism: a fixed format that a script can produce is better than prose a human re-types each revision.

## What a Memo Is

A memo is the unit of thinking-before-building: a numbered, local working document that captures the reasoning, decisions, open questions, and research behind a piece of work, and that outlives any single session. It is the highest authority over its own rollout (see [30-primitives.md](./30-primitives.md)) and the place where dictated reasoning and half-formed decisions are preserved verbatim without risk of exposure, because memo content is structurally local and never uploaded ([06-memo-structure.md](./06-memo-structure.md)).

Authoring a memo is therefore not note-taking but **structured argument**: each chapter states a concern, weighs the options behind it (the question interface, [34-question-interface.md](./34-question-interface.md)), and records the decision and its evidence. The strategy a memo follows — its type and the depth it warrants — is covered in [05-memo-strategies.md](./05-memo-strategies.md); this chapter assumes that frame and focuses on the mechanics of writing the content down.

## The Memo ID

Every memo carries a stable identifier from the moment it is authored, and that identifier follows the work down to the phase and PRD it later produces. Defining it here — at the point of authoring — keeps the definition next to the act that creates it; [17-git-workflow-and-ids.md](./17-git-workflow-and-ids.md) then specifies how the ID is *used* in commits, branches, and references. The canonical identifier for a work package is:

```
{CTX}-M{NNN}-{PP}-{RR}
```

| Segment | Meaning | Example |
|---------|---------|---------|
| `{CTX}` | Short project/context prefix (2–6 uppercase letters). Distinguishes memos from different projects or areas that share the same repo or search space. | `FMC`, `MEMO`, `WIKI` |
| `M` | Fixed memo marker | `M` |
| `{NNN}` | 3-digit memo number | `024` |
| `{PP}` | 2-digit phase number | `05` |
| `{RR}` | 2-digit PRD number within the phase | `02` |

The `{CTX}` prefix is **REQUIRED** when memos from more than one project can appear in the same search space (shared repository, shared issue tracker, or shared commit log). When a project runs in a fully isolated repository with no cross-project overlap, `{CTX}` **MAY** be omitted and the short form `M{NNN}-{PP}-{RR}` is used. A project **MUST** choose its prefix once and apply it consistently — mixing prefixed and unprefixed forms within one project is not permitted.

The ID addresses three reference levels:

| Level | Format | Example | Meaning |
|-------|--------|---------|---------|
| PRD (full) | `{CTX}-M{NNN}-{PP}-{RR}` | `FMC-M024-05-02` | FlowMCP memo 024, phase 5, PRD 2 |
| Phase | `{CTX}-M{NNN}-{PP}` | `FMC-M024-05` | FlowMCP memo 024, phase 5 |
| Memo | `{CTX}-M{NNN}` | `FMC-M024` | FlowMCP memo 024 |

The 3-digit memo number is the `{NNN}` segment; an old `P{N}` phase becomes `M{NNN}-{PP}` with a leading zero; an old `PRD-{NNN}` becomes the full `M{NNN}-{PP}-{RR}`. Addressing work by ID rather than by absolute path also reduces path exposure (see [16-git-security-versioning.md](./16-git-security-versioning.md)).

## Tables and Generated Data

Repetition in a memo's content has two thresholds, and crossing each one changes how the content is authored. The thresholds are deliberate, low, and meant to be applied without agonizing over the exact count.

### Use a Table at Five or More

When a set of like items reaches **five or more entries**, present it as a **Markdown table** rather than a run of prose or a long bullet list. A table makes the shared structure (the columns) explicit and the items comparable at a glance; below five, a list is lighter and a table is overhead. This is a presentation rule, not a data rule — the entries are still authored by hand.

### Generate at Eight or More — the Data Payload

When the set reaches **eight or more entries**, stop hand-typing the table. Instead, author the data **once as a structured payload** and render the table **from a script**, following the established pattern (a generator script that renders the table from a JSON dataset):

- The data lives as a **JSON dataset** in the memo's `context/` folder — one record per item, with named fields.
- A small **script** loads the JSON and renders the Markdown table deterministically, writing an output file that carries a header stating it is generated and **must not be hand-edited — the JSON is the source**.
- The payload is **revision-spanning**: it persists across revisions, so the table is re-rendered, never re-typed, when the data changes.

Two properties make this worth the small upfront cost. First, **determinism**: a script-rendered table cannot drift from its data the way a hand-typed one does, and re-rendering is free. Second, the same structured payload is the **seed for sub-agent spawn** — one record maps to one sub-agent's brief, so the dataset that produced the table also fans the work out (see [10-proactive-research.md](./10-proactive-research.md) and [36-agent-strategies.md](./36-agent-strategies.md)). Because research output is naturally a dataset, **research agents generate their tables this way by default**, regardless of the row count.

## Diagrams in Memos (Mermaid and Vega-Lite)

Diagrams are **first-class memo content**, not a special case. The viewer renders **every** fenced `mermaid` block to an SVG and **every** fenced `vega-lite` block to a chart — the dispatch is per code block, so there is no single fixed diagram slot. This capability is easy to under-use: a memo may carry **several diagrams, distributed** through the document, each placed next to the chapter it illustrates, rather than one diagram at a fixed position.

- **Mermaid** for structure and flow — the relationships between strands, the shape of a process, a state machine. The canonical interaction diagram in [21-human-computer-interaction.md](./21-human-computer-interaction.md) is the reference for style.
- **Vega-Lite** for quantitative and statistical charts — a fenced `vega-lite` block whose body is a Vega-Lite JSON spec. Use it when the point is a measurement, not a relationship.

**Portrait is mandatory.** Diagrams MUST be authored **portrait** — Mermaid flowcharts use `flowchart TD` (top-down), never landscape (`flowchart LR`) — so they fit the viewer's narrow reading column without horizontal scrolling. A wide left-to-right diagram is a defect, not a stylistic choice. When a graph is genuinely too wide, split it into several stacked top-down diagrams rather than turning it on its side.

For **which** diagram type to reach for — the leading "does a visual help a decision?" question and the intent→type matrix — see the diagram recommendations in [40-diagrams.md](./40-diagrams.md).

## Determinism and Spec-Chapter Conventions

A thread runs through every convention above: **prefer the deterministic form**. A fixed data payload, a `questions-json` block ([34-question-interface.md](./34-question-interface.md)), and a script-rendered table all share the property that a machine produces them the same way every time, so they cannot drift from their source and cost nothing to regenerate. The more of a memo's content that is deterministic rather than re-typed by hand, the less it decays — determinism is the default, and prose is reserved for the reasoning that genuinely needs a human voice.

The same discipline applies to **authoring a new specification chapter**: each one follows the established skeleton so a new chapter is "right on the first try" and consistent with the rest. The skeleton is:

- a numbered H1 title (`# NN. Title`);
- a metadata table directly under the title with **Status**, **Depends on**, and **Related** rows;
- **intro prose** between the metadata table and the first `## ` heading — a short, content-first orientation;
- a bottom **`## Related`** section linking the neighbouring chapters.

The intro-prose and `## Related` requirements are **machine-enforced** by the spec-quality gate (the idempotent lint that audits every numbered chapter), so a chapter that omits either one fails the gate rather than merely reading as inconsistent.

## Related

- [06-memo-structure.md](./06-memo-structure.md) — the on-disk shape of a memo that this chapter authors into.
- [05-memo-strategies.md](./05-memo-strategies.md) — the memo type and depth that frame the authoring effort.
- [30-primitives.md](./30-primitives.md) — the memo primitive and the concept map.
- [10-proactive-research.md](./10-proactive-research.md) — research output as the dataset behind generated tables.
- [34-question-interface.md](./34-question-interface.md) — the option-scoring discipline a memo's decisions follow.
- [40-diagrams.md](./40-diagrams.md) — diagram recommendations: the leading question and the intent→type matrix.
