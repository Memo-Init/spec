---
title: "Lineage — The Session Tree"
description: "A single `sessionId` names one session and only one — a changed id is, by definition, a new session ([08-identity-pin.md](./08-identity-pin.md)). Real work, though, does not fit inside one session:..."
session_version: "0.3.0"
spec_file: "18-lineage.md"
order: 18
section: "Session"
normative: true
generated_at: "2026-07-17T23:43:43.034Z"
generated_from: "session/0.3.0/draft/spec/18-lineage.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: session/0.3.0/draft/spec/18-lineage.md."
---


A single `sessionId` names one session and only one — a changed id is, by definition, a new session ([08-identity-pin.md](/session/identity-pin/)). Real work, though, does not fit inside one session: it is authored across a `/clear`, resumed after a restart, and fanned out to spawned workers. This chapter specifies the **lineage** — the thread that ties those sessions into one **line of work** — and the **session tree** built from it, so a reader can walk backward from a finished change to the session, the workers, and the commits that produced it. The key that carries the line is the `lineageId` defined in [01-genesis-root.md](/session/genesis-root/); the inheritance rule at the cut is defined in [08-identity-pin.md](/session/identity-pin/); this chapter joins them into a tree and fixes its read direction.

---

## Why a Separate Key

The lineage needs its **own** field — it can be neither the `sessionId` nor the *Genesis Root*:

- It is **not** `sessionId`. A changed `sessionId` is the boundary into a new session ([08-identity-pin.md](/session/identity-pin/)); reusing it for the line would erase the very distinction the tree is built on. The line must survive a new `sessionId`, so it lives in a distinct key.
- It is **not** the *Genesis Root*. That name is already taken for the lowest **tier**, the thing global *per session* ([01-genesis-root.md](/session/genesis-root/)). A lineage spans **many** sessions. Overloading the word would collide two different ideas, so the line has its own name — *lineage* — and its own key, `lineageId`.

The value of `lineageId` is the `sessionId` of the **first** session of the line. That choice makes the origin self-evident (the key *is* the origin session) while keeping the field separate: the first session's own id names the line; every later session in the line carries that same value in `lineageId` while holding its own, different `sessionId`.

---

## The Nodes

The tree has two kinds of node, both read from existing data — neither is invented:

| Node | What it is | Where it is read |
|------|------------|------------------|
| **Session** | One session of the line, identified by its `sessionId`; it carries its arc (authoring or rollout) from the entry-point markers | the memo-local marker log ([08-identity-pin.md](/session/identity-pin/)) plus the lineage log (below) |
| **Spawn leaf** | A subagent worker started by a session for one scoped task | the harness filesystem: a spawned worker's transcript sits under the parent session's directory, with a metadata sidecar naming its role |

The spawn leaf is **already physical**: the harness writes a subagent's transcript beside its parent session, so the Parent → Child (Session → Subagent) edge exists as a directory relationship. The tree **reads** that relationship; it does not reconstruct it. The parent-to-child trust rule for those spawns lives in [01-genesis-root.md](/session/genesis-root/) (a spawn holds no more privilege than its orchestrator); the naming of the workers lives in [memo/13-orchestration.md](/specification/orchestration/) — this chapter references both rather than restating them.

---

## The Edges

Three edge kinds connect the nodes:

1. **Cut inheritance** — the edge across a `/clear` or a software restart. The successor session carries the predecessor's `lineageId` forward and records `{ parentSessionId, sessionId, lineageId, timestamp }` in the lineage log. This is the edge specified normatively in [08-identity-pin.md](/session/identity-pin/); a `/compact` or a resume keeps the same `sessionId` and produces **no** edge (it is not a cut).
2. **Spawn** — the edge from an orchestrator session to a worker it started. It is read from the harness filesystem (the subagent transcript under the parent's directory), not authored.
3. **External binding** — the edge to an external print / SDK invocation. Such a run opens its **own** genesis root and has no filesystem parent link ([01-genesis-root.md](/session/genesis-root/)); it can still be joined to the line by exporting the identity across the process boundary (`SOP_LINEAGE_ID`, the harness-neutral name) and recording the bind edge. This is the productive form of that boundary crossing — the same env-export mechanism the identity resolution already uses.

---

## The Lineage Log

The cut and external-bind edges are persisted in a **project-level, append-only** ledger — `lineage.jsonl` under the per-place `.session/` directory ([05-config-cascade.md](/session/config-cascade/)). Two properties make it the right home for the line:

- **Append-only.** Each edge is one appended line; an earlier line is never rewritten. The log only grows, so the history of a line is exactly its edges in order — a recovery path that needs no version control.
- **Memo-independent.** The ledger is keyed on the project, not on a memo. This is the load-bearing difference from the memo-local marker log ([08-identity-pin.md](/session/identity-pin/)), which requires a memo directory: **research runs before a memo id exists**, so it must be recordable *without* one. A pre-memo edge carries a `null` memo id and is joined to the memo later, over the `lineageId`, once the memo is born.

The **research entity** ([memo/13-orchestration.md](/specification/orchestration/) names the agent roles it spawns) is therefore a first-class **pre-memo node type** of the line: the work that opens a line before it has a memo id, recorded against the line and joined to the memo afterward. The mechanics of that entity — its id allocation and its links to topics and work-items — are a store concern and are **not** re-specified here; this chapter only places research on the line as the node that can precede the memo id.

---

## The Backward Read

The point of the tree is a defined **backward** traversal — from a finished change to the work that made it:

```
lineageId / memoId
   → origin session        (the first session of the line = the lineageId value)
   → workflow              (the session's aggregated worker record)
   → spawned agents        (the subagent leaves under the session directory)
   → commits               (the commit-subject id key that leads to the exact change)
```

Each hop reads a source that already exists: the origin session is the `lineageId` value itself; the workflow and the spawned agents are read from the harness filesystem; the commit hop uses the deterministic commit-subject id key (the memo/phase/prd id form specified in [memo/17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)) as a grep key, never a fabricated hash. The traversal is **read-only** and total in the honest sense: a missing source (no spawned workers, no lineage edge yet) renders an **empty branch**, never a failure — the tree shows what exists and is silent about what does not.

---

## Provenance

This chapter sits in the session family, next to [17-memory.md](/session/memory/), because a lineage is the same category of thing as a memory entry's origin field: a **cross-session provenance contract**. The memory chapter records *which session authored an entry*; this chapter records *which line a session belongs to* and *which sessions a line spans*. Both are session-tier wiring, so both live here rather than in the memo or workbench families. The lineage key generalizes the single-session provenance field into a whole-line thread.

<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [01-genesis-root.md](/session/genesis-root/) — the identity table where `lineageId` is declared and the tier name it must not collide with.
- [08-identity-pin.md](/session/identity-pin/) — the cut trigger and the inheritance rule that carries the line across a new `sessionId`.
- [05-config-cascade.md](/session/config-cascade/) — the per-place `.session/` home and the append-only, list-union ownership of the lineage log.
- [17-memory.md](/session/memory/) — the sibling cross-session provenance contract this chapter generalizes from one entry to a whole line.
- [memo/13-orchestration.md](/specification/orchestration/) — the agent-role naming the spawn leaves read for structure.
