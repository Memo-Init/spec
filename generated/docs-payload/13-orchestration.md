---
title: "Orchestration"
description: "A rollout phase is executed by an **agent team**, not by a single linear pass. An orchestrator coordinates the team, persists progress to state files, and recovers exactly from a crash. This chapter..."
spec_version: "0.1.0"
spec_file: "13-orchestration.md"
order: 13
section: "Specification"
normative: true
generated_at: "2026-06-20T12:43:33.617Z"
generated_from: "spec/v0.1.0/13-orchestration.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/13-orchestration.md."
---


A rollout phase is executed by an **agent team**, not by a single linear pass. An orchestrator coordinates the team, persists progress to state files, and recovers exactly from a crash. This chapter defines the recursive execution pattern, the team roles, the state-file set, and the recovery procedure. For the Tasks primitive itself — structure, creation contract, and disk layout — see [14-agents-skills-tasks.md](/specification/agents-skills-tasks/); this chapter covers how Tasks are used during orchestration and recovery.

---

## Generate → Execute → Evaluate at Every Level

Orchestration follows one recursive three-phase pattern — **Generate → Execute → Evaluate** — applied at every level of the work. The rollout as a whole, each phase, and each revision all use it; at the rollout level a fourth closing step, **Land** (see [27-landing-the-plane.md](/specification/landing-the-plane/)), runs after Evaluate.

| Level | Generate | Execute | Evaluate |
|-------|----------|---------|----------|
| Rollout | Create all phases and PRDs from the memo | Run every phase | Validate the whole result against the original memo |
| Phase | Create one phase with its PRDs | Run the phase with an agent team | Check the interplay of all PRDs in the phase |
| Revision | Plan the revision | Write the revision | Verify all feedback was incorporated |

Because the pattern is identical at each level, the same orchestration roles, state files, and recovery procedure defined below apply recursively. The rollout-level application of the pattern is described in [12-rollout.md](/specification/rollout/).

---

## Orchestrator and Agent Team

Each phase is run by a team with four roles. The Lead is the coordinator; no agent works without an assignment from the Lead.

| Role | Task | Context | Tools | Model capability |
|------|------|---------|-------|-----------------|
| Lead | Coordinates the phase, creates Tasks, monitors, stops on problems | Memo + phase + PRDs | Task create/update, SendMessage | Strongest reasoning model available |
| Worker (1 per PRD) | Implements one PRD in its own worktree; loads skills via tags | Own context + PRD | Edit, Write, Bash, Git | Standard capable model; upgrade to strongest for complex PRDs |
| Evaluator | Checks a Worker result with **fresh context** | Fresh + PRD + output | Read, Bash (tests), Grep | Validated model; a lighter model is acceptable for straightforward validation |
| Phase Evaluator | Checks the interplay of all PRDs after all Workers finish | Fresh + all outputs | Read, Bash, Grep | Validated model; a lighter model is acceptable for straightforward validation |

The Lead starts Workers in parallel where PRD dependencies allow, runs an Evaluator (fresh context, no carry-over) per finished Worker, iterates Worker↔Evaluator at most twice on FAIL, then runs the Phase Evaluator on the integrated result. Evaluators **MUST** receive a fresh context — they know nothing of the implementation process and see only the PRD plus the produced files (the empty-context rule, see [09-contamination-context-handover.md](/specification/contamination-context-handover/)). The first roles to migrate to repo-scoped agents are exactly these evaluators (see [14-agents-skills-tasks.md](/specification/agents-skills-tasks/)).

The **Model capability** column expresses role requirements, not product names. The Lead requires the strongest reasoning model because it holds the most context and makes coordination decisions. Workers default to a standard capable model; complex or highly interdependent PRDs warrant the strongest available. Evaluators and Phase Evaluators need a validated, capable model — a lighter option is permissible when the validation task is clearly bounded. Model selection is the operator's responsibility and is governed by resource budget; the harness does not enforce a specific product.

---

## Parallelism Dials

"Starts Workers in parallel where dependencies allow" sets the *condition* for concurrency but no *bound*. Unbounded fan-out is the costly failure mode: spawning many tens of agents at once burns budget and review capacity faster than it returns finished work. The Lead's concurrency is therefore governed by named dials.

- **Worker concurrency.** The Lead **SHOULD** run a **default of 8** Workers concurrently, **MUST NOT** exceed a **maximum of 16**, and **SHOULD** fall back to **4** under resource pressure (a slow or rate-limited environment). Concurrency **MUST NOT** be set into the **30–75** range — that band is the documented over-fan-out failure mode and is excluded as an upper bound.
- **Derive from cores.** When choosing the concurrency for a host, the Lead **SHOULD** derive it as `min(16, cores - 2)` — capped at the maximum of 16, and leaving two cores for the orchestrator and the host so the machine stays responsive.
- **Batch + review gate.** Work **MUST** be released in batches of at most **10 units**, each batch followed by a **review gate** before the next batch starts. The gate keeps unreviewed work from accumulating beyond what an Evaluator can keep pace with.
- **Pre-flight check.** Before a Worker is spawned, the Lead **MUST** run a pre-flight **reachability check with a timeout** on the resources that Worker needs; an unreachable or timing-out dependency aborts the spawn rather than producing a Worker that stalls.
- **Background vs fresh context.** Mechanical sweeps (repetitive, non-reasoning edits applied across many artifacts) **SHOULD** run as **background Workers**; a **fresh, isolated context** is reserved for work that requires reasoning. Spending a fresh context on a mechanical sweep wastes the most expensive resource on the cheapest work.

These dials bound the "in parallel where dependencies allow" rule above; the dependency tree (see [08-phases-and-prds.md](/specification/phases-and-prds/)) decides *which* Workers may run together, and these dials decide *how many* at once.

---

## Workflows vs Agents

The parallelism dials above describe *how many* units run concurrently once parallel work is chosen, but they do not decide *which orchestration mechanism* drives that work. There are two mechanisms — **dynamic workflows** (harness-driven parallel sub-agent fan-out) and **agents** (the native Lead/Worker/Evaluator agent team of this chapter) — and the policy below decides where each one applies.

- **Dynamic workflows are research-only.** A dynamic workflow — a harness-driven parallel fan-out of sub-agents — is permitted **only** for genuine **research**, where independent sub-agents gather information in parallel and report back. The Default for a research fan-out is **2-4 parallel sub-agents**. This is the *single* place a workflow-style fan-out is allowed; it is documented in [research-workflow](../../../core/skills/research/research-workflow/SKILL.md).
- **Everything else uses agents.** All non-research orchestration — phase execution above all — uses the **agent team** (Lead/Worker/Evaluator/Phase Evaluator), because agents are native to Claude Code and integrate better than a generic workflow runner. Phase execution (`memo-phase-execute`) is therefore **agent-based** and **MUST NOT** run as a dynamic-workflow mode.
- **Added parallelism in phase execution requires evidence.** The "in parallel where dependencies allow" rule (above) stays the dependency-gated Default for the agent phase. Increasing that parallelism — for example wiring the Parallelism Dials into `memo-phase-execute` — is **NOT** done on the strength of the spec dials alone; it requires real, measured **evidence** first.

This policy locates **when** the Parallelism Dials apply rather than removing them: the dials remain the Soll bounds for concurrent work, and this section decides where workflow fan-out is even permitted (research, 2-4 parallel) versus where agents govern (everything else, dependency-gated).

---

## Worker Output Discipline — the Three Exits

Every required unit a Worker is asked to produce — each field, file, or value its PRD demands — **MUST** terminate in exactly one of three exits, and **MUST NOT** be guessed:

- **set** — the unit is produced with a real, verified value.
- **justified-omit** — the unit is deliberately left out, with a stated reason for the omission.
- **blocked** — the unit cannot be produced now, with the blocker named.

A guessed value is none of these and is forbidden: it is the output-discipline form of the anti-cheat rule that machine evidence, not a claim, ends a unit of work. A Worker that cannot reach `set` **MUST** choose `justified-omit` or `blocked` explicitly rather than emit a plausible-looking guess.

These three exits are **distinct from** the **OPEN ENDS** categories of the landing step (see [27-landing-the-plane.md](/specification/landing-the-plane/): *deferred by decision*, *blocked on an external dependency*, *needs review*) and **MUST NOT** be conflated with them. The three exits are a **per-unit Worker-output** rule applied *during execution* — they classify each thing a Worker was asked to produce. OPEN ENDS are a **per-open-end landing** category applied *at the close of the rollout* — they classify what the finished run leaves unresolved. A unit that exits `blocked` during execution may, if still unresolved at landing, surface as an OPEN END; the two vocabularies describe different stages and are not interchangeable.

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

## The Idempotent Drift Gate

Orchestration owns the **idempotent lint/CI gate** that the drift resolution protocol installs ([28-drift.md](/specification/drift/), step 4) and that the escalation rule defers to. The gate's job is to make a divergence *fail loudly* the moment it reappears, so a once-resolved drift cannot silently grow back.

The gate has two complementary checks, both deterministic and token-free:

- **Copy-vs-source equality (in-repo).** For a knowledge-unit derived from a single source-of-truth (a generated number, a pinned command, a shared convention), the gate re-derives or greps the unit and fails when a copy diverges from the source. It is general over the unit *class*, not a single literal string, so a fresh copy of the same kind is caught too.
- **Pin-vs-head freshness (cross-repo).** For a dependency consumed at a **pinned provenance commit**, the gate compares the pinned commit against the source's current head and reports the commit count between them (the deterministic drift sensor: *pinned == head?* plus *commits-since-pinned*). A pin that has fallen behind its source is drift the moment it is detected, even when nothing is locally broken.

Two properties make the gate safe to run anywhere, repeatedly:

- **Idempotent.** It writes nothing and changes nothing; once green, re-running it stays green. This is what lets it sit in both the local lint path and the CI push gate without side effects.
- **Blocking, not advisory.** A divergence is a gate failure, not a logged note. The drift is fixed at the source ([28-drift.md](/specification/drift/), protocol) and the gate re-run to zero — the spec does not record a divergence as a standing "known drift," because a recorded-but-unfixed copy is exactly the reproductive source the protocol exists to remove.

The gate is the enforcement end of the post-phase elimination step that [08-phases-and-prds.md](/specification/phases-and-prds/) owns: that chapter schedules *when* a discovered drift is eliminated (after the current phase, in fresh context); this gate guarantees it cannot re-enter once eliminated.

---

## Related

- [12-rollout.md](/specification/rollout/) — the Generate→Execute→Evaluate rollout that this orchestration executes, and the standing lessons-learned file.
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the migration of the fresh-context evaluators to repo-scoped agents.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — the empty-context rule the evaluators obey and the handover used on a contaminated interruption.
- [28-drift.md](/specification/drift/) — the drift error-class and resolution protocol whose step-4 idempotent lint/CI gate this chapter holds.
- [33-maintenance.md](/specification/maintenance/) — the maintenance roof; the pin-vs-head freshness check is the same deterministic drift sensor it scores with.
- [36-agent-research-strategies.md](/specification/agent-research-strategies/) — the strategy/pattern layer (Distillate-Fan-Out, fan-out by unit) above this machinery.
- [00-overview.md](/specification/overview/) — conformance language.
