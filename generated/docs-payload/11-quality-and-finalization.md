---
title: "Quality Gates"
description: "This chapter is **normative** for the nine finalization gates, the five quality skills, and the six evidence levels. The requirement-generated-gate wiring is **specified here but not yet implemented..."
spec_version: "0.1.0"
spec_file: "11-quality-and-finalization.md"
order: 11
section: "Specification"
normative: true
generated_at: "2026-06-12T00:45:52.499Z"
generated_from: "spec/v0.1.0/11-quality-and-finalization.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/11-quality-and-finalization.md."
---


> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](/specification/overview/) (Conformance Language). RFC 2119 / BCP 14 keywords are used.

This chapter is **normative** for the nine finalization gates, the five quality skills, and the six evidence levels. The requirement-generated-gate wiring is **specified here but not yet implemented in code** (it is follow-up work, see below).

---

## Purpose

Finalization is the readiness gate between strategy and implementation. A memo is finalized exactly once, by an explicit user trigger, after every quality gate has been run. The AI **MUST NOT** finalize autonomously: experience shows the AI chronically finalizes too early, so finalization is the single workflow entry point that requires an explicit user trigger. There is no autonomous path into finalization.

Finalization produces a new revision containing a finalization report with a Go / No-Go / Conditional-Go verdict. A single FAIL or BLOCKED gate is enough for NO-GO.

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
| `[FAKT]` | Fact | Verified fact with an identifiable source | Link, docs reference, or verifiable source |
| `[GEMESSEN]` | Measured | Benchmark or measurement confirmed | Test result, benchmark, or metric |
| `[ANNAHME]` | Assumption | Based on documentation but not verified in this context | Documentation reference, not tested locally |
| `[ABGELEITET]` | Derived | Logical conclusion from verified facts | A clear logical chain from verified premises |
| `[VERMUTUNG]` | Conjecture | Hypothesis without evidence | Nothing — the default for unsubstantiated claims |
| `[UNBEKANNT]` | Unknown | No data available, cannot even hypothesize | An acknowledged knowledge gap |

`memo-evidence` produces a classification summary (count and share per level) and a `Forschungsbedarf` (research-needs) section deriving how each `[ANNAHME]`, `[VERMUTUNG]`, and `[UNBEKANNT]` could be verified. The three handover zones (see [09-contamination-context-handover.md](/specification/contamination-context-handover/)) reuse these tags.

---

## The Nine Finalization Gates

`memo-finalize` runs nine gates plus a user-confirmation gate. The gates are consolidated into **one** summary query presented to the user — the system MUST NOT ask one question per gate.

| # | Gate | Result values | What it checks |
|---|------|---------------|----------------|
| 0 | Input completeness | PASS / BLOCKED | Every input required by a referenced skill is present in the memo or its context block. BLOCKED counts as FAIL. |
| 1 | Facts / assumptions classified (`memo-evidence`) | PASS / FAIL | All substantive statements are tagged; the classification summary is present. |
| 2 | Research needs derived | PASS / FAIL | Research needs are listed; no `[Research offen]` tag remains; each open point has a user decision. |
| 3 | Code references verified (`memo-references`) | PASS / FAIL / N/A | No `[REF-BROKEN]` markers remain; N/A if the memo has no code references. |
| 4 | Over-/under-engineering (`memo-balance`) | PASS / WARN / FAIL | No unaddressed +2 / −2 chapter; critical under-engineering (security, data integrity) resolved. |
| 5 | AI feedback given (`memo-coherence`) | PASS / WARN / FAIL | Coherence check performed; critical contradictions addressed. |
| 6 | Ralph-Loop suitability | PASS / WARN / N/A | If a Ralph-Loop is planned, its PRDs are self-contained with machine-testable acceptance criteria; N/A otherwise. |
| 7 | Open questions empty | PASS / FAIL | The `## Offene Fragen` section holds no unresolved `### F{N}` entries, or remaining entries are explicitly marked "deliberately open". |
| 8 | Third-party software veto (token-tracking) | PASS / WARN | Forbidden token-tracking packages appear only in an anti-pattern context, never as a positive recommendation. |
| 9 | Rollout entry points | PASS / WARN / FAIL | The `## Rollout-Entry-Points` section exists with at least one concrete (non-placeholder) numbered path entry; filesystem existence is a WARN, not a FAIL, because some paths are created by the rollout itself. |

A tenth row, `git-security`, and an eleventh row, user confirmation, complete the report. After a GO or CONDITIONAL GO the skill MUST break and ask the user whether to start the rollout — this is the single point in the whole workflow where the system actively asks whether to continue.

### Verdict

| Verdict | Condition |
|---------|-----------|
| GO | All gates PASS |
| CONDITIONAL GO | Only WARN gates (no FAIL, no BLOCKED); accepted risks listed |
| NO-GO | Any FAIL or BLOCKED; failed gates and missing inputs listed |

On GO the memo status becomes "Finalisiert"; on CONDITIONAL GO, "Bedingt finalisiert"; on NO-GO the status is unchanged.

---

## Requirement-Generated Quality Gates

Requirements (specified in the workbench sub-spec under `.memo/requirements/`) describe constraints from the perspective of a programming language and a repository, both global and project-specific. A requirement **MAY** declare its own quality gate, which is then checked at finalization alongside the nine standard gates. This lets a project bind a reproducible, data-backed constraint to the finalization process instead of leaving it as prose in instructions.

> **Follow-up (specified, not yet implemented):** the wiring that lets a requirement generate a finalization gate is fixed here as spec text. The live code that reads `.memo/requirements/` and injects the generated gate into `memo-finalize` is follow-up work (a separate memo), not part of this bootstrap. No live skill is changed by adopting this chapter.

---

## Related

- [10-proactive-research.md](/specification/proactive-research/) — the research that closes `[ANNAHME]` / `[VERMUTUNG]` items before gate 1 and gate 2 are checked.
- [12-rollout.md](/specification/rollout/) — the rollout that begins only after a GO / CONDITIONAL GO verdict.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — `git-security` as a fixed gate and a fixed part of the git flow.
- [00-overview.md](/specification/overview/) — conformance language.
