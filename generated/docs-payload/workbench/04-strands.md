---
title: "Strands"
description: "This chapter is **normative** for the strand concept, per-strand requirements and tools, and the rule that a strand is a tag rather than part of the numeric memo ID."
spec_version: "0.1.0"
spec_file: "04-strands.md"
order: 4
section: "Workbench"
normative: true
generated_at: "2026-06-12T00:45:52.499Z"
generated_from: "spec/workbench/04-strands.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/04-strands.md."
---


> Normative language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119] [RFC8174]. RFC 2119 keywords are used.

This chapter is **normative** for the strand concept, per-strand requirements and tools, and the rule that a strand is a tag rather than part of the numeric memo ID.

---

## Purpose

A single memo frequently works **several distinct topics** across its phases. The bootstrap memo of this specification, for example, simultaneously advances a strategy/verification topic, a spec-authoring topic, a workbench sub-spec topic, and a repository-bootstrap topic. Treating all of that as one undifferentiated stream of phases loses the structure: different topics need different requirements and different tools.

A **strand** names one such topic inside a memo, so the memo's work can be reasoned about per topic without splitting the memo itself.

---

## What a Strand Is

A strand is a **named topic** that a memo works across one or more phases.

- A memo **MAY** declare several strands. A memo with a single, cohesive topic **MAY** have just one (implicit) strand.
- Each strand **SHOULD** carry its own **requirements** (drawn from the requirements profiles of [02-requirements.md](/specification/requirements/)) and its own **tools** (drawn from the tools registry of [03-tools-registry.md](/specification/tools-registry/)). A spec-authoring strand needs documentation requirements and doc tools; a code-bootstrap strand needs the language formatting profile and the test tools. Declaring these per strand keeps each topic's expectations sharp.
- Strands give a vocabulary for talking about *parts* of a memo. A phase belongs to a strand; a strand spans the phases that advance its topic.

---

## Example Strands

The strands of this specification's own bootstrap memo are the canonical example:

| Strand | Topic |
|--------|-------|
| A | Strategy / Verification |
| B | Spec-Authoring |
| C | Workbench Sub-Spec |
| D | Bootstrap |

Strand A establishes the verified factual base and the strategy. Strand B authors the core specification chapters. Strand C authors this workbench sub-spec. Strand D bootstraps the organization and its repositories. Each strand has different requirements (documentation rules for B and C; repository and code rules for D) and different tools.

---

## A Strand Is a Tag, Not Part of the Memo ID

A strand is a **tag or label**, not a component of the numeric memo identifier.

- The memo ID stays **stable** and numeric (the `M{NNN}-{PP}-{RR}` form defined in the core-spec git-workflow chapter). A strand **MUST NOT** be encoded into the numeric memo ID, and adding or renaming a strand **MUST NOT** change the memo's ID.
- A strand is attached as a label — for example, "strand C" or a short strand name — and used to group phases, requirements, and tools. Because it is only a label, strands can be added, renamed, or merged as understanding of the memo's topics evolves, without disturbing any identifier that other artifacts (commits, issues, branches) reference.
- The strand provides organizational grouping; the numeric ID provides stable identity. The two concerns are kept separate.

---

## Related

- [02-requirements.md](/specification/requirements/) — per-strand requirements draw from these profiles.
- [03-tools-registry.md](/specification/tools-registry/) — per-strand tools draw from this registry.
- [01-project-structure.md](/specification/project-structure/) — strands live inside a memo under `.memo/`.
- [00-overview.md](/specification/overview/) — sub-spec scope.
