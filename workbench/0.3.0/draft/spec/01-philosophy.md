# 01. Philosophy

| | |
|---|---|
| Status | Draft |
| Depends on | [00-overview.md](./00-overview.md) |
| Related | [02-sop-entrypoint.md](./02-sop-entrypoint.md), [20-cli.md](./20-cli.md), [22-config.md](./22-config.md) |

> **Informative.** This chapter describes the convictions behind the workbench layer. It is written in prose; the normative requirements that operationalize it live in the chapters it points to.

The workbench is the layer that holds many projects and the shared machinery they draw on. Its design rests on three convictions: that shared capability should be defined **once** and not copied into every project, that a central definition is only valuable if it can be **rolled out** cheaply, and that the documentation of this layer is itself **several independent specifications** rather than one monolith. This chapter sets out those convictions before the later chapters turn them into rules.

---

## Single Source, Not Duplication

The workbench provides its CLIs, standards, and conventions **once**, at the workbench level; an individual project carries only what is specific to it. The reasoning is operational rather than aesthetic: configuration that is copied into every project drifts. Each copy is edited independently, and the copies diverge.

Defining shared capability once means there is a single place to read it, a single place to change it, and no second copy to fall out of step. A project that needs a shared tool relies on the workbench-level definition rather than re-stating it. Where a project genuinely differs, that difference is declared explicitly (see the project configuration in [22-config.md](./22-config.md)) rather than expressed as a silent fork of a shared default.

---

## Updatability — Develop Centrally, Roll Out Easily

A single source is only an advantage if a change to it reaches the projects without friction. The workbench is therefore designed to be **updatable**: capability is developed centrally and rolled out into the projects that consume it, rather than re-implemented in each one.

This is what makes the single-source rule pay off over time. The expensive work — designing a CLI, hardening a script, settling a convention — is done once at the workbench level; propagating an improvement is then a roll-out, not a rewrite. The conventions that make this possible (predictable folder layout, the script families, the self-describing CLI) are normative concerns of the later chapters; the philosophy is simply that the workbench rewards centralization with cheap propagation.

---

## Several Parallel, Standalone Specifications

The workbench's own documentation follows the same conviction at the level of the specification itself: it is **several parallel, standalone specs**, not one document with ever more chapters. The memo-init repository hosts the core specification, this Workbench spec, and the Session spec — which carries the thin SOP area, once a family of its own — as sibling families, each with its own version line (see [00-overview.md](./00-overview.md)).

Splitting the specification this way lets each family evolve at its own pace and keeps each one readable on its own terms. A reader who needs the workbench conventions does not have to navigate the memo lifecycle to find them; a change to the workbench does not force a version bump on the core spec. The parallel-spec structure is the documentation expressing the same single-source-plus-updatability principle the workbench applies to its tooling.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [00-overview.md](./00-overview.md) — the sibling-spec framing and the workbench's place among the families.
- [02-sop-entrypoint.md](./02-sop-entrypoint.md) — the two-level model that the single-source principle is organized around.
- [22-config.md](./22-config.md) — how a project declares what is specific to it instead of forking a shared default.
