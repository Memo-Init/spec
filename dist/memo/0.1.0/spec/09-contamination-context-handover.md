---
title: "Contamination & Handover"
description: "A memo or a session handover written from a degraded context carries its mis-weighting forward into the next document. The cause is **context rot** (quality decay of LLM output as input length..."
spec_version: "0.1.0"
spec_file: "09-contamination-context-handover.md"
order: 9
section: "Specification"
normative: true
generated_at: "2026-07-01T17:10:03.597Z"
generated_from: "draft/memo/0.1.0/spec/09-contamination-context-handover.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/09-contamination-context-handover.md."
---


A memo or a session handover written from a degraded context carries its mis-weighting forward into the next document. The cause is **context rot** (quality decay of LLM output as input length grows); the consequence is **contamination** (a document written out of a rotten context). These two terms are distinct and MUST NOT be used interchangeably: context rot is the cause, contamination is the effect.

The robust place to repair contamination is a **fresh context** — the writing context is, by definition, the contaminated one and cannot clean itself. The system therefore does not rely on discipline; it provides a deterministic detector, an empty-context rule, and a handover artifact that points at primary sources instead of re-narrating them.

---

## Contamination Detector (five signals)

A document MUST be checked for contamination signals **before** its content is reviewed. The signals are form- and behavior-based, deterministic, and require no LLM interpretation.

| Signal | ID | Description | Trigger threshold |
|--------|----|-------------|-------------------|
| Form break | `S1` | Headings do not follow the template structure; mandatory sections are missing; naming conventions are violated (e.g. an insider word used as a topic heading). | 1 violation = hit |
| Compute shortcut | `S2` | A compute- or time-intensive rule marked non-skippable is abbreviated to finish faster (e.g. 1 test instead of 3 per schema across ~100 schemas). | 1 abbreviation of a non-skippable rule = hit |
| Weighting drift | `S3` | Small symptoms are inflated; the actual main problem ("elephant in the room") is buried under side topics or absent. | Heuristic; MUST be justified explicitly when reported |
| Narrative over pointer | `S4` | Much re-narrated conclusion, little reference to a primary artifact (file, commit, issue). | < 1 pointer per 5 claims = hit |
| Naming sprawl | `S5` | Several handover files with different names for the same thing (`HANDOVER.md`, `RE-ENTRY.md`, `PAUSE-STATUS.md` side by side); metadata drift in header fields. | 2+ handover files = hit; 1 metadata drift = hit |
| Late memo creation | `S6` | The memo was created significantly after the work it documents started; early context is unrecorded, and the memo author's working memory acts as the sole source. | Creation timestamp > 1 revision cycle after work-start = hit |

### Overall verdict

| Finding | Action |
|---------|--------|
| 0 signals | No alarm. The document is treated as non-contaminated. |
| 1 signal (`S3` or `S4`) | Hint: a possible contamination signal was found — review the content. |
| 1 signal (`S1`, `S2`, `S5`, or `S6`) | Warning: a contamination hit (form break / compute shortcut / naming sprawl / late creation). The concrete location MUST be named with a re-verification proposal. |
| 2+ signals | Alarm: high probability of contaminated output. Re-verification of all claims against primary sources is mandatory. |

The detector MUST report only on findings — clean documents produce no noise. Consumers of the detector are the revision-2 check (a memo's first revision is scanned at revision 2) and the handover re-entry (Stage B reads `HANDOVER.md`).

When `S6` fires, a contamination marker MUST be added to the memo's `Contamination-Self-Assessment` field, and all claims in the memo MUST be re-verified against primary sources at the next revision.

---

## The Empty-Context Rule

When work spans more than one session, or when a context is detected as full or contaminated, the system MUST move to a fresh (empty) context rather than continuing on the degraded one.

- An evaluator (PRD evaluator, phase evaluator) MUST run in a fresh context with no carry-over from the implementation process. It receives only the artifact under review (the PRD document plus the produced files), never the conversation that produced them. See [13-orchestration.md](/specification/orchestration/).
- When `memo-init` is invoked on an already-full context, prior knowledge MUST be carried only as an explicit assumption marked for re-verification, and a reset SHOULD be recommended; alternatively a handover (Stage A) is appropriate.
- The AI cannot execute the context reset itself. The reset recommendation is a **user action** — the system emits the recommendation, the user performs it.

This rule is the structural reason evaluators are the first candidates to become repo-scoped agents with isolated context (see [14-agents-skills-tasks.md](/specification/agents-skills-tasks/)).

The append-only revision structure ([07-revisions-and-questions.md](/specification/revisions-and-questions/)) is what makes a fresh-context rewrite of a contaminated memo possible in practice. Because every prior `REV-XX.md` still exists on disk, a clean context can read the full history, separate the sound states from the contaminated ones, and author a complete clean revision — rather than being stranded with a single mutated file that carries the rot and has no earlier state to recover. Append-only is, in that sense, the rescue infrastructure for contamination.

---

## Memo Provenance — the Initiator field

A memo's first revision carries provenance metadata so a later analysis can tell **who initiated the memo**. Alongside the context-rot fields (transcript-input, creation-context, session-phase, session-id), the first revision MUST carry an **`Initiator`** field with one of two values:

| Value | Meaning |
|-------|---------|
| `user` | The default. The memo was initiated by the developer (spoken or typed input). |
| `llm` | The memo was machine-initiated — distilled from a goal evaluation by the optimization path (`memo goal optimize <Gid>`, see [31-goals.md](/specification/goals/)). |

The reason is **analytics provenance, not debugging**: a later evaluation MUST be able to separate machine-generated data (`llm`) from genuine user data (`user`), otherwise the statistics mix synthetic and real signals and become misleading. The field is **orthogonal** to transcript-input (input *form* vs. acting *instance*) and introduces **no new transcript type** — both paths reuse the same memo-init mechanics. The `llm` value is set internally by the `optimize` entry point; a memo created any other way stays `user`.

---

## HANDOVER.md — In-Session Memo Handover

When a session must be handed over (overflow, drifting assumptions, scope change), the handover artifact is a single file named `HANDOVER.md`. This is the only valid name. Variant names (`RE-ENTRY.md`, `PAUSE-STATUS.md`, `HANDOVER.md` duplicates, any other) are forbidden as output names — naming sprawl is itself signal `S5`.

The file lives in the memo directory: `.memo/{NNN}-{slug}/HANDOVER.md` (not in `rollout/`).

### Mandatory header

A `HANDOVER.md` MUST contain all six header fields:

| Field | Source |
|-------|--------|
| `Session-ID` | The session identifier (environment variable) |
| `Transcript-Path` | The deterministic transcript path for the session |
| `Context-Fill` | A proxy assessment (empty / medium / full) plus byte and message count; exact percentage is not required |
| `Reason` | Overflow / assumption error / discussion needed |
| `Contamination-Self-Assessment` | The Stage-A author explicitly names the likely mis-weighted spots |
| `Created` | Timestamp |

The header MUST include a note to the successor that the file was written from a possibly contaminated context, that all statements are hypotheses, and that primary sources beat the handover.

### Three zones (strictly separated)

The three zones MUST be kept strictly apart — mixing them is the actual contamination channel.

**Zone 1 — Facts with evidence pointer.** Every statement MUST carry a concrete pointer (file path, commit hash, issue number) in the form "state X, evidenced by file/commit/issue Y". Evaluation numbers are allowed only when the data basis is named. Each verified statement carries a `[FACT]` tag.

**Zone 2 — Explicit assumptions and open questions.** Every statement carries an `[ASSUMPTION]` tag. Open questions are a numbered list. This zone MUST NOT be mixed into Zone 1. Recommendations and suggestions belong here, never in Zone 1.

**Zone 3 — Primary-source references.** A list of files, commits, and issues the successor MUST check themselves, in the form "path/commit/issue — what to check there". There MUST be at least one entry per Zone-1 statement. Rollout state files are listed explicitly, distinguishing the generate state from the execute state.

### Re-entry discipline (fresh context)

The re-entry into a new session reads `HANDOVER.md` as **hypotheses, not state**. Every action-guiding claim is marked `[to be verified]` until a primary source confirms it; on confirmation it becomes `[verified: {source}]`, on contradiction `[refuted: {primary source} shows {reality}]`. The state-type separation is critical: a generate-state marked "completed" MUST NOT be passed on as "work finished" (that is contamination). See [13-orchestration.md](/specification/orchestration/) and the state-recovery model.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [07-revisions-and-questions.md](/specification/revisions-and-questions/) — the append-only revision structure that is the rescue infrastructure for a contaminated memo.
- [10-proactive-research.md](/specification/proactive-research/) — proactive research in early revisions, the natural producer of `context/` material the handover points at.
- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — the evidence levels (`[FACT]` … `[UNKNOWN]`) the handover zones reuse.
- [13-orchestration.md](/specification/orchestration/) — state files, crash recovery, and the fresh-context evaluator that consumes the empty-context rule.
- [30-primitives.md](/specification/primitives/) — the central glossary, including the context-rot vs contamination distinction defined inline above (the cause vs the effect).
