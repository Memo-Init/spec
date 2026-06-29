---
title: "Requirements"
description: "Today, requirements live only as prose scattered across the global rules file and individual skills. Prose requirements are unspecific and not reproducible: there is no machine-readable record of..."
spec_version: "0.1.0"
spec_file: "23-requirements.md"
order: 23
section: "Specification"
normative: true
generated_at: "2026-06-29T17:03:59.600Z"
generated_from: "spec/v0.1.0/23-requirements.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/23-requirements.md."
---


Today, requirements live only as prose scattered across the global rules file and individual skills. Prose requirements are unspecific and not reproducible: there is no machine-readable record of which formatting rules apply to a particular programming language, or which conventions a given repository must satisfy. Two memos touching the same language can apply the rules inconsistently because there is nothing authoritative to pull from. This chapter specifies requirements as a **declarative registry** — data, not prose — that drives both the generation of work and the gate that lets that work finalize.

A requirement is a single, addressable statement of something that must, should, or may hold for a piece of work. Because it is data, it can be pulled dynamically, scoped to the work at hand, diffed, and checked mechanically. The registry replaces the scattered prose with one authoritative source that every memo reads from at the moment it is needed, so a memo always sees the current requirements rather than a stale copy.

---

## The Two-Sided Model

Each requirement is **two-sided**. It carries both a human-readable `statement` of what is required and a machine-checkable `check` that decides whether the requirement is met. The two sides face in opposite directions:

- **`statement` → generation.** The requirement text feeds the prompt generator. It operates one level above the implementation: when work is being prompted, the in-scope requirement statements are surfaced as instructions, so the doer is told up front what is expected. The statement shapes the work before it is done.
- **`check` → gate.** The check drives a scope-matched finalization gate. Requirements that apply to the work in progress are collected, their checks run, and the work **MUST NOT** pass finalization while an applicable blocker check fails — unless an explicit, recorded override exists. The check verifies the work after it is done.

This is the eval-driven contract: a goal is declared as a requirement, that goal shapes generation, and once the goal is met its check becomes a standing regression gate. The same data both asks for the outcome and proves it.

```mermaid
flowchart LR
    REG["Requirements registry<br/>(one file per entry)"]
    REG -->|statement| GEN["Prompt generation<br/>(work is shaped)"]
    REG -->|check| GATE["Finalization gate<br/>(work is verified)"]
    GEN --> WORK["Work performed"]
    WORK --> GATE
    GATE -->|PASS| DONE["Finalized"]
    GATE -->|BLOCKED| FIX["Resolve or override"]
    FIX --> WORK
```

---

## The Grade Axis (optional)

Beside `statement` and `check`, a requirement **MAY** carry an optional third axis: a `grade`. Where the `check` answers a binary question — is the requirement met or not — the `grade` answers a *how well* question, contributing a weighted dimension to a continuous quality score. Validation is the `check` in action; it is not a separate object. Grading is an optional layer on top: the rule of thumb is that a hard yes/no rule needs only a `check`, while a quality spectrum earns a `grade`.

The slot is **always available and carries one of three honest states**, so an author must *decide* on it rather than silently leave it out:

| `grade` state | Meaning |
|---------------|---------|
| `{ dimension, weight }` | Real grading — the requirement contributes a named quality dimension, with a weight, to an aggregate score. |
| `binary` | Deliberately **no** score — a hard yes/no rule whose `check` is the whole story. |
| `todo` | A grade **belongs** here but is not yet written — a visible, harvestable work item, never a silent gap. |

The `todo` state is the point of the slot: a missing grade is made **visible** rather than swallowed, the same "empty means an honest not-yet" principle the registry applies elsewhere. `grade` is one more optional key on the open entry schema — additive, never a breaking change. When the object form is used, the dimensions and weights feed the aggregate quality model — its scale, bands, production gate, and veto floor — specified in the grading model later in this chapter.

---

## Storage and Scale

The **spec is the source; the store is generated.** The authoritative requirement is the declaration authored prose-first into a spec chapter — its `statement`, its `check`, and its optional `grade`. A **harvest** step reads those inline declarations and generates the per-entry store under `.memo/_requirements/`, one file per entry, which the runtime then reads. The arrow runs **spec → harvest → store → trigger**, not store → spec: the store is a derived index, never the source of truth.

The store is a sibling of the memos under `.memo/` rather than a child of any single memo, so the generated set is shared across all memos of a project instead of trapped inside one. Because the store is generated rather than hand-maintained, it scales to hundreds of fine-grained entries without any single file becoming unmanageable: the curated rules live in the spec, and the store **MAY** additionally carry runtime entries that did not originate from a spec chapter.

Scope is **carried by the entry itself**, not by where the file sits. A `scope` object with three axes — `repos`, `categories`, and `tags` — plus a `when` trigger object decides which work an entry applies to. A scoped folder tree is a useful conceptual model for reasoning about the registry — global rules, per-repo rules, per-category rules, per-state rules — but the scope axes in the entry are authoritative. The folder layout is a lens onto the data; the data is the source of truth.

The intended conceptual tree:

```
_requirements/
  global/                 # applies to everything (for example: outward-facing language)
  repos/<repo>/           # applies to one repository
  categories/<category>/  # applies to one work category (readme, diagram, issue, …)
  states/<state>/         # applies to one workflow state
  <id>.req.json           # one file per entry; scope axes inside decide matching
```

### The Family Manifest Head

Each spec family declares a machine-readable head so tooling can read every family uniformly. Both container forms are allowed — a `spec.json` or a `spec-manifest.json` — but one common field set is mandatory:

| Field | Meaning |
|-------|---------|
| `namespaceToken` | A short, globally-unique uppercase token for the family, so cross-family references never collide. |
| `hasRequirements` | Whether the family authors its own requirements inline (the harvest source). |
| `hasGrading` | Whether the family carries a grading head (the grade axis above). |
| `requirementsRef` | The chapter that hosts the family's requirement standard, or `null`. |
| `gradingRef` | The chapter that hosts the family's grading model, or `null` — a thin family points this at the shared model it imports. |

A family that hosts the standard sets the flags `true` and points the refs at the hosting chapter; a thin family that only consumes sets them `false`/`null` and, when it grades, imports the model via `gradingRef`. External families adopt the same field set when they are ready; the field set is the contract, not the container filename.

A thin family resolves its requirements one of two ways, never both: it either carries **its own requirement series** in its own chapters (and points `requirementsRef` at them), or it **declares inheritance** — naming the host-family requirements it must satisfy — instead of duplicating a parallel series. The second is preferred where a family has no domain-specific rules of its own, because a cross-family coverage board can then read one set of obligations per family without double-counting. A family's own series uses its own id vocabulary; the shared `REQ-NNN` store holds the curated, harvested rules.

---

## Entry Schema

A requirement entry is an English-language JSON file. The fields are:

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Stable identifier, pattern `REQ-NNN` (three or more digits). |
| `title` | yes | Short human name. |
| `statement` | yes | One-line human-readable description of what is required. This text flows **into prompt generation**. |
| `scope` | yes | Object with three array axes: `repos`, `categories`, `tags`. Decides which work the entry matches. |
| `when` | no | Trigger object: `worktype`, `effort`, `language`, `changetype` — each an array. Narrows applicability to specific working conditions. |
| `check` | yes | Object that decides whether the requirement is met. Drives the **gate**. See below. |
| `source` | yes | Where the requirement comes from, for example a skill reference such as `skill:node-formatting`. |
| `severity` | yes | One of `blocker`, `warning`, `info`. Governs how hard the gate enforces it. |
| `origin` | yes | One of `predefined`, `ai-added`, `evaluator-session` — how the entry entered the registry. |
| `grade` | no | Optional grade axis: the string `binary`, the string `todo`, or `{ dimension, weight }`. See **The Grade Axis** above. |

The `check` object **MUST** declare a `kind`, one of:

| `check.kind` | Meaning | Typical fields |
|--------------|---------|----------------|
| `assertion` | Direct, deterministic assertions over code, state, or outcome. | `assertions` (list of conditions) |
| `tool` | Verified by running a named tool with a named tactic. | `tool`, `tactic`, `artifact`, `verify` |
| `evaluator` | Judged by a fresh-context evaluator against a rubric. | `rubric`, `verify` |
| `skill` | Delegated to a named skill that performs the check. | `skill`, `verify` |

A `check` **MAY** also declare `artifact` (a machine artifact the check produces or inspects), `presence` (`required` or `optional`), and `verify` (the steps a verifier runs). The `statement` drives what the work should be; the `check` drives whether it is. A `source` of `skill:…` records which skill the requirement originated from, and a `skill`-kind check records which skill verifies it — a requirement can both come from and be enforced by skills.

---

## Selection and Matching

Requirements are selected for a piece of work by a **deterministic** scope cascade evaluated at the moment of writing — one matcher, run consistently, so the same work always selects the same set.

The cascade runs from **broad to narrow**: global requirements first, then per-repo, then per-category and per-tag. Within a single scope axis, an empty array is a wildcard (matches everything on that axis) and a non-empty array matches by intersection. Across the three axes the result is an **AND**: an entry applies only when every populated axis matches the work.

When two requirements conflict, **specific beats general** — a repo-scoped requirement overrides a tag- or category-scoped one, which overrides a global one. The `when` triggers gate applicability further: a requirement with `when.changetype: ["readme"]` engages only when a README is being written, not on every edit. An override is **attribute-based** (declared on the entry), never position-dependent.

Matching **MUST** be deterministic by default. Fuzziness — glob, regex, or set-membership operators — is available only as an **opt-in** operator on a specific axis; it never changes the default exact-match behavior.

---

## Checks and Anti-Cheat

The gate distinguishes hard from soft enforcement by `severity`:

- A **`blocker`** is a hard gate. Its `check` **MUST** verify code, state, outcome, or a tool result — never the mere presence of a claim or a letter-of-the-law match, which invites reward-hacking. A failing blocker **short-circuits**: the gate stops and reports `BLOCKED`.
- A **`warning`** or **`info`** requirement layers softer evidence (a rubric or an evaluator judgment) and **SHOULD** be surfaced without blocking finalization.

Every check resolves to a **ternary** status — `PASS`, `BLOCKED`, or `INCONCLUSIVE`. A check that did not actually run reports `INCONCLUSIVE`; it **MUST NOT** silently report `PASS`. Every check **SHOULD** emit a machine artifact (a file list, an exit code, a state hash) as its evidence, so a result can be reproduced rather than trusted.

The **doer is not the grader**. The agent that performs the work **MUST NOT** be the agent that verifies it. Verification runs in a **fresh context** by a separate verifier, adversarially, so that the proof of a requirement is independent of the work that claimed to satisfy it.

---

## Workflow States

A requirement's force depends on the workflow state of the work it applies to. The registry recognizes four states:

| State | Role of requirements |
|-------|----------------------|
| Intense research | Internal requirements gather evidence first; research precedes opinion. A top-tier model is `must` here. |
| Memo creation | Requirements are added and discussed as the memo is authored and revised. |
| Rollout | Requirements are observed while the work is executed. |
| Finalization | Requirements are **binding** — the gate hands off here, and applicable blockers must pass. |

Requirements may be added or discussed at any earlier state; they become enforceable at finalization. Up to that point a requirement is a proposal that shapes generation; at finalization it is a condition the work must meet.

---

## Multi-Level Requirements

Requirements apply at several granularities, selected through the same scope axes:

| Level | Example scope | Example requirement |
|-------|---------------|---------------------|
| Single repo | `scope.repos: ["spec"]` | A LICENSE file is present; CI is green on the default branch. |
| Repo class | `scope.tags: ["public"]` | No secrets, including public tokens; an organization profile soll-set is satisfied. |
| README | `scope.categories: ["readme"]` | Required README sections exist; badges resolve. |
| Node module | `scope.categories: ["node-module"]`, `when.language: ["node"]` | 4-space indentation, no semicolons, `.mjs` ES modules. |
| Diagram | `scope.categories: ["diagram"]` | Diagram labels are in the artifact's language; the diagram type fits the data flow. |
| Blog-style text | `scope.categories: ["blog"]` | One language per artifact; a readable, structured prose style. |

A higher-level requirement (global, or a repo class) sets a baseline; a narrower one **MAY** tighten it but **MUST NOT** silently weaken it. When both apply, the broad baseline is read first and the narrow entry layered on top.

---

## Skills Declaring Requirements

A skill **MAY** declare and register requirements. When a skill encodes a rule that should hold for the work it governs, it can emit that rule as a registry entry whose `source` names the skill (for example `skill:repo-issue` for issue-writing requirements, or `skill:get-sheet` for spreadsheet work). This lets a skill add enforceable, scoped checks without changing the core gate set: the skill declares the rule as data, and the data becomes both a generation instruction and a gate. Skill-declared requirements participate in the same scope cascade and the same ternary checks as predefined ones; they are distinguished only by their `origin` and `source`.

---

## Verification Scoring and Confidence

Because checks are ternary and evidence-backed, a set of requirements yields a **score** rather than a single pass/fail bit. For a piece of work, the gate reports how many applicable blockers passed, how many warnings were raised, and how many checks were `INCONCLUSIVE`. An `INCONCLUSIVE` result lowers **confidence** without falsely raising or lowering the pass rate — it signals that a requirement could not be proven, which is treated as a gap to close, not a silent success.

A requirement set thereby doubles as an **eval set**: it is the explicit definition of what the work is being optimized against. The score tells the author both whether the work is acceptable and how much of that judgment rests on solid machine evidence versus checks that did not conclusively run.

---

## The Grading Model

When a requirement carries an object `grade` (the grade axis above), its dimension feeds a shared **grading model** — one reusable scoring head that every family follows, rather than each domain re-inventing its own. The model is deliberately the same discipline already proven in a sibling content-grading specification; it is summarised here as the common head and imported by reference, not copied.

**Weighted, continuous scale.** A grade is a weighted sum of named **dimensions** on a continuous **1.0–5.0** scale. The applicable dimension weights **MUST** sum to 100%. A dimension that does not apply to a given work type is **dropped and its weight redistributed** across the rest — never scored as a failure, so an inapplicable axis cannot silently sink a score.

**Bands and the production gate.** The aggregate maps to honest bands:

| Band | Range |
|------|-------|
| Exemplary | 5.0 |
| Strong | 4.0–4.9 |
| Production-ready | 3.5–3.9 |
| Needs work | 2.5–3.4 |
| Failing | 1.0–2.4 |

The **production gate is 3.5**: work below it is not ready. A family **MAY** set a stricter gate but **MUST NOT** lower it below 3.5.

**Veto through the scale, not beside it.** There is no separate fail flag. A `CRITICAL`-severity miss **floors its dimension to 1.0**; because one floored weighted dimension drags the aggregate under the gate on its own, the single weighted sum is the only source of the verdict.

**Two check tiers.** Each grading point declares a `checkMode`: **`deterministic`** (decided by code or CI — cheap, reproducible) or **`judged`** (decided by an evaluator against a rubric in a **fresh context**; a judged result **MUST** be stamped with the grader identity and model). The doer is not the grader, exactly as for the ternary checks above.

**Calibration honesty.** Weights and band cut-offs are assumptions until calibrated against a labelled corpus. An uncalibrated weight **MUST** be marked `provisional`; freezing a weight set as final **REQUIRES** a stated calibration basis. A grade audits the *direction* a rule points, not an unverified absolute threshold.

**Codes and namespace qualification.** A grading point carries a stable code of the form `GR-<SUBCAT>-<NNN>` — the `GR-` facet marks it as grading, so it never collides with a `REQ-` id even on the same entry. Across families a code is qualified by the family's globally-unique `namespaceToken` (for example `MC:GR-<SUBCAT>-<NNN>`), which is how a thin family imports the shared head and references core's points without collision.

**Importing the head.** A family turns grading on through its manifest `gradingRef` (see *The Family Manifest Head*). A **thin** family sets `gradingRef` to the chapter that hosts this model, imports the whole head — scale, bands, gate, veto, tiers, calibration — and declares only the dimensions it adds. A **rich** family keeps its own domain dimensions but still follows this model. The domain scoring chapters reuse this head rather than restating it: goal scoring ([31-goals.md](/specification/goals/)), maintenance scoring ([33-maintenance.md](/specification/maintenance/)), and the implementation-fidelity audit ([45-implementation-fidelity-audit.md](/specification/implementation-fidelity-audit/)) each keep only their domain axis and point here for the shared contract.

**A rich external special case is referenced, not absorbed.** A separate, directory-versioned grading system exists for the external tool-schema domain, with its own executable harness and status model. It is **referenced** as a special case, not generalised into this head and not its blueprint: this model **MAY** additionally grade that domain as a requirement, but that system's internal grading is not pulled in, and its executability is not assumed transferable here.

---

## Related

- [24-tools-registry.md](/specification/tools-registry/) — the parallel data folder; `check.kind: tool` requirements point into the tools registry for the tool and tactic that verify them.
- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — the finalization gate that runs applicable requirement checks and binds them.
- [00-overview.md](/specification/overview/) — spec scope, conformance, and the document index.
- [30-primitives.md](/specification/primitives/) — central glossary and concept map; the requirement primitive summarized as cross-cutting.
