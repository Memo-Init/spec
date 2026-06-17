---
title: "Project Structure"
description: "Every project lives under `projects/{name}/` and **MUST** follow a single, predictable layout. A predictable layout is what lets the workbench audit check structure mechanically (see..."
spec_version: "0.1.0"
spec_file: "01-project-structure.md"
order: 1
section: "Workbench"
normative: true
generated_at: "2026-06-17T12:56:47.331Z"
generated_from: "spec/workbench/01-project-structure.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/01-project-structure.md."
---


Every project lives under `projects/{name}/` and **MUST** follow a single, predictable layout. A predictable layout is what lets the workbench audit check structure mechanically (see [00-overview.md](/specification/overview/)) and what lets a memo assume where its context, repositories, and scripts are without searching.

---

## Root Level vs. Project Level

The workbench has two distinct structure levels:

**Root level** (`ressources/` or equivalent workbench root) holds:
- `projects/` — the folder that contains all individual projects.
- `cli/` — CLIs and tools shared across all projects (e.g. `memo-view`, `ralph`, `depwatch`).
- `context/` — global documents shared across all projects (mental models, standards).
- `templates/` — templates for new projects and skills.

No git repository exists at the root level. The root is always local (see [The Root Is Always Local](#the-root-is-always-local)).

**Project level** (`projects/{name}/`) holds the per-project structure defined in the table below. Tools and requirements registries that belong to a specific project live at project level under `.memo/` (cross-reference: [23-requirements.md](/specification/requirements/) and [24-tools-registry.md](/specification/tools-registry/)).

---

## The `projects/{name}/` Structure

A project directory **MUST** contain the following folders and files. Folder names are load-bearing identifiers and are reproduced verbatim.

| Path | Required | Purpose |
|------|----------|---------|
| `.claude/` | Yes | Claude Code settings and project-local skills. |
| `.memo/` | Yes | Memos and their data siblings (`requirements/`, `tools/`); see [23-requirements.md](/specification/requirements/) and [24-tools-registry.md](/specification/tools-registry/). |
| `.trash/` | Yes | Recoverable trash; deletion target (see [06-trash.md](/specification/trash/)). |
| `context/` | Yes | Technical documents, specifications, deep-research output. |
| `repos/` | Yes | The project's git repositories (one domain per repository). |
| `scripts/` | Yes | `dev.sh`, `cleanup.sh`, `health-check.sh`. |
| `proofs/` | Yes | Proofs captured when a view changes. |
| `snapshots/` | Yes | Application snapshots. |
| `ABOUT.md` | Yes | Project documentation for humans. |
| `CLAUDE.md` | Yes | The runbook for the AI. |
| `.playwright/` | Yes | Browser-automation session, scripts, and output. |
| `.wiki/` | Optional | LLM-generated project wiki (see [24-tools-registry.md](/specification/tools-registry/)). |

A project **MUST NOT** omit a required folder. A project **MAY** add the optional `.wiki/`. The workbench audit reports any missing required path as a structural finding and any unexpected top-level entry for review.

Within `.memo/`, the memos themselves remain **directly** under `.memo/` (one numbered directory per memo). The data siblings `requirements/` and `tools/` sit **alongside** the memos under `.memo/`, not inside any single memo (see [23-requirements.md](/specification/requirements/)).

---

## The Root Is Always Local

The workbench root and every project root are **local-only**. There is **no** git repository at the project root and **none** under `.memo/`.

- The absence of a git folder at these levels is a **structural** guarantee, not merely a rule a contributor is asked to follow. Material that has no enclosing repository cannot be pushed.
- Memos, requirements profiles (machine-readable rule sets that declare coding standards, language rules, or repository conventions for a project — see [23-requirements.md](/specification/requirements/)), tools registries, context documents, proofs, and snapshots therefore stay on the developer's machine by construction. They **MUST NOT** be moved under a tracked repository at the project or `.memo/` level.
- Code that is meant to be shared lives in `repos/`, where each repository is its own git unit. Everything outside `repos/` stays local.

---

## The Only Egress Point Is GitHub Issues

A project's only sanctioned channel from the local environment to the outside world — besides the code in `repos/` — is **GitHub Issues**.

- When information needs to leave the local context (to coordinate work, file a bug, or reference a phase), it leaves as a GitHub Issue, written in neutral, public-safe language and referenced by memo ID.
- Issue text **MUST NOT** carry private data, absolute machine paths, secrets, or personal information. The git-security check applies to issue text exactly as it applies to staged code (see the core-spec git-security chapter).
- This single, narrow egress point is what keeps the local guarantee meaningful: there is one well-understood door, and it is guarded.

---

## The Local Guarantee

Taken together, the three properties above form the **local guarantee**:

1. The root is local (no enclosing repository) — *structural*.
2. The only egress is GitHub Issues — *narrow and guarded*.
3. Everything shareable is isolated in `repos/` — *explicit*.

A project **MUST** preserve all three. The guarantee is the precondition for working with sensitive, half-formed, or personal material in memos and research without risk of accidental publication. Breaking any one of the three (for example, by initializing a repository at the project root) voids the guarantee and **MUST NOT** be done.

---

## Related

- [00-overview.md](/specification/overview/) — projects-not-repositories framing and the workbench-level checks.
- [23-requirements.md](/specification/requirements/) — the `requirements/` sibling under `.memo/`.
- [24-tools-registry.md](/specification/tools-registry/) — the `tools/` sibling under `.memo/`.
- [06-trash.md](/specification/trash/) — why deletion routes through `.trash/`.
