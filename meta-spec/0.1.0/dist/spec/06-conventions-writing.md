---
title: "Writing Conventions"
description: "A **convention** is a standing rule the whole organization follows — how the orchestrator talks to the user, how a repository is scaffolded, how code in a given language is formatted. A convention is..."
spec_meta_version: "0.1.0"
spec_file: "06-conventions-writing.md"
order: 6
section: "Meta-Spec"
normative: true
generated_at: "2026-07-11T22:30:17.205Z"
generated_from: "meta-spec/0.1.0/draft/spec/06-conventions-writing.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: meta-spec/0.1.0/draft/spec/06-conventions-writing.md."
---


A **convention** is a standing rule the whole organization follows — how the orchestrator talks to the user, how a repository is scaffolded, how code in a given language is formatted. A convention is not a per-memo decision; it is a body of standards that applies across memos and sessions. This chapter specifies how a convention is *written* and *registered*: the format it takes as prose, and the mechanism that makes it a first-class, findable, enforceable rule rather than a paragraph buried in a chapter. The rule is deliberately conservative — conventions reuse an existing registry primitive; writing a convention **MUST NOT** introduce a new one.

---

## How a Convention Is Written

A convention is authored prose-first, as a readable list or table in the chapter that owns its subject. The authored form:

- **Names each rule addressably.** Each convention carries a stable, short identifier (for example the `J1`–`J12` communication conventions) so it can be referenced, discussed, and registered without ambiguity.
- **Lives in one owning chapter.** The readable body of a convention stays single-source in the chapter whose subject it is — the communication conventions in the communication chapter, the formatting conventions in the formatting standard — and is not restated elsewhere.
- **Is registered separately from where it is described.** The prose says *what* the rule is; a policy block ([the registration mechanism](#the-policy-block-mechanism) below) records *how* it is activated and tracked. The two are kept apart so a rule is never normatively duplicated: the chapter is the readable source, the policy block is the machine registration, and neither claims to be the other.

Writing a convention therefore has two moves: author the readable rule in its owning chapter, and register the set as a policy block. It does **not** involve inventing a bespoke store or a new kind of registry entry.

---

## The Policy-Block Mechanism

Conventions are registered as a **policy block** in the session namespace registry ([/session/namespace-registry/](/session/namespace-registry/)), which is the **normative home** of the policy-block mechanism. The policy block is the existing registry primitive for "a body of standards that is always findable, of which a sub-set must be read by a checkpoint" — the same `kind:"policy"` block that already registers the development standards. A convention set reuses it as-is. This chapter does **not** re-specify how a policy block behaves — that would be the double normativity the next section forbids — but summarizes, informatively, the three properties that bear on writing a convention:

> **Informative** (normative source: [/session/namespace-registry/](/session/namespace-registry/)). A policy block reserves a namespace and contributes its member rules but is never a gate predecessor (its `requires[]` is empty and it feeds no precondition edge); it gates only through the separate assertions axis, as a redirect at a named checkpoint, never as a hard block; and its registration follows the trinary `REQ-SS-POLICY`, so being registered does not make it gate the way an SOP-instance block gates — it is findable by construction and enforced only at its checkpoints.

Because the mechanism already exists, registering a new convention set is a matter of adding its rules to a policy block, not of designing new machinery. This is the YAGNI discipline in force: the standards body ("a set of conventions that must be followed") is exactly what a policy block models, so a convention set **MUST** register as one rather than spawn a parallel primitive.

---

## No Double Normativity

A convention has one normative home. When a convention set is registered as a policy block, the readable table in its owning chapter remains the human-facing source, and the policy block holds the activation-and-tracking registration — the two do not both assert the rule. A reader who wants to *understand* a convention reads the owning chapter; a tool that must *enforce* it reads the policy block. Keeping the description and the registration in separate places, each single-source, is what prevents the two copies from drifting.

The communication conventions `J1`–`J12` are the worked example: their readable table lives in the communication chapter ([/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/)), and their registration lives in the session policy block ([/session/namespace-registry/](/session/namespace-registry/)). The table describes; the policy block registers; neither restates the other.

---

## The Anchor-Term Convention

An **anchor term** is a term whose meaning the organization fixes once and then reuses everywhere, so that a reader — human or model — recovers the same meaning from the word wherever it appears. The anchor-term convention is the org-wide, smallest-common-denominator rule for grounding such terms: every family and every project applies it identically, and a family that does not fit the rule does not fork a local variant — it sharpens this meta-spec convention and works forward from there. The convention is itself a convention, authored and registered exactly as this chapter prescribes: its readable rules live here, and the set of grounded terms is registered as a policy-block adjunct — **not** as a new registry primitive.

A term qualifies as an anchor term only when it carries all of the following **four-plus-one** mandatory properties:

| Rule | Property | What it requires |
|---|---|---|
| **AT1** | **One canonical label** | The term has exactly one preferred label; alternative wordings are recorded as known mis-labels, never used as the term. |
| **AT2** | **One owning chapter** | Exactly one chapter carries the in-document definition; no other chapter restates it (No Double Normativity, above). |
| **AT3** | **Explicit negative delimitation** | The owning chapter states what the term is **not** — the neighbouring meanings a reader's prior would otherwise supply. |
| **AT4** | **Usage obligation** | The term is used *functionally* in the chapters that need it, not merely declared once in a glossary. Grounding comes from consistent use, not from the definition alone. |
| **+AT5** | **Lived congruence** | The process the term describes actually behaves as the term says. A definition the guardrails contradict is not grounded; text and behaviour are corrected together. |

`AT1`–`AT4` fix the term on the page; `AT5` is the "plus one" that binds the page to the running process — the meaning is anchored only when the system lives it.

**Registration by reference, not repetition.** The set of anchor terms is held once, in an org register, and referenced from wherever a term is used — the meaning is fixed in one place and pointed at, never copied. The register borrows its *mechanics* from the OASF tag standard (a stable identifier that outlives a re-labelling, a versioned immutable record, known mis-labels as a warning signal) and its *entry fields* from SKOS (canonical label, definition, and negative delimitation as a sharpened scope note). It borrows neither URIs, triples, nor a reasoner: this is a controlled vocabulary carried by the existing store-and-generator pipeline, not a semantic-web stack. Each entry carries a stable `id`, the canonical `label`, the `definition`, the `negativeDelimitation`, the known `misLabels`, a `version` (SemVer), the `owningChapter`, and an optional `namespaceToken` for cross-family qualification.

**The register is an adjunct, never a new primitive.** Consistent with this chapter's opening rule, grounding a term **MUST** register through the existing `kind:"policy"` block; it **MUST NOT** spawn a parallel registry machine. The register store is rendered deterministically from its authored source by the shared generation-script line, and a warning-only usage lint reports drift — a term defined twice, a term never used, a missing negative delimitation, a known mis-label appearing in prose. Enforcement is warn-not-block: the convention guides authoring, it never gates a build.

**Deliberately out of scope.** The convention grounds *terms*; it does **not** add a glyph or sigil notation for marking them in prose (the words carry the grounding, not a decoration), and it does not import the single-token framing, the consciousness reading, or the triple-store machinery from the research that motivated it.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./05-publishing-principle.md](/spec/publishing-principle/) — what of the conventions and their implementation is published versus kept private.
- [./02-per-chapter-format.md](/spec/per-chapter-format/) — the chapter format a convention's readable body is authored in.
- [/session/namespace-registry/](/session/namespace-registry/) — the policy block (`kind:"policy"`, `REQ-SS-POLICY`) a convention set registers as.
- [/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/) — the communication chapter that owns the readable `J1`–`J12` table.
