---
title: "Execution Model"
description: "The most reliable way to leave a thread half-finished is to mistake the end of the rollout for the end of the work. The rollout closes when Evaluate passes, but a passed Evaluate is only the first of..."
spec_version: "0.3.0"
spec_file: "38-stage-model.md"
order: 38
section: "Specification"
normative: true
generated_at: "2026-07-17T23:43:43.034Z"
generated_from: "memo/0.3.0/draft/spec/38-stage-model.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.3.0/draft/spec/38-stage-model.md."
---


The most reliable way to leave a thread half-finished is to mistake the end of the rollout for the end of the work. The rollout closes when Evaluate passes, but a passed Evaluate is only the first of four stages that carry a memo from "code written" to "thread done". The governing principle is short and load-bearing: **Rollout done ≠ memo done**. The rollout is stage one of four; three further stages stand between a green Evaluate and a thread that can be closed without leaving a mess for the next morning. This chapter names those four stages, fixes the condition that ends each one, and places the per-memo model under the wider plan meta-level, where the same "the rollout is only stage one of N" holds across a sequence of memos as well as within a single one.

---

## The Four Stages

The process end is a fixed, ordered sequence. Each stage has a single job and a single condition that ends it; a stage is not complete until its end-condition holds, and the next stage does not begin until the previous one is done. The condition is what makes the boundary checkable rather than a matter of judgement.

| Stage | Name | Content | Ends when |
|-------|------|---------|-----------|
| 1 | Rollout | Generate → Execute → Evaluate | Evaluate PASS |
| 2 | Landing the Plane | clean up, name open ends honestly, chronicle + handover, worktree cleanup | the workspace is "next-morning" startable |
| 3 | Merge Preparation | branches ID-named, locally merged up to `main`, commits prepared and presented | clean and conflict-free, push-ready |
| 4 | Merge / Push Gate | the user authorizes the push (push is never automatic) | the user pushes and the thread is done |

**Stage 1 — Rollout.** The autonomous half: Generate produces the work orders, Execute implements them across phases, Evaluate checks memo conformity. The stage ends on a green Evaluate. Its full specification is [12-rollout.md](/specification/rollout/). A green Evaluate ends the rollout — it does not end the memo.

**Stage 2 — Landing the Plane.** Landing renders the end-state legible and resumable: it cleans worktrees, names open ends honestly (including a `verdict: OPEN` where that is the truth), writes the chronicle entry and the handover, and leaves the workspace in a state a fresh context can pick up the next morning without questions. Its full specification is [27-landing-the-plane.md](/specification/landing-the-plane/). **Landing is always mandatory** — it is never skipped, regardless of whether the merge stages run immediately or later, because a thread left without a landing is a thread the next session has to reconstruct.

**Stage 3 — Merge Preparation.** With the workspace landed, the branches are named by their memo ID (see [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)), the system performs the **local merge up to `main`** deterministically, and the commits are prepared and presented. The stage ends when the result is clean and conflict-free — push-ready, with nothing left to resolve before release.

**Stage 4 — Merge / Push Gate.** The final boundary is the user's. The user authorizes the push; the push is never automatic. The stage — and the thread — ends when the user pushes.

---

## The REVIEW Bookend

The four stages are framed by two named user touchpoints, one at each end. At the **front**, before the rollout begins, stands the memo-init question round: the user answers the open questions and confirms finalization, and only then does the duty-of-care break hand control to the autonomous rollout (the `U2 → Q → G1 → B1` path of the interaction model, [21-human-computer-interaction.md](/specification/human-computer-interaction/)). At the **back**, once landing has rendered the end-state legible, stands the symmetric touchpoint: the **REVIEW**. It is the shape given to the interaction model's `U3` node — the bare "review result" step — which the review bookend raises from a vague hand-back into a named user review with three areas (specified in [27-landing-the-plane.md](/specification/landing-the-plane/)).

The REVIEW is a **bookend, not a new channel.** It is the fully-formed expression of the fourth communication point of the autonomous rollout — the bundled hand-back at landing — not a fifth place where the run stops to ask permission mid-flight. The coarse **Review** work mode named in the next section is the lens over this same review, not a competing mechanism: the bookend is where the report renders at landing, and the work mode is what the terminal reports the session is in. Where the front bookend gathers the user's decisions *before* the autonomous span, the back bookend presents the run's outcome *after* it: a per-repo review-folder table (each repo by its `inward/outward` facing, whether it was fully checked, and any anomalies), a short neutral narrative of what ran, and the items set aside for the user to review — including any **Snag** deferred under guardrail C10 ([29-behavioral-guardrails.md](/specification/behavioral-guardrails/)). The user reads the REVIEW and decides; that decision is the same push gate the stage model already ends on, now reached through a named review rather than a bare hand-off.

---

## The Create / Rollout / Review Work-Mode Triptych

Above the fine-grained four stages sits a coarser lens: the **work mode** a memo is in, which takes exactly three **arc** values — **Create**, **Rollout**, and **Review**. This triptych is the per-terminal view the statusline reports for the memo the current session is touching, and it is a *lens over* the four-stage mechanics, never a replacement for them. The four stages, their two gates, and their order are unchanged; the triptych only names the coarse arc a session is working in. Create is the authoring arc — the memo-init and revision work; Rollout is the autonomous arc — Generate, Execute, Evaluate; Review is the fresh-context arc that reads the run's result after the autonomous span. These are the three **arcs** of a memo's life ([02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/)); the work mode is the state derived from which arc a session is in.

Below the triptych the statusline reports one **floor** value, **idle**, for a session that is in a project but bound to **no** memo — or whose memo entry-point log is still empty. `idle` is the no-memo resting value, **not** a fourth arc of a memo's life: the memo-arc lens stays three-valued, while the *reported* statusline work-mode is four-valued — **idle → Create → Rollout → Review**. That four-value reported enum, with `idle` as its monotonic floor (precedence Review > Rollout > Create > idle), is the same one the session tier derives and pins as the canonical work-mode-state (session-tier `REQ-SS-WORKMODE`, `08-identity-pin.md`); this section is only the memo-tier lens over it.

Naming Review as a first-class third work mode closes a seam without adding a mechanism. The work of reviewing already exists and already runs fresh: the fresh-context Evaluate that closes the rollout, the adversarial user-intent audit that precedes it, and the three-area review report rendered at landing. The triptych gives that existing, already-fresh work a single name and makes it visible as its own mode, rather than leaving it split silently across the end of Stage 1 and the back bookend of Stage 2.

- **Fresh context, guaranteed.** Review runs in a **new context** — a deliberate clearing after the autonomous rollout span, the mirror image of the reset that already happens *before* landing ([27-landing-the-plane.md](/specification/landing-the-plane/)). Judging the whole run inside the still-full rollout context is what a clean cut is meant to prevent: a fresh reader weighs the result, not a contaminated memory of what the work intended.
- **Built on Evaluate — no new motor.** Review reuses the fresh-context machinery already in place: the rollout's Evaluate step already runs fresh, and the user-intent audit is already an adversarial fresh read against the original transcripts. Review is their roof, not a second bidirectional engine and not a fifth mid-flight stop.
- **Deliberately light.** Review adds no new heavy process and no additional question stop. The delta over the prior model is naming and visibility — the work mode — plus the guaranteed cut, and nothing more.
- **The report stays the single render.** The three-area review report is authored once, at landing ([27-landing-the-plane.md](/specification/landing-the-plane/)); this section references it and does not restate it. The **REVIEW bookend** above renders that report at the close of landing; the Review work mode is the coarse arc under which the reading happens. One report, one render — the bookend and the work mode are two views of the same review, not two review mechanisms.
- **Lifecycle state is owned elsewhere.** Review reads and advances the memo's lifecycle state — the transition into a closing state — but does not define that vocabulary; the lifecycle enum is owned by [47-memo-lifecycle.md](/specification/memo-lifecycle/), which Review references rather than rebuilds.

---

## What "The System Merges, The User Releases" Means

The boundary between stage three and stage four is precise, and a common over-statement gets it wrong. It is **not** true that "the user does the merge". The system performs the local merge up to `main` deterministically as part of merge preparation: it folds the ID-named branches together, resolves the integration locally, and presents a clean, conflict-free `main` ready to release. What the system does **not** do is push. The push is the one act of release that stays with the user, every time, and is never automatic.

So the correct framing is a split: **the system merges locally, the user releases by pushing.** Stage three is deterministic system work — branch naming, local merge, commit preparation — and it produces a push-ready state. Stage four is the human gate — the user inspects what is prepared and authorizes the push. Conflating the two, in either direction, is the error this chapter exists to prevent: the system must not push on its own, and "the user merges" must not be used to excuse the system from doing the deterministic local merge it is responsible for.

---

## The Plan Meta-Level

Above the per-memo stage model sits the **plan**. A plan carries one or more memos, and the stages described here apply to each memo in turn. The plan does not replace the per-memo sequence; it nests it. The same shape — "the rollout is only the first stage of N" — holds at both levels: within a single memo, a passed Evaluate is stage one of four; across a plan, a finished rollout of one memo is one step of a longer sequence, with its own landing, merge preparation, and push gate still ahead, and further memos behind it.

The practical consequence is that closing a memo's rollout never closes the plan, and closing a memo's four stages never implies the plan is done while sibling memos remain. The push gate is reached per memo; a plan is finished only when every memo it carries has passed its own stage four. The meta-level is therefore not a different process but the same process applied repeatedly, with the plan as the ledger that records which memos have reached the gate and which have not.

---

## The Stage Lifecycle

The lifecycle moves a finalized memo through the four stages to a closed thread. Solid edges are **gates** — a condition that must hold before the next stage begins. Dotted edges are **coordinated stage handovers** — a baton pass where the work continues but the responsibility moves from one stage's job to the next.

```mermaid
flowchart TD
    M([Memo finalized]) -.-> S1[Stage 1: Rollout<br/>Generate → Execute → Evaluate]
    S1 --> G1{Evaluate PASS?}
    G1 -->|no| S1
    G1 -->|yes| S2[Stage 2: Landing the Plane<br/>clean up · chronicle · handover · worktrees]
    S2 -.-> S3[Stage 3: Merge Preparation<br/>ID-named branches · local merge to main · commits prepared]
    S3 --> G2{clean & conflict-free?}
    G2 -->|no| S3
    G2 -->|yes| S4[Stage 4: Merge / Push Gate<br/>user authorizes the push]
    S4 --> D([thread done])
```

The two gates are the checkable boundaries: the Evaluate gate closes stage one, and the clean-and-conflict-free gate closes stage three. The dotted handovers — finalized memo into rollout, landing into merge preparation — are coordinated baton passes rather than pass/fail checks: the work flows on, but the stage's job changes hands. The final edge into "thread done" is the user's push, the only place where the sequence leaves the system's hands entirely.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [12-rollout.md](/specification/rollout/) — stage one, the autonomous Generate → Execute → Evaluate that ends on a green Evaluate.
- [27-landing-the-plane.md](/specification/landing-the-plane/) — stage two, the always-mandatory landing that leaves the workspace next-morning startable.
- [13-orchestration.md](/specification/orchestration/) — the orchestrator and state files that drive the stages and record their progress.
- [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/) — the ID-named branches and the deterministic git flow behind merge preparation and the push gate.
- [02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/) — the three arcs of a memo's life (Create, Rollout, Review) the work-mode triptych is the coarse lens over.
- [47-memo-lifecycle.md](/specification/memo-lifecycle/) — the memo lifecycle state the Review work mode reads and advances but does not define.
- [21-human-computer-interaction.md](/specification/human-computer-interaction/) — the interaction model whose `U3` "review result" node the REVIEW bookend gives shape to.
- [29-behavioral-guardrails.md](/specification/behavioral-guardrails/) — guardrail C10 (set a Snag aside), whose set-aside items surface at the REVIEW bookend.
- [00-overview.md](/specification/overview/) — conformance language.
