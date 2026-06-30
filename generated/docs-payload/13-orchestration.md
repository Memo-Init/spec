---
title: "Orchestration"
description: "A rollout phase is executed by an **agent team**, not by a single linear pass. An orchestrator coordinates the team, persists progress to state files, and recovers exactly from a crash. This chapter..."
spec_version: "0.1.0"
spec_file: "13-orchestration.md"
order: 13
section: "Specification"
normative: true
generated_at: "2026-06-30T15:09:59.177Z"
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

Phase execution is **agent-team based, not script-driven.** The default execution path is for the Lead to **spawn one Worker per PRD** in its own context — this is the wired default of an agent phase, not an optional "may use agents" suggestion. The model-driven fan-out (the Lead deciding per turn over a handful of parallel sub-agents) is reserved for **research only** (see *Research Fan-Out vs Agents* below); everything else, phase execution above all, runs as the Lead/Worker/Evaluator/Phase-Evaluator team.

---

## Agent-Naming Schema

When the Lead spawns the team, every agent **MUST** be named by a canonical schema so the agent-tree view stays legible. The schema separates two fields: `name` carries the **ID** (very short, the addressable key) and `description` carries the **one-line human sense** of that agent. No free-text sprawl — the ID is mechanical, the sense is one short line.

| Role | `name` (the ID) | `description` (the human short-sense) |
|------|-----------------|----------------------------------------|
| Lead | `lead-m{NNN}` | `"Rollout Memo {NNN} — Phase {x}/{y}"` |
| Worker (1 per PRD) | `prd-{NNN}-{RR}` | `"{short PRD title}"` |
| Evaluator | `eval-{NNN}-{RR}` | `"Eval PRD-{RR} (fresh)"` |
| Research | `res-{topic}` | `"{short research question}"` |

`{NNN}` is the three-digit memo number, `{RR}` the two-digit PRD number, `{x}/{y}` the current/total phase count, `{topic}` a short kebab slug for a research sub-agent. The rule is invariant across roles: `name` is the ID, `description` is the human short-sense, and neither field is padded with prose. The Lead applies this schema at every spawn point; the agent-tree view reads `name` for structure and `description` for meaning.

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

## Research Fan-Out vs Agents

The parallelism dials above describe *how many* units run concurrently once parallel work is chosen, but they do not decide *which orchestration mechanism* drives that work. There are two mechanisms — a **model-driven research fan-out** (the Lead spawns a handful of parallel sub-agents and decides per turn) and the **agent team** (the native Lead/Worker/Evaluator team of this chapter) — and the policy below decides where each applies.

> **Terminology.** This section's mechanism is a **model-driven research fan-out**, *not* a "dynamic workflow". The platform reserves **Dynamic Workflow** for a different, script-driven primitive — a JavaScript script that holds the loop/branching/intermediate results and scales to dozens or hundreds of agents (the third agent-execution primitive, defined in [14-agents-skills-tasks.md](/specification/agents-skills-tasks/)). To avoid a permanent collision with the platform term, this spec calls its own model-driven mechanism a *research fan-out* and uses *Dynamic Workflow* only for the script primitive.

- **Model-driven research fan-out is research-only.** A research fan-out — the Lead spawning parallel sub-agents that each gather information and report back — is permitted **only** for genuine **research**. The Default is **2-4 parallel sub-agents**. This is the *single* place a model-driven fan-out is allowed; it is documented in [research-workflow](../../../core/skills/research/research-workflow/SKILL.md).
- **Everything else uses agents.** All non-research orchestration — phase execution above all — uses the **agent team** (Lead/Worker/Evaluator/Phase Evaluator), because agents are native to Claude Code and integrate better than a generic runner. Phase execution (`memo-phase-execute`) is therefore **agent-based** and **MUST NOT** run as a script-driven Dynamic Workflow.
- **Added parallelism in phase execution requires evidence.** The "in parallel where dependencies allow" rule (above) stays the dependency-gated Default for the agent phase. Increasing that parallelism — for example wiring the Parallelism Dials into `memo-phase-execute` — is **NOT** done on the strength of the spec dials alone; it requires real, measured **evidence** first.

This policy locates **when** the Parallelism Dials apply rather than removing them: the dials remain the Soll bounds for concurrent work, and this section decides where a model-driven fan-out is even permitted (research, 2-4 parallel) versus where agents govern (everything else, dependency-gated).

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

## Contract Negotiation Between Generator and Validator

Before a Worker is allowed to start a PRD, the phase generator and a fresh-context validator negotiate a **file-based contract** — a `contract.json` that fixes *what counts as done* before any code is written. The contract exists so the later evaluator grades against an agreed, checkable target rather than re-interpreting the PRD prose, and so a phase cannot begin executing work whose intent was never pinned down.

The negotiation runs over separate files, never a shared one, so two contexts never write the same artifact and there is no race:

| Artifact | Owner | Content |
|----------|-------|---------|
| `contract-seed.json` | Lead | The phase's **hard requirements** as fixed, non-negotiable entries — they enter the final contract unchanged. |
| `proposal.md` | Generator | Proposed scope, assertions (beyond the hard requirements), and the verification method for each. |
| `feedback.md` | Validator | Pushback on scope (too broad?), test strength (too weak?), and missing edge cases. The validator sees only the proposal, never the generator's reasoning trace. |
| `contract.json` | Lead | The result: seeded hard requirements plus negotiated entries, validated by the Lead. |

The procedure is bounded and Lead-arbitrated:

- The Lead writes `contract-seed.json` with every hard requirement as a fixed entry. These are not up for negotiation.
- The generator proposes; the validator pushes back; each round is appended to a per-round history file. The two never edit the same file.
- The round limit is **three**. On agreement before round three both sides confirm; with no agreement after round three the **Lead decides** which contested entries are admitted and records that the decision was the Lead's.
- A **trivial fallback**: when the contract follows unambiguously from the hard requirements with no open assertions, the negotiation is skipped and the Lead writes `contract.json` directly. The two extra contexts of a negotiation are spent only where the contract is genuinely contested.

**The coverage gate.** After the contract is assembled, a deterministic gate checks that **every hard requirement from the seed is covered in the final contract**. A missing hard requirement sets the contract to `blocked` and **no Worker starts for that PRD** — the finding is reported up to the execution layer. There is no silent start without a green contract. This gate is the negotiation's enforcement end: it guarantees that the generated unit of work provably covers the phase's stated intent before execution, closing the failure mode where a Worker quietly begins on a scope that drifted from what the memo demanded.

Once the gate is green and the contract is `agreed`, the generator is assigned as the Worker and the evaluator later grades **against the contract, not the original prose** — every hard assertion must hold, and every negotiated assertion must hold unless the contract marked it optional. A PRD that carries no contract (a direct PRD without negotiation) is graded against its acceptance criteria as before.

A negotiated entry a Worker later declines is handled by the asymmetry the worker-output exits already establish: a declined *should-apply* entry is recorded with its reason and **reported** to the human, not blocked; a hard entry that cannot be met is `blocked` and halts that PRD. A declined hard entry is a contradiction in terms and never appears in the declined list.

---

## The Inter-Agent Findings Channel

Parallel agents that only return final text cannot tell the Lead — or each other — what they discovered mid-flight. A Worker that finds a shared convention is wrong, or that a dependency behaves unexpectedly, has nowhere to surface that short of finishing and reporting. The **findings channel** is the shared, append-only store that fills this gap: a place where any agent in the phase deposits a cross-cutting discovery the moment it is made, and any other agent (a parallel Worker, the fresh-context evaluator, the Lead) reads it without carry-over.

The channel is governed by a single discipline — **one writer, append-only**:

- The Lead **initialises the store once per phase run**; initialisation never overwrites an existing store, it reports the one already present.
- Every cross-worker-relevant finding is deposited deterministically through the canonical write path, which is the **only** writer. A finding carries a **dedup key** (so the same discovery deposited twice collapses to one entry), an optional **thread tag** (grouping related findings), an **author**, and a structured **payload**.
- Readers — parallel Workers and the fresh evaluator — pull the shared state by thread, never by hand-collecting JSON. Because the store is on disk and append-only, a reader sees a consistent, ordered record rather than a snapshot of one agent's memory.

Two properties keep the channel safe to share. It is **append-only**, so a late reader never loses an earlier finding and a crash mid-phase does not swallow what was already surfaced. And it has a **single write path**, so there is no format drift between what one agent writes and another reads — the same shape goes in and comes out.

The channel deliberately stops short of an enforced identity model. The author field is a **free attribution**, not a server-checked credential: there is no registration-before-write, no per-agent secret. A stronger write-own-identity model (rooms, usernames, registration) is a deliberately deferred decision, not an accidental omission — until it is decided, the channel is a shared notebook with honest attribution, not an access-controlled log, and no orchestration step should assume a secret-checked author.

---

## The Utilization Gate — Built-but-Unwired

The dominant failure mode of a maturing system is not broken code — it is **code that is built, green under its own unit tests, and never wired in**. A module reaches completion, its tests pass, and it lives in the isolation of those tests, reached by no real caller. "Tests green" is not evidence that a module is *used*. The utilization gate makes **being wired in** a conformance condition of evaluation, not merely **being present**.

The rule is sharp: **every new module or feature built in the rollout MUST have at least one real, non-test call path** — it is actually reachable from a genuine entry point (a CLI leaf, a skill step, another production module), not only from a `.test.mjs` file.

The check runs in a fresh context, because the agent that built the work cannot be trusted to judge whether it is reached:

1. **Inventory the new modules.** From the backward check, take every newly created production file or export. Test files do not count as modules.
2. **Prove a real call path per export.** A fresh-context sub-agent verifies reachability against the real code — it follows the chain **from the entry point to the module**, not from the test to the module. Is the export imported or called by production code? Is it reachable from a real entry point?
3. **Classify honestly.** *Wired* — at least one real non-test call path found, a PASS contribution. *Test-only* — reachable only from tests, no production caller, not wired in as a default: a **gate violation**, listed in the report as the module plus its missing call path.

A test-only finding is a **fail contribution**: the module is built but not in the real path, which is exactly the failure the gate exists to catch. A green test report does **not** substitute for the call-path proof. The fresh context is essential here — the sub-agent trusts no execution report claiming "wired", and follows the call chain itself.

---

## The UI-Proof Baseline and Before/After Contract

UI-affecting work cannot be judged by an after-shot alone — an after-shot shows a state, not a *change*. To evaluate whether a view changed the way the memo intended, evaluation needs a **before** to compare against. The before/after contract splits this across two moments in the phase lifecycle: a **baseline captured at phase-start**, and a **before/after diff produced at evaluation**.

**Baseline at phase-start.** Before the phase's PRDs execute, the relevant screens and states — those the memo's UI scope names as changing — are captured in their current, unchanged form and stored as the baseline, alongside a manifest listing each captured screen so the later step can match them one-to-one. The baseline must be taken *before* execution; once the PRDs run, the "before" is gone. Only after the baseline is recorded do the phase's PRDs run.

**Before/after diff at evaluation.** After all phases complete, the same screens and states are captured again as the after-set, and each is diffed against its baseline. The evaluation report carries, per screen: the before path, the after path, the observed change, and the change the memo planned — so a reviewer sees both that something changed *and* whether it changed as intended. The evidence — baseline shots, after shots, and the diff — lives under the project's proofs area as the layout of record for the comparison.

When no baseline was captured at phase-start, the comparison is not silently dropped: it is marked **"N/A — no baseline"** and a warning is emitted, so the absence of a before is visible rather than hidden. The contract degrades loudly, never quietly.

---

## Parallelism: When Phases and PRDs May Run Together

The parallelism dials above bound *how many* units run at once; this section decides *whether* units may run together at all. The two are distinct: the dials are an upper safety bound on concurrency, while the sequential-versus-parallel decision is driven entirely by **dependencies**.

- **The default is sequential under memo authority.** Phases run in the order the memo lays down, and PRDs run in dependency order within a phase. The memo is the highest authority on ordering; the orchestration does not reorder or parallelise work the memo sequences.
- **Parallel only where dependencies allow.** Workers run concurrently **only** when their PRDs have no mutual dependency — the dependency tree decides which units may share a moment. Two PRDs that touch the same files, or where one consumes the other's output, are sequential by necessity, not by preference.
- **Within a phase, merges are sequential.** Even when Workers ran in parallel, their worktrees are merged back one at a time in PRD order, so a merge conflict is resolved against a known, ordered base rather than a tangle of simultaneous merges.
- **Raising parallelism requires evidence, not prose.** Increasing concurrency beyond the dependency-gated default — for instance wiring the concurrency dials into the execution path — is **not** done on the strength of this specification alone. It requires real, measured evidence first. The dials describe the Soll bound; turning that bound into a higher live default is a separate, evidence-backed step.

This keeps the safe default conservative: work is sequential unless the dependency tree proves it can safely run together, and the memo's ordering is never overridden for speed.

---

## Iteration and Retry Limits

Every iterative loop in orchestration is **bounded**, so a stuck unit of work escalates or is isolated rather than spinning forever. The bounds differ by loop because each loop fails differently.

| Loop | Bound | On exceeding the bound |
|------|-------|------------------------|
| PRD generation/evaluation (during Generate) | **2 retries** per PRD | Mark the PRD `needs-review`; do not block the pipeline for one PRD. |
| Worker ↔ Evaluator (during Execute) | **3 iterations** per PRD | The PRD closes as `needs-review` (a finished partial state) and a **follow-up PRD** inherits the remaining scope plus the evaluator's findings; the run continues — it never fully stops. |
| Phase-Evaluator (during Execute) | **2 iterations** | The Lead reports the integration problem up to the execution layer. |
| Contract negotiation (before Execute) | **3 rounds** | The Lead decides the contested entries (see *Contract Negotiation* above). |

The Worker↔Evaluator limit deserves emphasis: hitting three iterations without a PASS is **not a stop**. The original PRD is recorded as a completed partial state, its unresolved scope migrates into a freshly numbered follow-up PRD attached to the running phase, and that follow-up is worked under the same bounds. This is the structural form of the rule that the run never silently stalls — a stuck unit is isolated into its own follow-up so the rest of the phase proceeds, and only a genuinely unresolvable blocker or an infrastructure incident escalates to a real stop.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [12-rollout.md](/specification/rollout/) — the Generate→Execute→Evaluate rollout that this orchestration executes, and the standing lessons-learned file.
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the migration of the fresh-context evaluators to repo-scoped agents.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — the empty-context rule the evaluators obey and the handover used on a contaminated interruption.
- [28-drift.md](/specification/drift/) — the drift error-class and resolution protocol whose step-4 idempotent lint/CI gate this chapter holds.
- [23-requirements.md](/specification/requirements/) — the hard/should-apply requirement tiers that seed the contract and drive the coverage gate.
- [31-goals.md](/specification/goals/) — the goal-scoring layer; the utilization gate's built-but-unwired check is the same "PASS ≠ reality" honesty applied at evaluation.
- [33-maintenance.md](/specification/maintenance/) — the maintenance roof; the pin-vs-head freshness check is the same deterministic drift sensor it scores with.
- [36-agent-strategies.md](/specification/agent-strategies/) — the agent strategy/pattern layer (Fan-Out by Unit, Fresh-Context Evaluation) above this machinery; the research-reuse strategy (Distillate-Fan-Out) is in [10-proactive-research.md](/specification/proactive-research/).
- [00-overview.md](/specification/overview/) — conformance language.
