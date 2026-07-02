---
title: "Deterministic Enforcement"
description: "Self-discovery describes what an agent *should* do. Making it **deterministic** — guaranteeing the required predecessor SOP was active before a gated entry point runs, regardless of model behaviour —..."
session_version: "0.1.0"
spec_file: "02-enforcement.md"
order: 2
section: "Session"
normative: true
generated_at: "2026-07-02T13:49:37.873Z"
generated_from: "draft/session/0.1.0/spec/02-enforcement.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/session/0.1.0/spec/02-enforcement.md."
---


Self-discovery describes what an agent *should* do. Making it **deterministic** — guaranteeing the required predecessor SOP was active before a gated entry point runs, regardless of model behaviour — is the job of the genesis tier, through a Claude Code **PreToolUse hook**. This chapter specifies the contract that hook MUST satisfy. The concrete reference implementation is `sop-precondition.sh`; the contract it realizes is shared with [workbench/23-hooks-contract.md](/workbench/hooks-contract/).

---

## The Session-Tier Config Is the Entry Point

The machine-readable form of the SOP chain is a **registry**, and its entry point is the project-local **`.session/config.json`** — the session-tier home the hook reads ([05-config-cascade.md](/session/config-cascade/)). The config carries the registrant blocks and the when:pre edges as two top-level structures (`sops[]` + `requirements[]`, [06-namespace-registry.md](/session/namespace-registry/)). The pre-gate edge that is active in this version is the single project-scoped `memo-init → memo-sop`:

```json
{ "sops": [ { "namespace": "memo", "owner": "memo-init", "tier": 2, "requires": ["workbench"],
              "skills": [ { "id": "memo-init", "signals": ["attributionSkill:memo-init"] },
                          { "id": "memo-sop",  "signals": ["attributionSkill:memo-sop"]  } ] } ],
  "requirements": [ { "id": "REQ-061", "entrypoint": "memo-init",
                      "requires": "memo-sop", "when": "pre" } ] }
```

The config moves the entry point **one tier down** from the former workbench home (`.workbench/registry.json`) to the session tier; the move is a **one-time migration** carried by `session init`, not a dual-read ([05-config-cascade.md](/session/config-cascade/), [07-doctor-init.md](/session/doctor-init/)). A machine-global registry at `~/.claude/session/registry.json` (the **session** tier, not a workbench path) is the natural home for cross-project edges; activating it is a follow-up. The config is a privilege artifact and MUST be protected from silent rewrite (a Write/Edit guard; see [03-recovery.md](/session/recovery/)).

**Absence is fail-open and LOUD.** When `.session/config.json` is absent the gate MUST treat it as a configuration problem that **fails open** (ALLOW, exit 0) — never a lockout — while emitting a **loud SessionStart warning** so the missing config is noticed rather than silently tolerated (REQ-SS-CONFIG-LOUD). Enforcement deliberately starts **permissive**: warn first, tighten later. The strict, refusing posture lives in the foreground `session doctor` / `session init` ([07-doctor-init.md](/session/doctor-init/)), not in the always-on hook.

---

## The Signal Is Structured, Never a Substring

The predecessor signal MUST be read **jq-structured** from the harness-authored `attributionSkill` field of the session transcript. It MUST NOT be a raw substring match over transcript text: transcript content includes user- and model-influenced text, so a substring grep over it is a **forgeable gate**. Only the structured `attributionSkill` value — which the harness, not the model, writes — is trusted. The scan MUST be bounded and BSD-safe (`tail -r` + early-exit, never `tac`).

The hook locates `.session/config.json` from the **pinned** project root, not from a live `cwd`: the root is resolved once at SessionStart and read from the pin thereafter, so a `cd` mid-session can never repoint the gate at a sister project's config ([08-identity-pin.md](/session/identity-pin/), [09-root-detection.md](/session/root-detection/)).

---

## The Three-State Contract

The gate has exactly three outcomes. Two are decisions; the third is the fail-safe.

| State | Meaning | Exit |
|-------|---------|------|
| **ALLOW** | not gated, carved out, or the predecessor signal is present | 0 |
| **DENY** | the transcript is readable AND the required predecessor is genuinely absent | 2 |
| **ERROR (fail-open)** | any infrastructure or configuration problem | 0 + stderr note |

The decision table the reference hook MUST implement:

| Condition | Result | Exit |
|-----------|--------|------|
| disable switch set (`$SESSION_SOP_DISABLE` or the sentinel) | ALLOW | 0 |
| tool ≠ `Skill` | ALLOW | 0 |
| `.session/config.json` absent | ERROR (fail-open) + LOUD SessionStart warning | 0 |
| `jq` missing · `transcript_path` empty/unreadable · config malformed | ERROR (fail-open) | 0 |
| `transcript_path` is a subagent transcript (`…/subagents/agent-*.jsonl`) | ALLOW (carve-out) | 0 |
| the entry point is not gated by a when:pre edge | ALLOW | 0 |
| the required skill is **not installed** (dangling edge) | ERROR (fail-open) | 0 |
| transcript readable AND predecessor `attributionSkill` found (jq) | ALLOW | 0 |
| transcript readable AND predecessor genuinely absent | DENY | 2 |
| firing skill is a checkpoint in `assertions[]` AND every `requiresGroup` member receipt present | ALLOW | 0 |
| firing skill is a checkpoint in `assertions[]` AND a member receipt absent | DENY-as-redirect (names the unread skills) | 2 |
| a `requiresGroup` member does not resolve (e.g. a pending, not-yet-registered skill) | ERROR (fail-open) + doctor WARN | 0 |

The last three rows are the **policy checkpoint** branch (see [Policy Checkpoints — The Landing Gate](#policy-checkpoints--the-landing-gate) below); the rows above them are the unchanged `when:pre` predecessor branch. The two branches are evaluated independently on the same `Skill` call, and either may DENY-as-redirect.

The governing principle: **the gate never fail-CLOSES on infrastructure trouble** (FAILOPEN), and **never produces an unrecoverable lockout** (EDGEVALID). A DENY is a *redirect*, not a dead end — its message tells the agent to read the predecessor SOP first, after which the same entry point passes.

A gate is a state machine, so its three outcomes read as states. The key property the diagram makes visible: `ALLOW` and the fail-open `ERROR` both terminate at exit 0, while `DENY` is a self-redirect — it returns to the decision once the predecessor SOP has been read, never a terminal dead end:

```mermaid
stateDiagram-v2
    [*] --> Evaluating
    Evaluating --> ALLOW: not gated / carved out / predecessor present
    Evaluating --> ERROR: infra or config problem
    Evaluating --> DENY: transcript readable AND predecessor absent
    ALLOW --> [*]: exit 0
    ERROR --> [*]: fail-open exit 0
    DENY --> Evaluating: read predecessor SOP, then retry
```

---

## Policy Checkpoints — The Landing Gate

The `when:pre` branch gates an entry point behind a predecessor SOP. A **policy block** ([06-namespace-registry.md](/session/namespace-registry/)) needs a different shape of gate: *"by the time work lands, a sub-set of standards must have been read."* That is expressed by the top-level **`assertions[]`** collection ([05-config-cascade.md](/session/config-cascade/)) and evaluated by the **same** PreToolUse hook — there is no second hook.

An `assertions[]` row names a **checkpoint** skill, a **`requiresGroup`**, and an `onMissing` policy:

```jsonc
{ "id": "REQ-NODE-SEC-FINALIZE",    "checkpoint": "memo-finalize", "requiresGroup": "security",     "mode": "all", "when": "landing", "onMissing": "redirect" }
{ "id": "REQ-NODE-SEC-PUSH",        "checkpoint": "git-push",      "requiresGroup": "security",     "mode": "all", "when": "landing", "onMissing": "redirect" }
{ "id": "REQ-NODE-VERIFY-FINALIZE", "checkpoint": "memo-finalize", "requiresGroup": "verification", "mode": "all", "when": "landing", "onMissing": "redirect" }
```

When the firing skill matches a row's `checkpoint`, the hook resolves the row's `requiresGroup` over the union of all blocks and takes the **AND** over its members' `attributionSkill` receipts (`mode:"all"`). All present ⇒ ALLOW. One absent ⇒ **DENY-as-redirect**: a redirect, not a dead end, whose message names exactly the unread skills, after which the same checkpoint passes. The landing gate fires at the next *real* skill the standards must be settled by — `memo-finalize` (primary) with `git-push` as the irreversible-outward backstop; there is no dedicated landing skill to key on.

Three invariants bound the checkpoint branch, all inherited from the three-state contract:

- **Never a hard lock.** `onMissing` is `redirect` only; a checkpoint group may never produce a terminal block.
- **Never blocks the workflow** (REQ-SS-WORKFLOW). Checkpoints sit on `memo-finalize` / `git-push`; `memo-init` / `memo-plan` / `memo-revision-*` are never checkpoints and run unimpeded.
- **A non-resolving member fails open.** If a `requiresGroup` member is not installed (e.g. a standard documented but not yet registered as a skill), the gate cannot honestly assert "all read", so it degrades to fail-open ALLOW (best-effort, **no** hard guarantee) and the foreground doctor reports the unresolved member ([07-doctor-init.md](/session/doctor-init/)). An `assertions[]` id collision is likewise a fail-open ALLOW at the hook, never a redirect; it is rejected strictly only in the foreground doctor.

The landing gate as a top-down flow:

```mermaid
flowchart TD
    A["memo-finalize / git-push fires (Skill)"] --> B{"assertions[] row for this checkpoint?"}
    B -->|no| Z["ALLOW (not gated)"]
    B -->|yes| C["AND over attributionSkill receipts of the requiresGroup members"]
    C -->|all present| Z
    C -->|one absent| D["DENY-as-redirect: names the unread skills"]
    D --> E["agent reads the missing skills"]
    E --> A
    C -.->|a member does not resolve| Z2["fail-open ALLOW (best-effort) + doctor WARN"]
```

---

## Required Properties

| Requirement | Statement |
|-------------|-----------|
| **REQ-SS-FAILOPEN** | Any infra/config problem ⇒ ALLOW (exit 0) with a stderr note. Never deny on trouble. |
| **REQ-SS-CONFIG-LOUD** | An absent `.session/config.json` ⇒ ALLOW (fail-open) **and** a loud SessionStart warning; enforcement starts permissive, strict checks live in `session doctor`. |
| **REQ-SS-SIGNAL** | The predecessor signal is matched jq-structured on `attributionSkill`, never as a substring. |
| **REQ-SS-EDGEVALID** | An edge to a non-installed skill fails open; a build-time `registry-validate` MAY refuse it. |
| **REQ-SS-SUBAGENT** | A subagent transcript is carved out (ALLOW) — it carries no parent attribution chain. |
| **REQ-SS-BSD** | The transcript scan is bounded + BSD-safe (`tail -r`, early-exit), never `tac`. |
| **REQ-SS-DISABLE** | A disable switch (env var + sentinel file) short-circuits to ALLOW as the first action. |
| **REQ-SS-CANARY** | A SessionStart canary re-verifies the gate against known fixtures and auto-disables on drift. |
| **REQ-SS-NOWRITE** | Live `~/.claude/` config (settings.json, CLAUDE.md) is changed only additively via a reviewed diff, never auto-written. |
| **REQ-SS-WORKFLOW** | The gate MUST NOT block the memo workflow: `memo-init` / `memo-plan` / `memo-revision-*` run under the active gate (a DENY only redirects through the predecessor SOP). |
| **REQ-SS-POLICY** | A policy block gates only via `assertions[]` checkpoint rows, only as `onMissing:"redirect"`, never as a `when:pre` predecessor. A non-resolving `requiresGroup` member fails open (best-effort); an `assertions[]` id collision fails open at the hook and is rejected only in the foreground doctor. Defined in [06-namespace-registry.md](/session/namespace-registry/). |

---

## Wiring Is Additive and Reviewed (REQ-SS-NOWRITE)

The gate is wired into `~/.claude/settings.json` as a PreToolUse hook on the `Skill` matcher, **additively**: the existing `*` and `Write|Edit` hooks remain. Because `settings.json` is the single point of failure for all hooks, it MUST NOT be auto-written — a change is presented as an exact diff, backed up, validated with `jq`, and the matcher is asserted present after the edit. The same discipline applies to the `~/.claude/CLAUDE.md` genesis block.

---

## Conformity Requirements

This chapter is the session family's **`requirementsRef`** — the anchor the family manifest points at for its requirement standard ([23-requirements.md](/specification/requirements/)) — so it carries the family's **richest** inline set. The binding `MUST`s above are authored here **prose-first**: each block's `statement` faces generation (it shapes how a gate, a config, or a CLI leaf is built) and its `check` faces the finalization gate, resolving to a ternary `PASS` / `BLOCKED` / `INCONCLUSIVE`. The structured blocks below are the machine-readable source the per-entry requirement store is **harvested** from. Several rules below describe the always-on PreToolUse hook, which is **spec'd-but-not-yet-armed-live**: those carry an honest `grade: todo` (the score belongs there but the target is not yet shipped), while the rules already enforced by a shipped CLI leaf carry a hard `binary` grade.

The gate's central safety property is a hard-block when the predecessor SOP is genuinely absent. The hook is not yet armed live, so the grade is the honest `todo`:

```requirement
{
  "id": "REQ-982",
  "title": "PreToolUse gate hard-blocks a missing predecessor SOP",
  "statement": "The PreToolUse precondition gate MUST hard-block a gated entry point — DENY with exit 2 — when the required predecessor SOP is genuinely absent (the transcript is readable AND no predecessor `attributionSkill` receipt is present). The DENY MUST be a self-redirect that names the predecessor to read first, after which the same entry point passes; it MUST NOT be a terminal dead end.",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-sop", "enforcement", "pre-hook"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "With a readable transcript carrying no predecessor attributionSkill receipt, the gate returns DENY with process exit 2",
      "The DENY message names the predecessor SOP the agent must read before retrying",
      "Once the predecessor receipt appears in the transcript, the same entry point resolves to ALLOW (exit 0)"
    ]
  },
  "grade": "todo"
}
```

Whether the predecessor signal is read structurally rather than as forgeable prose is a hard yes/no contract (REQ-SS-SIGNAL); the gate is specified but not yet armed, so its grade carries the honest `todo` rather than `binary`:

```requirement
{
  "id": "REQ-983",
  "title": "The predecessor signal is jq-structured, never a substring",
  "statement": "The predecessor signal MUST be read jq-structured from the harness-authored `attributionSkill` field of the session transcript, never as a raw substring match over transcript text — transcript content is user- and model-influenced, so a substring grep is a forgeable gate. Only the structured `attributionSkill` value the harness writes is trusted, and the scan MUST be bounded and BSD-safe (`tail -r` + early exit, never `tac`).",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-sop", "enforcement", "anti-cheat"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The gate derives the predecessor receipt by parsing the structured attributionSkill field, not by grepping transcript prose",
      "A transcript whose prose mentions the predecessor name but carries no attributionSkill receipt does NOT satisfy the gate",
      "The transcript scan is bounded and BSD-safe (tail -r with early exit, never tac)"
    ]
  },
  "grade": "todo"
}
```

The governing safety contract — never a lockout on trouble — is also a hard yes/no rule (REQ-SS-FAILOPEN / REQ-SS-CONFIG-LOUD); the fail-open gate is specified but not yet fully armed, so its grade carries the honest `todo`:

```requirement
{
  "id": "REQ-984",
  "title": "Infra and config faults fail open and LOUD, never a lockout",
  "statement": "Any infrastructure or configuration problem — an absent or malformed `.session/config.json`, a missing `jq`, an empty or unreadable transcript path, or an edge to a not-installed skill — MUST fail OPEN (ALLOW, exit 0 with a stderr note) and MUST NEVER produce a lockout. An absent `.session/config.json` additionally emits a LOUD SessionStart warning so the missing entry point is noticed rather than silently tolerated.",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-sop", "enforcement", "fail-open"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each infra/config fault (absent or malformed config, missing jq, unreadable transcript, dangling edge) resolves to ALLOW with exit 0 and a stderr note",
      "An absent .session/config.json additionally surfaces a loud SessionStart warning",
      "No infra/config fault path can reach a DENY"
    ]
  },
  "grade": "todo"
}
```

Refusing a dangling `when:pre` edge before it can ever gate a live session (REQ-SS-EDGEVALID) is enforced by a shipped CLI leaf — a `tool` check, a hard yes/no rule (`grade: binary`), and one of the few that is **checkable now**:

```requirement
{
  "id": "REQ-985",
  "title": "registry-validate refuses a dangling when:pre edge",
  "statement": "A build/runtime `registry-validate` MUST refuse a dangling `when:pre` edge: every edge whose `entrypoint` or `requires` skill is not installed under the skills root MUST be reported with `status:false` and a non-empty `problems[]`, so a lockout edge is caught before it can ever gate a live session.",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-sop", "enforcement", "registry-validate"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "memo",
    "tactic": "session-registry-validate-dangling-edge",
    "verify": [
      "Run `memo session registry-validate` against a registry whose when:pre edge points at an absent skill",
      "Assert the envelope reports status:false with a non-empty problems[] naming the dangling edge"
    ]
  },
  "grade": "binary"
}
```

The disable kill-switch must short-circuit the gate before any other evaluation (REQ-SS-DISABLE); the switch lives in the not-yet-armed hook, so the grade is the honest `todo`:

```requirement
{
  "id": "REQ-986",
  "title": "The disable kill-switch short-circuits to ALLOW first",
  "statement": "A disable kill-switch — an environment variable AND a sentinel file — MUST short-circuit the gate to ALLOW as its very first action, before any other evaluation, so an operator can always recover the session from a misbehaving gate without editing the hook.",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-sop", "enforcement", "kill-switch"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "When the disable env var or the sentinel file is set, the gate returns ALLOW (exit 0) before evaluating any edge",
      "The kill-switch is honored regardless of config or transcript state"
    ]
  },
  "grade": "todo"
}
```

Whether the policy-checkpoint branch only ever redirects (never hard-locks, never gates the workflow entry skills — REQ-SS-POLICY / REQ-SS-WORKFLOW) is a process judgment best made by a fresh-context evaluator; the branch is part of the not-yet-armed hook, so the grade is `todo`:

```requirement
{
  "id": "REQ-987",
  "title": "Policy checkpoints redirect only, and never gate the workflow",
  "statement": "A policy checkpoint (`assertions[]` row) MUST gate only as `onMissing:\"redirect\"` — a DENY-as-redirect that names exactly the unread standards and lets the same checkpoint pass once they are read — and MUST NEVER be a hard lock. Checkpoints sit only on landing skills (`memo-finalize` / `git-push`); `memo-init` / `memo-plan` / `memo-revision-*` are never checkpoints and run unimpeded. A non-resolving `requiresGroup` member fails open (best-effort).",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-sop", "enforcement", "policy-checkpoint"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer confirms every assertions[] checkpoint resolves only to ALLOW or DENY-as-redirect (never a terminal block), that memo-init / memo-plan / memo-revision-* are absent from the checkpoint set, and that an unresolved group member degrades to fail-open ALLOW. PASS when all hold; BLOCKED when a checkpoint can hard-lock or a workflow-entry skill is gated; INCONCLUSIVE when the policy blocks could not be resolved.",
    "verify": [
      "Resolve every assertions[] checkpoint row and its requiresGroup",
      "Confirm each is redirect-only and that no workflow-entry skill is a checkpoint"
    ]
  },
  "grade": "todo"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [03-recovery.md](/session/recovery/) — the disable switch, sentinel, canary, and recovery runbook that make the gate always recoverable.
- [05-config-cascade.md](/session/config-cascade/) — the `.session/config.json` entry point the gate reads, and the migration that puts it there.
- [07-doctor-init.md](/session/doctor-init/) — the foreground `session doctor` / `session init` that carry the strict checks the hook deliberately omits.
- [08-identity-pin.md](/session/identity-pin/) — the SessionStart-Pin the gate reads instead of a live `cwd`.
- [workbench/23-hooks-contract.md](/workbench/hooks-contract/) — the workbench-side statement of the same PreToolUse contract.
- [workbench/20-cli.md](/workbench/cli/) — `memo session resolve` and `memo session registry-validate`.
