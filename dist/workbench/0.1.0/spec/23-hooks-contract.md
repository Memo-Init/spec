---
title: "Hooks Contract"
description: "Deterministic enforcement of workbench policy is delegated to Claude Code hooks. This chapter specifies the **contract** between the workbench and a hook: what the workbench provides for a hook to..."
workbench_version: "0.1.0"
spec_file: "23-hooks-contract.md"
order: 23
section: "Workbench"
normative: true
generated_at: "2026-07-01T00:43:54.490Z"
generated_from: "draft/workbench/0.1.0/spec/23-hooks-contract.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/workbench/0.1.0/spec/23-hooks-contract.md."
---


Deterministic enforcement of workbench policy is delegated to Claude Code hooks. This chapter specifies the **contract** between the workbench and a hook: what the workbench provides for a hook to read, and what a hook is expected to consume and decide. It deliberately specifies **only the contract** — the hook *implementation* belongs to the future machine-tier spec (see [02-sop-entrypoint.md](/specification/sop-entrypoint/)).

This chapter and [22-config.md](/specification/config/) form the workbench **Core** — the mutually-defining config/enforcement pair (config = producing side, hooks = consuming side); see the Core category in [00-overview.md](/specification/overview/).

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
    { "folder": "design/",  "pattern": "design.md", "linter": "design-frontmatter", "severity": "error" },
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

## The Precondition Dependency Chain

The pre-condition catalog above is loose by design — it states *what* could be checked. This section makes the mechanism **normative and deterministic**: a `PreToolUse` precondition hook that gates an orchestrator entry point **MUST** perform these **five steps**, in order:

1. **Intercept** the skill call at an orchestrator entry point — a `PreToolUse` hook bound by a `Skill(<name>)` matcher fires before the entry point runs.
2. **Look up the dependency table** — read `.workbench/registry.json` `requirements[]` filtered to `when: "pre"`: the declared `entrypoint → requires` edges that apply to this entry point (cross-ref [20-cli.md](/specification/cli/)).
3. **Read the session transcript** — the JSONL at `transcript_path` (resolved via `session_id`): the **same** signal scan the runtime call-validation runs post-hoc in [20-cli.md](/specification/cli/), now applied **before** the call.
4. **Check the predecessor actually ran** this session — for each required skill/SOP, look for the registry's signals (`skill:<id>`, `path:/skills/<id>`, `attributionSkill:<id>`) in the transcript.
5. **Allow OR hard-block** — if every precondition is met, allow the call; on any unmet precondition, **deny** (exit code `2`, or `permissionDecision: "deny"`) and **return an instruction** naming exactly what must be read or run first.

### The Multi-Stage Chain — No Escape

Requirements **compose transitively**. The edges chain: `memo-init` requires `memo-sop`, and `memo-sop` requires `workbench-sop`. The precondition hook resolves the *whole* chain, not just the nearest edge — if **any** link is unmet, the call is denied with a message that lists the entire chain, for example:

```
preconditions not met: memo-init requires memo-sop, memo-sop requires workbench-sop
```

There is **no bypass**. This is **absolute for security**: no git command runs without a verified repo status, the same way no entry point runs without its SOP chain (the facing/egress policy a git gate reads lives in [22-config.md](/specification/config/); the gate is repo-facing). A transitive precondition cannot be satisfied by skipping an intermediate link.

### Hard-Block, Not Ask

The SOP-chain and security preconditions return **`deny`** — a **hard-block**, not the softer `ask`. This is the deliberate distinction from the catalog above: an `ask` case (for example `memo-finalize` confirming the user is the trigger) surfaces a prompt the user may answer; a `deny` case (an unmet SOP-chain link, an unverified repo status) refuses the call outright until the predecessor has demonstrably run. A hard-block is for preconditions that protect integrity; `ask` is for preconditions that need human judgment.

### Enforcement Level — Orchestrator Entry Points Only

Preconditions attach **only at orchestrator entry points**. The public entry points **are** orchestrator skills, never components (consistent with [24-skills-scope.md](/specification/skills-scope/)) — so gating the orchestrators gates exactly the public surface through which work enters. **Components** are reached only *through* their orchestrator and are **not** gated individually: the orchestrator's precondition has already run before any component is invoked. **Sub-agent depth is out of scope** — the chain is enforced at the entry point, not recursively down every sub-agent. This covers the critical entry points fully without the sub-agent problems that per-component or recursive gating would introduce.

### REQ-061 — The First Concrete Edge

**REQ-061** — the `memo-init` Pre-Flight "was `memo-sop` read?" check — is the **first concrete edge** of this chain. Today it is prose-only; here it is made a **registry-backed pre-gate**: a `requirements[]` entry `{ entrypoint: "memo-init", requires: "memo-sop", when: "pre" }` that the five-step mechanism above resolves deterministically, rather than a check that lives only in narrative.

---

## The Inward-Push Gate

The same `PreToolUse` surface that gates a skill call also gates a **push**. A `Bash(git push …)`-class hook **MUST** read the declared per-repository status from `.workbench/` ([22-config.md](/specification/config/)) and **block the push** when the target repository is declared `inward`, **or** when the target lacks a declared `outward` status at all. The decision is **deterministic**: the hook resolves the target repository, reads its declared status record, and allows the push only when that record says `facing: "outward"` — it **never infers** facing from the repository's git state or remote.

This is the producing/consuming contract applied to egress: the workbench **declares** each repository's status (the three axes in [22-config.md](/specification/config/)), and the machine-tier git gate **enforces** it. The gate consumes the declared record; it does not decide policy of its own.

The gate is the operational form of the absolute stated above (the Precondition Dependency Chain): **no git command runs without a verified repo status** — a push is refused outright until a declared `outward` status is present, the same hard-block discipline as an unmet SOP-chain link. Default-deny: an undeclared repository is treated as not-pushable, not as outward by omission.

The declared status is itself **verified, not trusted**: the workbench **health-check** and **git-security** check that the declared status matches reality (a repository declared `outward` actually has its named remote; one declared `inward` has none or `none`). The gate reads the declaration; health-check and git-security keep the declaration honest. As elsewhere in this chapter, the contract fixes only what the gate may **read and decide**; the hook *implementation* belongs to the future machine-tier spec.

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

## Conformity Requirements

This chapter is normative about the contract surface; its `MUST`s are the rules a hook satisfies. The blocks below encode them prose-first — each `statement` faces the building of a gate, and each `check` faces a built hook's behaviour. Because the hook *implementation* belongs to the deferred machine-tier spec, several blocks carry a `todo` grade — a score is owed once the behaviour is buildable, not feigned now. They are the source the requirement store is harvested from ([../../v0.1.0/23-requirements.md](/specification/requirements/)).

The five-step precondition chain is a deterministic mechanism whose completeness a reviewer judges against the contract:

```requirement
{
  "id": "REQ-961",
  "title": "The precondition hook resolves the whole dependency chain with no bypass",
  "statement": "A PreToolUse precondition hook gating an orchestrator entry point MUST perform the five steps in order — intercept the `Skill(<name>)` call, look up the `requirements[]` `when: \"pre\"` edges, read the session transcript, check each required predecessor actually ran via the registry signals, and allow OR hard-block — and MUST resolve the whole transitive chain, denying with a message that lists every unmet link. A transitive precondition cannot be satisfied by skipping an intermediate link.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["hooks", "precondition", "enforcement"] },
  "severity": "blocker",
  "check": {
    "kind": "evaluator",
    "rubric": "A reviewer drives the gate with a multi-link chain where an intermediate predecessor is absent. PASS when the call is denied with a message naming the entire unmet chain; BLOCKED when the gate allows the call or names only the nearest edge; INCONCLUSIVE when no gate is wired to evaluate.",
    "verify": [
      "Construct a chain where an intermediate predecessor did not run",
      "Confirm a hard-block whose message lists the whole chain"
    ]
  },
  "grade": "todo"
}
```

The inward-push gate is a deterministic, default-deny decision over the declared status; its behaviour is judged against the contract:

```requirement
{
  "id": "REQ-962",
  "title": "The inward-push gate is default-deny and never infers facing",
  "statement": "A `git push`-class hook MUST read the declared per-repository status from the project configuration and block the push when the target repository is declared `inward`, OR when it lacks a declared `outward` status at all. It MUST allow the push only when the declared record says `facing: \"outward\"`, and MUST NOT infer facing from the repository's git state or remote. An undeclared repository is treated as not-pushable, not as outward by omission.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["hooks", "push-gate", "egress"] },
  "severity": "blocker",
  "check": {
    "kind": "evaluator",
    "rubric": "A reviewer drives the gate against three targets: declared `inward`, undeclared, and declared `outward`. PASS when the first two are blocked and only the declared `outward` is allowed, with the decision taken from the declared record; BLOCKED when an inward or undeclared target is allowed, or facing is inferred from git state; INCONCLUSIVE when no gate is wired.",
    "verify": [
      "Attempt a push to inward, undeclared, and outward targets",
      "Confirm only the declared outward target is allowed, by reading the declaration"
    ]
  },
  "grade": "todo"
}
```

The write-time content lint is bound by a project-local map and its honest limits are part of the contract:

```requirement
{
  "id": "REQ-963",
  "title": "The write-time content lint is bound by the folder-lints map",
  "statement": "The write-time content lint MUST fire on `Write`/`Edit`, read its `{ folder, pattern, linter, severity }` entries from the project's `folder-lints.json`, and block (`error`) or warn (`warn`) per the matched entry's severity. The contract's honest limits MUST hold: it gates only Claude tool writes, sees only the diff on an `Edit`, and a shell redirection bypasses it — so it is a first-line gate paired with after-the-fact validation, never a perimeter.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["hooks", "write-lint", "data-quality"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A reviewer issues a `Write` whose content violates a `folder-lints.json` entry. PASS when the write is blocked or warned per the entry's severity, and the documented limits are honored; BLOCKED when a matched violation is not acted on; INCONCLUSIVE when no lint map is configured.",
    "verify": [
      "Write content that violates a configured folder-lint entry",
      "Confirm the block/warn outcome matches the entry severity"
    ]
  },
  "grade": "todo"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [25-validation-overview.md](/specification/validation-overview/) — the wayfinder over all of the workbench's validation rules, with this contract as the hub for the hook-based ones.
- [22-config.md](/specification/config/) — the `.workbench/` configuration a hook reads, including `folder-lints.json`.
- [18-design.md](/specification/design/) — a folder whose content (`design.md`) the write-lint can check.
- [20-cli.md](/specification/cli/) — the runtime call-validation, the "after" counterpart of the entry-point pre-condition; same registry, same signal scan, pulled forward to the pre-gate.
- [02-sop-entrypoint.md](/specification/sop-entrypoint/) — the level boundary and the deferred machine-tier spec.
- [21-environment-scripts.md](/specification/environment-scripts/) — health checks, the other deterministic workbench verification.
