---
title: "Git Workflow and Memo IDs"
description: "Git is used here as **backup and findability**, not as a deployment trigger. The memo ID gives every work package a stable identifier across three levels (memo → phase → PRD), and a fixed mapping..."
spec_version: "0.1.0"
spec_file: "17-git-workflow-and-ids.md"
order: 17
section: "Specification"
normative: true
generated_at: "2026-06-27T09:35:23.180Z"
generated_from: "spec/v0.1.0/17-git-workflow-and-ids.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/17-git-workflow-and-ids.md."
---


Git is used here as **backup and findability**, not as a deployment trigger. The memo ID gives every work package a stable identifier across three levels (memo → phase → PRD), and a fixed mapping ties that ID to issues, commits, and pull requests. The whole point is that one can search through the trail of work by following references.

---

## The Memo ID

The canonical work-package identifier — `{CTX}-M{NNN}-{PP}-{RR}`, its segments, the `{CTX}` prefix rule, and the three reference levels (PRD / phase / memo) — is **defined in [35-memo-authoring.md](/specification/memo-authoring/#the-memo-id)**, next to the act of authoring that creates it. This chapter does not repeat that definition; it specifies how the ID is **used** in the git workflow.

In short form, the ID is `{CTX}-M{NNN}-{PP}-{RR}` (the `{CTX}` prefix MAY be dropped in a fully isolated repository, giving `M{NNN}-{PP}-{RR}`). Addressing work by this ID rather than by absolute path also reduces path exposure (see [16-git-security-versioning.md](/specification/git-security-versioning/)). Everything below — question IDs, the issue/commit mapping, branch naming, and the findability references — builds on that one identifier.

---

## Question IDs (Memo-Level References)

Open questions raised during a memo's revision loop are referenced by a stable **question ID**. The default schema is:

```
M{NNN}-F{N}
```

| Segment | Meaning | Example |
|---------|---------|---------|
| `M{NNN}` | 3-digit memo number | `M003` |
| `F` | Fixed question marker | `F` |
| `{N}` | Question number within the memo | `4` |

The answer to a question is noted with the schema `M{NNN}-F{N}=<choice>` (for example `M003-F4=A`), where `<choice>` is the selected option. When a question is scoped to a specific PRD rather than the whole memo, the ID **MAY** be extended:

```
M{NNN}-P{PP}-PRD{RR}-F{N}
```

(for example `M003-P02-PRD05-F4`). A reference **MUST** use one of these two forms so that every question is findable by full-text search. The single regex that matches both forms is:

```
M\d{3}(-P\d+)?(-PRD\d+)?-F\d+
```

A reference **MUST NOT** be written in free prose (for example "question 4 = C") — the regex-findable ID replaces unstructured notation so the question trail can be searched the same way the commit trail can.

The question-ID schema is a **memo-level default** that **complements** the canonical work-package ID `M{NNN}-{PP}-{RR}` defined above; it does **not** replace the phase/PRD ID. The two address different things: the work-package ID addresses a unit of work, the question ID addresses a decision point within the memo that produced it.

Question IDs are **inward-facing** by definition: they live in the memo's revision loop and **MUST NOT** appear in outward-facing artifacts (issues, READMEs, commit messages, published text). For the inward/outward boundary and the rule that keeps internal references out of published artifacts, see [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/).

---

## The Mapping

A fixed mapping ties the ID to git artifacts:

| Unit | Maps to | Rule |
|------|---------|------|
| 1 Phase | 1 Issue | Each phase has exactly one issue (`M{NNN}-{PP}` reference) |
| 1 Commit | 1 PRD | A commit corresponds to one PRD |
| 1 PR | 1 affected repo | One pull request per affected repository, not one per memo |
| Branch | per memo | `<PREFIX>-{NNN}-{slug}` (the canonical branch-naming schema below) |

### Commit message

A commit message follows the canonical bracket-prefix form:

```
[PREFIX] M{NNN}-{PP}-{RR} {Text} #{Issue}
```

The `[PREFIX]` is the project's context prefix in brackets (the same prefix as `{CTX}` above, read once from the project config). The subject line (first line) **MUST** be ≤ 50 characters. The 50-character count covers the entire first line — including the `[PREFIX]` bracket, the ID, the text, and the `#{Issue}` reference. No component is exempt. If a single-line message cannot fit within 50 characters, keep the subject line at or below the limit and add detail in the body (separated from the subject by a blank line); the body has no character limit. The `#{Issue}` reference creates the automatic link back to the phase issue. The `[PREFIX] M{NNN}-{PP}-{RR}` prefix makes every commit self-locating in the memo → phase → PRD trail.

### Pull requests across repos

Because one memo can coordinate several repositories (see [18-multidimensionality.md](/specification/multidimensionality/)), the unit of a pull request is the **affected repo**, not the memo. A memo touching three repos produces three pull requests, each on its own canonical branch (the `<PREFIX>-{NNN}-{slug}` schema below) in that repo.

All PRs for a memo are merged together as the final step of the rollout — the "landing the plane" moment (see [13-orchestration.md](/specification/orchestration/)). The orchestrator **MUST NOT** merge a repo's PR in isolation before the other affected repos are ready; concurrent merge keeps the multi-repo state consistent. If a PR must be merged earlier for a dependency reason, the deviation **MUST** be noted in the memo's rollout log.

---

## Branch Naming

There is exactly **one** canonical branch-naming schema, and it is rooted on the full prefixed memo-ID — the same `{CTX}` prefix and `{NNN}` memo number defined above. Earlier drafts carried a second, unprefixed `memo-{NNN}-{slug}` shape; that shape is **RETRACTED**. Two competing schemas that both interpolate `{NNN}` are exactly how a branch ends up carrying the wrong number, so only one schema is permitted.

The canonical branch name is:

```
<PREFIX>-{NNN}-{slug}[/p{N}[-prd{RR}]]
```

| Segment | Meaning | Source |
|---------|---------|--------|
| `<PREFIX>` | The project's context prefix (the same `{CTX}` as the memo-ID). | Read once from the project config (the `projectPrefix` entry), never typed by hand. |
| `{NNN}` | 3-digit memo number. | The memo directory name (`{NNN}-{slug}`). |
| `{slug}` | The memo's kebab slug. | The memo directory name. |
| `/p{N}` | Optional phase suffix, added when the branch is scoped to one phase. | The phase number. |
| `-prd{RR}` | Optional PRD suffix, appended to the phase suffix when the branch is scoped to one PRD. A PRD suffix **MUST NOT** appear without a phase suffix (a PRD lives inside a phase). | The PRD number. |

The base form `<PREFIX>-{NNN}-{slug}` is the per-memo branch. The `/p{N}` and `/p{N}-prd{RR}` forms are the same branch lifecycle scoped down to a phase or a PRD; they are not a different branch family.

### The CLI Leaf Is the Source of Truth

The prefix and the memo number/slug are not retyped at each branch creation — that is precisely how a wrong number gets introduced. The branch name is **derived deterministically** by a single CLI leaf, `memo git branch-name`, which reads the prefix from the project config and the `{NNN}-{slug}` id from the memo directory name and assembles the canonical schema above. That leaf is the **source of truth** for the branch name; any tool, skill, or human that needs the branch name **MUST** obtain it from this leaf rather than constructing the string independently.

### Fail-Loud Rule

The derivation is **fail-loud**. If the project config is missing or carries no non-empty prefix, or if the supplied memo cannot be resolved to an `{NNN}-{slug}` id from a directory name, the leaf **MUST** fail with a clear error and a repair hint — it **MUST NOT** emit a branch name built from a guessed or defaulted number or prefix. A missing prefix is an error to surface, never a value to invent (this is the same no-silent-default discipline that governs the deterministic git flow in [16-git-security-versioning.md](/specification/git-security-versioning/)).

### Branch-Number Gate (normative)

A pre-merge / stale-guard check **MUST** compare the working branch against the value produced by `memo git branch-name` for the memo being landed. The check **MUST** block the merge when the working branch's memo number does not equal the memo-ID's number. A branch whose number disagrees with the memo it claims to implement is a wrong-numbered branch, and a wrong-numbered branch **MUST NOT** be merged. Because the CLI leaf is the single source of truth, the comparison is deterministic: there is one expected branch name, and a working branch that does not match it on the number segment fails the gate. This gate is the enforcement counterpart of the fail-loud derivation — the derivation prevents a wrong number from being produced, the gate prevents a wrong number from being merged.

---

## References for Findability

The mapping exists so that the work can be searched through: from a commit one reaches the issue (`#{Issue}`), from the issue one reaches the phase (`M{NNN}-{PP}`), from the phase one reaches the memo (`M{NNN}`), and the memo's `context/` and `rollout/` hold the primary material. Every reference is a pointer one can follow — the same pointer principle that governs handovers (see [13-orchestration.md](/specification/orchestration/)).

---

## Commit Is Not Push

A **commit is not a push.** A commit is backup and an orientation marker for a future session — it lets a later context reconstruct what was actually done. A push is a separate, deliberate act and is **never executed automatically**; pushing to GitHub is always a user-initiated step. This separation is what keeps the deterministic git flow (see [16-git-security-versioning.md](/specification/git-security-versioning/)) from "running out of control" after a rollout stop.

---

## Related

- [16-git-security-versioning.md](/specification/git-security-versioning/) — the deterministic git flow, worktree cleanup, `git-security` gate, and issue rules.
- [18-multidimensionality.md](/specification/multidimensionality/) — one memo coordinating multiple repos, the reason a PR is per-repo.
- [13-orchestration.md](/specification/orchestration/) — the rollout that produces the commits and the per-phase issues.
- [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/) — why question IDs stay inward-facing and never appear in published artifacts.
- [00-overview.md](/specification/overview/) — conformance language.
