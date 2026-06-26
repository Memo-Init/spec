---
title: "The Workbench Instances — Root-SOP and Projects-SOP"
description: "The Workbench spec has **two structural levels** — the workbench root and the projects beneath it ([Root and Projects](/workbench/root-and-projects/)). Each level is governed by its **own thin SOP**,..."
sop_version: "0.1.0"
spec_file: "04-root-and-projects-sops.md"
order: 4
section: "SOP"
normative: false
generated_at: "2026-06-26T13:33:49.524Z"
generated_from: "spec/sop/0.1.0/04-root-and-projects-sops.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/sop/0.1.0/04-root-and-projects-sops.md."
---


> **Informative.** This chapter records how the workbench scope maps onto the SOP standard. It names the two workbench instances and how an agent is routed to them; their full content lives in the Workbench spec, not here.

The Workbench spec has **two structural levels** — the workbench root and the projects beneath it ([Root and Projects](/workbench/root-and-projects/)). Each level is governed by its **own thin SOP**, and each is an instance of the common denominator ([01-common-denominator.md](/specification/common-denominator/)). The workbench scope therefore contributes **two** instances to the register ([02-instances.md](/specification/instances/)), not one: the **Root-SOP** and the **Projects-SOP**. The "Workbench-SOP" is the **entry point** that routes between them — a signpost, not a third procedure.

This chapter exists to make that routing explicit. Earlier text named two SOPs in one place and a single "Workbench-SOP with two levels" in another, with no chapter that registered the two as instances or described the routing between them. This is that chapter.

---

## The Two Instances

Both instances fill in the four parts of the common denominator ([01-common-denominator.md](/specification/common-denominator/)) for their own structural level. They are deliberately thin: each references the standard for the meaning of Setup, Health, and Update, and adds only what is specific to its level.

| Instance | Governs | Folders in scope | Setup / Health / Update realizes |
|----------|---------|------------------|----------------------------------|
| **Root-SOP** | the workbench-root level — organize, do not develop | `cli/`, `context/`, `projects/`, `templates/`; the shared tools | creating the root-level folders; checking that every project exists with the expected structure and that shared tools are reachable; bringing the root up to date. |
| **Projects-SOP** | the project level — the project's own work | `repos/`, `context/`, `.memo/`, `design/` (the project-level folders) | setting up and checking a single project's folders; driving the project's own work (memos, repositories, tooling); keeping the project current. |

The two are distinct on purpose: one self-similar procedure that blurred both levels would erase the Root-vs-Project boundary that the rest of the Workbench spec depends on. The boundary and the per-level folder scope are specified in the Workbench spec ([Root and Projects](/workbench/root-and-projects/)); this table records only that each level **is** an SOP instance.

---

## Routing — Location Decides Which Instance

The **Workbench-SOP entry point** ([entry point](/workbench/sop-entrypoint/)) is read first on every fresh start. It is the signpost: it names the two levels and routes to the instance the agent's **location** selects.

| Where the agent is | Level | Instance it reads |
|--------------------|-------|-------------------|
| at the workbench root | Workbench | **Root-SOP** |
| inside a project (`projects/{name}/`) | Project | **Projects-SOP** |

An agent therefore reads **exactly one** of the two for the level it is operating at, and the level is decided by where it is — not by a choice it makes. The entry point itself holds neither instance's procedure; it points at the right one. This is the same signpost-not-container discipline the entry point applies to the add-on SOPs.

---

## Inheritance Declaration

Each instance obeys the reference model ([02-instances.md](/specification/instances/)): it **MUST** declare, in its opening, that it is an instance of the SOP standard and that it extends it, and then state how it realizes Setup, Health, and Update for its level. The Root-SOP and the Projects-SOP each carry that declaration for their own scope; the register names them, and this chapter records the routing that ties them to the single Workbench-SOP entry point.

---

## Related

- [02-instances.md](/specification/instances/) — the register that lists these two as workbench instances.
- [01-common-denominator.md](/specification/common-denominator/) — the four parts each instance fills in.
- [The Workbench-SOP entry point](/workbench/sop-entrypoint/) — the signpost that routes to the two instances.
- [Root and Projects](/workbench/root-and-projects/) — the structural levels and per-level folder scope these SOPs govern.
