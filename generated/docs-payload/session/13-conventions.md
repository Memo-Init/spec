---
title: "Conventions"
description: "The conventions below are not specific to any one SOP. They apply wherever skills, CLIs, and SOP prose appear, which is why they live in the connecting mechanism rather than in a single instance."
session_version: "0.1.0"
spec_file: "13-conventions.md"
order: 13
section: "Session"
normative: false
generated_at: "2026-06-30T15:43:46.482Z"
generated_from: "spec/session/0.1.0/13-conventions.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/session/0.1.0/13-conventions.md."
---


> **Informative.** This chapter records the cross-cutting conventions the system already follows in practice — how registered units are named, how the words *folder* and *folders* are kept apart, how the writing stays brief, and the fixed shape a per-folder page opens with — so that they are documented once rather than re-derived per scope. Where a convention is a real rule rather than a habit, it is stated with the conformance key words.

The conventions below are not specific to any one SOP. They apply wherever skills, CLIs, and SOP prose appear, which is why they live in the connecting mechanism rather than in a single instance.

---

## Naming Convention

Registered skills and CLIs use a lowercase `prefix-hyphen-name` form. The leading segment is a **prefix** that names the family the unit belongs to (`memo-`, `repo-`, `node-`, `workbench-`, …); the remaining segments name the unit within that family. A registered skill or CLI **MUST** follow this form.

The prefix is the **discovery handle**: it is how a unit is found and grouped, not merely a label. A reader or agent that knows the family prefix can enumerate the family and locate the unit without knowing its full name in advance. The prefix is also the first-class **namespace** a registrant block reserves in the session config ([06-namespace-registry.md](/specification/namespace-registry/)); the lookup mechanism — the registry and CLI convention — is defined in its own scope, and this chapter only fixes the naming shape it relies on.

---

## Brevity Convention

The system keeps references and headings short, so that names carry the signal and prose carries the explanation.

- **Folder references.** A folder is referred to by a short name with a **trailing slash** — `repos/`, `context/`, `.memo/`, `.trash/`, `.tmp/`. The trailing slash **is** the folder signal; long quoted descriptions of a folder are not used in its place. Authors **SHOULD** use this form whenever a folder is named in prose.
- **Section headings.** Headings are kept short. Any explanatory sentence belongs in the body prose beneath the heading, not in the heading itself. A heading names the section; the first sentence of the body explains it.

Together these keep an SOP scannable: a reader sees the structure from the headings and the locations from the slashed names, and reads prose only where explanation is actually needed.

---

## Folder vs. Folders — One Marker, One Vocabulary

A second naming distinction keeps two uses of the word *folder* apart, so that the singular and the plural are never read as the same thing:

- **A "folder" (singular)** is the session genesis-root marker — `.session/`, the single folder whose presence marks where a session is rooted ([01-genesis-root.md](/specification/genesis-root/)). The genesis tier owns exactly this one folder.
- **"folders" (plural)** are the registered project vocabulary a *Tool* owns — the fixed set of named folders every project shares. Their tiers and taxonomy are the Workbench spec's concern; [workbench/12-folders.md](/workbench/folders/) is the authoritative owner of the folder tiers.

The session tier names the singular marker; the plural taxonomy lives one tier up. Pushing the naming rule down to here lets both tiers use the words consistently without the genesis root having to carry the workbench's folder set.

---

## The Folder-Page Contract

A registered folder substantial enough to warrant its own page — a *per-folder page* — opens with a **Folder Contract**: a compact block, in a fixed shape, that states the folder's identity before its prose begins. The contract is defined once here, at the tier that owns naming and convention, so the per-folder pages above reference **down** into this shape rather than each inventing its own header (the push-down principle, [00-overview.md](/specification/overview/)).

A per-folder page **MUST** open with a Folder Contract carrying these fields:

```text
Folder Contract
  Name:         the registered folder name, with trailing slash (e.g. repos/)
  Status:       Mandatory | Optional | reserved (custom folder, default-on)
  Level:        Root | Project | Both
  Entry-point:  the file or sub-folder opened first (— when there is none)
  Convention:   the named content format the folder follows (— when none)
  Purpose:      one line — what the folder is for
  Goes in:      what belongs in the folder
  Does not:     what does NOT belong in it
```

The first six fields are exactly the columns of the Workbench folder-contract table ([workbench/12-folders.md](/workbench/folders/)), so a per-folder page and the central table state the same identity in the same vocabulary. The **Goes-in / Does-not** pair is the one addition a single table row cannot carry — the in/out boundary a dedicated page has room to state.

### The Lint-Gate

The Folder Contract is **normative, not advisory** (the MUST above), and it is enforced by a **lint gate**: every per-folder page is checked against the contract, and a page that is missing a required field — or whose `Name`, `Status`, or `Level` disagrees with the central folder-contract table it mirrors — is reported as a violation. The gate is what stops the contract from drifting page by page: because the shape is checked, a new per-folder page cannot quietly omit its boundary or contradict the registry. It carries to the per-folder pages the spec's general posture — a static page is governed only when it is declared and checked, not when it is merely trusted ([02-enforcement.md](/specification/enforcement/)).

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [10-sop.md](/specification/sop/) — why a thin connecting mechanism exists inside the session standard.
- [11-common-denominator.md](/specification/common-denominator/) — the four parts every SOP shares.
- [12-instances.md](/specification/instances/) — the existing SOPs as instances, and the inheritance declaration.
- [workbench/12-folders.md](/workbench/folders/) — the authoritative owner of the folder tiers and the central folder-contract table the per-folder pages mirror.
