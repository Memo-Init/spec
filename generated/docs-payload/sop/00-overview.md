---
title: "Overview"
description: "This is the entry point for the **SOP spec** — a standalone sibling of the memo-init core specification and the Workbench spec. It is deliberately **thin**. Its single job is to make the various..."
sop_version: "0.1.0"
spec_file: "00-overview.md"
order: 0
section: "SOP"
normative: false
generated_at: "2026-06-26T15:10:37.273Z"
generated_from: "spec/sop/0.1.0/00-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/sop/0.1.0/00-overview.md."
---


> **Informative.** This document introduces the SOP spec, its scope, and its place among the sibling specifications. It does not itself carry normative requirements beyond the common denominator defined in [01-common-denominator.md](/specification/common-denominator/).

This is the entry point for the **SOP spec** — a standalone sibling of the memo-init core specification and the Workbench spec. It is deliberately **thin**. Its single job is to make the various Standard Operating Procedures (SOPs) of the system **predictable**: to define what any SOP contains and where to find each part, so that a reader who has understood one SOP knows how to read the next.

---

## A Connecting Layer, Not a Container

The SOP spec does not contain the SOPs. The memo-init-SOP lives in the core specification, the Workbench-SOP lives in the Workbench spec, and future SOPs live in their own scopes. This spec defines the **common denominator** they all share — the shape every SOP is expected to take — and records that the existing SOPs are **instances** of that shape (see [02-instances.md](/specification/instances/)).

The value of a connecting layer is predictability. Without it, each SOP would be free to organize itself differently, and a reader would have to re-learn the layout every time. With it, the four parts of any SOP are always in the same conceptual place, and an agent can navigate an unfamiliar SOP by knowing the standard rather than by reading it end to end.

---

## Hierarchy — Where This Spec Sits

The SOP spec is **not** the highest authority. The core specification defines the conformance vocabulary (the RFC 2119 / BCP 14 key words); this spec does not redefine them. This spec only defines the shared shape (the four parts below) and the vocabulary for talking about it; the content of each SOP lives in that SOP, not here.

It is **versioned independently**, under `spec/sop/0.1.0/`, with its version recorded in `data/refs.manual.json` under the `sop` key. Being thin, it is expected to change slowly.

---

## Document Index

| Document | Title | Mode |
|----------|-------|------|
| `00-overview.md` | Overview | Informative |
| `01-common-denominator.md` | The Common Denominator — Setup, Health, Update, Extras | Informative |
| `02-instances.md` | SOP Instances and the Reference Model | Informative |
| `03-conventions.md` | Conventions — Naming and Brevity | Informative |
