---
title: "Input Pipeline"
description: "Before any memo is created or any revision written, every input passes through a fixed, strictly ordered processing pipeline. This chapter defines that five-step pipeline, the order it runs in, and..."
spec_version: "0.1.0"
spec_file: "04-input-pipeline.md"
order: 4
section: "Specification"
normative: true
generated_at: "2026-07-11T22:48:52.283Z"
generated_from: "memo/0.1.0/draft/spec/04-input-pipeline.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.1.0/draft/spec/04-input-pipeline.md."
---


Before any memo is created or any revision written, every input passes through a fixed, strictly ordered processing pipeline. This chapter defines that five-step pipeline, the order it runs in, and why no step may be skipped or run out of sequence.

## A Mandatory, Strictly Ordered Pipeline

Before any memo is created and before any revision is written, every input MUST pass through a five-step processing pipeline. The pipeline is mandatory and strictly sequential: no step may be skipped, and no step may begin before the previous step is complete. It runs both before `memo-init` and before every `memo-revision-generate`.

```
1. Completeness check         → ALL files read?
2. Transcription-error scan   → ALL errors corrected?
2b. Transcript-reliability    → reliability estimated (WARN), suspicions flagged?
3. Topic extraction           → ALL topics listed?
4. Context preservation       → ALL context documented?
5. Research                   → research-worthy topics derived, proactive research triggered?
   → ready for memo-init or memo-revision-generate
```

---

## Step 1 — Completeness Check

All linked files MUST be read in full **before** any response. When the input contains file paths, links, or references, an implementation MUST read all of them before any analysis, answer, or revision. If multiple files are sent, all of them MUST be loaded before processing begins.

This step exists because long dictated transcripts are easy to truncate: a developer saves a voice memo as a file and sends its path, and a partial read silently loses requirements. The completeness check is the first guardrail and admits no exception.

---

## Step 2 — Transcription-Error Scan

An implementation MUST proactively check the input against the known transcription-error pattern table and MUST report every detected correction to the developer before continuing — even for short inputs.

| Transcribed | Correct term |
|-------------|--------------|
| VIA | WIRE |
| PRD | PAD |
| Cloud | Claude |
| Excalithor | Excalidraw |
| Finanzierung | Finalisierung |
| Repair | Prepare |

The table is extensible; new patterns MAY be added over time. The requirement is that the scan always runs and that corrections are surfaced, not silently applied.

---

## Step 2b — Transcript-Reliability Estimate

Directly after the transcription-error scan and **before** topic extraction, an implementation SHOULD estimate the input's **transcript reliability** — a deterministic score that flags suspected machine artifacts so they are not extracted as topics. A transcript is raw machine output, and the transcription software sometimes *invents* text (provider sign-offs, copyright boilerplate) that no grammar check can catch; the estimate is the guardrail against an invented artifact becoming a real topic. It is specified in full in [37-transcript-reliability.md](/specification/transcript-reliability/); two rules bind here:

- **WARN, never block.** The estimate produces a reliability value, a confidence, and located findings (suspected boilerplate, unannounced novel names). It is **advisory**: a low score means "re-confirm these spots with the developer", never "discard the input". The developer, not the score, decides (memo authority).
- **The long initial transcript matters most.** The estimate runs for every transcript but is sharpest on the long `memo-init` transcript, where invented text has the most surface *and* cross-angle redundancy makes outliers detectable; for short `free`/`revision` inputs it reports low confidence rather than false alarms.

---

## Step 3 — Topic Extraction

Before any writing begins, an implementation MUST produce a **complete** list of all topics and points in the input. Every point counts; nothing is too small to omit. The topic list then serves as a checklist during writing. Writing MUST NOT begin until the topic list is complete and all transcription errors are resolved.

---

## Step 4 — Context Preservation

Context MUST NOT be dropped. Reasons and background explanations from the developer MUST be preserved in the memo. A finalized memo is a closed document: context that is omitted cannot be retrieved after the fact, and without it the agent must later interpret instead of know — which leads to errors. Redundancy in service of context preservation is acceptable.

Every memo MUST contain a dedicated **context area** (`## Context` or equivalent section). This area holds background, motivation, constraints, and design rationale that must not be scattered across other sections or omitted at finalization. The context area:

- MUST be populated during `memo-init` and updated during each revision.
- MUST capture the developer's stated reasons, not just the decision outcome.
- MAY contain references to linked files, prior decisions, or external sources.
- MUST NOT be merged into the requirements or implementation sections.

**Binding the initial transcript.** The initial transcript is the single richest context source a memo has — often a 20–60 minute dictated review carrying dozens of detailed instructions. `memo-init` MUST bind it to the memo immediately, by copying it into the memo folder under the canonical name `transcripts/memo-init-transcript.md` (NO-OVERWRITE — an existing bound transcript is never clobbered). A memo whose initial transcript is left only in the raw intake store is **orphaned**: every later evaluation (`memo-finalize`, the rollout's evaluate, every fidelity audit) then measures against the thinner revisions alone and silently loses whole blocks of intent. Because the binding is a deterministic file operation, an implementation SHOULD also surface it as an automatic step in the intake tooling (e.g. the memo-view init-transcript route auto-binds on a `memo-init`-typed transcript), not only as a manual skill step.

---

## Step 5 — Research

From the complete topic list (Step 3) and the preserved context (Step 4), an implementation MUST derive which topics are research-worthy — external sources, technical claims, architecture decisions, and codebase references that must be verified — and MUST trigger proactive research for them before handing over to `memo-init` or `memo-revision-generate`. A topic is skipped only if the developer has left a comment on that topic that deselects research for it. The canonical definition of research and the per-revision research duty are specified in [10-proactive-research.md](/specification/proactive-research/).

**Result storage.** Research results MUST be stored in the memo folder as a persistent knowledge base (e.g., `context/` subfolder or dedicated research files). Results are cumulative across revisions: a finding recorded in one revision MUST remain available to subsequent revisions and to downstream PRD generation. An implementation MUST NOT re-derive findings that are already stored.

**Sub-agent coordination.** When research is distributed across multiple sub-agents, the coordinating agent MUST assign non-overlapping topic scopes before dispatch. Sub-agents MUST record their findings and assumptions in the shared knowledge base before signaling completion. A sub-agent MUST NOT begin a topic that another agent has already claimed or completed. This requirement exists to prevent duplicated token expenditure across agent teams.

---

## Category Tags Appear Only in `memo-init`

Category tags (for example, `[Docs]`, `[Code]`, `[GitHub]`) classify entries by the skill family that produces them. They are applied **only** during `memo-init`, where each entry receives its tag. The input pipeline itself does not emit category tags; tagging is a property of memo creation, not of input processing.

---

## Deterministic Activation via the memo-view URL Header

When the input is a transcript-server URL of the form `http://localhost:3333/transcripts/{id}`, the pipeline is activated deterministically by the response's default header. The flow is:

1. **Fetch.** Read the transcript over HTTP. The content type MUST be `text/markdown` or `text/plain`; an unreachable server, a non-2xx status, or an unexpected content type is a hard error.
2. **Parse the default header.** The first line MUST match one of the four type headers ([03-input-paths.md](/specification/input-paths/)). A header that matches none is a hard error. A transcript whose schema marker is absent or unsupported is a hard error and is not processed; there is no auto-migration. A legacy *binding* (an older heading convention) is tolerated and merely marked, not rejected.
3. **Run the pipeline autonomously.** Once the header is parsed, the five steps run with no further developer prompt. The header **is** the activation.

The skill that performs this reads **only** — it never issues writes to the server. After the pipeline, the type-dependent follow-up ([03-input-paths.md](/specification/input-paths/)) runs, also without an intervening prompt. Only the URL mode runs fully autonomously; other input forms MAY still ask.

---

## Conformity Requirements

The input-pipeline rules above are authored **prose-first** as declarative requirements (the prose-first guard, [35-memo-authoring.md](/specification/memo-authoring/) and [23-requirements.md](/specification/requirements/)): each rule's `statement` faces generation and its `check` faces the finalization/push gate, resolving to a ternary `PASS` / `BLOCKED` / `INCONCLUSIVE`. The blocks below are the machine-readable source the requirement store is **harvested** from. The selective lift here is the rules that check a real artifact — a bound file, a persisted knowledge base — not the behavioral steps that leave no inspectable trace.

Binding the initial transcript is a hard yes/no condition over a concrete file, so its `grade` is `binary`:

```requirement
{
  "id": "REQ-805",
  "title": "Initial transcript bound to the memo at the canonical path",
  "statement": "`memo-init` MUST bind the initial dictated transcript to the memo by copying it into the memo folder under the canonical name `transcripts/memo-init-transcript.md`, NO-OVERWRITE — an existing bound transcript is never clobbered. A memo whose initial transcript is left only in the raw intake store is orphaned: every later evaluation then measures against the thinner revisions alone and silently loses whole blocks of intent.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["input-pipeline", "transcript-binding"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The memo folder contains transcripts/memo-init-transcript.md after a memo-init transcript is processed",
      "Binding does not overwrite an existing bound transcript"
    ]
  },
  "grade": "binary"
}
```

Research-result persistence is checked against the stored knowledge base; the rule is hard, so its `grade` is `binary`:

```requirement
{
  "id": "REQ-806",
  "title": "Research results stored as a persistent, cumulative knowledge base",
  "statement": "Proactive-research results MUST be stored inside the memo folder as a persistent knowledge base (for example a `context/` subfolder or dedicated research files) and MUST be cumulative across revisions: a finding recorded in one revision remains available to later revisions and to downstream PRD generation, and an implementation MUST NOT re-derive findings that are already stored.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["input-pipeline", "research"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Research findings are persisted as files inside the memo folder, not left only in working context",
      "Findings recorded in an earlier revision remain readable to a later revision rather than being re-derived"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [03-input-paths.md](/specification/input-paths/) — the four transcript types and their follow-up flows.
- [37-transcript-reliability.md](/specification/transcript-reliability/) — the Step 2b reliability estimate, the raw-transcript interpretation rule, and the dictionary in full.
- [10-proactive-research.md](/specification/proactive-research/) — the canonical research definition behind Step 5.
- [05-memo-strategies.md](/specification/memo-strategies/) — the strategy chosen when the pipeline hands over to `memo-init`.
- [30-primitives.md](/specification/primitives/) — central glossary and concept map; the topic primitive defined as the head of the executable chain.
