---
title: "Plans"
description: "A **plan** is the primitive that sits above the memo and sequences the work of one or more finalized memos into a single ordered run. A memo is the highest authority over its own rollout, but a..."
spec_version: "0.1.0"
spec_file: "42-plans.md"
order: 42
section: "Specification"
normative: true
generated_at: "2026-07-10T11:54:59.268Z"
generated_from: "memo/0.1.0/draft/spec/42-plans.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.1.0/draft/spec/42-plans.md."
---


A **plan** is the primitive that sits above the memo and sequences the work of one or more finalized memos into a single ordered run. A memo is the highest authority over its own rollout, but a memo's rollout knows nothing about the memo next to it; when several finalized memos must be worked off together — interleaved, or with one memo's phase depending on another's — there has to be a structure that carries them as one. The plan is that structure. It does not replace the per-memo stage model; it nests it, applying the same four stages to each memo it carries while it records, across all of them, which phase runs next and which have reached the push gate. This chapter specifies the plan store on disk, the `plan.md` skeleton and the seven mandatory phase fields, the `plan-status.json` schema, next-phase resolution under memo authority, the budget gate and wake-up marker, crash recovery, archival, conformance evaluation, the plan-stop verb, checkbox-to-status synchronization, unplanned-memo detection, the plan-done-vs-memo-done distinction, and the coexistence of a standalone rollout with a rollout inside a plan context.

---

## The Plan Store

Plans live under `.memo/plans/`, one directory per plan, alongside the other shared stores in the `.memo/` tree. A plan directory is named for its id and contains two canonical files plus two working sub-folders:

```
.memo/plans/
  PLAN-{NNN}-{slug}/
    plan.md            # human-readable plan document
    plan-status.json   # the deterministic state of record
    conformance/       # bidirectional conformance reports
    revisions/         # plan-level revisions
```

A plan id has the form `PLAN-{NNN}-{slug}`: a fixed `PLAN-` prefix, a zero-padded three-digit number, and a kebab-case slug derived from the source memo. The number MUST be the **next free number**, allocated by scanning the existing `PLAN-{NNN}-*` directories, taking the highest number present, and adding one (an empty store starts at `PLAN-001-...`). The directory name **is** the canonical id — the `planId` field inside `plan-status.json` MUST be identical to the folder name. Plan creation is **NO-OVERWRITE**: if a directory for the computed id already exists, creation MUST fail rather than clobber it, so the operation is safe to repeat. The deterministic skeleton — number allocation, directory creation, and the initial status file — is owned by the CLI; the richer steps (reading the source memo, rendering `plan.md`, extracting entry-points) are the skill's job.

## The Plan Document (`plan.md`)

`plan.md` is the human-readable face of the plan, generated from a skeleton template and kept in a fixed section order so that a fresh context can pick it up without guessing. The sections are, in order: the **plan header** (id, date, status, the memos it carries); a **"For Claude: how you start" block** that pins the entry-points to read before any action and the anti-patterns to avoid; the **memo overview** (filled as memos are added); the **phase plan**, where each phase is preceded by a budget-check block; **side-tracks**; **blocking events**; **pre-work**; **open questions**; and an **archive** section filled at finalization. Every included memo MUST be referenced by **absolute path**, because a single plan server can hold many folders across namespaces and relative paths collide across those boundaries.

The "For Claude" block encodes a deliberate discipline: compute before action. The entry-points are read first — the plan does not start a phase until the context has been loaded — because a general method that front-loads reading beats a guess made on an empty context.

### The Seven Mandatory Phase Fields

Every phase block in `plan.md` MUST carry seven fields. They exist so that after a context reset the next entry-point is unambiguous and no phase starts blind:

| # | Field | Purpose |
|---|-------|---------|
| 1 | Prerequisites | The preconditions that must hold (e.g. a prior phase done, a key configured). |
| 2 | Skill call | Which skill starts the phase. |
| 3 | Inputs | The files and parameters the phase reads. |
| 4 | Outputs | The files and artifacts the phase produces. |
| 5 | Acceptance criterion | What must be true for the phase to be done (one or two sentences). |
| 6 | Next step | A pointer to the next phase, or `END`. |
| 7 | Entry-points | The files a fresh context must read first. |

Conformance evaluation MUST verify that all seven fields are present on every phase; a phase missing any field is a `BLOCKED` verdict, not merely a warning. Phase tasks are limited to a **single** level of sub-steps under the phase header — deeper nesting is forbidden because the checkbox machinery can no longer address it unambiguously. Each phase also declares a sub-session type (`code`, `docs`, `research`, or `mix`) and, where several plans are active, the files it touches, so that **file overlap between concurrent plans stays zero**.

## The `plan-status.json` Schema

`plan-status.json` is the **deterministic state of record** — the single source of truth for casing and status vocabulary. Casing is **camelCase**; phase status is one of `pending`, `in-progress`, `done`, `blocked` (kebab). Any phase-level or execution-level state file derived from it reads with the same vocabulary, and a re-entering context reads them all with one dictionary. The top-level fields are:

| Field | Type | Meaning |
|-------|------|---------|
| `planId` | string `^PLAN-\d{3}-[a-z0-9-]+$` | The plan id; identical to the folder name. |
| `createdAt` | string (ISO date-time) | When the plan was created; a real timestamp, never an empty fallback. |
| `status` | enum | Plan status: `in-progress`, `blocked`, or `archived`. |
| `memos` | array | One entry per carried memo: `namespace`, `memoId`, `name`, and that memo's `phases[]`. |
| `executionOrder` | array | An ordered list of `phaseRef`s expressing cross-memo phase swapping. |
| `budget` | object | The last measured subscription budget snapshot and the wake-up marker. |
| `entryPointsRead` | boolean | Whether the "For Claude" entry-points have been read this run. |
| `entryPointsReadAt` | string (ISO) or `null` | When the entry-points were read. |

Phases are **memo-aware**: they live under `memos[].phases[]`, not in a flat global array, and each phase carries `namespace`, `memoId`, and `phaseId`. A phase entry holds its `status`, its `headCommit` (`^[a-f0-9]{7,40}$`, nullable — the short hash stamped at phase completion), an optional `issueId`, its `prds[]` (each with generate/execute/evaluate stages), and its dependency edges. Dependencies are not bare phase ids but `phaseRef` objects — `{ namespace, memoId, phaseId }` — so that `dependsOn` and `canParallelWith` can point across memo boundaries. A `phaseRef` is resolved against `memos[].phases[]` to read the target phase's status.

Two further per-phase markers matter for safety. The **write-ahead marker** `writeAhead` records `{ marker, startedAt, finalizedAt }`: it is set to `started` before a phase's first worker runs, and overwritten to `finalized` (with `finalizedAt` set, `startedAt` preserved) at clean completion. The invariant is that in normal operation a durable `started` marker without a `finalizedAt` never sits on disk — such a marker is precisely the crash signal. The **`budget` block** holds `lastUsageCheck`, `weekUsedPct`, `weekResetIso`, `sessionUsedPct`, `sessionResetIso`, a per-model breakdown, and `scheduleWakeup` (either `null` or `{ phaseId, wakeupIso, scheduledAt }`).

## Next-Phase Resolution and Memo Authority

Resolving "which phase runs next" is deterministic, and the governing rule is **memo authority**: the order of phases is the memo's to decide, because the memo holds the most knowledge and made the decision earliest. The CLI's heuristics are suggestions, never commands; the memo's `## Phase-Hints` table — the `depends-on` and `can-parallel-with` edges — overrides any sequential default.

Resolution reads `plan-status.json` and, per carried memo, that memo's `## Phase-Hints` table. When the plan carries **more than one memo**, `executionOrder` is **mandatory**: its absence is an error, because there is no single defensible order across memos without it. With `executionOrder` present, the candidate search iterates in that order over the referenced phases (each entry a `phaseRef`, resolved to `memos[].phases[]`); with a single memo it falls back to that memo's internal phase-hints order. A phase is a candidate when its status is `pending` and every one of its `dependsOn` refs resolves to `done`. Zero candidates is a no-op; one candidate is selected; with several candidates the run does not stop — it picks the first in the frozen execution order and notes which siblings could run in parallel. The selection MUST NOT silently report a phase startable when its dependencies are unmet.

The CLI override `--phase=N` is the **emergency exit**, not the standard workflow. It forces a specific phase, skipping the dependency check with an explicit warning, and the user takes responsibility for the consequence. It MUST NOT be used to route around a decision the memo has already made; an out-of-range or non-numeric argument is an error.

## Budget Gate and Wake-Up Marker

Before each phase, the plan checks the subscription budget against the snapshot taken once at finalization and mirrored into `plan-status.json`. The check is **passive at runtime**: the consumed share is estimated forward from the snapshot, and a stale value MUST NOT trigger a live usage paste or a stop — a night run must never block waiting for a human. When week usage estimates at or above ninety percent, or session usage at or above ninety percent, the gate schedules a wake-up; otherwise it warns softly or proceeds.

Scheduling a wake-up is a **marker, not a cron job**. The system cannot wake itself; it can reliably refuse to start too early. A wake-up writes `budget.scheduleWakeup = { phaseId, wakeupIso, scheduledAt }`, sets the phase to `blocked` with a block reason, and breaks. On the next plan-execute, if the current time has reached `wakeupIso` the phase is reset to `pending` and the marker cleared; otherwise the wake-up message is re-emitted and the run breaks again. The only legitimate source of a real budget snapshot is the dedicated paste step at finalization; third-party usage tooling is forbidden.

## Crash Recovery

A plan re-entered after an interruption first checks for a crash: a per-phase `writeAhead.marker == "started"` without a `finalizedAt` means the run died at that phase. Recovery treats `plan-status.json` as truth and the git commits, filesystem artifacts, and issues as the primary sources that confirm or refute it. It runs a visibility audit over four finding classes — orphaned worktrees with unmerged commits, unmerged branches (the most common loss vector), uncommitted trees, and stashes — and, **only** on a detected crash, generates a recovery handover from the state files and primary sources. That handover is presented to the user for confirmation before any further work; clean, committed, and merged worktrees are removed, while unmerged or uncommitted work is never touched automatically.

When re-entry follows a deliberate stop or a fresh context rather than a crash, the same discipline applies in milder form: `plan-status.json` is truth, a `HANDOVER.md` is hypothesis, and every action-guiding handover claim stays `[to verify]` until a primary source confirms or refutes it.

## Archival

A finished plan becomes an **archived** plan. Finalization validates that every phase across **all** carried memos is `done`; if any phase is open, it blocks with the list of open phases rather than archiving a half-run plan. On success it sets `plan-status.json.status` to `archived` and writes an archive marker into `plan.md`. Archival is idempotent: archiving an already-archived plan is a no-op note, not an error. An archived plan is excluded from the open-plans scan.

## Conformance Evaluation

A plan is **conformant** when it maps cleanly onto the memos it carries, checked in both directions. The **forward** check asks: is every chapter of every carried memo assigned to at least one phase? The **backward** check asks: does every phase reference at least one memo chapter? A third check verifies the seven mandatory phase fields on every phase. The verdict is `PASS` when there are no forward gaps, no backward gaps, and no missing phase fields; `BLOCKED` (harder than `FAIL`) when phase fields are missing; and `FAIL` otherwise. There is no `WARN`. The evaluation is a fresh-context, subagent-capable read of `plan.md`, `plan-status.json`, and the carried memos' last full revisions; it writes only into the plan's `conformance/` folder.

## The Plan-Stop Verb

The base process has its four public verbs; the plan subsystem adds its own stop discipline. **Plan-stop** freezes a plan so that, after a context reset, the next context re-enters at exactly the right place. It is an **atomic three-step** operation, performed in order without an intervening stop:

1. **Finalize `plan-status.json`** — write the current phase and PRD states, stamp `headCommit` for each completed phase, and set the write-ahead marker.
2. **Hand over (internal)** — write a `HANDOVER.md` with its mandatory header and three-zone structure (facts with pointers, assumptions, primary-source references), carrying the obligatory context-rot notice that primary sources beat the handover.
3. **Emit the stop block** — a plain-text terminal block naming the plan, the phase, the saved state, the handover location, and the re-entry command.

Plan-stop stops **at a phase boundary, never mid-PRD**. Asked to stop while a PRD is in progress, the plan finishes the phase first and reports that it will stop cleanly afterward; the user may insist on an immediate stop, but then the handover is explicitly flagged as written from a mid-PRD (highly contaminated) context. Re-entry runs through the handover facade: the stop prepares the handover, and the next plan-execute enforces the re-entry verification before starting any phase.

## Checkbox-to-Status Synchronization

The phase tasks in `plan.md` are markdown checkboxes, and a checked box maps to a done status. Setting checkboxes is owned by a single authorized path — **never** a direct markdown edit — because manual checkbox-setting is reliably forgotten. The path is idempotent: re-checking an already-checked box logs an "already checked" note and mutates nothing. When the last open task under a phase header is checked, the phase is **done**: the status write goes through the deterministic CLI, `headCommit` is stamped, the write-ahead marker is finalized, and a `[PHASE-DONE]` block is emitted. While any task remains unchecked, the phase stays `in-progress`. This is the same authorized writer that the plan-context execution path delegates to, so that one finalization write sets `status`, `headCommit`, and the finalized marker together on the matching `memos[].phases[]` entry.

## Unplanned-Memo Detection

A finalized memo that is not yet attached to any plan is **unplanned**. Detecting these is a read-only subroutine: collect every finalized memo (across the co-located and the flat legacy layouts), collect every memo already listed in an active plan's memo overview, and report the difference. The output points the user toward creating a new plan for an unplanned memo or adding it to an existing one. A companion read-only scan lists the **open plans** (status `in-progress` or `blocked`, excluding archived), so that a new entry into the system is made aware of plans already in flight before it starts. Both scans mutate nothing; the actual decision to take a memo into a plan happens later, at the add step, behind explicit user intent.

## Plan-Done Is Not Memo-Done — and Not Task-Done

Completing a plan's phases is not the same as the whole task being done. The four-stage model — rollout, landing, merge preparation, push gate — applies to **each memo** the plan carries: a green evaluate ends one rollout, not the memo, and the push gate is reached per memo. A plan is finished only when every memo it carries has passed its own push gate; closing one memo's rollout never closes the plan while sibling memos remain. The plan is the ledger that records which memos have reached the gate and which have not, and "all phases done" is the precondition for archival, not a declaration that the work is released.

## Direct-Path and Plan-Context Coexistence

A rollout runs in one of two modes, and both coexist. In the **direct path**, a single finalized memo is rolled out on its own — the proven, standalone route. In the **plan context**, the same execution machinery runs under a plan, receiving the plan id and the resolved `phaseRef` in addition to the memo path and phase, so that phase completion is mirrored back into `plan-status.json`. The encapsulated plan-context path becomes equivalent to the direct path only once its end-to-end integration is verified; switching the default from direct to plan is a separate, verified step, never an automatic switch. In either mode the whole path is entered through exactly **one** public entry-point, never through the internal sub-skills.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./30-primitives.md](/specification/primitives/) — the eleven primitives, of which the plan is the one that spans many memos.
- [./08-phases-and-prds.md](/specification/phases-and-prds/) — phases, PRDs, and the `## Phase-Hints` table a plan reads for next-phase resolution.
- [./12-rollout.md](/specification/rollout/) — the rollout that a plan sequences across memos.
- [./38-stage-model.md](/specification/stage-model/) — the four-stage process end the plan nests per carried memo.
- [./13-orchestration.md](/specification/orchestration/) — the state files and orchestration the plan execution drives.
- [./06-memo-structure.md](/specification/memo-structure/) — the memo and revision structure a plan reads to assemble its phases.
- [./09-contamination-context-handover.md](/specification/contamination-context-handover/) — the handover discipline behind plan-stop and re-entry.
