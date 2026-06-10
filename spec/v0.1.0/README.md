# memo-init Specification — v0.1.0 (Draft)

This directory holds version `v0.1.0` of the memo-init specification, an RFC-style description of the memo system: a planning-first scaffold that turns long, dictated transcripts into discrete, executable work orders and governs the human-AI interaction around them.

This specification documents the **real, verified** system. Where a chapter describes behavior that the source memo flags as follow-up work, the chapter states it as specified-but-not-yet-implemented: the text is binding, the corresponding live-code change is a separate future task.

The entry point is [00-overview.md](./00-overview.md), which also carries the normative **Conformance** block (BCP 14 / RFC 2119 / RFC 8174) that governs the MUST / SHOULD / MAY keywords used throughout.

---

## Core Chapters (00–18)

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

> Chapters 09–18 are authored alongside chapters 00–08; they are listed here by their canonical filenames so the index is complete. Each chapter carries the same header table (Status / Depends on / Related) and a `## Related` footer.

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
8. **Git & boundaries** — [16-git-security-versioning.md](./16-git-security-versioning.md), [17-git-workflow-and-ids.md](./17-git-workflow-and-ids.md), [18-multidimensionality.md](./18-multidimensionality.md).

Readers who only need the rules of authoring a memo can read 03–08; readers building tooling against the system should additionally read 11–17.

---

## Workbench Sub-Spec

A separate, **independently versioned** `workbench/` sub-spec documents the project-level organization that sits above individual memos: project-versus-repo structure and the local guarantee, requirements profiles (`.memo/requirements/`), the tools registry (`.memo/tools/`), per-memo strands, the two wiki types, and the trash discipline. The core chapters above describe the memo; the `workbench/` sub-spec describes the project the memo lives in.

See `workbench/00-overview.md` for the sub-spec entry point.
