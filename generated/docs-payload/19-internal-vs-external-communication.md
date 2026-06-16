---
title: "Communication"
description: "The system ingests its own working material — long dictated transcripts and the memos derived from them — as an **internal working basis**. That material is written for the author and the agent, in..."
spec_version: "0.1.0"
spec_file: "19-internal-vs-external-communication.md"
order: 19
section: "Specification"
normative: true
generated_at: "2026-06-16T21:30:11.072Z"
generated_from: "spec/v0.1.0/19-internal-vs-external-communication.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/19-internal-vs-external-communication.md."
---


The system ingests its own working material — long dictated transcripts and the memos derived from them — as an **internal working basis**. That material is written for the author and the agent, in the author's own register, and it freely carries internal references, working assumptions, and shorthand. Treating that same material as if it were ready for an outside reader is a category error: it produces artifacts that read as if written for insiders, calibrated against context an outside reader does not share.

This chapter fixes the line between the two directions so that internal calibration never leaks into published, outward-facing text.

---

## Outward-Facing by Default

Everything outside `.memo/` is **outward-facing** by default. The working assumption is minimalism: the AI's default posture is "can I say more?" — not "can I remove this?" Internal is the declared exception, not the starting point.

- Material inside `.memo/` **MAY** carry internal references, working register, and insider shorthand. It is calibrated for the author and the agent, not for a stranger.
- Outside `.memo/`, an artifact is outward-facing unless explicitly declared otherwise. The burden is on the author to justify keeping something internal — not to prove an artifact is fit to go out.

---

## Outward-Facing Artifacts Require a Separate Review

Any **outward-facing** artifact **MUST** be reviewed separately before it is published. The review is a distinct step, not a side effect of authoring the inward-facing source: the directions have different audiences, a different register, and a different exposure surface.

The outward-facing artifact types that **MUST** pass this review before publication are:

| Artifact | Direction |
|----------|-----------|
| Issues | outward-facing |
| READMEs | outward-facing |
| Org profile | outward-facing |
| Website | outward-facing |
| Commit messages | outward-facing |

This list is **normative** but not closed: any other artifact a stranger can read — release notes, social posts, published spec material derived from internal personas — is outward-facing and **MUST** pass the same review.

The review checks at minimum that the artifact:

- is written for an outside reader, understandable without insider context (see [00-overview.md](/specification/overview/));
- carries no private data — paths, secrets, personal identifiers (see [16-git-security-versioning.md](/specification/git-security-versioning/));
- carries no internal reference or insider brand name (next section).

---

## No Internal References in Outward-Facing Text

Outward-facing text **MUST NOT** carry internal references or insider brand names — for example "modeled after &lt;internal project&gt;" naming a specific internal source by name.

- The **principle** behind an internal reference **MAY** inform the outward-facing work. If an internal model shaped a decision, the *property* it encodes (for example "a clean, well-run public org as the structural model") **MAY** be stated.
- The internal **name** itself **MUST** be removed. The outward-facing reader does not share the context that makes the name meaningful, and a name they cannot resolve reads as insider noise, not as a signal.

The test is direction, not secrecy: an internal name is not removed because it is confidential, but because it is calibrated for an audience the outward-facing artifact does not address. The principle travels outward; the internal name stays inward.

---

## Code Comments Are Outward-Facing

Code is, by definition, outward-facing: it is published the moment the repository is. Code comments therefore follow the same rule as any other outward-facing artifact.

- A code comment **MUST NOT** carry internal references — question IDs (see [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)), memo references, or process metadata that only resolves inside the working session.
- Handover information for a later step does **not** belong in a code comment. It belongs in the memo system, where the inward-facing material lives. A comment that says "see the decision in &lt;internal reference&gt;" is calibrated for an audience the code does not address, and it leaks the inward direction into published text.

A comment **MAY** explain *what the code does and why*, for the next reader of the code — that is outward-facing and legitimate. It **MUST NOT** be used as a back-channel into the internal process.

---

## Issue Minimalism

Issues are a special case of an outward-facing artifact: they are readable by a stranger, yet they exist to coordinate work. The rule is **minimalism** — an issue is opened only as far as is minimally necessary, scoped to the matter itself, not to the internal process behind it.

- An issue **SHOULD** describe the problem and the expected outcome, not the inward working steps that led to it.
- An issue **SHOULD NOT** expose internal process references or working-session pointers. The commit ID (see [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)) is the anchor that ties a published artifact back to inward-facing context without leaking that context outward.

The fewer issues are opened, and the less each one exposes of the inward process, the smaller the outward-facing surface.

---

## The PRD Message Channel (Concern Channel)

Handover information for a *later* PRD — a concern, a caveat, a note that the next step should account for — **MUST NOT** be parked in a code comment. There is a dedicated place for it in the memo system, and it is found through the **commit ID**.

The mechanism is: a commit corresponds to one PRD (see [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)), so the commit ID is the anchor that ties a later reader back to the inward-facing record where the concern was deposited. A future session that reads the commit trail reaches the concern through that anchor — not through a comment scattered in the code. This keeps the inward channel (concerns, handover notes) separate from the outward channel (the code itself).

This is one concept, not two: the "PRD message channel" and the "concern channel" name the same dedicated, commit-ID-anchored place in the memo system.

---

## Leak Prohibition

Beyond private data (paths, secrets, personal identifiers — see [16-git-security-versioning.md](/specification/git-security-versioning/)), an outward-facing artifact **MUST NOT** carry any of the following inward-facing leaks:

- **Pseudo-secrets** — fabricated credential-shaped strings that read as real secrets even when they are not.
- **Internal answer codes** — a question-answer notation such as a bare `F<n>=<choice>` (the *schema* is documented in [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/), but a concrete inward answer code is a leak in published text).
- **Process metadata** — inward self-assessments and status phrases (for example a "verified, not aspirational" style annotation) that describe the internal working state rather than the artifact's subject.
- **Mixed-language labels** — a label in the inward working language placed on a page written in the outward publication language. One language per artifact (see [00-overview.md](/specification/overview/)); a stray inward-language label reads as insider noise.

The test is the same as everywhere in this chapter: direction, not secrecy. Each of these is removed because it is calibrated for the inward audience, not because it is confidential.

---

## Related

- [00-overview.md](/specification/overview/) — conformance language and the self-explanatory-to-a-stranger requirement.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — the security review that keeps private data out of public artifacts.
- [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/) — commit messages as outward-facing artifacts, the inward-facing question-ID schema, and the commit ID that anchors the PRD message channel.
