---
title: "Versioning"
description: "Every family is versioned independently, and more than one version of a family can be published at once. This chapter specifies the parts of versioning that are structural — how a version directory..."
spec_meta_version: "0.1.0"
spec_file: "07-versioning.md"
order: 7
section: "Meta-Spec"
normative: true
generated_at: "2026-07-10T01:26:47.441Z"
generated_from: "spec/spec/0.1.0/draft/spec/07-versioning.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/spec/0.1.0/draft/spec/07-versioning.md."
---


Every family is versioned independently, and more than one version of a family can be published at once. This chapter specifies the parts of versioning that are structural — how a version directory is named, what status a version carries, and how an older version keeps its published URLs while a newer one is authored beside it. It deliberately does **not** restate the release-and-pinning strategy (how a version number is chosen, when it is bumped, how consumers pin to it); that lives once in the memo family's release chapter ([/specification/release-and-pinning/](/specification/release-and-pinning/)) and is referenced here rather than duplicated.

---

## The Version Directory

A family's chapters for a given version are authored under `draft/<family>/<version>/spec/` and published from `dist/<family>/<version>/`, where `<version>` is a **bare semantic version** — `0.1.0`, not `v0.1.0`. The bare form is canonical: no `v` prefix, no leading zero games, just the semver triple. A build reads the directory name as the version verbatim, so the authoritative version numbers recorded in `data/refs.manual.json` ([Per-Chapter Format](/spec/per-chapter-format/)) and the on-disk directory names are the same string.

The version is a property of the **directory**, never of prose. A chapter **MUST NOT** hardcode its family's version in its text; the build stamps each published chapter with its family's version, read from the family head and the refs registry.

---

## The Status Enum

A version carries one of a small, shared set of statuses, the same vocabulary for every family:

| Status | Meaning |
|--------|---------|
| `Draft` | The version is being authored. Its chapters may change; consumers should expect churn. |
| `Published` | The version is released and stable. Its chapters change only through a new version. |
| `Frozen` | The version is superseded by a later one but kept online. It receives no further changes; it exists so its published URLs keep resolving. |

The permitted transitions are `Draft → Published → Frozen`. A version does not move backwards: a `Published` version is not returned to `Draft` — a change to a released version is made by opening the next version as `Draft`. The per-chapter `Status` row ([Per-Chapter Format](/spec/per-chapter-format/)) reflects the version's status; a chapter is not `Published` while its version is still `Draft`.

---

## Coexistence and URL Stability

Multiple versions of a family coexist in the published tree, and a `Frozen` version keeps serving. This is the reason the coexistence rule matters:

- **A newer version is authored beside the old, not on top of it.** Opening `0.2.0` adds a `draft/<family>/0.2.0/` tree; it does not edit `0.1.0`. Both build to their own `dist/<family>/<version>/` output.
- **A frozen version's published URLs stay stable.** Because a published slug is the filename minus its `NN-` prefix ([Per-Chapter Format](/spec/per-chapter-format/)) and is number-independent, and because each version publishes under its own version segment, a reader who bookmarked a `0.1.0` page still reaches it after `0.2.0` ships. Freezing a version **MUST NOT** rewrite or remove its published routes.
- **The site's default version is the family's `currentVersion`.** The family head names which version the site surfaces by default ([Per-Chapter Format](/spec/per-chapter-format/), `spec.json`); frozen versions remain reachable at their explicit version routes.

---

## What This Chapter Does Not Cover

Version *assignment* and *pinning* — how a family decides its next version number, the two-tier release strategy (internal commit-SHA pins versus named external releases), and how a downstream consumer pins to a version — are the subject of the memo family's release chapter and are **not** re-specified here. This chapter owns only the structural side: directory naming, the status enum, and coexistence. Where the two meet, the release chapter is the authority on *when* a version changes and this chapter is the authority on *how the tree is shaped* when it does.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./02-per-chapter-format.md](/spec/per-chapter-format/) — the version directory layout and the number-independent published slug.
- [./05-publishing-principle.md](/spec/publishing-principle/) — what a published version exposes versus what stays internal.
- [/specification/release-and-pinning/](/specification/release-and-pinning/) — the release-and-pinning strategy this chapter references instead of duplicating.
