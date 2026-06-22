---
title: "Tools Registry"
description: "A memo lists the phases and PRDs it will execute, but the tools those phases assume are easy to leave implicit. They live in the author's memory and in the wider skill catalog, never written down..."
spec_version: "0.1.0"
spec_file: "24-tools-registry.md"
order: 24
section: "Specification"
normative: true
generated_at: "2026-06-22T01:11:01.570Z"
generated_from: "spec/v0.1.0/24-tools-registry.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/24-tools-registry.md."
---


A memo lists the phases and PRDs it will execute, but the tools those phases assume are easy to leave implicit. They live in the author's memory and in the wider skill catalog, never written down beside the work that depends on them. When a rollout begins, a missing or unreachable tool then surfaces late — mid-execution — rather than at planning time when it is cheap to address. The tools registry closes that gap: it is a per-project record of which tools each phase or work-package needs, so tool reachability becomes a planning-time concern instead of a runtime surprise.

A project **MAY** maintain a tools registry under `.memo/tools/`. The registry describes the available tools — their names, what they do, and what a memo needs to know to decide whether a phase depends on them. It is a descriptive index, not a runtime: it records *that* a tool exists and *what* it is for, so an author can consult it while planning. The registry sits as data under `.memo/`, a sibling of the memos themselves.

The registry is a **RECOMMENDATION**. A project **SHOULD** maintain it because it improves planning, but a project **MAY** omit it, and a memo **MUST NOT** be blocked solely because no registry is present. This is the deliberate difference from the requirements profiles of [23-requirements.md](/specification/requirements/), which are enforced at finalization: the registry aids planning but does not gate it.

## Registry Entries

A registry entry is a short, stable descriptor — never a copy of the tool. It records a reference and a description so that, when the underlying tool changes, the descriptor is updated rather than a duplicated body drifting out of sync. The registry **MUST NOT** contain copies of skills, skill bodies, or tool source; that content already has a single source of truth, and embedding it would create a second, drifting copy.

A typical entry carries these fields:

| Field | Meaning |
|-------|---------|
| `id` | Stable identifier for the tool within the registry. |
| `name` | Human-readable tool name. |
| `purpose` | One line describing what the tool is for. |
| `location` | Where the tool actually lives (the single source of truth). |
| `inputs` | What the tool needs to run, at the level a planner must know. |
| `reachable` | Whether the tool currently resolves and can be invoked. |

A concrete entry:

```json
{
  "id": "tool-playwright",
  "name": "Playwright browser automation",
  "purpose": "Drive a real browser to verify a rendered view against a target.",
  "location": "skill:research-best-practice-playwright",
  "inputs": "a running app URL and a stable DOM hook per asserted component",
  "reachable": true
}
```

The `location` points at the tool; it does not embed it. The entry is enough for an author to decide whether a phase depends on the tool and to know where to look if it does.

## The Checklist Mechanic

The registry's value is realized as a checklist during memo creation. While a memo is authored, the author consults the registry and, for each phase, notes which registered tools the phase depends on. This turns "which tools does this work need?" from an implicit assumption into an explicit, reviewable list attached to the phase.

The checklist makes tool reachability a planning-time concern. Combined with the workbench-level tool-reachability check, a memo can confirm its required tools resolve *before* the rollout assumes them. A phase that depends on a tool whose `reachable` flag is false is a phase that will stall; surfacing that during planning is the entire point. Per-phase tool selections draw from this same registry, so each phase declares the tools it needs against one shared index rather than re-describing them ad hoc.

## A Reference Registry — Wiki, Chronicle, Command Tree

The registry is a place of **references, not copies** — and three project-wide entry points are registered here the same way a tool is: by a `location` pointer to where each one is fully specified, never by restating it.

- **The wiki** is registered as a tool — the entry point for querying the project's accumulated knowledge. Its full concept (the bottleneck over the structured architecture and the unstructured material beneath it) lives in its own chapter; the registry only records that it exists, what it is for, and where it lives. See [The Wiki — Entry Point](../workbench/04-wiki.md).
- **The chronicle** is the timeline counterpart — registered as the reference for "how the project's knowledge was reached", distinct from the wiki's present-tense answer. See [26-memo-history.md](/specification/memo-history/).
- **The self-describing command tree** is the registry's runtime sibling: the CLI describes its own commands, so the inventory of *what the project's own tooling can do* is discoverable rather than re-listed here. See [22-tree-cli-recommended-way.md](/specification/tree-cli-recommended-way/).

The boundary that keeps these well-defined is the same in each case: the wiki answers in the **present tense** ("what does the project know about X now?"), the chronicle answers in **chronological** terms ("does a conclusion from an earlier memo still hold?"), and the command tree answers in terms of **capability** ("what can the tooling do?"). The registry holds the pointers; the targets hold the content.

---

## Related

- [23-requirements.md](/specification/requirements/) — the parallel data folder; `check.kind: tool` requirements point into this registry for the tool and tactic that verify them.
- [08-phases-and-prds.md](/specification/phases-and-prds/) — the phases and work-packages whose tool dependencies the registry records.
- [22-tree-cli-recommended-way.md](/specification/tree-cli-recommended-way/) — the self-describing command tree, the capability counterpart registered here by reference.
- [26-memo-history.md](/specification/memo-history/) — the chronicle, the chronological counterpart to the wiki's present-tense answer.
- [30-primitives.md](/specification/primitives/) — central glossary and concept map; the tool primitive summarized.
- [00-overview.md](/specification/overview/) — spec scope and the document index.
