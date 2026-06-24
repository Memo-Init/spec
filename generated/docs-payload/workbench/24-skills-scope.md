---
title: "Skills in the Workbench Scope"
description: "The skills that operate at the workbench level are organized around the **common SOP standard**: a workbench skill serves the Setup, Health, and Update of the workbench scope, plus the scope-specific..."
workbench_version: "0.1.0"
spec_file: "24-skills-scope.md"
order: 24
section: "Workbench"
normative: true
generated_at: "2026-06-24T21:26:02.213Z"
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

## Related

- [The SOP common denominator](/sop/common-denominator/) — the Setup/Health/Update standard these skills realize.
- [21-environment-scripts.md](/specification/environment-scripts/) — the health checks the audit skill performs.
- [31-browser-automation.md](/specification/browser-automation/) — the project-level browser-automation method.
