---
title: "The Session Genesis Root"
description: "The Session Genesis Root (`session-sop`) is the lowest tier of the system. It owns three things that are global **per session**: the **session identity**, the **per-session security level**, and the..."
session_version: "0.1.0"
spec_file: "01-genesis-root.md"
order: 1
section: "Session"
normative: true
generated_at: "2026-06-26T16:04:18.195Z"
generated_from: "spec/session/0.1.0/01-genesis-root.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/session/0.1.0/01-genesis-root.md."
---


The Session Genesis Root (`session-sop`) is the lowest tier of the system. It owns three things that are global **per session**: the **session identity**, the **per-session security level**, and the anchoring of the **SOP chain**. This chapter specifies what the tier owns and how identity resolves; the deterministic enforcement is specified in [02-enforcement.md](/specification/enforcement/).

---

## The Tier Model

| Tier | Owns | Artifact |
|------|------|----------|
| **session-sop** (Genesis Root, global per session) | session identity, self-classification, per-session security level, PreToolUse enforcement | `~/.claude/` + this family |
| ↑ workbench-sop | workbench convention | the Workbench spec |
| ↑ memo-sop | memo process | the SOP/core specs + skill |
| ↑ memo-init / flowmcp | domain entry points | skills |

The upper layers **inherit** and **read** the identity and security level the genesis root establishes. The build direction is **bottom-up**: the genesis root exists first; each layer above it is a convention that assumes the layer below.

---

## Session Identity

A session has an ambient identity that any tool MAY resolve deterministically. The identity has two fields, each resolved with the precedence **flag > env > null**:

| Field | Flag | Environment tier | Default |
|-------|------|------------------|---------|
| `sessionId` | `--session-id` | `CLAUDE_SESSION_ID` | `null` |
| `memoId` (optional second protocol) | `--memo-id` | `MEMO_ID` | `null` |

The resolution MUST be **no-silent-default**: when neither a flag nor an environment value is present, the field resolves to `null` with an explicit source of `"none"`, never to a guessed value. The reference resolver is the CLI leaf `memo session resolve` ([workbench/20-cli.md](/workbench/cli/)).

`memoId` is a strictly **optional** second protocol: a session MAY carry an ambient memo id out of band, but the system MUST function when it is absent. No behaviour depends on `memoId` being set.

---

## Self-Classification (display-only in this version)

A session MAY declare metadata about itself — its tier and a requested trust level — in a structured `session-sop-metadata` form. In this version of the spec that self-label is **display-only**: it is surfaced (e.g. in the statusline) but no privilege is granted from it. A consumer that reads a self-declared `requestedTier` to GRANT capability is explicitly **out of scope** here, because a self-granted privilege is only sound while no consumer trusts it. The monotonicity property (a session can never label itself into *more* privilege than it was started with) holds precisely because there is no GRANT consumer yet; introducing one is deferred to a follow-up.

---

## The Per-Session Security Level

The genesis root owns a **per-session security/trust level** that upper layers read rather than redefine. The level is a property of the session as a whole; it is the anchor the Trust Axis of research ([workbench/31-browser-automation.md](/workbench/browser-automation/)) and the egress gate ([03-recovery.md](/specification/recovery/), [02-enforcement.md](/specification/enforcement/)) refer to when deciding whether untrusted content may enter a context. The level is established at session start and is **not** elevated by a self-label (see above).

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

---

## Related

- [02-enforcement.md](/specification/enforcement/) — how the chain is enforced deterministically at PreToolUse.
- [03-recovery.md](/specification/recovery/) — the fail-safe guarantees that keep the genesis tier always recoverable.
- [workbench/02-sop-entrypoint.md](/workbench/sop-entrypoint/) — the workbench's view of this tier as the layer below it.
