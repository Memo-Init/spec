# 00. Overview

| | |
|---|---|
| Status | Draft |
| Depends on | — (sibling-spec entry point) |
| Related | [01-genesis-root.md](./01-genesis-root.md), [10-sop.md](./10-sop.md), [02-enforcement.md](./02-enforcement.md), [03-recovery.md](./03-recovery.md) |

> **Informative.** This document introduces the Session spec, its scope, and its place among the sibling specifications. It does not itself carry normative requirements beyond those defined in the chapters it links.

This is the entry point for the **Session spec** — a standalone sibling of the memo-init core specification and the Workbench spec. It specifies the **Session Genesis Root** (`session-sop`): the lowest tier of the system, the thing that is global **per session** rather than per workbench or per project. It is the **outermost published** family a reader meets, and it is the lowest **runtime** tier the upper layers inherit from — but it is **not** the highest authority (the Core spec owns the conformance vocabulary). Those three "top" axes are kept distinct in [10-sop.md](./10-sop.md).

This family also **absorbs the SOP area**. There is no separate SOP standard: the connecting layer that makes every Standard Operating Procedure predictable — and the mechanism through which tools register, attach to the session, and become findable — is an **integral entry-point area of the session standard** ([10-sop.md](./10-sop.md)–[13-conventions.md](./13-conventions.md)), not a sibling spec of its own.

The Workbench spec's entry point ([workbench/02-sop-entrypoint.md](/workbench/sop-entrypoint/)) records that the machine tier was once left out of scope. This family fills the **enforcement slice** of that gap: the session identity, the per-session security/trust level, and the deterministic PreToolUse enforcement that guarantees the correct SOP is loaded before a tool runs. The broader host-wide machine spec (the security-hook system, the env-file guard, the OS arrangement) remains future work; this family covers only the **genesis root** that the upper layers depend on, plus the SOP entry-point mechanism layered on it.

---

## Why the Session Is the Genesis Root

The session is the one scope that exists **before** any workbench convention. A Claude Code session has an identity (its `sessionId`), it has a transcript, and it fires PreToolUse hooks — all of this independent of whether the session happens to be running inside a workbench, a single project, or nowhere in particular. Because it is the **first** thing that exists, it is the right place to anchor the chain of SOPs: `CLAUDE.md` loads `session-sop` first, and the upper layers — `workbench-sop`, `memo-sop`, the domain entry points — inherit the identity and security level it establishes.

```
session-sop  (this family — the Genesis Root + SOP entry-point mechanism)
  ↑ workbench-sop   (one session-SOP application above the genesis root)
  ↑ memo-sop        (memo process)
  ↑ memo-init / flowmcp / …  (domain entry points)
```

The build direction is **bottom-up**: the genesis root exists first, and each layer above it is a convention that assumes the layer below. The workbench is **just one session-SOP application** layered on the session tier — not a peer standard.

---

## The Chapters

The family is read in five nav groups: **Introduction**, **SOP** (the entry-point mechanism), **Genesis Root**, **Enforcement**, **CLI**, and **Recovery**.

| Chapter | Group | Holds |
|---------|-------|-------|
| [01-genesis-root.md](./01-genesis-root.md) | Genesis Root | The tier model, session identity (`flag > env > null`), the per-session security level, and the full declared SOP chain. |
| [05-config-cascade.md](./05-config-cascade.md) | Genesis Root | The `.session/config.json` entry point, the three-tier config cascade, and the one-time migration. |
| [06-namespace-registry.md](./06-namespace-registry.md) | Genesis Root | The `sops[]` registrant blocks, namespace reservation, N-1/N-2 rules, and `requires[]` vs `requirements[]`. |
| [09-root-detection.md](./09-root-detection.md) | Genesis Root | The `.session/` root marker, the `root:true` stop-flag, and the opt-in `workbenchRoot` pointer. |
| [10-sop.md](./10-sop.md) | SOP | SOP as the entry-point mechanism, the three "top" axes, and SOP-instance vs catalog blocks. |
| [11-common-denominator.md](./11-common-denominator.md) | SOP | The four parts every SOP shares — Setup, Health, Update, Extras. |
| [12-instances.md](./12-instances.md) | SOP | The existing SOP instances and the inheritance declaration. |
| [13-conventions.md](./13-conventions.md) | SOP | The naming (`prefix-hyphen-name`) and brevity conventions. |
| [02-enforcement.md](./02-enforcement.md) | Enforcement | The deterministic PreToolUse gate: the three-state fail-safe contract, the project-scoped registry, jq-structured signals. |
| [07-doctor-init.md](./07-doctor-init.md) | Enforcement | The foreground `session doctor` (readiness) and `session init` (additive scaffold + migration). |
| [08-identity-pin.md](./08-identity-pin.md) | Enforcement | The SessionStart-Pin invariant and the warn-not-block cd-guard. |
| [04-cli.md](./04-cli.md) | CLI | The CLI doctrine — eight principles, standard verbs and flags, the exit-code mirror. |
| [03-recovery.md](./03-recovery.md) | Recovery | The fail-safe guarantees: kill-switch, sentinel, SessionStart canary, recovery runbook. |
| [14-migration.md](./14-migration.md) | Recovery | The sop→session publication fold and the requirement-record path rewrite. |

---

## Related

- [10-sop.md](./10-sop.md) — the SOP entry-point mechanism this family absorbs, and the common SOP standard `session-sop` is an instance of.
- [The Workbench spec](/workbench/overview/) — the convention layered above the genesis root; its [SOP entry point](/workbench/sop-entrypoint/) routes through this tier.
- [workbench/23-hooks-contract.md](/workbench/hooks-contract/) — the PreToolUse contract this family's enforcement realizes.
