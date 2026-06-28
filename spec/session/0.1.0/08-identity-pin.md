# 08. Session Identity Pin

| | |
|---|---|
| Status | Draft |
| Depends on | [01-genesis-root.md](./01-genesis-root.md) |
| Related | [02-enforcement.md](./02-enforcement.md), [09-root-detection.md](./09-root-detection.md), [03-recovery.md](./03-recovery.md) |

The session identity established by the genesis root ([01-genesis-root.md](./01-genesis-root.md)) is global **per session**, which only holds if it is also **stable for the whole session**. This chapter owns that stability guarantee: the **SessionStart-Pin** invariant and the **cd-soft-guard**. It is the canonical home of the pin — [02-enforcement.md](./02-enforcement.md), [05-config-cascade.md](./05-config-cascade.md) and [09-root-detection.md](./09-root-detection.md) reference the pinned value defined here rather than re-resolving it.

---

## The Identity Invariant

The session identity — the global `sessionId`, the resolved session root, and any per-namespace ids carried under `options` (e.g. `options.memo.memoId`) — MUST NOT change over the session lifetime. Once resolved, it is fixed; nothing the agent does mid-session re-derives it.

The concrete failure this invariant forbids — the one that MUST never happen:

> The agent resolves the session at start, then `cd`s into a **sister project** under the same workbench, and **silently continues with different IDs / a different root** — every subsequent gate, registry, and CLI leaf now reads the wrong identity, with no signal that anything drifted.

A live re-resolution from `cwd` makes this failure invisible, because `cwd` is exactly the value a `cd` mutates. The fix is to resolve identity **once** and read the cached result thereafter.

---

## The SessionStart-Pin

Identity and root are resolved **once, at SessionStart**, and cached in a **session-stable source**. The reference resolver is `memo session resolve` ([04-cli.md](./04-cli.md)); its result is pinned by the SessionStart hook for the rest of the session.

The pinned record:

| Field | Meaning | Resolved at |
|-------|---------|-------------|
| `sessionId` | the ambient session identity, **global and namespace-neutral** ([01-genesis-root.md](./01-genesis-root.md), precedence flag > env > null) | SessionStart |
| `resolvedRoot` | the nearest-ancestor `.session/` root ([09-root-detection.md](./09-root-detection.md)) | SessionStart |
| `options` | per-namespace pinned ids, one sub-object per namespace — e.g. `options.memo.memoId` is the optional memo id (MAY be absent or `null`). Only namespace-scoped ids live here; `sessionId` stays top-level | SessionStart |
| `source` | where the pin was read from — the SessionStart record / `transcript_path`-derived cache, **never the live `cwd`** | SessionStart |

How the pinned record looks — `sessionId` stays a top-level global id; each namespace keeps its own id under `options`:

```jsonc
{ "sessionId":    "0c7f…",               // global, namespace-neutral (flag > env > null)
  "resolvedRoot": "/…/project",          // nearest-ancestor .session/ root
  "source":       "sessionstart-cache",  // never the live cwd
  "options": {
    "memo": { "memoId": "NNN" }          // a namespace's own id — here the optional memo id (MAY be null/absent)
  } }
```

The pin's `source` MUST be the SessionStart resolution (a SessionStart cache, keyed off the harness-authored `transcript_path`), **not** the live `cwd` at the moment a later hook runs. Resolving `resolvedRoot` from a walk-up of the current `cwd` on every call is exactly the drift hazard above; the walk-up in [09-root-detection.md](./09-root-detection.md) runs **once to populate the pin**, then the pinned value stands.

Pinning is consistent with the family's no-silent-default rule: an unresolved field is pinned as `null` with an explicit source, never guessed.

---

## Every Hook Reads the Pin, Never a cd-Mutated cwd

Each PreToolUse hook ([02-enforcement.md](./02-enforcement.md)) MUST read the **pinned** identity for its registry lookup and edge resolution. It MUST NOT re-derive identity or root from the live `cwd`. The pin is the single anchor; because it is fixed at SessionStart, an agent that wanders into a sister directory still gates against the **original** session — identity cannot drift even when the working directory does.

| Requirement | Statement |
|-------------|-----------|
| **REQ-SS-PIN** | Session identity (IDs + resolved root) is resolved once at SessionStart and pinned to a session-stable source; it MUST NOT change over the session lifetime. |
| **REQ-SS-PINREAD** | Every PreToolUse hook reads the pinned identity, never a `cd`-mutated `cwd`. |

---

## The cd-Soft-Guard

The pin already keeps identity stable when the agent leaves the root — but leaving it silently is still worth surfacing. A **soft-guard** sits on the `Bash` PreToolUse path, the same place as `security-check.sh` ([02-enforcement.md](./02-enforcement.md)), and inspects `cd` targets relative to the pinned `resolvedRoot`.

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

## Related

- [01-genesis-root.md](./01-genesis-root.md) — the genesis root that establishes the identity this chapter pins.
- [02-enforcement.md](./02-enforcement.md) — the PreToolUse hook that reads the pinned identity, never the live `cwd`.
- [09-root-detection.md](./09-root-detection.md) — the nearest-ancestor `.session/` walk-up; its result is resolved once to populate the pin.
- [03-recovery.md](./03-recovery.md) — the disable switch, sentinel, and canary that keep the gate (and the pin) recoverable.
