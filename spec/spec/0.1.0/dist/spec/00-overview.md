---
title: "Overview"
description: "This is the entry point for the memo-init **Meta-Specification**, version `v0.1.0` (Draft). Where the memo, workbench, and session specifications describe the *system*, this fourth family describes..."
spec_meta_version: "0.1.0"
spec_file: "00-overview.md"
order: 0
section: "Meta-Spec"
normative: true
generated_at: "2026-07-10T01:26:47.441Z"
generated_from: "spec/spec/0.1.0/draft/spec/00-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/spec/0.1.0/draft/spec/00-overview.md."
---


> **Overview.** This document is the entry point of the Meta-Specification. It is written as prose, and its `## Conformance` section is normative: it establishes the RFC-2119 conformance interpretation that every chapter of this family assumes. The remainder describes *how* the specifications in this organization are authored, structured, and published.

This is the entry point for the memo-init **Meta-Specification**, version `v0.1.0` (Draft). Where the memo, workbench, and session specifications describe the *system*, this fourth family describes the *specifications themselves* — the shared conventions every family follows, the per-chapter document shape, the RFC-2119 conformance model, and the build pipeline that turns authored draft chapters into published documentation and the skill bridge.

It is a **meta-spec**: a specification about specifications. It exists so that the rules the other three families already obey implicitly become explicit, reviewable, and versionable in their own right.

---

## Why a Fourth Family

The memo-init organization publishes three sibling specification families — memo, workbench, and session. Each family shares the same skeleton: a per-chapter metadata table, an intro-prose-before-first-heading rule, a bottom `## Related` section, a per-version `spec-manifest.json` that drives the sidebar grouping, and a generated Bridge that maps chapters to the skills that implement them.

Until now those shared conventions lived only as tribal knowledge inside the generators and the authored chapters. The Meta-Specification gives them a home: one family whose subject *is* the shared structure, so a new spec family can be added by reading a document instead of reverse-engineering the pipeline.

---

## Conformance

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in the chapters of this family are to be interpreted as described in RFC 2119 and RFC 8174 (BCP 14), and only when they appear in all capitals. This chapter is the **conformance anchor** the other chapters refer to when they assume the RFC-2119 interpretation.

A chapter that is motivation or index prose rather than binding rules marks itself non-normative with a short blockquote near its top whose bold lead word is `Informative.` ([02-per-chapter-format.md](/spec/per-chapter-format/)); every chapter without that marker is normative and is read under this interpretation. The machine-checkable invariants this family asserts are authored as inline `SPEC-REQ` requirement blocks and harvested into the requirement store ([02-per-chapter-format.md](/spec/per-chapter-format/), section *Conformity Requirements*).

---

## Scope

This overview establishes the family; the normative chapters that define the conventions in detail are authored separately. The Meta-Specification is intentionally small and additive — it introduces no new build stage and changes none of the existing three families' published output.

---

## Declaring Family Responsibility

Beside its structural head ([02-per-chapter-format.md](/spec/per-chapter-format/)), each specification family declares its **responsibility** in one normative shape, so that a reader — and a review — sees without inference what a family owns, what it hands off, and what it leans on. The shape has three fields:

- **`provides`** — the family's mandate: the subjects it normatively owns. A subject **MUST** have exactly one owning family; two families **MUST NOT** both claim the same subject in their `provides`.
- **`delegates`** — the subjects a family deliberately does *not* own, each naming the owning family. A delegated subject is **referenced, never restated**: the delegating family points at the owner rather than re-norming the rule.
- **`requires`** — the families this one leans on as a hard precondition. A convenience pointer that is not a precondition is a *reference* edge, **not** a `requires`.

The declaration expresses the family topology directly and keeps it flat. The **session** family is the genesis root: it `requires` nothing and provides the session baseline. The **workbench** and **memo** families are equal siblings that each `require` session and extend it — neither is the other's parent, and a convenience edge between two siblings (memo pointing at a workbench folder convention) is a *reference* edge, not a `requires`, so the sibling layer stays flat. This meta family `provides` only spec form; it `requires` nothing, and every other family `requires` it for the shape of its own declaration.

Because each subject is single-owned, a subject that appears in more than one family's `provides` is a defect: it is resolved to one owner and demoted to a `delegates` pointer everywhere else, so no two families claim the same responsibility.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./02-per-chapter-format.md](/spec/per-chapter-format/) — the invariant elements every chapter carries, the family head, and the draft-to-dist pipeline.
- [./03-categories.md](/spec/categories/) — the navigation categories a family's manifest declares.
- [./04-bridge-standard.md](/spec/bridge-standard/) — the generated bridge that maps chapters to implementing skills.
- [./05-publishing-principle.md](/spec/publishing-principle/) — what is published (spec + build-plan) versus kept private (skills + interpretation).
- [./06-conventions-writing.md](/spec/conventions-writing/) — how conventions are written and registered as policy blocks.
