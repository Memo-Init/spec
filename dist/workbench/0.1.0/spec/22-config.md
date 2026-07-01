---
title: ".workbench/"
description: "A project declares what is specific to it in a **manual** configuration under `.workbench/`. The configuration describes each repository's **status** — its visibility, its remote, and its facing —..."
workbench_version: "0.1.0"
spec_file: "22-config.md"
order: 22
section: "Workbench"
normative: true
generated_at: "2026-07-01T00:43:54.490Z"
generated_from: "draft/workbench/0.1.0/spec/22-config.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/workbench/0.1.0/spec/22-config.md."
---


A project declares what is specific to it in a **manual** configuration under `.workbench/`. The configuration describes each repository's **status** — its visibility, its remote, and its facing — and it is the **single source** from which deterministic enforcement (notably hooks) is derived. This chapter specifies what the configuration holds and the principle by which other things are derived from it.

This chapter and [23-hooks-contract.md](/specification/hooks-contract/) form the workbench **Core** — the mutually-defining config/enforcement pair (config = producing side, hooks = consuming side); see the Core category in [00-overview.md](/specification/overview/).

---

## The Configuration Is Manual

The `.workbench/` configuration is **manual**: it is written and maintained by hand, **not** auto-generated. A configuration is a statement of intent — which repositories face the outside world, which stay local — and intent is something a developer declares, not something a tool infers. A process **MUST NOT** silently generate or overwrite the configuration; where tooling assists, it proposes changes for the developer to accept, consistent with the workbench's no-auto-write discipline.

This is the project-level expression of the single-source principle ([01-philosophy.md](/specification/philosophy/)): rather than each tool guessing a repository's exposure, the project states it once, in one file, and everything else reads from there.

---

## Repositories × Status

The core content of the configuration is a per-repository **status** — three axes, each **declared** by hand, never inferred:

| Axis | Values | Meaning |
|------|--------|---------|
| **visibility** | `private` \| `public` | Whether the repository itself is private or public. |
| **remote** | `none` \| `<url>` | Whether the repository has no remote at all, or a named remote URL. |
| **facing** | `inward` \| `outward` | Local-only (coordination via the memo ID) vs published (coordination via GitHub Issues). |

The `facing` axis is the original one and carries the egress convention (rule C1): an **outward** repository routes coordination through **Issues**, an **inward** repository through the **memo ID**. It is the same field the project-architecture knowledge bundle records for a repository (see [41-project-architecture.md](/specification/project-architecture/)); the configuration is where a project **declares** it. The two newer axes — `visibility` and `remote` — sharpen what a push gate can decide: a repository may be `public` yet have no remote, or carry a remote yet still be `inward`. Stating all three once is what lets a rule be applied consistently and, where desired, enforced.

A per-repository status record carries all three fields:

```jsonc
// .workbench/ — per-repository status; declared by hand, read by enforcement
{
  "repos": [
    { "name": "spec",     "visibility": "public",  "remote": "<published-remote-url>", "facing": "outward" },
    { "name": "internal", "visibility": "private", "remote": "none",                  "facing": "inward"  }
  ]
}
```

The three axes are **declared, not inferred** — consistent with the manual / no-auto-write principle stated above: a process records a repository's status, it does not derive it from the repository's current git state. This record is precisely what deterministic enforcement reads — the push gate and the verification checks in the hooks contract ([23-hooks-contract.md](/specification/hooks-contract/)) consume these fields rather than guessing a repository's exposure.

---

## Beyond Facing — Other Declared Files

The facing classification is the configuration's core, but `.workbench/` is the home for the project's **declarations** generally — the same single-source principle applies to anything a tool or hook needs to read deterministically. Two other files are specified today:

- **`folder-lints.json`** — the project-local map that drives the write-time content lint: each entry binds a folder and filename pattern to a linter and a severity, and a single global hook consumes the map ([23-hooks-contract.md](/specification/hooks-contract/)).
- **`registry.json`** — the machine-readable form of the SOP signpost ([02-sop-entrypoint.md](/specification/sop-entrypoint/)): the list of skills, custom folders, and requirements (with the signals that prove each ran) that the runtime call-validation searches against. Its **structure is defined once in [20-cli.md](/specification/cli/)**, the single structural owner; this chapter only records that the file lives under `.workbench/`, is manual, and is one of the project's declared files. Its `requirements[]` with `when: "pre"` is the **manual dependency table** the precondition chain reads — the declared `entrypoint → requires` edges. This is what makes "no skill X without prerequisite Y, deterministically" expressible: the pre-gate hook resolves these edges before an entry point runs ([23-hooks-contract.md](/specification/hooks-contract/)), while the `when: "post"` edges feed the after-the-fact matrix ([20-cli.md](/specification/cli/)).

Like the facing configuration, both are **manual** — never silently generated or overwritten.

---

## Derivation — One Source, Many Consumers

The configuration is valuable because other things are **derived** from it rather than re-declared. The primary consumer is the **hooks contract** ([23-hooks-contract.md](/specification/hooks-contract/)): the manual declaration of facing (and of other project policy) is what a hook reads to decide, deterministically, whether an action is allowed — for example, whether a push to a repository declared inward should be blocked.

The **memo system** is the other consumer of `facing`: it is the custom folder that reads the inward/outward classification to route coordination — an **inward** repository's work is coordinated through the **memo ID**, an **outward** repository's through **Issues** (rule C1). The configuration declares the facing once; the hooks contract enforces it, and the memo system obeys it when it decides how a repository's commits are referenced.

The principle is the division of responsibility introduced in [02-sop-entrypoint.md](/specification/sop-entrypoint/): **the workbench declares policy** here, in the `.workbench/` configuration; **the machine tier enforces it** through hooks. The configuration is therefore the contract surface between the two — the single, manual, readable source that enforcement consumes. What enforcement may read and how it behaves is specified next.

---

## Conformity Requirements

The configuration is the contract surface enforcement reads, so its shape and its manual discipline are both checkable. The blocks below encode this chapter's binding rules prose-first — each `statement` faces how the configuration is authored, and each `check` faces the structure audit and the no-auto-write discipline. They are the source the requirement store is harvested from ([../../v0.1.0/23-requirements.md](/specification/requirements/)).

That a status record carries all three axes is a structural fact about the file's shape:

```requirement
{
  "id": "REQ-959",
  "title": "Each per-repository status record declares all three axes",
  "statement": "Each per-repository status record in the project configuration MUST declare all three axes — `visibility` (`private` | `public`), `remote` (`none` | a URL), and `facing` (`inward` | `outward`). Stating all three once is what lets a push gate decide consistently; a record that omits an axis cannot be read deterministically by enforcement.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["config", "facing", "schema"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each repository entry carries a `visibility` field with an allowed value",
      "Each repository entry carries a `remote` field (`none` or a URL)",
      "Each repository entry carries a `facing` field with an allowed value"
    ]
  },
  "grade": "binary"
}
```

Whether the configuration was authored by hand and never silently overwritten is a behavioural discipline judged over how a tool touches the file, so this rule earns an object `grade`:

```requirement
{
  "id": "REQ-960",
  "title": "The project configuration is manual, never silently generated",
  "statement": "The `.workbench/` configuration — the facing status, `folder-lints.json`, and `registry.json` — MUST be written and maintained by hand and MUST NOT be silently auto-generated or overwritten. Where tooling assists, it proposes a change for the developer to accept; a process records a repository's status, it does not infer it from the repository's current git state.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["config", "no-auto-write"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A reviewer inspects any tool that touches the `.workbench/` configuration. PASS when the tool only proposes changes for acceptance and never writes the file silently; BLOCKED when a tool generates or overwrites the configuration without review; INCONCLUSIVE when no tool touches the configuration.",
    "verify": [
      "Identify each writer of the `.workbench/` configuration",
      "Confirm each writer proposes-then-accepts rather than auto-writing"
    ]
  },
  "grade": { "dimension": "no-auto-write adherence", "weight": 100 }
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [23-hooks-contract.md](/specification/hooks-contract/) — the contract that consumes this configuration.
- [12-folders.md](/specification/folders/) — `.workbench/` as the optional folder that holds this configuration.
- [41-project-architecture.md](/specification/project-architecture/) — `facing` as a recorded repository attribute.
