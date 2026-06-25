---
title: "Environment & Health Scripts"
description: "A project's `scripts/` folder holds the executable entry points that bring its environment up, tear it down, and check that it is healthy. This chapter specifies the script family, the boot contract..."
workbench_version: "0.1.0"
spec_file: "21-environment-scripts.md"
order: 21
section: "Workbench"
normative: true
generated_at: "2026-06-25T18:46:44.485Z"
generated_from: "spec/workbench/0.1.0/21-environment-scripts.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/21-environment-scripts.md."
---


A project's `scripts/` folder holds the executable entry points that bring its environment up, tear it down, and check that it is healthy. This chapter specifies the script family, the boot contract that keeps service startup declarative, and the workbench-level health scripts that verify the workbench setup itself.

---

## The Script Family

A project's environment is operated through a small, named family of scripts. The names are conventional so that an agent or a developer knows what to run without reading each one:

| Script | Role |
|--------|------|
| `dev.sh` | Bring the project up for local development. |
| `staging.sh` | Bring the project up in a staging configuration. |
| `cleanup.sh` | Tear the environment down and remove transient state. |
| `health-check.sh` | Verify that the environment is in working order. |

Scripts **MUST** live in **meaningful subfolders** of `scripts/`, not as a flat pile at the top level. A bare `dev.sh` says too little about *which* environment it starts; the **subfolder name carries the meaning** (for example `scripts/rails/dev.sh`). This is the same convention the CLI chapter applies to commands — meaning lives in the name, not in a comment (see [20-cli.md](/specification/cli/)), and it connects to the About convention that documents what a scripts subfolder does.

---

## The Boot Contract

Service startup is **declarative**. A project **declares** the services it runs and the ports they use; the agent then calls the project's startup script rather than composing an ad-hoc boot sequence inline.

- A project **MUST** declare its services and ports in a place the startup script reads, and the agent **MUST** boot the project by invoking that script.
- Inlining the boot sequence — starting services by hand in whatever order, with literal ports, outside the declared contract — is an **anti-pattern**. It hides what the project actually runs, drifts from the declaration, and cannot be checked. The declared-and-scripted path is the only conformant one.

The contract keeps the question "what does this project run, and how do I start it?" answerable from one place, and keeps the health check (below) meaningful, because it checks the same declared services.

---

## Workbench-Health-Scripts

Beyond a single project's `health-check.sh`, the **workbench level** has its own health scripts that verify the *setup of the workbench itself* — that the projects are correctly constituted, independent of whether any one project's services run. Typical checks:

- Does every repository under each project's `repos/` have a `.git`?
- Does every repository have a configured remote?
- Does each project carry the mandatory folders (see [12-folders.md](/specification/folders/))?

These checks **categorize** the workbench state rather than building anything. They are the workbench's realization of the **Health** part of the common SOP denominator (see [the SOP common denominator](/sop/common-denominator/)): a definite, observable answer to "is this scope in order?". The workbench-SOP's Health step is exactly this family of checks.

---

## Related

- [20-cli.md](/specification/cli/) — the meaningful-subfolder convention, shared with the CLI.
- [12-folders.md](/specification/folders/) — the `scripts/` folder and the project layout the health checks verify.
- [The SOP common denominator](/sop/common-denominator/) — Setup, Health, Update; the health scripts realize Health.
