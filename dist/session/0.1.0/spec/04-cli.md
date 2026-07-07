---
title: "CLI Doctrine"
description: "This chapter owns the **universal CLI doctrine**: the general way *every* CLI in the system is built — session, workbench, memo, flowmcp, and any future family. It **generalizes** the Branch/Leaf..."
session_version: "0.1.0"
spec_file: "04-cli.md"
order: 4
section: "Session"
normative: true
generated_at: "2026-07-07T21:34:26.628Z"
generated_from: "draft/session/0.1.0/spec/04-cli.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/session/0.1.0/spec/04-cli.md."
---


This chapter owns the **universal CLI doctrine**: the general way *every* CLI in the system is built — session, workbench, memo, flowmcp, and any future family. It **generalizes** the Branch/Leaf convention up from the workbench tier to the session tier and **references** the normative data model rather than restating it. The Branch/Leaf tree, the `describe()` mechanics, and the `{status, error, fix}` envelope are defined once in the core specification's [Tree CLI chapter](/specification/tree-cli-recommended-way/); this chapter adds only what is genuinely universal and not yet stated there.

---

## Why the Doctrine Lives at the Session Tier

The session is the genesis root ([00-overview.md](/session/overview/)): the one scope that exists before any workbench convention. Because the workbench is *itself* a session-SOP application layered on the genesis root, the lowest tier is the right home for the rules that bind *all* CLIs. A CLI is a tool that any tier may ship, so its doctrine belongs to the tier every other tier inherits from. The session tier already lives by one of these rules — session identity resolves `flag > env > null` ([01-genesis-root.md](/session/genesis-root/)) — and this chapter lifts that single rule into the general config precedence the whole system shares.

---

## The Eight Principles

| # | Principle | Rule |
|---|-----------|------|
| 1 | **Self-describing command tree** | Branches group, leaves act; each leaf carries typed `input` **and** `output` whose field descriptions encode behaviour. A CLI **MUST** be self-describing (help-as-spec). |
| 2 | **One result envelope** | Every leaf **MUST** return `{status, error, fix}`; the process **exit code MUST mirror `status`** (0 ⇔ `true`). |
| 3 | **Human first, machine always** | Default output **MUST** be human-readable and TTY-adaptive; `--json` **MUST** emit the envelope verbatim. stdout = data, stderr = messaging. |
| 4 | **Discoverable, not told** | Discovery **MUST** be registry-driven (`--describe`, the registry); `npm link` is registration, never discovery. |
| 5 | **Standard verbs** | A family **SHOULD** expose the reserved verbs (`version`, `describe`, `doctor`, `init`, `migrate`) so an agent can rely on them existing. |
| 6 | **Idempotent & crash-only** | Re-running a leaf **MUST** be safe: no-auto-write, no-overwrite, additive, recorded; network work times out; check early, bail out. |
| 7 | **Config precedence** | Resolution order is `flag > env > config > default`, with **no silent defaults** and **no secrets** read from flags or env. |
| 8 | **Additive evolution** | Changes **MUST** be additive; scripts use `--json`/`--plain`; **no catch-all subcommand** and no arbitrary subcommand abbreviation. |

---

## The Self-Describing Tree (reference)

The data model — branches as bags of tools, leaves with typed `input`/`output`, `.describe(...)` field descriptions, the `--describe` machine-readable help tree, ancestor-path re-injection, and the "robust enough that the code could be re-implemented from the help" property — is normative in the core [Tree CLI chapter](/specification/tree-cli-recommended-way/) and is restated here only as principle 1. The workbench statement of the same convention, including `npm link` ≠ discovery and runtime call-validation as a leaf, is in [workbench/20-cli.md](/workbench/cli/). This chapter **MUST NOT** fork either; it generalizes them upward.

---

## The Result Envelope and Exit Codes

Every leaf returns `{status, error, fix}`, where `fix` is a separate machine-readable repair step a hook or agent reads and resends rather than re-deriving from free text (core [Tree CLI chapter](/specification/tree-cli-recommended-way/)). The session tier **adds** the missing half: a **process exit code that mirrors the envelope**, so a shell or CI step — or the PreToolUse gate's own scripts ([02-enforcement.md](/session/enforcement/)) — can gate on a CLI without parsing JSON.

| Exit | Meaning |
|------|---------|
| `0` | `status: true` — success |
| `1` | generic failure (`status: false`) |
| `2` | usage / validation error |
| `3` | precondition not met / not ready |

A family **MAY** reserve higher codes for its own failure modes, but `0` ⇔ success is invariant. **The current CLI does not yet emit these exit codes** — today only the JSON envelope is returned. This chapter specifies the mirror as the target the implementation **MUST** reach; it is a specified gap, not a shipped feature.

---

## Human-First, Machine-Always

Default output is for a human at a terminal; the same leaf is fully drivable by a machine. **stdout carries data and machine-readable output; stderr carries logs, errors, and status** — this is what makes piping work. Colour, spinners, and progress are TTY-adaptive and **MUST** be disabled when stdout is not a TTY. The reserved flag set:

| Flag | Effect |
|------|--------|
| `--json` | Emit the `{status, error, fix}` envelope verbatim (machine output). |
| `--quiet` / `-q` | Suppress messaging on stderr. |
| `--plain` | One record per line, no table borders — pipes into `grep`/`awk`. |
| `--no-input` | Never prompt; fail with guidance instead. |
| `--dry-run` / `-n` | Show what would happen, mutate nothing. |
| `--no-color` | Disable colour (and honour `NO_COLOR`). |

Agents run non-interactively, so a leaf **MUST** be fully drivable by flags under `--no-input`: **no leaf may *require* a prompt**. This is the project-specific sharpening of "never require prompts."

---

## Standard Verbs

Every CLI family **SHOULD** expose a small reserved verb set so an agent can rely on them. `version` and `describe` are **MUST**; `doctor` is **SHOULD** (and **MUST** for any CLI with an environment to check); `init` and `migrate` apply only where state exists.

| Verb | Role | Mutates? |
|------|------|----------|
| `version` | Print version + debug info. | no |
| `describe` | Machine-readable help tree (`--describe`). | no |
| `doctor` | Read-only readiness battery; per-item PASS/WARN/FAIL + `fix`. | **no** |
| `init` | Explicit, additive scaffold-once — never overwrites. | yes, recorded |
| `migrate` | Idempotent state/schema migration, safe to re-run. | yes, idempotent |

`doctor` diagnoses (never mutates, never blocks) and `init` scaffolds additively; their full contract for the session-readiness instance is [07-doctor-init.md](/session/doctor-init/). This chapter only reserves the verb names and their contracts.

These verbs are the **executable form of the SOP common denominator** ([11-common-denominator.md](/session/common-denominator/)) — not a second concept beside Setup / Health / Update / Extras, but the same four parts made runnable: **`init` is Setup**, **`doctor` is Health**, **`update` is Update**, and a family's own scope leaves are its **Extras** (the optional, scope-specific commands). The canonical Update verb is **`update`**; **`migrate`** is its narrower schema/state special-case — the idempotent migration reserved in the table above — so `update` is the general "bring the scope to the current expected state", and `migrate` is the schema-only instance of it. Read this way, a scope's SOP and its CLI are the same common denominator seen twice: one as a procedure a reader follows, one as commands an agent runs.

---

## Enforcement, Doctor, and Init Sit Under the CLI

Three of the family's mechanisms are not separate systems beside the CLI — they are **shapes of it**, and they sit conceptually **under this doctrine**. The PreToolUse **enforcement** gate ([02-enforcement.md](/session/enforcement/)) is a CLI-shaped script that obeys the result envelope and the exit-code mirror above; **`doctor`** and **`init`** are two of the reserved standard verbs ([07-doctor-init.md](/session/doctor-init/)). Reading them as CLI is what lets one envelope and one exit-code map serve the gate, the readiness preflight, and the scaffold alike.

The **Hook-Contract** these mechanisms share has a **single source in this session family** — [02-enforcement.md](/session/enforcement/) — and [workbench/23-hooks-contract.md](/workbench/hooks-contract/) **references up** to it rather than redefining the contract. Session owns the contract; the workbench states only its scoped view of the same PreToolUse shape.

---

## Discovery and Registration

A CLI is **discovered from a declared inventory, not from a filesystem walk or from prose**. The registry (`registry.json`) is the workbench-tier discovery source ([workbench/20-cli.md](/workbench/cli/)) — the direct analogue of a static command manifest. At the session tier the same pattern generalizes one level up: the `.session/config.json` ([05-config-cascade.md](/session/config-cascade/)) is the session-level manifest of registered SOPs, their CLIs, and their reserved namespaces. So "how to build a CLI" at session level includes one act of registration — **a CLI registers its skills and its namespace into the session config**, exactly as Branch/Leaf CLIs register into `registry.json`. The reserved namespace is the family's branch prefix lifted to the session tier — the `prefix-hyphen-name` discovery handle one level up. `npm link` is treated as registration only; it grants no discovery. The shared `cli/` root folder is a legitimate home for cross-project tools ([workbench/12-folders.md](/workbench/folders/)).

---

## Idempotence, Crash-Only, No-Auto-Write

Re-running a leaf **MUST** be safe. Mutating leaves are **additive, existence-checked, and recorded** — the organization's no-auto-write / no-overwrite rule, generalized from `.env` handling to all CLI state: a leaf that would write **MUST** check whether the target exists and **MUST NOT** silently overwrite it. Network work **MUST** time out rather than hang, and a leaf **SHOULD** check its preconditions early and bail out before doing anything irreversible (crash-only: defer cleanup to the next run, exit immediately on failure). This makes every CLI restartable from an interruption.

---

## Conventions (reference)

Names follow the lowercase **`prefix-hyphen-name`** scheme; the prefix is the discovery handle. That naming convention and the trailing-slash folder brevity are defined once in the SOP area's [conventions chapter](/session/conventions/) and **MUST NOT** be restated here. One convention this chapter does settle: subcommands are **space-separated** (`memo session resolve`, `memo maintenance verify`), matching the project's existing CLIs and the dominant convention (git, Docker, kubectl, Cobra) — **not** the colon form (`heroku domains:add`). This is stated explicitly so it is not re-litigated per family.

---

## Conformance Checklist

A CLI conforms when:

| Check | Requirement |
|-------|-------------|
| Tree | It is a Branch/Leaf tree; leaves carry typed `input` **and** `output` whose descriptions encode behaviour; `--describe` renders the help tree. |
| Help-as-spec | A reader could re-implement a leaf from its help alone. |
| Envelope | Every leaf returns `{status, error, fix}`; `fix` is a separate machine-readable repair step. |
| Exit code | The exit code mirrors `status` (0 / non-zero) per the reserved map. |
| Streams | stdout = data, stderr = messaging; default output is human-readable and TTY-adaptive. |
| Flags | `--json`, `--quiet`, `--plain`, `--no-input`, `--dry-run`, `--no-color` are honoured; the CLI is fully drivable by flags. |
| Verbs | It exposes `version` and `doctor`; `init`/`migrate` are idempotent, additive, never-overwrite, recorded. |
| Config | Precedence is `flag > env > config > default`, with no silent defaults and no secrets from flags/env. |
| Discovery | It is discovered via the registry / session config, not prose or a filesystem walk; `npm link` is registration only. |
| Naming | Names follow `prefix-hyphen-name`; the namespace is reserved at the session config; subcommands are space-separated; no catch-all. |
| Evolution | Changes are additive; scripts are told to use `--json`/`--plain`. |

---

## Conformity Requirements

The CLI doctrine's binding `MUST`s for the session family are authored here **prose-first**: each block's `statement` faces generation (it shapes how a session CLI leaf is built) and its `check` faces the finalization gate with a ternary `PASS` / `BLOCKED` / `INCONCLUSIVE`. Both rules below are enforced by shipped session leaves, so they are **checkable now** and carry a hard `binary` grade. The exit-code mirror is referenced (not re-authored here) by the core CLI standard at [/specification/tree-cli-recommended-way/](/specification/tree-cli-recommended-way/).

The result envelope is the SAME contract the core CLI standard authors once (REQ-701); the session family does not re-specify it, it binds to it (`grade: binary`):

```requirement
{
  "id": "REQ-988",
  "title": "Every memo session leaf binds to the core result envelope (REQ-701)",
  "statement": "Every `memo session` leaf MUST return the shared CLI result envelope as defined ONCE by the core CLI standard (REQ-701, [22-tree-cli-recommended-way.md](/specification/tree-cli-recommended-way/): boolean `status`; `error` plus a separate `fix` on `status:false`; payload spread on `status:true`). The envelope shape is referenced here, NOT re-authored — this rule binds the session leaves to the single core contract so the same shape is never specified twice.",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-cli", "cli-conformance"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Invoking any `memo session` leaf returns an object carrying a boolean status",
      "On status:false the result carries both a non-empty error and a separate fix field",
      "On status:true the result carries no error or fix key"
    ]
  },
  "grade": "binary"
}
```

The `--describe` contract is likewise the core standard's (REQ-702); the session rule binds its branch to it rather than re-authoring the shape — a `tool`-kind check (`grade: binary`):

```requirement
{
  "id": "REQ-989",
  "title": "--describe exposes the session branch, per the core contract (REQ-702)",
  "statement": "The `memo` command tree MUST expose the `session` branch through the machine-readable `--describe` contract defined ONCE by the core CLI standard (REQ-702, [22-tree-cli-recommended-way.md](/specification/tree-cli-recommended-way/)): each session leaf entry carrying a `description`, the rendered `input` and `output` shapes, and a call `example`, so the session CLI is discovered from the tool itself. Referenced, not re-authored — this rule binds the session branch to the single core `--describe` contract.",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-cli", "cli-conformance"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "memo",
    "tactic": "describe-structured-output",
    "verify": [
      "Run `memo session --describe` and parse the result as a structured object",
      "Assert every session leaf entry carries description, input, output, and example"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [workbench/20-cli.md](/workbench/cli/) — the workbench CLI convention and the registry as the single discovery source.
- [05-config-cascade.md](/session/config-cascade/) — the `.session/config.json` cascade and the `flag > env > config > default` precedence this chapter relies on.
- [07-doctor-init.md](/session/doctor-init/) — the `doctor` / `init` verb contracts whose names this chapter reserves.
- [Tree CLI — the recommended way](/specification/tree-cli-recommended-way/) — the normative Branch/Leaf data model and `{status, error, fix}` envelope.
- [13-conventions.md](/session/conventions/) — the `prefix-hyphen-name` naming convention this chapter references.
