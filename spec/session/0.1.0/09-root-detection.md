# 09. Project Root Detection

| | |
|---|---|
| Status | Draft |
| Depends on | [08-identity-pin.md](./08-identity-pin.md) |
| Related | [05-config-cascade.md](./05-config-cascade.md), [01-genesis-root.md](./01-genesis-root.md), [04-cli.md](./04-cli.md) |

The genesis tier owns the **session identity**; this chapter specifies how a session locates the **directory** that identity is anchored to — the project/workbench root the hook and the config cascade resolve against. The `.session/` directory **is** the root marker, resolution is a **nearest-ancestor walk-up** bounded by a `root: true` stop-flag, an opt-in `workbenchRoot` pointer is the only override, and a machine-global env-var pin is forbidden.

---

## The `.session/` Marker

The session root is the **nearest ancestor directory containing a `.session/` directory**. The marker is a directory-name reservation — the same shape that `pnpm-workspace.yaml`, a virtual `Cargo.toml [workspace]`, or `go.work` give their tools. It cannot piggyback on `.git`: the workbench deliberately has **no git at the workbench-root or project levels**, so a dedicated marker is required rather than inferred from a VCS root.

Resolution is a **pure function** of the filesystem and one anchor cwd — no guess, no ambient global. It mirrors the workbench's own rule that *the level an agent operates at is decided by its location*, and it reuses the genesis tier's `flag > env > null` precedence discipline ([01-genesis-root.md](./01-genesis-root.md)): explicit beats ambient, ambient beats nothing, nothing is ever a guess.

---

## Resolution Algorithm

| Step | Action |
|------|--------|
| 1 | Anchor at the session's **pinned start cwd** (the SessionStart-Pin, [08-identity-pin.md](./08-identity-pin.md)) — resolution runs once, never from a later cd-mutated cwd. |
| 2 | Walk up to the nearest ancestor that contains a `.session/` directory. That marker is the **active session scope**. |
| 3 | If that scope's `.session/config.json` declares a `workbenchRoot` pointer, resolve it (relative) and take its target as the root — this **overrides** the remaining walk-up. |
| 4 | Otherwise continue walking up, stopping at the first `.session/` whose config declares `root: true`. That directory is the **anchoring root**. |
| 5 | The innermost collected `.session/` governs the active scope; the outermost `root: true` is the workbench root that anchors the SOP chain. Both are found in **one** pass. |
| 6 | If no `.session/` is found above the anchor cwd, the root resolves to `null` with source `"none"` (no-silent-default) and the gate **fails open** ([01-genesis-root.md](./01-genesis-root.md)). |

The walk-up **MUST** stop at the first `root: true` marker — it never escapes above the declared root.

---

## Marker Fields

A `.session/config.json` carries three fields relevant to root detection. Their cascade semantics are owned by [05-config-cascade.md](./05-config-cascade.md); their role in *locating* the root is below.

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
- **Validation:** `session doctor` / `session init` ([07-doctor-init.md](./07-doctor-init.md)) MUST verify the pointer resolves to a directory that actually carries a `root: true` `.session/`. A dangling pointer is a deterministic doctor finding, caught before work begins — the same spirit as a registry edge to an absent skill being refused at build time.

---

## No Global Env-Var Pin (Forbidden)

A **machine-global environment-variable root pin** (e.g. `WORKBENCH_ROOT` / `SESSION_ROOT`) **MUST NOT** be used as the resolution mechanism. Nx's `NX_WORKSPACE_ROOT_PATH` is the cautionary tale: set globally by the tooling, it **leaks across git worktrees and multiple checkouts** — a second window on a different worktree inherits the wrong root and silently mis-roots every tool. Nx's own guidance is to detect the root from the marker file rather than the env var.

A global pin is the precise opposite of the genesis tier's **per-session, no-silent-default** contract. If a per-session escape is ever needed it MUST be modelled on Go's `GOWORK`: a per-session, **reported** value with an explicit `off`, surfaced by `memo session root` exactly as `go env GOWORK` reports its source — never an ambient global default.

---

## Pinned Once, Never Recomputed

Root detection runs **once**, at SessionStart, and the resolved root is pinned alongside the session identity ([08-identity-pin.md](./08-identity-pin.md)). Every hook reads the **pinned** root, never a value recomputed from the current cwd: a `cd` deeper into the tree (which the cd-soft-guard already warns about) MUST NOT silently re-anchor the session to a nested `.session/`. The SessionStart-Pin is the stable anchor that keeps the root — like the session id — from drifting over the session lifetime.

---

## The `memo session root` Leaf

The resolved root is reported by a **read** CLI leaf, `memo session root`, under the CLI doctrine ([04-cli.md](./04-cli.md)). It is the reference resolver — the walk-up is implemented once and reported, not reimplemented per hook — and it surfaces both the resolved path and its source (`root:true` marker / `workbenchRoot` pointer / `none`), so the resolution is deterministic and testable. As a read leaf it is side-effect-free: it observes and reports, it never writes a marker or pins a root.

---

## Three Tiers, No Fourth

Root detection adds **fields and a marker**, not a tier. The three-tier config cascade ([05-config-cascade.md](./05-config-cascade.md)) is unchanged: `root` and `workbenchRoot` are fields *within* the existing `.session/config.json` tiers, and the walk-up merely chooses *which* `.session/` anchors that cascade. No fourth tier is introduced.

---

## Related

- [08-identity-pin.md](./08-identity-pin.md) — the SessionStart-Pin that anchors resolution; the root is pinned once, never recomputed from a mutated cwd.
- [05-config-cascade.md](./05-config-cascade.md) — the `.session/config.json` schema and three-tier cascade; the project tier carries the optional `workbenchRoot` pointer.
- [01-genesis-root.md](./01-genesis-root.md) — the genesis tier, `flag > env > null` precedence, and the fail-open contract on an unresolved root.
- [04-cli.md](./04-cli.md) — the CLI doctrine under which `memo session root` is a read leaf.
