# 14. Agents, Skills and Tasks

| Field | Value |
|-------|-------|
| Status | Draft |
| Depends on | [13-orchestration.md](./13-orchestration.md) |
| Related | [15-prompt-generator.md](./15-prompt-generator.md), [12-rollout.md](./12-rollout.md), [09-contamination-context-handover.md](./09-contamination-context-handover.md), [00-overview.md](./00-overview.md) |

The system is moving toward **Agents as a base layer** on which skills build. This is not an abolition of skills: skills remain, and they remain the foundation for most procedures. Only the **beginning** — the foundation layer — is converted to agents. The guiding principle is "best result, not most efficient path": agents buy isolated context and standing operating rules where those matter most.

Agents are already used in the system today — phase execution (Lead / Worker / Evaluator, worktrees, fresh context), rollout execution, phase generation, schema grading, and the persona audit all run as agent teams. This chapter formalizes the skill-vs-agent distinction and the first migration boundary.

---

## Skill vs Agent

The two primitives differ in context and scope.

| Aspect | Skill | Agent |
|--------|-------|-------|
| Definition | A procedure executed in the **caller's context** | A definition with **repo-scoped operating rules** and an **isolated context** |
| Context | Shares the caller's context (and its contamination) | Fresh, isolated context per invocation |
| Rules | A procedure to follow | `AGENTS.md` — standing operating rules for the repo |
| Invocation | Loaded by tag/trigger into the current conversation | Spawned with a generated start-prompt as a per-invocation order |

A **skill** is the right shape when the procedure should run inside the caller's reasoning and share its context — formatting rules, repository conventions, documentation style. An **agent** is the right shape when the work must run in a clean room — independent evaluation, grading, security scanning — where carry-over from the caller's context would compromise the result.

`AGENTS.md` holds the **standing rules** (who the agent is, how it behaves, its repo-scoped constraints). The generated **start-prompt** (see [15-prompt-generator.md](./15-prompt-generator.md)) is the **per-invocation order** — the specific task for this run, composed deterministically. The two are complementary: standing rules plus a per-invocation order.

---

## Agent Execution Primitives

"Agent" is run in **three** distinct forms. This is the canonical typology; the orchestration machinery ([13-orchestration.md](./13-orchestration.md)) and the deployment strategies ([36-agent-strategies.md](./36-agent-strategies.md)) refer back to these types rather than redefining them.

| Type | Mechanism | Context | Return |
|------|-----------|---------|--------|
| **(a) Ephemeral sub-agent** | the `Agent` tool — spawns a fresh instance with its own system prompt, tools, and permissions; one-shot | fresh, isolated per invocation; sees no conversation history | only the final message |
| **(b) Persistent agent** | an agent **id** returned on completion; continued via `SendMessage`, not a fresh `Agent` call | retains its full history; resumes exactly where it stopped | the final message of the resumed run; re-queryable |
| **(c) Deterministic workflow** | a JavaScript **script** Claude writes; the runtime executes it; the *script* holds the loop, branching, and intermediate results | runs separate from Claude's context window; scales to dozens–hundreds of agents (up to ~1000/run) | only the final report reaches the context |

The platform name for type (c) is **Dynamic Workflow** — the script-driven primitive. A model-driven *research fan-out* (the Lead spawning a few type-(a) sub-agents per turn) is a different thing and MUST NOT be called a dynamic workflow (see [13-orchestration.md](./13-orchestration.md)).

**Nesting.** A sub-agent MAY spawn its own sub-agents, but the depth is **fixed at five** and is not configurable: a sub-agent at depth five does not receive the `Agent` tool and cannot spawn further. Only the top-level sub-agent's summary returns to the caller.

---

## The Word "Subagent" — Two Meanings

The word "subagent" carries two readings that MUST be kept apart so they do not collide.

- **User meaning (type-agnostic).** From the user's side a subagent is simply "**I delegate something and get a result back**" — it does not matter whether the work ran as an ephemeral sub-agent, a persistent agent, or a deterministic workflow. All three are "a subagent" in this sense.
- **Technical meaning (precise).** Technically, "subagent" is **only type (a)** — the ephemeral, fresh-context, one-shot form. Types (b) and (c) are a persistent agent and a workflow, not subagents in the strict sense.

When this spec says "subagent" in a mechanism context it means type (a); when it describes delegation from the user's perspective it means the broad, type-agnostic sense. The distinction is named here so the two never silently merge.

---

## Migration Boundary

Evaluators are the natural first candidates for agent form because the empty-context rule already requires them to run in a fresh, isolated context (see [09-contamination-context-handover.md](./09-contamination-context-handover.md)) — they are agents in everything but form.

**Migrating to agent form (evaluators):**

- the `*-evaluate` skills (`memo-revision-evaluate`, `memo-phase-evaluate`, `memo-rollout-evaluate`, `prd-evaluate`)
- the quality evaluators `memo-evidence`, `memo-balance`, `memo-coherence`, `memo-references`
- the grading skills `grade-score-single` / `grade-score-batch`
- `git-security`
- the persona audit (`workbench-persona-audit`)

**Staying skills (the base layer they build on):**

- the `node-*` family (formatting, class architecture, validation, error codes, testing, environment manager, server design)
- `domain-dunesql`
- `repo-readme` and `repo-docs-writing`
- pointer skills (on-demand routers to vendored rules)

These stay skills because they are procedures meant to run inside the caller's context — they shape how the caller writes code or docs, and an isolated context would sever them from the work they govern.

---

## Out-of-Scope Register

Not every skill that exists in the system is governed by this process specification, and pretending otherwise would be dishonest. Two families of skills sit **deliberately outside** the process spec's scope and carry **no governing chapter** — they are acknowledged here, not mapped onto a forced home.

- **Coding-standard skills** — the `node-*` family (formatting, class architecture, validation, error codes, testing, environment manager, server design). The Node.js coding standard is the property of the project's own house rules — a `CLAUDE.md`-style runbook — not of this specification. This spec governs the memo **process**, not code style; mapping these skills onto a process chapter would claim a coverage that does not and should not exist.
- **Domain and external-tool skills** — blockchain-data query skills, the external API-CLI usage skill, and external-schema grading skills. Each encodes an **external domain** that is governed by its own external references (the data platform's query dialect, the API catalog's contract, the schema model's grading rules), not by this process spec. The process spec does not own those domains and makes no claim over them.

To make the position machine-checkable and honest rather than implicit, such skills declare in their frontmatter:

- `specs.primary: null` — an explicit, recorded statement that **no** chapter of this spec governs the skill, rather than an arbitrary mapping picked to satisfy a coverage tool, and
- a `scope` marker — one of `coding-standard`, `domain`, or `external` — that names **why** the skill is out of scope.

The `null` primary plus the `scope` marker is the honest signal: *acknowledged out-of-scope*, not *pretended coverage*. A coverage audit reads these markers and counts such skills as deliberately unmapped, never as gaps to be back-filled with a forced chapter reference.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [15-prompt-generator.md](./15-prompt-generator.md) — the deterministic compositor that produces an agent's per-invocation start-prompt.
- [13-orchestration.md](./13-orchestration.md) — the machinery (team roles, dials, state) that runs the agent types defined here, and the model-driven-fan-out vs Dynamic-Workflow distinction.
- [36-agent-strategies.md](./36-agent-strategies.md) — the agent deployment strategies that reference these types (Fan-Out by Unit); the distillate-fan-out research strategy mapped onto type (a)/(c) is in [10-proactive-research.md](./10-proactive-research.md).
- [12-rollout.md](./12-rollout.md) — the rollout whose Evaluate phase is run by the migrated evaluators.
- [09-contamination-context-handover.md](./09-contamination-context-handover.md) — the empty-context rule that makes evaluators the natural first migration.
- [00-overview.md](./00-overview.md) — conformance language.
