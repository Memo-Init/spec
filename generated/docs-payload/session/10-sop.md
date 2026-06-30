---
title: "The SOP Entry Point"
description: "**What an SOP is.** An SOP — Standard Operating Procedure — is the connecting layer that makes a procedure predictable: the entry-point mechanism through which a tool registers under a namespace,..."
session_version: "0.1.0"
spec_file: "10-sop.md"
order: 10
section: "Session"
normative: false
generated_at: "2026-06-30T15:43:46.482Z"
generated_from: "spec/session/0.1.0/10-sop.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/session/0.1.0/10-sop.md."
---


> **Informative.** This chapter introduces the SOP area of the session standard: what an SOP is, why the SOP layer is the mechanism through which tools attach to the session, and how the existing SOPs relate to it. It carries no normative requirements of its own beyond the conventions named in [13-conventions.md](/specification/conventions/); the binding registry mechanics live in [06-namespace-registry.md](/specification/namespace-registry/).

**What an SOP is.** An SOP — Standard Operating Procedure — is the connecting layer that makes a procedure predictable: the entry-point mechanism through which a tool registers under a namespace, attaches to the session, and becomes findable. The term is defined once in the session [glossary](/specification/overview/) and is used here without redefinition. The distinction to hold from the start, so it is never quietly assumed away: **not every registered tool is an SOP.** A tool that carries a real procedure — a Setup, a Health check, an Update path — is an **SOP instance**, and its entry-point page takes the shape fixed by the [page contract](/specification/common-denominator/). A tool that only needs to be *found* — a catalog tool such as FlowMCP, whose model is `search` / `list` → `call` — registers and becomes discoverable but defines no procedure and gates nothing. A third kind, a **policy block**, registers a body of standards that is always findable but whose security/verification sub-set must be *read by a landing checkpoint* — it gates only as a redirect, never as a predecessor. The registrant kinds are detailed in [SOP Instances vs Catalog Blocks](#sop-instances-vs-catalog-blocks) below.

There is **no** standalone "SOP standard" sitting beside the session standard. There is **one** session standard, and **SOP is an integral entry-point area within it** — the area that defines how tools connect to the session, register themselves, and become findable. This chapter is where that mechanism is described; the three chapters after it ([11](/specification/common-denominator/)–[13](/specification/conventions/)) are the connecting layer it rests on.

---

## SOP Is the Mechanism Tools Connect Through

The primary job of the SOP area is **the connection and hand-off of tools**. A tool — a skill, a CLI, an entry point — does not float free in a session; it **registers** under a namespace, declares its signals and its dependencies, and thereby "logs in" to the session and becomes discoverable to an agent. That registration is what the SOP area governs: how a unit announces itself, which predecessor SOP it presupposes, and how a reader who has understood one registered unit knows how to read the next.

This is why the SOP area lives on the session tier rather than one layer up. The session is the genesis root ([01-genesis-root.md](/specification/genesis-root/)); the moment a tool needs to be found, gated, or chained, it is doing so **against the session**, not against a workbench convention. The concrete registry that realizes this — the `sops[]` blocks, the namespace reservation, the `requires[]` / `requirements[]` edges — is specified in [06-namespace-registry.md](/specification/namespace-registry/). This chapter narrates *why* it is the entry-point mechanism; that chapter specifies *how* it is encoded.

---

## A Connecting Mechanism, Not a Container

The SOP area does not contain the SOPs. The memo-init-SOP lives in the core specification, the Workbench-SOP lives in the Workbench spec, and future SOPs live in their own scopes. The SOP area defines the **common denominator** they all share — the shape every SOP is expected to take ([11-common-denominator.md](/specification/common-denominator/)) — and records that the existing SOPs are **instances** of that shape ([12-instances.md](/specification/instances/)).

The value of a connecting mechanism is predictability. Without it, each SOP would be free to organize itself differently, and a reader would have to re-learn the layout every time. With it, the four parts of any SOP are always in the same conceptual place, and an agent can navigate an unfamiliar SOP by knowing the standard rather than by reading it end to end.

---

## Three "Top" Axes Stay Distinct

Folding the SOP area into the session family must not create authority confusion. Three different senses of "the top" stay separate, and the system means a different thing by each:

| Axis | What sits at the top | Why |
|------|----------------------|-----|
| **Outermost published nav** | the **session** family | it is the outermost sibling spec a reader meets; the SOP area is published as part of it |
| **Highest authority** | the **Core** specification | Core owns the RFC 2119 / BCP 14 conformance vocabulary; the SOP area does not redefine it |
| **Lowest runtime tier** | **session-sop** (the genesis root) | it exists before any convention and is read by every layer above it |

The session family is the *outermost published* layer **and** the *lowest runtime* tier, but it is **not** the *highest authority*: it references the Core vocabulary rather than restating it. Stating this once keeps the merge from being mistaken for a promotion of the session family over the Core spec.

---

## SOP Instances vs Catalog Blocks

Not every tool that registers is an SOP. The session registry holds three kinds of registrant block, and the difference decides whether — and how — a unit ever becomes a gate:

| Block kind | Carries | Is a gate? | Example |
|------------|---------|------------|---------|
| **SOP-instance block** | `skills[]` **and** `requires[]`, and it feeds `requirements[]` pre-gate edges | yes — it can require a predecessor SOP (`when:pre`) | `memo-init` → `memo-sop` (REQ-061); `workbench` |
| **Catalog block** | `skills[]` only — empty `requires[]`, **no** `requirements[]` edge | never | **FlowMCP** (reserves `flowmcp`, contributes `flowmcp-usage`) |
| **Policy block** | `skills[]` with per-member `mode`/`groups` — empty `requires[]`, feeds `assertions[]` checkpoint rows | only as a checkpoint `redirect`, never a `when:pre` predecessor | the development standards (reserves `node`) |

memo-init and workbench are **SOP-instance blocks**: they participate in the predecessor chain and can gate an entry point. **FlowMCP is a catalog block**, not an SOP: its model is `search`/`list` → `call`, so it needs to be *findable*, but it never gates another entry point. The development standards are a **policy block**: always findable, never a predecessor, but a sub-set (security, verification) must be read by a landing checkpoint, enforced only as a redirect. All three live in the same `sops[]` array; an SOP-instance block contributes a `when:pre` edge, a policy block contributes an `assertions[]` checkpoint row, a catalog block contributes neither. The structural encoding of all three is in [06-namespace-registry.md](/specification/namespace-registry/); the load-bearing point here is that "registered and discoverable" does **not** imply "is a precondition".

---

## The SOP-Area Chapters

| Chapter | Holds |
|---------|-------|
| [10-sop.md](/specification/sop/) | this chapter — SOP as the entry-point mechanism, the three axes, instances vs catalog |
| [11-common-denominator.md](/specification/common-denominator/) | the four parts every SOP shares — Setup, Health, Update, Extras |
| [12-instances.md](/specification/instances/) | the existing SOP instances and the inheritance declaration |
| [13-conventions.md](/specification/conventions/) | the naming (`prefix-hyphen-name`) and brevity conventions |
| [15-addons.md](/specification/addons/) | the Add-on model — how custom-folder tools follow the SOP standard |

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [00-overview.md](/specification/overview/) — the session family this SOP area is part of.
- [06-namespace-registry.md](/specification/namespace-registry/) — the registry mechanics (`sops[]`, namespaces, `requires[]` vs `requirements[]`) that realize this mechanism.
- [12-instances.md](/specification/instances/) — the memo-init, Root, and Projects SOPs as instances of the common denominator.
- [The memo-init SOP entry point](/specification/memo-sop-entrypoint/) — the memo-lifecycle instance.
