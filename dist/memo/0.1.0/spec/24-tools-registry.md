---
title: "Tools Registry"
description: "A memo lists the phases and PRDs it will execute, but the tools those phases assume are easy to leave implicit. They live in the author's memory and in the wider skill catalog, never written down..."
spec_version: "0.1.0"
spec_file: "24-tools-registry.md"
order: 24
section: "Specification"
normative: true
generated_at: "2026-07-01T17:09:35.557Z"
generated_from: "draft/memo/0.1.0/spec/24-tools-registry.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/24-tools-registry.md."
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

- **The wiki** is registered as a tool — the entry point for querying the project's accumulated knowledge. Its full concept (the bottleneck over the structured architecture and the unstructured material beneath it) lives in its own chapter; the registry only records that it exists, what it is for, and where it lives. See [The Wiki — Entry Point](/workbench/wiki/).
- **The chronicle** is the timeline counterpart — registered as the reference for "how the project's knowledge was reached", distinct from the wiki's present-tense answer. See [26-memo-history.md](/specification/memo-history/).
- **The self-describing command tree** is the registry's runtime sibling: the CLI describes its own commands, so the inventory of *what the project's own tooling can do* is discoverable rather than re-listed here. See [22-tree-cli-recommended-way.md](/specification/tree-cli-recommended-way/).

The boundary that keeps these well-defined is the same in each case: the wiki answers in the **present tense** ("what does the project know about X now?"), the chronicle answers in **chronological** terms ("does a conclusion from an earlier memo still hold?"), and the command tree answers in terms of **capability** ("what can the tooling do?"). The registry holds the pointers; the targets hold the content.

---

## Conformity Requirements

The tools registry is a **RECOMMENDATION**, so its conformance rules are conditional: they bind a registry a project chooses to keep, never force one to exist, and a memo **MUST NOT** be blocked solely because no registry is present. Authored prose-first like the rest of the family ([35-memo-authoring.md](/specification/memo-authoring/)), each block's `statement` shapes how a registry entry or a tool-kind check is built, and its `check` verifies the built artifact at the gate with a ternary `PASS` / `BLOCKED` / `INCONCLUSIVE`.

A registry entry is a descriptor with a fixed shape, so its well-formedness is a soft check that never gates the memo — `severity: warning`, `grade: binary`:

```requirement
{
  "id": "REQ-846",
  "title": "Tools registry entry carries the descriptor fields",
  "statement": "When a project maintains a tools registry, each registry entry MUST be a short descriptor carrying `id`, `name`, `purpose`, `location`, and `reachable`, and each catalogued tool MUST expose a `tactics` array whose members carry an `id`, a `title`, an `appliesWhen`, and an `evidence` type.",
  "scope": { "repos": ["core"], "categories": ["evals"], "tags": ["tools-registry"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each registry entry carries `id`, `name`, `purpose`, `location`, and `reachable`",
      "Each catalogued tool's `tactics` members carry `id`, `title`, `appliesWhen`, and `evidence`"
    ]
  },
  "grade": "binary"
}
```

Embedding a tool body would create a second, drifting copy, so the reference-not-copy rule is a hard `MUST` (`grade: binary`):

```requirement
{
  "id": "REQ-847",
  "title": "Tools registry holds references, never copies",
  "statement": "The tools registry MUST hold references, not copies: an entry's `location` MUST point at the tool's single source of truth, and the registry MUST NOT embed copies of skills, skill bodies, or tool source, since an embedded body would become a second copy that drifts out of sync.",
  "scope": { "repos": ["core"], "categories": ["evals"], "tags": ["tools-registry", "anti-drift"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each entry's `location` is a pointer such as a `skill:` reference or a path, not an inlined body",
      "No registry entry contains a copied skill body or tool source"
    ]
  },
  "grade": "binary"
}
```

A `tool`-kind requirement needs a real tool-plus-tactic pair to resolve against, so a maintained registry should catalogue the named validation tools — soft completeness, `grade: binary`:

```requirement
{
  "id": "REQ-848",
  "title": "Maintained registry catalogues the named validation tools",
  "statement": "A maintained tools registry SHOULD catalogue the named validation tools the requirement model verifies against — Pencil, Playwright, get-sheet, getui, and FlowMCP — each with its own named tactics, so a `check.kind: tool` requirement can resolve a real tool-plus-tactic pair rather than an ad-hoc name.",
  "scope": { "repos": ["core"], "categories": ["evals"], "tags": ["tools-registry"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The registry lists Pencil, Playwright, get-sheet, getui, and FlowMCP as catalogued tools",
      "Each catalogued tool carries at least one named tactic"
    ]
  },
  "grade": "binary"
}
```

A tool-kind check that names an unknown tool or tactic is unverifiable, so cross-validation against the registry is a hard gate (`grade: binary`):

```requirement
{
  "id": "REQ-849",
  "title": "A tool-kind requirement validates against schema and registry",
  "statement": "A requirement whose `check.kind` is `tool` MUST validate against both the requirement schema (structure) and the tools registry (existence): the named `tool` MUST exist in the registry and the named `tactic` MUST be a valid id under that tool. A tool-kind check MUST report `INCONCLUSIVE` until the external scanner it delegates to has actually run — never a silent `PASS`.",
  "scope": { "repos": ["core"], "categories": ["evals"], "tags": ["tools-registry", "tool-check"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A tool-kind requirement passes both schema validation and registry validation",
      "The check's `tool` resolves in the registry and its `tactic` is a valid id under that tool",
      "Before the external scanner runs, the tool-kind result is INCONCLUSIVE, not PASS"
    ]
  },
  "grade": "binary"
}
```

Tactic selection must be reproducible and refuse to guess, so determinism and the no-silent-default rule are a blocker (`grade: binary`):

```requirement
{
  "id": "REQ-850",
  "title": "Tactic selection is deterministic with no silent default",
  "statement": "Tactic selection MUST be deterministic and data-driven — a signal-to-tactic mapping, priority-ordered, with multiple hits allowed — and MUST NOT fall back to a silent default: zero matches MUST surface an explicit 'no tactic matches' outcome rather than an arbitrary pick. A `skillRef` named on a tactic is advisory only; the referenced skill performs the measurement and sets the status, while the registry itself sets none.",
  "scope": { "repos": ["core"], "categories": ["evals"], "tags": ["tools-registry", "tactic-selection"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The same signals always select the same ordered set of tactics",
      "Zero matching tactics yields an explicit no-match outcome, not an arbitrary default",
      "A tactic's `skillRef` carries no status; the referenced skill is what measures"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [23-requirements.md](/specification/requirements/) — the parallel data folder; `check.kind: tool` requirements point into this registry for the tool and tactic that verify them.
- [08-phases-and-prds.md](/specification/phases-and-prds/) — the phases and work-packages whose tool dependencies the registry records.
- [22-tree-cli-recommended-way.md](/specification/tree-cli-recommended-way/) — the self-describing command tree, the capability counterpart registered here by reference.
- [26-memo-history.md](/specification/memo-history/) — the chronicle, the chronological counterpart to the wiki's present-tense answer.
- [30-primitives.md](/specification/primitives/) — central glossary and concept map; the tool primitive summarized.
- [00-overview.md](/specification/overview/) — spec scope and the document index.
