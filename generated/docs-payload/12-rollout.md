---
title: "Rollout"
description: "The rollout turns a finalized memo into implemented code. It begins only **after** finalization (memo status \"Finalized\" or \"Conditionally finalized\") and only for memos of type Implementation —..."
spec_version: "0.1.0"
spec_file: "12-rollout.md"
order: 12
section: "Specification"
normative: true
generated_at: "2026-06-27T19:52:51.135Z"
generated_from: "spec/v0.1.0/12-rollout.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/12-rollout.md."
---


The rollout turns a finalized memo into implemented code. It begins only **after** finalization (memo status "Finalized" or "Conditionally finalized") and only for memos of type Implementation — strategy memos end at finalization. The rollout is the autonomous half of the workflow: after the user confirms, it runs to completion without intermediate stops.

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

## Related

- [13-orchestration.md](/specification/orchestration/) — the orchestrator, agent team, state files, crash recovery, and Tasks that execute the rollout.
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the evaluators that run the Evaluate phase in isolated context.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — the deterministic git flow that governs commits during the rollout and after a rollout stop.
- [27-landing-the-plane.md](/specification/landing-the-plane/) — full specification of the fourth rollout step: landing document structure, L1–L5 checklist, and pilot/system boundary.
- [33-maintenance.md](/specification/maintenance/) — the maintenance roof and the board the pre-rollout health check projects over.
- [26-memo-history.md](/specification/memo-history/) — the chronicle, the leading indicator of the pre-rollout health check.
- [25-strands.md](/specification/strands/) — the strand-finalize "Tracer-Bullet" decision, a distinct concept from the vertical-slice-first rollout strategy above.
- [30-primitives.md](/specification/primitives/) — the central glossary that disambiguates the two "tracer-bullet" senses.
- [00-overview.md](/specification/overview/) — conformance language.
