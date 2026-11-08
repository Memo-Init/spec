---
title: "The Standing Clearance"
description: "This chapter specifies the way a run without the user at the machine may work outside the workbench: a clearance the user grants before leaving. It is the safer sibling of the exception role, because..."
governance_version: "0.1.0"
spec_file: "14-standing-clearance.md"
order: 14
section: "Governance"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "governance/0.1.0/draft/spec/14-standing-clearance.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: governance/0.1.0/draft/spec/14-standing-clearance.md."
---


This chapter specifies the way a run without the user at the machine may work outside the workbench: a clearance the user grants before leaving. It is the safer sibling of the exception role, because the user has agreed before the act and not after it; and it is dangerous for the same reason, because an approval given before the work cannot see the work.

---

## Definition

A standing clearance is an approval the user grants **in advance**. It allows a named holder to work at **one** place outside the workbench boundary, up to **one** point in time, without asking at the moment of the work. The workbench boundary is the root marker of the session specification: the first ancestor directory that carries it is the workbench, and everything beneath it is inside.

---

## The Four Determinants

A clearance exists only when all four are stated.

| Determinant | What it requires |
|---|---|
| `place` | One place outside the workbench, never one per phase and never one per work package. A place covers its sub-paths. The file-system root, the home directory itself and every ancestor of the workbench are not places |
| `validity` | A named expiry, capped. The default cap is one day and can be configured; a clearance without an expiry is not granted |
| `revocation` | At any time, with a reason, recorded. A revoked entry stays in the record |
| `holder` | A role label, exactly one agent or all agents of one role. The holder is checked by the three-valued check of the permits chapter; a holder that cannot be checked holds no clearance |

---

## What a Clearance Never Covers

A clearance widens **where** work may happen. It never widens **what** is decided. It never covers:

- the five reserved decisions of the orchestrator role: Scope, Finalizing, Push, Clearing the context and Aborting the run;
- the destructive classes of commands;
- the identity check itself.

A run that holds a clearance for a place still collects every question that belongs to the user, and still stops for every reserved decision.

---

## The Danger

An approval given before the work does not see the work. A clearance "for all these work packages" turns into a decision about scope and can lift the reserved decisions out of their hinges. That is why the clearance is bound to a place and not to a task, why its expiry is short, why its holder is checked, and why every grant is counted and shown. A clearance without an expiry is a blank cheque.

---

## The Clearance and the Exception Role

Both suspend a rule for an agent; they differ in the moment. The exception role is drawn during the work, by the orchestrator, against an approval the user gave before. The clearance is granted before the work, by the user. The clearance is the safer form, because it meets the multi-eye release structurally: the user is the second pair of eyes and agreed before the act. Where a clearance is enough, it replaces self-authorization. The exception role remains the emergency.

---

## Recorded and Counted

Every grant is one row that points to a recorded user input. A grant whose row cannot be written does not exist. The list states its count together with the number of rows it compared. Every clearance granted during a run appears in the run's closing report, counted per state — in force, revoked, expired — together with the number of records compared; a clearance missing from that count is a defect, not an omission.

---

<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./03-permits.md](/governance/permits/) — the three-valued check that binds a clearance to a verified holder.
- [./05-roles.md](/governance/roles/) — the orchestrator and the reserved decisions a clearance never covers.
- [./07-break-glass.md](/governance/break-glass/) — the exception role, the emergency form next to the clearance.
