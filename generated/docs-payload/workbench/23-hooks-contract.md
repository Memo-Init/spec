---
title: "Hooks Contract"
description: "Deterministic enforcement of workbench policy is delegated to Claude Code hooks. This chapter specifies the **contract** between the workbench and a hook: what the workbench provides for a hook to..."
workbench_version: "0.1.0"
spec_file: "23-hooks-contract.md"
order: 23
section: "Workbench"
normative: true
generated_at: "2026-06-24T21:18:51.000Z"
generated_from: "spec/workbench/0.1.0/23-hooks-contract.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/23-hooks-contract.md."
---


Deterministic enforcement of workbench policy is delegated to Claude Code hooks. This chapter specifies the **contract** between the workbench and a hook: what the workbench provides for a hook to read, and what a hook is expected to consume and decide. It deliberately specifies **only the contract** — the hook *implementation* belongs to the future machine-tier spec (see [02-sop-entrypoint.md](/specification/sop-entrypoint/)).

---

## Scope — Contract, Not Implementation

This chapter is normative about the **contract surface** and silent about the **mechanism**. The reason is the level boundary from [02-sop-entrypoint.md](/specification/sop-entrypoint/): policy declaration is a workbench concern (specified here), while enforcement runs at the machine tier (`~/.claude/`), which is out of scope for this spec. A future machine-tier spec will specify the hook scripts, their settings, and their lifecycle; this chapter only fixes what those scripts may rely on.

---

## The Producing Side — What the Workbench Provides

The workbench provides a hook with a **single, manual source of policy**: the `.workbench/` configuration ([22-config.md](/specification/config/)). A hook reading that configuration can answer policy questions deterministically — for example, "is this repository inward-facing?" — without inferring intent. The contract guarantee is that policy is **declared, not guessed**: if a decision depends on project-specific policy, that policy is in the configuration for a hook to read.

---

## The Consuming Side — What a Hook May Rely On

A hook is a `PreToolUse` gate: it fires **before** a tool runs and decides whether the tool proceeds. The contract fixes the inputs a hook may rely on and the decision it returns.

**Inputs available to a hook** (provided by Claude Code on standard input):

| Field | Use |
|-------|-----|
| `tool_name` | Which tool is about to run (for example `Bash`, `Skill`). |
| `tool_input` | The tool's arguments. For a skill, `tool_input.name` and `tool_input.args`; for a shell call, the command string. |
| `transcript_path` | Path to the session transcript (JSONL), so the hook can inspect what has happened this session. |
| `session_id` | The session identifier, for session-scoped markers. |

**Decision a hook returns:** allow the tool, or **block** it — by exit code `2`, or by returning `permissionDecision: "deny"` with a reason shown to the user.

**Matching.** A hook is bound to a tool (or a specific skill) by a matcher — for example `Skill(memo-sop)` to gate a named skill, or a `Bash(git …)` pattern to gate a command class. This is what makes a rule like "no skill X without the prerequisite read first" expressible.

**Prerequisite detection.** Whether a prerequisite (a read, a prior skill load) happened this session is determined by **inspecting the transcript** at `transcript_path`. A `PostToolUse` **marker file** is an acceptable fallback for local sessions; the transcript is the canonical, fork-safe source. There is **no** built-in "loaded skills" list — detection is by transcript inspection.

---

## The 70/30 Split

Hooks do not replace model judgment; they bound it. The realistic division:

- **~70 % — deterministic, enforceable by hooks.** Structural rules: block a commit without an issue/memo reference, block a skill whose prerequisite was not loaded, block a destructive command, run a security check before push, gate a push to an inward-facing repository.
- **~30 % — model judgment, not enforceable by hooks.** Choosing between valid approaches, deciding when to ask, interpreting ambiguous requirements, adapting to the user's history. Hooks gate; they do not reason.

The contract therefore assumes a **three-layer stack**, not hooks alone:

1. **CLAUDE.md** — states the "why" and "when".
2. **PreToolUse hooks** — gate the structural, high-risk operations and prerequisites.
3. **Skills** — encode the multi-step workflows.

---

## Placement — Workbench Declares, Machine Enforces

The load-bearing rule of this contract: **the workbench declares policy, the machine tier enforces it.**

- **Policy / declaration** is a workbench concern — the `.workbench/` configuration, specified in this spec.
- **Enforcement** is a machine-tier concern — the hook scripts under `~/.claude/hooks/`, their `settings.json` wiring, and their lifecycle, specified by the future machine-tier spec (out of scope here, see [02-sop-entrypoint.md](/specification/sop-entrypoint/)).

Locating enforcement at the machine tier lets it apply where it must apply globally, while the workbench's declaration stays portable inside the project. The contract is the seam between the two, and this chapter fixes that seam without building either end of it beyond the workbench's declaration.

---

## Related

- [22-config.md](/specification/config/) — the `.workbench/` configuration a hook reads.
- [02-sop-entrypoint.md](/specification/sop-entrypoint/) — the level boundary and the deferred machine-tier spec.
- [21-environment-scripts.md](/specification/environment-scripts/) — health checks, the other deterministic workbench verification.
