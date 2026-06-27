---
title: "Agent Strategies"
description: "This chapter collects the **strategies** for deploying agents effectively — the reusable patterns that decide *how* work is fanned out across sub-agents. It is deliberately the pattern layer, not the..."
spec_version: "0.1.0"
spec_file: "36-agent-strategies.md"
order: 36
section: "Specification"
normative: true
generated_at: "2026-06-27T22:03:57.339Z"
generated_from: "spec/v0.1.0/36-agent-strategies.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/36-agent-strategies.md."
---


This chapter collects the **strategies** for deploying agents effectively — the reusable patterns that decide *how* work is fanned out across sub-agents. It is deliberately the pattern layer, not the machinery: the orchestration mechanics (Generate → Execute → Evaluate, agent teams, parallelism dials, state and recovery) live in [13-orchestration.md](/specification/orchestration/), and the skill-versus-agent distinction and the three agent forms live in [14-agents-skills-tasks.md](/specification/agents-skills-tasks/). The research-reuse strategy that seeds a fan-out — **Distillate-Fan-Out** — sits with the research lifecycle in [10-proactive-research.md](/specification/proactive-research/); the agent-deployment patterns below build on it. Here we name the patterns that sit above the machinery, so a strategy can be chosen by name rather than re-derived each time.

## Fan-Out by Unit

When work decomposes into independent units — one repo, one file, one chapter, one goal — the strategy is **one agent per unit**, run in parallel, each agent scoped to exactly its unit. This keeps each context small and the work embarrassingly parallel, and it makes a missing or failed unit visible as a single gap rather than a silent omission. The degree of parallelism is a dial set by the orchestrator ([13-orchestration.md](/specification/orchestration/)); the strategy here is only the decomposition: pick a unit boundary along which the work is genuinely independent, and assign one agent to each. This is the agent-deployment counterpart of the research-side **Distillate-Fan-Out** ([10-proactive-research.md](/specification/proactive-research/)) — where that strategy seeds the workers cheaply from one expensive pass, this one fixes the boundary along which they are split.

## Fresh-Context Evaluation

Measurement and grading are **never** done by the session that did the work — a working session reports "all done" and hides the gap. The strategy is to evaluate in a **fresh context**: a separate, unbiased reader that inspects the real artifacts rather than trusting a PASS-report. This is the operating principle behind goal scoring and maintenance scoring ([31-goals.md](/specification/goals/)); as a general agent strategy it applies wherever a result must be judged honestly — spawn a clean reader, hand it the artifacts and the intent, and let it measure against reality. The contamination boundary that makes a context "fresh" is defined in [09-contamination-context-handover.md](/specification/contamination-context-handover/).

## Related

- [13-orchestration.md](/specification/orchestration/) — the orchestration machinery these strategies run on (the boundary: machinery there, patterns here).
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the three agent forms and the skill-versus-agent distinction underneath these strategies.
- [10-proactive-research.md](/specification/proactive-research/) — the research lifecycle and the Distillate-Fan-Out strategy that seeds an agent fan-out.
- [31-goals.md](/specification/goals/) — fresh-context scoring, an instance of fresh-context evaluation.
- [35-memo-authoring.md](/specification/memo-authoring/) — the data payload that doubles as the fan-out seed.
