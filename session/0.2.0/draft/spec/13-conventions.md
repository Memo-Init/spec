# 13. Conventions

| | |
|---|---|
| Status | Draft |
| Depends on | [10-sop.md](./10-sop.md) |
| Related | [11-common-denominator.md](./11-common-denominator.md), [12-instances.md](./12-instances.md) |

This chapter records the cross-cutting conventions the system already follows in practice — how registered units are named, how the words *folder* and *folders* are kept apart, how the writing stays brief, and the fixed shape a per-folder page opens with — so that they are documented once rather than re-derived per scope. Where a convention is a real rule rather than a habit, it is stated with the conformance key words and is normative; the descriptive framing around it is context.

The conventions below are not specific to any one SOP. They apply wherever skills, CLIs, and SOP prose appear, which is why they live in the connecting mechanism rather than in a single instance.

---

## Naming Convention

Registered skills and CLIs use a lowercase `prefix-hyphen-name` form. The leading segment is a **prefix** that names the family the unit belongs to (`memo-`, `repo-`, `node-`, `workbench-`, …); the remaining segments name the unit within that family. A registered skill or CLI **MUST** follow this form.

The prefix is the **discovery handle**: it is how a unit is found and grouped, not merely a label. A reader or agent that knows the family prefix can enumerate the family and locate the unit without knowing its full name in advance. The prefix is also the first-class **namespace** a registrant block reserves in the session config ([06-namespace-registry.md](./06-namespace-registry.md)); the lookup mechanism — the registry and CLI convention — is defined in its own scope, and this chapter only fixes the naming shape it relies on.

---

## Brevity Convention

The system keeps references and headings short, so that names carry the signal and prose carries the explanation.

- **Folder references.** A folder is referred to by a short name with a **trailing slash** — `repos/`, `context/`, `.memo/`, `.trash/`, `.tmp/`. The trailing slash **is** the folder signal; long quoted descriptions of a folder are not used in its place. Authors **SHOULD** use this form whenever a folder is named in prose.
- **Section headings.** Headings are kept short. Any explanatory sentence belongs in the body prose beneath the heading, not in the heading itself. A heading names the section; the first sentence of the body explains it.

Together these keep an SOP scannable: a reader sees the structure from the headings and the locations from the slashed names, and reads prose only where explanation is actually needed.

---

## Folder vs. Folders — One Marker, One Vocabulary

A second naming distinction keeps two uses of the word *folder* apart, so that the singular and the plural are never read as the same thing:

- **A "folder" (singular)** is the session genesis-root marker — `.session/`, the single folder whose presence marks where a session is rooted ([01-genesis-root.md](./01-genesis-root.md)). The genesis tier owns exactly this one folder.
- **"folders" (plural)** are the registered project vocabulary a *Tool* owns — the fixed set of named folders every project shares. Their tiers and taxonomy are the Workbench spec's concern; [workbench/12-folders.md](/workbench/folders/) is the authoritative owner of the folder tiers.

The session tier names the singular marker; the plural taxonomy lives one tier up. Pushing the naming rule down to here lets both tiers use the words consistently without the genesis root having to carry the workbench's folder set.

---

## The Folder-Page Contract

A registered folder substantial enough to warrant its own page — a *per-folder page* — opens with a **Folder Contract**: a compact block, in a fixed shape, that states the folder's identity before its prose begins. The contract is defined once here, at the tier that owns naming and convention, so the per-folder pages reference **down** into this shape rather than each inventing its own header (the push-down principle, [00-overview.md](./00-overview.md)).

The Folder Contract is **machine-readable**: a per-folder page **MUST** open with a fenced ` ```folder ` block — a small JSON object — that carries the folder's full identity. The block is the **authored source of truth** for that folder; the human-readable presentation, the central registry table in [workbench/12-folders.md](/workbench/folders/), and the derived project configuration are all **generated from** these blocks rather than hand-restated beside them — the same *derive, do not restate* discipline the folder registry already carries. Making the contract a parseable block — the move the requirement blocks already make on the folder registry — is what lets a generator assemble the overview and the config, and lets a completeness lint check that every registered folder is fully specified.

A `folder` block carries these fields:

```folder
{
  "name":       "repos/",
  "status":     "mandatory",
  "level":      "project",
  "entryPoint": null,
  "convention": null,
  "purpose":    "one line — what the folder is for",
  "goesIn":     "what belongs in the folder",
  "doesNot":    "what does NOT belong in it",
  "git":        "recommended",
  "remote":     "allowed"
}
```

| Field | Meaning | Values |
|-------|---------|--------|
| `name` | the registered folder name, with trailing slash | e.g. `repos/`, `.memo/` |
| `status` | the required-or-optional status | `mandatory` \| `optional` \| `reserved-default-on` \| `conditional` |
| `level` | where the name is expected | `root` \| `project` \| `both` |
| `entryPoint` | the file or sub-folder opened first | string, or `null` when there is none |
| `convention` | the named content format the folder follows | string, or `null` when none |
| `purpose` | one line — what the folder is for | string |
| `goesIn` | what belongs in the folder | string |
| `doesNot` | what does NOT belong in it | string |
| `git` | whether the folder is expected to carry its own local git history | `recommended` \| `discouraged` |
| `remote` | whether a git remote may be attached to the folder | `allowed` \| `forbidden` |

The first eight fields are the identity a page and the central table share: the first six are exactly the columns of the Workbench folder-contract table ([workbench/12-folders.md](/workbench/folders/)), and the **`goesIn` / `doesNot`** pair is the in/out boundary a dedicated page has room to state. The last two — **`git` and `remote`** — lift the folder's git posture out of scattered prose ([workbench/11-project-structure.md](/workbench/projects/) and the dot-prefix convention) into two explicit, checkable keys: `git` says whether a folder is expected to carry its own local history, `remote` whether a remote may ever be attached to it. These are the folder's **defaults**, and they are **user-overridable** through the project configuration ([workbench/22-config.md](/workbench/config/)): the block states the default posture, and a project may override it per folder without editing the spec. Together the ten keys fix the folder's *whole nature* — which is also exactly what a new folder must supply to attach through the custom-folder mechanism ([workbench/26-addons.md](/workbench/addons/)).

### The Lint-Gate

The Folder Contract is **normative, not advisory** (the MUST above), and it is enforced by a **lint gate**. Two checks act on the block, from two directions:

- **Shape and agreement.** Every per-folder page is checked against the contract: a page missing a required field — or whose `name`, `status`, or `level` disagrees with the central folder-contract table it must agree with — is reported as a violation.
- **Completeness.** Because the blocks are the source the registry and config are generated from, a second check verifies the reverse direction: **every registered folder that warrants a page carries a `folder` block, and every block fills every required key**. A registered folder with a missing or half-filled block is a completeness failure — the machine-readable form is precisely what makes this check trivial where the prose form could not.

The gate is what stops the contract from drifting page by page: because the shape is checked and the set is checked for completeness, a new per-folder page cannot quietly omit its boundary, contradict the registry, or leave a key blank. It carries to the per-folder pages the spec's general posture — a static page is governed only when it is declared and checked, not when it is merely trusted ([02-enforcement.md](./02-enforcement.md)).

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [10-sop.md](./10-sop.md) — why a thin connecting mechanism exists inside the session standard.
- [11-common-denominator.md](./11-common-denominator.md) — the four parts every SOP shares.
- [12-instances.md](./12-instances.md) — the existing SOPs as instances, and the inheritance declaration.
- [workbench/12-folders.md](/workbench/folders/) — the authoritative owner of the folder tiers and the central folder-contract table the per-folder pages mirror.
