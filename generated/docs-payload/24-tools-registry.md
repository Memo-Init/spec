---
title: "Tools Registry"
description: "A memo lists the phases and PRDs it will execute, but the tools those phases assume are easy to leave implicit. They live in the author's memory and in the wider skill catalog, never written down..."
spec_version: "0.1.0"
spec_file: "24-tools-registry.md"
order: 24
section: "Specification"
normative: true
generated_at: "2026-06-15T18:31:04.961Z"
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

## Wiki as a Tool

A project wiki is, for the purposes of this registry, a **tool** — specifically a tool for querying the workbench's accumulated knowledge. Over many memos a project builds up far more than any single memo holds: context documents, finalized decisions, and the present-tense understanding distilled from them. The wiki is how a memo author asks the workbench what it already knows, instead of rediscovering it. Registered as a tool, the wiki takes its place in the checklist alongside browser automation, spreadsheets, and the rest: a phase that needs to consult prior project knowledge can declare a dependency on it.

The wiki answers in the **present tense**. A wiki page states what is understood to be true now; a query against it returns the current understanding, optimized for fast answers about the project as it stands. That is its strength as a query tool — and the boundary that keeps it well-defined.

What the wiki is **not** is the timeline of how that knowledge was reached. The accumulation of facts over the memo sequence — the story of which memo established what, and where a later memo reversed an earlier course — is the subject of a separate concern, the memo history (see [00-overview.md](/specification/overview/) for the document index). The wiki gives the answer; the memo history gives the provenance and the chronology behind it. A phase that needs to ask "what does the project currently know about X?" reaches for the wiki as a tool. A phase that needs to ask "does a conclusion from an earlier memo still hold?" reaches for the memo history instead. Keeping the two distinct is what stops the wiki's present-tense convenience from being mistaken for an audit trail, and stops the timeline from being flattened into a single current answer.

---

## Related

- [23-requirements.md](/specification/requirements/) — the parallel data folder; `check.kind: tool` requirements point into this registry for the tool and tactic that verify them.
- [08-phases-and-prds.md](/specification/phases-and-prds/) — the phases and work-packages whose tool dependencies the registry records.
- [30-primitives.md](/specification/primitives/) — central glossary and concept map; the tool primitive summarized.
- [00-overview.md](/specification/overview/) — spec scope and the document index.
