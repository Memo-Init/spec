---
title: "Landing the Plane"
description: "Landing the plane is the second stage of the process end, the step that follows a green Evaluate. The rollout (Generate, Execute, Evaluate) is the first stage; landing is the second, and merge..."
spec_version: "0.1.0"
spec_file: "27-landing-the-plane.md"
order: 27
section: "Specification"
normative: true
generated_at: "2026-07-11T22:48:52.283Z"
generated_from: "memo/0.1.0/draft/spec/27-landing-the-plane.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.1.0/draft/spec/27-landing-the-plane.md."
---


Landing the plane is the second stage of the process end, the step that follows a green Evaluate. The rollout (Generate, Execute, Evaluate) is the first stage; landing is the second, and merge preparation and the push gate follow it (see [38-stage-model.md](/specification/stage-model/)). Where Evaluate decides whether the work is correct, landing decides whether the workspace is in a state someone can resume. It leaves the workspace better than it was found, in a condition a fresh context can pick up the next morning without questions. This is the precondition of the "interlocking brick" principle: a new memo only docks cleanly onto a workspace that the previous memo left correctly.

Landing prepares; it does not perform the merge. As Stage 2 it makes the workspace startable and push-ready in principle — worktrees cleaned, open ends named, the chronicle written — and hands off to Merge Preparation (Stage 3), which carries every working branch through a local merge up to `main`. The division of labour between these two stages is fixed in [38-stage-model.md](/specification/stage-model/) and is referenced throughout this chapter.

---

## Why Landing Is Its Own Step

Landing is the step most easily skipped, because by the time the work is done the context is full and the temptation is to declare victory and stop. That failure mode is concrete: landing late, inside a single long-running context that already carried Generate, Execute, and Evaluate, produces a pile of uncommitted, undocumented changes — work that is finished but not handed off, branches no one merged, commits no one wrote, open ends no one named. The next session inherits a mess and spends its first hour reconstructing state instead of building.

The fix has two parts. First, the rollout runs as separate phases with separate contexts, so landing is not crowded out by the residue of execution. Second, a context reset happens **before** landing, so the landing step works from a clean view of the workspace as it actually is — not from a contaminated memory of what the work intended. Landing is therefore a deliberate, isolated step with one job: render the end-state legible and resumable.

---

## The Landing Document — Six Sections

The landing produces a single document with a fixed, deterministic structure. The sections are always the same and always in this order, so any reader (human or fresh context) finds the same information in the same place every time.

- **STATUS** — the one-line verdict of where the run ended: complete, partially complete, or open. A `verdict: OPEN` is not a failure; honest landing names open ends rather than hiding them.
- **WHAT WAS DONE** — a table with one row per repository, recording what changed in each. The per-repo table is the canonical record of the rollout's footprint across the workspace.
- **PILOT TASKS** — a numbered list of the actions left for the pilot to take. Each task carries a recommendation, so the pilot is not merely told what is pending but advised on how to act on it.
- **OPEN ENDS** — what is not finished, grouped into three categories: items deferred by decision, items blocked on an external dependency, and items that need review before they can close. These landing categories are per-open-end and applied at the close of the rollout; they are distinct from the per-unit three exits of Worker output during execution (set / justified-omit / blocked, see [13-orchestration.md](/specification/orchestration/)) and MUST NOT be conflated with them.
- **MACHINE-READABLE** — a `landing-readiness.json` marker capturing the end-state in structured form, so an orchestrator or a fresh context can read the landing without parsing prose.
- **RE-ENTRY** — the exact command to resume, written out literally so the next session can copy it and continue without rediscovering how to restart.

---

## The Landing Checklist (L1–L7)

Landing is complete when these items hold:

- **L1** — Worktrees are cleaned. No stray worktrees are left behind; each one created during the rollout is removed or accounted for. Worktree cleanup is a mandatory part of landing, not an optional tidy-up.
- **L2** — Branches are carried through to a local merge. Landing (Stage 2) leaves the workspace startable; Merge Preparation (Stage 3) then takes every working branch through a local merge up to `main` (see [38-stage-model.md](/specification/stage-model/)). Merging is the default outcome: a branch is folded back into `main` unless there is a justified exception, in which case the landing document names that branch and the explicit reason it remains unmerged. "Documented instead of merged" is an exception with a named reason, never the easy default that leaves stub branches behind.
- **L3** — Commits are prepared and locally merged, but **never pushed**. The system commits the per-PRD changes and performs the deterministic local merge up to `main` during merge preparation; what stays with the pilot is the push. A commit is not a push, and a local merge is not a release: the system prepares commits and merges locally to a clean, push-ready `main`, but the push — the single act of release — is never automatic and is always the pilot's.
- **L4** — Open ends are named. Deferred items, blocker resolutions, and needs-review remnants appear in the OPEN ENDS section; nothing finished-but-unstated is left implicit.
- **L5** — The end-state is machine-readable. The `landing-readiness.json` marker is written so the landing can be consumed without reading prose.
- **L7** — Exactly one narrated chronicle entry is appended. At the close of landing the system writes a single narrated chronicle entry for the memo via the canonical `memo chronic add` command (append-only, chaining N→N-1), naming the touched topic IDs and telling the real sequence of work — what was done, what was given up. This is what lets the next memo dock cleanly: the next `memo-init` reads the chronicle and lands on the right places (the interlocking-brick principle). The existing L1-L5 points are unchanged; the chronicle point is L7 and the former L6 slot is deliberately left unassigned.

---

## Pilot and System

The **user is the pilot**; the system prepares a landing the pilot can act on with as few questions as possible. The boundary is sharp and is a hard rule, but it falls at the push, not at the commit. The system commits the per-PRD changes and performs the deterministic local merge up to `main` during merge preparation; what stays with the pilot is the push. A commit is not a push, and a local merge is not a release: the system prepares commits and merges locally to a clean, push-ready `main`, but the push — the single act of release — is never automatic and is always the pilot's. This replaces the older "never committed by the system" framing with "committed and locally merged, never pushed".

Two distinctions sharpen this. A commit is not a push: the system writes the commits and folds the branches together locally, but the push that releases them is a further, separate act that is never automatic. And a clean, push-ready `main` is the system's ceiling — the work is committed, merged, and explained, but the decision to release it is the pilot's, taken at the next break. A `verdict: OPEN` is not a failure: honest landing names open ends rather than hiding them, and the system's job remains to leave the pilot a landing that needs as few questions as possible.

---

## Conformity Requirements

The landing checklist above is a binding gate, not only guidance. The rule that a completed phase leaves no loose ends behind — no open worktrees, branches, or stashes and no dead code — is authored here as a declarative requirement, the machine-readable source the requirement store is harvested from ([23-requirements.md](/specification/requirements/)). The check faces the end-of-phase gate, and the doer is not the grader.

The landing is complete only when the working state is clean, so the check is a hard yes/no over the repository state:

```requirement
{
  "id": "REQ-052",
  "title": "A completed phase leaves no loose git state or dead code",
  "statement": "After a phase completes there are no open worktrees, branches, or stashes and no dead code left behind — the work is landed. Worktrees created for the phase are removed or pruned, temporary branches are folded in, and stashes are resolved rather than left dangling.",
  "scope": { "repos": [], "categories": ["repo"], "tags": [] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No open worktrees, branches, or stashes belonging to the completed phase remain",
      "No dead or commented-out code introduced by the phase is left behind"
    ]
  }
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [12-rollout.md](/specification/rollout/) — the rollout (Stage 1) that runs Generate, Execute, and Evaluate before this landing stage.
- [38-stage-model.md](/specification/stage-model/) — the four-stage process end; landing is Stage 2, merge preparation (the local merge up to `main`) is Stage 3, and the push gate is Stage 4.
- [13-orchestration.md](/specification/orchestration/) — the orchestrator, agent team, and state files that drive the rollout and feed the machine-readable marker.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — the deterministic git flow governing worktrees, branches, and the commits and local merge the landing and merge preparation prepare.
- [00-overview.md](/specification/overview/) — conformance language.
