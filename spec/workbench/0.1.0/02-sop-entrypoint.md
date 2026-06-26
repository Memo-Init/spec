# 02. Workbench-SOP and the Two-Level Model

| | |
|---|---|
| Status | Draft |
| Depends on | [00-overview.md](./00-overview.md), [01-philosophy.md](./01-philosophy.md) |
| Related | [10-root-and-projects.md](./10-root-and-projects.md), [22-config.md](./22-config.md), [23-hooks-contract.md](./23-hooks-contract.md), [The SOP Spec](/sop/overview/) |

This is the **Workbench-SOP entry point**: the signpost for the workbench scope. The workbench has two structural levels, and each is governed by its **own** thin instance of the common SOP standard ([SOP spec](/sop/overview/)) — the **Root-SOP** and the **Projects-SOP** (named in the SOP [instance register](/sop/instances/)). This entry point does not itself hold either procedure; it names the two levels and **routes** to whichever instance the agent's location selects, and each instance **extends** the standard by realizing its **Setup**, **Health**, and **Update** for its level — plus the workbench's own **extras** (the wiki and project conventions). It is the smallest entry point: the thing an agent reads first, on every fresh start, to learn where it is and what it may do. The standard's definitions live in the [SOP spec](/sop/overview/) and are referenced here, not restated; this chapter adds how an agent enters the workbench and the two levels — and the two SOPs — it distinguishes.

---

## Two Levels: Workbench and Project

The workbench distinguishes exactly **two** levels of operation. Each level has a plain "works when…" test and a corresponding mode of work.

| Level | Works when… | Mode of work |
|-------|-------------|--------------|
| **Workbench** | the system of projects runs | No project work. Setup, health, and update of the workbenches themselves — does each project exist with the expected structure, are the shared tools reachable. |
| **Project** | project-specific work runs | Project-related work is carried out — memos, repositories, the project's own tooling. |

An agent **MUST** determine which level it is operating at before it acts, because the permitted actions differ: at the workbench level it organizes and checks; at the project level it does the project's work. Each level is governed by its **own** thin SOP — the **Workbench level by the Root-SOP**, the **Project level by the Projects-SOP** — and this entry point routes to the matching one by the agent's location. The two SOPs and their routing are specified in [10-root-and-projects.md](./10-root-and-projects.md), which also draws the boundary between the workbench root and the projects beneath it, and they are named as the two workbench instances in the SOP [instance register](/sop/instances/).

---

## Why There Is No Machine Level

A third, lower level — the **machine** (the host, the global `~/.claude/` configuration, the operating system) — is **not** part of this two-level model. The workbench begins at the **workbench folder**: projects and Claude Code instances elsewhere on the same machine are out of its scope. The machine tier is real, but it is **not used by the workbench system as a level of operation**, and it is specified separately (see "The Machine Tier" below).

---

## Smallest Entry Point and Self-Discovery

The workbench-SOP is loaded on **every** fresh start. It is deliberately the **smallest** thing that has to be read to orient: it names the two levels, points at the SOP standard, and hands off to the relevant chapters. It does not restate the whole specification.

From that entry point an agent performs **self-discovery**:

- Through the [SOP spec](/sop/overview/) it learns to read any SOP **predictably** — what a SOP contains (Setup, Health, Update, and scope-specific extras) and where to find each part.
- Which SOP applies in a given folder follows from **where the agent is**: the workbench-SOP at the workbench root, a project's own conventions inside a project.

The workbench level **SHOULD** make this determination cheap — a predictable layout and a single entry point — so that an agent re-entering after a context reset can re-orient without re-reading the entire specification.

Beyond explaining the scope, the SOP **names the entry points** that work flows through, so an agent knows the few doors into the system rather than guessing them. The workbench's main entry points are: the **workbench-SOP itself** (read first, every session); each **add-on's SOP** ([26-addons.md](./26-addons.md)), the memo system's SOP first among them; and the **shared tools** the signpost lists (the CLIs and skills present at the workbench root). These entry points are exactly where the PreToolUse preconditions attach — the machine tier gates them so the right SOP is loaded before a tool runs (see [23-hooks-contract.md](./23-hooks-contract.md)).

---

## The SOP Is a Signpost, Not a Container

The workbench-SOP does not *contain* the procedures for everything in the workbench; it **points** to them. It is a **signpost** — a connecting layer, not a container — in the spirit of a dynamic `CLAUDE.md` that loads per session, carries the current inventory of tools, and routes downward to the skills and specs that hold the detail. The workbench-SOP names the levels and the tools that are present, and for each one it points at that tool's own SOP.

This is why **SOPs contain SOPs**. The workbench-SOP references each **add-on's** SOP ([26-addons.md](./26-addons.md)) — the memo system's SOP first among them, as the weightiest add-on — and each add-on SOP is itself Setup/Health/Update plus its extras. Following the signpost reaches the right procedure without the top-level SOP swelling into a monolith:

```
Workbench-SOP (signpost — knows the levels and the add-ons present)
├── memo-SOP            (the weightiest add-on's SOP)
├── <other add-on>-SOP  (a large add-on's SOP)
└── …                   (each add-on: Setup · Health · Update · Extras)
```

The machine-readable form of this signpost is the **workbench registry** (`.workbench/registry.json`): the same list of SOPs, skills, and add-ons that the signpost expresses in prose, in a form a tool can read. Its fields and its use by the runtime call-validation are specified in [20-cli.md](./20-cli.md).

How each add-on SOP fans out into its public orchestrators and private components — one level below this signpost cascade — is shown in [24-skills-scope.md](./24-skills-scope.md).

---

## SOP-Native, Not Inert Files

The signpost works only because the things it points at are **SOP-native** rather than inert files. A good static file in the workbench is **declared** (it is a registered folder or a named policy), **consumed by a named process** (a skill, a hook, the wiki), and **health-checked**. A registered folder, for instance, is declared in the contract, its content is checked on write, its entry point is validated, its usage is measured after the fact, and it is findable through the wiki — it is governed, not magic. The signpost can route to a thing precisely because that thing announces what it is and what consumes it, instead of sitting as one more file in an undifferentiated pile.

---

## Enforcement Is the Machine Tier's Job

Self-discovery describes what an agent *should* do. Making it **deterministic** — guaranteeing that the correct SOP is loaded before a tool runs, regardless of model behavior — is the job of the **machine tier**, through Claude Code hooks. The workbench level declares the policy; the machine tier enforces it. The contract between the two is specified in [23-hooks-contract.md](./23-hooks-contract.md); the enforcement mechanism itself is out of scope for this spec (below).

---

## The Machine Tier (Out of Scope)

> **Informative.** This section records a deliberate scope boundary and the rationale for it. It is forward-looking guidance, not a normative requirement of this spec.

The machine tier is **deliberately excluded** from this specification and left to a separate, future machine-tier spec. The reason follows from the level model above: the workbench begins in the workbench folder, while the machine tier governs the host globally (`~/.claude/`, the OS, every Claude Code project on the machine, not only those under the workbench).

The existing arrangement is left as it is for now. In particular:

- **The git workflow stays at the project/memo level.** Git flow and the memo-ID convention remain where they are today. The clean three-way cut between machine, workbench, and project is sound in principle but is **deferred** until the hook mechanics are well understood.

A reasonable shape for the future machine-tier spec — recorded here as guidance, not as a commitment — is that it would be the natural home for:

- the security-hook system that filters dangerous shell commands;
- the global hooks under `~/.claude/hooks/` (for example an environment-file guard and a commit-message guard);
- the convention that real environment files live in the parent directory and that local tooling binds to loopback only;
- the **deterministic enforcement of the SOP** via PreToolUse gates (specified as a contract in [23-hooks-contract.md](./23-hooks-contract.md)).

The division of responsibility is the load-bearing idea: **the workbench declares policy** — primarily through the manual `.workbench/` configuration ([22-config.md](./22-config.md)) — and **the machine tier enforces it**. Locating enforcement at the machine tier lets it apply where it must apply globally (`~/.claude/`), while the workbench itself stays portable. A future machine-tier spec should also make clear that it serves **only** projects under the workbench-folder system.

---

## Related

- [00-overview.md](./00-overview.md) — the sibling-spec framing and the scope of this spec.
- [10-root-and-projects.md](./10-root-and-projects.md) — the workbench-root vs. project boundary.
- [22-config.md](./22-config.md) — the `.workbench/` configuration, where the workbench declares policy.
- [23-hooks-contract.md](./23-hooks-contract.md) — the contract the machine tier consumes to enforce policy.
- [26-addons.md](./26-addons.md) — the add-on SOPs the signpost points at, the memo system first among them.
- [20-cli.md](./20-cli.md) — the `.workbench/registry.json`, the machine-readable form of the signpost.
- [24-skills-scope.md](./24-skills-scope.md) — how each add-on SOP fans out into orchestrators and components, one level below this cascade.
- [The SOP spec](/sop/overview/) — the common SOP standard of which the workbench-SOP is an instance.
