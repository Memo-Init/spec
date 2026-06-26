# 26. The Add-On Model

| | |
|---|---|
| Status | Draft |
| Depends on | [12-folders.md](./12-folders.md), [24-skills-scope.md](./24-skills-scope.md) |
| Related | [22-config.md](./22-config.md), [20-cli.md](./20-cli.md), [25-validation-overview.md](./25-validation-overview.md), [02-sop-entrypoint.md](./02-sop-entrypoint.md) |

An **add-on** is a tool that plugs into the workbench: it is provided globally, it reserves a small declared area inside a project, and it follows a common SOP so that every add-on is operated the same way. This chapter specifies the add-on model — where an add-on may write, the SOP it follows, its standard entry points, and the relationship between its CLI and its skill. The taxonomy that distinguishes an add-on (a tool) from a convention (a content format) is in [12-folders.md](./12-folders.md).

---

## The Memo System Is the Weightiest Add-On

The single, authoritative statement about the memo system's place is made here, so it is not repeated inconsistently elsewhere: **the memo system is an add-on — the weightiest, recommended one.** There is **one** add-on model for every tool; the memo system is not a conceptual special case, only a heavier instance of the same model. It is the recommended default way of working, which is why a real project almost always carries it, but the workbench *core* does not depend on it ([12-folders.md](./12-folders.md)). Other chapters that touch this — the folder split, the SOP signpost — point **here** rather than restating it.

---

## Tool Global, Data Project-Bound

The defining tension an add-on resolves is that the **tool is global** while its **data is project-bound**. The model holds both at once:

- **Declaration and policy** go into the project's `.workbench/` area — a tool **MAY** reserve a small descriptor there for its project-specific configuration ([22-config.md](./22-config.md)).
- **Work data** goes into the project's existing content folders — `data/` for raw input, `context/` for processed material ([12-folders.md](./12-folders.md)) — and, as the normal mode, flows **through the memo system** rather than into a private store.
- An add-on **MUST NOT** claim its own new top-level project folder for its data; the registered-folder contract flags an unexpected top-level entry for review ([12-folders.md](./12-folders.md)).

The reservation is for *configuration and the specific*, not for bulk data. This also bounds what can be checked: the effective lint surface for an add-on is its small `.workbench/` descriptor, **not** the gigabytes of data a tool may keep in its own global store. A tool needs an area to differing degrees — the memo system needs one for certain, a lighter tool may need only a descriptor or none.

---

## The Add-On Landscape

Add-ons span a wide size range, and the model is not forced uniformly onto all of them — the weight of the add-on sets how much SOP it needs:

| Add-on | Weight | Data | Custom steps |
|--------|--------|------|--------------|
| **memo system** | heaviest | `.memo/` + `context/` | the full memo lifecycle |
| **a very large add-on** | very large | a multi-GB global store; many provider keys | search/list → call |
| **a medium add-on** | medium | a two-tier config | unlock → upload → format |
| **a small add-on** | small/medium | a global store | a gate before an install |
| **a one-command add-on** | small | none (stdout only) | one command |

A heavy add-on earns a deep SOP with real Setup, Health, Update, and several Extras; a one-command tool needs little more than a single entry point. The point is one frame at all sizes, scaled to weight — not a separate model per tool.

---

## The Per-Add-On SOP

Every add-on follows the same four-part SOP — the common denominator the workbench skills already use ([24-skills-scope.md](./24-skills-scope.md)):

| Part | For an add-on |
|------|---------------|
| **Setup** | Bring the add-on into its expected state for a project (link the CLI, write the `.workbench/` descriptor). |
| **Health** | Report whether the add-on is correctly installed and reachable, and whether its declared state is intact. |
| **Update** | Roll a central improvement to the add-on out to the projects that consume it. |
| **Extras** | The tool-specific capabilities — the only part that differs between add-ons. |

The **frame is identical** across add-ons; only the Extras are tool-specific. The integration between an add-on and the workbench falls into a few recurring **cascades** — *data* (where its material lands), *gate* (a check it enforces, such as a pre-install gate), *config* (what it declares in `.workbench/`), and *knowledge* (what it contributes to the wiki). Naming the cascade kind makes an add-on's footprint predictable.

---

## Standard Entry Points — Health and Migrate

Two entry points are **normalized across all add-ons** so that tooling can drive any add-on without special-casing it:

- **Health** — a uniform "is this add-on in order?" check.
- **Migrate** — a uniform "bring this add-on's project data to the current shape" step (for many add-ons this slot is currently empty; that is acceptable).

Existing tools expose these under divergent names (`memo health`, and the various tool-specific status/info/session verbs an add-on already ships). Those names are kept as **aliases** of the standard entry points; the normalization is to a common vocabulary, and renaming an existing tool is deliberately **deferred** rather than forced now.

---

## CLI Is the Standard Entry, the Skill Orchestrates

An add-on is reachable two ways, with a clear division of labor:

- The **CLI** (`<tool> health`, `<tool> migrate`) is the **standard entry point** — deterministic, machine-checkable, and **greppable**. Because the call is a plain command, an after-the-fact validator can detect from the transcript that it ran ([20-cli.md](./20-cli.md), [25-validation-overview.md](./25-validation-overview.md)).
- The **skill** is the **orchestrator** above it — the AI-facing entry point that sequences steps, asks the right questions, and calls the CLI to do the deterministic work.

**Standardization happens at the CLI level**, because that is the layer a validator can verify mechanically. The skill provides judgment; the CLI provides the checkable, repeatable action. This is the same split the workbench applies to its own skills ([24-skills-scope.md](./24-skills-scope.md)) and the seam the runtime call-validation measures against.

---

## Related

- [12-folders.md](./12-folders.md) — the Convention-vs-Add-On taxonomy and the core-vs-add-on folder split.
- [24-skills-scope.md](./24-skills-scope.md) — the Setup/Health/Update/Extras SOP an add-on's skill realizes.
- [22-config.md](./22-config.md) — the `.workbench/` descriptor an add-on declares.
- [20-cli.md](./20-cli.md) — the Branch/Leaf CLI convention an add-on's standard entry follows.
- [02-sop-entrypoint.md](./02-sop-entrypoint.md) — the Workbench-SOP that points at each add-on's SOP.
