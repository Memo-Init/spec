---
title: "Writing Conventions"
description: "A **convention** is a standing rule the whole organization follows — how the orchestrator talks to the user, how a repository is scaffolded, how code in a given language is formatted. A convention is..."
spec_meta_version: "0.1.0"
spec_file: "06-conventions-writing.md"
order: 6
section: "Meta-Spec"
normative: true
generated_at: "2026-07-01T20:10:10.023Z"
generated_from: "draft/spec/0.1.0/spec/06-conventions-writing.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/spec/0.1.0/spec/06-conventions-writing.md."
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

Conventions are registered as a **policy block** in the session namespace registry ([/session/namespace-registry/](/session/namespace-registry/)). The policy block is the existing registry primitive for "a body of standards that is always findable, of which a sub-set must be read by a checkpoint" — the same `kind:"policy"` block that already registers the development standards. A convention set reuses it as-is:

- A policy block reserves a namespace and contributes its member rules, but it is **never a gate predecessor** — its `requires[]` is empty and it feeds no precondition edge.
- It gates only through the separate assertions axis, and only as a redirect at a named checkpoint, never as a hard block.
- Registration follows the trinary `REQ-SS-POLICY`: being registered does not make a policy block gate the way an SOP-instance block gates — a policy block is findable by construction and enforced only at its checkpoints.

Because the mechanism already exists, registering a new convention set is a matter of adding its rules to a policy block, not of designing new machinery. This is the YAGNI discipline in force: the standards body ("a set of conventions that must be followed") is exactly what a policy block models, so a convention set **MUST** register as one rather than spawn a parallel primitive.

---

## No Double Normativity

A convention has one normative home. When a convention set is registered as a policy block, the readable table in its owning chapter remains the human-facing source, and the policy block holds the activation-and-tracking registration — the two do not both assert the rule. A reader who wants to *understand* a convention reads the owning chapter; a tool that must *enforce* it reads the policy block. Keeping the description and the registration in separate places, each single-source, is what prevents the two copies from drifting.

The communication conventions `J1`–`J12` are the worked example: their readable table lives in the communication chapter ([/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/)), and their registration lives in the session policy block ([/session/namespace-registry/](/session/namespace-registry/)). The table describes; the policy block registers; neither restates the other.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./05-publishing-principle.md](/specification/publishing-principle/) — what of the conventions and their implementation is published versus kept private.
- [./02-per-chapter-format.md](/specification/per-chapter-format/) — the chapter format a convention's readable body is authored in.
- [/session/namespace-registry/](/session/namespace-registry/) — the policy block (`kind:"policy"`, `REQ-SS-POLICY`) a convention set registers as.
- [/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/) — the communication chapter that owns the readable `J1`–`J12` table.
