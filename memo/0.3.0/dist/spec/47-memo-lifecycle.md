---
title: "Memo Lifecycle"
description: "\"Which memos are still open?\" is a question the system must answer with one command, deterministically, at any moment. For a long time it could not. There was no memo-level state at all — only five..."
spec_version: "0.3.0"
spec_file: "47-memo-lifecycle.md"
order: 47
section: "Specification"
normative: true
generated_at: "2026-07-17T23:43:43.034Z"
generated_from: "memo/0.3.0/draft/spec/47-memo-lifecycle.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.3.0/draft/spec/47-memo-lifecycle.md."
---


"Which memos are still open?" is a question the system must answer with one command, deterministically, at any moment. For a long time it could not. There was no memo-level state at all — only five independent part-signals (a free-text Status header, several sorts of rollout state file, two sorts of readiness marker, chronicle prose, and session marks) that different skills hand-wrote at different times, that contradicted each other live, and that between them could not even name the branches that matter to the author: **abandoned**, **finished as research**, **implemented and pushed**. Computing "open" from that data ran into a different answer on every path. This chapter defines the one memo-level lifecycle that replaces the guesswork: a canonical state set, a transition matrix that rejects illegal moves, a single append-only write path, and the automatic transitions and gates that keep the record honest without a new hand-step.

The lifecycle sits **above** the phase-level state of a rollout. It is not the phase state machine of [13-orchestration.md](/specification/orchestration/) (which tracks PRD-generation and execution inside one rollout) and it does not replace it. It is the memo's own arc, from the empty slot before authoring to the terminal state after the push — the layer the four-stage process model of [38-stage-model.md](/specification/stage-model/) describes narratively, made into queryable data.

---

## The Ten States

The lifecycle has exactly ten states. Their order is the natural progression of a memo; the branches (abandonment, the research end, the reopen) are the deviations from that line. The state identifiers are stable tokens — the same strings the store, the CLI, and the board use — so the vocabulary never drifts into free text again.

| # | State | Set when | Kind |
|---|-------|----------|------|
| 1 | `angelegt` | the empty slot is created (a memo is started) | open |
| 2 | `in-revision` | the first and every further revision | open |
| 3 | `finalisiert-research` | finalization of a Strategy/Research memo — analysis only, no code | **terminal** |
| 4 | `finalisiert-implementation` | finalization of an Implementation memo, ready for rollout | open |
| 5 | `rollout` | the rollout is generated and running | open |
| 6 | `pausiert` | a user-gated pause mid-rollout | open |
| 7 | `gelandet` | Stage 2 landing reached (Evaluate PASS) | open |
| 8 | `gemerged` | Stage 3 local merge up to `main` (not yet pushed) | open |
| 9 | `abgeschlossen` | Stage 4 push after the user's authorization | **terminal** |
| 10 | `abgebrochen` | an explicit decision to abandon, from any non-terminal state | **terminal** |

The **terminal** set is `{ finalisiert-research, abgeschlossen, abgebrochen }`. The **open** set is the seven non-terminal states. This is the whole answer to the user question: a memo is **open** exactly when its state is non-terminal. `finalisiert-research` counts as done because a Strategy memo ends at finalization ([05-memo-strategies.md](/specification/memo-strategies/)); `abgeschlossen` is done-and-pushed; `abgebrochen` is deliberately given up. Everything else is still open.

The split of the finalized state into `finalisiert-research` and `finalisiert-implementation` is what lets the system tell a correctly-finished research memo from an implementation memo that stalled before rollout — the distinction that the old header-plus-folder heuristic could not make and that made it flag a finished research memo as critically incomplete.

---

## The Transition Matrix

A move between states is legal only if the matrix permits it. An illegal move (for example `angelegt → rollout`) is a loud failure that names the legal targets — never a silent default, in keeping with the house rule against silent defaults.

| From | Legal targets |
|------|---------------|
| `angelegt` | `in-revision`, `abgebrochen` |
| `in-revision` | `in-revision` (a further revision), `finalisiert-research`, `finalisiert-implementation`, `abgebrochen` |
| `finalisiert-research` | — (only `in-revision` via reopen) |
| `finalisiert-implementation` | `rollout`, `abgebrochen` (re-revision via reopen) |
| `rollout` | `pausiert`, `gelandet`, `abgebrochen` |
| `pausiert` | `rollout`, `abgebrochen` |
| `gelandet` | `gemerged`, `abgebrochen` |
| `gemerged` | `abgeschlossen`, `abgebrochen` |
| `abgeschlossen` | — (only `in-revision` via reopen) |
| `abgebrochen` | — (only `in-revision` via reopen) |

Three rules govern the matrix. First, `abgebrochen` is reachable from **every** non-terminal state — a memo can be abandoned at any point before it terminates. Second, terminal states have **no** regular outgoing edges; the only way back is an explicit **reopen** (below). Third, `in-revision` self-loops, because a further revision is a legal same-state event, not a no-op.

### The Reopen Escape

A terminal state is not a life sentence, but leaving one is never accidental. The only exit from a terminal state is an explicit **reopen** event, which pulls the state back to `in-revision` and is the sole move a reopen may make. The reopen is recorded as its own event kind; the prior terminal event stays in the log. History is append-only and immutable — a reopen adds a line, it never erases the fact that the memo once reached a terminal state.

---

## The Store: One Append-Only Log, One Write Path

The lifecycle is stored as a memo-local append-only event log at `<memoDir>/lifecycle.jsonl`. It is memo-local, not project-global, because every skill that would set a state already holds a memo directory, and the board simply folds each memo's log in turn. Each event is a small record:

```
{ state, at, by, evidence, kind }
```

`state` is one of the ten; `at` is the ISO timestamp; `by` names who or what set it; `evidence` is a short note (a skill name, a gate verdict); `kind` is `transition` or `reopen`. The current state is **re-derived from the log on every read** — the last event wins. Nothing is ever mutated in place, and a second event is a second line, never a rewrite. A memo with no event yet derives to a null state (an explicit "no state established"), never a guessed one.

There is exactly **one write path** for the machine state: the lifecycle-set CLI leaf. The enum guard and the transition matrix live on that write path, so an illegal or misspelled state cannot enter the log. What ends is the practice of treating a revision's Status header as the *authoritative* lifecycle marker and flipping it in place after the fact — the pattern that let the header say one thing while a marker said another. The revision's human-readable `Status` field does not disappear: it remains the document's own status line, authored as part of the revision it belongs to (a finalization revision carries `Finalisiert`). The two are coherent by construction — the ledger is the machine truth, the header is the reader-facing status — because they are set together when the revision is written, not patched onto an older file later.

---

## Delimitation — What the Lifecycle Is Not

The lifecycle is a new layer, not a new store type. It coexists with three neighbours, each of which keeps its own job.

- **The phase state files** (`state.json` and its siblings, [13-orchestration.md](/specification/orchestration/)) track progress **inside** a rollout, at PRD/phase granularity, and serve crash-recovery. Their vocabulary (`pending`, `in_progress`, `completed`, `failed`) is the phase level. The lifecycle is the memo level above them; it does not read or replace them. A `rollout` lifecycle state says the rollout is running — the phase files say how far.
- **The chronicle** ([26-memo-history.md](/specification/memo-history/)) is the narrated story of a memo. It explains; it does not carry a queryable state field. The lifecycle carries the state; the chronicle carries the reasons.
- **The session marks** (`sessions.jsonl`) record which session touched a memo and in which work mode. That log is the model the lifecycle store mirrors — append-only, monotonically derived — but it answers "who worked on this, when", not "where is the memo in its arc".

The lifecycle store also takes over the one ledger role that the deprecated plan layer was once assigned in [38-stage-model.md](/specification/stage-model/): recording which memos have reached the push gate. The push-and-done truth, previously reconstructable only from git remotes and out-of-band notes, is now a first-class terminal state (`abgeschlossen`).

---

## Automatic Transitions

The lifecycle must not add a hand-step. Every skill that already writes an artifact also sets the corresponding state, so the record advances by itself and cannot be forgotten. The table fixes which skill owns which transition.

| Point in the workflow | Transition set |
|---|---|
| a memo is started | `angelegt` |
| the first revision is written | `in-revision` |
| finalization of a Strategy/Research memo | `finalisiert-research` |
| finalization of an Implementation memo | `finalisiert-implementation` |
| the rollout is generated | `rollout` |
| a user-gated pause | `pausiert` |
| Stage 2 landing (Evaluate PASS) | `gelandet` |
| Stage 3 local merge up to `main` | `gemerged` |
| the push, after the user authorizes it | `abgeschlossen` |
| an explicit decision to give up | `abgebrochen` |

The finalize transition adds a machine-authoritative record of the finalized fact, so it no longer rests on a hand-flipped header alone — the step that was demonstrably skipped. The finalization revision still carries its human-readable `Finalisiert` status header; the lifecycle event is set alongside it, and the two agree. The type branch (`finalisiert-research` versus `finalisiert-implementation`) follows the memo type, so the research end and the pre-rollout state are distinguished automatically.

---

## Gates

Where the order matters, a gate enforces it against the current state. The gates read the derived state; they compute nothing themselves.

- **Rollout start** is a **hard** gate: a rollout may begin only from `finalisiert-implementation`. Any other state blocks it. This is the one gate the author asked to be strict, because a rollout that starts from an unfinalized state is exactly the failure the lifecycle exists to prevent.
- **Revision start** is warn-armed: starting a revision on a terminal memo requires an explicit reopen; otherwise it warns. Its mode (warn, hard, or off) is resolved from project config, defaulting to warn.
- **Chronicle add** is warn-armed: chronicling before a memo has landed or ended is premature and warns, so the chronicle-gap cases surface rather than pass silently.

The hard/warn split is deliberate and follows the gate discipline of the rest of the system: the one gate whose violation breaks the build is hard; the advisory ones report without blocking and can be armed further through config.

---

## Backfill

The store starts empty, so the existing memos need an initial state derived from their pre-store signals. The migration derives a best-effort state per memo through the same single write path — never a hand-written log — under one rule: **no silent guessing**. A memo whose signals are known to contradict, or whose completion cannot be told from the memo's own data (a rolled-out memo whose push lives only in git history), is proposed as **undetermined** and left for a human decision, not written. The migration is idempotent and offers a dry run that writes nothing. The undetermined marker is not one of the ten states — it is a rendered "needs a decision" label, never appended to a log.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — finalization is the single binary verdict that produces the `finalisiert-research` or `finalisiert-implementation` transition; there is no conditional intermediate verdict.
- [12-rollout.md](/specification/rollout/) — the rollout runs only from `finalisiert-implementation` (the hard rollout-start gate); its own phase state lives one level below this lifecycle.
- [13-orchestration.md](/specification/orchestration/) — the phase state files are the level below: PRD/phase progress and crash-recovery inside one rollout, not the memo-level arc.
- [38-stage-model.md](/specification/stage-model/) — the four process-end stages (landing, merge, push) are the narrative of the `gelandet → gemerged → abgeschlossen` tail; this chapter makes those stages queryable state.
- [31-goals.md](/specification/goals/) — the goal/maintenance scoring layer is the register→deterministic-CLI-write→board pattern this lifecycle mirrors on the memo level.
