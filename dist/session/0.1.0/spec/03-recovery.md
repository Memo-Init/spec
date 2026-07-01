---
title: "Recovery and Fail-Safety"
description: "A gate that sits at the genesis tier governs *every* gated tool call in *every* session. The cost of it going wrong is therefore high, and recoverability is a first-class requirement, not an..."
session_version: "0.1.0"
spec_file: "03-recovery.md"
order: 3
section: "Session"
normative: true
generated_at: "2026-07-01T15:36:43.547Z"
generated_from: "draft/session/0.1.0/spec/03-recovery.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/session/0.1.0/spec/03-recovery.md."
---


A gate that sits at the genesis tier governs *every* gated tool call in *every* session. The cost of it going wrong is therefore high, and recoverability is a first-class requirement, not an afterthought. The deterministic gate and its **fail-open** contract are specified in [02-enforcement.md](/specification/enforcement/); this chapter does not restate that mechanism. It specifies the **recovery primitives** layered on top of it — the operator escape hatches and the self-check that keep the genesis tier recoverable even when the gate's own logic can no longer be trusted.

The substance here is deliberately lean: three primitives (a disable switch, a self-verifying canary, a write-guard on the config) plus the runbook that ties them together.

---

## The Disable Switch (REQ-SS-DISABLE)

Recovery MUST always be possible **by hand**, independent of whether the gate's own logic is sound. Two equivalent **disable switches** turn the gate off; the hook checks them as its **first action**, before any parsing can fail:

| Disable switch | Scope | Use |
|----------------|-------|-----|
| `SESSION_SOP_DISABLE=1` (environment variable) | the current shell / session | a quick per-shell off-switch that leaves no trace once the shell exits |
| `~/.claude/session/DISABLED` (sentinel file) | machine-global, until removed | a persistent off-switch that survives new shells until the file is deleted |

Either present ⇒ the gate exits 0 (ALLOW) immediately, gating nothing. Removing **both** re-arms the gate. Because the check is the hook's very first statement, a disable switch works even when the config is malformed or `jq` is absent — it is the one escape hatch that never depends on the gate being healthy.

---

## The SessionStart Canary (REQ-SS-CANARY)

The most dangerous failure mode is a **silent fail-open after a harness or contract update**: the gate stops enforcing and nobody notices. The canary defends against exactly this. At SessionStart it feeds the live gate two synthetic fixtures with known-good answers:

- a transcript **with** the predecessor signal ⇒ must ALLOW (exit 0);
- a transcript **without** it ⇒ must DENY (exit 2).

On **any** drift from those expected outcomes the canary MUST (a) shout to stderr and (b) **auto-engage the disable switch** by writing the sentinel — so a gate that can no longer be trusted **disables itself** rather than continuing to mis-gate. The canary itself never blocks the session (always exit 0): it diagnoses and, on failure, hands recovery to the disable switch above.

---

## Config Protection (REQ-SS-EDGEVALID)

The session config is a **privilege file**: a silent rewrite could disable the gate or forge a precondition edge. Two safeguards keep it honest:

- A tool-driven Write/Edit of the session config (`.session/config.json`, or the machine-global `~/.claude/session/registry.json`) MUST be refused by a guard hook. Edits go through a **reviewed diff**, never a silent overwrite — the same no-auto-write discipline the enforcement chapter applies to `~/.claude/settings.json` (REQ-SS-NOWRITE, [02-enforcement.md](/specification/enforcement/)).
- After any edit, `memo session registry-validate` confirms no edge **dangles** (every `when:pre` edge has both endpoints installed). A dangling edge does not lock the machine out: at runtime it degrades the gate to **fail-open ALLOW** ([02-enforcement.md](/specification/enforcement/)); the validator is the deliberate, foreground place it is caught and refused.

---

## Egress Quarantine Is Opt-In and Fail-Open

The riskiest gate is the **fetch/egress** gate, because its collateral is broad and it inverts the default-trust posture. It is therefore **opt-in and default-off**: it does nothing unless a project explicitly enables it via a `.workbench/fetch-gate.json` marker (`{ "enabled": true, "allowlist": [...] }`). When enabled it is a **bounded, logged quarantine** — an allowlist, not an allow-all — and it inherits the gate's **fail-open** contract (REQ-SS-FAILOPEN, [02-enforcement.md](/specification/enforcement/)): a missing marker, an empty `transcript_path`, or a missing `jq` ⇒ ALLOW. Substring detection of `curl`/`wget` can never be complete; real egress control belongs to a future host-wide machine spec. The opt-in gate is a mitigation, not that control.

---

## Recovery Requirements

The recovery primitives above are fixed as named requirements so the recovery contract is checkable, not just narrated:

| Requirement | Statement |
|-------------|-----------|
| **REQ-SS-DISABLE** | Two equivalent disable switches — the `SESSION_SOP_DISABLE` environment variable and the `~/.claude/session/DISABLED` sentinel file — short-circuit the gate to ALLOW as the hook's first action, before any parse. Removing both re-arms the gate. |
| **REQ-SS-CANARY** | A SessionStart canary re-verifies the live gate against a known-ALLOW and a known-DENY fixture; on any drift it shouts to stderr and auto-engages the disable switch by writing the sentinel. It never blocks the session (always exit 0). |
| **REQ-SS-EDGEVALID** | The session config is guarded against silent rewrite (reviewed diff, never auto-write), and `registry-validate` refuses a dangling edge. A dangling edge degrades the runtime gate to fail-open ALLOW, never a lockout. |

---

## The Recovery Runbook

The operational steps — how to disable, diagnose, and re-arm the gate — live in the project's recovery runbook (`context/session-sop-recovery-runbook.md`). Its essence:

1. **Disable now:** `export SESSION_SOP_DISABLE=1` (this shell) or `touch ~/.claude/session/DISABLED` (persistent).
2. **Diagnose:** run the gate against a known-good fixture; check `~/.claude/session/fetch-gate.log` and the canary's stderr.
3. **Re-arm:** remove the sentinel / unset the variable once the cause is fixed and the canary is green.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [02-enforcement.md](/specification/enforcement/) — the three-state contract and the fail-open mechanism these recovery primitives protect and reference.
- [01-genesis-root.md](/specification/genesis-root/) — the tier model and the "declared, enforced once present" chain rule.
