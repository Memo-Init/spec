---
title: "repos/"
description: "`repos/` is the one place in a project where a git **remote** lives. It holds the project's repositories — and **only** the repositories — so that everything shareable is isolated behind an explicit..."
workbench_version: "0.3.0"
spec_file: "15-repos.md"
order: 15
section: "Workbench"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "workbench/0.3.0/draft/spec/15-repos.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: workbench/0.3.0/draft/spec/15-repos.md."
---


`repos/` is the one place in a project where a git **remote** lives. It holds the project's repositories — and **only** the repositories — so that everything shareable is isolated behind an explicit boundary while the rest of the project stays local. Versioning itself is not confined this way: any folder **MAY** carry a local, remote-less git repository for backup and findability. What `repos/` reserves is the ability to attach a remote and push. This is the per-folder page for `repos/`; the rules it gathers are specified normatively in the chapters it links to.

---

## Folder Contract

```folder
{
  "name":       "repos/",
  "status":     "mandatory",
  "level":      "project",
  "entryPoint": null,
  "convention": null,
  "purpose":    "The project's git repositories — one domain per repository; the only remote-bearing git units in the project.",
  "goesIn":     "Git repositories under repos/<name>/, one per domain.",
  "doesNot":    "Non-repository material; any remote attached outside repos/ (any folder MAY carry a local, remote-less git for versioning, but never a remote).",
  "git":        "recommended",
  "remote":     "allowed"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](/workbench/folders/)) and the derived project config are generated from. `repos/` is the one folder whose `remote` is `allowed`: it is the sole home for a git remote, so a local git here is `recommended` and a remote may be attached.

---

## One Domain Per Repository

A repository under `repos/<name>/` is a **single-domain code unit**. A project is a coherent context that may hold several such repositories — one per domain — rather than a single repository carrying unrelated concerns. The project, not the repository, is the unit of organization (see [00-overview.md](/workbench/overview/)); `repos/` is where that project's code is partitioned into domains, each its own git unit.

---

## Repository Layout

The target layout of a Node.js repository is the one fixed in [A Fixed and Expectable Repository Structure](#a-fixed-and-expectable-repository-structure): `src/` for the sources, `dist/` for the build output, `tests/` for the tests. This section does not restate that norm; it records, per repository of the organization, where the layout is met and where it deviates, with the reason. Every test file stands in `tests/`, so a repository that keeps a test elsewhere lists that place in the table. A deviation that is not listed here is a finding.

| Repository | `src/` | `dist/` | `tests/` | Deviation |
|---|---|---|---|---|
| `core` | none | none | yes, every test file | a command-line and skill repository: the code lives in `cli/`, `lib/`, `scripts/`, `skills/` and `templates/` instead of `src/`; nothing is built, so there is no `dist/`; a test fixture that only sits in a folder named `test/` is data, not a test, and stays beside the test that loads it |
| `viewer` | yes | none | yes, every test file | the server runs from its sources, so there is no build output and no `dist/` |
| `spec` | none | per family, under each version | none | a document repository without runtime code: the chapters are the product, and the build output of each family version is its `dist/` |
| `prompt-generator` | yes | none | yes | the module is used from its sources, so there is no `dist/` |
| `memo-init.github.io` | yes | built, not versioned | none | a website: `dist/` is produced by the site build and ignored by git, static assets live in `public/`, and the site has no test suite |
| `.github` | yes | built, not versioned | none | the organization profile: a small generator in `src/` renders the profile text; it has no test suite |

---

## Git Everywhere, Remote Only in `repos/`

Versioning and publication are two different acts, and the workbench draws its boundary at **publication**, not at git itself.

- **Git everywhere, for versioning.** Any folder in a project **MAY** carry its own local git repository — the project root, `.memo/`, the `spec/` workshop, a scratch folder — purely for backup, history, and findability. Such a repository has **no remote**: it records history locally and can never be pushed. This is already the lived practice: the project-local `spec/` workshop container keeps a local git with no remote, for provenance.
- **Remote only in `repos/`.** A git **remote** — the thing that makes a repository publishable — **MUST** only be attached to a repository under `repos/`. A remote on any folder outside `repos/` is refused (the remote gate, [22-config.md](/workbench/config/)).

The consequence is still sharp, but re-grounded: material that needs to be shared is placed in a repository under `repos/`, where a remote is allowed; material that must stay local is versioned anywhere else, remote-less, and cannot be pushed because it has nowhere to push to. Pushing remains a deliberate act scoped to a single `repos/` repository, never something that can sweep up the whole project. The local guarantee ([11-project-structure.md](/workbench/project-structure/)) rests on this confinement of **remotes**, not on the absence of git.

> **BREAKING.** This **inverts** the earlier semantics. Earlier drafts made `repos/` *the only place git lives* and treated any git repository outside `repos/` as a blocker — the local guarantee was grounded on the *absence of git* at the root and under `.memo/`. The norm is now **git everywhere for versioning, remote only in `repos/`**: a local, remote-less git outside `repos/` is normal and permitted, and the guarantee is grounded on the *confinement of remotes* instead. Any tool or check that flagged "a git repository outside `repos/`" **MUST** be re-pointed to flag "a *remote* outside `repos/`". The version implication of this breaking change is handled by a later step.

---

## Each Repository Declares Its Status

A repository declares its **status** — three axes, all stated once in the project configuration ([22-config.md](/workbench/config/)): **visibility** (`private` or `public`), **remote** (`none` or a named URL), and **facing** (`inward` or `outward`). The facing axis drives the coordination convention (rule C1): an **outward** repository routes coordination through public **Issues**; an **inward** repository routes it through the **memo ID**. Visibility and remote are declared the same way and read by the **same enforcement** — the push gate consumes all three rather than inferring exposure from git state. The `facing` attribute is also the one the project-architecture bundle records per repository ([41-project-architecture.md](/workbench/project-architecture/)), so a repository's role is stated in one vocabulary and read consistently by both the configuration and the architecture graph.

The declared status is not taken on trust. The workbench **health-check** and **git-security** verify it — the declared visibility, remote, and facing **MUST** match the repository's actual state — and a push is **gated** by the declared status (a push to a repository declared `inward` is blocked; see [23-hooks-contract.md](/workbench/hooks-contract/)).

---

## A Fixed and Expectable Repository Structure

A repository has a fixed structure that is the same across the different repositories, so that a reader who knows one knows where to look in the next. For a Node.js repository that structure has `src/`, `dist/` and `tests/` at its root. All tests live in `tests/`, and none stays behind elsewhere. `src/` holds no test files, or the repository states a strategy that decides exactly where a test file may stand instead. What matters is a structure that stays expectable; the expectable part is kept, and a deviation from it is documented as a deviation in the correct form.

---

## Data That Belongs Outside Repositories

Storing data in a repository that belongs outside repositories is forbidden. Memo material, plans, scratch output and torn-down working files have their own folders in the project ([12-folders.md](/workbench/folders/)); a repository holds only what belongs to its one domain.

---

## Documentation in a Repository

A repository carries as little documentation as possible. The documentation is either a separate project or held locally, never both and never spread across the repository. The README introduces the repository in neutral, outward-facing language, and a template is worked through for the README so that every README has the same structure. Storing further Markdown files in a repository is discouraged from now on. Such files are regarded as a security risk, because they carry statements that nobody checks against the code; communication with agents runs through identifier references and short comments in the code, and documentation that is needed is moved out to keep the separation clear.

---

## Comments in Code

A comment is short and is a described reference, not documentation moved into the code. A comment marked with `//` instead of `/* */` leaves unclear where it begins and where it ends, so the block form is preferred where a comment spans more than a line. In the time of agents, each agent writes its own comment, or it makes visible that it has rewritten an existing one. A comment that carries a memo or work-item identifier in a fixed form can be found by a pattern search; a long comment loses its value through its length.

---

## Where Repository Architecture Is Specified

The architecture of repositories — the structure, the comments and the documentation rules above in their detail — is specified in the architecture area of the specification from now on. This page states the rules that apply to every repository under `repos/`; the architecture area holds their elaboration.

---

## Environment Variables Through an Environment Manager

In a large project all environment variables are introduced through an environment manager. The variables are loaded into the module with `.get()`, and a missing variable fails loud. The environment manager is the shield that keeps null values out of the module. When the data is read through a query and a value is missing, the manager throws an error instead of returning an empty value. A proven reference implementation exists in another project of the organization, and its structure is studied closely and defined here in a general sense, so that every project follows the same pattern.

---

## Conformity Requirements

The `repos/` rules are structural and verified rather than trusted. The blocks below encode this chapter's binding `MUST`s prose-first — each `statement` faces how a project's code is partitioned, and each `check` faces the workbench health-check and git-security. They are the source the requirement store is harvested from ([23-requirements.md](/specification/requirements/)).

That `repos/` holds only single-domain repositories and is the only home for a remote is a structural fact:

```requirement
{
  "id": "REQ-955",
  "title": "repos/ holds only single-domain repositories and is the only home for a remote",
  "statement": "Every entry under `repos/<name>/` MUST be a single-domain git repository, and `repos/` MUST be the only place a git remote is attached — no folder outside `repos/` carries a remote, though any folder MAY carry a local, remote-less git for versioning. `repos/` MUST NOT hold non-repository material, and a domain carrying unrelated concerns MUST be split into separate repositories rather than combined into one.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["repos", "git-structure"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each immediate child of `repos/` is a git repository",
      "No git remote is configured outside `repos/` in the project",
      "No non-repository material sits directly under `repos/`"
    ]
  },
  "grade": "binary"
}
```

A declared status that contradicts the repository's real git state is a hard failure, so the verification rule's `grade` is `binary`:

```requirement
{
  "id": "REQ-956",
  "title": "A repository's declared status matches its real git state",
  "statement": "Each repository's declared three-axis status — visibility, remote, facing — MUST match reality: a repository declared `outward` MUST actually have its named remote, and one declared `inward` MUST have no remote (or `none`). The status is declared once in the project configuration and verified, not trusted; a declaration that contradicts the repository's real git state is a failure that the health-check and git-security surface.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["repos", "git-status", "facing"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each repository declared `outward` has its named remote configured",
      "Each repository declared `inward` has no remote, or `none`",
      "Every repository under `repos/` carries a declared status record"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [11-project-structure.md](/workbench/project-structure/) — the local guarantee: `repos/` as the only sanctioned home for shareable code.
- [12-folders.md](/workbench/folders/) — the folder contract this page is the registered entry for.
- [22-config.md](/workbench/config/) — the per-repository status declaration (visibility, remote, facing), rule C1, and the remote gate that refuses a remote outside `repos/`.
- [41-project-architecture.md](/workbench/project-architecture/) — the repositories as nodes in the project's architecture graph.
