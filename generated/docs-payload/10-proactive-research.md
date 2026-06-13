---
title: "Proactive Research"
description: "A memo is a planning artifact, and planning is the most important part of agile engineering. A plan built on unverified assumptions inherits every error those assumptions carry. Proactive research..."
spec_version: "0.1.0"
spec_file: "10-proactive-research.md"
order: 10
section: "Specification"
normative: true
generated_at: "2026-06-13T16:57:06.087Z"
generated_from: "spec/v0.1.0/10-proactive-research.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/10-proactive-research.md."
---


A memo is a planning artifact, and planning is the most important part of agile engineering. A plan built on unverified assumptions inherits every error those assumptions carry. Proactive research front-loads verification: instead of writing assumptions and discovering later that they were wrong, the system researches the open points early, while the cost of a course correction is still low.

**Research** in the memo context means any deliberate information-gathering act — web searches, codebase reads, documentation scrapes, claim checks, or Sub-Agent delegations — whose output is used to replace an `[ASSUMPTION]`, `[CONJECTURE]`, or `[UNKNOWN]` tag with a verified fact or a well-bounded `[DERIVED]` finding. Research is not commentary or reformulation; it produces a traceable artifact (a file, a citation, or a quoted passage) that can be reviewed.

Research is also the last step of the input pipeline (see [04-input-pipeline.md](/specification/input-pipeline/)): after completeness, transcription-error scan, topic extraction, and context preservation, the pipeline derives research topics. This chapter governs how that research is conducted across a memo's revision lifecycle.

---

## Mandatory in Revisions 1 and 2

Proactive research **MUST** be performed in revisions 1 and 2 of every memo that contains assumptions, architecture decisions, or claims about existing code. Revisions 1 and 2 are the highest-value research window: the AI MUST apply its strongest reasoning model and deepest research effort here, before the factual basis is considered established.

- In revision 1, the AI MUST research the topics derived by the input pipeline before committing claims to the memo. Statements that cannot be verified MUST be tagged at the appropriate evidence level (`[ASSUMPTION]`, `[CONJECTURE]`, `[UNKNOWN]`) rather than presented as fact. See the evidence levels in [11-quality-and-finalization.md](/specification/quality-and-finalization/).
- **Revision 1 opinion constraint (MUST):** In revision 1, the AI MUST NOT express opinions, preferences, or prioritization. The AI's role in revision 1 is limited to stating facts, naming problems, and tagging uncertainty. Prioritization and opinions are the user's domain in revision 1. The AI MAY offer analysis and recommendations starting from revision 2, after the user has provided feedback on revision 1.
- At memo initialization, the AI MUST perform a contamination check before writing revision 1: if the triggering input (voice memo, pasted text, linked file) already contains conclusions, recommendations, or a prioritized plan, the AI MUST surface this as a potential contamination risk. The contamination check at revision 2 is separate (see [09-contamination-context-handover.md](/specification/contamination-context-handover/)).
- In revision 2, the AI MUST close the highest-value open research points derived from the user's feedback on revision 1. Revision 2 is also the point at which the contamination detector scans revision 1 (see [09-contamination-context-handover.md](/specification/contamination-context-handover/)).
- Research SHOULD be conducted in Sub-Agents with empty context when the volume is large, so that the main memo context is not polluted by raw research material.

A memo that reaches finalization with a `[Research open]` tag still present MUST NOT pass the finalization gate (see [11-quality-and-finalization.md](/specification/quality-and-finalization/)).

---

## Sub-Agent Research: Spawning and Lifecycle

When research volume is large or when topic isolation is required, research MUST be delegated to a Sub-Agent. Sub-Agents run with a fresh, empty context — they carry none of the main memo's accumulated state.

**Spawning mechanism:**

1. The Prompt-Generator initializes the Sub-Agent: it produces a self-contained prompt that includes the research question, required constraints (tool access, output format, scope boundaries), and the target `context/` file path for depositing results.
2. The Sub-Agent is launched with an empty context. It MUST NOT receive the full memo revision body; it receives only the scoped prompt produced by the Prompt-Generator.
3. On completion, the Sub-Agent writes its output as a file into the memo's `context/` folder (see storage rules below). It MUST NOT return raw results inline into the main context.
4. The Sub-Agent's lifecycle ends when the file is written. The main agent resumes by reading the pointer, not by inheriting the Sub-Agent's context chain.

**Prompt-Generator integration:** A Sub-Agent that is initialized without a scoped prompt inherits the caller's framing and prior conversation bias, which defeats the isolation goal. The Prompt-Generator is the mandatory initialization step for every Sub-Agent research delegation. If the Prompt-Generator is unavailable, the spawning agent MUST write an explicit scoped prompt before delegating.

**Context isolation rule:** Sub-Agents MUST have restricted tool access scoped to the research task. A Sub-Agent performing a web search MUST NOT have write access to the memo's revision files.

---

## Large Research Goes to `context/`

When research produces a substantial body of material — synthesis documents, scraped documentation, claim checks, blueprints — that material MUST be stored as a separate file in the memo's `context/` folder, not inlined into the revision body.

```
.memo/{NNN}-{slug}/
  context/
    research-synthese.md         <- large research output, referenced by the memo
    research-synthese-rev02.md
  revisions/
    REV-01.md                    <- references context/ files, does not inline them
```

- The revision body MUST reference the `context/` file rather than re-narrating its conclusions. This keeps the revision a pointer to primary material instead of a contamination surface (the same pointer principle that governs `HANDOVER.md`).
- **NO-OVERWRITE rule:** When a Sub-Agent or a research step produces a new version of a previously deposited file, it MUST write a new file with a revision suffix (e.g., `research-synthese-rev02.md`). Existing `context/` files MUST NOT be overwritten. This preserves the evidence chain across revisions.
- **Pointer-not-duplicate rule:** The same research result MUST NOT appear both in `context/` and inlined in a revision body. One authoritative copy lives in `context/`; revisions reference it by relative path.
- `context/` files are ancillary files of the memo and MUST be listed in the memo's `## Ancillary Files` section with a relative path.
- `context/` research material is a primary source for the rollout: the rollout entry points (see [13-orchestration.md](/specification/orchestration/)) read it as the verified factual basis when starting from an empty context.

---

## Taper From Revision 3 Onward

From revision 3 on, proactive research effort **SHOULD** taper. By that point the memo's factual basis is established, the open questions are answered, and further revisions are about refinement, balance, and coherence rather than new discovery.

| Revision | Research posture |
|----------|------------------|
| Rev 1 | Mandatory — research the pipeline-derived topics; tag what cannot be verified |
| Rev 2 | Mandatory — close the high-value open points from feedback; run the contamination detector on Rev 1 |
| Rev 3+ | Tapered — research only on demand, when a new assumption is introduced or a reviewer flags a gap |

Tapering is a `SHOULD`, not a `MUST`: a late-introduced assumption or a coherence finding MAY legitimately reopen a research thread in a later revision. The intent is to avoid endless re-research of a settled basis, not to forbid verification when it is genuinely needed.

---

## Related

- [04-input-pipeline.md](/specification/input-pipeline/) — the five-step pipeline whose final step derives the research topics this chapter consumes.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — the pointer principle (`context/` reference over re-narration) and the revision-2 contamination scan.
- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — the evidence levels research output is tagged with, and the `[Research open]` finalization gate.
- [00-overview.md](/specification/overview/) — conformance language.
