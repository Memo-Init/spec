---
title: "Agent and Research Strategies"
description: "This chapter collects the **strategies** for deploying agents and research effectively — the reusable patterns that decide *how* work is fanned out and *how* expensive findings are reused. It is..."
spec_version: "0.1.0"
spec_file: "36-agent-research-strategies.md"
order: 36
section: "Specification"
normative: true
generated_at: "2026-06-20T18:35:05.282Z"
generated_from: "spec/v0.1.0/36-agent-research-strategies.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/36-agent-research-strategies.md."
---


This chapter collects the **strategies** for deploying agents and research effectively — the reusable patterns that decide *how* work is fanned out and *how* expensive findings are reused. It is deliberately the pattern layer, not the machinery: the orchestration mechanics (Generate → Execute → Evaluate, agent teams, parallelism dials, state and recovery) live in [13-orchestration.md](/specification/orchestration/), the research lifecycle (when to research, sub-agent spawning, where large output goes) lives in [10-proactive-research.md](/specification/proactive-research/), and the skill-versus-agent distinction lives in [14-agents-skills-tasks.md](/specification/agents-skills-tasks/). Here we name the patterns that sit above all three, so a strategy can be chosen by name rather than re-derived each time.

## Distillate-Fan-Out

The headline strategy. Deep research is **expensive to run and cheap to reuse**, so it should be run **once** and then **distilled** into a compact, structured artifact that many cheaper sub-agents are seeded from — instead of paying for the same broad research inside every sub-agent.

1. **Research once, deeply.** A single expensive pass (broad web/codebase sweep, many sources) produces the raw findings. Large raw output goes to the memo's `context/` ([10-proactive-research.md](/specification/proactive-research/)), never inline.
2. **Distill.** The raw findings are reduced to a **distillate** — a compact, reusable artifact that carries only what the downstream work needs. The distillate is frequently a **structured dataset** (the data payload of [35-memo-authoring.md](/specification/memo-authoring/)): one record per unit of work.
3. **Fan out cheaply.** Each record of the distillate **seeds one sub-agent** with a small, self-contained brief. The sub-agents run in parallel under the orchestration machinery ([13-orchestration.md](/specification/orchestration/)); none repeats the expensive research, because the distillate already carries it.

The payoff is that the costly part happens once and the parallel part is cheap and uniform. The same dataset that renders a generated table ([35-memo-authoring.md](/specification/memo-authoring/)) is the fan-out seed — the table is for the human reader, the records are for the sub-agents. The goal-optimization pipeline is an instance of this shape: a goal's accumulated findings are distilled into an init-transcript that seeds a follow-up memo (see [31-goals.md](/specification/goals/)).

**Mapped onto the agent-execution primitives ([14-agents-skills-tasks.md](/specification/agents-skills-tasks/)):** the one expensive research pass (step 1) runs as a single ephemeral sub-agent (type a) or a deterministic workflow (type c); the cheap fan-out (step 3) uses **type (a)** ephemeral sub-agents when there are a few records, and is the **canonical use of type (c)** — a deterministic workflow — when the records number in the dozens or hundreds (its high agent cap and script-repeatability are built for exactly that). Persistent agents (type b) are **not** the default here: the strategy depends on the fan-out workers being stateless and uniform, where type (b) fits iterative single-worker dialogue instead. This is a strategy choosing a type, not a new type.

## Fan-Out by Unit

When work decomposes into independent units — one repo, one file, one chapter, one goal — the strategy is **one agent per unit**, run in parallel, each agent scoped to exactly its unit. This keeps each context small and the work embarrassingly parallel, and it makes a missing or failed unit visible as a single gap rather than a silent omission. The degree of parallelism is a dial set by the orchestrator ([13-orchestration.md](/specification/orchestration/)); the strategy here is only the decomposition: pick a unit boundary along which the work is genuinely independent, and assign one agent to each.

## Fresh-Context Evaluation

Measurement and grading are **never** done by the session that did the work — a working session reports "all done" and hides the gap. The strategy is to evaluate in a **fresh context**: a separate, unbiased reader that inspects the real artifacts rather than trusting a PASS-report. This is the operating principle behind goal scoring and maintenance scoring ([31-goals.md](/specification/goals/)); as a general agent strategy it applies wherever a result must be judged honestly — spawn a clean reader, hand it the artifacts and the intent, and let it measure against reality. The contamination boundary that makes a context "fresh" is defined in [09-contamination-context-handover.md](/specification/contamination-context-handover/).

## Related

- [13-orchestration.md](/specification/orchestration/) — the orchestration machinery these strategies run on (the boundary: machinery there, patterns here).
- [10-proactive-research.md](/specification/proactive-research/) — the research lifecycle and where large research output is stored.
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the skill-versus-agent distinction underneath these strategies.
- [35-memo-authoring.md](/specification/memo-authoring/) — the data payload that doubles as the fan-out seed.
- [31-goals.md](/specification/goals/) — fresh-context scoring, an instance of fresh-context evaluation.
