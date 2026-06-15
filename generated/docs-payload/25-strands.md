---
title: "Strands"
description: "A single memo becomes executable as a chain of dependency-ordered phases and PRDs (see [08-phases-and-prds.md](./08-phases-and-prds.md)). Often that chain is not one undifferentiated stream: distinct..."
spec_version: "0.1.0"
spec_file: "25-strands.md"
order: 25
section: "Specification"
normative: true
generated_at: "2026-06-15T10:49:59.632Z"
generated_from: "spec/v0.1.0/25-strands.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/25-strands.md."
---


A single memo becomes executable as a chain of dependency-ordered phases and PRDs (see [08-phases-and-prds.md](/specification/phases-and-prds/)). Often that chain is not one undifferentiated stream: distinct **processing paths** run through the memo — one path drives the core code, another the documentation, another a sub-spec. A **strand** names one such processing path: a dependency-linked run of phases and PRDs that advances one coherent area of work. Unlike the phases themselves, a strand may span **several topics**, because it is defined by the *way the work is processed*, not by the topic it touches.

---

## What a Strand Is

A strand is a **processing path**: a sequence of phases and PRDs, linked by dependencies, that drives one coherent area of work forward. It **MAY** span several topics.

- **The flow.** A memo's **topics** are merged into **PRDs**; PRDs are sequenced into **phases**; phases and PRDs, ordered by their dependencies, form a **path** — and that path is a strand. (Topics → PRDs → Phases, per [08-phases-and-prds.md](/specification/phases-and-prds/).)
- **What a strand carries.** A strand carries its **PRDs**. The PRDs carry the **requirements** (drawn from the registry of [23-requirements.md](/specification/requirements/)) and the **tools** (drawn from [24-tools-registry.md](/specification/tools-registry/)). A strand therefore carries requirements and tools **through its PRDs**, not directly.
- **Optional strand spec.** A strand **MAY** carry its own **strand spec** — **RECOMMENDED** for larger strands, never mandatory. The strand spec is sharpened through an interview pass (a question catalogue) when the strand is large enough to warrant it.
- **Phases belong to a strand.** A phase advances exactly one strand; a strand spans the phases that drive its path forward.

---

## Example Strands

A memo that simultaneously runs four processing paths is the canonical example:

| Strand | Topic |
|--------|-------|
| A | Strategy / Verification |
| B | Spec-Authoring |
| C | Sub-Spec |
| D | Bootstrap |

Strand A establishes the verified factual base and the strategy. Strand B authors the core chapters. Strand C authors the sub-spec. Strand D bootstraps the organization and its repositories. Each strand runs a different path; its PRDs carry the requirements and tools that path needs — documentation rules for the B and C paths, repository and code rules for the D path.

A smaller, mixed memo illustrates the same idea: a memo that combines `core` code work with `docs/frontend` work runs as **two strands** — a core strand and a frontend strand — because the two paths are processed differently even though they live in one memo.

---

## A Strand Is a Tag, Not Part of the Memo ID

A strand is a **tag or label**, not a component of the numeric memo identifier, and it is a different concept from a requirement's **severity** (`must` / `should` / `may`), which expresses the strictness of a requirement, not the grouping of work.

- The memo ID stays **stable** and numeric (the `M{NNN}-{PP}-{RR}` form defined in [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)). A strand **MUST NOT** be encoded into the numeric memo ID, and adding or renaming a strand **MUST NOT** change the memo's ID.
- A strand is attached as a label — for example, "strand C" or a short strand name — and used to group the phases and PRDs along its path. Because it is only a label, strands can be added, renamed, or merged as understanding of the memo's paths evolves, without disturbing any identifier that other artifacts (commits, issues, branches) reference.
- The strand provides organizational grouping; the numeric ID provides stable identity. The two concerns are kept separate.

---

## Related

- [23-requirements.md](/specification/requirements/) — a strand's PRDs draw their requirements from this registry.
- [24-tools-registry.md](/specification/tools-registry/) — a strand's PRDs draw their tools from this registry.
- [08-phases-and-prds.md](/specification/phases-and-prds/) — the source of the phase/PRD path a strand runs along.
- [06-memo-structure.md](/specification/memo-structure/) — strands live inside a memo under `.memo/`.
- [00-overview.md](/specification/overview/) — specification scope.
</content>
</invoke>
