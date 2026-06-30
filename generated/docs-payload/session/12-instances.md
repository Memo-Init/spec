---
title: "SOP Instances"
description: "The SOP area defines a shape; the concrete SOPs **are** that shape, filled in for their scope. This chapter records the existing instances and the lightweight reference model that ties them back to..."
session_version: "0.1.0"
spec_file: "12-instances.md"
order: 12
section: "Session"
normative: false
generated_at: "2026-06-30T15:14:56.520Z"
generated_from: "spec/session/0.1.0/12-instances.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/session/0.1.0/12-instances.md."
---


> **Informative.** This chapter records how the existing SOPs relate to the common denominator. It names instances; it does not restate their content, which lives in their own specs.

The SOP area defines a shape; the concrete SOPs **are** that shape, filled in for their scope. This chapter records the existing instances and the lightweight reference model that ties them back to the standard.

---

## The Existing Instances

| SOP | Scope | Where it lives |
|-----|-------|----------------|
| **memo-init SOP** | a single memo's lifecycle | core specification — [entry point](/specification/memo-sop-entrypoint/) |
| **Root-SOP** | the workbench-root level — organize, do not develop | Workbench spec — reached through the [Workbench-SOP entry point](/workbench/sop-entrypoint/) |
| **Projects-SOP** | the project level — one project's own work | Workbench spec — reached through the [Workbench-SOP entry point](/workbench/sop-entrypoint/) |

The workbench scope contributes **two** instances, not one: it has two structural levels (root and project), and each level is its own thin SOP. The **Workbench-SOP** is the **entry point** that routes between them by the agent's location — a signpost, not a third instance. These two instances are named here; their full procedure and the routing between them are workbench-specific and live in the Workbench spec ([Root and Projects](/workbench/root-and-projects/)), not restated here.

Each instance fills in the four parts of the common denominator for its own scope: its Setup creates that scope, its Health checks that scope, its Update keeps that scope current, and its extras cover what is unique to it. Future SOPs join the table by doing the same.

---

## The Reference Model

The tie between an instance and the standard is deliberately light:

- An SOP **references** this standard rather than copying it. It does not restate the definitions of Setup, Health, and Update; it points at them and then says how it realizes each.
- This SOP area **does not import** an SOP's content; it names the instance and links to it.

The result is a connecting mechanism with no duplication: the standard is stated once here, each SOP states only how it satisfies the standard, and a reader moves between them by following references rather than by reconciling repeated text.

---

## The Inheritance Declaration

For the reference model to hold, the tie must be **stated** by the instance, not merely implied. An SOP instance **MUST** declare, as one of its first sentences, that it is an instance of the SOP standard and that it extends it; it then states how it realizes Setup, Health, and Update for its scope, plus its extras. The canonical first-sentence form opens an instance like this:

> "This is the «X»-SOP, an instance of the SOP standard ([SOP](/specification/sop/)) that it extends; below is how it realizes Setup, Health, and Update for «scope», plus its extras."

This declaration is what lets a reader navigate an unfamiliar SOP by the standard: having read the common denominator once, the reader knows that the four parts are present and where each is realized, without reading the SOP end to end.

Each instance **SHOULD** also name its **entry points** — the holistic "what this scope is" together with the concrete points where work enters the scope — so a reader knows both the whole and where to start.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [10-sop.md](/specification/sop/) — the purpose of the SOP entry-point mechanism.
- [11-common-denominator.md](/specification/common-denominator/) — the four parts each instance fills in.
- [Root and Projects](/workbench/root-and-projects/) — the two workbench instances (Root-SOP, Projects-SOP) and the routing between them, specified in the Workbench spec.
- [The Workbench-SOP entry point](/workbench/sop-entrypoint/) — the signpost that routes to the two workbench instances.
- [The memo-init SOP entry point](/specification/memo-sop-entrypoint/) — the memo-lifecycle instance.
