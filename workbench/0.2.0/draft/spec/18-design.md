# 18. design/

| | |
|---|---|
| Status | Draft |
| Depends on | [12-folders.md](./12-folders.md) |
| Related | [13-knowledge-format-okf.md](./13-knowledge-format-okf.md), [23-hooks-contract.md](./23-hooks-contract.md), [30-wiki.md](./30-wiki.md) |

`design/` is the optional, project-level folder that holds a project's **design system** and its visual sources. Its content follows a named convention — **design.md** — in the same way the architecture folder's content follows OKF. This chapter specifies the folder and the convention together: `design/` is the registered home, and design.md is the standard its primary file is written to.

Like OKF, design.md is one of the **storage formats the wiki reads through** ([30-wiki.md](./30-wiki.md)): the design system is reached through the wiki — the project's single discovery entry point — exactly as the architecture bundle is, which is why this convention sits under the wiki rather than standing alone.

---

## Folder Contract

`design/` is a registered (optional) folder, and this page is its per-folder entry:

```folder
{
  "name":       "design/",
  "status":     "optional",
  "level":      "project",
  "entryPoint": "design.md",
  "convention": "design format",
  "purpose":    "The project's design system and visual sources.",
  "goesIn":     "design.md (the active convention), design variants, and .pen / visual sources — organized under per-topic sub-folders once there is more than one surface.",
  "doesNot":    "Captured view proofs (those live in proofs/); the project architecture, which is a separate concern.",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](./12-folders.md)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## What design.md Is

design.md is a **design-system format**: a single Markdown file that captures the foundation a design rests on — its colors, typography, icons, elevation, shapes, and the do's and don'ts that govern their use — as YAML design tokens plus a set of canonical prose sections. It is deliberately Markdown rather than JSON, so the design system is readable and reviewable in the same medium as the rest of a project's authored knowledge, and so an agent can consume it as plain text. A small command-line surface (lint, diff, export, and a schema command) operates on the file; the export path emits to interchange targets rather than locking the tokens into one renderer.

`design.md` is an external, open format (Apache-2.0). **Correction (this revision).** An earlier version of this chapter used an uppercase `DESIGN.md` and justified it as *disambiguating* from an unrelated tool that supposedly used a lowercase `design.md` for software architecture. That rationale was **factually inverted** — the other tool's architecture file is itself **uppercase `DESIGN.md`**, so an uppercase name never disambiguated anything. This spec therefore uses the **lowercase `design.md`**, on its own grounds: the workbench's dot/no-dot rule classes `design/` as authored content, so its in-folder entry/format file is lowercase like the other in-folder entry and format files, and lowercase also matches the prevailing 2025 norm. In this spec, **`design.md` is the visual design system** and the architecture is a separate concern ([41-project-architecture.md](./41-project-architecture.md)).

---

## `design/` Is a Convention Folder

`design/` is **optional**, carries **no dot** (it holds authored, user-facing content, like `proofs/` and `snapshots/`), and lives at the **project level** — design is per-project, not a cross-project shared tool. The folder holds:

- **`design.md`** — the active design-system convention for the project.
- **Variants** — alternative design directions kept side by side as separate files, the way several designs are explored in folders rather than overwriting one.
- **`.pen` and visual sources** — the wireframes and mockups the design is drawn in.

The folder is a registered, optional entry in the contract ([12-folders.md](./12-folders.md)); a project adds it when it does design work and omits it otherwise.

When a project carries more than one design surface — several views, screens, or design directions — that content **MUST** be organized under a **per-topic sub-folder** of `design/` (one sub-folder per view or direction, each with its own `design.md`, variants, and `.pen` sources) rather than as loose files at the folder root. The rationale matches the rest of the workbench: a **uniform, discoverable structure**, so a reader finds a given surface by its sub-folder and the wiki indexes a coherent design domain. A single design surface may sit at the folder root; once there is more than one, each gets its own sub-folder.

---

## Foundation and Reference

A project's design surface has two layers, and design.md occupies the first:

- **design.md is the foundation** — the design *system*: the tokens and rules that everything else is derived from.
- **The `.pen` files, HTML, and screenshots are the reference** — the concrete *visuals* that show the system applied. Captured view proofs live in `proofs/` ([12-folders.md](./12-folders.md)).

Skills stack **on top of** this foundation rather than replacing it: a design-generation or design-diff skill reads design.md as the foundation and produces or checks the visual reference against it. The layering is additive — the foundation is authored once, and the visual references and skills build on it.

---

## Adoption Without Schema Lock-In

design.md addresses a real problem — design drift when several agents touch a project's UI without a shared source of truth — with a flat, readable format that exports to neutral interchange targets (W3C Design Token Community Group format, and Tailwind), so adopting it does **not** lock a project into one toolchain. Its risks are equally real: the underlying token schema is still `alpha`, the format does not enforce itself, documentation can drift from the implementation, and carrying it adds token cost.

The workbench's position is to **adopt the pattern, governed, without binding to the schema**. design.md is treated as the project's first design **convention** — the named standard `design/` follows today — and an explicitly *replaceable* one: if the format is superseded, the folder and its role survive and the convention is swapped, exactly as any convention can be. The value adopted is the *discipline* (a declared, single design foundation), not a permanent commitment to one evolving external schema.

---

## SOP-Native Governance

`design/` is governed the way every good registered folder is, rather than left as an inert file:

- **Declared.** It is a registered folder with this chapter as its contract.
- **Checked on write.** A write-time lint can validate a design.md against the convention (its frontmatter and required sections) at the moment it is written, the same mechanism applied to other folders' content ([23-hooks-contract.md](./23-hooks-contract.md)).
- **Findable.** The wiki indexes `design/` among the project's domains, so the design system is discoverable alongside everything else ([30-wiki.md](./30-wiki.md)).

The **spec comes first**: the folder and convention are defined here before any design-specific skill is built. A dedicated setup skill for `design/` is a later, separate step and is not part of this contract.

---

## Conformity Requirements

`design/` is governed, not inert, so the design.md convention and the folder's organization are checkable. The blocks below encode this chapter's binding rules prose-first — each `statement` faces how a design surface is authored and laid out, each `check` faces the write-time lint and the structure audit. They are the source the requirement store is harvested from ([23-requirements.md](/specification/requirements/)).

Whether a design.md satisfies its convention is a content check delegated to the write-time lint:

```requirement
{
  "id": "REQ-971",
  "title": "A design.md conforms to its convention",
  "statement": "A `design/`'s primary file MUST be the lowercase `design.md` and MUST carry the design.md convention's required frontmatter and canonical prose sections (the design tokens plus the do's/don'ts) so that it is a valid design system rather than an arbitrary document. A write-time lint validates the file against the convention at the moment it is written.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["design", "convention", "write-lint"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The folder's primary file is the lowercase `design.md`",
      "It carries the convention's required frontmatter",
      "It carries the convention's canonical prose sections"
    ]
  },
  "grade": "binary"
}
```

Multiple design surfaces under per-topic sub-folders is a structural fact, parallel to the `context/` rule:

```requirement
{
  "id": "REQ-972",
  "title": "Multiple design surfaces are organized under per-topic sub-folders",
  "statement": "When a project carries more than one design surface — several views, screens, or directions — that content MUST be organized under a per-topic sub-folder of `design/` (one sub-folder per view or direction, each with its own `design.md`, variants, and `.pen` sources) rather than as loose files at the folder root. A single design surface MAY sit at the folder root; once there is more than one, each gets its own sub-folder.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["design", "structure"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "With more than one design surface, each lives under its own sub-folder of `design/`",
      "Each surface sub-folder carries its own `design.md`"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [12-folders.md](./12-folders.md) — the folder contract and the convention model `design/` is a registered, optional instance of.
- [13-knowledge-format-okf.md](./13-knowledge-format-okf.md) — OKF, the sibling convention for the architecture and wiki folders.
- [23-hooks-contract.md](./23-hooks-contract.md) — the write-time lint that can check a design.md against its convention.
- [30-wiki.md](./30-wiki.md) — the wiki as the search layer that indexes `design/`.
