---
title: "Tools Registry (`.memo/tools/`)"
description: "This chapter is **normative** for the tools-registry location and the checklist mechanic. The registry itself is a **RECOMMENDATION**, not a requirement."
spec_version: "0.1.0"
spec_file: "03-tools-registry.md"
order: 3
section: "Workbench"
normative: true
generated_at: "2026-06-10T23:29:45.219Z"
generated_from: "spec/workbench/03-tools-registry.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/03-tools-registry.md."
---

| Field | Value |
|-------|-------|
| Status | Draft |
| Depends on | [01-project-structure.md](/specification/project-structure/) |
| Related | [02-requirements.md](/specification/requirements/), [04-strands.md](/specification/strands/), [00-overview.md](/specification/overview/) |

> Normative language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119] [RFC8174]. RFC 2119 keywords are used.

This chapter is **normative** for the tools-registry location and the checklist mechanic. The registry itself is a **RECOMMENDATION**, not a requirement.

---

## Problem

There is currently no per-memo record of **which** skills or tools each phase of a memo needs. A memo lists phases and PRDs, but the tools those phases assume are implicit, scattered across the author's memory and the skill catalog. When a rollout starts, missing or unreachable tools surface late instead of being noticed at planning time.

---

## Solution — A Registry of Available Tools

A project **MAY** maintain a **tools registry** under `.memo/tools/`. The registry **describes the available tools** — their names, what they do, and what a memo needs to know to decide whether a phase depends on them. Like the requirements profiles, the registry is data under `.memo/`, sitting as a sibling of the memos (see [01-project-structure.md](/specification/project-structure/)).

The registry is a **descriptive index**, not a runtime. It records *that* a tool exists and *what* it is for, so a memo author can consult it while planning.

---

## Recommendation, Not a Requirement

The tools registry is a **RECOMMENDATION**. A project **SHOULD** maintain it because it improves planning, but a project **MAY** omit it, and a memo **MUST NOT** be blocked solely because no tools registry is present. This is the deliberate difference from the requirements profiles of [02-requirements.md](/specification/requirements/), which are enforced at finalization: the tools registry aids planning but does not gate it.

---

## The Checklist Mechanic

The registry's value is realized as a **checklist during memo creation**:

- While a memo is being authored, the author consults the registry and, for each phase, notes which registered tools the phase depends on. This turns "which tools does this work need?" from an implicit assumption into an explicit, reviewable checklist.
- The checklist makes tool reachability a planning-time concern. Combined with the workbench-level tool-reachability check (see [00-overview.md](/specification/overview/)), a memo can confirm its required tools resolve *before* the rollout assumes them.
- Per-strand tool selections (see [04-strands.md](/specification/strands/)) draw from this same registry, so each strand can declare the tools it needs.

---

## Do Not Copy Skills Into the Registry

The registry **MUST NOT** contain copies of skills, skill bodies, or tool source. It records **references and descriptions** only.

- Copying a skill into the registry would create a second, drifting copy of something that already has a single source of truth (the skills core). The registry points at tools; it does not embed them.
- A registry entry **SHOULD** be a short, stable descriptor: name, purpose, and where the tool actually lives. When the underlying tool changes, the descriptor — not a duplicated body — is what is updated.

---

## Related

- [01-project-structure.md](/specification/project-structure/) — the `.memo/tools/` location.
- [02-requirements.md](/specification/requirements/) — the enforced data sibling, contrasted with this recommended one.
- [04-strands.md](/specification/strands/) — strands draw per-strand tools from this registry.
- [00-overview.md](/specification/overview/) — the workbench-level tool-reachability check.
