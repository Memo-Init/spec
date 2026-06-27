# 05. The .session Config Cascade

| | |
|---|---|
| Status | Draft |
| Depends on | [01-genesis-root.md](./01-genesis-root.md) |
| Related | [02-enforcement.md](./02-enforcement.md), [06-namespace-registry.md](./06-namespace-registry.md), [07-doctor-init.md](./07-doctor-init.md) |

The machine-readable form of the SOP chain (skills, dependency edges, namespace reservations) is a **config** the PreToolUse gate reads. This chapter specifies where that config lives, how it merges across tiers, and the one-time move that relocates it from the workbench tier down to the session tier. The deterministic gate that reads it is specified in [02-enforcement.md](./02-enforcement.md); the structure of the registrant blocks inside it is specified in [06-namespace-registry.md](./06-namespace-registry.md).

---

## The Entry Point Moves Down a Tier

Today the only active registry is project-scoped — `.workbench/registry.json`, carrying the single live edge REQ-061 (`memo-init → memo-sop`, `when:pre`). Because the workbench is itself just **one session-SOP application** above the genesis root ([01-genesis-root.md](./01-genesis-root.md)), the config that anchors the chain belongs at the **session tier**, not the workbench tier.

A new per-location **`.session/config.json`** therefore becomes THE entry point the PreToolUse hook resolves. The chain edges, the registered SOPs, and the namespace reservations move one tier **down** — out of `.workbench/`, into `.session/`. What stays in `.workbench/` is only what is genuinely workbench-specific (repo facing/visibility/remote policy, folder-lints).

---

## The Three-Tier Cascade

The config is a cascade in the git/kustomize sense: a base set of values that more-specific tiers extend and merge, read **bottom-up**, an absent tier contributing nothing.

```
.session/config.json   (Genesis base — identity, security, SOP chain, namespaces)
   ↑ extended/merged by
.workbench/config.json (Workbench tier — repo facing/visibility/remote, folder-lints)
   ↑ extended/merged by
Project tier           (project specifics — prefix, optional workbenchRoot pointer)
```

The base tier carries identity and the chain; the overlays stay thin. The cascade MUST stay shallow — a project does not introduce a fourth authority, it only contributes its own specifics over the base.

---

## Per-Concern Ownership — Two Structures, Two Merge Rules

The config holds **two separate top-level structures with different merge semantics**, and the two MUST NOT be conflated (conflating override-scalars with merge-collections is the classic cascade bug). One concern has exactly one owning tier; single-source is enforced by **ownership**, not prose.

| Concern | Owning tier | Override / merge |
|---------|-------------|------------------|
| `sessionId` (global) · per-namespace ids under `options` (e.g. `options.memo.memoId`) | session | resolved, not overridable (global-per-session) |
| Security / trust level | session | resolved, NOT cascaded — a project may never self-elevate (monotonicity, see [01-genesis-root.md](./01-genesis-root.md)) |
| `sops[]` (registrant blocks: namespace+owner+tier+skills[]+optional requires[]) | session base + drop-in merge | **list-union by `namespace`** (one block per namespace) |
| `requirements[]` (fine entrypoint→skill pre-gate edges, e.g. REQ-061) | session base + merge | **list-union**; fed ONLY by SOP-instance blocks ([06-namespace-registry.md](./06-namespace-registry.md)) |
| reserved namespaces | session | unique-key override; collision = error |
| disable switch / sentinel / canary | `~/.claude/session/` | — (recovery reachable above any project) |
| repo facing/visibility/remote | workbench (`.workbench/`) | override per repo |

The collection concerns (`sops[]`, `requirements[]`) **merge** as list-unions so each tier and each registrant contributes its own entries. The scalar concerns (identity, security/trust level) are **resolved, not cascaded**: they live only in the session tier and the cascade deliberately does not apply to them, so a more-specific tier can never raise its own trust level. This is the one place the cascade differs from git/XDG, and it preserves the monotonicity property of [01-genesis-root.md](./01-genesis-root.md).

---

## Skills Live Inside Their `sops[]` Block

The old **flat `skills[]` list no longer exists**. Skills are now declared **inside** their owning `sops[]` block (`namespace` + `owner` + `tier` + `skills[]` + optional `requires[]`), as specified in [06-namespace-registry.md](./06-namespace-registry.md). The cascade merge is therefore a **namespace-block union** (one block per namespace), not a flat skill union: two tiers each contributing skills do so by contributing their respective namespace blocks, and a namespace collision is an error rather than a silent concatenation.

Only SOP-instance blocks feed `requirements[]` (the pre-gate edges); a catalog block (e.g. FlowMCP) carries skills but contributes no edge and is therefore never a gate — see [06-namespace-registry.md](./06-namespace-registry.md).

---

## Two Homes — `.session/` vs `~/.claude/session/`

The spec uses **two sharply distinguished** paths whose names are deliberately close but whose scope is not:

| Path | Scope | Holds |
|------|-------|-------|
| `.session/` | **per-place** (sibling of `.workbench/`, one per tree) | this location's `config.json`: chain edges, namespaces, registrant blocks |
| `~/.claude/session/` | **machine-global** (one per machine) | recovery state above any project: disable-switch sentinel, canary fixtures, logs |

Recovery primitives live in the machine-global home precisely so they remain reachable when no project config is present. The per-place name `.session/` was chosen over `.context/`, which was **rejected** because it would collide with the authored-content folder `context/`.

---

## Migration — A One-Time Move, No Dual-Read

Moving REQ-061 out of `.workbench/registry.json` into `.session/config.json` is a **behavioural change to the live gate**, so it MUST be performed as a single deliberate step, never silently:

- **One-time move via `session init`** ([07-doctor-init.md](./07-doctor-init.md), which carries the migration): `init` proposes the relocated config as a **reviewed diff** and never auto-overwrites an existing file (REQ-SS-NOWRITE).
- **Canary-guarded:** the SessionStart canary MUST be green **before and after** the move, so a regression self-discloses immediately.
- **No dual-read** (explicitly excluded): the hook reads exactly one resolved config. There is no transition window in which both `.workbench/registry.json` and `.session/config.json` are consulted — the move is single-source by construction, not by a fallback chain.

This chapter is spec-first: it **describes** the migration as the intended one-time change at the live gate; it does not perform it.

---

## Related

- [01-genesis-root.md](./01-genesis-root.md) — the tier model, identity, and the security level this cascade keeps resolved-not-overridable.
- [06-namespace-registry.md](./06-namespace-registry.md) — the structure of the `sops[]` registrant blocks the cascade merges, and `requires[]` vs `requirements[]`.
- [07-doctor-init.md](./07-doctor-init.md) — `session init` carries the one-time migration; `session doctor` validates the resolved config.
- [02-enforcement.md](./02-enforcement.md) — the PreToolUse hook that reads this config and enforces its edges.
