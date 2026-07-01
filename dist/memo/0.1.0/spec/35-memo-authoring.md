---
title: "Memo Authoring"
description: "Where [06-memo-structure.md](./06-memo-structure.md) defines the on-disk shape of a memo, this chapter defines how a memo is **written well**: what a memo is from the author's vantage, and the..."
spec_version: "0.1.0"
spec_file: "35-memo-authoring.md"
order: 35
section: "Specification"
normative: true
generated_at: "2026-07-01T03:52:15.369Z"
generated_from: "draft/memo/0.1.0/spec/35-memo-authoring.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/35-memo-authoring.md."
---


Where [06-memo-structure.md](/specification/memo-structure/) defines the on-disk shape of a memo, this chapter defines how a memo is **written well**: what a memo is from the author's vantage, and the conventions that keep its content legible and cheap to maintain — when to reach for a table, when to stop hand-typing one and generate it from a data structure instead, and how large data is carried so it serves both the reader and the sub-agents the memo spawns. These conventions are deliberately small and lean toward determinism: a fixed format that a script can produce is better than prose a human re-types each revision.

## What a Memo Is

A memo is the unit of thinking-before-building: a numbered, local working document that captures the reasoning, decisions, open questions, and research behind a piece of work, and that outlives any single session. It is the highest authority over its own rollout (see [30-primitives.md](/specification/primitives/)) and the place where dictated reasoning and half-formed decisions are preserved verbatim without risk of exposure, because memo content is structurally local and never uploaded ([06-memo-structure.md](/specification/memo-structure/)).

Authoring a memo is therefore not note-taking but **structured argument**: each chapter states a concern, weighs the options behind it (the question interface, [34-question-interface.md](/specification/question-interface/)), and records the decision and its evidence. The strategy a memo follows — its type and the depth it warrants — is covered in [05-memo-strategies.md](/specification/memo-strategies/); this chapter assumes that frame and focuses on the mechanics of writing the content down.

## The Memo ID

Every memo carries a stable identifier from the moment it is authored, and that identifier follows the work down to the phase and PRD it later produces. Defining it here — at the point of authoring — keeps the definition next to the act that creates it; [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/) then specifies how the ID is *used* in commits, branches, and references. The canonical identifier for a work package is:

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

The 3-digit memo number is the `{NNN}` segment; an old `P{N}` phase becomes `M{NNN}-{PP}` with a leading zero; an old `PRD-{NNN}` becomes the full `M{NNN}-{PP}-{RR}`. Addressing work by ID rather than by absolute path also reduces path exposure (see [16-git-security-versioning.md](/specification/git-security-versioning/)).

## Tables and Generated Data

Repetition in a memo's content has two thresholds, and crossing each one changes how the content is authored. The thresholds are deliberate, low, and meant to be applied without agonizing over the exact count.

### Use a Table at Five or More

When a set of like items reaches **five or more entries**, present it as a **Markdown table** rather than a run of prose or a long bullet list. A table makes the shared structure (the columns) explicit and the items comparable at a glance; below five, a list is lighter and a table is overhead. This is a presentation rule, not a data rule — the entries are still authored by hand.

### Generate at Eight or More — the Data Payload

When the set reaches **eight or more entries**, stop hand-typing the table. Instead, author the data **once as a structured payload** and render the table **from a script**, following the established pattern (a generator script that renders the table from a JSON dataset):

- The data lives as a **JSON dataset** in the memo's `context/` folder — one record per item, with named fields.
- A small **script** loads the JSON and renders the Markdown table deterministically, writing an output file that carries a header stating it is generated and **must not be hand-edited — the JSON is the source**.
- The payload is **revision-spanning**: it persists across revisions, so the table is re-rendered, never re-typed, when the data changes.
- When the dataset is the **evidence a block argues from**, register it on that block as a `tables` entry with a **block-local handle** (`B001.D1`) rather than only as a loose file: the block then carries the data alongside the prose it supports, and the revision's table is snapshotted from the block payload (see the Block primitive in [30-primitives.md](/specification/primitives/)).

Two properties make this worth the small upfront cost. First, **determinism**: a script-rendered table cannot drift from its data the way a hand-typed one does, and re-rendering is free. Second, the same structured payload is the **seed for sub-agent spawn** — one record maps to one sub-agent's brief, so the dataset that produced the table also fans the work out (see [10-proactive-research.md](/specification/proactive-research/) and [36-agent-strategies.md](/specification/agent-strategies/)). Because research output is naturally a dataset, **research agents generate their tables this way by default**, regardless of the row count.

## Diagrams in Memos (Mermaid and Vega-Lite)

Diagrams are **first-class memo content**, not a special case. The viewer renders **every** fenced `mermaid` block to an SVG and **every** fenced `vega-lite` block to a chart — the dispatch is per code block, so there is no single fixed diagram slot. This capability is easy to under-use: a memo may carry **several diagrams, distributed** through the document, each placed next to the chapter it illustrates, rather than one diagram at a fixed position.

- **Mermaid** for structure and flow — the relationships between strands, the shape of a process, a state machine. The canonical interaction diagram in [21-human-computer-interaction.md](/specification/human-computer-interaction/) is the reference for style.
- **Vega-Lite** for quantitative and statistical charts — a fenced `vega-lite` block whose body is a Vega-Lite JSON spec. Use it when the point is a measurement, not a relationship.

**Portrait is mandatory.** Diagrams MUST be authored **portrait** — Mermaid flowcharts use `flowchart TD` (top-down), never landscape (`flowchart LR`) — so they fit the viewer's narrow reading column without horizontal scrolling. A wide left-to-right diagram is a defect, not a stylistic choice. When a graph is genuinely too wide, split it into several stacked top-down diagrams rather than turning it on its side.

For **which** diagram type to reach for — the leading "does a visual help a decision?" question and the intent→type matrix — see the diagram recommendations in [40-diagrams.md](/specification/diagrams/).

## Determinism and Spec-Chapter Conventions

A thread runs through every convention above: **prefer the deterministic form**. A fixed data payload, a `questions-json` block ([34-question-interface.md](/specification/question-interface/)), and a script-rendered table all share the property that a machine produces them the same way every time, so they cannot drift from their source and cost nothing to regenerate. The more of a memo's content that is deterministic rather than re-typed by hand, the less it decays — determinism is the default, and prose is reserved for the reasoning that genuinely needs a human voice.

The same discipline applies to **authoring a new specification chapter**: each one follows the established skeleton so a new chapter is "right on the first try" and consistent with the rest. The skeleton is:

- a numbered H1 title (`# NN. Title`);
- a metadata table directly under the title with **Status**, **Depends on**, and **Related** rows;
- **intro prose** between the metadata table and the first `## ` heading — a short, content-first orientation;
- a bottom **`## Related`** section linking the neighbouring chapters.

The intro-prose and `## Related` requirements are **machine-enforced** by the spec-quality gate (the idempotent lint that audits every numbered chapter), so a chapter that omits either one fails the gate rather than merely reading as inconsistent.

The same determinism applies to **authoring requirements inline**. Where a chapter states a rule that work must satisfy, it writes that rule **prose-first** and attaches the structured declaration — the rule's `statement`, its `check`, and its optional `grade` — beside the prose, rather than maintaining the rule in a separate hand-edited store. The prose carries the reasoning a human needs; the inline declaration is the machine-readable source from which the requirement store is **harvested** ([23-requirements.md](/specification/requirements/)). This is the **prose-first guard**: the human-readable rule and its machine form live together in the chapter, and the store is generated from them, so a harvested entry cannot drift from the spec it encodes.

> **Migration status — target model, not yet realized.** The generated-store direction is the **normative target**, not a description of the present. Today most of the store is still authored independently — by skills and by hand — rather than harvested from the spec, so the bulk of it *can* and does drift; only the subset already lifted into inline spec declarations is genuinely generated. The system is **migrating toward** the generated store one curated rule at a time, and the prose-first guard removes drift for each rule as it is lifted, not retroactively for the whole store. (Same status as [23-requirements.md](/specification/requirements/), *Storage and Scale*.)

## Conformity Requirements

The authoring rules above carry binding `MUST`s of their own, and this chapter eats its own dog food: they are written **prose-first** as declarative requirements (the prose-first guard described above), each `statement` feeding the prompt that generates or evaluates a memo's PRDs and each `check` feeding the finalization gate as a ternary `PASS` / `BLOCKED` / `INCONCLUSIVE` result ([23-requirements.md](/specification/requirements/)). The blocks below scope to the `prd` work category and are **harvested** into the requirement store alongside the PRD-cutting rules of [08-phases-and-prds.md](/specification/phases-and-prds/); these govern how a PRD's *content* is authored, where 08 governs how a memo is *cut* into PRDs and phases.

Section completeness is a structural yes/no, so its `grade` is `binary`:

```requirement
{
  "id": "REQ-766",
  "title": "Every PRD carries its mandatory sections",
  "statement": "Every PRD MUST contain its full set of required sections — a goal, user stories, a scope, a changes-by-file list, a dependencies list, and a validation section — so a fresh-context agent finds every part it needs in a fixed place; a PRD missing any required section is incomplete and fails the gate.",
  "scope": { "repos": [], "categories": ["prd"], "tags": ["prd-structure"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each PRD contains a goal section, a user-stories section, a scope section, a changes-by-file section, a dependencies section, and a validation section",
      "No required section is empty"
    ]
  },
  "grade": "binary"
}
```

The User-Story shape is a structural assertion over each story:

```requirement
{
  "id": "REQ-767",
  "title": "User Stories follow the role / capability / justification form",
  "statement": "A PRD's user-stories section MUST carry at least one story in the canonical role / capability / justification form (\"as {role} I want {what} so that {why}\"), so every story names who it serves, what it enables, and why it is wanted.",
  "scope": { "repos": [], "categories": ["prd"], "tags": ["prd-structure"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The user-stories section contains at least one story",
      "Each story names a role, a desired capability, and a justification (the role / want / why triplet)"
    ]
  },
  "grade": "binary"
}
```

Acceptance-criteria quality has a deterministic vagueness floor and a specificity spectrum above it, so it carries both a hard `check` and an object `grade`:

```requirement
{
  "id": "REQ-768",
  "title": "Acceptance criteria are testable at line granularity",
  "statement": "A PRD's acceptance criteria MUST be testable — each phrased concretely enough to point at the exact line or artifact it checks — and MUST NOT use vague success language such as \"works correctly\" or \"is good\"; only PRDs whose criteria meet this bar may be marked Ralph-Loop suitable.",
  "scope": { "repos": [], "categories": ["prd"], "tags": ["prd-assertions", "prd-ralph-loop"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No acceptance criterion matches a vague-success phrase such as \"works correctly\", \"is good\", or \"works\"",
      "Each acceptance criterion names the concrete artifact, line, or condition it verifies",
      "A PRD marked Ralph-Loop suitable carries only criteria that pass the two assertions above"
    ]
  },
  "grade": { "dimension": "acceptance-criteria specificity", "weight": 100 }
}
```

The feature-to-assertion set must close, and each assertion must be typed:

```requirement
{
  "id": "REQ-769",
  "title": "Feature<->assertion set is closed and each assertion is typed",
  "statement": "A PRD's features and assertions MUST form a closed, bidirectionally-covered set — every feature has at least one assertion and every assertion belongs to at least one feature, with no orphan assertion — and each assertion MUST be marked either HARD (memo-fixed) or OPEN (negotiable).",
  "scope": { "repos": [], "categories": ["prd"], "tags": ["prd-assertions"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Every feature references at least one assertion",
      "Every assertion traces back to at least one feature, with no orphan assertion",
      "Every assertion carries a type marker that is exactly one of HARD or OPEN"
    ]
  },
  "grade": "binary"
}
```

The closeout workflow is a fixed section every PRD must end with — its check is structural, not a secrets scan:

```requirement
{
  "id": "REQ-770",
  "title": "Every PRD ends with the closeout workflow section",
  "statement": "Every PRD MUST carry a closeout section that documents three steps in order — a friction test, the `git-security` check, and the `git-commit` preparation — and that states explicitly that commit is not push.",
  "scope": { "repos": [], "categories": ["prd"], "tags": ["prd-structure", "prd-commit-strategy"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each PRD contains a closeout section",
      "That section lists a friction test, a `git-security` step, and a `git-commit` step",
      "That section states explicitly that commit is not push"
    ]
  },
  "grade": "binary"
}
```

Concrete inline examples are a self-containment rule:

```requirement
{
  "id": "REQ-771",
  "title": "Data structures and code patterns are shown inline and concretely",
  "statement": "Where a PRD specifies a data structure or a code pattern, it MUST show it concretely inline — a fenced JSON / YAML / code example, not an abstract description or an implicit assumption — so a fresh-context agent need not reconstruct the shape from prose.",
  "scope": { "repos": [], "categories": ["prd"], "tags": ["prd-self-containment", "prd-code-examples"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Every PRD that specifies a data structure carries a concrete inline example as a fenced JSON / YAML / code block",
      "Every PRD with a code requirement carries at least one fenced code block showing a concrete example",
      "No specified structure or pattern is left as an abstract description only"
    ]
  },
  "grade": "binary"
}
```

Finally, the way a requirement statement itself is worded is checkable — the prose-first guard's own conformance rule:

```requirement
{
  "id": "REQ-772",
  "title": "An authored requirement states a normative condition without hedging",
  "statement": "A requirement statement authored inline MUST state a normative condition in RFC-2119 terms (MUST / SHOULD / MAY) and MUST NOT hedge it into a non-requirement with words such as \"could\", \"if possible\", or \"optional\"; the rule's force is explicit, not implied.",
  "scope": { "repos": [], "categories": ["prd"], "tags": ["req-format"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The statement contains at least one RFC-2119 normative keyword (MUST, SHOULD, or MAY)",
      "The statement does not reduce a stated obligation to a non-requirement via hedging tokens such as \"could\", \"if possible\", or \"optional\""
    ]
  },
  "grade": "binary"
}
```


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [06-memo-structure.md](/specification/memo-structure/) — the on-disk shape of a memo that this chapter authors into.
- [05-memo-strategies.md](/specification/memo-strategies/) — the memo type and depth that frame the authoring effort.
- [30-primitives.md](/specification/primitives/) — the memo primitive and the concept map.
- [10-proactive-research.md](/specification/proactive-research/) — research output as the dataset behind generated tables.
- [34-question-interface.md](/specification/question-interface/) — the option-scoring discipline a memo's decisions follow.
- [40-diagrams.md](/specification/diagrams/) — diagram recommendations: the leading question and the intent→type matrix.
