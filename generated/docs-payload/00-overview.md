---
title: "Overview"
description: "This is the entry point for the memo-init specification, version `v0.1.0` (Draft). It defines what the memo system is, why it exists, the guardrail philosophy that underpins it, and an index of the..."
spec_version: "0.1.0"
spec_file: "00-overview.md"
order: 0
section: "Specification"
normative: false
generated_at: "2026-06-12T00:45:52.499Z"
generated_from: "spec/v0.1.0/00-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/00-overview.md."
---


> **Informative.** This document provides the conceptual foundation, mission, terminology, and document index. It is written in prose and does not itself carry normative requirements. The **Conformance** block below is normative for the whole specification.

This is the entry point for the memo-init specification, version `v0.1.0` (Draft). It defines what the memo system is, why it exists, the guardrail philosophy that underpins it, and an index of the chapters that make up the specification.

---

## Conformance

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in BCP 14 [RFC2119] [RFC8174] when, and only when, they appear in all capitals, as shown here.

Some chapters of this specification are intentionally written in prose without normative keywords because they describe philosophy, motivation, or conceptual background (this overview, `01-philosophy.md`). Such chapters are marked **Informative** near their top. All other chapters use normative language and assume this conformance interpretation; they are marked **Normative**.

References:

- [RFC2119](https://www.rfc-editor.org/rfc/rfc2119) — Key words for use in RFCs to Indicate Requirement Levels
- [RFC8174](https://www.rfc-editor.org/rfc/rfc8174) — Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words
- [BCP 14](https://www.rfc-editor.org/info/bcp14) — Best Current Practice 14 (combined RFC2119 + RFC8174)

---

## What memo-init Is

The memo system transforms long, unstructured input — typically dictated voice transcripts — into discrete, executable work orders, and governs the human-AI interaction that clarifies open questions **before** implementation begins. The developer plans; the AI implements autonomously and self-evaluating.

A **memo** is a versioned strategy document. It starts as a first revision, iterates through revisions until the developer finalizes it, and then drives a rollout that produces real artifacts (code, repositories, documentation). The memo is the single highest authority over its own rollout.

### Current state and target state

| | |
|---|---|
| **Current state** | The memo system exists as a tool collection in a workbench layer (`cli/memo-toolkit/`) plus a set of global rules. It is in daily productive use and has produced well over a hundred memos in real projects. It has no public home — no repository, no specification, no website. |
| **Target state** | A minimal, public organization that documents the system: a specification (this document), an org profile, a website, the memo viewer, a deterministic prompt generator, and a versioned skills/agents core. The result is understandable without knowing the author personally, modeled after an existing public reference organization. |

### Mission

Make planning-first agentic engineering reproducible. The memo system gives an AI a **scaffold** for turning long transcripts into dedicated work orders and describes the human-AI interaction for resolving open questions — before implementation is handed over to run as autonomously as possible.

### Motivation

Publishing this specification secures authorship of the underlying ideas and keeps the intellectual property documented in the open, independent of any individual employment context.

---

## System Facts

This specification documents the real system as it runs. The following facts anchor the chapters that follow:

| Aspect | Fact |
|--------|------|
| Input | 4 transcript types, including `plan-start` ([03-input-paths.md](/specification/input-paths/)) |
| Finalization | 9 finalization gates plus 5 quality skills ([11-quality-and-finalization.md](/specification/quality-and-finalization/)) |
| Evidence | 6 evidence levels |
| Pull requests | 1 PR per affected repository ([16-git-security-versioning.md](/specification/git-security-versioning/)) |
| Input pipeline | 5 distinct pipeline steps ([04-input-pipeline.md](/specification/input-pipeline/)) |
| Local guarantee | Structural — no git folder under `.memo/` ([06-memo-structure.md](/specification/memo-structure/)) |
| Public context | Public-context scoping in git security ([16-git-security-versioning.md](/specification/git-security-versioning/)) |

Where a chapter describes behavior that is planned but not yet built, this specification states it as **specified-but-not-yet-implemented**: the specification text is binding, but the corresponding live-code change in the toolkit skills is a separate, future task and is not part of this baseline.

---

## Guardrail Philosophy (Summary)

Planning is the most important activity in agentic engineering. The memo system exists to build **guardrails** — the metaphor is a highway: clear lanes that keep autonomous execution on the road. The memo-SOP (Standard Operating Procedure) defines those guardrails. The full treatment is in [01-philosophy.md](/specification/philosophy/); the canonical entry skill that explains the whole process is described in [02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/).

---

## Organization and Repository Fan-Out

The memo-init specification is induced (written up) from the local toolkit source and published across a small organization of repositories. The diagram below shows the organization, the repository fan-out, and the spec→site automation pipeline.

```mermaid
flowchart TD
    subgraph ORG["GitHub org: memo-init"]
        SPEC["spec\nRFC + workbench sub-spec"]
        GH[".github\norg profile"]
        SITE["memo-init.github.io\nAstro + Starlight"]
        VIEW["viewer\nmemo viewer"]
        PG["prompt-generator\ndeterministic start prompt"]
        CORE["core\nskills + agents"]
    end

    SPEC -->|"refs / docs-payload / manifest / llms.txt"| GEN["generated/*"]
    GEN -->|"dispatch: refs-updated"| GH
    GEN -->|"dispatch: spec-updated"| SITE
    SITE -->|"deploy.yml"| PAGES["GitHub Pages + /llms.txt"]
    SPEC -. dependency .-> VIEW
    PG -->|"deterministic start prompt"| AGENTS["AGENTS.md agents"]
    CORE -. provides agents + skills .-> AGENTS

    subgraph SRC["Spec source (local)"]
        TK["cli/memo-toolkit/\nskills + docs"]
    end
    TK -.induced into prose.-> SPEC
```

> Diagram orientation is `flowchart TD` (the default). The node meanings are given in the surrounding chapters of this specification.

The six repositories are bootstrapped from an existing public reference organization. Their roles:

| Repository | Role |
|------------|------|
| `spec` | This RFC-style specification plus the workbench sub-spec and the generators that publish it. |
| `.github` | Organization profile, generated via a badge-table tool. Must be named `.github`. |
| `memo-init.github.io` | Static website (Astro + Starlight) that serves the docs and `llms.txt`. |
| `viewer` | The memo viewer, extracted from the toolkit editor. Core-like: depends directly on the spec. |
| `prompt-generator` | The deterministic start-prompt compositor. |
| `core` | Skills (the base layer) and agents (evaluators first). |

---

## Document Index (v0.1.0 Core Chapters)

| Document | Title | Mode |
|----------|-------|------|
| `00-overview.md` | Overview | Informative |
| `01-philosophy.md` | Guardrail Philosophy & Interaction Model | Informative |
| `02-memo-sop-entrypoint.md` | Memo-SOP as the Canonical Entry Point | Normative |
| `03-input-paths.md` | Input Paths — Four Transcript Types | Normative |
| `04-input-pipeline.md` | The Five-Step Input Pipeline | Normative |
| `05-memo-strategies.md` | Memo Strategies (Workflow Shape) | Normative |
| `06-memo-structure.md` | Memo Structure & Local Guarantee | Normative |
| `07-revisions-and-questions.md` | Revisions & the Question Format | Normative |
| `08-phases-and-prds.md` | Phases, PRDs & the Dependency Tree | Normative |
| `09-contamination-context-handover.md` | Contamination, Empty Context & Handover | Normative |
| `10-proactive-research.md` | Proactive Research | Normative |
| `11-quality-and-finalization.md` | Quality Gates & Finalization | Normative |
| `12-rollout.md` | Rollout — Generate / Execute / Evaluate | Normative |
| `13-orchestration.md` | Orchestration, State & Recovery | Normative |
| `14-agents-skills-tasks.md` | Agents, Skills & Tasks | Normative |
| `15-prompt-generator.md` | Prompt Generator | Normative |
| `16-git-security-versioning.md` | Security, Git Flow & Versioning | Normative |
| `17-git-workflow-and-ids.md` | Git Workflow & Memo IDs | Normative |
| `18-multidimensionality.md` | Multidimensionality — One Memo, Many Repos | Normative |
| `19-internal-vs-external-communication.md` | Internal vs. External Communication | Normative |

A separate, independently versioned **workbench/** sub-spec documents the project-level organization (project structure, requirements profiles, tools registry, strands, wiki, trash). See [README.md](./README.md) for the full reading order and the pointer to the sub-spec.

---

## Related

- [01-philosophy.md](/specification/philosophy/) — the guardrail analogy and interaction model.
- [02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/) — the canonical entry skill.
- [08-phases-and-prds.md](/specification/phases-and-prds/) — how memos become phases and PRDs.
- [18-multidimensionality.md](/specification/multidimensionality/) — one memo coordinating many repos.
- [README.md](./README.md) — chapter index and reading order.
