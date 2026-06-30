---
title: "Project Root Detection"
description: "The genesis tier owns the **session identity**; this chapter specifies how a session locates the **directory** that identity is anchored to — the project/workbench root the hook and the config..."
session_version: "0.1.0"
spec_file: "09-root-detection.md"
order: 9
section: "Session"
normative: true
generated_at: "2026-06-30T22:47:32.159Z"
generated_from: "draft/session/0.1.0/spec/09-root-detection.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/session/0.1.0/spec/09-root-detection.md."
---


The genesis tier owns the **session identity**; this chapter specifies how a session locates the **directory** that identity is anchored to — the project/workbench root the hook and the config cascade resolve against. The `.session/` directory **is** the root marker, resolution is a **nearest-ancestor walk-up** bounded by a `root: true` stop-flag, an opt-in `workbenchRoot` pointer is the only override, and a machine-global env-var pin is forbidden.

---

## The `.session/` Marker

The session root is the **nearest ancestor directory containing a `.session/` directory**. The marker is a directory-name reservation — the same shape that `pnpm-workspace.yaml`, a virtual `Cargo.toml [workspace]`, or `go.work` give their tools. It cannot piggyback on `.git`: the workbench deliberately has **no git at the workbench-root or project levels**, so a dedicated marker is required rather than inferred from a VCS root.

Resolution is a **pure function** of the filesystem and one anchor cwd — no guess, no ambient global. It mirrors the workbench's own rule that *the level an agent operates at is decided by its location*, and it reuses the genesis tier's `flag > env > null` precedence discipline ([01-genesis-root.md](/specification/genesis-root/)): explicit beats ambient, ambient beats nothing, nothing is ever a guess.

---

## Resolution Algorithm

| Step | Action |
|------|--------|
| 1 | Anchor at the session's **pinned start cwd** (the SessionStart-Pin, [08-identity-pin.md](/specification/identity-pin/)) — resolution runs once, never from a later cd-mutated cwd. |
| 2 | Walk up to the nearest ancestor that contains a `.session/` directory. That marker is the **active session scope**. |
| 3 | If that scope's `.session/config.json` declares a `workbenchRoot` pointer, resolve it (relative) and take its target as the root — this **overrides** the remaining walk-up. |
| 4 | Otherwise continue walking up, stopping at the first `.session/` whose config declares `root: true`. That directory is the **anchoring root**. |
| 5 | The innermost collected `.session/` governs the active scope; the outermost `root: true` is the workbench root that anchors the SOP chain. Both are found in **one** pass. |
| 6 | If no `.session/` is found above the anchor cwd, the root resolves to `null` with source `"none"` (no-silent-default) and the gate **fails open** ([01-genesis-root.md](/specification/genesis-root/)). |

The walk-up **MUST** stop at the first `root: true` marker — it never escapes above the declared root.

---

## Marker Fields

A `.session/config.json` carries three fields relevant to root detection. Their cascade semantics are owned by [05-config-cascade.md](/specification/config-cascade/); their role in *locating* the root is below.

| Field | Type | Meaning | Default |
|-------|------|---------|---------|
| `.session/` presence | directory | The dedicated root marker. Its existence makes a directory a session scope. Cannot piggyback on `.git`. | — |
| `root` | boolean | `true` declares this `.session/` the **authoritative** root; the walk-up MUST stop here. | `false` |
| `workbenchRoot` | relative path | **Opt-in** child→parent pointer (e.g. `"../.."`); when present it overrides the walk-up. Doctor-validated; absolute paths forbidden. | absent |

---

## The `root: true` Stop-Flag — Disarming Nested Markers

A `.session/` may exist **both** at the workbench-root and inside a project beneath it. Nearest-ancestor walk-up alone would always pick the innermost (project) marker — which may not be the intended anchor. The genesis tier borrows EditorConfig's `root = true`: a marker declares *the search ends here*.

- The **workbench-root** `.session/config.json` declares `"root": true` — the authoritative anchor. The walk-up MUST stop at it.
- A **project-level** `.session/` declares `"root": false` (or omits it) and is understood as a **nested** scope that **inherits** from the enclosing root, not a competing root.

This makes *"the workbench is itself just a session-sop application"* literal: the workbench-root is simply the `.session/` that flags itself `root: true`. The layout still decides; the flag only says where the walk stops — no second source of truth.

---

## The `workbenchRoot` Pointer — Opt-In, Never the Default

A project **MAY** name where its root is, for the genuinely ambiguous case (a relocated project, a worktree) — by an explicit pointer, never by inference and never by env var:

- An optional `workbenchRoot` field in the project's `.session/config.json`, holding a **relative** path (e.g. `"../.."`). Absolute paths are forbidden by house rule.
- Semantics mirror Cargo's `package.workspace`: **if present it overrides the walk-up**; if absent, the walk-up plus `root: true` stop-flag decides.
- **Validation:** `session doctor` / `session init` ([07-doctor-init.md](/specification/doctor-init/)) MUST verify the pointer resolves to a directory that actually carries a `root: true` `.session/`. A dangling pointer is a deterministic doctor finding, caught before work begins — the same spirit as a registry edge to an absent skill being refused at build time.

---

## No Global Env-Var Pin (Forbidden)

A **machine-global environment-variable root pin** (e.g. `WORKBENCH_ROOT` / `SESSION_ROOT`) **MUST NOT** be used as the resolution mechanism. Nx's `NX_WORKSPACE_ROOT_PATH` is the cautionary tale: set globally by the tooling, it **leaks across git worktrees and multiple checkouts** — a second window on a different worktree inherits the wrong root and silently mis-roots every tool. Nx's own guidance is to detect the root from the marker file rather than the env var.

A global pin is the precise opposite of the genesis tier's **per-session, no-silent-default** contract. If a per-session escape is ever needed it MUST be modelled on Go's `GOWORK`: a per-session, **reported** value with an explicit `off`, surfaced by `memo session root` exactly as `go env GOWORK` reports its source — never an ambient global default.

---

## Pinned Once, Never Recomputed

Root detection runs **once**, at SessionStart, and the resolved root is pinned alongside the session identity ([08-identity-pin.md](/specification/identity-pin/)). Every hook reads the **pinned** root, never a value recomputed from the current cwd: a `cd` deeper into the tree (which the cd-soft-guard already warns about) MUST NOT silently re-anchor the session to a nested `.session/`. The SessionStart-Pin is the stable anchor that keeps the root — like the session id — from drifting over the session lifetime.

---

## The `memo session root` Leaf

The resolved root is reported by a **read** CLI leaf, `memo session root`, under the CLI doctrine ([04-cli.md](/specification/cli/)). It is the reference resolver — the walk-up is implemented once and reported, not reimplemented per hook — and it surfaces both the resolved path and its source (`root:true` marker / `workbenchRoot` pointer / `none`), so the resolution is deterministic and testable. As a read leaf it is side-effect-free: it observes and reports, it never writes a marker or pins a root.

---

## Three Tiers, No Fourth

Root detection adds **fields and a marker**, not a tier. The three-tier config cascade ([05-config-cascade.md](/specification/config-cascade/)) is unchanged: `root` and `workbenchRoot` are fields *within* the existing `.session/config.json` tiers, and the walk-up merely chooses *which* `.session/` anchors that cascade. No fourth tier is introduced.

---

## Conformity Requirements

The root-detection contract's binding `MUST`s are authored here **prose-first**: each block's `statement` faces generation (it shapes how the walk-up resolver and its read leaf are built) and its `check` faces the finalization gate with a ternary verdict. Today only the `flag > env > null` identity resolution ships; the nearest-ancestor walk-up and the `memo session root` read leaf are the spec'd **target**, so both rules carry the honest `grade: todo`.

The walk-up to a `root:true` marker with no global env-var pin is the load-bearing rule; the resolver is not yet shipped, so the grade is `todo`:

```requirement
{
  "id": "REQ-996",
  "title": "Root detection walks up to a root:true marker, never a global env var",
  "statement": "Project-root detection MUST be a nearest-ancestor walk-up over the `.session/` directory marker, stopping at the first `.session/` whose config declares `root:true`, with an optional relative `workbenchRoot` pointer as the only override. A machine-global environment-variable root pin MUST NOT be used (it leaks across worktrees and silently mis-roots every tool), and an unresolved root resolves to `null` with source `none` while the gate fails open.",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-sop", "root-detection", "walk-up"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Root resolution is a pure function of the filesystem and the pinned start cwd, walking up to the nearest .session/ that declares root:true",
      "No machine-global env var (e.g. WORKBENCH_ROOT / SESSION_ROOT) participates in resolution",
      "An unresolved root yields null with source 'none' and a fail-open gate"
    ]
  },
  "grade": "todo"
}
```

The resolved root is reported by a single side-effect-free read leaf; that leaf is not yet shipped, so this `tool` check carries the honest `grade: todo`:

```requirement
{
  "id": "REQ-997",
  "title": "memo session root is a side-effect-free read leaf reporting path and source",
  "statement": "The resolved root MUST be reported by a single side-effect-free read leaf, `memo session root`, that surfaces both the resolved path and its source (`root:true` marker / `workbenchRoot` pointer / `none`). The walk-up is implemented once and reported, never reimplemented per hook, and the leaf MUST NOT write a marker or pin a root.",
  "scope": { "repos": [], "categories": ["session"], "tags": ["session-cli", "root-detection", "read-leaf"] },
  "severity": "warning",
  "check": {
    "kind": "tool",
    "tool": "memo",
    "tactic": "session-root-read",
    "verify": [
      "Run `memo session root` and parse the envelope",
      "Assert it reports the resolved path and its source, and that the leaf wrote nothing"
    ]
  },
  "grade": "todo"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [08-identity-pin.md](/specification/identity-pin/) — the SessionStart-Pin that anchors resolution; the root is pinned once, never recomputed from a mutated cwd.
- [05-config-cascade.md](/specification/config-cascade/) — the `.session/config.json` schema and three-tier cascade; the project tier carries the optional `workbenchRoot` pointer.
- [01-genesis-root.md](/specification/genesis-root/) — the genesis tier, `flag > env > null` precedence, and the fail-open contract on an unresolved root.
- [04-cli.md](/specification/cli/) — the CLI doctrine under which `memo session root` is a read leaf.
