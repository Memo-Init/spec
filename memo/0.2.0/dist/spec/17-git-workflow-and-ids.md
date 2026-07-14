---
title: "Git Workflow and Memo IDs"
description: "Git is used here as **backup and findability**, not as a deployment trigger. The memo ID gives every work package a stable identifier across three levels (memo → phase → PRD), and a fixed mapping..."
spec_version: "0.2.0"
spec_file: "17-git-workflow-and-ids.md"
order: 17
section: "Specification"
normative: true
generated_at: "2026-07-14T15:16:00.355Z"
generated_from: "memo/0.2.0/draft/spec/17-git-workflow-and-ids.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.2.0/draft/spec/17-git-workflow-and-ids.md."
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

### Issue Reference by Repo Type (Rule C1)

Whether a phase maps to a GitHub **issue** at all depends on the repository's facing (the `facing` axis of the repo status, see [16-git-security-versioning.md](/specification/git-security-versioning/)). An issue is itself an outward-facing artifact (see [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/)), so a repository that is never published cannot carry one without contradicting its own inward direction.

| Repo type | Orientation reference | Rule |
|-----------|-----------------------|------|
| **Outward** (published GitHub repo) | Issue (`#{N}`) | The `1 Phase → 1 Issue` mapping above applies in full; every commit ties back to its phase issue. |
| **Local-only** (never pushed) | Memo-ID (`M{NNN}-{PP}-{RR}`) | No issue is created — it would be an outward-facing artifact in a repo that is never published. The memo-ID is the orientation reference in its place. |

**Rule C1:** a unit of work carries an **issue reference or a memo-ID reference according to its repo type — never both, and never neither.** The `1 Phase → 1 Issue` row is the outward case; for a local-only repo, read "issue" as "memo-ID". This resolves the otherwise-contradictory expectation that every commit must both reference an issue and avoid creating outward-facing artifacts in a repository that is never published.

### Commit message

A commit message follows the canonical bracket-prefix form:

```
[PREFIX] M{NNN}-{PP}-{RR} {Text} #{Issue}
```

The `[PREFIX]` is the project's context prefix in brackets (the same prefix as `{CTX}` above, read once from the project config). The subject line (first line) **MUST** be ≤ 50 characters. The 50-character count covers the entire first line — including the `[PREFIX]` bracket, the ID, the text, and the `#{Issue}` reference. No component is exempt. If a single-line message cannot fit within 50 characters, keep the subject line at or below the limit and add detail in the body (separated from the subject by a blank line); the body has no character limit. The `#{Issue}` reference creates the automatic link back to the phase issue. The `[PREFIX] M{NNN}-{PP}-{RR}` prefix makes every commit self-locating in the memo → phase → PRD trail.

### Pull requests across repos

Because one memo can coordinate several repositories (see [18-multidimensionality.md](/specification/multidimensionality/)), the unit of a pull request is the **affected repo**, not the memo. A memo touching three repos produces three pull requests, each on its own canonical branch (the `<PREFIX>-{NNN}-{slug}` schema below) in that repo.

All PRs for a memo are merged together as the final step of the rollout — the "landing the plane" moment (see [13-orchestration.md](/specification/orchestration/)). The orchestrator **MUST NOT** merge a repo's PR in isolation before the other affected repos are ready; concurrent merge keeps the multi-repo state consistent. If a PR must be merged earlier for a dependency reason, the deviation **MUST** be noted in the memo's rollout log.

### Local-Only Folders: Light Commits, No Merge Ceremony

The mapping above — one issue per phase, one pull request per affected repo, concurrent merge — is the ceremony of an **outward** repository: one with a remote to push to. A **local-only folder** — any folder versioned by a local git with **no remote** (the project root, the memo store, a `spec/` workshop, or a `repos/` repository declared `inward` / `remote: none`) — has no remote, so most of that ceremony simply does not apply. Following the workbench norm *git everywhere, remote only in the published repositories*, versioning is available everywhere for backup and findability, but the merge apparatus is reserved for the folders that actually publish.

For a local-only folder the ceremony is **decluttered** to light commits:

- **No pull request, no CI.** A pull request and its CI run are remote artifacts; a folder with no remote has nothing to open a PR against and nothing to trigger. The `1 PR → 1 affected repo` mapping is scoped to the published repositories and does not reach a local-only folder.
- **No issue.** By rule C1 a never-published folder carries no outward-facing issue; its orientation reference is the memo-ID.
- **No compelled worktree or branch.** The worktree/branch apparatus exists to stage an outward merge. A local-only folder is **not** compelled to use it; its versioning is **light commits** — a commit is backup and an orientation marker (see [Commit Is Not Push](#commit-is-not-push) below), nothing more.

In short: a local-only folder is versioned with **light commits** and no merge ceremony, while the full ritual — branch, PR, CI, concurrent merge — is reserved for the repositories that actually have a remote to push to.

---

## Branch Naming

This chapter — in the memo family's git workflow — is the **single authoritative home** for branch naming across the whole specification landscape. The branch name is rooted on the **memo-ID** and derived by the `memo git branch-name` leaf, both of which are memo-family anchors; so any other specification that touches branch naming (for example the Workbench family) **references this chapter rather than re-normalizing it**. There is no second "authoritative home".

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

## Conformity Requirements

The workflow and ID rules above are not only prose. The chapter's binding `MUST`s are authored here **prose-first** as declarative requirements (the prose-first guard, [35-memo-authoring.md](/specification/memo-authoring/)): each rule's `statement` faces generation and its `check` faces the commit/merge gate, ternary `PASS` / `BLOCKED` / `INCONCLUSIVE`. These checks are deterministic — they verify a subject-line shape, an ID-segment match, or a derivation outcome — and the structured blocks below are the machine-readable source the requirement store is **harvested** from ([23-requirements.md](/specification/requirements/)).

The canonical commit subject is a fixed bracket-prefix shape, and its 50-character budget covers the whole first line — a hard yes/no rule, so `binary`:

```requirement
{
  "id": "REQ-888",
  "title": "Commit subject follows the canonical bracket-prefix form within 50 characters",
  "statement": "A commit subject (first line) MUST follow the canonical bracket-prefix form `[PREFIX] M{NNN}-{PP}-{RR} {Text} #{Issue}` and MUST be ≤ 50 characters across the entire line (prefix, ID, text, and issue reference all counted, none exempt); detail that does not fit goes in the body after a blank line, which has no length limit.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-workflow", "commit-message"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The subject line matches the bracket-prefix + memo-ID pattern `[PREFIX] M{NNN}-{PP}-{RR} ... `",
      "The subject line length is ≤ 50 characters including the prefix and any issue reference",
      "Overflow detail, if any, lives in the body separated from the subject by a blank line"
    ]
  },
  "grade": "binary"
}
```

Whether a commit ties to an issue or to a memo-ID depends on the repo's facing — and it is always exactly one of the two (Rule C1):

```requirement
{
  "id": "REQ-889",
  "title": "Orientation reference follows repo facing (Rule C1)",
  "statement": "Whether a commit ties to a GitHub issue depends on the repository's facing (Rule C1): a published (outward) repo MUST create the phase issue and reference it (`#{N}`) on every commit, while a local-only (never-pushed) repo MUST NOT create an outward-facing issue and instead uses the memo-ID as its orientation reference — a unit of work carries an issue reference or a memo-ID-only reference according to its repo type, never an issue in a never-published repo and never a published repo whose commits skip the issue.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-workflow", "issue-reference"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "An outward repo's commit references its phase issue (`#{N}`)",
      "A local-only repo created no GitHub issue and its commits orient by memo-ID",
      "No never-published repo carries an outward-facing issue"
    ]
  },
  "grade": "binary"
}
```

A question reference is searchable only if it follows the fixed ID shape and stays out of published text — never free prose:

```requirement
{
  "id": "REQ-890",
  "title": "Question references use the canonical ID and stay inward-facing",
  "statement": "A question reference MUST use one of the two canonical forms — `M{NNN}-F{N}` or the PRD-scoped `M{NNN}-P{PP}-PRD{RR}-F{N}` (both matched by `M\\d{3}(-P\\d+)?(-PRD\\d+)?-F\\d+`) — never free prose such as 'question 4 = C', and being inward-facing it MUST NOT appear in any outward artifact (issue, README, commit message, published text).",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-workflow", "question-id"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Every question reference matches the canonical regex `M\\d{3}(-P\\d+)?(-PRD\\d+)?-F\\d+`",
      "No question reference is written in free prose",
      "No question ID appears in an outward-facing artifact"
    ]
  },
  "grade": "binary"
}
```

A branch whose number disagrees with the memo it claims to implement must never be merged; the gate compares against the single source-of-truth leaf:

```requirement
{
  "id": "REQ-891",
  "title": "Pre-merge gate blocks a wrong-numbered branch",
  "statement": "A pre-merge gate MUST compare the working branch against the value produced by the `memo git branch-name` leaf for the memo being landed and MUST block the merge when the branch's memo-number segment does not equal the memo-ID's number; a wrong-numbered branch MUST NOT be merged.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-workflow", "branch-number-gate"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "memo",
    "tactic": "branch-name-compare",
    "verify": [
      "Run `memo git branch-name` for the memo being landed",
      "Assert the working branch's number segment equals the produced name's number",
      "Block the merge on a number mismatch"
    ]
  },
  "grade": "binary"
}
```

The branch name is derived, never retyped, and the derivation fails loudly rather than inventing a number:

```requirement
{
  "id": "REQ-892",
  "title": "Branch-name derivation is single-source and fail-loud",
  "statement": "The canonical branch name MUST be derived by the single `memo git branch-name` leaf (reading the prefix from project config and the `{NNN}-{slug}` id from the memo directory), and the derivation MUST fail loudly — a clear error plus a repair hint — when the prefix is missing/empty or the memo cannot be resolved to an id; it MUST NOT emit a branch name built from a guessed or defaulted prefix or number.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-workflow", "branch-naming"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "memo",
    "tactic": "branch-name",
    "verify": [
      "Invoke the leaf with a missing/empty prefix and assert it errors rather than emitting a name",
      "Invoke with an unresolvable memo and assert a fail-loud error carrying a repair hint",
      "Assert no guessed or defaulted number is ever emitted"
    ]
  },
  "grade": "binary"
}
```

The unit of a pull request is the affected repo, not the memo, and no single repo's PR is merged ahead of the others without a recorded reason:

```requirement
{
  "id": "REQ-893",
  "title": "One pull request per affected repo, no isolated early merge",
  "statement": "A memo that touches multiple repositories MUST open one pull request per affected repository (not one per memo), each on its own canonical `<PREFIX>-{NNN}-{slug}` branch and carrying the memo-ID prefix in its title; the orchestrator MUST NOT merge one repo's PR in isolation before the other affected repos are ready unless the early merge is recorded in the rollout log.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-workflow", "pull-request"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The number of pull requests equals the number of affected repositories",
      "Each PR sits on the canonical branch for its repo and carries the memo-ID prefix in its title",
      "No affected repo's PR is merged in isolation without a recorded deviation in the rollout log"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [16-git-security-versioning.md](/specification/git-security-versioning/) — the deterministic git flow, worktree cleanup, `git-security` gate, and issue rules.
- [18-multidimensionality.md](/specification/multidimensionality/) — one memo coordinating multiple repos, the reason a PR is per-repo.
- [13-orchestration.md](/specification/orchestration/) — the rollout that produces the commits and the per-phase issues.
- [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/) — why question IDs stay inward-facing and never appear in published artifacts.
- [00-overview.md](/specification/overview/) — conformance language.
