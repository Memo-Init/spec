---
title: "Landing the Plane"
description: "Landing the plane is the fourth step of the rollout, after Generate, Execute, and Evaluate. Where Evaluate decides whether the work is correct, landing decides whether the workspace is in a state..."
spec_version: "0.1.0"
spec_file: "27-landing-the-plane.md"
order: 27
section: "Specification"
normative: true
generated_at: "2026-06-20T17:41:22.408Z"
generated_from: "spec/v0.1.0/27-landing-the-plane.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/27-landing-the-plane.md."
---


Landing the plane is the fourth step of the rollout, after Generate, Execute, and Evaluate. Where Evaluate decides whether the work is correct, landing decides whether the workspace is in a state someone can resume. It leaves the workspace better than it was found, in a condition a fresh context can pick up the next morning without questions. This is the precondition of the "interlocking brick" principle: a new memo only docks cleanly onto a workspace that the previous memo left correctly.

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

- **L1** — Worktrees are cleaned. No stray worktrees are left behind; each one created during the rollout is removed or accounted for.
- **L2** — Branches are merged or documented. Every branch is either folded back into its target or named explicitly in the landing document with its reason for remaining.
- **L3** — Commits are prepared and presented, but **never committed by the system**. The changes are staged and described so the pilot can commit them, but the act of committing stays with the pilot.
- **L4** — Open ends are named. Deferred items, blocker resolutions, and needs-review remnants appear in the OPEN ENDS section; nothing finished-but-unstated is left implicit.
- **L5** — The end-state is machine-readable. The `landing-readiness.json` marker is written so the landing can be consumed without reading prose.
- **L7** — Exactly one narrated chronicle entry is appended. At the close of landing the system writes a single narrated chronicle entry for the memo via the canonical `memo chronic add` command (append-only, chaining N→N-1), naming the touched topic IDs and telling the real sequence of work — what was done, what was given up. This is what lets the next memo dock cleanly: the next `memo-init` reads the chronicle and lands on the right places (the interlocking-brick principle). The existing L1-L5 points are unchanged; the chronicle point is L7 and the former L6 slot is deliberately left unassigned.

---

## Pilot and System

The **user is the pilot**; the system only prepares the landing. The boundary is sharp and is a hard rule: committing and pushing are acts of release, and release is the pilot's authorization. The system does everything up to that line — it cleans worktrees, stages changes, writes the description, names the open ends, and emits the marker — but it does not commit and it does not push on its own. It presents a landing the pilot can act on with as few questions as possible.

Two distinctions sharpen this. A commit is not a push: even where a commit is prepared, it is the pilot who issues it, and pushing is a further, separate act of release that is never automatic. And "prepared and presented" is the system's ceiling — the changes are ready and explained, but the decision to land them is the pilot's, taken at the next break.

---

## Related

- [12-rollout.md](/specification/rollout/) — the rollout that runs Generate, Execute, and Evaluate before this fourth step.
- [13-orchestration.md](/specification/orchestration/) — the orchestrator, agent team, and state files that drive the rollout and feed the machine-readable marker.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — the deterministic git flow governing worktrees, branches, and the commits the landing prepares.
- [00-overview.md](/specification/overview/) — conformance language.
