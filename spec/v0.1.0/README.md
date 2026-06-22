# memo-init Specification — v0.1.0 (Draft)

This directory holds version `v0.1.0` of the memo-init specification, an RFC-style description of the memo system: a planning-first scaffold that turns long, dictated transcripts into discrete, executable work orders and governs the human-AI interaction around them.

This specification documents the system as a normative, RFC-style description: the text is binding for conforming implementations.

The entry point is [00-overview.md](./00-overview.md), which also carries the normative **Conformance** block (BCP 14 / RFC 2119 / RFC 8174) that governs the MUST / SHOULD / MAY keywords used throughout.

---

## Core Chapters (00–39)

| Document | Title | Mode |
|----------|-------|------|
| [00-overview.md](./00-overview.md) | Overview | Informative |
| [01-philosophy.md](./01-philosophy.md) | Guardrail Philosophy & Interaction Model | Informative |
| [02-memo-sop-entrypoint.md](./02-memo-sop-entrypoint.md) | Memo-SOP as the Canonical Entry Point | Normative |
| [03-input-paths.md](./03-input-paths.md) | Input Paths — Four Transcript Types | Normative |
| [04-input-pipeline.md](./04-input-pipeline.md) | The Five-Step Input Pipeline | Normative |
| [05-memo-strategies.md](./05-memo-strategies.md) | Memo Strategies (Workflow Shape) | Normative |
| [06-memo-structure.md](./06-memo-structure.md) | Memo Structure & Local Guarantee | Normative |
| [07-revisions-and-questions.md](./07-revisions-and-questions.md) | Revisions & the Question Format | Normative |
| [08-phases-and-prds.md](./08-phases-and-prds.md) | Phases, PRDs & the Dependency Tree | Normative |
| [09-contamination-context-handover.md](./09-contamination-context-handover.md) | Contamination, Empty Context & Handover | Normative |
| [10-proactive-research.md](./10-proactive-research.md) | Proactive Research | Normative |
| [11-quality-and-finalization.md](./11-quality-and-finalization.md) | Quality Gates & Finalization | Normative |
| [12-rollout.md](./12-rollout.md) | Rollout — Generate / Execute / Evaluate | Normative |
| [13-orchestration.md](./13-orchestration.md) | Orchestration, State & Recovery | Normative |
| [14-agents-skills-tasks.md](./14-agents-skills-tasks.md) | Agents, Skills & Tasks | Normative |
| [15-prompt-generator.md](./15-prompt-generator.md) | Prompt Generator | Normative |
| [16-git-security-versioning.md](./16-git-security-versioning.md) | Security, Git Flow & Versioning | Normative |
| [17-git-workflow-and-ids.md](./17-git-workflow-and-ids.md) | Git Workflow & Memo IDs | Normative |
| [18-multidimensionality.md](./18-multidimensionality.md) | Multidimensionality — One Memo, Many Repos | Normative |
| [19-internal-vs-external-communication.md](./19-internal-vs-external-communication.md) | Internal vs. External Communication | Normative |
| [20-flow-full-vs-update-revisions.md](./20-flow-full-vs-update-revisions.md) | Flow — Full vs. Update Revisions | Normative |
| [21-human-computer-interaction.md](./21-human-computer-interaction.md) | Human-Computer Interaction | Normative |
| [22-tree-cli-recommended-way.md](./22-tree-cli-recommended-way.md) | Recommended Way — Self-Describing Command Tree | Normative |
| [23-requirements.md](./23-requirements.md) | Requirements | Normative |
| [24-tools-registry.md](./24-tools-registry.md) | Tools Registry | Normative |
| [25-strands.md](./25-strands.md) | Strands | Normative |
| [26-memo-history.md](./26-memo-history.md) | Memo History | Normative |
| [27-landing-the-plane.md](./27-landing-the-plane.md) | Landing the Plane | Normative |
| [28-drift.md](./28-drift.md) | Drift | Normative |
| [29-behavioral-guardrails.md](./29-behavioral-guardrails.md) | Behavioral Guardrails | Normative |
| [30-primitives.md](./30-primitives.md) | Primitives | Normative |
| [31-goals.md](./31-goals.md) | Goals | Normative |
| [32-prompt-governance.md](./32-prompt-governance.md) | Prompt Governance | Normative |
| [33-maintenance.md](./33-maintenance.md) | Maintenance | Normative |
| [34-question-interface.md](./34-question-interface.md) | Question Interface | Normative |
| [35-memo-authoring.md](./35-memo-authoring.md) | Memo Authoring | Normative |
| [36-agent-research-strategies.md](./36-agent-research-strategies.md) | Agent and Research Strategies | Normative |
| [37-transcript-reliability.md](./37-transcript-reliability.md) | Transcript Reliability | Normative |
| [38-stage-model.md](./38-stage-model.md) | Stage Model | Normative |
| [39-release-and-pinning.md](./39-release-and-pinning.md) | Release and Pinning | Normative |

> Chapters 09–39 are authored alongside chapters 00–08; they are listed here by their canonical filenames so the index is complete. Each chapter carries the same header table (Status / Depends on / Related) and a `## Related` footer. Chapter 30 is the cross-cutting substrate page: it defines the ten primitives, the central glossary, and the concept map; new readers MAY read it first as a vocabulary, and authors return to it as the single source of truth for terms. Chapter 33 is the cross-cutting maintenance roof: it measures freshness and blast-radius across the primitives without adding an eleventh.

---

## Recommended Reading Order

For a first read, follow the numeric order — the chapters are arranged so each builds on the previous:

1. **Foundation** — [00-overview.md](./00-overview.md), [01-philosophy.md](./01-philosophy.md), [02-memo-sop-entrypoint.md](./02-memo-sop-entrypoint.md). Why the system exists, the guardrail philosophy, and the canonical entry point.
2. **Input** — [03-input-paths.md](./03-input-paths.md), [04-input-pipeline.md](./04-input-pipeline.md). The four transcript types and the mandatory five-step pipeline.
3. **The memo** — [05-memo-strategies.md](./05-memo-strategies.md), [06-memo-structure.md](./06-memo-structure.md), [07-revisions-and-questions.md](./07-revisions-and-questions.md). Strategy, on-disk structure, and the parse-critical question format.
4. **Decomposition** — [08-phases-and-prds.md](./08-phases-and-prds.md). Topics become PRDs and phases with a dependency tree.
5. **Hygiene & research** — [09-contamination-context-handover.md](./09-contamination-context-handover.md), [10-proactive-research.md](./10-proactive-research.md).
6. **Finalize & roll out** — [11-quality-and-finalization.md](./11-quality-and-finalization.md), [12-rollout.md](./12-rollout.md), [13-orchestration.md](./13-orchestration.md).
7. **Substrate** — [14-agents-skills-tasks.md](./14-agents-skills-tasks.md), [15-prompt-generator.md](./15-prompt-generator.md).
8. **Git & boundaries** — [16-git-security-versioning.md](./16-git-security-versioning.md), [17-git-workflow-and-ids.md](./17-git-workflow-and-ids.md), [18-multidimensionality.md](./18-multidimensionality.md), [19-internal-vs-external-communication.md](./19-internal-vs-external-communication.md).
9. **Diagrams & recommended CLI** — [20-flow-full-vs-update-revisions.md](./20-flow-full-vs-update-revisions.md), [21-human-computer-interaction.md](./21-human-computer-interaction.md), [22-tree-cli-recommended-way.md](./22-tree-cli-recommended-way.md). The flow and interaction diagrams and the self-describing command-tree CLI.
10. **Cross-cutting concerns & substrate** — [23-requirements.md](./23-requirements.md) (structured requirement capture and profiles), [24-tools-registry.md](./24-tools-registry.md) (per-memo tool inventory), [25-strands.md](./25-strands.md) (parallel work tracks within a memo), [26-memo-history.md](./26-memo-history.md) (audit trail and decision record), [27-landing-the-plane.md](./27-landing-the-plane.md) (graceful completion and handoff), [28-drift.md](./28-drift.md) (detecting and correcting specification drift), [29-behavioral-guardrails.md](./29-behavioral-guardrails.md) (runtime constraints on agent behavior), [30-primitives.md](./30-primitives.md) (the ten primitives, the central glossary, and the concept map — the cross-cutting substrate that ties the vocabulary together), [31-goals.md](./31-goals.md) (the goal as the triggering intent above a single memo), [32-prompt-governance.md](./32-prompt-governance.md) (the initial-prompt bottleneck as the governed default path, measured as a goal in a fresh context), [33-maintenance.md](./33-maintenance.md) (maintenance as the cross-cutting measuring roof — freshness and blast-radius across the primitives, a score not an eleventh primitive), [34-question-interface.md](./34-question-interface.md) (the machine-readable question interface), [35-memo-authoring.md](./35-memo-authoring.md) (authoring conventions for memos), [36-agent-research-strategies.md](./36-agent-research-strategies.md) (agent and research fan-out strategies), [37-transcript-reliability.md](./37-transcript-reliability.md) (transcript reliability and correction), [38-stage-model.md](./38-stage-model.md) (the four stages of the process end — rollout done ≠ memo done), [39-release-and-pinning.md](./39-release-and-pinning.md) (the two-stage release policy — SHA-pinned internal dependencies bumped through maintenance, formal Releases only for outward artefacts).

Readers who only need the rules of authoring a memo can read 03–08; readers building tooling against the system should additionally read 11–31. A reader who wants the vocabulary first MAY start with [30-primitives.md](./30-primitives.md).

---

## Workbench Sub-Spec

A separate, **independently versioned** `workbench/` sub-spec documents the project-level organization that sits above individual memos: project-versus-repo structure, the local guarantee, and the trash discipline. Requirements profiles, the tools registry, strands, and memo history have been promoted to top-level core chapters (23–26) and are no longer workbench-sub-spec content. The core chapters above describe the memo; the `workbench/` sub-spec describes the project structure the memo lives in.

See `workbench/00-overview.md` for the sub-spec entry point.
