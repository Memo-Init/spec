---
title: "Strands"
description: "A single memo frequently works **several distinct topics** across its phases — a memo can simultaneously advance a strategy/verification topic, a specification-authoring topic, a sub-spec topic, and..."
spec_version: "0.1.0"
spec_file: "25-strands.md"
order: 25
section: "Specification"
normative: true
generated_at: "2026-06-14T10:31:30.607Z"
generated_from: "spec/v0.1.0/25-strands.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/25-strands.md."
---


A single memo frequently works **several distinct topics** across its phases — a memo can simultaneously advance a strategy/verification topic, a specification-authoring topic, a sub-spec topic, and a repository-bootstrap topic. Treating all of that as one undifferentiated stream of phases loses the structure: different topics need different requirements and different tools. A **strand** names one such topic inside a memo, so the memo's work can be reasoned about per topic without splitting the memo itself.

---

## What a Strand Is

A strand is a **named topic** that a memo works across one or more phases.

- A memo **MAY** declare several strands. A memo with a single, cohesive topic **MAY** have just one (implicit) strand.
- Each strand **SHOULD** carry its own **requirements** (drawn from the requirements registry of [23-requirements.md](/specification/requirements/)) and its own **tools** (drawn from the tools registry of [24-tools-registry.md](/specification/tools-registry/)). A spec-authoring strand needs documentation requirements and doc tools; a code-bootstrap strand needs the language formatting profile and the test tools. Declaring these per strand keeps each topic's expectations sharp.
- Strands give a vocabulary for talking about *parts* of a memo. A phase belongs to a strand; a strand spans the phases that advance its topic.

---

## Example Strands

A memo that simultaneously runs four topics is the canonical example:

| Strand | Topic |
|--------|-------|
| A | Strategy / Verification |
| B | Spec-Authoring |
| C | Sub-Spec |
| D | Bootstrap |

Strand A establishes the verified factual base and the strategy. Strand B authors the core chapters. Strand C authors the sub-spec. Strand D bootstraps the organization and its repositories. Each strand has different requirements (documentation rules for B and C; repository and code rules for D) and different tools.

---

## A Strand Is a Tag, Not Part of the Memo ID

A strand is a **tag or label**, not a component of the numeric memo identifier, and it is a different concept from a requirement's **severity** (`must` / `should` / `may`), which expresses the strictness of a requirement, not the grouping of work.

- The memo ID stays **stable** and numeric (the `M{NNN}-{PP}-{RR}` form defined in [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)). A strand **MUST NOT** be encoded into the numeric memo ID, and adding or renaming a strand **MUST NOT** change the memo's ID.
- A strand is attached as a label — for example, "strand C" or a short strand name — and used to group phases, requirements, and tools. Because it is only a label, strands can be added, renamed, or merged as understanding of the memo's topics evolves, without disturbing any identifier that other artifacts (commits, issues, branches) reference.
- The strand provides organizational grouping; the numeric ID provides stable identity. The two concerns are kept separate.

---

## Related

- [23-requirements.md](/specification/requirements/) — per-strand requirements draw from this registry.
- [24-tools-registry.md](/specification/tools-registry/) — per-strand tools draw from this registry.
- [06-memo-structure.md](/specification/memo-structure/) — strands live inside a memo under `.memo/`.
- [08-phases-and-prds.md](/specification/phases-and-prds/) — a phase belongs to a strand.
- [00-overview.md](/specification/overview/) — specification scope.
