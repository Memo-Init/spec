---
title: "The Publishing Principle"
description: "The organization publishes its specifications openly and keeps the skills that implement them private. That division has been lived architecturally — the site publishes the spec, the skill library is..."
spec_meta_version: "0.1.0"
spec_file: "05-publishing-principle.md"
order: 5
section: "Meta-Spec"
normative: true
generated_at: "2026-07-07T19:18:16.831Z"
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

The bridge computes a per-chapter **gaps roll-up** — where a skill's capability runs ahead of what a chapter specifies — and does **not** publish it ([The Bridge Standard](/spec/bridge-standard/)). This principle is the reason, and stating the reason correctly matters:

- A gap entry is **internal interpretation** of the delta between a skill and the spec. It offers no value to an outside reader of the specification, and it exposes the project's own inward assessment of its coverage.
- The gaps are therefore removed **because they are internal interpretation** — *not* because "names are secret". The skills, and their names, remain publishable; what is withheld is our classification of the spec's coverage. Conflating the two ("hide the gaps because the skills are secret") is the imprecise version this chapter corrects: the skills' *names* are public, their *implementation* is private, and our *interpretation* of the spec is private.

The same reasoning governs the provenance hash and any coverage **percentage or classification**: each is inward calibration, so each stays inward. The honest public facts — that a chapter has or has not got an implementer, which named skills those are, and the raw `n of m` count of how many chapters are covered — are published. The raw count is a *fact about* coverage, not an *interpretation of* it, so it stays public; a percentage, or a "well covered / poorly covered" judgment, is interpretation and does not.

---

## Repo Source Versus Published Artifact

The principle governs what is **published**, and publication has a precise boundary: the rendered `dist/` artifacts and the site served from them. It does **not** reach every file in the repository. The repository is the **build-plan**, and the build-plan is itself a published thing — but a build-plan legitimately contains authoring inputs that are not part of what is served.

This resolves an apparent tension. The bridge's source map (`draft/<family>/<version>/data/skill-spec-map.json`) carries internal fields — the `gaps` notes and a `visibility` marker — and it lives in a repository that is public. That is **allowed**: the map is build-plan source, and internal interpretation in the *source* is not a leak. The rule bites at the render boundary, not at the storage location:

- **Source is build-plan.** The authored map, including its `gaps` and `visibility` fields, MAY live in the repository. It is not relocated to a private repo; the source stays where the build reads it.
- **Only rendered `dist/` artifacts are the publication.** The gaps roll-up and the provenance hash MUST be stripped from every rendered artifact ([The Bridge Standard](/spec/bridge-standard/)) — the public bridge page and the published inverted map. What is served carries only the public projection.

So the line is: internal interpretation MUST NOT reach a **rendered** artifact, but it MAY sit in the **source** the render is built from. Publication is defined by what is served, not by which repository a file happens to live in.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./04-bridge-standard.md](/spec/bridge-standard/) — the bridge withholds its gaps roll-up and provenance on the strength of this principle.
- [./06-conventions-writing.md](/spec/conventions-writing/) — how the organization's conventions are written and registered.
- [/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/) — the inward/outward direction model this principle is a special case of.
