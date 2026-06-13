# 11. Quality Gates & Finalization

| Field | Value |
|-------|-------|
| Status | Draft |
| Depends on | [10-proactive-research.md](./10-proactive-research.md) |
| Related | [12-rollout.md](./12-rollout.md), [09-contamination-context-handover.md](./09-contamination-context-handover.md), [16-git-security-versioning.md](./16-git-security-versioning.md), [23-requirements.md](./23-requirements.md), [00-overview.md](./00-overview.md) |

Quality is enforced by gates, and finalization is the readiness gate between strategy and implementation. This chapter defines the five quality skills, the six evidence levels, the finalization gate set (including the completeness gate that guards the revision-to-finalization transition), the verdict logic, and how requirement-derived checks bind as finalization gates.

---

## Finalization

Finalization is the act of declaring a memo ready to leave strategy and enter implementation. A memo is finalized exactly once, by an explicit user trigger, after every quality gate has been run. The AI **MUST NOT** finalize autonomously: experience shows the AI chronically finalizes too early, so finalization is the single workflow entry point that requires an explicit user trigger. There is no autonomous path into finalization.

Finalization produces a new revision containing a finalization report with a GO / NO-GO / CONDITIONAL GO verdict. A single FAIL or BLOCKED gate is enough for NO-GO. The gate set, verdict logic, and resulting status values are defined in the sections below.

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

`memo-evidence` produces a classification summary (count and share per level) and a research-needs section deriving how each `[ASSUMPTION]`, `[CONJECTURE]`, and `[UNKNOWN]` could be verified. The three handover zones (see [09-contamination-context-handover.md](./09-contamination-context-handover.md)) reuse these tags.

---

## The Finalization Gates

`memo-finalize` runs the gates below plus a user-confirmation gate. The gates are consolidated into **one** summary query presented to the user — the system MUST NOT ask one question per gate.

| # | Gate | Result values | What it checks |
|---|------|---------------|----------------|
| 0 | Input completeness | PASS / BLOCKED | Every input required by a referenced skill is present in the memo or its context block. BLOCKED counts as FAIL. |
| 1 | Facts / assumptions classified (`memo-evidence`) | PASS / FAIL | All substantive statements are tagged; the classification summary is present. |
| 2 | Research needs derived | PASS / FAIL | Research needs are listed; no `[Research open]` tag remains; each open point has a user decision. |
| 3 | Code references verified (`memo-references`) | PASS / FAIL / N/A | No `[REF-BROKEN]` markers remain; N/A if the memo has no code references. |
| 4 | Over-/under-engineering (`memo-balance`) | PASS / WARN / FAIL | No unaddressed +2 / −2 chapter; critical under-engineering (security, data integrity) resolved. |
| 5 | AI feedback given (`memo-coherence`) | PASS / WARN / FAIL | Coherence check performed; critical contradictions addressed. |
| 6 | Ralph-Loop suitability | PASS / WARN / N/A | If a Ralph-Loop is planned, its PRDs are self-contained with machine-testable acceptance criteria; N/A otherwise. |
| 7 | Open questions empty | PASS / FAIL | The `## Open Questions` section holds no unresolved `### F{N}` entries, or remaining entries are explicitly marked "deliberately open". |
| 8 | Third-party software veto (token-tracking) | PASS / WARN | Forbidden token-tracking packages appear only in an anti-pattern context, never as a positive recommendation. |
| 9 | Rollout entry points | PASS / WARN / FAIL | The `## Rollout Entry Points` section exists with at least one concrete (non-placeholder) numbered path entry; filesystem existence is a WARN, not a FAIL, because some paths are created by the rollout itself. |
| 10 | Completeness across revisions | PASS / FAIL | Every information item and topic present in any preceding revision (Rev 1..N) is preserved in the finalized revision; no topic is silently lost during the revision-to-finalization transition. |

A row for `git-security` and a final row for user confirmation complete the report. After a GO or CONDITIONAL GO the skill MUST break and ask the user whether to start the rollout — this is the single point in the whole workflow where the system actively asks whether to continue.

### Verdict

| Verdict | Condition |
|---------|-----------|
| GO | All gates PASS |
| CONDITIONAL GO | Only WARN gates (no FAIL, no BLOCKED); accepted risks listed |
| NO-GO | Any FAIL or BLOCKED; failed gates and missing inputs listed |

On GO the memo status becomes "Finalized"; on CONDITIONAL GO, "Conditionally finalized"; on NO-GO the status is unchanged.

---

## The Completeness Gate

A memo grows across revisions (Rev 1..N). Each revision may add, sharpen, or reorganize topics. The risk at finalization is silent loss: a topic raised in an early revision disappears from the finalized revision without anyone deciding to drop it.

The completeness gate (gate 10) guards this transition. It treats the union of all information items and topics across every preceding revision as the required set, and verifies that the finalized revision preserves each of them. A topic counts as preserved when it is still present, or when it has been explicitly resolved, merged, or marked as deliberately dropped with a reason. A topic that is simply absent — present in some Rev 1..N but missing from the finalized revision with no decision recorded — makes the gate FAIL.

The gate therefore enforces a property, not a word-for-word match: revisions may rewrite and condense freely, but no topic crosses the revision-to-finalization boundary into oblivion by accident.

---

## Requirement-Derived Gates

Requirement-derived checks bind as finalization gates: a requirement **MAY** declare its own quality gate, which is then checked at finalization alongside the standard gates, letting a project bind a reproducible, data-backed constraint to finalization instead of leaving it as prose. The requirement model — scoping, the entry schema, and how a requirement names a check — is defined in its own chapter: see [Requirements](./23-requirements.md).

---

## Related

- [10-proactive-research.md](./10-proactive-research.md) — the research that closes `[ASSUMPTION]` / `[CONJECTURE]` items before gate 1 and gate 2 are checked.
- [12-rollout.md](./12-rollout.md) — the rollout that begins only after a GO / CONDITIONAL GO verdict.
- [16-git-security-versioning.md](./16-git-security-versioning.md) — `git-security` as a fixed gate and a fixed part of the git flow.
- [23-requirements.md](./23-requirements.md) — the requirement model behind requirement-derived gates.
- [00-overview.md](./00-overview.md) — conformance language.
