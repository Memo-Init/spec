---
title: "Orchestration"
description: "This chapter is **normative** for the orchestrator/agent-team roles, the state files, the crash-recovery procedure, and Task usage. The state-file schemas reflect the system as actually built."
spec_version: "0.1.0"
spec_file: "13-orchestration.md"
order: 13
section: "Specification"
normative: true
generated_at: "2026-06-12T19:13:01.811Z"
generated_from: "spec/v0.1.0/13-orchestration.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/13-orchestration.md."
---


> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](/specification/overview/) (Conformance Language). RFC 2119 / BCP 14 keywords are used.

This chapter is **normative** for the orchestrator/agent-team roles, the state files, the crash-recovery procedure, and Task usage. The state-file schemas reflect the system as actually built.

---

## Purpose

A rollout phase is executed by an **agent team**, not by a single linear pass. An orchestrator coordinates the team, persists progress to state files, and recovers exactly from a crash. This chapter defines the team roles, the state-file set, and the recovery procedure.

---

## Orchestrator and Agent Team

Each phase is run by a team with four roles. The Lead is the coordinator; no agent works without an assignment from the Lead.

| Role | Task | Context | Tools |
|------|------|---------|-------|
| Lead | Coordinates the phase, creates Tasks, monitors, stops on problems | Memo + phase + PRDs | Task create/update, SendMessage |
| Worker (1 per PRD) | Implements one PRD in its own worktree; loads skills via tags | Own context + PRD | Edit, Write, Bash, Git |
| Evaluator | Checks a Worker result with **fresh context** | Fresh + PRD + output | Read, Bash (tests), Grep |
| Phase Evaluator | Checks the interplay of all PRDs after all Workers finish | Fresh + all outputs | Read, Bash, Grep |

The Lead starts Workers in parallel where PRD dependencies allow, runs an Evaluator (fresh context, no carry-over) per finished Worker, iterates Worker↔Evaluator at most twice on FAIL, then runs the Phase Evaluator on the integrated result. Evaluators **MUST** receive a fresh context — they know nothing of the implementation process and see only the PRD plus the produced files (the empty-context rule, see [09-contamination-context-handover.md](/specification/contamination-context-handover/)). The first roles to migrate to repo-scoped agents are exactly these evaluators (see [14-agents-skills-tasks.md](/specification/agents-skills-tasks/)).

---

## State Files

All state files live in the memo's `rollout/` subfolder: `.memo/{NNN}-{slug}/rollout/`. They persist machine progress so a crashed rollout can resume exactly.

| Skill | State file | Content |
|-------|-----------|---------|
| Rollout generate | `rollout/state.json` | Phases, PRDs, validation status |
| Rollout execute | `rollout/execution-state.json` | Current phase, per-phase status, eval results |
| Phase execute | `rollout/phase-{N}-state.json` | Worker status, eval status, merge status per PRD |
| Rollout evaluate | `rollout/evaluate-state.json` | Conformity, Playwright, symlink, and test results |

All state files use a consistent set of status values: `pending`, `in_progress` (also written `in-progress`), `completed`, `failed`. A per-PRD eval status is `PASS`, `FAIL`, or `null`. Changed files are recorded with a `+` / `~` / `-` prefix (new / modified / deleted).

The state-type separation is critical: `state.json` is the **generate** state (PRDs created) and `execution-state.json` is the **execute** state (work done). A handover that passes a generate-state "completed" as "work finished" is contaminated. State files MUST NOT be deleted automatically — they remain as the rollout's protocol.

---

## Crash Recovery

A crash (power loss, API error, bug, closed terminal) loses the active session and any running subagent work; the Task list and the state files survive on disk. Running worktrees are not cleaned up automatically by the crash.

The recovery procedure is deterministic:

1. **Read the Task list.** Identify the Task with status `in_progress`.
2. **Read the state files.** Determine: which phase is active (`execution-state.json.current_phase`), which PRD was active (`phase-{N}-state.json` Worker with `worker_status: "in_progress"`), whether the rollout already reached evaluate (`evaluate-state.json` existence), and which PRDs are already done.
3. **Inform the user.** Report the reconstructed standpoint ("Phase N, PRD X was in_progress — shall I continue?").
4. **Continue.** After user confirmation, resume where the work stopped. Completed PRDs MUST NOT be repeated.

Each `phase-{N}-state.json` carries a `recoveryPoint` plaintext field describing the resume position. A **stale guard** runs before each Worker assignment: it compares the target worktree's HEAD against the phase `headCommit`; on a clean mismatch it restores the correct state automatically, and only escalates to the user when it cannot resolve unambiguously (uncommitted local changes, diverged history, ambiguous branches). There is no silent continuation on a wrong state.

---

## Tasks Throughout

Tasks are used throughout the rollout, not only as bookkeeping — they are the recovery anchor (step 1 of recovery) and the visible progress surface. The rollout orchestrator and each phase MUST create their Tasks **before** the first Worker starts.

- The rollout creates a root Task plus three child Tasks (Generate, Execute, Evaluate) chained by `blockedBy` to enforce order.
- A phase creates, before execution, one implement-Task and one evaluate-Task per PRD plus one phase-evaluate Task; statuses move `pending` → `in_progress` → `completed` as work proceeds.
- Task subjects use a `↳` prefix for visual nesting; the prefix is part of the subject string.

Because Tasks persist to disk, they are the first thing a recovering agent reads — the in-progress Task points at the interrupted unit of work, and the state files fill in the detail.

---

## Related

- [12-rollout.md](/specification/rollout/) — the Generate→Execute→Evaluate rollout that this orchestration executes, and the standing lessons-learned file.
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the migration of the fresh-context evaluators to repo-scoped agents.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — the empty-context rule the evaluators obey and the handover used on a contaminated interruption.
- [00-overview.md](/specification/overview/) — conformance language.
