---
title: "design/ & DESIGN.md"
description: "`design/` is the optional, project-level folder that holds a project's **design system** and its visual sources. Its content follows a named convention — **DESIGN.md** — in the same way the..."
workbench_version: "0.1.0"
spec_file: "18-design.md"
order: 18
section: "Workbench"
normative: true
generated_at: "2026-06-26T15:10:37.273Z"
generated_from: "spec/workbench/0.1.0/18-design.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/18-design.md."
---


`design/` is the optional, project-level folder that holds a project's **design system** and its visual sources. Its content follows a named convention — **DESIGN.md** — in the same way the architecture folder's content follows OKF. This chapter specifies the folder and the convention together: `design/` is the registered home, and DESIGN.md is the standard its primary file is written to.

Like OKF, DESIGN.md is one of the **storage formats the wiki reads through** ([30-wiki.md](/specification/wiki/)): the design system is reached through the wiki — the project's single discovery entry point — exactly as the architecture bundle is, which is why this convention sits under the wiki rather than standing alone.

---

## What DESIGN.md Is

DESIGN.md is a **design-system format**: a single Markdown file that captures the foundation a design rests on — its colors, typography, icons, elevation, shapes, and the do's and don'ts that govern their use — as YAML design tokens plus a set of canonical prose sections. It is deliberately Markdown rather than JSON, so the design system is readable and reviewable in the same medium as the rest of a project's authored knowledge, and so an agent can consume it as plain text. A small command-line surface (lint, diff, export, and a schema command) operates on the file; the export path emits to interchange targets rather than locking the tokens into one renderer.

DESIGN.md is an external, open format (Apache-2.0). The name collides with an unrelated convention in another tool that uses a lowercase `design.md` for software architecture; in this spec, **DESIGN.md is the visual design system** and the architecture is a separate concern ([41-project-architecture.md](/specification/project-architecture/)).

---

## `design/` Is a Convention Folder

`design/` is **optional**, carries **no dot** (it holds authored, user-facing content, like `proofs/` and `snapshots/`), and lives at the **project level** — design is per-project, not a cross-project shared tool. The folder holds:

- **`DESIGN.md`** — the active design-system convention for the project.
- **Variants** — alternative design directions kept side by side as separate files, the way several designs are explored in folders rather than overwriting one.
- **`.pen` and visual sources** — the wireframes and mockups the design is drawn in.

The folder is a registered, optional entry in the contract ([12-folders.md](/specification/folders/)); a project adds it when it does design work and omits it otherwise.

When a project carries more than one design surface — several views, screens, or design directions — that content **MUST** be organized under a **per-topic sub-folder** of `design/` (one sub-folder per view or direction, each with its own `DESIGN.md`, variants, and `.pen` sources) rather than as loose files at the folder root. The rationale matches the rest of the workbench: a **uniform, discoverable structure**, so a reader finds a given surface by its sub-folder and the wiki indexes a coherent design domain. A single design surface may sit at the folder root; once there is more than one, each gets its own sub-folder.

---

## Foundation and Reference

A project's design surface has two layers, and DESIGN.md occupies the first:

- **DESIGN.md is the foundation** — the design *system*: the tokens and rules that everything else is derived from.
- **The `.pen` files, HTML, and screenshots are the reference** — the concrete *visuals* that show the system applied. Captured view proofs live in `proofs/` ([12-folders.md](/specification/folders/)).

Skills stack **on top of** this foundation rather than replacing it: a design-generation or design-diff skill reads DESIGN.md as the foundation and produces or checks the visual reference against it. The layering is additive — the foundation is authored once, and the visual references and skills build on it.

---

## Adoption Without Schema Lock-In

DESIGN.md addresses a real problem — design drift when several agents touch a project's UI without a shared source of truth — with a flat, readable format that exports to neutral interchange targets (W3C Design Token Community Group format, and Tailwind), so adopting it does **not** lock a project into one toolchain. Its risks are equally real: the underlying token schema is still `alpha`, the format does not enforce itself, documentation can drift from the implementation, and carrying it adds token cost.

The workbench's position is to **adopt the pattern, governed, without binding to the schema**. DESIGN.md is treated as the project's first design **convention** — the named standard `design/` follows today — and an explicitly *replaceable* one: if the format is superseded, the folder and its role survive and the convention is swapped, exactly as any convention can be. The value adopted is the *discipline* (a declared, single design foundation), not a permanent commitment to one evolving external schema.

---

## SOP-Native Governance

`design/` is governed the way every good registered folder is, rather than left as an inert file:

- **Declared.** It is a registered folder with this chapter as its contract.
- **Checked on write.** A write-time lint can validate a DESIGN.md against the convention (its frontmatter and required sections) at the moment it is written, the same mechanism applied to other folders' content ([23-hooks-contract.md](/specification/hooks-contract/)).
- **Findable.** The wiki indexes `design/` among the project's domains, so the design system is discoverable alongside everything else ([30-wiki.md](/specification/wiki/)).

The **spec comes first**: the folder and convention are defined here before any design-specific skill is built. A dedicated setup skill for `design/` is a later, separate step and is not part of this contract.

---

## Related

- [12-folders.md](/specification/folders/) — the folder contract and the convention model `design/` is a registered, optional instance of.
- [13-knowledge-format-okf.md](/specification/knowledge-format-okf/) — OKF, the sibling convention for the architecture and wiki folders.
- [23-hooks-contract.md](/specification/hooks-contract/) — the write-time lint that can check a DESIGN.md against its convention.
- [30-wiki.md](/specification/wiki/) — the wiki as the search layer that indexes `design/`.
