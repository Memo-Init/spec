---
title: "The Session Genesis Root"
description: "The Session Genesis Root (`session-sop`) is the lowest tier of the system. It owns three things that are global **per session**: the **session identity**, the **per-session security level**, and the..."
session_version: "0.1.0"
spec_file: "01-genesis-root.md"
order: 1
section: "Session"
normative: true
generated_at: "2026-06-30T23:47:07.691Z"
generated_from: "draft/session/0.1.0/spec/01-genesis-root.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/session/0.1.0/spec/01-genesis-root.md."
---


The Session Genesis Root (`session-sop`) is the lowest tier of the system. It owns three things that are global **per session**: the **session identity**, the **per-session security level**, and the anchoring of the **SOP chain**. This chapter specifies what the tier owns and how identity resolves; the deterministic enforcement is specified in [02-enforcement.md](/specification/enforcement/).

---

## The Tier Model

| Tier | Owns | Artifact |
|------|------|----------|
| **session-sop** (Genesis Root, global per session) | session identity, self-classification, per-session security level, PreToolUse enforcement | `.session/config.json` + this family |
| ↑ workbench-sop | workbench convention | the Workbench spec |
| ↑ memo-sop | memo process | the SOP/core specs + skill |
| ↑ memo-init / flowmcp | domain entry points | skills |

The upper layers **inherit** and **read** the identity and security level the genesis root establishes. The build direction is **bottom-up**: the genesis root exists first; each layer above it is a convention that assumes the layer below.

---

## Session Identity

A session has an ambient identity that any tool MAY resolve deterministically. The identity has two fields, each resolved with the precedence **flag > env > null**:

| Field | Flag | Environment tier | Default |
|-------|------|------------------|---------|
| `sessionId` | `--session-id` | `SOP_SESSION_ID` | `null` |
| `memoId` (optional second protocol) | `--memo-id` | `MEMO_ID` | `null` |

The environment tier is **harness-neutral**: the canonical variable is `SOP_SESSION_ID`, which names the session identity without binding it to any particular tool. A specific harness that exposes its own identity variable — Claude Code's `CLAUDE_SESSION_ID`, for example — is recognized **only as an input alias** read by the harness adapter (below); it is mapped onto `SOP_SESSION_ID` and is never the canonical name the spec depends on. This keeps the genesis root's identity decoupled from whatever tool happens to host the session.

The resolution MUST be **no-silent-default**: when neither a flag nor an environment value is present, the field resolves to `null` with an explicit source of `"none"`, never to a guessed value. The reference resolver is the CLI leaf `memo session resolve` ([workbench/20-cli.md](/workbench/cli/)). The resolved identity (and the resolved root) is **pinned once at SessionStart** and read from the pin thereafter — never recomputed from a `cd`-mutated `cwd` ([08-identity-pin.md](/specification/identity-pin/)).

`memoId` is a strictly **optional** second protocol: a session MAY carry an ambient memo id out of band, but the system MUST function when it is absent. No behaviour depends on `memoId` being set.

---

## The Harness Adapter

The genesis-root **artifact** is the project-local marker: `.session/` and its `config.json`. That marker is OS- and harness-agnostic — it is the same on any machine and under any tool that drives the session, and it owns the identity, the security level, and the SOP chain.

The coupling to a specific harness lives in a **separate, replaceable adapter layer**, not in the genesis root itself. Claude Code's `~/.claude/settings.json` PreToolUse hook and the `CLAUDE.md` block that loads `session-sop` first are **one such adapter**: a single consumer that reads `.session/config.json` and the harness-neutral identity, translating the host's conventions (its `CLAUDE_SESSION_ID` alias, its hook format) into the terms this spec defines. Swapping the harness means swapping the adapter, not the artifact — the genesis root does not change.

This separation is exactly why "session" is disambiguated in the glossary (see the *Three meanings of "session"* entry in [00-overview.md](/specification/overview/#glossary)): the OS/runtime session and the harness's own conversation session are distinct from our `.session/` marker, and the adapter is precisely the seam where a harness's session meets ours.

---

## Self-Classification (display-only in this version)

A session MAY declare metadata about itself — its tier and a requested trust level — in a structured `session-sop-metadata` form. In this version of the spec that self-label is **display-only**: it is surfaced (e.g. in the statusline) but no privilege is granted from it. A consumer that reads a self-declared `requestedTier` to GRANT capability is explicitly **out of scope** here, because a self-granted privilege is only sound while no consumer trusts it. The monotonicity property (a session can never label itself into *more* privilege than it was started with) holds precisely because there is no GRANT consumer yet; introducing one is deferred to a follow-up.

---

## Session Types

A session is one of three **named types**, and the type — not a self-granted label — is what anchors the per-session security level below. The type is fixed at session start and is part of the identity the upper layers read.

| Type | What it is | Default security profile |
|------|------------|--------------------------|
| **User session** | The top-level, interactive session a developer drives directly. | The project's baseline trust level; the reference against which the other two are bounded. |
| **Orchestrator session** | A session acting **on the user's behalf** — the main loop that coordinates a rollout and its workers. | Inherits the User session's level and **MUST NOT** exceed it. It is the user session continued into autonomous execution, not a new authority. |
| **Subagent-spawn session** | A spawned worker with an empty context, started by an orchestrator for one scoped task. | Its own, **separately bounded** profile — the subagent carve-out ([02-enforcement.md](/specification/enforcement/)). A spawn **MUST NOT** hold more privilege than the orchestrator that started it. |

Each type maps to **exactly one** security profile — privilege is not negotiated per call within a type. The three types obey the same **monotonicity** rule as the self-label above: a session may move to a *more* restricted profile, but it can never label or spawn itself into *more* privilege than it was started with.

---

## The Per-Session Security Level

The genesis root owns a **per-session security/trust level** that upper layers read rather than redefine. Its value is **anchored by the session type** (above): each of the three types maps to exactly one profile, established at session start. The level is a property of the session as a whole; it is the anchor the Trust Axis of research ([workbench/31-browser-automation.md](/workbench/browser-automation/)) and the egress gate ([03-recovery.md](/specification/recovery/), [02-enforcement.md](/specification/enforcement/)) refer to when deciding whether untrusted content may enter a context. The level is established at session start and is **not** elevated by a self-label (see above).

---

## The Full SOP Chain — Declared, Enforced Once the Skills Exist

The genesis root anchors the full entry-point chain:

```
memo-init → memo-sop → workbench-sop → session-sop
```

The chain is **declared in full** as the normative target. But each edge is **enforced only once both of its endpoint skills exist on disk**. This is the load-bearing safety rule of the whole family:

- An edge whose required skill is **not yet built** (for example `workbench-sop` before it is implemented) MUST be treated by the enforcement gate as a **configuration error that fails open** — never as an unsatisfiable precondition that locks the machine out of its own tools (the lockout hazard, formally the EDGEVALID requirement in [02-enforcement.md](/specification/enforcement/)).
- A `registry-validate` build step ([workbench/20-cli.md](/workbench/cli/)) MAY refuse, at build time, a registry that declares an edge to an absent skill — so dangling edges are caught deterministically before they ship, rather than at runtime.

"Declared now, enforced when present" is what lets the full chain be written down before every link is built. In this version, the only **active** edge is the single project-scoped edge `memo-init → memo-sop`; `workbench-sop` and the global registry that would activate the upper edges are a follow-up.

The chain's machine-readable home is the session config. The registrant blocks that reserve each namespace and the two edge granularities — coarse `requires[]` between SOPs and fine `requirements[]` pre-gate edges — are specified in [06-namespace-registry.md](/specification/namespace-registry/), and the `.session/config.json` cascade that stores them is specified in [05-config-cascade.md](/specification/config-cascade/). This chapter declares the chain; those two chapters encode it.

---

## The Statusline Read-Surface

The statusline is the canonical **read** surface for the resolved session state. It **MUST** display the **full resolved SOP chain** — every edge from the active entry point down to `session-sop`, each marked active or declared-only — rather than a fixed pair of hardcoded links, and it **MUST** display the resolved **session type** (above) and the identity source. It is fed from the **same resolver** the enforcement gate uses (`memo session resolve`), so the chain a human reads and the chain the gate enforces cannot drift apart. The statusline **displays**; it never **grants** — it is the display side of the self-label's display-only rule.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [02-enforcement.md](/specification/enforcement/) — how the chain is enforced deterministically at PreToolUse.
- [03-recovery.md](/specification/recovery/) — the fail-safe guarantees that keep the genesis tier always recoverable.
- [workbench/02-sop-entrypoint.md](/workbench/sop-entrypoint/) — the workbench's view of this tier as the layer below it.
