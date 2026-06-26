# 06. The Namespace Registry

| | |
|---|---|
| Status | Draft |
| Depends on | [05-config-cascade.md](./05-config-cascade.md) |
| Related | [07-doctor-init.md](./07-doctor-init.md), [02-enforcement.md](./02-enforcement.md), [10-sop.md](./10-sop.md), [workbench/20-cli.md](/workbench/cli/) |

The flat `skills[]` array of [02-enforcement.md](./02-enforcement.md) records *what* skills exist but not *who owns them* or *which family they belong to*. This chapter replaces it with an `sops[]` array of **registrant blocks**: each block reserves a `namespace`, names its `owner`, and declares the `skills[]` it contributes. The model is VS Code's `publisher` + `contributes` — a reserved owner identity on the left, a declarative capability block on the right.

---

## From Flat `skills[]` to Owned `sops[]` Blocks

The `prefix-hyphen-name` convention ([13-conventions.md](./13-conventions.md)) already *is* a namespace mechanism: `memo-init`, `memo-sop`, `memo-revision-*` all share the `memo` prefix that names their family. This chapter promotes that implicit prefix to a **first-class, owned, reserved `namespace` field**. Each block in `sops[]` carries:

| Field | Role |
|-------|------|
| `namespace` | the reserved discovery handle — the `prefix` of `prefix-hyphen-name` made first-class and exclusive (VS Code `publisher`, npm scope) |
| `owner` | the single unit that reserves and maintains the block (exclusive contribution right) |
| `tier` | the tier the block sits at (`0` = genesis root, ascending) |
| `skills[]` | the declarative `contributes` block — what the namespace provides, each with detection `signals` |
| `requires[]` | optional, coarse inter-namespace dependency (which namespace this one presupposes) |

The reserved memo block:

```jsonc
{ "namespace": "memo", "owner": "memo-init", "tier": 2, "requires": ["workbench"],
  "skills": [ { "id": "memo-init", "signals": ["attributionSkill:memo-init"] },
              { "id": "memo-sop",  "signals": ["attributionSkill:memo-sop"]  } ] }
```

The host **reads** the union of every block; a tool never imperatively mutates the central config (see *Declare, Don't Register* below).

---

## Two Block Kinds: SOP-Instance and Catalog

The same `sops[]` array holds two kinds of block, distinguished only by whether the namespace is a **gate**:

| Kind | `requires[]` | Feeds `requirements[]` edge? | Role | Example |
|------|--------------|------------------------------|------|---------|
| **SOP-instance block** | carries dependencies | yes — its entry point sits behind a `when:pre` edge | a process that gates work behind a predecessor SOP | `memo`, `workbench` |
| **Catalog block** | empty | **no** — never a `requirements[]` edge, never a gate | a plain capability catalog: tools that are *available*, not *gated* | `flowmcp` |

A catalog block reserves a namespace and contributes skills like any block, but it is **never a precondition for anything**. FlowMCP reserves `flowmcp` and contributes `flowmcp-usage`; calling a FlowMCP tool is never gated behind a predecessor SOP:

```jsonc
{ "namespace": "flowmcp", "owner": "flowmcp", "tier": 2, "requires": [],
  "skills": [ { "id": "flowmcp-usage", "signals": ["attributionSkill:flowmcp-usage"] } ] }
```

The two kinds coexisting in one array is deliberate: the registry is the single union of everything registered, and a reader distinguishes a gate from a catalog by inspecting `requires[]` and the top-level `requirements[]`, not by reading two separate files. The SOP-instance-vs-catalog framing is elaborated in [10-sop.md](./10-sop.md).

---

## Two Dependency Granularities

A registrant carries dependency information at **two granularities**, and both are kept, clearly separated:

| Granularity | Field | Scope | Read by |
|-------------|-------|-------|---------|
| **Coarse** | `sops[].requires[]` | per-SOP, namespace → namespace ("memo presupposes workbench") | `session doctor` / `registry-validate` readiness preflight |
| **Fine** | top-level `requirements[]` | entry point → skill, with `when:pre/post` (e.g. REQ-061 `memo-init → memo-sop`) | the PreToolUse enforcement gate |

`requires[]` is the documentation of which families must be present; `requirements[]` is the exact runtime pre-gate edge the hook evaluates. They are **not** redundant: one declares a dependency between namespaces, the other declares the precise activation edge. `requirements[]` stays a **top-level** array (not nested per block) because a precondition edge crosses namespaces, and keeping it top level preserves the existing REQ-061 shape and the three-state enforcement contract of [02-enforcement.md](./02-enforcement.md) verbatim.

---

## Collision Rules N-1 and N-2

Two rules keep the registry sound. Both are stated normatively:

| Rule | Statement |
|------|-----------|
| **N-1** (one owner per namespace) | Every `sops[].namespace` MUST be unique within the config and reserved by exactly one `owner`. Two blocks reserving the same namespace is a collision and MUST be rejected. |
| **N-2** (skill id under its namespace) | Every skill `id` MUST have the form `<namespace>-<name>` of the block that declares it. `memo-sop` is legal under `memo`; declaring `repo-readme` inside the `memo` block is a mismatch and MUST be rejected. |

N-2 makes the prefix convention a checkable invariant and, as a consequence, the **same leaf name MAY safely recur across namespaces** (`memo`/`init` and a future `workbench`/`init` are distinct) — the namespace's only job is to bound where a name must be unique.

**Where they are caught is load-bearing.** Both rules are enforced **only at the foreground** `session doctor` / `session registry-validate` ([07-doctor-init.md](./07-doctor-init.md)) — the same place dangling edges are already caught. The PreToolUse hook MUST NEVER evaluate the collision rules: a colliding or malformed registry is **"registry malformed" → ERROR → fail-open ALLOW** per the three-state table of [02-enforcement.md](./02-enforcement.md). A namespace clash must never lock the machine out of its own tools.

| Requirement | Statement |
|-------------|-----------|
| **REQ-SS-NAMESPACE** | Each namespace is reserved by exactly one owner (N-1); a skill id MUST sit under its declaring namespace (N-2). Both are asserted at the foreground validator. A violation degrades the runtime gate to fail-open, never to block. |

---

## Declare, Don't Imperatively Register

A tool MUST NOT imperatively mutate the central config. Instead each registrant **declares** its own block as a drop-in fragment — `config.d/<ns>.json`, one owner per file — and `session init` / `session doctor` **collects** the fragments into the resolved `.session/config.json` ([05-config-cascade.md](./05-config-cascade.md)). The collection step runs N-1/N-2 at merge time and **proposes** the result for the developer to accept; it never silently clobbers an existing config.

This is how three independent registrants coexist sustainably: `memo`, `workbench`, and `flowmcp` each own a **disjoint** namespace and each contributes **only its own** `config.d/` fragment. The central config is their union, and any overlap is an N-1 collision caught at merge — the namespaces are the firewall between the plug-ins, exactly as a marketplace lets many publishers coexist.

---

## Related

- [05-config-cascade.md](./05-config-cascade.md) — the `.session/config.json` schema and `config.d/` cascade the `sops[]` array lives in.
- [07-doctor-init.md](./07-doctor-init.md) — where N-1/N-2 are enforced: the foreground readiness preflight and additive scaffold.
- [02-enforcement.md](./02-enforcement.md) — the three-state gate and why a collision degrades to fail-open ALLOW, never block.
- [10-sop.md](./10-sop.md) — the SOP-instance-vs-catalog framing in full.
