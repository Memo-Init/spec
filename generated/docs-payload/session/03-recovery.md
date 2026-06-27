---
title: "Recovery and Fail-Safety"
description: "A gate that sits at the genesis tier governs *every* gated tool call in *every* session. The cost of it going wrong is therefore high, and recoverability is a first-class requirement, not an..."
session_version: "0.1.0"
spec_file: "03-recovery.md"
order: 3
section: "Session"
normative: true
generated_at: "2026-06-27T01:24:20.547Z"
generated_from: "spec/session/0.1.0/03-recovery.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/session/0.1.0/03-recovery.md."
---


A gate that sits at the genesis tier governs *every* gated tool call in *every* session. The cost of it going wrong is therefore high, and recoverability is a first-class requirement, not an afterthought. This chapter specifies the operational guarantees that keep the genesis tier always recoverable.

---

## The Kill-Switch (REQ-SS-KILLSWITCH)

Recovery MUST always be possible, even when the gate itself is misbehaving. Two equivalent kill-switches disable the gate, checked as the **first action** of the hook, before any parsing can fail:

| Kill-switch | Use |
|-------------|-----|
| `SESSION_SOP_DISABLE=1` (environment variable) | per-shell / per-session disable |
| `~/.claude/session/DISABLED` (sentinel file) | persistent disable until removed |

Either present ⇒ the gate exits 0 (ALLOW) immediately. Removing both re-arms the gate.

---

## The SessionStart Canary (REQ-SS-CANARY)

The most dangerous failure mode is a **silent fail-open after a harness or contract update**: the gate stops enforcing and nobody notices. The canary defends against exactly this. At SessionStart it feeds the live gate two synthetic fixtures with known-good answers:

- a transcript **with** the predecessor signal ⇒ must ALLOW (exit 0);
- a transcript **without** it ⇒ must DENY (exit 2).

On **any** drift from those expected outcomes the canary MUST (a) shout to stderr and (b) **auto-engage the kill-switch** by writing the sentinel — so a gate that can no longer be trusted **disables itself** rather than continuing to mis-gate. The canary itself never blocks the session (always exit 0).

---

## Registry Protection (REQ-SS-EDGEVALID / R9)

The registry is a privilege file: a silent rewrite could disable the gate or forge an edge. Tool-driven Write/Edit of a `.workbench/registry.json` (or the global `~/.claude/session/registry.json`) MUST be refused by a guard hook; edits go through a reviewed diff, after which `memo session registry-validate` confirms no edge dangles.

---

## Egress Quarantine Is Opt-In and Fail-Open

The riskiest gate is the **fetch/egress** gate, because its collateral is broad and it inverts the default-trust posture. It is therefore **opt-in and default-off**: it does nothing unless a project explicitly enables it via a `.workbench/fetch-gate.json` marker (`{ "enabled": true, "allowlist": [...] }`). When enabled it is a **bounded, logged quarantine** — an allowlist, not an allow-all — and it remains **fail-open** (missing marker, empty `transcript_path`, or missing `jq` ⇒ ALLOW). Substring detection of `curl`/`wget` can never be complete; real egress control belongs to a future host-wide machine spec. The opt-in gate is a mitigation, not that control.

---

## The Recovery Runbook

The operational steps — how to disable, diagnose, and re-arm the gate — live in the project's recovery runbook (`context/session-sop-recovery-runbook.md`). Its essence:

1. **Disable now:** `export SESSION_SOP_DISABLE=1` (this shell) or `touch ~/.claude/session/DISABLED` (persistent).
2. **Diagnose:** run the gate against a known-good fixture; check `~/.claude/session/fetch-gate.log` and the canary's stderr.
3. **Re-arm:** remove the sentinel / unset the variable once the cause is fixed and the canary is green.

---

## Related

- [02-enforcement.md](/specification/enforcement/) — the three-state contract these guarantees protect.
- [01-genesis-root.md](/specification/genesis-root/) — the tier model and the "declared, enforced once present" chain rule.
