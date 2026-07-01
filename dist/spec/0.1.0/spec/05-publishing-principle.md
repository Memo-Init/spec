---
title: "The Publishing Principle"
description: "The organization publishes its specifications openly and keeps the skills that implement them private. That division has been lived architecturally — the site publishes the spec, the skill library is..."
spec_meta_version: "0.1.0"
spec_file: "05-publishing-principle.md"
order: 5
section: "Meta-Spec"
normative: true
generated_at: "2026-07-01T20:09:09.479Z"
generated_from: "draft/spec/0.1.0/spec/05-publishing-principle.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/spec/0.1.0/spec/05-publishing-principle.md."
---


The organization publishes its specifications openly and keeps the skills that implement them private. That division has been lived architecturally — the site publishes the spec, the skill library is not published — but it was never written down, so it read as an incidental arrangement rather than a principle. This chapter makes it normative and states the line precisely, because the imprecise version ("the skills are secret, including their names") is wrong and has caused mistakes. The specification is the family that owns spec structure, so the publishing principle has its home here.

---

## The Principle

> **The spec and the build-plan are the published artifact; the actual skills and our internal interpretation/classification of the spec are private.**

Read against the two directions of every artifact ([/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/)), this resolves into a clear split:

| Public | Private |
|--------|---------|
| The **specification** — the numbered chapters of every family. | The **actual skills** — the token-paid implementation that runs the workflow. |
| The **build-plan** — how one authors skills against the spec, including the fact that a skill exists and **its name**. | Our **internal interpretation and classification** of the generated spec — coverage judgments, gap analysis, and other inward reasoning about what the spec does and does not yet cover. |

Two consequences follow directly, and each **MUST** be honored:

- **Skill names MAY be published.** A skill name is part of the build-plan — it says *what* implements a chapter, which is exactly what a reader of the spec is entitled to know. The bridge names its implementing skills in full for this reason. Withholding a name would be treating the build-plan as if it were the skill.
- **Internal interpretation MUST NOT be published.** Coverage percentages, gap roll-ups, and classification of how well the spec is covered are inward reasoning. They belong to how the project runs itself, not to the published specification, and they are withheld from outward artifacts.

---

## Why Gaps Are Removed From the Public Bridge

The bridge computes a per-chapter **gaps roll-up** — where a skill's capability runs ahead of what a chapter specifies — and does **not** publish it ([The Bridge Standard](/specification/bridge-standard/)). This principle is the reason, and stating the reason correctly matters:

- A gap entry is **internal interpretation** of the delta between a skill and the spec. It offers no value to an outside reader of the specification, and it exposes the project's own inward assessment of its coverage.
- The gaps are therefore removed **because they are internal interpretation** — *not* because "names are secret". The skills, and their names, remain publishable; what is withheld is our classification of the spec's coverage. Conflating the two ("hide the gaps because the skills are secret") is the imprecise version this chapter corrects: the skills' *names* are public, their *implementation* is private, and our *interpretation* of the spec is private.

The same reasoning governs the provenance hash and any coverage-percentage figure: each is inward calibration, so each stays inward, while the honest public facts — that a chapter has or has not got an implementer, and which named skills those are — are published.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./04-bridge-standard.md](/specification/bridge-standard/) — the bridge withholds its gaps roll-up and provenance on the strength of this principle.
- [./06-conventions-writing.md](/specification/conventions-writing/) — how the organization's conventions are written and registered.
- [/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/) — the inward/outward direction model this principle is a special case of.
