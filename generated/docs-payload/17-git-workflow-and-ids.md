---
title: "Git Workflow and Memo IDs"
description: "Git is used here as **backup and findability**, not as a deployment trigger. The memo ID gives every work package a stable identifier across three levels (memo → phase → PRD), and a fixed mapping..."
spec_version: "0.1.0"
spec_file: "17-git-workflow-and-ids.md"
order: 17
section: "Specification"
normative: true
generated_at: "2026-06-18T23:43:31.907Z"
generated_from: "spec/v0.1.0/17-git-workflow-and-ids.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/17-git-workflow-and-ids.md."
---


Git is used here as **backup and findability**, not as a deployment trigger. The memo ID gives every work package a stable identifier across three levels (memo → phase → PRD), and a fixed mapping ties that ID to issues, commits, and pull requests. The whole point is that one can search through the trail of work by following references.

---

## The Memo ID

The canonical identifier for a work package is:

```
{CTX}-M{NNN}-{PP}-{RR}
```

| Segment | Meaning | Example |
|---------|---------|---------|
| `{CTX}` | Short project/context prefix (2–6 uppercase letters). Distinguishes memos from different projects or areas that share the same repo or search space. | `FMC`, `MEMO`, `WIKI` |
| `M` | Fixed memo marker | `M` |
| `{NNN}` | 3-digit memo number | `024` |
| `{PP}` | 2-digit phase number | `05` |
| `{RR}` | 2-digit PRD number within the phase | `02` |

The `{CTX}` prefix is **REQUIRED** when memos from more than one project can appear in the same search space (shared repository, shared issue tracker, or shared commit log). When a project runs in a fully isolated repository with no cross-project overlap, `{CTX}` **MAY** be omitted and the short form `M{NNN}-{PP}-{RR}` is used. A project **MUST** choose its prefix once and apply it consistently — mixing prefixed and unprefixed forms within one project is not permitted.

The ID addresses three reference levels:

| Level | Format | Example | Meaning |
|-------|--------|---------|---------|
| PRD (full) | `{CTX}-M{NNN}-{PP}-{RR}` | `FMC-M024-05-02` | FlowMCP memo 024, phase 5, PRD 2 |
| Phase | `{CTX}-M{NNN}-{PP}` | `FMC-M024-05` | FlowMCP memo 024, phase 5 |
| Memo | `{CTX}-M{NNN}` | `FMC-M024` | FlowMCP memo 024 |

The 3-digit memo number is the `{NNN}` segment; an old `P{N}` phase becomes `M{NNN}-{PP}` with a leading zero; an old `PRD-{NNN}` becomes the full `M{NNN}-{PP}-{RR}`. Addressing work by ID rather than by absolute path also reduces path exposure (see [16-git-security-versioning.md](/specification/git-security-versioning/)).

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
| Branch | per memo | `memo-{NNN}-{slug}` |

### Commit message

A commit message follows the canonical bracket-prefix form:

```
[PREFIX] M{NNN}-{PP}-{RR} {Text} #{Issue}
```

The `[PREFIX]` is the project's context prefix in brackets (the same prefix as `{CTX}` above, read once from the project config). The subject line (first line) **MUST** be ≤ 50 characters. The 50-character count covers the entire first line — including the `[PREFIX]` bracket, the ID, the text, and the `#{Issue}` reference. No component is exempt. If a single-line message cannot fit within 50 characters, keep the subject line at or below the limit and add detail in the body (separated from the subject by a blank line); the body has no character limit. The `#{Issue}` reference creates the automatic link back to the phase issue. The `[PREFIX] M{NNN}-{PP}-{RR}` prefix makes every commit self-locating in the memo → phase → PRD trail.

### Pull requests across repos

Because one memo can coordinate several repositories (see [18-multidimensionality.md](/specification/multidimensionality/)), the unit of a pull request is the **affected repo**, not the memo. A memo touching three repos produces three pull requests, each on its own `memo-{NNN}-{slug}` branch in that repo.

All PRs for a memo are merged together as the final step of the rollout — the "landing the plane" moment (see [13-orchestration.md](/specification/orchestration/)). The orchestrator **MUST NOT** merge a repo's PR in isolation before the other affected repos are ready; concurrent merge keeps the multi-repo state consistent. If a PR must be merged earlier for a dependency reason, the deviation **MUST** be noted in the memo's rollout log.

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
