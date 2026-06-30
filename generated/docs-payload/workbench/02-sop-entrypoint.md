---
title: "Workbench-SOP"
description: "This is the **Workbench-SOP**, the entry-point signpost for the workbench scope and an instance of the common SOP standard ([the Session spec's SOP area](/session/sop/)) that it **extends** — below..."
workbench_version: "0.1.0"
spec_file: "02-sop-entrypoint.md"
order: 2
section: "Workbench"
normative: false
generated_at: "2026-06-30T22:23:50.208Z"
generated_from: "draft/workbench/0.1.0/spec/02-sop-entrypoint.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/workbench/0.1.0/spec/02-sop-entrypoint.md."
---


This is the **Workbench-SOP**, the entry-point signpost for the workbench scope and an instance of the common SOP standard ([the Session spec's SOP area](/session/sop/)) that it **extends** — below is how the workbench realizes the standard's **Setup**, **Health**, and **Update** for its scope, plus its own **extras** (the wiki and project conventions). It is structurally parallel to the [memo-SOP mirror](/specification/memo-sop-entrypoint/), with one difference: the workbench has **two** structural levels, so the procedure is carried by **two** thin instances — the **Root-SOP** and the **Projects-SOP** (named in the SOP [instance register](/session/instances/)) — and this entry point does not hold either procedure itself; it **routes** to whichever instance the agent's location selects. Its **entry points are named explicitly**: the **Workbench-SOP itself** (read first, every fresh start), each **custom-folder SOP** (the memo system's first among them), and the **shared tools** present at the workbench root. It is the smallest entry point: the thing an agent reads first to learn where it is and what it may do. The standard's definitions live in the [Session spec's SOP area](/session/sop/) and are referenced here, not restated.

---

## Two Levels: Workbench and Project

The workbench distinguishes exactly **two** levels of operation. Each level has a plain "works when…" test and a corresponding mode of work.

| Level | Works when… | Mode of work |
|-------|-------------|--------------|
| **Workbench** | the system of projects runs | No project work. Setup, health, and update of the workbenches themselves — does each project exist with the expected structure, are the shared tools reachable. |
| **Project** | project-specific work runs | Project-related work is carried out — memos, repositories, the project's own tooling. |

An agent **MUST** determine which level it is operating at before it acts, because the permitted actions differ: at the workbench level it organizes and checks; at the project level it does the project's work. Each level is governed by its **own** thin SOP — the **Workbench level by the Root-SOP**, the **Project level by the Projects-SOP** — and this entry point routes to the matching one by the agent's location. The two SOPs and their routing are specified in [10-root-and-projects.md](/specification/root-and-projects/), which also draws the boundary between the workbench root and the projects beneath it, and they are named as the two workbench instances in the SOP [instance register](/session/instances/).

---

## The Machine Level Is the Session Genesis Tier

A third, lower level — the **machine** (the host, the global `~/.claude/` configuration, the operating system) — sits **below** the two-level workbench model. The workbench system still operates at exactly two levels (Workbench and Project): the machine tier is **not** a third *level of operation*. But it is no longer left unspecified. It is now specified as the **Session Genesis Root** — `session-sop` — in its own sibling family, the [Session spec](/session/overview/).

The genesis tier owns what is global per **session** rather than per workbench: the session identity, the per-session security/trust level, and the **deterministic PreToolUse enforcement** that guarantees the right SOP is loaded before a tool runs. The workbench is a **convention layered above** this genesis root; `CLAUDE.md` loads `session-sop` first, and the upper layers inherit the session identity and security level it establishes.

### The Full SOP Chain (declared; enforced once the skills exist)

The entry-point chain is, bottom-up:

```
session-sop  (Genesis Root — session identity, security level, PreToolUse enforcement)
  ↑ workbench-sop   (workbench convention)
  ↑ memo-sop        (memo process)
  ↑ memo-init / flowmcp / …  (domain entry points)
```

The chain is **normatively declared in full**, but each edge is **enforced only once both of its endpoint skills exist**. Declaring an edge whose target skill is not yet built (e.g. `workbench-sop` before it is implemented) MUST NOT create an unsatisfiable precondition: the enforcement gate treats an edge to an absent skill as a configuration error and **fails open** (see [23-hooks-contract.md](/specification/hooks-contract/)). This "declared now, enforced when present" rule is what lets the full chain be written down before every link is built, without ever locking the machine out of its own tools.

---

## Smallest Entry Point and Self-Discovery

The workbench-SOP is loaded on **every** fresh start. It is deliberately the **smallest** thing that has to be read to orient: it names the two levels, points at the SOP standard, and hands off to the relevant chapters. It does not restate the whole specification.

From that entry point an agent performs **self-discovery**:

- Through the [Session spec's SOP area](/session/sop/) it learns to read any SOP **predictably** — what a SOP contains (Setup, Health, Update, and scope-specific extras) and where to find each part.
- Which SOP applies in a given folder follows from **where the agent is**: the workbench-SOP at the workbench root, a project's own conventions inside a project.

The workbench level **SHOULD** make this determination cheap — a predictable layout and a single entry point — so that an agent re-entering after a context reset can re-orient without re-reading the entire specification.

Beyond explaining the scope, the SOP **names the entry points** that work flows through, so an agent knows the few doors into the system rather than guessing them. The workbench's main entry points are: the **workbench-SOP itself** (read first, every session); each **custom folder's SOP** ([26-addons.md](/specification/addons/)), the memo system's SOP first among them; and the **shared tools** the signpost lists (the CLIs and skills present at the workbench root). These entry points are exactly where the PreToolUse preconditions attach — the machine tier gates them so the right SOP is loaded before a tool runs (see [23-hooks-contract.md](/specification/hooks-contract/)).

---

## The SOP Is a Signpost, Not a Container

The workbench-SOP does not *contain* the procedures for everything in the workbench; it **points** to them. It is a **signpost** — a connecting layer, not a container — in the spirit of a dynamic `CLAUDE.md` that loads per session, carries the current inventory of tools, and routes downward to the skills and specs that hold the detail. The workbench-SOP names the levels and the tools that are present, and for each one it points at that tool's own SOP.

This is why **SOPs contain SOPs**. The workbench-SOP references each **custom folder's** SOP ([26-addons.md](/specification/addons/)) — the memo system's SOP first among them, as the recommended default Add-on — and each custom folder SOP is itself Setup/Health/Update plus its extras. Seen this way, the memo-SOP is **also just a skill — only a special one**: structurally it is one custom-folder SOP among others, an instance of the same standard rather than a privileged exception, and it is listed first only because it is the recommended default mode of working. Following the signpost reaches the right procedure without the top-level SOP swelling into a monolith:

```
Workbench-SOP (signpost — knows the levels and the custom folders present)
├── memo-SOP            (the recommended-default Add-on's SOP)
├── <other custom folder>-SOP  (a large custom folder's SOP)
└── …                   (each custom folder: Setup · Health · Update · Extras)
```

The machine-readable form of this signpost is the **workbench registry** (`.workbench/registry.json`): the same list of SOPs, skills, and custom folders that the signpost expresses in prose, in a form a tool can read. Its fields and its use by the runtime call-validation are specified in [20-cli.md](/specification/cli/).

How each custom folder SOP fans out into its public orchestrators and private components — one level below this signpost cascade — is shown in [24-skills-scope.md](/specification/skills-scope/).

---

## SOP-Native, Not Inert Files

The signpost works only because the things it points at are **SOP-native** rather than inert files. A good static file in the workbench is **declared** (it is a registered folder or a named policy), **consumed by a named process** (a skill, a hook, the wiki), and **health-checked**. A registered folder, for instance, is declared in the contract, its content is checked on write, its entry point is validated, its usage is measured after the fact, and it is findable through the wiki — it is governed, not magic. The signpost can route to a thing precisely because that thing announces what it is and what consumes it, instead of sitting as one more file in an undifferentiated pile.

---

## Enforcement Is the Machine Tier's Job

Self-discovery describes what an agent *should* do. Making it **deterministic** — guaranteeing that the correct SOP is loaded before a tool runs, regardless of model behavior — is the job of the **machine tier**, through Claude Code hooks. The workbench level declares the policy; the machine tier enforces it. The contract between the two is specified in [23-hooks-contract.md](/specification/hooks-contract/); the enforcement mechanism itself is out of scope for this spec (below).

---

## The Machine Tier

> **Informative.** This section records the scope boundary as it now stands and the rationale for it. The genesis/enforcement slice of the machine tier is specified (the [Session spec](/session/overview/)); the broader host-wide machine spec is still forward-looking guidance.

The **enforcement slice** of the machine tier — the Session Genesis Root that owns session identity, the per-session security level, and the deterministic PreToolUse SOP enforcement — is **now specified** in the sibling [Session spec](/session/overview/). What remains deliberately deferred to a separate, future host-wide machine spec is everything else the host governs globally (`~/.claude/` at large, the OS, every Claude Code project on the machine, not only those under the workbench).

The existing arrangement is otherwise left as it is for now. In particular:

- **The git workflow stays at the project/memo level.** Git flow and the memo-ID convention remain where they are today. The clean three-way cut between machine, workbench, and project is sound in principle but is **deferred** until the hook mechanics are well understood.

A reasonable shape for the future machine-tier spec — recorded here as guidance, not as a commitment — is that it would be the natural home for:

- the security-hook system that filters dangerous shell commands;
- the global hooks under `~/.claude/hooks/` (for example an environment-file guard and a commit-message guard);
- the convention that real environment files live in the parent directory and that local tooling binds to loopback only;
- the **deterministic enforcement of the SOP** via PreToolUse gates (specified as a contract in [23-hooks-contract.md](/specification/hooks-contract/)).

The division of responsibility is the load-bearing idea: **the workbench declares policy** — primarily through the manual `.workbench/` configuration ([22-config.md](/specification/config/)) — and **the machine tier enforces it**. Locating enforcement at the machine tier lets it apply where it must apply globally (`~/.claude/`), while the workbench itself stays portable. A future machine-tier spec should also make clear that it serves **only** projects under the workbench-folder system.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [00-overview.md](/specification/overview/) — the sibling-spec framing and the scope of this spec.
- [10-root-and-projects.md](/specification/root-and-projects/) — the workbench-root vs. project boundary.
- [22-config.md](/specification/config/) — the `.workbench/` configuration, where the workbench declares policy.
- [23-hooks-contract.md](/specification/hooks-contract/) — the contract the machine tier consumes to enforce policy.
- [26-addons.md](/specification/addons/) — the custom folder SOPs the signpost points at, the memo system first among them.
- [20-cli.md](/specification/cli/) — the `.workbench/registry.json`, the machine-readable form of the signpost.
- [24-skills-scope.md](/specification/skills-scope/) — how each custom folder SOP fans out into orchestrators and components, one level below this cascade.
- [The Session spec's SOP area](/session/sop/) — the common SOP standard of which the workbench-SOP is an instance.
- [The Session spec](/session/overview/) — the Session Genesis Root (`session-sop`): session identity, per-session security level, and the deterministic PreToolUse enforcement the workbench-SOP relies on.
