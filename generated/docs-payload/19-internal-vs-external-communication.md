---
title: "Communication"
description: "The system ingests its own working material — long dictated transcripts and the memos derived from them — as an **internal working basis**. That material is written for the author and the agent, in..."
spec_version: "0.1.0"
spec_file: "19-internal-vs-external-communication.md"
order: 19
section: "Specification"
normative: true
generated_at: "2026-06-30T15:14:56.520Z"
generated_from: "spec/v0.1.0/19-internal-vs-external-communication.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/19-internal-vs-external-communication.md."
---


The system ingests its own working material — long dictated transcripts and the memos derived from them — as an **internal working basis**. That material is written for the author and the agent, in the author's own register, and it freely carries internal references, working assumptions, and shorthand. Treating that same material as if it were ready for an outside reader is a category error: it produces artifacts that read as if written for insiders, calibrated against context an outside reader does not share.

This chapter fixes the line between the two directions so that internal calibration never leaks into published, outward-facing text.

---

## Outward-Facing by Default

Everything outside `.memo/` is **outward-facing** by default. The working assumption is minimalism: the AI's default posture is "can I say more?" — not "can I remove this?" Internal is the declared exception, not the starting point. This default is about **communication register** — how something is written and what it exposes — not about where the bytes live: content can be outward-facing in register and still fully **local** (the project root stays on the machine unless something is deliberately published from it). Register and locality are separate axes.

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
- **Mixed-language labels** — a label in the inward working language placed on a page written in the outward publication language. One language per artifact (see *Language per Artifact* below); a stray inward-language label reads as insider noise.

The test is the same as everywhere in this chapter: direction, not secrecy. Each of these is removed because it is calibrated for the inward audience, not because it is confidential.

This prohibition is authored as a declarative requirement — its `statement` shapes generation, its `check` is the deterministic spec scanner, and its `grade` is `binary` because a leak is a hard yes/no condition, not a quality spectrum:

```requirement
{
  "id": "REQ-056",
  "title": "No internal references in outward-facing spec text",
  "statement": "Outward-facing spec text (the numbered chapters and the chapter-index README) MUST NOT carry concrete internal references: memo-numbered gate or answer codes, concrete goal-store ids, or memo references in prose. The ID and goal schema itself is documented public vocabulary and is exempt — a line carrying only a schema-token placeholder is not a leak. The check is the deterministic spec-quality scanner over the corpus.",
  "scope": { "repos": ["spec"], "categories": [], "tags": [] },
  "severity": "blocker",
  "check": { "kind": "tool", "tool": "audit-spec-quality", "tactic": "no-internal-ref-scan" },
  "grade": "binary"
}
```

---

## Language per Artifact

A single artifact is written in **one language** and does not mix two inside it ("no Denglish"). This is the register counterpart of the inward/outward axis above: the language an artifact uses follows its direction.

| Artifact | Language |
|----------|----------|
| Code and code comments | the project's publication language, one consistent choice |
| Commits, issues, pull requests, READMEs, published docs, website | the publication language |
| Inward memo material (`.memo/`) | the project's **working** language — **MAY** differ from the publication language |
| Conversation with the user | the user's language |

- An **outward-facing** artifact **MUST** be written in the publication language; an inward-language label on an outward page is a leak (see *Leak Prohibition* above).
- An **inward-facing** artifact **MAY** use a working language different from the publication language — the inward register is calibrated for the author, not for a stranger.
- The **specific** languages are a **project choice**, recorded in the project's own configuration / house rules, not fixed by this specification. A project that writes its memos in one natural language and publishes in another conforms as long as each artifact stays single-language. The consistency check that enforces single-language-per-artifact at finalization is specified in [11-quality-and-finalization.md](/specification/quality-and-finalization/).

---

## The Trust Layer — Communicating to the User

The directions above govern *published artifacts*. There is a third communication surface this chapter also owns: how the **orchestrator speaks to the user** during a run (Protocol A of the three-layer model, see [21-human-computer-interaction.md](/specification/human-computer-interaction/)). When the orchestrator is *also* the user's output channel, the user is easily buried in text and the important thing is lost underneath. The trust layer is the discipline that prevents that.

> **Surface-only output contract (invariant).** The default state of the user thread is **empty**. Surfacing a line to the user is a **deliberate, per-event decision** — large/important decisions and notable events only — never an automatic relay of everything the workers produced. A worker's intermediate output reaches the user only when the orchestrator chooses to surface it.

The convention has twelve binding points (J1–J12):

| # | Requirement |
|---|-------------|
| J1 | Communication reads the **same regardless of which skill** is running — the user should not have to infer the active skill from the style. |
| J2 | At the start of a run, **name the affected repos / files / tools** so the user knows the blast surface up front. |
| J3 | Report the **unusual proactively** (an out-of-the-ordinary access or action), rather than letting it pass silently. |
| J4 | Prefer **tables and clear structure with a recommendation** over a wall of prose. |
| J5 | Speak to the user in the **user's register**, never in the internal worker-context language. |
| J6 | Be **100 % honest**; an unusual outcome is **discussed**, not glossed — a surprise erodes trust. |
| J7 | Give **regular, structured updates** on a recurring cadence, so the user can step away and return informed. |
| J8 | Let the user **look into the orchestrator** — its progress is observable, not a black box. |
| J9 | Use **full, unambiguous paths** so a reference cannot be misread. |
| J10 | Keep **naming clarity** — which project, which memo — so the user is never unsure what is being acted on. |
| J11 | Keep the **question interface clearly defined** (see [34-question-interface.md](/specification/question-interface/)). |
| J12 | Treat **surprises as negative** — an unannounced outcome is a defect of communication, even when the work itself is fine. |

The clean-terminal *mechanisms* that make this enforceable rather than merely aspirational (event watcher, cadence timer, out-of-band notification, workflow progress panel) are listed in [21-human-computer-interaction.md](/specification/human-computer-interaction/). The rule here is the convention; the mechanisms there are how it is carried out.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [00-overview.md](/specification/overview/) — conformance language and the self-explanatory-to-a-stranger requirement.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — the security review that keeps private data out of public artifacts.
- [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/) — commit messages as outward-facing artifacts, the inward-facing question-ID schema, and the commit ID that anchors the PRD message channel.
- [21-human-computer-interaction.md](/specification/human-computer-interaction/) — the three communication layers and the clean-terminal mechanisms that carry out the Trust-Layer convention.
- [34-question-interface.md](/specification/question-interface/) — the question interface referenced by J11.
