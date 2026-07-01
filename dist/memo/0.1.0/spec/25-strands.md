---
title: "Strands"
description: "A single memo becomes executable as a chain of dependency-ordered phases and PRDs (see [08-phases-and-prds.md](./08-phases-and-prds.md)). Often that chain is not one undifferentiated stream:..."
spec_version: "0.1.0"
spec_file: "25-strands.md"
order: 25
section: "Specification"
normative: true
generated_at: "2026-07-01T15:36:43.547Z"
generated_from: "draft/memo/0.1.0/spec/25-strands.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/25-strands.md."
---


A single memo becomes executable as a chain of dependency-ordered phases and PRDs (see [08-phases-and-prds.md](/specification/phases-and-prds/)). Often that chain is not one undifferentiated stream: following the `depends-on` edges between phases (the `## Phase-Hints` dependency tree of [08-phases-and-prds.md](/specification/phases-and-prds/)) traces out distinct dependency chains through the memo. A **strand** is what **emerges** when you follow that dependency graph: the **dependency closure** over the phases that are transitively linked by `depends-on`. A strand is therefore *computed*, not *declared* — it is not a thematic grouping the author assigns, but the chain that the dependency edges produce. Because dependency chains tend to converge, a memo with **many phases** typically resolves into **few (often one or two large) strands**. Unlike the phases themselves, a strand may span **several topics**, because it is defined by the *dependency path the work takes*, not by the topic it touches.

---

## What a Strand Is

A strand is the **dependency closure over phases**: the transitive closure of the `depends-on` edges declared in the memo's `## Phase-Hints` section (see [08-phases-and-prds.md](/specification/phases-and-prds/)). It is **emergent**, not authored — an implementation *derives* a strand by walking the dependency graph, rather than the author *assigning* phases to a thematic group. A strand **MAY** span several topics, precisely because it is defined by the dependency path the work takes and not by the topic it touches.

- **Emergent, not declared.** A strand is **computed** from the dependency edges: it is the set of phases reachable from one another through `depends-on` (and the PRDs those phases carry). It is **NOT** a thematic bundle the author hand-picks. Two phases belong to the same strand because the dependency graph links them, not because they share a topic.
- **Many phases, few strands.** Because dependency chains converge, a memo with many phases typically resolves into **one or two large strands**, not one strand per phase. The mapping phase→strand is therefore **many-to-one and emergent**, never a fixed 1:1 assignment.
- **Trivial case.** A memo of a single PRD yields one PRD → one phase → one strand. In that degenerate case there is nothing to re-order, so the tracer-bullet decision (below, and at finalization — see the finalize gate) does not apply. Note that **this** tracer-bullet is the *strand-finalize* sense — a finalization-time decision on a large strand — and is **distinct** from the same-named vertical-slice-first **rollout strategy** (an optional rollout-execution order chosen at rollout start) defined in [12-rollout.md](/specification/rollout/). The two share the image but operate at different points and scopes; do not conflate them.
- **What a strand carries.** A strand carries its **PRDs**. The PRDs carry the **requirements** (drawn from the registry of [23-requirements.md](/specification/requirements/)) and the **tools** (drawn from [24-tools-registry.md](/specification/tools-registry/)). A strand therefore carries requirements and tools **through its PRDs**, not directly.
- **Optional strand spec.** A strand **MAY** carry its own **strand spec** — **RECOMMENDED** for larger strands, never mandatory. The strand spec is sharpened through an interview pass (a question catalogue) when the strand is large enough to warrant it.

---

## Example Strands

A memo whose `## Phase-Hints` dependency graph resolves into four independent chains illustrates the emergent strands that result:

| Strand (emergent) | Phases in the closure | What the chain happens to touch |
|-------------------|-----------------------|----------------------------------|
| A | the strategy/verification phases and everything that `depends-on` them | Strategy / Verification |
| B | the spec-authoring phases linked by `depends-on` | Spec-Authoring |
| C | the workbench-spec phases linked by `depends-on` | Workbench |
| D | the bootstrap phases linked by `depends-on` | Bootstrap |

These strands are not assigned; they **fall out** of the dependency tree. Chain A is the closure rooted in the phases that establish the verified factual base and the strategy. Chain B is the closure over the phases that author the core chapters; chain C the workbench spec; chain D the organization-and-repository bootstrap. The topic column merely *names* what each emergent chain happens to touch — it is a description after the fact, not the basis on which the strand was formed. Each chain's PRDs carry the requirements and tools that path needs — documentation rules where the chain authors docs, repository and code rules where it bootstraps.

A smaller, mixed memo shows the same emergence: if the `core` code phases and the `docs/frontend` phases share no `depends-on` edge, the dependency graph resolves into **two strands** — not because the author grouped them by theme, but because the two dependency chains never converge. Had a phase depended across the two, the closure would have merged them into one strand.

---

## A Strand Is a Tag, Not Part of the Memo ID

A strand is a **tag or label**, not a component of the numeric memo identifier, and it is a different concept from a requirement's **severity** (`must` / `should` / `may`), which expresses the strictness of a requirement, not the grouping of work.

- The memo ID stays **stable** and numeric (the `M{NNN}-{PP}-{RR}` form defined in [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)). A strand **MUST NOT** be encoded into the numeric memo ID, and adding or renaming a strand **MUST NOT** change the memo's ID.
- A strand is attached as a label — for example, "strand C" or a short strand name — and used to group the phases and PRDs along its path. Because it is only a label, strands can be added, renamed, or merged as understanding of the memo's paths evolves, without disturbing any identifier that other artifacts (commits, issues, branches) reference.
- The strand provides organizational grouping; the numeric ID provides stable identity. The two concerns are kept separate.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [23-requirements.md](/specification/requirements/) — a strand's PRDs draw their requirements from this registry.
- [24-tools-registry.md](/specification/tools-registry/) — a strand's PRDs draw their tools from this registry.
- [08-phases-and-prds.md](/specification/phases-and-prds/) — the source of the phase/PRD path a strand runs along.
- [12-rollout.md](/specification/rollout/) — the vertical-slice-first (tracer-bullet) rollout strategy, a distinct same-named concept from this chapter's strand-finalize Tracer-Bullet decision.
- [06-memo-structure.md](/specification/memo-structure/) — strands live inside a memo under `.memo/`.
- [00-overview.md](/specification/overview/) — specification scope.
- [30-primitives.md](/specification/primitives/) — central glossary and concept map; the strand primitive summarized as cross-cutting.
</content>
</invoke>
