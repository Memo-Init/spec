---
title: "Quality Gates & Finalization"
description: "Quality is enforced by gates, and finalization is the readiness gate between strategy and implementation. This chapter defines the five quality skills, the eight evidence levels, the finalization..."
spec_version: "0.3.0"
spec_file: "11-quality-and-finalization.md"
order: 11
section: "Specification"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "memo/0.3.0/draft/spec/11-quality-and-finalization.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.3.0/draft/spec/11-quality-and-finalization.md."
---


Quality is enforced by gates, and finalization is the readiness gate between strategy and implementation. This chapter defines the five quality skills, the eight evidence levels, the finalization gate set (grouped into Block A/B/C, including the completeness gate that guards the revision-to-finalization transition and the decision-extractor gate that feeds the rollout-handover document), the binary verdict logic, and how requirement-derived checks bind as finalization gates.

---

## Finalization

Finalization is the act of declaring a memo ready to leave strategy and enter implementation. A memo is finalized exactly once, by an explicit user trigger, after every quality gate has been run. The AI **MUST NOT** finalize autonomously: experience shows the AI chronically finalizes too early, so finalization is the single workflow entry point that requires an explicit user trigger. There is no autonomous path into finalization.

Finalization produces a new revision containing a finalization report with a **binary** verdict: `rollout-ready` or `NOT-ready`. There is no conditional intermediate verdict — a single FAIL or BLOCKED gate is enough for `NOT-ready`. WARN gates do not force a conditional verdict; the user accepts each WARN explicitly in the one consolidated query, and every accepted WARN is recorded as an accepted risk. The gate set, verdict logic, and resulting status values are defined in the sections below.

---

## The Five Quality Skills

Five quality skills back the gates. Four run autonomously over the memo body; the fifth scans for security exposure.

| Quality skill | Checks |
|---------------|--------|
| `memo-evidence` | Tags every substantive statement by evidence level (eight levels, below); derives research needs |
| `memo-balance` | Detects over-engineering (+2) and under-engineering (−2) per chapter |
| `memo-coherence` | Finds gaps, contradictions, redundancies, and logical issues across chapters |
| `memo-references` | Verifies every file path, line number, and code snippet; fixes broken references |
| `git-security` | Scans for secrets, absolute paths, mock credentials, `.env` files, and personal data |

The four memo-* quality skills run **autonomously** — they MUST NOT ask follow-up questions; findings are written into the memo. `git-security` runs autonomously and reports only when it BLOCKS.

---

## The Eight Evidence Levels

`memo-evidence` assigns exactly one tag per substantive statement. The eight levels form a closed list:

| Tag | Level | Meaning | Requires |
|-----|-------|---------|----------|
| `[FACT]` | Fact | Verified fact with an identifiable source | Link, docs reference, or verifiable source |
| `[MEASURED]` | Measured | Benchmark or measurement confirmed | Test result, benchmark, or metric |
| `[ASSUMPTION]` | Assumption | Based on documentation but not verified in this context | Documentation reference, not tested locally |
| `[DERIVED]` | Derived | Logical conclusion from verified facts | A clear logical chain from verified premises |
| `[CONJECTURE]` | Conjecture | Hypothesis without evidence | Nothing — the default for unsubstantiated claims |
| `[UNKNOWN]` | Unknown | No data available, cannot even hypothesize | An acknowledged knowledge gap |
| `[EXPECTATION]` | Expectation | A statement about a result made before the measurement that settles it | The measurement that will settle it, named |
| `[OPINION]` | Opinion | A judgement or recommendation, not a claim about the present state | The author named (second position) |

The first six are ordered from strongest to weakest evidence; the two added levels stand outside that order, because they make no claim about the present state.

`memo-evidence` produces a classification summary (count and share per level) and a research-needs section deriving how each `[ASSUMPTION]`, `[CONJECTURE]`, `[UNKNOWN]` and `[EXPECTATION]` could be verified. An `[OPINION]` never creates a research need, and neither does a statement with origin `User` (see [The Origin Axis](#the-origin-axis)). A weak-level statement whose check effort is cheap is checked before it is listed as a research need; the check effort is defined in the labelling duty of the meta-specification ([Controlled Language](/spec/controlled-language/)). The three handover zones (see [09-contamination-context-handover.md](/specification/contamination-context-handover/)) reuse these tags.

**Evidence is the backing — it is NOT the claim, and it is NOT the source.** A level tag records *how strongly* a statement is supported and *what would confirm it*. It is **NOT** the statement it sits on, and it is **NOT** the document, link, or measurement that statement cites; those are what the backing points *at*. The distinction is load-bearing rather than pedantic, because the weak levels drive the research-needs section: name a claim's backing wrongly and the derived research is aimed at the wrong thing.

The machine token for this concept is the field name `evidence`. A rendered display label in the project's working language is that same field shown to a reader — **NOT** a second concept, and **NOT** a language violation (see [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/), rows *Machine tokens* and *Rendered display text*).

---

## The Origin Axis

Origin is an axis of its own and is never folded into the level list. `capture` says how a statement came into being (`spoken`, `written`, `measured`, `derived`, `cited`, `pasted` — the closed list of the evidence carrier in [51-memo-database.md](/specification/memo-database/)), `author` says who contributed it (`user`, `agent`, `tool`).

A level that glues an origin to a grade ("user fact", "user opinion") **MUST NOT** be added to the level list — not as a seventh value, not as an eighth. A user fact is `author = user` with `grade = fact`; a user opinion is `author = user` with `grade = opinion` (the level `[OPINION]` exists since the list became eight).

Exactly one origin value carries a decision: `author = user`. Such a statement creates **no research need**, is not re-measured, and is not refuted by a measurement of the author's own. Every other origin leaves the research-need rule of the level untouched.

On the Markdown surface the field `author` appears as the second position beside the grade (see the labelling duty in [Controlled Language](/spec/controlled-language/) of the meta-specification): `[ASSUMPTION]`-grade text written by the user carries the German label of that level followed by `[Herkunft: User]` in a German memo. The grade stays the first bracket, and the form rules read only that one.

---

## Changing the Closed Level List

The level list is a schema, not a writing habit. A change follows five steps, in this order:

1. **Decide the axis.** Origin is not a grade; a new value belongs to the level list only when it states how certain a statement is.
2. **Inventory every carrier and write the path down** — measured at the head that is changed, never copied from an earlier count.
3. **Change the normative carriers** — the lint constant, the specification text, the skill — and pull every copy along.
4. **Union the frozen word list `scripts/enum-language-baseline.json` by hand.** `--write-baseline` **MUST NOT** be used, because a re-freeze drops frozen legacy values.
5. **Use the new level in text** — only after step 4.

The carrier roles are: **normative** (the lint constant, the specification text, the skill), **copy** (a second list in code, a neighbouring skill, an agent file, a viewer), **machine-token spelling** (the English token of the evidence carrier and the places that list it), **partial carrier** (a subset, such as the research-need levels — not a closed list) and **consumer without a list of its own** (a module that imports the list). A copy that does not move along produces two valid lists; step 5 waits for every carrier.

---

## The Transition Rule for a New Level

Until step 4 of the change path is done, a new level is **specified and not used**. Step 4 is done for a text only when the command-line tool that lints that text carries the extended list; for `.memo/` texts that is the globally linked `memo` tool, i.e. after the core change is merged into `main`. Until then a statement that the new level would carry is written with an existing level — typically `[ASSUMPTION]` — plus an explicit origin note in the sentence, the form a revision uses for a user statement that was not measured on the user's instruction. Using the level earlier lets the revision fail its own gate (FR-03 is an error).

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
| Topic-to-block coverage (`memo block coverage`) | PASS / FAIL | Every registered topic is bound to at least one block via that block's `topicIds`; the union of all blocks' `topicIds` leaves no registered topic uncovered. An uncovered topic is a **HARD-FAIL**, not a warning. This is the **only hard precondition for planning**: below full coverage the planner cuts from an incomplete set, so the cut is not merely less precise but non-deterministic. The coverage also spans the **topic-to-work-item edge** — a topic without a work item is invisible to the cut in the same way a topic without a block is. Every other maturity measure (evidence binding, chapter contract) lowers quality without blocking. See [The Block-Coverage Gate](#the-block-coverage-gate) and [52-field-contract.md](/specification/field-contract/). |
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

## The Block-Coverage Gate

The topic store is the head of the executable chain, and the block model is where topics are captured (see [06-memo-structure.md](/specification/memo-structure/) and [30-primitives.md](/specification/primitives/)). This gate closes the loop between them: **every registered topic MUST be bound to at least one block.**

The check is deterministic. It takes the union of every block's `topicIds` across the memo and compares it, as a set difference, against the registered topics in the topic store. If any registered topic is absent from that union, the topic is **uncovered** and the gate **FAILs** — this is a **HARD-FAIL, not a warning**, because a captured topic that no block references is a topic the factory can never turn into a PRD (the canonical chain Topic → Block → PRD has no entry point for it, so nothing downstream can pick it up). The deterministic form is the `memo block coverage` CLI leaf, which reports the uncovered topic ids rather than passing silently.

This gate is the read/verify counterpart of the topic-store write side ([06-memo-structure.md](/specification/memo-structure/)): the write side guarantees every extracted topic is *registered*, and this gate guarantees every registered topic is *captured in a block*. It is distinct from the memo↔PRD coverage check ([08-phases-and-prds.md](/specification/phases-and-prds/), REQ-762), which verifies the later block→PRD→phase stage rather than the topic→block one.

---

## The Maturity Matrix

The block-coverage gate answers one question. Whether a memo is ready to be planned is a wider one, and the maturity matrix answers it: **the matrix is the gate before planning.** Readiness is defined against the consumer of the memo — the planner, who cuts work orders from its topics — and not against the form of the document. A form metric that asks whether an existing chapter carries its sections counts *forward*; it cannot see a topic that has no chapter at all and still reports the contract as fulfilled. The matrix counts each edge from the side of the object that must be carried, and holds the edges that can be measured today beside each other:

| Edge | Measured by | Threshold |
|------|-------------|-----------|
| Topic carries block | `memo block coverage` | hard, 100 % |
| Topic carries work item | `memo topic item-coverage` | soft |
| Block carries chapter row | `block_chapter` per block | soft |
| Work item carries provenance | `work_item.provenance` | soft |
| Chapter carries user mandate | `memo revision score`, K7 | soft |
| Statement carries evidence | `memo revision score`, K3 | soft |

Below 100 % on the hard edge the planner MUST NOT cut; soft edges lower the quality and never block.

The hard edge is hard because a planner that cuts from an incomplete topic set produces a cut nobody can reproduce. A soft edge is held against the same 100 %; below it, the edge is a finding that lowers the quality of the memo and is reported with its figure and its comparison set — it never stops the planner. This holds for the evidence binding degree too, which may stand far below the other edges and stays a figure, not a gate.

The deterministic form is the `memo block maturity` CLI leaf. It reports one row per edge — the members that carry the edge, the comparison set, the share, the kind (hard or soft), the threshold and the verdict — and exits non-zero exactly when the hard edge is below 100 %. The verdict is decided on the counts, never on a rounded share. An edge whose comparison set is empty has no share: it is reported as unmeasured, never as 0 % and never as 100 %, and a hard edge without a comparison set is not a pass.

**Thresholds checked against real cuts.** The thresholds were held against the first five real phase cuts of a memo that was planned and built under them: 22 work orders carrying 31, 54, 98, 39 and 168 work items, 390 in total. For every work item of a cut, three edges were counted: its topic carries a block (390 of 390), that block carries a chapter row (390 of 390), and the work item carries a provenance (390 of 390). Every cut stood at 100 % on all three edges, so the hard threshold of 100 % and the two soft thresholds are confirmed: they are attainable on real cuts and would have blocked none of them. Two limits belong beside the figure. The count was taken on the stock as it stands after the cuts, not at the moment of each cut, so an edge repaired afterwards counts as carried. And a stock that is full everywhere does not yet show what the thresholds separate; the first gap will become visible at a later cut.

---

## The Block Metric Tree

A memo is measured per block, not per memo: a memo-wide figure lets one good block hide a weak one. The block metric tree is a list of rules, each a yes/no question about a block or about the memo as a whole, and every block is counted into its own fulfilment quota — the number of counted rules it holds out of the number of counted rules. **There is no sum over blocks**: every block stands with its own quota, and a reader who wants a memo figure has to say which blocks he folds together.

| Rule | Level | Question | Judged by |
|------|-------|----------|-----------|
| M-R1 | memo | No work item without a topic | the living work items |
| M-R2 | memo | No topic without a block | the registered topics |
| M-R3 | block | No block without a topic | the registered topics that name the block |
| M-R4 | block | At least one verbatim quote in the user mandate | the quote pattern of the section register |
| M-R5 | block | The assessment is present | the heading with a non-empty body |
| M-R6 | block | The conclusion is present | the heading with a non-empty body |
| M-R7 | block | The title is searchable: not the identifier, no leading chapter number, no category tag | the title rules of the field-correctness gate |
| M-R8 | block | The quote carries its filter status | pending — no column carries the filter status yet |

Each rule is judged by the instrument that already owns the question; the tree re-implements none of them. The memo-level rules each name their own comparison set and are reported beside the block rows, never folded into them.

**The tree grows by appending.** The rules are held as data, not as code paths. A rule that becomes checkable is appended; it lowers measured values, and both comparison sets are named. A rule that has no carrier yet is listed as pending, with its reason, and is not counted — a rule that could not be measured never counts as held.

The deterministic form is the `memo block metric-tree` CLI leaf: one row per block with its chapter, every rule and its verdict, the fulfilled count, the counted rules and the quota.

---

## The Chapter Metric Set and the Acceptance Threshold

Beside the block metric tree, every numbered chapter of a revision is graded on a fixed set of eight metrics. Three hold the document against itself, four hold it against the database of the memo — the connections the chapter claims — and the eighth reports an identifier standing where a title belongs.

| Metric | Measures | Held against |
|--------|----------|--------------|
| M1 | The chapter is valid under the chapter rule: a user mandate with a verbatim quote and its derivation, placed before every other contract section except the context | the chapter validity rule and the section register |
| M2 | No quote of the user mandate stands away from where its reference points | the quote-reference probe |
| M3 | No mandatory section of the chapter contract is missing | the chapter contract |
| M4 | Every topic identifier the chapter names exists | the `topic` table |
| M5 | Every work-item identifier the chapter names exists | the `work_item` table |
| M6 | Every named topic that exists carries at least one living work item | the `work_item` table (`topic`, `deregistration`) |
| M7 | A block is bound to the chapter | the `block_chapter` table |
| M8 | The bound block carries a title that is neither empty nor its own identifier | the `block_chapter` and `block` tables |

**Three grades, one threshold.** A chapter is `invalid` when M1, M2 or M3 is not met; it is `complete` when all eight are met; otherwise it is `accepted`. **The verdict of a revision is its worst chapter.** **A metric that could not be measured never counts as met**: without the database M4 to M8 are not measured, and the chapter can then reach `accepted` at best, never `complete`.

**An identifier as a title is a finding, not a display state.** Where the title of a block equals its identifier, the title counts as unfilled and is reported — except when the block is demonstrably unbound to any chapter; then the identifier is its honest name and no finding. M8 judges the bound block; the unbound ones are listed beside the chapters and are not counted against them.

The metric set is the stage `chapter-metrics` of `memo blindspot run`. M1 and M3 come from the chapter validity rule, run in the same process; M2 comes from the quote-reference probe, run as a child process; M4 to M8 are read from the memo database through a read-only handle. A stage whose reference probe gives no answer has not run and has no basis.

---

## The Two Gates

Two gates stand on the measured blocks. They answer different questions and are kept apart.

**The conversation threshold** answers *may a question about this block be asked?* Its verdict is binary per block: the block is open when every mandatory heading of the chapter contract stands in its chapter with a non-empty body, and closed otherwise. There is no percentage — the question has two answers. A question about a closed block is not asked; it is recorded in the preface of the revision as a held-back question, with the note that the content is complete but the form is not, and the sections that are missing. A block whose chapter does not stand in the revision is closed with its reason. The deterministic form is the `memo block conversation-gate` CLI leaf.

**The planner gate** answers *may this memo be planned and finalized?* It holds the fulfilment quota of every block over the rules of the block metric tree against **80**: a single block below 80 blocks the start of the rollout and the finalization. The verdict is decided on the counts, never on a rounded quota. Beside the gate, the form target rises with the revision number — **30** from the first revision, **50** from the second, **70** from the third and **80** from the fourth revision on; from the fourth revision the target stays 80. The form target says how far a revision is expected to have come; the gate says whether planning may begin. The deterministic form is the `memo block planner-gate` CLI leaf: exit 0 when every block stands at 80 or above, exit 1 when a block is below, exit 3 when there is nothing to judge.

### Equal Care for Every Block

Both gates judge one block at a time, and the care they presuppose is owed to every block alike. Every block MUST be worked with the same care, in every revision; an omission does not lapse. A block does not become finished because other blocks are finished, and it does not become less due because an earlier revision passed it over.

No figure over all blocks MAY be read as fulfilment; every block carries its own verdict. The form metric behind `memo revision score` already refuses an overall grade, and for a measured reason: eight green structural values outvoted a collapse of the evidence, so that a weaker revision looked better than a stronger one. An average hides the one empty block; the rule lifts that refusal from a property of one tool to an obligation of every reader.

Blocks left unworked in an earlier revision MUST be worked before new blocks are raised; the order of work MUST NOT follow ease. A revision that raises new blocks while an old one stays unworked does not meet the rule, however high its figures climb. The memo viewer therefore lists, per revision, the blocks that are closed and since which revision they have stood closed without a break — a list that only grows shorter when those blocks are worked.

Before this rule was written, the specification carried no rule of this kind: a keyword search for five terms over 1,782 Markdown files found none.

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

`memo-evidence` assigns exactly one of the eight evidence tags (the `[FACT]` … `[OPINION]` set defined above) to every substantive statement. The tag is inserted **inline** at the start of the statement, in the form `[TAG] original statement text`; headings are not tagged, only content statements. From the tagged body the skill derives two artifacts: a classification summary (count and share per level) and a research-needs section that, for each `[ASSUMPTION]`, `[CONJECTURE]`, and `[UNKNOWN]`, names how the claim could be verified or what data would confirm it (likewise for each `[EXPECTATION]`: the measurement that will settle it). The skill runs autonomously: the default disposition is to accept an `[ASSUMPTION]` as a working hypothesis and to keep a `[CONJECTURE]` while flagging it in research needs; only critical unverified items are surfaced.

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

## Fresh Context for the Rollout — a Gate, not a Recommendation

The autonomous rollout MUST begin in a **fresh context**, and this is an **enforced precondition — a gate**, not a soft suggestion. A memo is authored across a long session that fills the context with the reasoning, dead ends, and assumptions of *building* the plan. Executing that same plan from inside that same, saturated context carries every one of those biases into the run — the session that shaped the work is the worst placed to execute it cleanly, the same reason evaluation and scoring are never done in the session that did the work. Fresh context for the rollout is therefore a **first-class checked precondition**, surfaced as its own verdict, rather than a line of advice buried in prose.

The check runs at the deterministic pre-flight. It reads the memo's work-mode-state — the immutable, append-only record of which sessions touched the memo's authoring arc — and asks a single question: is the session about to run the rollout the **same session that authored the memo**? If the current session already carries authoring-arc markers for this memo, the rollout is starting in a contaminated context and the gate says so, by name; if it carries none, the rollout is starting fresh.

The gate's **enforcement posture is fail-open**: it surfaces the verdict and WARNs on a contaminated start — it does **not** hard-block the rollout. The harness cannot itself open a new context (only the user can `/clear`), so a hard stop would be an unrecoverable dead end; the honest design is a loud, first-class WARN that names the contamination and points at the fix — start the rollout after a `/clear`. What changes here is the *framing*: fresh-context-for-the-rollout is lifted from an easily missed recommendation to a checked gate with its own surfaced result — precondition, not afterthought — even though its teeth stay soft, consistent with the system's warn-not-block posture.

This start-of-rollout gate is distinct from the mid-rollout reset recommendation below: the gate governs whether the rollout may *begin* in the current context; the reset recommendation governs whether a *running* rollout should pause for a `/clear` as its context fills. The first is a precondition; the second is advice acted on at a phase boundary.

---

## The Reset-Recommendation Algorithm

A long-running rollout degrades as its context fills. The system therefore recommends a context reset (a `/clear`) at the right moment — but only **recommends**: the agent cannot self-trigger a context clear. Clearing the context is a user action; the algorithm decides whether to surface the recommendation, and the user acts on it (or not).

The recommendation is gated on a phase boundary and two utilization thresholds:

- **Phase boundary required.** The check runs only at a phase boundary — a unit of work finished, a commit set, a phase checkbox updated. If the algorithm is invoked mid-unit it returns immediately with no recommendation. This hard guard exists because resetting mid-unit aborts the unit and lowers the success rate.
- **High-load-with-scope-change.** At over 75% context utilization, if the next phase changes scope (a different repository, memo, or technology), recommend a reset.
- **Critical.** At over 90% context utilization, recommend a reset regardless of scope change.

The recommendation fires when, at a phase boundary, either the high-load-with-scope-change or the critical condition holds; otherwise no recommendation is surfaced, even above a threshold. The thresholds have a rationale: roughly the first quarter of the context window is the zone where attention is not yet degraded, so once utilization leaves that zone a boundary reset pays off. Each run records its outcome (recommendation or no-recommendation, with a reason and the last phase head) so the decision is auditable. The output is advisory only: a single recommendation line that names the utilization percentage and the next scope, surfaced once at the boundary — never an automatic clear.

---

## Context Quality Is a Curve, Not Two Zones

> Context quality does not fall off a cliff between a "smart" and a "dumb" zone — a 0/1 split is a simplification. It follows a **curve**: much capacity at the start, flattening relatively quickly, and running out flat toward the back. Where exactly the curve bends is **content-dependent** — the same token count degrades differently depending on what fills the window — so no single hard number is correct for every session. The smart-zone and hard-cap fractions for PRD sizing ([08-phases-and-prds.md](/specification/phases-and-prds/)) are points read off this curve, and the context-rot decay ([09-contamination-context-handover.md](/specification/contamination-context-handover/)) is the curve seen as quality loss.
>
> Because the bend is content-dependent, the working thresholds are **configurable, not hard-coded**: the descriptor exposes named thresholds (an "onset" band where degradation begins, a mid band, and a "poor" band where output quality is clearly compromised) whose concrete values are tuned per project and per content profile rather than frozen in the spec prose. The spec fixes *that* the thresholds exist and are curve-shaped and configurable; it does not fix the numbers.

The named bands are illustrative, not fixed truth: an *onset* threshold where degradation begins, a *mid* commitment band, and a *poor* threshold where quality is clearly compromised. Their concrete values are set later in the configuration cascade — the [session config surface](/session/config-cascade/) and the workbench policy layer — not implemented or numbered here. What this chapter fixes is the position (a curve, not two zones) and the configuration contract (named, tunable thresholds), never a byte count treated as truth.

---

## Conformity Requirements

The finalization-gate rules above are authored **prose-first** as declarative requirements (the prose-first guard, [35-memo-authoring.md](/specification/memo-authoring/) and [23-requirements.md](/specification/requirements/)): each rule's `statement` faces generation and its `check` faces the finalization gate, resolving to a ternary `PASS` / `BLOCKED` / `INCONCLUSIVE`. The blocks below are the machine-readable source the requirement store is **harvested** from — the gate's own conformity as the worked example of the requirement model. These are the same checks the gate set above runs; this section is their data-backed form, not a second standard.

The open-questions gate is a hard yes/no scan, so its `grade` is `binary`:

```requirement
{
  "id": "REQ-830",
  "title": "Open-questions-empty finalization gate",
  "statement": "Finalization MUST FAIL while the `## Open Questions` area holds any unresolved `### F{N}` entry, unless a remaining entry is explicitly marked deliberately open. The gate scans the open-questions area and lists the failing question numbers and titles rather than passing silently.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["finalization-gates", "open-questions"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The Open Questions area contains no unresolved F-entry, or each remaining entry is explicitly marked deliberately open",
      "On failure the gate names the failing question numbers and titles instead of passing silently"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-831",
  "title": "Rollout entry points present and filesystem-checked",
  "statement": "A finalized memo MUST carry a `## Rollout Entry Points` section listing at least one concrete, numbered path (no template placeholders) with a brief reason for the reading order; the gate FAILs if the section is missing, empty, or placeholder-only. Each listed path is then checked for filesystem existence, which is a WARN rather than a FAIL because some entry points are created by the rollout itself.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["finalization-gates", "rollout-entry-points"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The Rollout Entry Points section exists with at least one concrete numbered path and no placeholders",
      "Each listed path's filesystem existence is reported, with a miss raising WARN rather than FAIL"
    ]
  },
  "grade": "binary"
}
```

The completeness gate is judged by a fresh-context reviewer against the union of prior revisions; a quality dimension (how completely intent is preserved) genuinely belongs here but is not yet written, so the slot is the honest `todo`:

```requirement
{
  "id": "REQ-832",
  "title": "Completeness across revisions at finalization",
  "statement": "At finalization, every information item and topic present in any preceding revision MUST be preserved in the finalized revision: a topic counts as preserved when it is still present, or explicitly resolved, merged, or marked deliberately dropped with a reason. A topic that is simply absent — present in an earlier revision but missing from the finalized one with no recorded decision — makes the gate FAIL.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["finalization-gates", "completeness"] },
  "severity": "blocker",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer takes the union of information items and topics across all preceding revisions as the required set and judges whether the finalized revision preserves each. PASS when every item is present or carries an explicit resolve/merge/drop-with-reason decision; BLOCKED when any item is silently absent; INCONCLUSIVE when the prior revisions could not be read.",
    "verify": [
      "Collect the union of information items and topics across every preceding revision",
      "Confirm each is present in the finalized revision or carries an explicit resolve/merge/drop decision"
    ]
  },
  "grade": "todo"
}
```

```requirement
{
  "id": "REQ-833",
  "title": "Rollout-handover document written at finalization",
  "statement": "On a rollout-ready verdict, finalization MUST write a rollout-handover document at the memo's fixed handover path, carrying the per-phase clarified decisions, the frozen execution order, the accepted risks, and the rollout entry points. It is written at finalization and read at rollout start so the empty rollout context never re-decides; writing is NO-OVERWRITE — an existing handover document is versioned or confirmed, never silently replaced.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["finalization-gates", "rollout-handover"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A rollout-ready verdict produces a handover document at the memo's fixed handover path carrying per-phase decisions, the execution order, accepted risks, and entry points",
      "An existing handover document is versioned or confirmed, never silently overwritten"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-834",
  "title": "Sub-memo HARD-STOP at finalization",
  "statement": "A memo created autonomously as a sub-memo that has not yet received any user editing MUST NOT finalize. When the finalize step detects that the latest revision was produced autonomously and no user revision exists on top of it, it stops with a HARD-STOP and runs no gates; the resolution is for the user to give feedback first (creating a user revision), after which finalization proceeds normally.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["finalization-gates", "sub-memo"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A sub-memo whose latest revision was produced autonomously with no user revision on top does not finalize",
      "The finalize step returns a HARD-STOP without running the gate set in that condition"
    ]
  },
  "grade": "binary"
}
```

The block-coverage gate is a deterministic set comparison — every registered topic must be captured in a block — so it is a HARD-FAIL check with a `binary` grade:

```requirement
{
  "id": "REQ-835",
  "title": "Every registered topic is covered by at least one block",
  "statement": "At finalization the union of every block's `topicIds` across the memo MUST cover the registered topic set with no gap: each topic registered in the memo's topic store MUST be bound to at least one block. A topic that no block references is uncovered, and an uncovered topic is a HARD-FAIL — never a warning — because the canonical Topic -> Block -> PRD chain has no entry point for it, so nothing downstream can turn it into a PRD. The gate reports the uncovered topic ids rather than passing silently.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["finalization-gates", "block-coverage"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "memo",
    "tactic": "block-coverage",
    "verify": [
      "Run `memo block coverage` for the memo",
      "Assert the union of all blocks' topicIds covers every registered topic in the topic store",
      "Fail hard (not warn) and list the uncovered topic ids when any registered topic is left uncovered"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [10-proactive-research.md](/specification/proactive-research/) — the research that closes `[ASSUMPTION]` / `[CONJECTURE]` items before gate 1 and gate 2 are checked.
- [12-rollout.md](/specification/rollout/) — the rollout that begins only after a `rollout-ready` verdict, reads the rollout-handover document written at finalization, and is where the reset-recommendation algorithm fires at phase boundaries.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — the context degradation the reset-recommendation algorithm guards against, and the handover zones that reuse the evidence tags.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — `git-security` as a fixed gate and a fixed part of the git flow.
- [23-requirements.md](/specification/requirements/) — the requirement model behind requirement-derived gates, including the back pressure a requirement statement exerts on generation.
- [00-overview.md](/specification/overview/) — conformance language.
