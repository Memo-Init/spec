---
title: "Rollout"
description: "The rollout turns a finalized memo into implemented code. It begins only **after** finalization — on the single binary \"Finalized\" verdict, there is no conditional intermediate verdict..."
spec_version: "0.3.0"
spec_file: "12-rollout.md"
order: 12
section: "Specification"
normative: true
generated_at: "2026-07-17T23:43:43.034Z"
generated_from: "memo/0.3.0/draft/spec/12-rollout.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.3.0/draft/spec/12-rollout.md."
---


The rollout turns a finalized memo into implemented code. It begins only **after** finalization — on the single binary "Finalized" verdict, there is no conditional intermediate verdict ([11-quality-and-finalization.md](/specification/quality-and-finalization/)) — and only for memos of type Implementation, whose memo-level lifecycle state is therefore `finalisiert-implementation` ([47-memo-lifecycle.md](/specification/memo-lifecycle/)); strategy memos end at finalization. A memo's life runs in exactly three **arcs** — **Create**, **Rollout**, and **Review** (defined in [02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/)). Create is the interactive first arc: authoring, the revision loop, and finalization, where the developer's judgement is spent. Rollout, specified in this chapter, is the autonomous second arc: after the user confirms, it runs to completion without intermediate stops. Review is the fresh-context third arc that reads the run's result after the rollout span ([38-stage-model.md](/specification/stage-model/)).

The rollout is the autonomous execution machine for **one** memo, and it is the only execution path that actually runs. The multi-memo **plan layer** that once sat above it ([42-plans.md](/specification/plans/)) is **deprecated** — it was never used, while every execution went through the single-memo rollout. The accurate framing is that **a rollout is a plan with one memo**: the rollout already carries the whole span of one finalized memo, so no separate plan primitive is needed to run it. The one capability the plan layer held that the rollout did not — the budget wake-up — is lifted into the rollout (see [The Budget Wake-Up](#the-budget-wake-up-lifted-from-the-plan-layer) below).

---

## The Rollout: Generate → Execute → Evaluate → Land

The rollout applies the recursive **Generate → Execute → Evaluate** pattern — defined for every level in [13-orchestration.md](/specification/orchestration/) — at the rollout level, with a fourth closing step, **Land**. At the rollout level, **Generate** produces the PRDs and validates them bidirectionally against the memo; **Execute** iterates over the phases, delegating each to a phase agent team; **Evaluate** checks memo conformity (nothing added, nothing forgotten) and applies the applicable requirements for each PRD. A FAIL at any phase stops the rollout and informs the user; on PASS the next phase starts immediately. After Evaluate, **Land** (see [27-landing-the-plane.md](/specification/landing-the-plane/)) leaves the workspace in a startable "next-morning" state: worktrees cleaned, branches merged or documented, commits prepared and presented, open ends named, and a machine-readable `landing-readiness.json` written.

The rollout MUST begin by displaying a **duty-of-care contract** (six commitments: implement only what the memo says, self-test every agent result, validate per the applicable requirements for each change, never accept "the agent says done" as verification, report "done" only after software validation, surface problems immediately) and a tool check. A missing required tool aborts the rollout. After the user confirms the contract, the rollout runs autonomously.

---

## Pre-Rollout Health Check

Before the rollout commits to the autonomous span, it SHOULD surface the project's **health** — the Sync-Score read-projection over the four boards (maintenance, goals, chronicle, wiki; see [33-maintenance.md](/specification/maintenance/) and [26-memo-history.md](/specification/memo-history/)). The point is to make "red zones" visible *before* they bite mid-execution.

- **WARN, not block.** The health check is an **estimate against a threshold**, not the binary drift gate. A below-threshold score is surfaced as a warning; it does **not** stop the rollout — the finalized memo is the authority. The one exception is a **critical** maintenance status, which MAY be a hard block, since a critical card is a known-broken foundation.
- **The chronicle is the leading indicator.** A stale chronicle pulls the score down even when the other signals look green, because the downstream measurements stand on the chronicle's completeness. A leading-indicator alarm before a rollout means "bring the chronicle current first".

The health check is idempotent and stores nothing; it is the *window* onto the maintenance roof, not a new gate in the binary sense.

---

## Hands-Off Goal

The design goal is **hands-off after finalization**: once a memo is finalized, the user touches nothing further. The entire rollout — generate, execute, evaluate, across all phases and PRDs — runs without further user interaction except at genuine blockers.

The autonomy rules are strict:

- There MUST be no stop between Generate, Execute, and Evaluate. The system MUST NOT ask "shall I start Execute?" or "shall I start Evaluate?".
- The system stops only on FAIL (after the bounded retries) or on a hard blocker (missing tool, a revision blocker that is a genuine design decision).
- Everything else is handled autonomously.

This mirrors the empty-context discipline (see [09-contamination-context-handover.md](/specification/contamination-context-handover/)): the user's judgement is spent up front, at finalization; the rollout then executes a settled plan.

---

## The Budget Wake-Up (Lifted from the Plan Layer)

The one capability the deprecated plan layer ([42-plans.md](/specification/plans/)) held that the rollout did not already have is the **budget wake-up**, and it is **lifted here** into the single-memo rollout. Before each phase the rollout estimates the consumed subscription budget forward from the snapshot taken once at finalization. The check is **passive**: a stale estimate MUST NOT trigger a live usage prompt or a stop — a night run must never block waiting for a human. When week or session usage estimates at or above the high-water mark (roughly ninety to ninety-five percent), the rollout schedules a **wake-up** on the current phase — `{ phaseId, wakeupIso, scheduledAt }` — sets that phase to `blocked` with a reason, and breaks; below the mark it warns softly or proceeds.

Scheduling a wake-up is a **marker, not a self-start**: the rollout cannot wake itself, but it can reliably refuse to start too early. On the next execute, once the wake-up time has passed, the phase is reset to `pending` and the marker cleared; otherwise the wake-up message is re-emitted and the run breaks again. The only legitimate source of a real budget snapshot is the dedicated usage-paste step at finalization; third-party usage tooling is forbidden.

This lift **couples to the five-hour cron mechanic** (a sibling capability in the session layer): the marker decides whether a run *may* proceed, and the cron is what actually wakes a paused run at the scheduled time and turns the passive marker into a real scheduled resume. Naming the coupling here is deliberate — the wake-up now lives in the rollout, and the cron carries it the last step. The next section specifies that cron mechanic.

---

## The Five-Hour Cron Self-Restart

The harness runs on a rolling **five-hour budget window**, and near the top of that window it raises a **high-water notification** — a harness signal at roughly ninety-five percent of the window's budget. This is the active counterpart to the passive budget estimate of the previous section: the estimate lets the rollout *refuse to start* a phase too early, while the high-water notification is the harness telling a *running* rollout that the current window is nearly spent. On that signal the rollout does not soldier on until it is cut off mid-unit; it **shuts down in a controlled way** at the nearest safe boundary — landing the current unit, committing, and recording where it stopped — then **schedules a `CronCreate`** (the harness scheduler primitive) and lets the process exit. The scheduled cron re-invokes the rollout **autonomously after the window clears** (on the order of two hours later), so the run continues on its own without a human waking it. This is specified as a **direction**: the code already carries the docking point (below), but the live wiring is deliberately left for a later, separate step.

**Reconciling "marker, not a cron job."** The deprecated plan layer described the wake-up as "a marker, not a cron job" ([42-plans.md](/specification/plans/)) — and within a single live process that is still true: a process that has exited cannot resurrect its own context, so the rollout genuinely **cannot wake itself**. What changes here is that the resume is delegated to an **out-of-process scheduler**. The controlled shutdown writes a real `CronCreate`, and the harness — not the dead process — fires it at the scheduled time and starts a **fresh** rollout context. So the wake-up is **no longer merely a passive marker**: the passive budget marker still guards against starting too early *within* a run, and the cron is the **real scheduled self-restart** that carries a paused run across the window boundary. The two layers coexist without contradiction — the marker decides whether a run *may* proceed; the cron is what actually resumes it.

**The cron resume re-enters the Rollout work mode.** A cron-scheduled resume lands in a fresh context, and a fresh context knows nothing of the arc it is continuing unless the record tells it. On restart the rollout therefore **writes a `rollout` mark** into the memo's **work-mode-state** — the immutable, append-only record of the sessions and arcs that have touched the memo (see [11-quality-and-finalization.md](/specification/quality-and-finalization/)). Because that record is **monotonic**, the mark makes the work mode **re-derive as Rollout**: a fresh context that resumes on the cron is still executing the memo's **Rollout arc** ([02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/)), never mistaken for a new authoring session. This is the same `rollout` mark an ordinary rollout start writes; the cron resume writes it too, so continuity of the work mode across the window boundary is **stated explicitly, not assumed**.

**Docking point — named, not armed.** The code carries the plug point for this mechanic without yet firing it: the rollout pre-flight (`RolloutPreflight`) reports a **cron-resume anchor** — `{ anchor: "rollout-cron-resume", armed: false, intervalHours: 5, resumeLeaf: null }` — a **named** docking point for the five-hour self-restart, deliberately **not armed**. This section specifies the *direction*; arming the anchor (wiring the real `CronCreate` and the resume leaf) is a separate, deliberate step and is **out of scope here**. Naming the anchor now keeps the spec and the code pointing at the same plug point, so the later arming has one unambiguous home.

**Read-receipt refresh (concept only).** A resumed fresh context has lost the **read-receipts** its predecessor accumulated — the receipts that record which operating material an agent has read into context (see [21-human-computer-interaction.md](/specification/human-computer-interaction/)). A read-receipt for an SOP may therefore go **stale**, or be **invalidated by contamination**, and need **refreshing** before the resumed run trusts it. This is named here as a **concept only**: the mechanism — a staleness trigger, invalidation on contamination, and a refresh path that re-reads the SOP — is **not built in this version**. Consistent with the no-follow-up-memo rule ([29-behavioral-guardrails.md](/specification/behavioral-guardrails/)), the build is **deferred to a research note in the memo's `context/`**, not spun out as a new memo.

---

## Vertical-Slice-First (Tracer-Bullet) Rollout Strategy

A rollout MAY adopt an optional execution strategy, chosen **at rollout start**, when its phases share a **risky integration** — an architecture whose end-to-end viability is not yet proven and would only be discovered after most of the work is already built. Under this strategy, the rollout first implements **one thin vertical slice that runs end-to-end across all phases** — a single narrow path that touches each layer the integration spans — to prove the architecture early, **before** fanning out the remaining breadth. Only once that one slice is demonstrably working does the rollout build out the rest of the PRDs in each phase. The intent is to de-risk: a wrong architectural assumption surfaces on the first slice, when correcting it is cheap, rather than after the full breadth has been committed to a flawed design.

The two alternatives are decided once, at rollout start:

| Strategy | When to choose | Shape of execution |
|----------|----------------|--------------------|
| **Sequential (default)** | No risky integration; phases are well-understood and independent enough. | Build each phase's full breadth in dependency order. |
| **Vertical-slice-first** | A risky integration whose viability must be proven before committing the breadth. | Build one thin end-to-end slice through all phases first; fan out the rest only after it works. |

This is an **optional rollout-execution strategy**, not a mandatory step: the sequential default is the norm, and the vertical-slice-first strategy is reached for only when the integration risk justifies the extra discipline of carving out a first slice.

> **Distinct from the strand-finalize "tracer-bullet".** This rollout strategy shares the evocative "tracer-bullet" image (a single round whose visible trace proves the line of fire) but is a **different concept** from the strand-finalize **Tracer-Bullet** decision in [25-strands.md](/specification/strands/) and [30-primitives.md](/specification/primitives/). That one is a *finalization-time* decision on a single large strand — write a strand spec and rewrite that strand's PRDs. This one is a *rollout-execution* strategy chosen at rollout start, governing the order in which the whole rollout's breadth is built. They live at different points in the workflow and on different scopes (one strand vs. the entire rollout); do not conflate them.

---

## Landing the Plane (Closing Step)

After Evaluate, the rollout MUST **land the plane** — the fourth and final step, which leaves
the workspace in a state a fresh context can resume the next morning without questions. The
full specification — the six-section landing document, the L1–L5 checklist, and the
pilot/system boundary — is in its own chapter: [Landing the Plane](/specification/landing-the-plane/).

## The Standing Lessons-Learned File

The rollout **MUST** always provision a standing lessons-learned file at `rollout/lessons-learned.md` for continuous improvement. It is provisioned regardless of outcome, so that each rollout leaves behind a record of what was learned — recurring failure modes, surprising integration points, corrections that should feed back into the skills or the memo SOP.

```
.memo/{NNN}-{slug}/
  rollout/
    state.json
    execution-state.json
    phase-{N}-state.json
    evaluate-state.json
    gotchas.md               <- living file, shared during the run
    lessons-learned.md       <- standing file, always provisioned
```

The lessons-learned file is distinct from the per-rollout state files: state files track machine progress for crash recovery (see [13-orchestration.md](/specification/orchestration/)); the lessons-learned file accumulates human-meaningful improvement notes across the rollout.

## The Living Gotchas File

The rollout **MUST** also provision a living gotchas file at `rollout/gotchas.md`. Where the lessons-learned file is a closing record, the gotchas file is an **active, shared scratchpad** maintained *during* the run: when a Worker discovers a rule that the rollout's agents keep re-deriving — a build quirk, a path convention, an ordering constraint — it **SHOULD** be written to `gotchas.md` once so that later Workers read it instead of re-discovering it. Without this, many agents independently re-learn the same handful of rules, spending subagent time on knowledge that one note would have carried.

The two files are deliberately separate and **MUST NOT** be conflated:

| File | When written | Audience | Purpose |
|------|--------------|----------|---------|
| `gotchas.md` | continuously, *during* the run | the rollout's own later Workers | active rules to apply right now, so the same rule is learned once, not many times |
| `lessons-learned.md` | at the close of the rollout | the next rollout, the skills, the SOP | retrospective improvement notes that feed back beyond this run |

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [13-orchestration.md](/specification/orchestration/) — the orchestrator, agent team, state files, crash recovery, and Tasks that execute the rollout.
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the evaluators that run the Evaluate phase in isolated context.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — the deterministic git flow that governs commits during the rollout and after a rollout stop.
- [27-landing-the-plane.md](/specification/landing-the-plane/) — full specification of the fourth rollout step: landing document structure, L1–L5 checklist, and pilot/system boundary.
- [33-maintenance.md](/specification/maintenance/) — the maintenance roof and the board the pre-rollout health check projects over.
- [26-memo-history.md](/specification/memo-history/) — the chronicle, the leading indicator of the pre-rollout health check.
- [25-strands.md](/specification/strands/) — the strand-finalize "Tracer-Bullet" decision, a distinct concept from the vertical-slice-first rollout strategy above.
- [30-primitives.md](/specification/primitives/) — the central glossary that disambiguates the two "tracer-bullet" senses.
- [02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/) — the three arcs a memo's life runs in (Create, Rollout and Review); this chapter specifies the Rollout arc.
- [21-human-computer-interaction.md](/specification/human-computer-interaction/) — the read-receipt named by the cron self-restart's read-receipt-refresh concept.
- [29-behavioral-guardrails.md](/specification/behavioral-guardrails/) — the no-follow-up-memo rule under which the read-receipt-refresh build is deferred to a research note.
- [42-plans.md](/specification/plans/) — the deprecated multi-memo plan layer; a rollout is a plan with one memo, and the plan layer's budget wake-up is lifted into this chapter.
- [00-overview.md](/specification/overview/) — conformance language.
