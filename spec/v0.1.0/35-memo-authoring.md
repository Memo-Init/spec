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

## Tables and Generated Data

Repetition in a memo's content has two thresholds, and crossing each one changes how the content is authored. The thresholds are deliberate, low, and meant to be applied without agonizing over the exact count.

### Use a Table at Five or More

When a set of like items reaches **five or more entries**, present it as a **Markdown table** rather than a run of prose or a long bullet list. A table makes the shared structure (the columns) explicit and the items comparable at a glance; below five, a list is lighter and a table is overhead. This is a presentation rule, not a data rule — the entries are still authored by hand.

### Generate at Eight or More — the Data Payload

When the set reaches **eight or more entries**, stop hand-typing the table. Instead, author the data **once as a structured payload** and render the table **from a script**, following the established pattern (prior art: Memo 031's `generate-tables.py`):

- The data lives as a **JSON dataset** in the memo's `context/` folder — one record per item, with named fields.
- A small **script** loads the JSON and renders the Markdown table deterministically, writing an output file that carries a header stating it is generated and **must not be hand-edited — the JSON is the source**.
- The payload is **revision-spanning**: it persists across revisions, so the table is re-rendered, never re-typed, when the data changes.

Two properties make this worth the small upfront cost. First, **determinism**: a script-rendered table cannot drift from its data the way a hand-typed one does, and re-rendering is free. Second, the same structured payload is the **seed for sub-agent spawn** — one record maps to one sub-agent's brief, so the dataset that produced the table also fans the work out (see [10-proactive-research.md](./10-proactive-research.md) and [36-agent-research-strategies.md](./36-agent-research-strategies.md)). Because research output is naturally a dataset, **research agents generate their tables this way by default**, regardless of the row count.

## Related

- [06-memo-structure.md](./06-memo-structure.md) — the on-disk shape of a memo that this chapter authors into.
- [05-memo-strategies.md](./05-memo-strategies.md) — the memo type and depth that frame the authoring effort.
- [30-primitives.md](./30-primitives.md) — the memo primitive and the concept map.
- [10-proactive-research.md](./10-proactive-research.md) — research output as the dataset behind generated tables.
- [34-question-interface.md](./34-question-interface.md) — the option-scoring discipline a memo's decisions follow.
