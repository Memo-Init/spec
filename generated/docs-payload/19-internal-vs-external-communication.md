---
title: "Communication"
description: "This chapter is **normative** for the boundary between inward-facing inputs and outward-facing artifacts, and for the review that an artifact MUST pass before it is published."
spec_version: "0.1.0"
spec_file: "19-internal-vs-external-communication.md"
order: 19
section: "Specification"
normative: true
generated_at: "2026-06-12T00:03:53.287Z"
generated_from: "spec/v0.1.0/19-internal-vs-external-communication.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/19-internal-vs-external-communication.md."
---


> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](/specification/overview/) (Conformance Language). RFC 2119 / BCP 14 keywords are used.

This chapter is **normative** for the boundary between inward-facing inputs and outward-facing artifacts, and for the review that an artifact MUST pass before it is published.

---

## Purpose

The system ingests its own working material — long dictated transcripts and the memos derived from them — as an **internal working basis**. That material is written for the author and the agent, in the author's own register, and it freely carries internal references, working assumptions, and shorthand. Treating that same material as if it were ready for an outside reader is a category error: it produces artifacts that read as if written for insiders, calibrated against context an outside reader does not share.

This chapter fixes the line between the two directions so that internal calibration never leaks into published, outward-facing text.

---

## Inward-Facing by Default

All transcript-derived input is **inward-facing** by default. A transcript and the memo it produces are the system's internal working basis: they exist to plan and to drive a rollout, not to be read by an outside audience.

- Inward-facing material **MAY** carry internal references, working register, and insider shorthand. It is calibrated for the author and the agent, not for a stranger.
- An inward-facing artifact **MUST NOT** be published unchanged. Being inward-facing by default means the burden is on the publisher to prove an artifact is fit to go outward — not the other way around.

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

## Related

- [00-overview.md](/specification/overview/) — conformance language and the self-explanatory-to-a-stranger requirement.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — the security review that keeps private data out of public artifacts.
- [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/) — commit messages as outward-facing artifacts in the deterministic git flow.
