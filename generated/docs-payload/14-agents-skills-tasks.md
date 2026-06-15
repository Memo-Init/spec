---
title: "Agents, Skills and Tasks"
description: "The system is moving toward **Agents as a base layer** on which skills build. This is not an abolition of skills: skills remain, and they remain the foundation for most procedures. Only the..."
spec_version: "0.1.0"
spec_file: "14-agents-skills-tasks.md"
order: 14
section: "Specification"
normative: true
generated_at: "2026-06-15T19:20:20.992Z"
generated_from: "spec/v0.1.0/14-agents-skills-tasks.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/14-agents-skills-tasks.md."
---


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

`AGENTS.md` holds the **standing rules** (who the agent is, how it behaves, its repo-scoped constraints). The generated **start-prompt** (see [15-prompt-generator.md](/specification/prompt-generator/)) is the **per-invocation order** — the specific task for this run, composed deterministically. The two are complementary: standing rules plus a per-invocation order.

---

## Migration Boundary

Evaluators are the natural first candidates for agent form because the empty-context rule already requires them to run in a fresh, isolated context (see [09-contamination-context-handover.md](/specification/contamination-context-handover/)) — they are agents in everything but form.

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

## Related

- [15-prompt-generator.md](/specification/prompt-generator/) — the deterministic compositor that produces an agent's per-invocation start-prompt.
- [12-rollout.md](/specification/rollout/) — the rollout whose Evaluate phase is run by the migrated evaluators.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — the empty-context rule that makes evaluators the natural first migration.
- [00-overview.md](/specification/overview/) — conformance language.
