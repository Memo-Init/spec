---
title: "Workbench-SOP and the Two-Level Model"
description: "This chapter defines how an agent enters the workbench and the two levels of operation it distinguishes. The workbench-SOP is the smallest entry point: the thing an agent reads first, on every fresh..."
workbench_version: "0.1.0"
spec_file: "02-sop-entrypoint.md"
order: 2
section: "Workbench"
normative: false
generated_at: "2026-06-24T20:49:55.320Z"
generated_from: "spec/workbench/0.1.0/02-sop-entrypoint.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/02-sop-entrypoint.md."
---


This chapter defines how an agent enters the workbench and the two levels of operation it distinguishes. The workbench-SOP is the smallest entry point: the thing an agent reads first, on every fresh start, to learn where it is and what it may do. It is one instance of the common SOP standard described in the [SOP spec](/sop/overview/).

---

## Two Levels: Workbench and Project

The workbench distinguishes exactly **two** levels of operation. Each level has a plain "works when…" test and a corresponding mode of work.

| Level | Works when… | Mode of work |
|-------|-------------|--------------|
| **Workbench** | the system of projects runs | No project work. Setup, health, and update of the workbenches themselves — does each project exist with the expected structure, are the shared tools reachable. |
| **Project** | project-specific work runs | Project-related work is carried out — memos, repositories, the project's own tooling. |

An agent **MUST** determine which level it is operating at before it acts, because the permitted actions differ: at the workbench level it organizes and checks; at the project level it does the project's work. The boundary between the workbench root and the projects beneath it is drawn in [10-root-and-projects.md](/specification/root-and-projects/).

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

---

## Deterministic Enforcement Is the Machine Tier's Job

Self-discovery describes what an agent *should* do. Making it **deterministic** — guaranteeing that the correct SOP is loaded before a tool runs, regardless of model behavior — is the job of the **machine tier**, through Claude Code hooks. The workbench level declares the policy; the machine tier enforces it. The contract between the two is specified in [23-hooks-contract.md](/specification/hooks-contract/); the enforcement mechanism itself is out of scope for this spec (below).

---

## The Machine Tier (Out of Scope, Specified Separately)

> **Informative.** This section records a deliberate scope boundary and the rationale for it. It is forward-looking guidance, not a normative requirement of this spec.

The machine tier is **deliberately excluded** from this specification and left to a separate, future machine-tier spec. The reason follows from the level model above: the workbench begins in the workbench folder, while the machine tier governs the host globally (`~/.claude/`, the OS, every Claude Code project on the machine, not only those under the workbench).

The existing arrangement is left as it is for now. In particular:

- **The git workflow stays at the project/memo level.** Git flow and the memo-ID convention remain where they are today. The clean three-way cut between machine, workbench, and project is sound in principle but is **deferred** until the hook mechanics are well understood.

A reasonable shape for the future machine-tier spec — recorded here as guidance, not as a commitment — is that it would be the natural home for:

- the security-hook system that filters dangerous shell commands;
- the global hooks under `~/.claude/hooks/` (for example an environment-file guard and a commit-message guard);
- the convention that real environment files live in the parent directory and that local tooling binds to loopback only;
- the **deterministic enforcement of the SOP** via PreToolUse gates (the consuming side of the hooks contract in [23-hooks-contract.md](/specification/hooks-contract/)).

The division of responsibility is the load-bearing idea: **the workbench declares policy** — primarily through the manual `.workbench/` configuration ([22-config.md](/specification/config/)) — and **the machine tier enforces it**. Locating enforcement at the machine tier lets it apply where it must apply globally (`~/.claude/`), while the workbench itself stays portable. A future machine-tier spec should also make clear that it serves **only** projects under the workbench-folder system.

---

## Related

- [00-overview.md](/specification/overview/) — the sibling-spec framing and the scope of this spec.
- [10-root-and-projects.md](/specification/root-and-projects/) — the workbench-root vs. project boundary.
- [22-config.md](/specification/config/) — the `.workbench/` configuration, where the workbench declares policy.
- [23-hooks-contract.md](/specification/hooks-contract/) — the contract the machine tier consumes to enforce policy.
- [The SOP spec](/sop/overview/) — the common SOP standard of which the workbench-SOP is an instance.
