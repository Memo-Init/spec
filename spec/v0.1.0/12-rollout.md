# 12. Rollout

| Field | Value |
|-------|-------|
| Status | Draft |
| Depends on | [11-quality-and-finalization.md](./11-quality-and-finalization.md) |
| Related | [13-orchestration.md](./13-orchestration.md), [14-agents-skills-tasks.md](./14-agents-skills-tasks.md), [16-git-security-versioning.md](./16-git-security-versioning.md), [00-overview.md](./00-overview.md) |

The rollout turns a finalized memo into implemented code. It begins only **after** finalization (memo status "Finalized" or "Conditionally finalized") and only for memos of type Implementation — strategy memos end at finalization. The rollout is the autonomous half of the workflow: after the user confirms, it runs to completion without intermediate stops.

---

## The Rollout: Generate → Execute → Evaluate → Land

The rollout applies the recursive **Generate → Execute → Evaluate** pattern — defined for every level in [13-orchestration.md](./13-orchestration.md) — at the rollout level, with a fourth closing step, **Land**. At the rollout level, **Generate** produces the PRDs and validates them bidirectionally against the memo; **Execute** iterates over the phases, delegating each to a phase agent team; **Evaluate** checks memo conformity (nothing added, nothing forgotten) and applies the applicable requirements for each PRD. A FAIL at any phase stops the rollout and informs the user; on PASS the next phase starts immediately. After Evaluate, **Land** (see [27-landing-the-plane.md](./27-landing-the-plane.md)) leaves the workspace in a startable "next-morning" state: worktrees cleaned, branches merged or documented, commits prepared and presented, open ends named, and a machine-readable `landing-readiness.json` written.

The rollout MUST begin by displaying a **duty-of-care contract** (eight commitments: implement only what the memo says, self-test every agent result, validate per the applicable requirements for each change, never accept "the agent says done" as verification, report "done" only after software validation, surface problems immediately) and a tool check. A missing required tool aborts the rollout. After the user confirms the contract, the rollout runs autonomously.

---

## Hands-Off Goal

The design goal is **hands-off after finalization**: once a memo is finalized, the user touches nothing further. The entire rollout — generate, execute, evaluate, across all phases and PRDs — runs without further user interaction except at genuine blockers.

The autonomy rules are strict:

- There MUST be no stop between Generate, Execute, and Evaluate. The system MUST NOT ask "shall I start Execute?" or "shall I start Evaluate?".
- The system stops only on FAIL (after the bounded retries) or on a hard blocker (missing tool, a revision blocker that is a genuine design decision).
- Everything else is handled autonomously.

This mirrors the empty-context discipline (see [09-contamination-context-handover.md](./09-contamination-context-handover.md)): the user's judgement is spent up front, at finalization; the rollout then executes a settled plan.

---

## Landing the Plane (Closing Step)

After Evaluate, the rollout MUST **land the plane** — the fourth and final step, which leaves
the workspace in a state a fresh context can resume the next morning without questions. The
full specification — the six-section landing document, the L1–L5 checklist, and the
pilot/system boundary — is in its own chapter: [Landing the Plane](./27-landing-the-plane.md).

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

The lessons-learned file is distinct from the per-rollout state files: state files track machine progress for crash recovery (see [13-orchestration.md](./13-orchestration.md)); the lessons-learned file accumulates human-meaningful improvement notes across the rollout.

---

## Related

- [13-orchestration.md](./13-orchestration.md) — the orchestrator, agent team, state files, crash recovery, and Tasks that execute the rollout.
- [14-agents-skills-tasks.md](./14-agents-skills-tasks.md) — the evaluators that run the Evaluate phase in isolated context.
- [16-git-security-versioning.md](./16-git-security-versioning.md) — the deterministic git flow that governs commits during the rollout and after a rollout stop.
- [27-landing-the-plane.md](./27-landing-the-plane.md) — full specification of the fourth rollout step: landing document structure, L1–L5 checklist, and pilot/system boundary.
- [00-overview.md](./00-overview.md) — conformance language.
