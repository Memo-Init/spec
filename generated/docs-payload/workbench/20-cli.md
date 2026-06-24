---
title: "CLI Convention — Branch/Leaf"
description: "The workbench's command-line tools follow one convention: a **self-describing command tree** built from branches and leaves. This convention is settled at the specification and website level — it is..."
workbench_version: "0.1.0"
spec_file: "20-cli.md"
order: 20
section: "Workbench"
normative: true
generated_at: "2026-06-24T20:40:20.473Z"
generated_from: "spec/workbench/0.1.0/20-cli.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/20-cli.md."
---


The workbench's command-line tools follow one convention: a **self-describing command tree** built from branches and leaves. This convention is settled at the specification and website level — it is a stated rule of the workbench, not an implicit habit of any one tool. This chapter records the convention and the matching rule for the script folders that sit beside it.

---

## Self-Describing Command Tree (Branch/Leaf)

A workbench CLI is a **tree of commands**, and the tree describes itself. The full normative treatment lives in the core specification's [Tree CLI chapter](/specification/tree-cli-recommended-way/); this chapter states the convention and points there. The two roles in the tree are:

- A **branch** is a grouping node — a "bag of tools." It carries no behavior of its own; it organizes the leaves beneath it and lets a caller discover what is available by walking the tree.
- A **leaf** is an executable command with **typed input and output**. The crucial property is that a leaf's **field descriptions encode its behavior**: reading the leaf's typed in/out is enough to understand what it does, without separate prose. The tree is self-describing because each leaf documents itself through its types.

A workbench CLI **SHOULD** be structured this way so that an agent can discover and call commands by inspecting the tree rather than by being told about each command out of band.

---

## `npm link` Is Only a Registration Mechanism

Making a CLI globally callable — for example via `npm link` — is **only a registration mechanism**. It puts the command on the path; it says nothing about the command's design. The Branch/Leaf convention is the design contract, and it stands independently of how the binary is registered. Registration and convention **MUST NOT** be conflated: a tool is not "well-formed" because it is linked, only because its command tree is self-describing.

---

## Scripts Live in Meaningful Subfolders

The same self-describing principle applies to a project's `scripts/` folder. Scripts **MUST** live in **meaningful subfolders**, not as a flat collection at the top level. The reason is identical to the Branch/Leaf rule: a bare `dev.sh` says too little about *which* environment it operates on, while a subfolder name (for example `scripts/rails/`) carries that meaning.

The **folder name is the unit of meaning**. This connects to the About convention (see [30-wiki.md](/specification/wiki/)): a scripts subfolder carries an `About` describing what it is for, and that description is ingested into the wiki — so the meaning a reader infers from the folder name is also recorded where the wiki can answer for it. The script families themselves are specified in [21-environment-scripts.md](/specification/environment-scripts/).

---

## Related

- [Tree CLI — the recommended way](/specification/tree-cli-recommended-way/) — the normative Branch/Leaf treatment in the core spec.
- [21-environment-scripts.md](/specification/environment-scripts/) — the script families that follow the subfolder rule.
- [30-wiki.md](/specification/wiki/) — the About convention that records what a scripts subfolder is for.
