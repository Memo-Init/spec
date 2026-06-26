---
title: "Overview"
description: "This is the entry point for the **Session spec** — a standalone sibling of the memo-init core specification, the Workbench spec, and the SOP spec. It specifies the **Session Genesis Root**..."
session_version: "0.1.0"
spec_file: "00-overview.md"
order: 0
section: "Session"
normative: false
generated_at: "2026-06-26T16:04:18.195Z"
generated_from: "spec/session/0.1.0/00-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/session/0.1.0/00-overview.md."
---


> **Informative.** This document introduces the Session spec, its scope, and its place among the sibling specifications. It does not itself carry normative requirements beyond those defined in [01-genesis-root.md](/specification/genesis-root/) and [02-enforcement.md](/specification/enforcement/).

This is the entry point for the **Session spec** — a standalone sibling of the memo-init core specification, the Workbench spec, and the SOP spec. It specifies the **Session Genesis Root** (`session-sop`): the lowest tier of the system, the thing that is global **per session** rather than per workbench or per project.

The Workbench spec's entry point ([workbench/02-sop-entrypoint.md](/workbench/sop-entrypoint/)) records that the machine tier was once left out of scope. This family fills the **enforcement slice** of that gap: the session identity, the per-session security/trust level, and the deterministic PreToolUse enforcement that guarantees the correct SOP is loaded before a tool runs. The broader host-wide machine spec (the security-hook system, the env-file guard, the OS arrangement) remains future work; this family covers only the **genesis root** that the upper layers depend on.

---

## Why the Session Is the Genesis Root

The session is the one scope that exists **before** any workbench convention. A Claude Code session has an identity (its `sessionId`), it has a transcript, and it fires PreToolUse hooks — all of this independent of whether the session happens to be running inside a workbench, a single project, or nowhere in particular. Because it is the **first** thing that exists, it is the right place to anchor the chain of SOPs: `CLAUDE.md` loads `session-sop` first, and the upper layers — `workbench-sop`, `memo-sop`, the domain entry points — inherit the identity and security level it establishes.

```
session-sop  (this family — the Genesis Root)
  ↑ workbench-sop   (convention above the genesis root)
  ↑ memo-sop        (memo process)
  ↑ memo-init / flowmcp / …  (domain entry points)
```

---

## The Three Chapters

| Chapter | Holds |
|---------|-------|
| [01-genesis-root.md](/specification/genesis-root/) | The tier model, session identity (`flag > env > null`), the per-session security level, and the full declared SOP chain. |
| [02-enforcement.md](/specification/enforcement/) | The deterministic PreToolUse gate: the three-state fail-safe contract, the project-scoped registry, jq-structured signals, and "declared, enforced once the skills exist". |
| [03-recovery.md](/specification/recovery/) | The fail-safe guarantees in operational form: kill-switch, sentinel, SessionStart canary, and the recovery runbook. |

---

## Related

- [The SOP spec](/sop/overview/) — the common SOP standard `session-sop` is an instance of.
- [The Workbench spec](/workbench/overview/) — the convention layered above the genesis root; its [SOP entry point](/workbench/sop-entrypoint/) routes through this tier.
- [workbench/23-hooks-contract.md](/workbench/hooks-contract/) — the PreToolUse contract this family's enforcement realizes.
