---
title: "Hooks Contract"
description: "Deterministic enforcement of workbench policy is delegated to Claude Code hooks. This chapter specifies the **contract** between the workbench and a hook: what the workbench provides for a hook to..."
workbench_version: "0.1.0"
spec_file: "23-hooks-contract.md"
order: 23
section: "Workbench"
normative: true
generated_at: "2026-06-25T18:01:17.107Z"
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

## Write-Time Content Linting

The contract above gates a tool by *policy decision* — "may this run?". A second, complementary use of the same `PreToolUse` surface gates a write by **content**: it inspects what is about to be written and rejects content that violates a folder's convention **before** it lands. This is the workbench's first-line **data-quality gate** — bad content is stopped at the moment of writing rather than found later.

- **Matcher.** `Write|Edit` — the hook fires before a file is created or modified.
- **Input.** The hook reads `tool_input` — for a `Write`, the full `tool_input.content` and the target path; for an `Edit`, the diff being applied.
- **Policy is project-local, the mechanism is global.** The *what-to-check* lives in the project under `.workbench/` as a `folder-lints.json` map ([22-config.md](/specification/config/)); the *how-to-check* is one global hook that reads that map. Each entry binds a folder to a linter:

```jsonc
// .workbench/folder-lints.json — project-local policy; one global hook consumes it
{
  "lints": [
    { "folder": "design/",  "pattern": "DESIGN.md", "linter": "design-frontmatter", "severity": "error" },
    { "folder": "context/", "pattern": "*.md",       "linter": "untrusted-banner",   "severity": "warn" }
  ]
}
```

An entry is `{ folder, pattern, linter, severity }`: which folder and filename pattern the rule covers, which linter validates the content, and whether a failure blocks (`error`) or only warns (`warn`).

### Honest Limits

The write-lint is a genuine improvement, not a perimeter, and its boundaries are stated plainly so it is not mistaken for one:

- It gates **only Claude tool writes** (`Write`, `Edit`). Content written by `cp`, `mv`, an external process, or a tool's own database writes is **not** seen by the hook.
- On an `Edit`, the hook sees **only the diff**, not the resulting whole file, so a whole-file invariant can be enforced only on a full `Write`.
- A shell **redirection** (`> file`) bypasses the hook entirely, because it is not a `Write`/`Edit` tool call.

These limits are why the write-lint is a *first-line* gate paired with after-the-fact runtime validation, not a substitute for it.

---

## Entry-Point Pre-Conditions

An **entry point** — a public skill such as `memo-init`, `memo-finalize`, or `memo-plan` — is where work *enters* the system, and it is exactly where a pre-condition should be checked: a `PreToolUse` hook with a `Skill` matcher fires **before** the entry point runs and can refuse it when its pre-conditions are not met. Because every skill is invoked through one generic `Skill` tool, a single matcher form (`Skill(<name>)`) can gate any named entry point.

This is the **"before" half** of checkability: the gate runs *before* the action. Its "after" counterpart — measuring, from the transcript, which skills actually ran — is the runtime call-validation specified in [20-cli.md](/specification/cli/).

**Two equivalent ways for a hook to block**, both already part of the consuming-side contract:

```jsonc
// (a) Exit-code path: write the reason to stderr and exit 2 → the call is blocked
//     stderr: "memo-finalize refused: quality gates have not run (pre-condition)."
//     exit 2

// (b) JSON path (structured, preferred): stdout JSON drives the decision
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",            // "allow" | "deny" | "ask"
    "permissionDecisionReason": "memo-finalize: quality gates have not run"
  }
}
```

**A pre-condition catalog** the contract makes expressible (the conditions are illustrative; detecting "did X run this session" is by transcript inspection, above):

| Entry point | Pre-condition | Reaction |
|-------------|---------------|----------|
| `memo-init` | input processing has run; the memo does not already exist | ask / deny |
| `memo-finalize` | the quality gates have run; the trigger is the user, not an autonomous step | ask |
| `memo-plan` | a finalized memo exists; plan integrity holds | deny when no memo |

A pre-condition belongs at the entry point because an entry point is a **public method** of the system — the surface through which input, and therefore contamination, enters. Validating there is what keeps the interior clean; the principle is developed in [24-skills-scope.md](/specification/skills-scope/).

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

- [25-validation-overview.md](/specification/validation-overview/) — the wayfinder over all of the workbench's validation rules, with this contract as the hub for the hook-based ones.
- [22-config.md](/specification/config/) — the `.workbench/` configuration a hook reads, including `folder-lints.json`.
- [18-design.md](/specification/design/) — a folder whose content (`DESIGN.md`) the write-lint can check.
- [20-cli.md](/specification/cli/) — the runtime call-validation, the "after" counterpart of the entry-point pre-condition.
- [02-sop-entrypoint.md](/specification/sop-entrypoint/) — the level boundary and the deferred machine-tier spec.
- [21-environment-scripts.md](/specification/environment-scripts/) — health checks, the other deterministic workbench verification.
