---
title: "Human-Computer Interaction"
description: "This chapter is **normative** for the human-computer interaction model: where the user interacts, where Claude works autonomously, and the **finalization blocker** that keeps the gate closed while..."
spec_version: "0.1.0"
spec_file: "21-human-computer-interaction.md"
order: 21
section: "Specification"
normative: true
generated_at: "2026-06-12T20:53:10.474Z"
generated_from: "spec/v0.1.0/21-human-computer-interaction.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/21-human-computer-interaction.md."
---


> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](/specification/overview/) (Conformance Language). RFC 2119 / BCP 14 keywords are used.

This chapter is **normative** for the human-computer interaction model: where the user interacts, where Claude works autonomously, and the **finalization blocker** that keeps the gate closed while any question is open. The diagram is the canonical reference.

---

## Purpose

The interaction model fixes the **two points** where the user touches the system — input and feedback/finalization — and the autonomous span in between. Before finalization, the user's judgement steers the memo: input, feedback, answering questions. After the finalization gate, the rollout runs autonomously to completion. The model also fixes the hard rule that closes the gate: **as long as any question is open, finalization is blocked.**

---

## The Interaction Diagram

The following flowchart is the canonical reference for the interaction model. It is reproduced verbatim from the source memo (Memo 004, Kap 7), including the `:::` class assignments and the `classDef` lines.

```mermaid
flowchart TD
    U1[User: Sprache/Text-Input - oft Transcript-URL]:::user --> C1[Claude: memo-input-processing 5 Schritte]:::ai
    C1 --> D1{Memo existiert?}:::gate
    D1 -->|nein| C2[Claude: memo-init - REV-01 Full + Research]:::ai
    D1 -->|ja| C3[Claude: revision-generate - prepare + Research]:::ai
    C2 --> P1[Claude präsentiert Full-Revision]:::ai
    C3 --> C4[revision-execute: REV-XX]:::ai
    C4 --> C5[revision-evaluate: Auto-Check]:::ai
    C5 --> P1
    P1 --> U2{User: Feedback oder Fragen im Viewer beantworten}:::user
    U2 -->|weiteres Feedback| C3
    U2 -->|will finalisieren| Q{BLOCKER: ALLE Fragen beantwortet?}:::gate
    Q -->|nein - offene Fragen| U2
    Q -->|ja| G1[memo-finalize: Gate - User bestätigt]:::gate
    G1 --> B1[BREAK - Sorgfaltspflichtvertrag]:::gate
    B1 --> C6[Claude autonom: Rollout Generate-Execute-Evaluate]:::ai
    C6 --> U3[User: Ergebnis reviewen]:::user
    classDef user fill:#cfe2ff,stroke:#084298
    classDef ai fill:#d1e7dd,stroke:#0f5132
    classDef gate fill:#fff3cd,stroke:#664d03
```

---

## Where the User Interacts

User interaction has exactly two points: **input** at the start, and **feedback/finalization** during the revision loop. Everything between is autonomous.

- **Input** — the user supplies a voice or text input (often a transcript URL). Claude runs `memo-input-processing` and, depending on whether a memo already exists, either initializes it or generates the next revision.
- **Feedback / finalization** — the user reads the presented Full revision in the viewer, gives further feedback (which loops back into a new revision), or answers open questions, and finally decides to finalize.

Only **Full** revisions are presented to the user (see [20-flow-full-vs-update-revisions.md](/specification/flow-full-vs-update-revisions/)). Between the two interaction points, Claude works autonomously: input processing, research, revision generation, execution, and the auto-check.

---

## The Finalization Blocker — Normative

The finalization gate is guarded by a hard blocker on open questions.

> Finalization MUST be refused while **any** question is open. The gate MUST open only once **all** questions are answered. An implementation MUST NOT allow `memo-finalize` to proceed while one or more open questions remain.

In the diagram this is the `Q{BLOCKER: ALLE Fragen beantwortet?}` node: when questions remain open (`nein - offene Fragen`) control returns to the user to answer them; only on `ja` does control pass to the finalization gate, where the user confirms.

After confirmation, the `BREAK - Sorgfaltspflichtvertrag` (duty-of-care contract) is shown, and from there the rollout (Generate → Execute → Evaluate) runs **autonomously, without further questions** (see [12-rollout.md](/specification/rollout/)). The user's next interaction is only to review the result.

---

## Related

- [20-flow-full-vs-update-revisions.md](/specification/flow-full-vs-update-revisions/) — the Full/Update revision flow that this interaction model wraps.
- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — the finalization gate and quality checks the blocker guards.
- [00-overview.md](/specification/overview/) — conformance language.
