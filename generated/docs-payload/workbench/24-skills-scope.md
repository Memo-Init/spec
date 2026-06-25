---
title: "Skills in the Workbench Scope"
description: "The skills that operate at the workbench level are organized around the **common SOP standard**: a workbench skill serves the Setup, Health, and Update of the workbench scope, plus the scope-specific..."
workbench_version: "0.1.0"
spec_file: "24-skills-scope.md"
order: 24
section: "Workbench"
normative: true
generated_at: "2026-06-25T18:01:17.107Z"
generated_from: "spec/workbench/0.1.0/24-skills-scope.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/24-skills-scope.md."
---


The skills that operate at the workbench level are organized around the **common SOP standard**: a workbench skill serves the Setup, Health, and Update of the workbench scope, plus the scope-specific extras. This chapter records that coupling and where the existing skills fall.

---

## Coupled to the SOP Standard

A workbench skill is an instance of the common SOP denominator ([the SOP common denominator](/sop/common-denominator/)) applied to the workbench scope. Its responsibilities map onto the four parts:

| Part | At the workbench scope |
|------|------------------------|
| **Setup** | Bring a project or the workbench into its expected, structured state. |
| **Health** | Verify the workbench setup — do the projects and repositories satisfy the structural checks (see [21-environment-scripts.md](/specification/environment-scripts/)). |
| **Update** | Roll central improvements out into the projects that consume them. |
| **Extras** | Scope-specific capabilities — notably the wiki and the project conventions. |

Organizing workbench skills this way means a reader who knows the SOP standard already knows the shape of the workbench skill set: it is Setup/Health/Update plus the workbench's own extras, not an ad-hoc collection.

The same four-part frame generalizes beyond workbench skills to **every add-on**: each add-on's SOP is Setup/Health/Update plus its own tool-specific Extras, scaled to the add-on's weight ([26-addons.md](/specification/addons/)).

---

## Where the Existing Capabilities Fall

| Capability | Placement |
|------------|-----------|
| Project audit (structure/health) | A **workbench skill** — it realizes the **Health** part (the structural checks of [21-environment-scripts.md](/specification/environment-scripts/)). |
| Documentation scraping | A **borderline** case — closer to user/memo work than to workbench Setup/Health/Update; not a core workbench skill. |
| Phase execution | **Not** a workbench skill — it belongs to the memo-SOP (the core specification's lifecycle), not to the workbench scope. |
| Browser automation | Already covered by [31-browser-automation.md](/specification/browser-automation/) as a project-level method. |

The memo-toolkit capabilities are loaded **dynamically** (progressive disclosure): a skill is brought into context when it is relevant rather than all at once, so the workbench scope stays small at rest and expands only to the task at hand.

---

## Orchestrators and Components

Workbench and add-on skills split into two roles, by analogy with a class that has public and private methods:

| Role | Analogy | Visibility |
|------|---------|------------|
| **Orchestrator** | a class's **public method** | A user-facing entry point that defines a flow and is invoked from outside. |
| **Component** | a class's **private method** | A reusable building block called *by* orchestrators, not directly by the user. |

A **component** is a part used in several places rather than a standalone entry point — research is the clearest example, reused at multiple points in the memo lifecycle. Components exist today only implicitly; naming the role makes the structure explicit. A skill declares its role in frontmatter:

```yaml
role: orchestrator   # a user-facing entry point
# or
role: component      # a reusable building block, not in the user-callable catalog
```

A skill marked `role: component` is **taken out of the user-callable catalog**: it is private by default, the same posture as a class method that is private unless deliberately exposed. The default is private; an orchestrator is the deliberate exception that is made public.

---

## The Public-Method Validation Boundary

Why the orchestrator/component split matters is a **systems** argument, stated by analogy with a class:

> A class is a system. Input — and therefore **contamination** — enters through its **public methods**. So the public methods must be **validated**. That is how you build an engine with no internal problems.

The consequences are concrete:

- Validation belongs at the **public entry points** (the orchestrators), because that is the one surface through which outside input enters. Components, being internal, are not called from outside and do not carry the same boundary check.
- The check is on **content, not only types** — not just "is this the right shape?" but "**does this make sense?**". Type-checking the input is necessary and not sufficient.
- **The stricter the public methods, the calmer the interior.** Rigor at the boundary is what lets the inside of the system relax; a lax boundary pushes defensive checks into every internal step.

This is the same boundary the two checkability mechanisms act on: the **entry-point pre-condition** checks it *before* the call ([23-hooks-contract.md](/specification/hooks-contract/)), and the **runtime call-validation** measures it *after* ([20-cli.md](/specification/cli/)). The orchestrators are where the workbench's essential validation layer lives. Enforcing the `role` split with a pre-hook is a later step; the convention is fixed here first — **spec before mechanism**.

---

## Related

- [26-addons.md](/specification/addons/) — the add-on model the Setup/Health/Update/Extras frame generalizes to.
- [23-hooks-contract.md](/specification/hooks-contract/) — the entry-point pre-condition that guards a public method *before* the call.
- [20-cli.md](/specification/cli/) — the runtime call-validation that measures the boundary *after* the call.
- [The SOP common denominator](/sop/common-denominator/) — the Setup/Health/Update standard these skills realize.
- [21-environment-scripts.md](/specification/environment-scripts/) — the health checks the audit skill performs.
- [31-browser-automation.md](/specification/browser-automation/) — the project-level browser-automation method.
