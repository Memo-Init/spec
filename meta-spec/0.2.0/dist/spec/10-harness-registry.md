---
title: "Harness Registry"
description: "A spec is authored, built and served the same way regardless of which agent harness runs it, but the *tools* a harness exposes and the *config surface* it carries are not universal — they differ per..."
spec_meta_version: "0.2.0"
spec_file: "10-harness-registry.md"
order: 10
section: "Meta-Spec"
normative: true
generated_at: "2026-07-13T19:05:19.052Z"
generated_from: "meta-spec/0.2.0/draft/spec/10-harness-registry.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: meta-spec/0.2.0/draft/spec/10-harness-registry.md."
---


A spec is authored, built and served the same way regardless of which agent harness runs it, but the *tools* a harness exposes and the *config surface* it carries are not universal — they differ per harness and per harness version, and they drift on their own release cadence. This chapter specifies the **harness registry**: the normative descriptor a harness is captured by, how a harness is identified and registered, the role contract layered on top, and the third drift boundary the registry adds to the spec lifecycle. It is a normative chapter of the Meta-Specification family, read under the RFC-2119 conformance interpretation the family establishes in its overview ([./00-overview.md](/spec/overview/)).

The registry keeps the spec text harness-neutral: the spec chapters never name a tool, and everything harness-specific is pushed into a versioned descriptor the registry owns. A new harness, or a new version of one, is a data change under the registry — never an edit to the spec prose.

---

## The Descriptor — Three Fields

A harness is captured by exactly one **descriptor** with three top-level fields, validated by `meta-spec/<version>/draft/data/harness.schema.json`:

| Field | Holds | MUST NOT hold |
|-------|-------|---------------|
| `toolContract` | the tool surface — a shared `core.required[]` plus per-role deltas (`roles{}`) | — |
| `config` | the config-surface **names** the harness exposes: env-var names, hook-event names, permission-rule kinds, skill-config names | any value, secret, token, path, or concrete rule |
| `adapter` | how the harness is driven — `kind` (`cli` / `sdk` / `api` / `ide`), optional `entrypoint`, `notes`, and the optional `model` / `effort` the harness runs under | — |

The `config` field is **names only**. It records *that* a harness exposes, say, an `env` surface and *which* variable names live there — never what those variables are set to. This is the line that lets a descriptor be published as open source without ever leaking a credential: a secret cannot enter a field that structurally admits only bare name strings.

The `adapter` MAY also carry two optional identity fields, `model` and `effort` — the model id and reasoning-effort tier the harness runs under. Both are **bare identifiers, never secrets**, and both are **optional**: a descriptor is free to be silent on them. When present, they are the **ground-truth** a session-tier init config-gate validates the running session's declared model and effort against ([/session/config-cascade/](/session/config-cascade/)); when absent, that validity check degrades gracefully to a warning rather than a false block, so a silent descriptor never rejects a session. This keeps the model/effort fact single-sourced in the descriptor while leaving the *consumer* — the config-gate — in the session tier that actually runs the session.

---

## Identity — the Harness ID and the Config Pair

A harness is identified by the same shape as the spec reference ID ([./08-spec-lifecycle.md](/spec/spec-lifecycle/), Part A): `<harnessId>@<version>`. The first registered instance is `claude-code@2.1.206` — `harnessId` is the lowercase harness slug, `version` is the harness's own release version (a bare semantic version, no `v` prefix, mirroring [./07-versioning.md](/spec/versioning/)).

Because a harness *and its configuration* together determine behaviour, a second, finer identity exists — the **(harness, config) pair**: `<harnessId>@<version>:<configShortSha>`, e.g. `claude-code@2.1.206:<configShortSha>`, where `configShortSha` is the **7-character prefix** of the config snapshot's content hash — the same short-SHA convention the spec reference ID uses for `fromCommit`. The pair is an **optional, nachführbare** quantity: it is stamped once a config snapshot is stable and re-blessed as a maintenance act, not hard-required at first registration (a config hash is not yet stable when a harness is first captured).

---

## The Registry — Registered or Not Built

Instances live at a path that encodes their identity, and are made real only by an explicit registration:

- **Instance path.** `data/harnesses/<harnessId>/<version>/harness.json` — e.g. `data/harnesses/claude-code/2.1.206/harness.json`. The path *is* the identity; the descriptor file itself does not restate `harnessId`/`version`.
- **Registration.** `data/harnesses.manual.json` lists the registered instances, exactly as `data/refs.manual.json` is the curated head for the spec refs. **Not registered = not built** — an on-disk `harness.json` that no entry in `harnesses.manual.json` points at is inert, the same rule `refs.manual.json` establishes for the spec families. Registration is the deliberate, reviewable act that admits a harness into the build.

This keeps the registry curated rather than directory-scanned: adding a folder does nothing until a human adds the registration line.

---

## Roles — One Core, Three Deltas

The `toolContract` does **not** carry three full tool lists. It carries **one** shared `core.required[]` and, per role, only the **delta** from that core (`add` / `remove`, plus a gate-dependent marker where a tool's availability is time-variant). The three roles are normative:

- `roles.orchestrator` — coordinates work (adds coordination tools).
- `roles.worker` — executes a scoped unit of work (adds structured-output, removes coordination tools).
- `roles.user` — the interactive surface (adds interaction tools).

The exact membership of `core.required[]` and each role's delta is filled in the **instance** descriptor (`harness.json`), not restated in this norm — the norm fixes the *shape* (one core, three role deltas, no duplicate full lists), the instance fixes the *values*. The rationale is empirical: one small core carries the overwhelming majority of usage, so three parallel full lists would be mostly duplication and would drift threefold.

The three role names — `user`, `orchestrator`, `worker` — are registered as **anchor terms** in the org anchor-term register (the meta-spec anchor-term convention, [./06-conventions-writing.md](/spec/conventions-writing/)), so their canonical labels and negative delimitations are pinned against mis-labelling. The register entries point back at this section as their owning definition; how a *running context* is assigned one of these roles is specified below.

---

## Part C — The Third Drift Boundary (dist to skills)

The spec lifecycle ([./08-spec-lifecycle.md](/spec/spec-lifecycle/)) names two drift boundaries: `draft → dist` (an authored change drifts its dependent chapters) and `dist → website` (the served site drifts from the spec-emitted bundle). The harness registry adds a **third** boundary, **per harness**:

3. **`dist → skills`** — the built spec (`dist`) drifts from the harness-and-role skill set generated beside it under `skills/`. When a chapter changes, or a harness's tool contract changes, the generated `skills/<harnessId>/<harnessVersion>/<role>/` set can fall out of step with the `dist` it was generated from.

This third boundary is detected the same way as the first two: the existing drift engine (`DriftSensor`) is **lifted** onto the `dist → skills` edge — reused, not reinvented — and **WARNs** on drift rather than auto-blocking. A drifted boundary is re-blessed via `memo maintenance verify`, exactly as the `draft → dist` boundary is. The `skills/` tree sits *outside* the `dist/` atomic copy unit (it is per-harness, not part of the served bundle), which is precisely why it needs its own boundary rather than riding along inside `dist`.

---

## The Skills Structure and its Compatible Range

The tool contract says *which* tools a role has; the **skills structure** says *which skills* that role runs against a given harness version. It lives beside the built spec, one subtree per harness and role:

`<namespace>/<version>/skills/<harnessId>/<harnessVersion>/<role>/skills.manifest.json`

Each manifest is **generated**, never hand-edited, and carries `{ specId, harnessRef, role, compatibleRange, skills[] }`. It is the object the third drift boundary (`dist → skills`) watches.

**Ownership — one namespace.** The skills structure is bound to **one** namespace, not spread across all four. The meta-spec family owns the harness-registry norm, so it also owns the generated `skills/` structure. A skill is registered under exactly one `(harnessId, harnessVersion, role)` manifest; **not registered = not built**, the same rule the descriptor registry follows.

**`compatibleRange` — exact or minor.** A manifest binds its role to a harness version through a `compatibleRange` that is exactly one of two shapes:

| Shape | Form | Used when |
|-------|------|-----------|
| **Exact** | `=<major.minor.patch>` (e.g. `=2.1.206`) | the role's contract is **patch-sensitive** — it carries a gate-dependent / time-variant tool (such as `taskCrud`) whose availability can change between patch releases, so the binding must not float. |
| **Minor** | `^<major.minor>` (e.g. `^2.1`) | the role's contract is **stable across patch releases** — a fixed delta a patch bump does not disturb, so the binding floats within the minor line. |

The **default is Minor**; a role is pinned **Exact** only when it declares a gate-dependent tool. The choice is **derived from the descriptor** (the presence of a gate-dependent marker), not set by hand — so the range can never drift from the contract it describes. For the first instance this makes `orchestrator` (which carries the gate-dependent `taskCrud`) exact at `=2.1.206`, while `worker` and `user` bind to `^2.1`.

---

## Role Assignment and the External-Session Boundary

The three roles above are a **tool contract**; this section says how a **running context** is assigned one of them, and where role assignment stops. The assignment is descriptive, not a privilege grant — it names which delta a context runs under, it does not elevate anything.

- **The interactive top-level context** the user drives is the `user` role.
- **A coordinating context** — a rollout orchestrator, an agent-team **Lead**, or a **Dynamic Workflow** runner script that fans work out — is the `orchestrator` role. The coordination tools (`roles.orchestrator.add`) are exactly what a coordinator needs; the gate-dependent `taskCrud` marker is resolved per session by the pre-flight probe, not assumed.
- **A scoped-execution context** — a **Worker**, a fresh-context **Evaluator**, or any unit a workflow spawns to do one thing — is the `worker` role, with the coordination tools removed.

The agent-team roles ([memo/13-orchestration.md](/specification/orchestration/)) and the three agent-execution primitives ([memo/14-agents-skills-tasks.md](/specification/agents-skills-tasks/)) both project onto these three contract roles rather than defining a fourth axis: a Lead is an `orchestrator` and a Worker is a `worker`, regardless of whether it runs as an ephemeral sub-agent, a persistent agent, or inside a workflow script.

**The external-session boundary.** Every in-process context — however deeply the sub-agent tree nests — belongs to **one harness invocation** and is assigned one of the three roles within it. An **external `claude -p` / SDK invocation** is *not* a role: it is a **separate harness process** that opens its own genesis root and its own bounded trust profile ([session/01-genesis-root.md](/session/genesis-root/)). It is detected as an outer-boundary session — a new `(harness, config)` context — rather than mapped onto `orchestrator` / `worker` / `user`. This detection is deliberately **descriptive**: the registry records *that* an external session is a distinct harness context, and does **not** assert a hard tool set for it. An external harness runs under whatever contract *its own* descriptor carries; claiming a fixed tool surface for a session this registry did not start would be a guess, and the registry does not guess across the boundary.

---

## Trust Model — Monotonic (harness, config) Pairs

A foreign `(harness, config)` pair (the finer identity above) carries a **trust level** — how far the system relies on the pair's captured tool surface and config names. Because a pair is *foreign* (captured from a harness the spec does not own), that trust is governed by a single rule: **monotonicity**.

- Trust may be **earned upward** as a pair proves stable: an unblessed pair is re-blessed once its config snapshot settles (the `:configShortSha` stamp above), and a previously-trusted pair keeps its level across a content-stable re-capture.
- Trust may be **lowered** at any time — a pair whose descriptor or config names drift, or that fails a maintenance check, is downgraded.
- A once-downgraded pair **MUST NOT silently re-ascend**. Regaining trust is an **explicit, reviewable maintenance act** (the same `memo maintenance verify` bless that re-blesses a drifted pin), never an automatic recovery on the next build. Silent re-elevation is the exact failure this rule forbids: a pair that lost trust for a reason cannot quietly reclaim it because the reason scrolled out of view.

This mirrors the session-tier monotonicity of [session/01-genesis-root.md](/session/genesis-root/) — a session can move to a *more* restricted profile but never label itself into more privilege — lifted onto the `(harness, config)` pair: a pair can lose trust freely, but only a deliberate act restores it. Monotonicity is what keeps a foreign pair's trust honest without a central authority vouching for it.

---

## Adding a Harness Version is Maintenance, not a Release

Registering a new harness version — a new `data/harnesses/<harnessId>/<version>/` instance and its `harnesses.manual.json` line — is a **maintenance act**, not a spec release. It re-blesses the affected pins and clears the `dist → skills` DriftSensor WARN; it does **not** bump a spec family's version or cut a release. The two-tier release strategy ([./07-versioning.md](/spec/versioning/) references the memo family's release chapter) is untouched by harness churn: harnesses version on their own cadence, under the registry, without moving any spec version.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./08-spec-lifecycle.md](/spec/spec-lifecycle/) — the org-wide spec lifecycle whose two drift boundaries this chapter extends with a third (`dist → skills`).
- [./07-versioning.md](/spec/versioning/) — the bare-semver directory convention and the release strategy harness versioning stays clear of.
- [./00-overview.md](/spec/overview/) — the Meta-Specification entry point and the RFC-2119 conformance anchor this chapter is read under.
