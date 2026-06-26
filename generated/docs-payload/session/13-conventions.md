---
title: "Conventions — Naming and Brevity"
description: "The conventions below are not specific to any one SOP. They apply wherever skills, CLIs, and SOP prose appear, which is why they live in the connecting mechanism rather than in a single instance."
session_version: "0.1.0"
spec_file: "13-conventions.md"
order: 13
section: "Session"
normative: false
generated_at: "2026-06-26T21:14:26.848Z"
generated_from: "spec/session/0.1.0/13-conventions.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/session/0.1.0/13-conventions.md."
---


> **Informative.** This chapter records two cross-cutting conventions the system already follows in practice — how registered units are named, and how the writing stays brief — so that they are documented once rather than re-derived per scope. Where a convention is a real rule rather than a habit, it is stated with the conformance key words.

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

## Related

- [10-sop.md](/specification/sop/) — why a thin connecting mechanism exists inside the session standard.
- [11-common-denominator.md](/specification/common-denominator/) — the four parts every SOP shares.
- [12-instances.md](/specification/instances/) — the existing SOPs as instances, and the inheritance declaration.
