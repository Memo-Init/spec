---
title: "Progressive Disclosure"
description: "This chapter specifies how knowledge and rights are loaded in stages. Through the role SOPs, agents can be assembled dynamically: every capability and every permission is acquired by loading the..."
governance_version: "0.1.0"
spec_file: "09-progressive-disclosure.md"
order: 9
section: "Governance"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "governance/0.1.0/draft/spec/09-progressive-disclosure.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: governance/0.1.0/draft/spec/09-progressive-disclosure.md."
---


This chapter specifies how knowledge and rights are loaded in stages. Through the role SOPs, agents can be assembled dynamically: every capability and every permission is acquired by loading the skills that carry it, and no global instruction file is needed. How that staging works is the subject this chapter will carry.

---

## Relevance Criterion

A guideline is **relevant** to a piece of work when the work creates or changes an artifact of the class the guideline governs, or runs a command of the class it governs. It is **context load** when the work touches neither: loaded anyway, it takes room in the context and, over a long session, lowers the quality of the results. The rules for code comments are the test case: they are relevant when code is written or changed, and they are context load in a research task that produces no code.

The criterion is declared, not judged. Each member of an umbrella SOP carries its mode: `always` for a guideline in force on every artifact of its class, `contextual` for one that is loaded when the work reaches its class, and `checkpoint` for one whose reading is confirmed at a landing step ([./02-sop-system.md](/governance/sop-system/)). A guideline loaded outside its class is not a safety margin; it is context load.

---

## Standard Files

The system needs no global instruction file. A fresh session that knows no standard file finds the workbench SOP through the entry the session carries, and a probe measures exactly that; a standard file is shrunk only after the entry is carried elsewhere, never before.

Whether a harness reads an `AGENTS.md`, and which of the two standard files takes precedence, is a measured property of the harness version, not an assumption. Measured for Claude Code 2.1.311: the harness reads AGENTS.md; where both files are present, CLAUDE.md takes precedence. Until a measurement shows that the harness reads it, no `AGENTS.md` is introduced and no standard file is renamed.

---

## Scope

- Staged disclosure of knowledge and rights: an SOP carries what must be read; further skills for partial aspects are linked from it and are either optional or required for execution.
- Every command available on demand, so that a role needs no global instruction file loaded in advance.
- The duty of an SOP to make a hidden requirement visible: when a sub-SOP is needed for a command, the SOP says so, so that the agent has a fair chance to behave as expected.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./01-entry-points.md](/governance/entry-points/) — where loading begins.
- [./08-runtime-enforcement.md](/governance/runtime-enforcement/) — the hooks that check what was loaded.
