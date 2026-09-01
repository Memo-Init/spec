# 48. Research Waves and Root-Cause Depth

| Field | Value |
|---|---|
| Status | Draft |
| Depends on | [./10-proactive-research.md](./10-proactive-research.md) |
| Related | [./04-input-pipeline.md](./04-input-pipeline.md), [./13-orchestration.md](./13-orchestration.md), [./28-drift.md](./28-drift.md), [./29-behavioral-guardrails.md](./29-behavioral-guardrails.md), [./35-memo-authoring.md](./35-memo-authoring.md), [./36-agent-strategies.md](./36-agent-strategies.md) |

The research discipline already says **when** to research and **where** to file the result ([10-proactive-research.md](./10-proactive-research.md)) and **how** to deploy the agents that carry it ([36-agent-strategies.md](./36-agent-strategies.md)). What no chapter has ever said is **how a single search run is structured** — how far it reaches, how it knows it is finished, and how it goes from a symptom to a root cause. That gap is not academic. The word the author uses for a bounded search run — a *Welle*, a **wave** — appears nowhere in the specification as a normative step; its only occurrence in the whole system is a forensic heuristic in `memo-handover` that reads file timestamps to guess whether earlier work came in waves. The existing stop criteria in `memo-research-agent` ask "is this enough?" — they never ask "what have I *not* seen?". And root-cause thinking exists only qualitatively — as the connected-system guardrail ([29-behavioral-guardrails.md](./29-behavioral-guardrails.md)) and the drift chapter's case against a symptom fix ([28-drift.md](./28-drift.md)) — with no default depth, no iteration loop, and no limit on overreaching. This chapter fills that gap. It governs the *method* of a search: the wave as the unit of a bounded run, the blindspot self-question that decides whether another wave is needed, the root-cause depth rule that turns a symptom into a cause, and the delegation discipline that keeps a wave reliable and keeps the orchestrator lean.

The chapter is the search-method counterpart to [36-agent-strategies.md](./36-agent-strategies.md): where that chapter fixes how agents are *deployed*, this one fixes how a *search* is shaped. It adds no new lifecycle and weakens no existing gate — the research gates of [10-proactive-research.md](./10-proactive-research.md) continue to hold inside every wave. It only makes explicit, and normative, the search pattern the author has been describing but which the written specification never captured.

---

## The Wave

A **wave** (the author's term is *Welle*) is a **bounded, declared search run**. Before it starts it names three things: the **scope** it searches (the area or the artifact set), the **search goal** (the defect class or the knowledge target), and an optional **quantity or budget** — "up to fifty defects on the site" is a legitimate wave target. The declaration is what separates a wave from an open-ended trawl: an undeclared, unbounded search is not a wave, because nothing tells it where it ends or what it was looking for.

Inside the wave the reach is downward, not just outward. For **each find**, the run goes **deeper — two to three steps by default — until a root cause is named**. A symptom on its own is not a closed find; a find that stops at the symptom is recorded as incomplete, because the thing that has to be fixed is the cause, not its surface. The causes a wave turns up are then **recorded clustered**: one cause cluster bundles every symptom that shares the same root, and the cluster — not the individual symptom — is the unit that is fixed against. Clustering is what stops the same root cause from being re-discovered, re-ticketed, and re-patched from three different symptoms; it is the search-side expression of the connected-system guardrail.

---

## The Blindspot Loop

A single wave answers the question it was scoped to and no more, so a wave is never trusted to be the whole picture on its own. **After every wave the blindspot self-question is answered explicitly and recorded:** *"Have I understood the problem holistically, or is there an area I have not looked at?"* — a yes or a no, and when it is a no, the **named blindspot areas** that still need searching. This is the exact question the existing stop criteria miss. "Is this enough?" measures the wave against the question it already asked; the blindspot question measures it against the questions it did *not* ask, which is where the unseen defect hides.

When the answer is a blindspot, the response is a **follow-up wave scoped to that named area** — never an undifferentiated "search everything again". A repeat of the whole prior search is not a wave; it is the absence of a scope. The follow-up inherits the same discipline: it declares its area, it goes to causes, it clusters, and it answers the blindspot question again in turn.

Whether the AI may run that follow-up on its own is a matter of **declared budget**. Within a stated wave budget — for example a maximum of two follow-up waves — the AI **starts follow-up waves autonomously and then reports**; beyond the declared budget or scope, continuation is **raised as a question to the user** rather than taken silently. The budget is declared up front, so autonomy is bounded by a number the user can see, not by a judgement call made mid-run. (This is the author's decision F8: autonomous follow-up inside a declared budget, then report.)

---

## Root-Cause Depth

The depth rule is the wave's principle applied to a single defect, made quantitative. On any defect the investigation **probes, by default, one to two layers deeper than the first-suspected cause**, and then **decides iteratively** whether further depth is warranted — the aim is to understand the problem at a general level, not to stop at the first plausible explanation. The first explanation is a hypothesis; the rule is to look under it once or twice before believing it.

The anti-pattern this exists to kill is **patch-over-patch**: the drift chapter records the real case where the same symptom was re-patched across three memos instead of the root being fixed, and each patch made the next one worse. So a fix that addresses **only the symptom** is **declared as a symptom fix** and **captures the open root cause as a snag or work item** — an undeclared symptom fix is a violation, because, as [28-drift.md](./28-drift.md) puts it, a symptom fix is *negative*: it hides the true signal.

Depth, though, can be overdone, and the author names the danger directly — starting to change a lot, fast, is itself dangerous. So the rule carries its own limit. **Depth search stops when** (i) the cause is **named with evidence**, (ii) the deeper layers lie **outside the system under change** — the harness, the OS, a third-party library — or (iii) the **blast radius** of the change would **exceed the memo's scope**. When a stop condition is hit, the finding is **documented** (as a snag or work item) rather than acted on with a broad, immediate change. The depth rule and its limit are one rule: go deeper than the surface, but not deeper than the evidence, the system boundary, or the scope allow.

---

## Provenance and the Existing Gates

A wave is only useful later if the sequence of waves can be reconstructed, so **every wave is recorded with its wave number or id, its scope, its find count, and its blindspot answer** — in the research document, or in the memo database once that exists ([04-input-pipeline.md](./04-input-pipeline.md) already requires a cumulative research knowledge base per memo, which is where wave provenance docks). The record is what lets a reader see that wave 2 was a blindspot follow-up to wave 1, and what a research id refers to.

A wave introduces no exemptions. It **runs under the existing research gates** of [10-proactive-research.md](./10-proactive-research.md) and does not weaken any of them: the five-level sub-agent depth cap (REQ-855), NO-OVERWRITE deterministic naming (REQ-853), source-plus-evidence per find (REQ-852), and one consolidated document per run (REQ-854) all continue to hold inside a wave exactly as they hold outside one. The wave is a new pattern layered on top of the research gates, not a new mode that escapes them.

---

## Execution — Dynamic Workflows and Research Types

A wave is a **research-only dynamic workflow**: an orchestrator that fans out to, by default, two to four parallel sub-agents ([13-orchestration.md](./13-orchestration.md)), each with an empty context, each filing its own document. The orchestrator stays **lean** — raw material goes into the **worker contexts and `context/`**, never inline into the orchestrator's own context, so the orchestrator is not slowly poisoned by the very material it is coordinating. This is the standard carrier for a wave; running the search any other way is the exception, not the rule.

The workflow declares **which of three research types** it is, because the three want different shapes:

- **Wave research** (*Wellen-Research*) — a bounded run across a scope looking for a class of finds, followed by the blindspot loop above. This is the default carrier of the whole "wave → depth → cluster → blindspot → follow-up" cycle.
- **Depth research** (*Tiefen-Research*) — a narrow, deep dig into a single cause chain, driven by the root-cause depth rule until a cause is named or a stop limit is hit.
- **Short forensic** (*Kurz-Forensik*) — a quick, tightly-scoped check to confirm or deny one specific hypothesis, without a full wave's fan-out.

Naming the type up front sets the reader's expectation and the sub-agent shape; it is a small declaration with a real effect on how the run is read and reproduced.

---

## Reliable Delegation

Delegation is only a saving if the delegated result actually comes back, and the honest failure that motivates this section is a real one: a sub-agent that **died on an API error *after* it had already written its file** — the file held the full substance, but the orchestrator, seeing the agent fail, would have thrown that substance away and re-run the whole search. Two rules close that gap.

First, delivery is a **file plus a thin acknowledgement**, and the orchestrator **checks the file is non-stub before accepting it**. A sub-agent delivers its result as a **file** at the agreed path — the substance — and returns only a **thin, structured acknowledgement** — a pointer, not the payload. The orchestrator then verifies the file is real (has genuine substance, not an empty or placeholder shell) before treating the result as done. Presence of an acknowledgement is not proof of a result; the file is the result, and the file is what gets checked.

Second, recovery **reads the disk before it re-spawns**. When an acknowledgement is missing or a stub, or the sub-agent failed outright, the orchestrator **first recovers the on-disk file** — which may already hold the complete answer, exactly as in the case above — and **only re-spawns when the file is genuinely missing or incomplete**. Auto-retry that skips the disk check pays twice for work that was already done once and, worse, discards a correct result because its carrier crashed on the way home.

Underneath both rules is a **hard** constraint on where research runs at all: **research is delegated to sub-agents and is never run in the orchestrator's own main terminal.** Running a search inline in the orchestrator is the root of main-terminal context drift — the orchestrator fills with raw material and loses the thread — and it is forbidden, not merely discouraged. The lean orchestrator of the execution section and the non-stub gate here are two halves of the same discipline: the orchestrator coordinates and checks; it does not itself do the searching.

---

## Conformity Requirements

The method above is authored **prose-first** ([35-memo-authoring.md](./35-memo-authoring.md)): each `statement` shapes how a wave is run, and each `check` feeds the finalization gate as a ternary `PASS` / `BLOCKED` / `INCONCLUSIVE` result ([23-requirements.md](./23-requirements.md)). The blocks scope to the `research` work category. The measured spectra (root-cause depth) earn an object `grade`; the structural and behavioral rules stay `binary`.

A wave is a wave only once it is bounded, so the declaration is a hard gate:

```requirement
{
  "id": "REQ-1000",
  "title": "A research wave is declared before it begins",
  "statement": "A research wave MUST be declared before it begins as a bounded search run, naming its scope (the area or artifact set to search), its search goal (the defect class or knowledge target), and an optional quantity or budget target (for example 'up to fifty defects on the site'). An undeclared, open-ended trawl is not a wave.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The wave records a scope naming the area or artifact set searched",
      "The wave records a search goal — the defect class or knowledge target",
      "Any quantity or budget target is recorded, or its absence is explicit"
    ]
  },
  "grade": "binary"
}
```

A find is closed only when it reaches a cause, so per-find depth is a blocker:

```requirement
{
  "id": "REQ-1001",
  "title": "Each find is driven to a named root cause",
  "statement": "For each find, a wave MUST go deeper — by default two to three steps — until a root cause is named; the symptom alone is not a closed find, and a find recorded without an identified cause is marked incomplete rather than closed.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves", "root-cause"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each find records an identified root cause, not only the observed symptom",
      "A find left at the symptom level is marked incomplete, not closed"
    ]
  },
  "grade": "binary"
}
```

The unit of a fix is the cause cluster, not the symptom, so clustering is a blocker:

```requirement
{
  "id": "REQ-1002",
  "title": "Causes are recorded clustered by shared root",
  "statement": "Found causes MUST be recorded clustered: one cause cluster bundles every symptom that shares the same root, and the cluster — not the individual symptom — is the unit that is fixed against, so a single root cause is not re-discovered and re-patched from several symptoms.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves", "root-cause"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Causes are grouped into clusters, each cluster bundling the symptoms of one shared root",
      "The declared fix target is the cluster, not each symptom individually"
    ]
  },
  "grade": "binary"
}
```

The blindspot self-question is what turns one wave into a complete search, so it is a hard, recorded step:

```requirement
{
  "id": "REQ-1003",
  "title": "Every wave answers the blindspot self-question",
  "statement": "After every wave, the blindspot self-question MUST be answered explicitly and recorded — 'Have I understood the problem holistically, or is there an area I have not looked at?' — with a yes or no and, when no, the named blindspot areas that still need searching. Asking only 'is this enough?' does not satisfy it; the question is specifically 'what have I not yet seen?'.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves", "blindspot"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each wave records an explicit yes/no answer to the blindspot self-question",
      "A 'no' answer names the specific blindspot areas still to be searched"
    ]
  },
  "grade": "binary"
}
```

A follow-up wave without a target is just a repeated search, so the targeting is a blocker:

```requirement
{
  "id": "REQ-1004",
  "title": "A follow-up wave is scoped to a named blindspot",
  "statement": "A follow-up wave MUST be scoped to a blindspot area named by the preceding wave's self-question; an undifferentiated repeat of the whole search is not a wave.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves", "blindspot"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A follow-up wave names the blindspot area it targets",
      "The follow-up is scoped to that area rather than re-running the entire prior search"
    ]
  },
  "grade": "binary"
}
```

Autonomy is bounded by a declared number, so continuation authority is a behavioral rule (F8):

```requirement
{
  "id": "REQ-1005",
  "title": "Follow-up waves continue autonomously only within a declared budget",
  "statement": "Within a declared wave budget (for example a maximum of two follow-up waves), the AI MAY start follow-up waves autonomously and then report; beyond the declared budget or scope, continuation MUST be raised as a question to the user rather than taken silently. The budget is declared up front.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves", "autonomy"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The wave budget is declared up front",
      "Follow-up waves started autonomously stay within the declared budget",
      "Continuation beyond the budget or scope is raised as a user question, not taken silently"
    ]
  },
  "grade": "binary"
}
```

Depth is a measured judgement, so the root-cause depth rule is graded by a fresh-context evaluator:

```requirement
{
  "id": "REQ-1006",
  "title": "Investigation probes one to two layers below the first-suspected cause",
  "statement": "On any defect, the investigation MUST by default probe one to two layers deeper than the first-suspected cause, then decide iteratively whether further depth is warranted — understanding the problem at a general level rather than stopping at the first plausible explanation.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["root-cause", "depth"] },
  "severity": "blocker",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer reads the defect investigation and judges its depth. PASS when the investigation went at least one to two layers below the first-suspected cause AND recorded an explicit decision to iterate deeper or stop; BLOCKED when it stopped at the first plausible cause without going deeper; INCONCLUSIVE when the investigation depth was not recorded.",
    "verify": [
      "Read the recorded investigation for the defect",
      "Judge whether it went one to two layers below the first-suspected cause",
      "Confirm an explicit decision to iterate deeper or to stop"
    ]
  },
  "grade": { "dimension": "root-cause depth", "weight": 100 }
}
```

A symptom fix that hides its own incompleteness is the patch-over-patch trap, so declaring it is a blocker:

```requirement
{
  "id": "REQ-1007",
  "title": "A symptom-only fix is declared and its root cause captured",
  "statement": "A fix that addresses only the symptom MUST be declared as a symptom fix and MUST capture the open root cause as a snag or work item; an undeclared symptom fix is a violation, because a symptom fix hides the true signal (see [28-drift.md](./28-drift.md), 'Why a Symptom-Fix Is Negative').",
  "scope": { "repos": [], "categories": ["research"], "tags": ["root-cause", "drift"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A symptom-only fix is explicitly labelled as such",
      "The open root cause is captured as a snag or work item rather than left unrecorded"
    ]
  },
  "grade": "binary"
}
```

Depth must not become overreach, so the stop limit is its own rule:

```requirement
{
  "id": "REQ-1008",
  "title": "Depth search stops at the evidence, the system boundary, or the scope",
  "statement": "Depth search SHOULD stop when (i) the cause is named with evidence, (ii) the deeper layers lie outside the system under change (the harness, the OS, a third-party library), or (iii) the blast radius of the change would exceed the memo's scope — in which case the finding is documented rather than acted on with a broad, immediate change.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["root-cause", "depth", "blast-radius"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "When depth search stops, the stop matches one of the three limits — cause proven, out-of-system, or blast radius beyond scope",
      "A finding that hits a stop limit is documented rather than turned into a broad, immediate change"
    ]
  },
  "grade": "binary"
}
```

A wave grants no exemptions, so continuity with the existing gates is a blocker:

```requirement
{
  "id": "REQ-1009",
  "title": "A wave runs under the existing research gates",
  "statement": "A wave runs under the existing research gates and does not weaken them: the five-level depth cap (REQ-855), NO-OVERWRITE deterministic naming (REQ-853), source-plus-evidence per find (REQ-852), and one consolidated document per run (REQ-854) all continue to hold within a wave.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves", "gates"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A wave respects the five-level sub-agent depth cap",
      "A wave's output follows NO-OVERWRITE deterministic naming",
      "Each find in a wave carries a source and an evidence level",
      "A multi-level wave produces one consolidated document"
    ]
  },
  "grade": "binary"
}
```

The sequence of waves must be reconstructable, so wave provenance is a blocker:

```requirement
{
  "id": "REQ-1010",
  "title": "Every wave records its provenance",
  "statement": "Every wave MUST be recorded with its wave number or id, its scope, its find count, and its blindspot answer — in the research document (or the memo database, once available) — so the sequence of waves is reconstructable.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves", "provenance"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each wave records a wave number or id, its scope, its find count, and its blindspot answer",
      "The recorded waves reconstruct the order in which they ran"
    ]
  },
  "grade": "binary"
}
```

The dynamic workflow is the standard carrier and the research type is declared, so the execution form is a rule:

```requirement
{
  "id": "REQ-1011",
  "title": "A wave runs as a research-only dynamic workflow of a declared type",
  "statement": "A wave SHOULD run as a research-only dynamic workflow (an orchestrator with, by default, two to four parallel sub-agents, per [13-orchestration.md](./13-orchestration.md)) and MUST declare which research type it is — a wave (Welle), a depth run, or a short forensic; the orchestrator stays lean, and raw material goes into the worker contexts and `context/`, never inline into the orchestrator.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves", "dynamic-workflows"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The wave declares its research type: wave, depth run, or short forensic",
      "The wave runs as a research-only dynamic workflow with parallel sub-agents",
      "Raw material is filed into worker contexts and `context/`, not carried inline in the orchestrator"
    ]
  },
  "grade": "binary"
}
```

Running research in the main terminal is the root of context drift, so orchestrator sparing is a hard gate:

```requirement
{
  "id": "REQ-1012",
  "title": "Research is delegated, never run in the orchestrator's main terminal",
  "statement": "Research MUST be delegated to sub-agents and MUST NOT be run in the orchestrator's own (main) terminal — running research inline in the orchestrator is the root of main-terminal context drift and is forbidden.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves", "orchestrator", "dynamic-workflows"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Research work is carried out by delegated sub-agents",
      "No research is executed inline in the orchestrator's main terminal"
    ]
  },
  "grade": "binary"
}
```

A delivered result is the file, not the acknowledgement, so the non-stub gate is a blocker:

```requirement
{
  "id": "REQ-1013",
  "title": "A sub-agent delivers a non-stub file, and the orchestrator verifies it",
  "statement": "A research sub-agent MUST deliver its result as a FILE at the agreed path plus a thin, structured acknowledgement, and the orchestrator MUST verify the delivered file is non-stub (real substance, not an empty or placeholder shell) before accepting the result.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves", "delegation", "non-stub"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each sub-agent writes its result to a file and returns a thin structured acknowledgement",
      "The orchestrator checks the file is non-stub before accepting it",
      "A stub or empty result is rejected rather than accepted"
    ]
  },
  "grade": "binary"
}
```

A crashed carrier must not discard a written result, so auto-retry reads the disk first:

```requirement
{
  "id": "REQ-1014",
  "title": "Auto-retry recovers the on-disk file before re-spawning",
  "statement": "When a sub-agent's acknowledgement is missing or a stub, or the sub-agent failed, the orchestrator MUST first recover the on-disk file — which may already hold the full substance, since a sub-agent can die after its file write (the real case: the T058 agent died on an API error after writing its file) — and only re-spawn the sub-agent when the file is genuinely missing or incomplete.",
  "scope": { "repos": [], "categories": ["research"], "tags": ["research-waves", "delegation", "auto-retry"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "On a missing or stub acknowledgement or a sub-agent failure, the orchestrator first checks the agreed output path for an already-written file",
      "A recovered non-stub file is used instead of re-spawning",
      "Re-spawn happens only when the file is missing or incomplete"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./10-proactive-research.md](./10-proactive-research.md) — the research lifecycle and the gates (REQ-851…858) a wave runs under; this chapter adds the search *method* on top of them.
- [./04-input-pipeline.md](./04-input-pipeline.md) — the cumulative research knowledge base per memo, where wave provenance docks.
- [./13-orchestration.md](./13-orchestration.md) — dynamic workflows and the research-only, two-to-four-parallel default a wave runs as.
- [./28-drift.md](./28-drift.md) — 'Why a Symptom-Fix Is Negative' and the source-fix protocol the depth rule enforces.
- [./29-behavioral-guardrails.md](./29-behavioral-guardrails.md) — the connected-system guardrail that cause clustering expresses on the search side.
- [./35-memo-authoring.md](./35-memo-authoring.md) — the prose-first guard these requirement blocks are authored under.
- [./36-agent-strategies.md](./36-agent-strategies.md) — the agent-deployment counterpart; this chapter is the search-method side of the same fan-out.
</content>
</invoke>
