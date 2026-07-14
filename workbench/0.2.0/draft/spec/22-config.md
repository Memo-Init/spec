# 22. .workbench/

| | |
|---|---|
| Status | Draft |
| Depends on | [12-folders.md](./12-folders.md), [02-sop-entrypoint.md](./02-sop-entrypoint.md) |
| Related | [23-hooks-contract.md](./23-hooks-contract.md), [41-project-architecture.md](./41-project-architecture.md) |

A project declares what is specific to it in a **manual** configuration under `.workbench/`. The configuration describes each repository's **status** — its visibility, its remote, and its facing — and it is the **single source** from which deterministic enforcement (notably hooks) is derived. This chapter specifies what the configuration holds and the principle by which other things are derived from it.

The `.workbench/` configuration is the **producing side** of the workbench's config/enforcement split: it is declared here as a registered **Folders** page ([12-folders.md](./12-folders.md)), and the workbench **Core** — the hooks contract that consumes it ([23-hooks-contract.md](./23-hooks-contract.md)), the validation overview that indexes that enforcement ([25-validation-overview.md](./25-validation-overview.md)), and the project architecture it structures ([41-project-architecture.md](./41-project-architecture.md)) — reads and enforces it. Config is the folder; enforcement and structure are Core (see the Core category in [00-overview.md](./00-overview.md)).

---

## Folder Contract

`.workbench/` is a registered (optional) folder, and this page is its per-folder entry:

| Field | Value |
|-------|-------|
| Name | `.workbench/` |
| Status | Optional |
| Level | Project |
| Entry-point | `config.json` · `registry.json` |
| Convention | — |
| Purpose | The manual project configuration the workbench core reads. |
| Goes in | The hand-authored declared files — `config.json` (per-repository status), `folder-lints.json`, `registry.json`, and `command-sops.json`. |
| Does not | Auto-generated or silently overwritten configuration; an `id` / `name` / `project-id` field (the folder name is the project id). |

> The Folder Contract follows the fixed per-folder shape defined in the session conventions ([session/13-conventions.md](/session/conventions/)); its first six fields mirror this folder's row in the central contract table ([12-folders.md](./12-folders.md)).

---

## The Configuration Is Manual

The `.workbench/` configuration is **manual**: it is written and maintained by hand, **not** auto-generated. A configuration is a statement of intent — which repositories face the outside world, which stay local — and intent is something a developer declares, not something a tool infers. A process **MUST NOT** silently generate or overwrite the configuration; where tooling assists, it proposes changes for the developer to accept, consistent with the workbench's no-auto-write discipline.

This is the project-level expression of the single-source principle ([01-philosophy.md](./01-philosophy.md)): rather than each tool guessing a repository's exposure, the project states it once, in one file, and everything else reads from there.

---

## Repositories × Status

The core content of the configuration is a per-repository **status** — three axes, each **declared** by hand, never inferred:

| Axis | Values | Meaning |
|------|--------|---------|
| **visibility** | `private` \| `public` | Whether the repository itself is private or public. |
| **remote** | `none` \| `<url>` | Whether the repository has no remote at all, or a named remote URL. |
| **facing** | `inward` \| `outward` | Local-only (coordination via the memo ID) vs published (coordination via GitHub Issues). |

The `facing` axis is the original one and carries the egress convention (rule C1): an **outward** repository routes coordination through **Issues**, an **inward** repository through the **memo ID**. It is the same field the project-architecture knowledge bundle records for a repository (see [41-project-architecture.md](./41-project-architecture.md)); the configuration is where a project **declares** it. The two newer axes — `visibility` and `remote` — sharpen what a push gate can decide: a repository may be `public` yet have no remote, or carry a remote yet still be `inward`. Stating all three once is what lets a rule be applied consistently and, where desired, enforced.

A per-repository status record carries all three fields:

```jsonc
// .workbench/config.json — per-repository status (the repos[] field); declared by hand, read by enforcement
{
  "repos": [
    { "name": "spec",     "visibility": "public",  "remote": "<published-remote-url>", "facing": "outward" },
    { "name": "internal", "visibility": "private", "remote": "none",                  "facing": "inward"  }
  ]
}
```

The three axes are **declared, not inferred** — consistent with the manual / no-auto-write principle stated above: a process records a repository's status, it does not derive it from the repository's current git state. This record is precisely what deterministic enforcement reads — the push gate and the verification checks in the hooks contract ([23-hooks-contract.md](./23-hooks-contract.md)) consume these fields rather than guessing a repository's exposure.

---

## `config.json` — The File, Its Schema, and the Project Id

The repository status above does not float free — it lives in a concrete file: **`.workbench/config.json`**, the entry point the folder registry names for `.workbench/` ([12-folders.md](./12-folders.md)). `config.json` is a **schema'd file**, not free-form JSON: a hook, the health-check, and the structure audit can all rely on its shape.

| Field | Type | Required | Meaning |
|-------|------|----------|---------|
| `repos[]` | array of status records | yes | Per-repository status — `visibility`, `remote`, `facing` (the per-repository status block above). |
| `extraFolders[]` | array of `{ name, reason }` | no | Top-level folders this project uses that the registered layout does not list — declaring one **acknowledges** it, so the structure audit does not flag it as unknown. |
| `folderPolicy.unknownFolder` | `"warn"` \| `"error"` | no (default `"warn"`) | The severity the structure audit raises for a top-level folder that is neither registered nor declared in `extraFolders[]`. |

```jsonc
// projects/{name}/.workbench/config.json — manual; the folder name IS the project id
{
  // no "id" / "name" / "project-id" field — the folder name is the id (see below)
  "repos": [
    { "name": "spec", "visibility": "public", "remote": "<published-remote-url>", "facing": "outward" }
  ],
  "extraFolders": [
    { "name": "vendor/", "reason": "pinned third-party sources" }
  ],
  "folderPolicy": { "unknownFolder": "warn" }
}
```

**The project id is the folder name — never a field.** A project's identity is its directory name under `projects/{name}/`; that name **is** the project id. `config.json` therefore **MUST NOT** carry an `id`, `name`, or `project-id` field: restating the folder name inside a file inside that folder is a second source that drifts the moment the folder is renamed. The id is **read from the path**, and everything that needs it — a memo reference, a wiki title, a health report — derives it from the folder name. This is the single-source principle ([01-philosophy.md](./01-philosophy.md)) applied to the project's own name: hold it in exactly one place, the directory, and read it from there.

**An unknown extra folder is `warn`, not `error`.** A top-level folder that is neither a registered folder ([12-folders.md](./12-folders.md)) nor declared in `extraFolders[]` is **unknown**, and the structure audit **flags it for review at `warn` severity** — surfaced, never silently accepted, but not blocking. `warn` is the right level because a project is explicitly allowed to add folders when it needs them, so an unknown folder is far more often a new, undeclared use than a defect. This is deliberately softer than a **missing mandatory** folder, which is an **`error`** — a structural blocker owned by [12-folders.md](./12-folders.md). A project moves a folder out of the unknown set by **declaring** it in `extraFolders[]`; a project that wants stricter hygiene **MAY** raise `folderPolicy.unknownFolder` to `"error"`.

---

## Beyond Facing — Other Declared Files

The facing classification lives in `config.json`, but `.workbench/` is the home for the project's **declarations** generally — the same single-source principle applies to anything a tool or hook needs to read deterministically. Three further declared files sit beside `config.json`:

- **`folder-lints.json`** — the project-local map that drives the write-time content lint: each entry binds a folder and filename pattern to a linter and a severity, and a single global hook consumes the map ([23-hooks-contract.md](./23-hooks-contract.md)).
- **`registry.json`** — the machine-readable form of the SOP signpost ([02-sop-entrypoint.md](./02-sop-entrypoint.md)): the list of skills, custom folders, and requirements (with the signals that prove each ran) that the runtime call-validation searches against. Its **structure is defined once in [20-cli.md](./20-cli.md)**, the single structural owner; this chapter only records that the file lives under `.workbench/`, is manual, and is one of the project's declared files. Its `requirements[]` with `when: "pre"` is the **manual dependency table** the precondition chain reads — the declared `entrypoint → requires` edges. This is what makes "no skill X without prerequisite Y, deterministically" expressible: the pre-gate hook resolves these edges before an entry point runs ([23-hooks-contract.md](./23-hooks-contract.md)), while the `when: "post"` edges feed the after-the-fact matrix ([20-cli.md](./20-cli.md)).

- **`command-sops.json`** — the **command→SOP matrix**: the declared edges that bind a shell **command class** to the **umbrella SOP** ([session · namespace-registry](/session/namespace-registry/)) that MUST have been read before a command of that class runs. Each entry is form-identical to a `folder-lints.json` entry — `{ class, pattern, requires }` — and one global command-class hook reads the map ([23-hooks-contract.md](./23-hooks-contract.md)) rather than carrying the edges hardcoded as in-script matchers. It MAY equivalently live as a `commands[]` array inside `registry.json`; either way it is declared data the hook reads, never code.

Like the facing configuration, all three are **manual** — never silently generated or overwritten.

---

## Derivation — One Source, Many Consumers

The configuration is valuable because other things are **derived** from it rather than re-declared. The primary consumer is the **hooks contract** ([23-hooks-contract.md](./23-hooks-contract.md)): the manual declaration of facing (and of other project policy) is what a hook reads to decide, deterministically, whether an action is allowed — for example, whether a push to a repository declared inward should be blocked.

The **memo system** is the other consumer of `facing`: it is the custom folder that reads the inward/outward classification to route coordination — an **inward** repository's work is coordinated through the **memo ID**, an **outward** repository's through **Issues** (rule C1). The configuration declares the facing once; the hooks contract enforces it, and the memo system obeys it when it decides how a repository's commits are referenced.

The principle is the division of responsibility introduced in [02-sop-entrypoint.md](./02-sop-entrypoint.md): **the workbench declares policy** here, in the `.workbench/` configuration; **the machine tier enforces it** through hooks. The configuration is therefore the contract surface between the two — the single, manual, readable source that enforcement consumes. What enforcement may read and how it behaves is specified next.

---

## The Remote Gate — A Remote Only Under `repos/`

The `remote` axis is declared per repository, but the configuration also carries a **workbench-wide invariant** that no per-repository declaration may override: a git **remote** may only be attached to a repository under `repos/`. This is the enforcement side of the *git everywhere, remote only in `repos/`* norm ([15-repos.md](./15-repos.md), [11-project-structure.md](./11-project-structure.md)) — the norm that grounds the local guarantee on the confinement of remotes rather than on the absence of git.

- **A remote outside `repos/` is refused.** A push/remote gate — the same enforcement tier that reads the per-repository status ([23-hooks-contract.md](./23-hooks-contract.md)) — **MUST** refuse a remote configured on any folder outside `repos/`: the project root, `.memo/`, the `spec/` workshop, or any other local folder. Attaching such a remote is blocked, and a folder found carrying one fails the check.
- **A local, remote-less git is untouched.** The gate acts on *remotes*, not on git itself. A folder that carries a local git repository for versioning, with no remote, is normal and passes the gate — the boundary is publication, not history.
- **Inside `repos/`, the declared status still governs.** Whether a repository may push is still decided by its declared status: a repository declared `inward` / `remote: none` is blocked from pushing even though it sits under `repos/`. The remote gate adds the outer bound — *never outside `repos/`* — on top of that per-repository rule.

---

## Conformity Requirements

The configuration is the contract surface enforcement reads, so its shape, its manual discipline, and the remote gate it carries are all checkable. The blocks below encode this chapter's binding rules prose-first — each `statement` faces how the configuration is authored, and each `check` faces the structure audit, the remote gate, and the no-auto-write discipline. They are the source the requirement store is harvested from ([../../v0.2.0/23-requirements.md](/specification/requirements/)).

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
  "statement": "The `.workbench/` configuration — the facing status, `folder-lints.json`, `registry.json`, and the `command-sops.json` command→SOP matrix — MUST be written and maintained by hand and MUST NOT be silently auto-generated or overwritten. Where tooling assists, it proposes a change for the developer to accept; a process records a repository's status, it does not infer it from the repository's current git state.",
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

That a remote lives only under `repos/` is a hard yes/no fact about where remotes are attached, so its `grade` is `binary`:

```requirement
{
  "id": "REQ-961",
  "title": "A git remote is refused outside repos/",
  "statement": "A push/remote gate MUST refuse a git remote attached to any folder outside `repos/` — the project root, the memo store, the `spec/` workshop, or any other local folder — while leaving a local, remote-less git repository untouched wherever it lives. Only a repository under `repos/` MAY carry a remote; a remote found outside `repos/` is a blocked configuration, independent of any per-repository status declaration.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["config", "remote-gate", "local-guarantee"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No git remote is configured on any folder outside `repos/`",
      "A local, remote-less git repository outside `repos/` is not flagged",
      "A remote attached outside `repos/` is refused by the gate"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [23-hooks-contract.md](./23-hooks-contract.md) — the contract that consumes this configuration.
- [12-folders.md](./12-folders.md) — `.workbench/` as the optional folder that holds this configuration.
- [15-repos.md](./15-repos.md) — the *git everywhere, remote only in `repos/`* norm this remote gate enforces.
- [41-project-architecture.md](./41-project-architecture.md) — `facing` as a recorded repository attribute.
