# 27. Landing the Plane

| Field | Value |
|-------|-------|
| Status | Draft |
| Related | [12-rollout.md](./12-rollout.md), [13-orchestration.md](./13-orchestration.md), [16-git-security-versioning.md](./16-git-security-versioning.md), [31-goals.md](./31-goals.md), [33-maintenance.md](./33-maintenance.md), [38-stage-model.md](./38-stage-model.md), [00-overview.md](./00-overview.md) |

Landing the plane is the second stage of the process end, the step that follows a green Evaluate. The rollout (Generate, Execute, Evaluate) is the first stage; landing is the second, and merge preparation and the push gate follow it (see [38-stage-model.md](./38-stage-model.md)). Where Evaluate decides whether the work is correct, landing decides whether the workspace is in a state someone can resume. It leaves the workspace better than it was found, in a condition a fresh context can pick up the next morning without questions. This is the precondition of the "interlocking brick" principle: a new memo only docks cleanly onto a workspace that the previous memo left correctly.

Landing prepares; it does not perform the merge. As Stage 2 it makes the workspace startable and push-ready in principle — worktrees cleaned, open ends named, the chronicle written — and hands off to Merge Preparation (Stage 3), which carries every working branch through a local merge up to `main`. The division of labour between these two stages is fixed in [38-stage-model.md](./38-stage-model.md) and is referenced throughout this chapter.

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
- **OPEN ENDS** — what is not finished, grouped into three categories: items deferred by decision, items blocked on an external dependency, and items that need review before they can close. These landing categories are per-open-end and applied at the close of the rollout; they are distinct from the per-unit three exits of Worker output during execution (set / justified-omit / blocked, see [13-orchestration.md](./13-orchestration.md)) and MUST NOT be conflated with them.
- **MACHINE-READABLE** — a `landing-readiness.json` marker capturing the end-state in structured form, so an orchestrator or a fresh context can read the landing without parsing prose.
- **RE-ENTRY** — the exact command to resume, written out literally so the next session can copy it and continue without rediscovering how to restart.

---

## The Landing Checklist (L1–L8)

Landing is complete when these items hold:

- **L1** — Worktrees are cleaned. No stray worktrees are left behind; each one created during the rollout is removed or accounted for. Worktree cleanup is a mandatory part of landing, not an optional tidy-up.
- **L2** — Branches are carried through to a local merge. Landing (Stage 2) leaves the workspace startable; Merge Preparation (Stage 3) then takes every working branch through a local merge up to `main` (see [38-stage-model.md](./38-stage-model.md)). Merging is the default outcome: a branch is folded back into `main` unless there is a justified exception, in which case the landing document names that branch and the explicit reason it remains unmerged. "Documented instead of merged" is an exception with a named reason, never the easy default that leaves stub branches behind.
- **L3** — Commits are prepared and locally merged, but **never pushed**. The system commits the per-PRD changes and performs the deterministic local merge up to `main` during merge preparation; what stays with the pilot is the push. A commit is not a push, and a local merge is not a release: the system prepares commits and merges locally to a clean, push-ready `main`, but the push — the single act of release — is never automatic and is always the pilot's.
- **L4** — Open ends are named. Deferred items, blocker resolutions, and needs-review remnants appear in the OPEN ENDS section; nothing finished-but-unstated is left implicit.
- **L5** — The end-state is machine-readable. The `landing-readiness.json` marker is written so the landing can be consumed without reading prose.
- **L6** — Goals and Maintenance are score-refreshed. In the fresh landing context both boards are re-scored — `memo goal score-all` and `memo maintenance score-all`, one agent per goal and per repo, never the working session — and this runs **before** L7 so the fresh boards are captured. The refreshed boards are written into the `landing-readiness.json` marker (the `L6_scores` block); a skipped refresh is recorded as `L6_scores.status: "skipped"`, never silently omitted. The reason landing is the right moment, and the cross-links to the two scored chapters, are in [Goals & Maintenance at Landing](#goals--maintenance-at-landing) below.
- **L7** — Exactly one narrated chronicle entry is appended. At the close of landing the system writes a single narrated chronicle entry for the memo via the canonical `memo chronic add` command (append-only, chaining N→N-1), naming the touched topic IDs and telling the real sequence of work — what was done, what was given up. This is what lets the next memo dock cleanly: the next `memo-init` reads the chronicle and lands on the right places (the interlocking-brick principle). The order is L1–L5 → L6 (scores) → L7 (chronicle) → L8 (snags); the former "L6 deliberately unassigned" reservation is superseded.
- **L8** — Leftover snags are promoted into the store. After the chronicle, the run's deliberate set-asides are captured so they outlive the memo: the OPEN ENDS `needs-review` category and the genuinely-hard PILOT TASKS are each promoted into the cross-memo Snag-Store via `memo snag add` — one flat Markdown file per snag under `.memo/snags/{origin-NNN}-{slug}.md` (append-only, NO-OVERWRITE). Each promoted snag inherits `Origin-Memo` = the current memo, `Status: open`, and `Created` = the landing timestamp (an ISO string supplied by the caller — the core reads no clock), and it usually carries the `Erstellungs-Kontext: voll` note because it was born in a full end-of-rollout context. Snags age, but "Claude does not understand time", so staleness is a **deterministic flag only** (both timestamps caller-supplied, computed by `SnagStaleness`): `stale` marks a snag, it never deletes one — a snag is **never auto-deleted**, and closing it (`resolved`) is later the job of the verify sub-agent or the user, not of landing. This is where the set-aside items of the review report's "needs review" area (see below) become durable store entries the next `memo-init` can read.

---

## Goals & Maintenance at Landing

Landing is the **canonical score-refresh point** for the two measured poles of the work: the forward **goal** (the bow, [31-goals.md](./31-goals.md)) and its backward twin **maintenance** (the stern, [33-maintenance.md](./33-maintenance.md)). This is the L6 step of the checklist above. Two reasons make the close of the run the right moment, not the start of the next rollout:

- **The effect is real now.** Both poles measure *delivered* state, not intent. Only once the rollout's work has actually landed is there a true state to score — so the honest reading is taken here, at the process end, rather than deferred to whenever the next run happens to read it.
- **The context is already fresh.** Scoring both poles carries a hard rule: it is **never** done in the working session, always in a fresh context (the *how*, specified in [31-goals.md](./31-goals.md) and [33-maintenance.md](./33-maintenance.md)). Landing already runs after a context reset (see "Why Landing Is Its Own Step" above), so the fresh reader the score requires is exactly the reader landing already is. The two constraints — *fresh context* and *at landing* — meet here.

Mechanically, L6 spawns `memo goal score-all` and `memo maintenance score-all` (one agent per goal and per repo — the skills fan out per item themselves), captures the resulting boards into the `landing-readiness.json` marker under `L6_scores`, and runs before the L7 chronicle entry. The board mechanics — the strict score object, the second deterministic axis, and the `releaseReady` flag a pre-rollout health check later reads — are **not** restated here; they live in [31-goals.md](./31-goals.md) and [33-maintenance.md](./33-maintenance.md). This chapter fixes only the *when*: the refresh happens at landing.

---

## Pilot and System

The **user is the pilot**; the system prepares a landing the pilot can act on with as few questions as possible. The boundary is sharp and is a hard rule, but it falls at the push, not at the commit. The system commits the per-PRD changes and performs the deterministic local merge up to `main` during merge preparation; what stays with the pilot is the push. A commit is not a push, and a local merge is not a release: the system prepares commits and merges locally to a clean, push-ready `main`, but the push — the single act of release — is never automatic and is always the pilot's. This replaces the older "never committed by the system" framing with "committed and locally merged, never pushed".

Two distinctions sharpen this. A commit is not a push: the system writes the commits and folds the branches together locally, but the push that releases them is a further, separate act that is never automatic. And a clean, push-ready `main` is the system's ceiling — the work is committed, merged, and explained, but the decision to release it is the pilot's, taken at the next break. A `verdict: OPEN` is not a failure: honest landing names open ends rather than hiding them, and the system's job remains to leave the pilot a landing that needs as few questions as possible.

---

## The Review Report — Three Areas

The REVIEW is the back bookend of the process (see [38-stage-model.md](./38-stage-model.md)): the named user touchpoint that gives shape to the interaction model's `U3` "review result" node ([21-human-computer-interaction.md](./21-human-computer-interaction.md)). It is not a new channel — it is the fully-formed expression of the fourth communication point, the bundled hand-back at landing. Where the front bookend is the memo-init question round the user answers *before* the autonomous span, the review report is what the user reads *after* it, and it is rendered on the reply channel (R1) as markdown in the reply, never as a raw command dump ([21-human-computer-interaction.md](./21-human-computer-interaction.md)). The report has exactly **three areas**:

- **(a) The review folder table.** One row per folder or git repo, carried by four columns: `Folder/Git-Repo | inward/outward | fully checked? | anomalies`. The `inward/outward` column is the repository's **facing** — the same `facing` axis Rule C1 uses to decide issue-versus-memo-ID orientation ([17-git-workflow-and-ids.md](./17-git-workflow-and-ids.md)) — recorded here so the review shows, per repo, its direction, whether it was checked in full, and any neutral findings. This table is the review lens over the same repositories the WHAT WAS DONE table records: WHAT WAS DONE says *what changed*, the review folder table says *whether it was checked and what stood out*.
- **(b) A short neutral narrative — what ran, what ran well, anomalies.** A brief prose account of how the run actually went: what ran, what ran well, and what stood out as an anomaly. It is deliberately **neutral and un-graded** — the oil-level principle: a finding near the edge of an accepted range is listed as an anomaly to investigate and surface, never pre-triaged into a severity or silently waved through. Listing an anomaly is not the same as grading it.
- **(c) Needs review — the set-aside items.** The items the run set aside rather than solved: each **Snag** deferred under guardrail C10 ([29-behavioral-guardrails.md](./29-behavioral-guardrails.md)) together with the needs-review remnants from the OPEN ENDS section. This is where the run's deliberate set-asides become visible to the user, who decides what happens to each — the point at which C7 ("deferring is the user's decision") becomes real.

The naming is exact and must not drift: the set-aside **item** is a **Snag**; **anomaly** (Auffälligkeit) is the **column** in the folder table where a neutral finding is recorded, not a second name for the item. One item, one name. The four columns render deterministically from the `repos[]` block of the machine-readable `landing-readiness.json` marker (`name → Folder/Git-Repo`, `facing → inward/outward`, `checked → fully checked?`, `anomalies → anomalies`); the review report is a documented render mapping, not a new engine.

---

## Conformity Requirements

The landing checklist above is a binding gate, not only guidance. The rule that a completed phase leaves no loose ends behind — no open worktrees, branches, or stashes and no dead code — is authored here as a declarative requirement, the machine-readable source the requirement store is harvested from ([23-requirements.md](./23-requirements.md)). The check faces the end-of-phase gate, and the doer is not the grader.

The landing is complete only when the working state is clean, so the check is a hard yes/no over the repository state:

```requirement
{
  "id": "REQ-052",
  "title": "A completed phase leaves no loose git state or dead code",
  "statement": "After a phase completes there are no open worktrees, branches, or stashes and no dead code left behind — the work is landed. Worktrees created for the phase are removed or pruned, temporary branches are folded in, and stashes are resolved rather than left dangling.",
  "scope": { "repos": [], "categories": ["repo"], "tags": [] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No open worktrees, branches, or stashes belonging to the completed phase remain",
      "No dead or commented-out code introduced by the phase is left behind"
    ]
  }
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [12-rollout.md](./12-rollout.md) — the rollout (Stage 1) that runs Generate, Execute, and Evaluate before this landing stage.
- [38-stage-model.md](./38-stage-model.md) — the four-stage process end; landing is Stage 2, merge preparation (the local merge up to `main`) is Stage 3, and the push gate is Stage 4.
- [13-orchestration.md](./13-orchestration.md) — the orchestrator, agent team, and state files that drive the rollout and feed the machine-readable marker.
- [16-git-security-versioning.md](./16-git-security-versioning.md) — the deterministic git flow governing worktrees, branches, and the commits and local merge the landing and merge preparation prepare.
- [17-git-workflow-and-ids.md](./17-git-workflow-and-ids.md) — Rule C1 and the `inward/outward` facing axis the review folder table records per repo.
- [31-goals.md](./31-goals.md) — the forward goal pole re-scored at the L6 landing step (`memo goal score-all`, fresh context).
- [33-maintenance.md](./33-maintenance.md) — the backward maintenance twin re-scored at the same L6 step (`memo maintenance score-all`, fresh context).
- [21-human-computer-interaction.md](./21-human-computer-interaction.md) — the interaction model whose `U3` "review result" node the review report gives shape to, and the R1 reply-channel rule it renders on.
- [29-behavioral-guardrails.md](./29-behavioral-guardrails.md) — guardrail C10 (set a Snag aside), whose set-aside items appear in the review report's "needs review" area.
- [00-overview.md](./00-overview.md) — conformance language.
