---
title: "Sub-Agents and Attenuation"
description: "This chapter specifies how a role creates sub-agents and what they receive. The criterion that only a role creates sub-agents is stated in the roles chapter; how that right is enforced, and how the..."
governance_version: "0.1.0"
spec_file: "06-subagents.md"
order: 6
section: "Governance"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "governance/0.1.0/draft/spec/06-subagents.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: governance/0.1.0/draft/spec/06-subagents.md."
---


This chapter specifies how a role creates sub-agents and what they receive. The criterion that only a role creates sub-agents is stated in the roles chapter; how that right is enforced, and how the rights of a sub-agent are bounded by the rights of its creator, is the subject of this chapter.

---

## Scope

- Creating sub-agents is the exclusive right of roles; an agent without a role creates none, and the right is enforced rather than only recorded as data.
- Rights pass downwards only, and they shrink on the way: a sub-agent receives at most the rights of its creator, never more (attenuation).
- The carrier of the boundary travels with the sub-agent: a proof derived from the creator's session cannot carry the boundary, because every sub-agent session starts empty, so the boundary rides on the tool list that binds the permit.
- A sub-agent is subject to the same gates as the context that created it; no gate is weaker for a sub-agent than for the main context.

---

## Spawning Is a Role Right

Creating a sub-agent is the exclusive right of roles. A gate before every spawn **MUST** refuse a spawn from a context whose role carries no right to create sub-agents; the role of a sub-agent is read from the name the harness gave it, and the right per role is the one the role table records. The right is enforced, not only recorded as data. The top-level context carries the role of the session and may spawn. A spawn budget, where one is set, applies to every spawn alike.

---

## Attenuation

Rights pass downwards only, and they shrink on the way. The tool list of a child **MUST** be a subset of the tool list of its creator: a child never holds a tool its creator does not hold. A definition without a tool list, and a built-in agent type, holds every tool, and therefore fits only a creator that holds every tool. Where the creator's role or tool list cannot be determined, the gate **MUST** say so as its own outcome — a warning while the gate runs in warn mode, a refusal in block mode — and never read the gap as permission.

---

## The Carrier of the Boundary

The boundary **MUST** travel with the sub-agent, and it travels on the tool list of the sub-agent's definition: the harness enforces that list on the child. A proof derived from the creator's session cannot carry the boundary, because every sub-agent session starts empty; the session-wide record of what was read carries knowledge, not rights. Permits of the main context of the same session are visible to its sub-agents; permits of an intermediate creator are not inherited.

---

## Equal Gates

A sub-agent **MUST** be subject to the same gates as the context that created it. No gate is weaker for a sub-agent than for the main context: no gate selects a milder mode because a call comes from a sub-agent. Where a gate reads the identity of a sub-agent, that identity is the subject of the check, never the trigger of a milder decision.

---

## Checker and Checked

A check **MUST NOT** be booked under the label of what it checks. A worker and the evaluator that checks it share the same tool contract, but they carry different booking values — `worker` and `evaluator` — and therefore different labels. The harness name of a sub-agent is read into a label by its role prefix, so an evaluator's name never yields a worker label; an evaluator that states a worker label in a command is a contradiction of the holder check, not a match.

---

## No Upward Permission Theft

Intervention runs from the top down: a role may intervene in the work of a role of a lower group. No right flows upwards. A role of a lower group never acts with the rights of a higher one, never takes them over and never receives them, and a role does not intervene in the work of its own group or of a higher one. The bookkeeper stands alone: until its own cut says otherwise, no group intervenes in its work and it intervenes in none. A role whose group the role table does not decide neither intervenes nor is intervened in on the strength of this rule.

The machine form is `mayIntervene(actor, target)` of the role table in the reference implementation; the groups and their order are those of the role group tree in [./05-roles.md](/governance/roles/).

---

## Rescue in a Sandbox

The rescue of a stuck worker runs in a sandbox of its own. The orchestrator creates it, commissions it and receives its result; it does not enter it. A stuck worker is not rescued by a higher role taking its work over, because the problem context would then fill the context of the role that has to keep the whole run in view.

---

## Dynamic Runs Are Served From Outside

A dynamic run is served only from outside and hands back defined documents or data. A rescue is such a run: it receives its order from outside, and it does not open a free channel to the stuck worker at runtime.

---

## The Return Form

What comes back from the sandbox is a result or a document, never the problem context. The return is checkable by three fields:

| Field | What it carries |
|---|---|
| `result` | what the rescue achieved, or that it achieved nothing |
| `evidence` | the files and measurements the result rests on |
| `openPoints` | what stays open, named singly |

---

## The Construction Is an Open Question

Whether the existing base suffices for a rescue is not measured. Three properties decide it: a context of its own, a worktree of its own, and a defined return. The construction of the sandbox is chosen only after these three have been measured on the existing base.

---

## A Gate Whose Checker Fails Has Not Run

When the independent checker of a gate fails to deliver its report, the gate **MUST** be counted as not run. Running the check in the session that did the work replaces an independent review with a self-review, which the definition of the gate excludes. A role architecture whose return channel can fail silently cannot prove its own acceptance; the commissioning side therefore reads the report of the checker from disk and, when none is there, starts a new checker or reports the gate as open.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./05-roles.md](/governance/roles/) — the criterion that makes a role and the roles that may create sub-agents.
- [./03-permits.md](/governance/permits/) — the tool-list binding that carries the boundary.
- [./11-risk-surface.md](/governance/risk-surface/) — why the damage radius grows with the role, and why communication between agents is off at runtime by default.
