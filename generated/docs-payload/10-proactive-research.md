---
title: "Proactive Research"
description: "This chapter is **normative** for when proactive research is mandatory, where large research output is stored, and how research effort tapers across revisions. Examples are **informative**."
spec_version: "0.1.0"
spec_file: "10-proactive-research.md"
order: 10
section: "Specification"
normative: true
generated_at: "2026-06-12T00:37:30.245Z"
generated_from: "spec/v0.1.0/10-proactive-research.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/10-proactive-research.md."
---


> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](/specification/overview/) (Conformance Language). RFC 2119 / BCP 14 keywords are used.

This chapter is **normative** for when proactive research is mandatory, where large research output is stored, and how research effort tapers across revisions. Examples are **informative**.

---

## Purpose

A memo is a planning artifact, and planning is the most important part of agile engineering. A plan built on unverified assumptions inherits every error those assumptions carry. Proactive research front-loads verification: instead of writing assumptions and discovering later that they were wrong, the system researches the open points early, while the cost of a course correction is still low.

Research is also the last step of the input pipeline (see [04-input-pipeline.md](/specification/input-pipeline/)): after completeness, transcription-error scan, topic extraction, and context preservation, the pipeline derives research topics. This chapter governs how that research is conducted across a memo's revision lifecycle.

---

## Mandatory in Revisions 1 and 2

Proactive research **MUST** be performed in revisions 1 and 2 of every memo that contains assumptions, architecture decisions, or claims about existing code.

- In revision 1, the AI MUST research the topics derived by the input pipeline before committing claims to the memo. Statements that cannot be verified MUST be tagged at the appropriate evidence level (`[ANNAHME]`, `[VERMUTUNG]`, `[UNBEKANNT]`) rather than presented as fact. See the evidence levels in [11-quality-and-finalization.md](/specification/quality-and-finalization/).
- In revision 2, the AI MUST close the highest-value open research points derived from the user's feedback on revision 1. Revision 2 is also the point at which the contamination detector scans revision 1 (see [09-contamination-context-handover.md](/specification/contamination-context-handover/)).
- Research SHOULD be conducted in subagents with empty context when the volume is large, so that the main memo context is not polluted by raw research material.

A memo that reaches finalization with a `[Research offen]` (research open) tag still present MUST NOT pass the finalization gate (see [11-quality-and-finalization.md](/specification/quality-and-finalization/)).

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
- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — the evidence levels research output is tagged with, and the `[Research offen]` finalization gate.
- [00-overview.md](/specification/overview/) — conformance language.
