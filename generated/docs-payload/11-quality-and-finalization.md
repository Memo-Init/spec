---
title: "Quality Gates & Finalization"
description: "Quality is enforced by gates, and finalization is the readiness gate between strategy and implementation. This chapter defines the five quality skills, the six evidence levels, the finalization gate..."
spec_version: "0.1.0"
spec_file: "11-quality-and-finalization.md"
order: 11
section: "Specification"
normative: true
generated_at: "2026-06-22T09:56:04.990Z"
generated_from: "spec/v0.1.0/11-quality-and-finalization.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/11-quality-and-finalization.md."
---


Quality is enforced by gates, and finalization is the readiness gate between strategy and implementation. This chapter defines the five quality skills, the six evidence levels, the finalization gate set (grouped into Block A/B/C, including the completeness gate that guards the revision-to-finalization transition and the decision-extractor gate that feeds the rollout-handover document), the binary verdict logic, and how requirement-derived checks bind as finalization gates.

---

## Finalization

Finalization is the act of declaring a memo ready to leave strategy and enter implementation. A memo is finalized exactly once, by an explicit user trigger, after every quality gate has been run. The AI **MUST NOT** finalize autonomously: experience shows the AI chronically finalizes too early, so finalization is the single workflow entry point that requires an explicit user trigger. There is no autonomous path into finalization.

Finalization produces a new revision containing a finalization report with a **binary** verdict: `rollout-ready` or `NOT-ready`. There is no conditional intermediate verdict — a single FAIL or BLOCKED gate is enough for `NOT-ready`. WARN gates do not force a conditional verdict; the user accepts each WARN explicitly in the one consolidated query, and every accepted WARN is recorded as an accepted risk. The gate set, verdict logic, and resulting status values are defined in the sections below.

---

## The Five Quality Skills

Five quality skills back the gates. Four run autonomously over the memo body; the fifth scans for security exposure.

| Quality skill | Checks |
|---------------|--------|
| `memo-evidence` | Tags every substantive statement by evidence level (six levels, below); derives research needs |
| `memo-balance` | Detects over-engineering (+2) and under-engineering (−2) per chapter |
| `memo-coherence` | Finds gaps, contradictions, redundancies, and logical issues across chapters |
| `memo-references` | Verifies every file path, line number, and code snippet; fixes broken references |
| `git-security` | Scans for secrets, absolute paths, mock credentials, `.env` files, and personal data |

The four memo-* quality skills run **autonomously** — they MUST NOT ask follow-up questions; findings are written into the memo. `git-security` runs autonomously and reports only when it BLOCKS.

---

## The Six Evidence Levels

`memo-evidence` assigns exactly one tag per substantive statement. The six levels are ordered from strongest to weakest evidence:

| Tag | Level | Meaning | Requires |
|-----|-------|---------|----------|
| `[FACT]` | Fact | Verified fact with an identifiable source | Link, docs reference, or verifiable source |
| `[MEASURED]` | Measured | Benchmark or measurement confirmed | Test result, benchmark, or metric |
| `[ASSUMPTION]` | Assumption | Based on documentation but not verified in this context | Documentation reference, not tested locally |
| `[DERIVED]` | Derived | Logical conclusion from verified facts | A clear logical chain from verified premises |
| `[CONJECTURE]` | Conjecture | Hypothesis without evidence | Nothing — the default for unsubstantiated claims |
| `[UNKNOWN]` | Unknown | No data available, cannot even hypothesize | An acknowledged knowledge gap |

`memo-evidence` produces a classification summary (count and share per level) and a research-needs section deriving how each `[ASSUMPTION]`, `[CONJECTURE]`, and `[UNKNOWN]` could be verified. The three handover zones (see [09-contamination-context-handover.md](/specification/contamination-context-handover/)) reuse these tags.

---

## The Finalization Gates

`memo-finalize` runs the gates below plus a user-confirmation gate. The gates are grouped into **three blocks** — Block A (memo quality), Block B (decision completeness), Block C (environment / repo hygiene) — and consolidated into **one** summary query presented to the user. The system MUST NOT ask one question per gate.

### Block A — Memo Quality

| Gate | Result values | What it checks |
|------|---------------|----------------|
| Input completeness | PASS / BLOCKED | Every input required by a referenced skill is present in the memo or its context block. BLOCKED counts as FAIL. |
| Facts / assumptions classified (`memo-evidence`) | PASS / FAIL | All substantive statements are tagged; the classification summary is present. |
| Research needs derived | PASS / FAIL | Research needs are listed; no `[Research open]` tag remains; each open point has a user decision. |
| Code references verified (`memo-references`) | PASS / FAIL / N/A | No `[REF-BROKEN]` markers remain; N/A if the memo has no code references. |
| Over-/under-engineering (`memo-balance`) | PASS / WARN / FAIL | No unaddressed +2 / −2 chapter; critical under-engineering (security, data integrity) resolved. |
| AI feedback given (`memo-coherence`) | PASS / WARN / FAIL | Coherence check performed; critical contradictions addressed. |
| Ralph-Loop suitability | PASS / WARN / N/A | If a Ralph-Loop is planned, its PRDs are self-contained with machine-testable acceptance criteria; N/A otherwise. |
| Open questions empty | PASS / FAIL | The `## Open Questions` section holds no unresolved `### F{N}` entries, or remaining entries are explicitly marked "deliberately open". |
| Third-party software veto (token-tracking) | PASS / WARN | Forbidden token-tracking packages appear only in an anti-pattern context, never as a positive recommendation. |
| Rollout entry points | PASS / WARN / FAIL | The `## Rollout Entry Points` section exists with at least one concrete (non-placeholder) numbered path entry; filesystem existence is a WARN, not a FAIL, because some paths are created by the rollout itself. |
| Completeness across revisions | PASS / FAIL | Every information item and topic present in any preceding revision (Rev 1..N) is preserved in the finalized revision; no topic is silently lost during the revision-to-finalization transition. See [The Completeness Gate](#the-completeness-gate). |
| `git-security` | PASS / FAIL | Real run over the memo body and the planned artifacts; secrets, absolute paths, mock credentials, `.env` files, or personal data make it FAIL. |
| `repo-readme` (advisory) | PASS / WARN | Affected repos carry a README; missing README is a WARN here (hard enforcement lives in the git-push gate). |

### Block B — Decision Completeness

Block B exists to keep PRD-level questions from surfacing minutes **after** rollout start. Every finding goes into the one consolidated query — never to runtime.

| Gate | Result values | What it checks |
|------|---------------|----------------|
| PRD derivability + decision extractor | PASS / FAIL + decision list | Per phase, the PRD scope is derivable without a new architecture decision. This gate is not a bare coverage boolean: it **extracts and names** the concrete clarified architecture/design decisions (from answered `F{N}` questions, phase hints, and triage) into a structured per-phase decision list. That list is carried into the rollout via the rollout-handover document (below), so the empty rollout context never has to re-decide. |
| Phase hints binding | PASS / FAIL | The phase hints are symmetric and complete; `executionOrder` is frozen and written to the marker, so runtime never sees parallel candidates without a default. |
| Requirements coverage (forward check) | PASS / FAIL | Every memo chapter is assigned to at least one phase. |

### Block C — Environment / Repo Hygiene

Per affected repo (derived from entry points and phase planning), the finalize gate runs a stand check (clean tree, no open branches, no stale worktrees, no stashes), tool availability, a dependency smoke test, and a one-time budget snapshot. Findings are never silently mutated — each disposition goes into the one consolidated query, decided at the transition rather than at runtime.

A final row for user confirmation completes the report. There is **no** break-and-ask step after finalization: the transition into rollout is the marker write (and the rollout-handover document), not a question. The single point where the system actively asks is the one consolidated query (Block A/B/C summary), which happens before the verdict — not after it.

### The Rollout-Handover Document

On a `rollout-ready` verdict, `memo-finalize` writes a **rollout-handover document** at a fixed path (`.memo/<id>/rollout-handover.md`, referenced from the readiness marker via its `handover` field). It carries the per-phase decisions extracted by the decision-extractor gate, the `executionOrder`, the accepted risks, and the rollout entry points. It is **written at finalization and read at rollout start** — this is how the clarified decisions cross into the empty rollout context so no decision has to be re-made (re-asked) there. Writing is NO-OVERWRITE: an existing handover document is versioned or confirmed, never silently replaced. The read side belongs to the rollout (see [12-rollout.md](/specification/rollout/)).

### Verdict

The verdict is **binary**.

| Verdict | Condition |
|---------|-----------|
| `rollout-ready` | All gates PASS across Block A/B/C; each WARN was explicitly accepted by the user in the consolidated query and recorded as an accepted risk. |
| `NOT-ready` | Any FAIL or BLOCKED; failed gates and missing inputs listed. |

There is no conditional intermediate verdict. WARN gates do not produce a separate verdict — they are accepted (and recorded as accepted risks) or they become fix items. On `rollout-ready` the memo status becomes "Finalized" and the readiness marker plus the rollout-handover document are written; on `NOT-ready` the status is unchanged.

---

## The Completeness Gate

A memo grows across revisions (Rev 1..N). Each revision may add, sharpen, or reorganize topics. The risk at finalization is silent loss: a topic raised in an early revision disappears from the finalized revision without anyone deciding to drop it.

The completeness gate (gate 10) guards this transition. It treats the union of all information items and topics across every preceding revision as the required set, and verifies that the finalized revision preserves each of them. A topic counts as preserved when it is still present, or when it has been explicitly resolved, merged, or marked as deliberately dropped with a reason. A topic that is simply absent — present in some Rev 1..N but missing from the finalized revision with no decision recorded — makes the gate FAIL.

The gate therefore enforces a property, not a word-for-word match: revisions may rewrite and condense freely, but no topic crosses the revision-to-finalization boundary into oblivion by accident.

---

## Requirement-Derived Gates

Requirement-derived checks bind as finalization gates: a requirement **MAY** declare its own quality gate, which is then checked at finalization alongside the standard gates, letting a project bind a reproducible, data-backed constraint to finalization instead of leaving it as prose. The requirement model — scoping, the entry schema, and how a requirement names a check — is defined in its own chapter: see [Requirements](/specification/requirements/).

---

## Related

- [10-proactive-research.md](/specification/proactive-research/) — the research that closes `[ASSUMPTION]` / `[CONJECTURE]` items before gate 1 and gate 2 are checked.
- [12-rollout.md](/specification/rollout/) — the rollout that begins only after a `rollout-ready` verdict, and reads the rollout-handover document written at finalization.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — `git-security` as a fixed gate and a fixed part of the git flow.
- [23-requirements.md](/specification/requirements/) — the requirement model behind requirement-derived gates.
- [00-overview.md](/specification/overview/) — conformance language.
