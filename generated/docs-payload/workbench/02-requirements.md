---
title: "Requirements Profiles"
description: "This chapter is **normative** for the requirements-profile location, the two viewpoints, the global/project split, dynamic pulling, the finalization check, and self-generated quality gates."
spec_version: "0.1.0"
spec_file: "02-requirements.md"
order: 2
section: "Workbench"
normative: true
generated_at: "2026-06-12T19:13:01.811Z"
generated_from: "spec/workbench/02-requirements.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/02-requirements.md."
---


> Normative language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119] [RFC8174]. RFC 2119 keywords are used.

This chapter is **normative** for the requirements-profile location, the two viewpoints, the global/project split, dynamic pulling, the finalization check, and self-generated quality gates.

---

## Problem

Today, requirements live only as **prose** scattered across the global rules file and individual skills. Prose requirements are unspecific and not reproducible: there is no machine-readable record of, for example, which formatting rules apply to a particular programming language or which repository conventions a given repository must satisfy. Two memos touching the same language can apply the rules inconsistently because there is nothing authoritative to pull from.

---

## Solution — Requirements Profiles as Data

A project **SHOULD** express its requirements as **data** under `.memo/requirements/`. A requirements profile is a structured file (JSON or YAML) that names a set of requirements and the viewpoint they apply to. Because it is data, it can be pulled dynamically, diffed, and checked mechanically — unlike prose.

### Location

Requirements profiles live in `.memo/requirements/`, a **sibling** of the memos under `.memo/`. The memos themselves remain directly under `.memo/`; the `requirements/` folder sits alongside them, not inside any single memo. This keeps requirements shared across all memos of the project rather than trapped in one.

---

## Two Viewpoints

A requirements profile **MUST** declare a **viewpoint** — the axis along which its requirements apply. There are two viewpoints:

| Viewpoint | Applies to | Example requirement |
|-----------|------------|---------------------|
| `programming-language` | A specific language used in the project | 4-space indentation, no semicolons, `.mjs` ES modules for Node.js |
| `repo` | A specific repository or repository class | README must exist, MIT license, CI green on `main` |

A profile **MUST NOT** mix viewpoints in a single profile; each profile is scoped to one viewpoint so that a consumer can pull exactly the relevant set.

---

## Global and Project-Specific

Requirements exist at two levels:

- **Global** profiles express requirements that apply across every project (for example, the workbench-wide Node.js formatting rules). They originate from the global rules and are the shared baseline.
- **Project-specific** profiles live in the project's own `.memo/requirements/` and express requirements unique to that project. A project-specific profile **MAY** extend or tighten a global one; it **MUST NOT** silently weaken a global rule without an explicit, recorded override.

When both levels apply, the consumer reads the global baseline and then the project-specific profile on top.

---

## Dynamic Pulling and the Finalization Check

Requirements are **pulled dynamically** rather than copied into each memo:

- During memo authoring, the relevant profiles (by language and by repository in scope) are read from `.memo/requirements/` at the time they are needed, so a memo always sees the current requirements rather than a stale snapshot.
- At **finalization**, the applicable requirements profiles **MUST** be checked against the memo. A memo that violates an applicable requirement **MUST NOT** pass finalization until the violation is resolved or an explicit override is recorded. This ties the data-level requirements into the finalization gate (see the core-spec quality-and-finalization chapter).

---

## Self-Generated Quality Gates

A requirements profile **MAY** generate its **own** quality gates. When a profile declares a checkable requirement, that requirement can be surfaced as an additional gate that finalization runs alongside the standard gates (see the core-spec quality-and-finalization chapter). This lets a project add enforceable, project-specific checks without modifying the core gate set: the data declares the rule, and the rule becomes a gate.

The wiring of profile-declared requirements into live finalization gates is specified here as the intended behavior; the corresponding implementation in the toolkit skills is follow-up work, consistent with the core-spec's specified-but-not-yet-implemented convention.

---

## Example Profile Shape

The following is an **illustrative**, non-normative example of a `programming-language` profile. The exact field set is fixed by the requirements schema in the spec `data/` folder; this example only shows the intent.

```yaml
viewpoint: programming-language
target: nodejs
version: ">=22"
requirements:
  - id: REQ-NODE-FMT-001
    rule: "4-space indentation, no semicolons"
    severity: error
    gate: true
  - id: REQ-NODE-MOD-001
    rule: "ES modules only, .mjs extension"
    severity: error
    gate: true
  - id: REQ-NODE-LOOP-001
    rule: "no for/while loops; use array methods"
    severity: warning
    gate: false
```

```json
{
  "viewpoint": "repo",
  "target": "spec",
  "requirements": [
    { "id": "REQ-REPO-LIC-001", "rule": "MIT LICENSE present", "severity": "error", "gate": true },
    { "id": "REQ-REPO-CI-001", "rule": "CI green on main", "severity": "warning", "gate": true }
  ]
}
```

A profile that sets `gate: true` on a requirement asks finalization to enforce it as a quality gate; `gate: false` makes the requirement advisory.

---

## Implementation Sync Status (Memo 005, P3)

The implementation under `.memo/requirements/` and `repos/core/lib/requirements/`
currently diverges from this normative chapter at three points, tracked here so the
divergence is explicit rather than silent:

- Finalization enforcement: this chapter requires a hard block; the toolkit gate
  (memo-finalize) is advisory-only (F11=A). Reconciliation is scheduled in Memo 005
  Phase P6 (transition gate).
- Scope model: this chapter specifies two viewpoints (programming-language | repo);
  the implementation uses a three-axis scope (repos / categories / tags). The when-axis
  for conditional requirements is scheduled in Memo 005 Phase P4.
- gate flag: the example profile shape uses a per-requirement `gate` flag not present
  in the current requirement schema.

---

## Related

- [01-project-structure.md](/specification/project-structure/) — the `.memo/requirements/` location as a sibling of the memos.
- [03-tools-registry.md](/specification/tools-registry/) — the parallel data folder describing available tools.
- [04-strands.md](/specification/strands/) — per-strand requirements draw from these profiles.
- [00-overview.md](/specification/overview/) — sub-spec scope and independent versioning.
