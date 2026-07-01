---
title: "Overview"
description: "This is the entry point for the memo-init **Meta-Specification**, version `v0.1.0` (Draft). Where the memo, workbench, and session specifications describe the *system*, this fourth family describes..."
spec_meta_version: "0.1.0"
spec_file: "00-overview.md"
order: 0
section: "Meta-Spec"
normative: false
generated_at: "2026-07-01T16:41:10.643Z"
generated_from: "draft/spec/0.1.0/spec/00-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/spec/0.1.0/spec/00-overview.md."
---


> **Informative.** This document is the entry point of the Meta-Specification. It is written in prose and does not itself carry normative requirements. Its purpose is to describe *how* the specifications in this organization are authored, structured, and published.

This is the entry point for the memo-init **Meta-Specification**, version `v0.1.0` (Draft). Where the memo, workbench, and session specifications describe the *system*, this fourth family describes the *specifications themselves* — the shared conventions every family follows, the per-chapter document shape, the RFC-2119 conformance model, and the build pipeline that turns authored draft chapters into published documentation and the skill bridge.

It is a **meta-spec**: a specification about specifications. It exists so that the rules the other three families already obey implicitly become explicit, reviewable, and versionable in their own right.

---

## Why a Fourth Family

The memo-init organization publishes three sibling specification families — memo, workbench, and session. Each family shares the same skeleton: a per-chapter metadata table, an intro-prose-before-first-heading rule, a bottom `## Related` section, a per-version `spec-manifest.json` that drives the sidebar grouping, and a generated Bridge that maps chapters to the skills that implement them.

Until now those shared conventions lived only as tribal knowledge inside the generators and the authored chapters. The Meta-Specification gives them a home: one family whose subject *is* the shared structure, so a new spec family can be added by reading a document instead of reverse-engineering the pipeline.

---

## Scope

This overview establishes the family; the normative chapters that define the conventions in detail are authored separately. The Meta-Specification is intentionally small and additive — it introduces no new build stage and changes none of the existing three families' published output.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./02-per-chapter-format.md](/specification/per-chapter-format/) — the invariant elements every chapter carries, the family head, and the draft-to-dist pipeline.
- [./03-categories.md](/specification/categories/) — the navigation categories a family's manifest declares.
- [./04-bridge-standard.md](/specification/bridge-standard/) — the generated bridge that maps chapters to implementing skills.
- [./05-publishing-principle.md](/specification/publishing-principle/) — what is published (spec + build-plan) versus kept private (skills + interpretation).
- [./06-conventions-writing.md](/specification/conventions-writing/) — how conventions are written and registered as policy blocks.
