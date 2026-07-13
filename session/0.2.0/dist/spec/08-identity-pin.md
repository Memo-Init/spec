---
title: "Session Identity Pin"
description: "The session identity established by the genesis root ([01-genesis-root.md](./01-genesis-root.md)) is global **per session**, which only holds if it is also **stable for the whole session**. This..."
session_version: "0.2.0"
spec_file: "08-identity-pin.md"
order: 8
section: "Session"
normative: true
generated_at: "2026-07-13T22:23:54.820Z"
generated_from: "session/0.2.0/draft/spec/08-identity-pin.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: session/0.2.0/draft/spec/08-identity-pin.md."
---


The session identity established by the genesis root ([01-genesis-root.md](/session/genesis-root/)) is global **per session**, which only holds if it is also **stable for the whole session**. This chapter owns that stability guarantee: the **SessionStart-Pin** invariant and the **cd-soft-guard**. It is the canonical home of the pin — [02-enforcement.md](/session/enforcement/), [05-config-cascade.md](/session/config-cascade/) and [09-root-detection.md](/session/root-detection/) reference the pinned value defined here rather than re-resolving it.

---

## The Identity Invariant

The session identity — the global `sessionId`, the resolved session root, and any per-namespace ids carried under `options` (e.g. `options.memo.memoId`) — MUST NOT change over the session lifetime. Once resolved, it is fixed; nothing the agent does mid-session re-derives it.

The concrete failure this invariant forbids — the one that MUST never happen:

> The agent resolves the session at start, then `cd`s into a **sister project** under the same workbench, and **silently continues with different IDs / a different root** — every subsequent gate, registry, and CLI leaf now reads the wrong identity, with no signal that anything drifted.

A live re-resolution from `cwd` makes this failure invisible, because `cwd` is exactly the value a `cd` mutates. The fix is to resolve identity **once** and read the cached result thereafter.

---

## The SessionStart-Pin

Identity and root are resolved **once, at SessionStart**, and cached in a **session-stable source**. The reference resolver is `memo session resolve` ([04-cli.md](/session/cli/)); its result is pinned by the SessionStart hook for the rest of the session.

The pinned record:

| Field | Meaning | Resolved at |
|-------|---------|-------------|
| `sessionId` | the ambient session identity, **global and namespace-neutral** ([01-genesis-root.md](/session/genesis-root/), precedence flag > env > null) | SessionStart |
| `resolvedRoot` | the nearest-ancestor `.session/` root ([09-root-detection.md](/session/root-detection/)) | SessionStart |
| `options` | per-namespace pinned ids, one sub-object per namespace — e.g. `options.memo.memoId` is the optional memo id (MAY be absent or `null`). Only namespace-scoped ids live here; `sessionId` stays top-level | SessionStart |
| `source` | where the pin was read from — the SessionStart record / `transcript_path`-derived cache, **never the live `cwd`** | SessionStart |
| `model` | the harness model the session runs under (e.g. `claude-opus-4-8`), pinned so the session knows its own capability class | SessionStart |
| `effort` | the reasoning-effort tier the session runs under, pinned alongside `model` | SessionStart |

How the pinned record looks — `sessionId` stays a top-level global id; each namespace keeps its own id under `options`:

```jsonc
{ "sessionId":    "0c7f…",               // global, namespace-neutral (flag > env > null)
  "resolvedRoot": "/…/project",          // nearest-ancestor .session/ root
  "source":       "sessionstart-cache",  // never the live cwd
  "model":        "claude-opus-4-8",      // harness model + capability class
  "effort":       "high",                 // reasoning-effort tier, pinned with model
  "options": {
    "memo": { "memoId": "NNN" }          // a namespace's own id — here the optional memo id (MAY be null/absent)
  } }
```

The pin's `source` MUST be the SessionStart resolution (a SessionStart cache, keyed off the harness-authored `transcript_path`), **not** the live `cwd` at the moment a later hook runs. Resolving `resolvedRoot` from a walk-up of the current `cwd` on every call is exactly the drift hazard above; the walk-up in [09-root-detection.md](/session/root-detection/) runs **once to populate the pin**, then the pinned value stands.

Pinning is consistent with the family's no-silent-default rule: an unresolved field is pinned as `null` with an explicit source, never guessed.

---

## Model and Effort in the Pin — and the Re-Verification Trigger

The pinned record also carries the session's **model** and **reasoning-effort** — the harness model the session runs under and its effort tier. They are pinned at SessionStart alongside identity so the session knows its own capability class without re-asking the harness, and so a later **init-validity check** can confirm the session was started against a valid harness descriptor — the same model/effort surface the harness descriptor schema declares ([meta-spec/10-harness-registry.md](/spec/harness-registry/)). That check is out of scope here; this chapter only *pins the two fields*.

**Change behavior.** `model` and `effort` are **softer** than the identity invariant. A user MAY switch model or effort mid-session (for example toggling a faster mode). Such a switch does **not** change the `sessionId` — it is the same session — so it is handled as a **re-pin of the soft fields with a surfaced note**, not a re-verification: the new pair overwrites the pinned `model`/`effort`, the change is announced on the statusline read-surface, and the identity anchor is untouched.

**A `sessionId` change is the re-verification trigger.** The one change that *does* force a full re-verification is a change of **`sessionId`** itself. Because `sessionId` is the invariant anchor — it MUST NOT change over a session's lifetime ([01-genesis-root.md](/session/genesis-root/)) — observing a *different* `sessionId` is by definition **not** a mutation of the current session but the boundary into a **new** one. That boundary MUST re-run SessionStart: re-resolve and re-pin the whole record — identity, root, **and** `model`/`effort` — and re-verify the init against the harness descriptor. In short: `model`/`effort` drift is a soft re-pin; a `sessionId` change is a hard re-verification.

---

## The Work-Mode-State — Create and Rollout, Immutable In-Session

Beyond identity, model, and effort, a memo the session works on sits in exactly one of two **work modes**, and that mode is part of the session's stable state:

- **Create** — the authoring arc: the session is shaping the memo (its initialization, its revisions, its finalization).
- **Rollout** — the autonomous arc: the session is executing the finalized memo.

The work mode is **not stored as mutable state and is never mutated in place**. It is *derived* from an immutable, append-only entry-point log that the public entry points write to (one marker per fire). Because that log only ever grows, the derivation is **monotonic and one-way**: once a rollout marker exists for a memo, the mode is **Rollout** and can never revert to Create — a later authoring marker cannot un-say the rollout. An empty log is an explicit "no mode yet", never a guessed default.

This makes the work-mode-state **immutable for the whole session**, exactly like the identity invariant above: nothing the agent does mid-session flips Create into Rollout or back. The state is re-derived from the log on every read rather than cached and mutated, so a read is always the true state of the log, and the log is the single anchor.

### The Only Reset/Re-Init Triggers: `/clear` and a Software Restart

The work-mode-state re-initializes on exactly the same boundary the identity re-verifies on — a **changed `sessionId`**. Only two events produce one:

- a **`/clear`** — the user opens a new context, the harness authors a new session, hence a new `sessionId`; and
- a **software restart** — the process starts over under a fresh `sessionId`.

Both are the *new-context boundary* of the re-verification trigger above: a different `sessionId` is by definition not a mutation of the current session but the crossing into a new one. Crossing it re-derives the per-session view against the new id — the fresh session carries none of the previous session's authoring markers, so a rollout that begins after a `/clear` reads as a **fresh context**, while a rollout that begins in the very session that authored the memo reads as a **contaminated** one. Nothing short of these two events re-initializes the state: within a single session it is fixed.

| Requirement | Statement |
|-------------|-----------|
| **REQ-SS-WORKMODE** | A memo's work mode (Create \| Rollout) is derived monotonically from the append-only entry-point log and is immutable for the session lifetime; only a changed `sessionId` — produced by a `/clear` or a software restart — re-initializes the per-session view. |

---

## Every Hook Reads the Pin, Never a cd-Mutated cwd

Each PreToolUse hook ([02-enforcement.md](/session/enforcement/)) MUST read the **pinned** identity for its registry lookup and edge resolution. It MUST NOT re-derive identity or root from the live `cwd`. The pin is the single anchor; because it is fixed at SessionStart, an agent that wanders into a sister directory still gates against the **original** session — identity cannot drift even when the working directory does.

| Requirement | Statement |
|-------------|-----------|
| **REQ-SS-PIN** | Session identity (IDs + resolved root) is resolved once at SessionStart and pinned to a session-stable source; it MUST NOT change over the session lifetime. |
| **REQ-SS-PINREAD** | Every PreToolUse hook reads the pinned identity, never a `cd`-mutated `cwd`. |

---

## The cd-Soft-Guard

The pin already keeps identity stable when the agent leaves the root — but leaving it silently is still worth surfacing. A **soft-guard** sits on the `Bash` PreToolUse path, the same place as `security-check.sh` ([02-enforcement.md](/session/enforcement/)), and inspects `cd` targets relative to the pinned `resolvedRoot`.

The guard **WARNS — it does not block** (the F9=A decision). This is consistent with the family's permissive-first posture and the warn-not-block line: detect a `cd` that would leave the pinned project/workbench root, emit one note, and continue.

| `cd` target | Pin | Guard outcome | Exit |
|-------------|-----|---------------|------|
| inside the pinned `resolvedRoot` | unchanged | silent **ALLOW** | 0 |
| leaving the pinned `resolvedRoot` | unchanged | **WARN + continue** | 0 + stderr note |

In both rows the pin is **unchanged** — the guard never re-pins on a `cd`. A `cd` out of root is therefore a noisy, self-announcing event, not a hard stop, and not a source of drift. The warning's job is to make the *intent* of leaving root visible to the human and the agent, not to enforce it.

| Requirement | Statement |
|-------------|-----------|
| **REQ-SS-CDGUARD** | A `Bash` PreToolUse soft-guard warns (never blocks) when a `cd` would leave the pinned root; it never re-pins identity. |

Hardening the soft-guard into a **hard block** (deny a `cd` out of the pinned root) remains a deliberate later option — not a day-1 state. The pin makes the soft posture safe: identity is already protected, so the guard only needs to inform.

---

## Conformity Requirements

The pin invariant and the cd-soft-guard are authored here **prose-first**: each block's `statement` faces generation (it shapes how the SessionStart-Pin and the Bash soft-guard are built) and its `check` faces the finalization gate with a ternary verdict. Both targets — the SessionStart-Pin hook and the `Bash` soft-guard — are **spec'd-but-not-yet-armed-live**, so both rules carry the honest `grade: todo`.

Whether identity is pinned once and read from the pin (not a `cd`-mutated `cwd`) is a process judgment best made by a fresh-context evaluator (REQ-SS-PIN / REQ-SS-PINREAD):

```requirement
{
  "id": "REQ-994",
  "title": "Session identity is pinned at SessionStart and read from the pin",
  "statement": "The session identity (the global `sessionId`, the resolved root, and any per-namespace ids under `options`) MUST be resolved once at SessionStart and pinned to a session-stable source, and every PreToolUse hook MUST read that pinned identity, never a `cd`-mutated `cwd`. The identity MUST NOT drift over the session lifetime, so an agent that wanders into a sister directory still gates against the original session.",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-sop", "identity-pin", "no-drift"] },
  "severity": "blocker",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer confirms identity is resolved once at SessionStart and that every hook reads the pinned value rather than re-deriving from the live cwd. PASS when the pin is the single anchor and no hook re-resolves from cwd; BLOCKED when a hook re-derives identity/root from a cd-mutated cwd; INCONCLUSIVE when the pin source could not be established.",
    "verify": [
      "Inspect where each hook reads identity/root from",
      "Confirm the source is the SessionStart pin, not the live cwd"
    ]
  },
  "grade": "todo"
}
```

The cd-soft-guard WARNs but never blocks and never re-pins (REQ-SS-CDGUARD); the guard is not yet armed live, so the grade is `todo`:

```requirement
{
  "id": "REQ-995",
  "title": "The cd-soft-guard warns, never blocks, and never re-pins",
  "statement": "A `Bash` PreToolUse soft-guard MUST WARN — never block — when a `cd` would leave the pinned root, emitting one stderr note and continuing (exit 0), and it MUST NEVER re-pin identity on a `cd`. Leaving root is a noisy, self-announcing event, not a hard stop and not a source of drift.",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-sop", "identity-pin", "cd-guard"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A cd that leaves the pinned root produces a WARN + continue (exit 0 with a stderr note), never a block",
      "A cd inside the pinned root is a silent ALLOW",
      "The guard never changes the pinned identity on a cd"
    ]
  },
  "grade": "todo"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [01-genesis-root.md](/session/genesis-root/) — the genesis root that establishes the identity this chapter pins.
- [02-enforcement.md](/session/enforcement/) — the PreToolUse hook that reads the pinned identity, never the live `cwd`.
- [09-root-detection.md](/session/root-detection/) — the nearest-ancestor `.session/` walk-up; its result is resolved once to populate the pin.
- [03-recovery.md](/session/recovery/) — the disable switch, sentinel, and canary that keep the gate (and the pin) recoverable.
