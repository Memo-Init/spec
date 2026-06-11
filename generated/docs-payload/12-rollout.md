---
title: "Rollout"
description: "This chapter is **normative** for the rollout trigger, the Generate→Execute→Evaluate pattern, the hands-off goal, and the standing lessons-learned file. The lessons-learned file is **specified here..."
spec_version: "0.1.0"
spec_file: "12-rollout.md"
order: 12
section: "Specification"
normative: true
generated_at: "2026-06-11T03:38:25.870Z"
generated_from: "spec/v0.1.0/12-rollout.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/12-rollout.md."
---


> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](/specification/overview/) (Conformance Language). RFC 2119 / BCP 14 keywords are used.

This chapter is **normative** for the rollout trigger, the Generate→Execute→Evaluate pattern, the hands-off goal, and the standing lessons-learned file. The lessons-learned file is **specified here but not yet implemented in the live skills** (it is follow-up work, see below).

---

## Purpose

The rollout turns a finalized memo into implemented code. It begins only **after** finalization (memo status "Finalisiert" or "Bedingt finalisiert") and only for memos of type Implementation — strategy memos end at finalization. The rollout is the autonomous half of the workflow: after the user confirms, it runs to completion without intermediate stops.

---

## Generate → Execute → Evaluate at Every Level

Every level of the rollout follows the same three-phase pattern (Generate → Execute → Evaluate). The pattern is applied recursively: the rollout as a whole, each phase, and each revision use it.

| Level | Generate | Execute | Evaluate |
|-------|----------|---------|----------|
| Rollout | Create all phases and PRDs from the memo | Run every phase | Validate the whole result against the original memo |
| Phase | Create one phase with its PRDs | Run the phase with an agent team | Check the interplay of all PRDs in the phase |
| Revision | Plan the revision | Write the revision | Verify all feedback was incorporated |

At the rollout level, **Generate** produces the PRDs and validates them bidirectionally against the memo; **Execute** iterates over the phases, delegating each to a phase agent team; **Evaluate** checks memo conformity (nothing added, nothing forgotten), runs Playwright for UI PRDs, verifies symlinks, and runs the tests. A FAIL at any phase stops the rollout and informs the user; on PASS the next phase starts immediately.

The rollout MUST begin by displaying a **duty-of-care contract** (eight commitments: implement only what the memo says, self-test every agent result, run Playwright on UI changes, start the server/script on code changes, verify symlinks on restructuring, never accept "the agent says done" as verification, report "done" only after software validation, surface problems immediately) and a tool check (Playwright MCP, Bash/Git, Tasks, sub-agents). A missing tool aborts the rollout. After the user confirms the contract, the rollout runs autonomously.

---

## Hands-Off Goal

The design goal is **hands-off after finalization**: once a memo is finalized, the user touches nothing further. The entire rollout — generate, execute, evaluate, across all phases and PRDs — runs without further user interaction except at genuine blockers.

The autonomy rules are strict:

- There MUST be no stop between Generate, Execute, and Evaluate. The system MUST NOT ask "shall I start Execute?" or "shall I start Evaluate?".
- The system stops only on FAIL (after the bounded retries) or on a hard blocker (missing tool, a revision blocker that is a genuine design decision).
- Everything else is handled autonomously.

This mirrors the empty-context discipline (see [09-contamination-context-handover.md](/specification/contamination-context-handover/)): the user's judgement is spent up front, at finalization; the rollout then executes a settled plan.

---

## The Standing Lessons-Learned File

The rollout **MUST** always provision a standing lessons-learned file at `rollout/lessons-learned.md` for continuous improvement. It is provisioned regardless of outcome, so that each rollout leaves behind a record of what was learned — recurring failure modes, surprising integration points, corrections that should feed back into the skills or the memo SOP.

```
.memo/{NNN}-{slug}/
  rollout/
    state.json
    execution-state.json
    phase-{N}-state.json
    evaluate-state.json
    lessons-learned.md       <- standing file, always provisioned
```

The lessons-learned file is distinct from the per-rollout state files: state files track machine progress for crash recovery (see [13-orchestration.md](/specification/orchestration/)); the lessons-learned file accumulates human-meaningful improvement notes across the rollout.

> **Follow-up (specified, not yet implemented):** this is a **new** requirement — no such file exists in today's rollout skills (verified). It is fixed here as spec text; provisioning it from the live rollout skills is follow-up work (a separate memo), not part of this bootstrap.

---

## Related

- [13-orchestration.md](/specification/orchestration/) — the orchestrator, agent team, state files, crash recovery, and Tasks that execute the rollout.
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the evaluators that run the Evaluate phase in isolated context.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — the deterministic git flow that governs commits during the rollout and after a rollout stop.
- [00-overview.md](/specification/overview/) — conformance language.
