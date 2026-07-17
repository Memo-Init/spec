---
title: "Specification Authority"
description: "A specification is not one implementation among many; it stands **above** the implementations that realize it and carries a higher authority than any single one. This chapter states what that..."
spec_meta_version: "0.3.0"
spec_file: "11-spec-authority.md"
order: 11
section: "Meta-Spec"
normative: true
generated_at: "2026-07-17T23:43:43.034Z"
generated_from: "meta-spec/0.3.0/draft/spec/11-spec-authority.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: meta-spec/0.3.0/draft/spec/11-spec-authority.md."
---


A specification is not one implementation among many; it stands **above** the implementations that realize it and carries a higher authority than any single one. This chapter states what that authority means in practice: that a spec is changed deliberately rather than casually, that it fixes a **frame** rather than a line-by-line image of the code, and that its forward creation and its trailing maintenance are the same forward/backward dynamic the maintenance chapter already names. It reads under the RFC-2119 conformance interpretation the family establishes in its overview ([./00-overview.md](/spec/overview/)).

---

## A Spec Carries High Authority

A specification sits over its implementations. It is the reference the code is measured against, not a note the code may overrule, and among the things it fixes are the load-bearing views — the security surfaces, the trust boundaries, the invariants the whole system leans on. Because so much rests on it, a spec is **not changed casually**: an edit is a deliberate, reviewable act, versioned and gated by the spec lifecycle ([./08-spec-lifecycle.md](/spec/spec-lifecycle/)), never an incidental tweak slipped in beside an implementation change. Where an implementation and the spec disagree, the spec is the authority and the implementation is the thing brought back into line — the reverse is a defect, not a shortcut. This authority is what makes the spec worth reading before building: a reader can trust that the frame is stable and that a change to it went through a conscious decision.

---

## Frame, Not One-to-One

High authority does **not** mean a spec is a one-to-one blueprint of the code. A spec is the *theoretical* working-through — what should be done and why — and it fixes the **large frame** inside which many valid implementations can live. It is deliberately not a detail-for-detail mirror and not a source for auto-generated code: the same specification admits several correct realizations, the way an interface or protocol specification admits a Python, a TypeScript, and a Rust implementation that all conform without being copies of one another.

This is also where the spec's reach ends cleanly. A specification has authority over the **outer harness** the org builds and shapes — its conventions, standing rules, and layered mechanics — while the **inner harness** a running agent harness exposes (its given tool and config surface) is captured descriptively by the harness registry ([./10-harness-registry.md](/spec/harness-registry/)), not dictated by spec prose. The spec frames the layer the org owns; it does not legislate the given surface it merely records.

---

## Creation and Maintenance

A spec is written forward and then kept current, and those two motions are the same forward/backward dynamic specified elsewhere. The forward creation (a goal splitting new water) and the trailing maintenance (the wake that must be kept in sync), together with the hybrid risk that appears when too many changes are pushed at once and both the old and the new path are kept "just in case", are specified in the maintenance chapter ([/specification/maintenance/](/specification/maintenance/)) and referenced, not restated, here. The point for this chapter is only that a specification is subject to that same dynamic: its authority does not exempt it from maintenance, and an unmaintained spec drifts from the system exactly as any other delivered unit does.

---

<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./08-spec-lifecycle.md](/spec/spec-lifecycle/) — the lifecycle and versioning gate through which a change to a spec's frame is made deliberate rather than casual.
- [./05-publishing-principle.md](/spec/publishing-principle/) — what of a spec and its implementation is published versus kept private.
- [/specification/maintenance/](/specification/maintenance/) — the forward-creation / trailing-maintenance dynamic and the hybrid anti-pattern this chapter references instead of restating.
