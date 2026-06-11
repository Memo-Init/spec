---
title: "The Five-Step Input Pipeline"
description: "Before any memo is created and before any revision is written, every input MUST pass through a five-step processing pipeline. The pipeline is mandatory and strictly sequential: no step may be..."
spec_version: "0.1.0"
spec_file: "04-input-pipeline.md"
order: 4
section: "Specification"
normative: true
generated_at: "2026-06-11T17:49:04.330Z"
generated_from: "spec/v0.1.0/04-input-pipeline.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/04-input-pipeline.md."
---


> **Normative.** Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](/specification/overview/) (Conformance).

---

## A Mandatory, Strictly Ordered Pipeline

Before any memo is created and before any revision is written, every input MUST pass through a five-step processing pipeline. The pipeline is mandatory and strictly sequential: no step may be skipped, and no step may begin before the previous step is complete. It runs both before `memo-init` and before every `memo-revision-generate`.

```
1. Completeness check        → ALL files read?
2. Transcription-error scan  → ALL errors corrected?
3. Topic extraction          → ALL topics listed?
4. Context preservation      → ALL context documented?
5. Research                  → research-worthy topics derived, proactive research triggered?
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

## Step 3 — Topic Extraction

Before any writing begins, an implementation MUST produce a **complete** list of all topics and points in the input. Every point counts; nothing is too small to omit. The topic list then serves as a checklist during writing. Writing MUST NOT begin until the topic list is complete and all transcription errors are resolved.

---

## Step 4 — Context Preservation

Context MUST NOT be dropped. Reasons and background explanations from the developer MUST be preserved in the memo. A finalized memo is a closed document: context that is omitted cannot be retrieved after the fact, and without it the agent must later interpret instead of know — which leads to errors. Redundancy in service of context preservation is acceptable.

---

## Step 5 — Research

From the complete topic list (Step 3) and the preserved context (Step 4), an implementation MUST derive which topics are research-worthy — external sources, technical claims, architecture decisions, and codebase references that must be verified — and MUST trigger proactive research for them before handing over to `memo-init` or `memo-revision-generate`. A topic is skipped only if the developer has left a comment on that topic that deselects research for it. The canonical definition of research and the per-revision research duty are specified in [10-proactive-research.md](/specification/proactive-research/).

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

## Related

- [03-input-paths.md](/specification/input-paths/) — the four transcript types and their follow-up flows.
- [10-proactive-research.md](/specification/proactive-research/) — the canonical research definition behind Step 5.
- [05-memo-strategies.md](/specification/memo-strategies/) — the strategy chosen when the pipeline hands over to `memo-init`.
