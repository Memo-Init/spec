---
title: "Quality Gates & Finalization"
description: "Quality is enforced by gates, and finalization is the readiness gate between strategy and implementation. This chapter defines the five quality skills, the six evidence levels, the finalization gate..."
spec_version: "0.1.0"
spec_file: "11-quality-and-finalization.md"
order: 11
section: "Specification"
normative: true
generated_at: "2026-06-24T21:18:51.000Z"
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

## Quality-Skill Rubrics

The five quality skills are named above; this section specifies the internal rubrics they apply, so that two runs of the same skill over the same memo reach the same finding.

### Balance — the over-/under-engineering scale

`memo-balance` rates every chapter on a single signed five-point scale, where the sign carries the direction (negative = too much, positive = too little) and the magnitude carries the severity:

| Rating | Meaning | Recommended action |
|--------|---------|--------------------|
| −2 | Heavily over-engineered | Cut substantially |
| −1 | Slightly over-engineered | Tighten |
| 0 | Calibrated | Right depth — leave as is |
| +1 | Slightly under-engineered | Add detail |
| +2 | Heavily under-engineered | Deepen urgently |

The rating is evidence-backed: each non-zero score names the exact passage that is too detailed or too shallow. Over-engineering indicators include excessive detail on trivial aspects, premature optimization, edge cases documented before the happy path, and specs for features that may never be built. Under-engineering indicators include critical decisions mentioned but not explained, blocking dependencies deferred with "we'll figure it out later", security-relevant aspects glossed over, and missing failure-mode or error-handling strategy. Beyond per-chapter scores the skill also assesses cross-chapter balance — whether detail distribution matches priority distribution, so that a trivial chapter is not longer than a foundational one. The finalize gate treats an unaddressed −2 or +2 as the threshold for attention, and resolved critical under-engineering (security, data integrity) as a hard expectation.

### Coherence — the maturity and severity scale

`memo-coherence` produces an honest, unflinching review rather than a confirmation. It sorts every finding into four buckets — missing aspects, logical gaps, redundancies, and contradictions — and each finding carries a severity of high / medium / low. The skill also assigns the memo one overall **maturity** rating on a three-step scale:

| Maturity | Meaning |
|----------|---------|
| Early | Core questions still open; not yet a coherent argument |
| Solid | Argument holds; specific gaps remain |
| Mature | Complete and internally consistent; ready to finalize |

The review names the single biggest strength and the single biggest weakness, references concrete chapters and statements rather than vague concerns, and proposes concrete improvements. The finalize gate treats unresolved high-severity contradictions as the line between WARN and FAIL.

### Evidence — the level tags, the inline format, and the language check

`memo-evidence` assigns exactly one of the six evidence tags (the `[FACT]` … `[UNKNOWN]` set defined above) to every substantive statement. The tag is inserted **inline** at the start of the statement, in the form `[TAG] original statement text`; headings are not tagged, only content statements. From the tagged body the skill derives two artifacts: a classification summary (count and share per level) and a research-needs section that, for each `[ASSUMPTION]`, `[CONJECTURE]`, and `[UNKNOWN]`, names how the claim could be verified or what data would confirm it. The skill runs autonomously: the default disposition is to accept an `[ASSUMPTION]` as a working hypothesis and to keep a `[CONJECTURE]` while flagging it in research needs; only critical unverified items are surfaced.

This skill also carries the **one-language-per-artefact** consistency check. A single artifact stays in one language and does not mix: code and code comments are English, the memo body is written in its memo language throughout. A statement that mixes two languages inside one artifact is a consistency finding — the surrounding language is the reference, and the off-language fragment is corrected toward it.

### References — the status taxonomy, auto-fix policy, and the large-file threshold

`memo-references` extracts every file path, line number, code snippet, and method/class reference in the memo and verifies each against the real codebase. Each reference resolves to one status:

| Status | Meaning |
|--------|---------|
| Verified | File exists, line and snippet match — marked `[REF-OK]` |
| Shifted | Snippet found, but at a different line than stated |
| Moved | Snippet found, but in a different file |
| Missing | Referenced file does not exist — marked `[REF-BROKEN]` |
| Not found | Snippet not found anywhere in the codebase |
| Stale | Method/class exists but its signature no longer matches the description |

The **auto-fix policy** is: a Shifted or Moved reference is corrected in place automatically (the skill rewrites the line number or path and reports it — it does not ask). A Missing or Not-found reference is marked `[REF-BROKEN]` with a suggested fix and surfaced for a human decision, because inventing a target would be a guess. A finalize run FAILs the reference gate only while `[REF-BROKEN]` markers remain.

For large codebases the skill switches strategy above a file-count threshold (on the order of one thousand files): rather than verifying sequentially it splits the work by repository or directory and fans the verification out to sub-agents, then aggregates their results and reports any sub-agent failure. Below the threshold it verifies sequentially in one pass.

---

## Finalize Sub-Gates

The finalization gate is not a single check. Beyond the per-skill quality gates above, the finalize step runs several environment and decision sub-gates, each of which feeds the one consolidated query rather than runtime.

### Sub-memo HARD-STOP

A memo that was created autonomously as a sub-memo and has not yet received any user editing MUST NOT finalize. When the finalize step detects that the latest revision was produced autonomously and no user revision exists on top of it, it stops with a HARD-STOP verdict and no gate run: a sub-memo represents work the user has not yet shaped, so finalizing it would skip the one mandatory human touch. The resolution is for the user to give feedback first (creating a user revision), after which finalization can proceed normally.

### Token-budget snapshot — the single legitimate paste point

Finalization is the one and only point in the workflow where the remaining token budget is recorded. The user pastes a usage snapshot exactly once, here, and the parsed values (week-used percentage, reset time) travel into the readiness marker. This single-point rule exists so that runtime never has to re-paste: the budget is read passively from the marker afterward. Crucially, the **only** trusted source is the user-pasted snapshot — third-party token-tracking packages are vetoed by policy and are never read, scraped, or recommended as a budget source. A budget that is tight for the estimated scope is a WARN, not a blocker, and surfaces as a hint (with a scheduling suggestion) in the consolidated query.

### Loop-suitability gate

When the work is planned to run as an autonomous loop, the finalize step checks whether it actually suits one: the loop's units of work must be self-contained, each must carry machine-testable acceptance criteria, countermeasures must be embedded rather than assumed, and security-critical units must be bounded by an iteration cap. If the work is not loop-shaped the gate is N/A and is skipped; it is never a hard FAIL, only PASS / WARN / N/A — an autonomous loop is an option, not a requirement.

### Dependency smoke-check

At finalization, each affected repository with a manifest gets a dry install/load (a dry-run dependency resolution) so that a broken or unresolvable dependency is caught at the strategy-to-implementation boundary rather than minutes into rollout. A failing smoke-check is rework before rollout, not a runtime abort. This pairs with the per-repo stand check (clean tree, no stray branches, worktrees, or stashes) and tool-availability check in the environment block; every finding goes into the consolidated query, never silently mutated.

### Rollout entry points + filesystem existence check

The memo MUST carry a `## Rollout Entry Points` section listing at least one concrete, numbered path — the reading order an empty rollout context starts from. The gate FAILs if the section is missing, empty, or contains only template placeholders. For each listed path the gate then runs a filesystem existence check (directory existence for a trailing-slash path, file existence otherwise). A missing path here is a **WARN, not a FAIL**: some entry points are created by the rollout itself, so their absence at finalization is expected and is merely reported per path. The plausibility of the reading order (does it suit a cold start?) is surfaced as a recommendation, not a gate.

---

## The Reset-Recommendation Algorithm

A long-running rollout degrades as its context fills. The system therefore recommends a context reset (a `/clear`) at the right moment — but only **recommends**: the agent cannot self-trigger a context clear. Clearing the context is a user action; the algorithm decides whether to surface the recommendation, and the user acts on it (or not).

The recommendation is gated on a phase boundary and two utilization thresholds:

- **Phase boundary required.** The check runs only at a phase boundary — a unit of work finished, a commit set, a phase checkbox updated. If the algorithm is invoked mid-unit it returns immediately with no recommendation. This hard guard exists because resetting mid-unit aborts the unit and lowers the success rate.
- **High-load-with-scope-change.** At over 75% context utilization, if the next phase changes scope (a different repository, memo, or technology), recommend a reset.
- **Critical.** At over 90% context utilization, recommend a reset regardless of scope change.

The recommendation fires when, at a phase boundary, either the high-load-with-scope-change or the critical condition holds; otherwise no recommendation is surfaced, even above a threshold. The thresholds have a rationale: roughly the first quarter of the context window is the zone where attention is not yet degraded, so once utilization leaves that zone a boundary reset pays off. Each run records its outcome (recommendation or no-recommendation, with a reason and the last phase head) so the decision is auditable. The output is advisory only: a single recommendation line that names the utilization percentage and the next scope, surfaced once at the boundary — never an automatic clear.

---

## Related

- [10-proactive-research.md](/specification/proactive-research/) — the research that closes `[ASSUMPTION]` / `[CONJECTURE]` items before gate 1 and gate 2 are checked.
- [12-rollout.md](/specification/rollout/) — the rollout that begins only after a `rollout-ready` verdict, reads the rollout-handover document written at finalization, and is where the reset-recommendation algorithm fires at phase boundaries.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — the context degradation the reset-recommendation algorithm guards against, and the handover zones that reuse the evidence tags.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — `git-security` as a fixed gate and a fixed part of the git flow.
- [23-requirements.md](/specification/requirements/) — the requirement model behind requirement-derived gates.
- [00-overview.md](/specification/overview/) — conformance language.
