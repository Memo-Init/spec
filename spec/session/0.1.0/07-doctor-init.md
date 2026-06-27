# 07. session doctor / session init

| | |
|---|---|
| Status | Draft |
| Depends on | [06-namespace-registry.md](./06-namespace-registry.md) |
| Related | [05-config-cascade.md](./05-config-cascade.md), [04-cli.md](./04-cli.md), [02-enforcement.md](./02-enforcement.md) |

The enforcement hook ([02-enforcement.md](./02-enforcement.md)) is **fail-open and permissive by design** — it must never lock the machine out of its own tools. The strict checks therefore live elsewhere: in the **foreground**, in two CLI verbs a developer runs deliberately. `session doctor` answers *"is this environment ready to work?"* without mutating anything; `session init` scaffolds the missing config additively, exactly once. This chapter specifies the **contract** for both, and the **session namespace** is its **reference implementation**: `memo session doctor` / `memo session init` are the first concrete doctor/init pair, with the top-level aggregator `memo doctor` / `memo init` rolling every namespace's pair up. The contract is the spec target; the session namespace is where it lands first — not every namespace ships it (a catalog namespace has nothing to initialize).

---

## The Form — A Top-Level Aggregator Over Per-Namespace Leaves

`doctor` and `init` exist at **two levels** that compose rather than compete:

| Level | Command | Role |
|-------|---------|------|
| **Aggregator** | `memo doctor` / `memo init` | top-level roll-up — dispatches to every registered namespace's leaf and merges their envelopes into one verdict |
| **Per-namespace leaf** | `memo <ns> doctor` / `memo <ns> init` | the namespace's own readiness battery and additive scaffold (`memo session doctor`, a future `memo workbench doctor`, …) |

The aggregator owns no checks of its own; it **fans out** to the leaves and rolls their results up (any leaf `not-ready` ⇒ the aggregate is `not-ready`). The leaves carry the actual logic. Because a namespace bounds where a leaf name must be unique ([06-namespace-registry.md](./06-namespace-registry.md), rule N-2), the **same leaf name recurs safely across namespaces** — `memo session doctor` and a future `memo workbench doctor` are distinct commands, not a collision.

### Required for SOP-Instances, Optional for Catalogs

Whether a namespace MUST carry the pair follows the **SOP-instance-vs-catalog** distinction of [06-namespace-registry.md](./06-namespace-registry.md):

| Namespace kind | `doctor` / `init` | Why |
|----------------|-------------------|-----|
| **SOP-instance** (e.g. `memo`, `workbench`) | **REQUIRED** | it has a Setup and a readiness state, so it owes both a Health check (`doctor`) and an additive Setup (`init`) |
| **Catalog** (e.g. `flowmcp`) | **OPTIONAL** | it carries skills but defines no procedure and has nothing to initialize, so the pair is not owed |

### doctor = Health, init = Setup

The pair is not a second concept beside the SOP common denominator — it is its **executable form** ([11-common-denominator.md](./11-common-denominator.md)): **`init` realizes Setup** (bring the scope to a known-good baseline) and **`doctor` realizes Health** (answer "is this scope in order?"). A namespace's doctor/init pair is the runnable face of the same Setup/Health its SOP describes in prose; this chapter specifies that face for the session reference instance.

The **session** namespace's leaf is the user's own workspace check: `memo session doctor` is the **Workspace help/validate** a developer reaches for at the start of work — *"are the CLIs available, and is the workspace healthy?"*. It is the reference implementation the rest of this chapter specifies in full.

---

## Two Verbs Along the Mutation-Safety Line

`doctor` and `init` are two of the **reserved standard verbs** of the CLI doctrine ([04-cli.md](./04-cli.md)); both obey its **result-envelope + exit-code mirror**. They split along the only line that matters for a readiness tool — whether it writes:

| Verb | Posture | Mutates? | Precedent |
|------|---------|----------|-----------|
| `session doctor` | diagnose-only readiness preflight | **never** — read-only, prints the fix command per failing item | `flutter doctor`, `brew doctor`, `gh auth status` |
| `session init` | explicit additive scaffold-once | **only additively** — proposes a merge, never clobbers an existing file, records what it created | `terraform init` (installs + writes a reviewable lock file) |

`init` **subsumes** `doctor`: it runs the same checks first, then offers to create only what is genuinely absent.

---

## `session doctor` — The Readiness Preflight

`session doctor` runs a fixed pipeline and prints a per-item verdict. Every check is derived from the **registry**, never from prose or a filesystem guess (the registry is the single self-discovery source — [06-namespace-registry.md](./06-namespace-registry.md)):

1. **Resolve identity** — `sessionId` via `flag > env > null` (`memo session resolve`, [01-genesis-root.md](./01-genesis-root.md)).
2. **Load config** — `.session/config.json` unioned with every `config.d/*` fragment (the cascade, [05-config-cascade.md](./05-config-cascade.md)).
3. **`registry-validate`** — the same dangling-edge validator the build runs, now applied at runtime.
4. **Presence** — confirm each registered skill resolves on disk (`~/.claude/skills/<id>` target exists).
5. **Strict namespace collision** — the N-1 / N-2 checks (run HERE; see below).
6. **Print the doctor table** and emit the envelope.

The six checks and their severities:

| # | Check | Severity |
|---|-------|----------|
| 1 | `.session/config.json` exists & parses (the entry point) | **WARN** — `not-ready`, never a block (the gate fails open on it) |
| 2 | every registered skill resolves on disk | **FAIL** if a *required* skill is absent; WARN for an optional add-on |
| 3 | no dangling required `when:pre` edge — both endpoints present (**this is `registry-validate`**) | **FAIL** |
| 4 | each reserved namespace is unique — no N-1 / N-2 collision | **FAIL** |
| 5 | each skill carries a structured `attributionSkill:<id>` signal (the only trusted signal — REQ-SS-SIGNAL) | **WARN** |
| 6 | gate runtime deps present (`jq` on PATH); disable-switch / sentinel state surfaced | **WARN** for `jq`; **INFO** for disable-switch state |

Check 3 makes the doctor the **runtime superset** of the build-time `registry-validate`: one validator core, two timings — `registry-validate` is a *subset that fails the build*, `session doctor` is *that plus on-disk presence, namespaces, signals, and jq, that reports*. This mirrors the family's existing "one registry, one scan, two timings" framing.

### It Reports — It Never Blocks

`session doctor` **MAY exit non-zero** in the foreground so a rollout script or CI can gate on it, but it **MUST NEVER block the session**. This is the `flutter doctor` / `brew doctor` contract: surface every problem with its fix, then get out of the way. A doctor that fail-closed would re-introduce the very lockout hazard the genesis tier is built to avoid (REQ-SS-EDGEVALID, [01-genesis-root.md](./01-genesis-root.md)).

The per-item trichotomy mirrors the gate's three-state contract — **pass / warn / fail** maps onto **ALLOW / ERROR / DENY** — so the doctor speaks the same language as the gate it front-runs. The top-level `status` rolls up: any `fail` ⇒ `not-ready`; only `warn` ⇒ `degraded`; all `pass` ⇒ `ready`. The exit code mirrors it: `0` when no `fail` (warnings allowed), non-zero on any `fail`.

```jsonc
{ "status": "degraded",                       // ready | degraded | not-ready
  "checks": [
    { "id": "session-config",   "status": "warn", "detail": ".session/config.json missing", "fix": "run `session init`" },
    { "id": "skill-present",     "status": "fail", "detail": "memo-sop not on disk",
      "fix": "link the memo-sop skill into ~/.claude/skills/" },
    { "id": "edge-valid",        "status": "pass", "detail": "REQ-061 endpoints both present", "fix": null },
    { "id": "namespace-unique",  "status": "pass", "detail": "memo, workbench reserved — no collision", "fix": null } ],
  "summary": { "pass": 2, "warn": 1, "fail": 1 } }
```

Beside the envelope, a human render in the memo board style — `Check | Status | Detail | Fix`, the fix column carrying the exact remediation per failing row:

```
session doctor — not-ready (1 fail · 1 warn · 2 pass)

  Check             Status  Detail                       Fix
  session-config    warn    .session/config.json missing  run `session init`
  skill-present     fail    memo-sop not on disk          link memo-sop into ~/.claude/skills/
  edge-valid        pass    REQ-061 endpoints present     —
  namespace-unique  pass    memo, workbench — no clash    —

  exit 1
```

---

## The Strict Namespace Checks Run HERE

The **N-1 / N-2 namespace-collision checks** defined in [06-namespace-registry.md](./06-namespace-registry.md) run in the **foreground**, inside `session doctor` / `session init` — **never at the fail-open hook**. This is the deliberate division of labour: the PreToolUse gate stays permissive and cheap (it must, to never block); the expensive, strict, potentially-rejecting verification is a deliberate developer action. A colliding registration is a `fail` in the doctor's report, surfaced loudly with its fix — it is not a runtime block, and the gate never fail-closes on it.

---

## `session init` — Additive Scaffold-Once

`session init` is the explicit bootstrap. It exists because skills are "sometimes missing" and a config must exist as the entry point — but creating that config still obeys the global **no-auto-write / no-overwrite** discipline. Its contract:

- **Gather** the per-tool config fragments each registered tool contributes (its `skills[]` with `attributionSkill:*` signals and its reserved `namespace`).
- **Propose a merge**, never apply silently. If `.session/config.json` already exists it is **never clobbered** — `init` presents the additive diff and creates only what is genuinely absent (the `terraform init` lock-file posture: explicit, additive, recorded).
- **Record** what it created, so the action is reviewable after the fact.

### One-Time Config Migration (REQ-061)

`session init` also carries the **one-time migration** of the legacy project-scoped registry to the session config: `.workbench/registry.json` → `.session/config.json` (the move *down* from `.workbench/` to `.session/`, [05-config-cascade.md](./05-config-cascade.md)). It is the same additive, never-overwrite operation — the legacy file is read, its `skills[]` / `requirements[]` folded into the proposed config, and the result presented as a diff. The migration runs **once**; a second `session init` over an already-migrated config is a no-op that only re-runs the `doctor` checks.

---

## Foreground Strict, Hook Fail-Open

The two halves of the system are intentionally asymmetric, and this chapter is one half:

| Surface | Posture | When |
|---------|---------|------|
| PreToolUse gate ([02-enforcement.md](./02-enforcement.md)) | **fail-open, LOUD**, never blocks on trouble | every gated tool call, automatically |
| `session doctor` / `session init` (here) | **strict** — registry-validate, presence, N-1/N-2 collision; MAY exit non-zero | foreground, on demand and at the boundary into work |

A missing `.session/config.json` is the canonical example: the gate's **ERROR(fail-open)** state ALLOWs the call with a loud stderr note (REQ-SS-FAILOPEN), while `session doctor` reports it as a `not-ready`, fixable `warn`. The doctor screams; the gate never fail-closes. Readiness is advisory; enforcement is the gate's, and the strict checks that could reject never sit on the runtime path.

---

## Related

- [05-config-cascade.md](./05-config-cascade.md) — the `.session/config.json ∪ config.d/*` cascade the doctor loads and `init` scaffolds; home of the REQ-061 migration.
- [06-namespace-registry.md](./06-namespace-registry.md) — the registered `sops[]` set the doctor verifies, and the N-1 / N-2 collision checks that run here in the foreground.
- [04-cli.md](./04-cli.md) — `doctor` and `init` as reserved standard verbs; the result-envelope + exit-code mirror both obey.
- [02-enforcement.md](./02-enforcement.md) — the fail-open hook this chapter is the strict-foreground counterpart of.
