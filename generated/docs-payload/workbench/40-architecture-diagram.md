---
title: "Architecture Diagram"
description: "The diagram has two parts. The upper flow shows the **two-level model** (Workbench and Project) reached through the workbench-SOP and the thin SOP spec, with the machine tier drawn dashed because it..."
workbench_version: "0.1.0"
spec_file: "40-architecture-diagram.md"
order: 40
section: "Workbench"
normative: false
generated_at: "2026-06-25T18:46:44.485Z"
generated_from: "spec/workbench/0.1.0/40-architecture-diagram.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/40-architecture-diagram.md."
---


> **Informative.** This chapter collects the architecture diagrams that summarize the structures specified in the preceding chapters. They carry no requirements of their own.

The diagram has two parts. The upper flow shows the **two-level model** (Workbench and Project) reached through the workbench-SOP and the thin SOP spec, with the machine tier drawn dashed because it is out of scope for this spec. The lower group shows the **three sibling spec families** that live side by side in `repos/spec`, each with its own version line.

```mermaid
flowchart TD
    Start["Fresh start / empty context"] --> WBsop["Workbench-SOP loaded<br/>(smallest entry point)"]
    WBsop --> SOPspec{"SOP spec (thin connecting layer):<br/>what is in a SOP, where to find it"}
    SOPspec --> Std["Common denominator:<br/>Setup · Health · Update · Extras"]
    Std -->|"Workbench level"| WB["Workbench<br/>(no project work)"]
    Std -->|"Project level"| Proj["Project<br/>(project-specific work)"]
    WB -.->|"declares policy (.workbench config)"| Mach["Machine tier<br/>(out of scope, future spec):<br/>hooks enforce"]
    Proj --> Plan["Plan / execute via the memo-SOP"]

    subgraph SPECS["repos/spec — three sibling spec families"]
        direction TB
        MI["memo-init spec<br/>spec/v0.1.0/"]
        WBS["Workbench spec<br/>spec/workbench/0.1.0/<br/>Introduction · Folders · CLI"]
        SOPF["SOP spec (thin)<br/>spec/sop/0.1.0/<br/>connects the SOPs"]
        MI -.->|"same level — refs.manual.json sibling keys"| WBS
        WBS -.-> SOPF
    end
```

The upper flow reads top-down: a fresh context loads the workbench-SOP, which uses the SOP spec to read any SOP predictably, which resolves to the common denominator, which routes to one of the two levels. The workbench level *declares* policy; the dashed machine tier (a future spec) *enforces* it. The lower group is structural: three peers in one repository, the memo-init spec and the Workbench spec at the same level via sibling keys in `refs.manual.json`, with the thin SOP spec connecting them.

---

## Registered Folders, Conventions, and Add-Ons

The registered folders are the shared vocabulary; conventions are the formats their content follows; add-ons are tools that reserve an area and use conventions; and the wiki sits one level above as the search engine across all of them ([12-folders.md](/specification/folders/), [26-addons.md](/specification/addons/)).

```mermaid
flowchart TD
    WIKI["Wiki — search engine across the whole workbench"]
    REG["Registered Folders (hub: 12-folders)"] --> F1["context/architecture-okf<br/>Convention: OKF"]
    REG --> F2["design/<br/>Convention: DESIGN.md"]
    REG --> F3["scripts/<br/>Convention: startup-script"]
    ADDON["Add-Ons = tools<br/>FlowMCP · ytAi · get-sheet · memo system"] -.->|"reserve an area, use conventions"| REG
    WIKI --> REG
    F1 --> WIKI
    F2 --> WIKI
    F3 --> WIKI
```

A Convention is the format inside a folder; an Add-On is a tool. The wiki indexes the separated domains so a reader finds material without first knowing which folder holds it.

---

## The Validation Boundary — Before and After

Validation sits at the public entry points, the surface through which input enters. A pre-hook checks pre-conditions **before** the call; the runtime call-validation measures, **after**, what actually ran ([23-hooks-contract.md](/specification/hooks-contract/), [20-cli.md](/specification/cli/), [24-skills-scope.md](/specification/skills-scope/)).

```mermaid
flowchart TD
    CALL["AI calls an entry point<br/>(public method: memo-init / finalize / plan)"]
    PRE["Pre-hook — matcher Skill — BEFORE<br/>gatekeeper: pre-conditions met? exit 2 / JSON deny"]
    CALL --> PRE
    PRE -->|"yes"| RUN["Entry point + sub-agents run<br/>transcript written to disk"]
    PRE -->|"no"| BLOCK["deny / ask"]
    RUN --> LOG[("subagents/agent-id.jsonl + uuid.jsonl")]
    LOG --> SCAN["Runtime call-validation — AFTER"]
```

Contamination enters through the public methods, so that is where the validation layer lives — a pre-hook in front, the transcript-based measurement behind.

---

## Session Validation — Memo Collects, Workbench Builds

The "after" measurement is split across the two systems: the memo collects the session IDs and interprets the result; the workbench holds the registry, searches the transcripts for the signals, and returns the matrix ([20-cli.md](/specification/cli/)).

```mermaid
flowchart TD
    MEMO1["Memo agent: collects session IDs<br/>knows its spawned sub-agents"] --> IDS["session IDs"]
    IDS --> WCLI["Workbench CLI"]
    REGISTRY[(".workbench/registry.json<br/>SOPs / skills / add-ons + signals")] --> WCLI
    WCLI --> SCAN2["scans transcripts for signals"]
    SCAN2 --> MATRIX["structured matrix back:<br/>session × skill/tool → used + evidence"]
    MATRIX --> MEMO2["Memo agent: interprets<br/>checks requirements, e.g. init only if the SOP was read"]
```

The memo knows *which* sessions exist and what their use *means*; the workbench knows *what* to search for. The matrix is the structured hand-off between the two.

---

## The Signpost Cascade and Orchestrator/Component

The workbench-SOP is a signpost that references the add-on SOPs; each skill is either an orchestrator (a public entry point) or a component (a private, reusable part) ([02-sop-entrypoint.md](/specification/sop-entrypoint/), [24-skills-scope.md](/specification/skills-scope/)).

```mermaid
flowchart TD
    CLAUDE["CLAUDE.md — dynamic signpost, per session"] --> WSOP["Workbench-SOP — references the add-on SOPs"]
    WSOP --> MSOP["memo-SOP (weightiest add-on)"]
    WSOP --> FSOP["flowmcp-SOP"]
    MSOP --> ORCH["Orchestrator = public method / entry point<br/>validated (pre-hook + runtime)"]
    ORCH --> COMP["Component = private, reusable, not user-callable<br/>e.g. research at several points"]
```

The signpost routes downward without becoming a container; the orchestrator is the validated public surface, the component the private interior it calls.

---

## Related

- [00-overview.md](/specification/overview/) — the sibling-spec framing the lower group depicts.
- [02-sop-entrypoint.md](/specification/sop-entrypoint/) — the two-level model, the SOP signpost, and the machine-tier exclusion.
- [12-folders.md](/specification/folders/) — the registered folders, conventions, and the core-vs-add-on split.
- [26-addons.md](/specification/addons/) — the add-on model the third diagram depicts.
- [23-hooks-contract.md](/specification/hooks-contract/) — the pre-hook half of the validation boundary.
- [20-cli.md](/specification/cli/) — the runtime call-validation and the Memo↔Workbench split.
- [24-skills-scope.md](/specification/skills-scope/) — the orchestrator/component split.
- [The SOP spec](/sop/overview/) — the thin connecting layer in the diagram.
