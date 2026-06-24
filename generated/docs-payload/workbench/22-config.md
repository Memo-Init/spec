---
title: "The `.workbench/` Configuration"
description: "A project declares what is specific to it in a **manual** configuration under `.workbench/`. The configuration describes each repository as inward- or outward-facing, and it is the **single source**..."
workbench_version: "0.1.0"
spec_file: "22-config.md"
order: 22
section: "Workbench"
normative: true
generated_at: "2026-06-24T22:34:55.546Z"
generated_from: "spec/workbench/0.1.0/22-config.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/22-config.md."
---


A project declares what is specific to it in a **manual** configuration under `.workbench/`. The configuration describes each repository as inward- or outward-facing, and it is the **single source** from which deterministic enforcement (notably hooks) is derived. This chapter specifies what the configuration holds and the principle by which other things are derived from it.

---

## The Configuration Is Manual

The `.workbench/` configuration is **manual**: it is written and maintained by hand, **not** auto-generated. A configuration is a statement of intent — which repositories face the outside world, which stay local — and intent is something a developer declares, not something a tool infers. A process **MUST NOT** silently generate or overwrite the configuration; where tooling assists, it proposes changes for the developer to accept, consistent with the workbench's no-auto-write discipline.

This is the project-level expression of the single-source principle ([01-philosophy.md](/specification/philosophy/)): rather than each tool guessing a repository's exposure, the project states it once, in one file, and everything else reads from there.

---

## Repositories × Facing

The core content of the configuration is a per-repository **facing** classification:

| Facing | Meaning |
|--------|---------|
| **inward** | Local-only; never pushed to a public remote. Coordination and references use the memo ID. |
| **outward** | Published to a public remote. Coordination and references use GitHub Issues. |

The `facing` attribute is the same field the project-architecture knowledge bundle records for a repository (see [14-project-architecture.md](/specification/project-architecture/)); the configuration is where a project **declares** it. The classification drives a concrete downstream rule — the workbench's egress convention (rule C1): an **outward** repository routes coordination through **Issues**, an **inward** repository through the **memo ID**. Stating `facing` once is what lets that rule be applied consistently and, where desired, enforced.

---

## Derivation — One Source, Many Consumers

The configuration is valuable because other things are **derived** from it rather than re-declared. The primary consumer is the **hooks contract** ([23-hooks-contract.md](/specification/hooks-contract/)): the manual declaration of facing (and of other project policy) is what a hook reads to decide, deterministically, whether an action is allowed — for example, whether a push to a repository declared inward should be blocked.

The principle is the division of responsibility introduced in [02-sop-entrypoint.md](/specification/sop-entrypoint/): **the workbench declares policy** here, in the `.workbench/` configuration; **the machine tier enforces it** through hooks. The configuration is therefore the contract surface between the two — the single, manual, readable source that enforcement consumes. What enforcement may read and how it behaves is specified next.

---

## Related

- [23-hooks-contract.md](/specification/hooks-contract/) — the contract that consumes this configuration.
- [12-folders.md](/specification/folders/) — `.workbench/` as the optional folder that holds this configuration.
- [14-project-architecture.md](/specification/project-architecture/) — `facing` as a recorded repository attribute.
