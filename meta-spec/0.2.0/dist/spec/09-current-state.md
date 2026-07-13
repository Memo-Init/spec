---
title: "Current State of the 3 Spec Repos"
description: "The state recorded here was read directly from the live repositories, at file:line / commit granularity, rather than inferred. It is deliberately kept apart from the design decisions of the rebuild:..."
spec_meta_version: "0.2.0"
spec_file: "09-current-state.md"
order: 9
section: "Meta-Spec"
normative: false
generated_at: "2026-07-13T19:05:19.052Z"
generated_from: "meta-spec/0.2.0/draft/spec/09-current-state.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: meta-spec/0.2.0/draft/spec/09-current-state.md."
---


> **Informative.** This chapter is a verified snapshot, not a set of binding rules. It records the current state of the organization's three spec repos and sets it against the end-to-end target, so that the later build phases work from one grounded baseline instead of re-deriving the state each time.

The state recorded here was read directly from the live repositories, at file:line / commit granularity, rather than inferred. It is deliberately kept apart from the design decisions of the rebuild: the target this snapshot is contrasted against is the decided direction — the spec generates content, the docs only serve it.

---

## The Three Spec Repos Today

The three spec repos differ on structure, on where `llms` content is generated, and on how they publish. The single row that matters is the third column: only memo-init generates its `llms` content on the site side today, and that is the drift the lifecycle removes.

| Repo | Structure | Families/NS | Content generation (llms) | Publish |
|------|-----------|-------------|---------------------------|---------|
| memo-init `repos/spec` | medium-first (→ namespace-first) | 4: memo/session/spec/workbench | **NONE** → the site re-synthesizes today | github.io (pin 170 commits old) |
| flowmcp `flowmcp-spec` | medium-first | 3: specification/grading/best-practice | **Spec level** (`generated/llms.txt`) | github.io; auto-commit bots |
| personal-brand `specs-private` | **namespace-first** (model) | 5 NS | **Spec/dist level** (`dist/<ns>/…/llms.txt`) | offline → promote → a6b8-public |

---

## Current Delta — memo-init (today: generation site-side, drifting)

memo-init is the repo with the drift. Its spec `dist/` carries no `llms` bundle, so the site re-synthesizes the content itself, and the pinned ref the site consumes is 170 commits behind the spec head — two independent sources of drift.

```mermaid
flowchart TD
    SPEC[repos/spec — dist/, NO llms] -->|sync-spec copies chapters| DOCS[Site src/content/docs/**]
    DOCS -->|generate-llms-txt RE-SYNTHESIS| LLMS[public/llms-full.txt]
    SPEC -.->|fromCommit bfb0ac1| DROP[fetch-refs DROPS SHA]
    PIN[Pin f65d565 — 170 commits old] -->|node_modules refs| DOCS
```

---

## End-to-End Target

The diagram below is the end-to-end **target** — the spec generates, the docs only serve — against which the current delta above stands: what drifts today because generation happens site-side is resolved by moving generation to the spec and letting the docs pass the finished bundle through.

```mermaid
flowchart TD
    subgraph A[Part A — front, private]
      D1[draft — authored, private-first] --> B1[Build + Test + Spec-Drift-Check WARN]
      B1 --> D2[dist + generated/llms.txt + token@version:sha + dependency graph]
      B1 -->|Drift| D1
    end
    subgraph B[Part B — back, Docs serve ONLY]
      D2 -->|ephemeral re-sync: pure copy| RS[Site public/ — copies bundle through]
      RS --> SM[Sitemap + robots.txt: site task]
      RS --> DYN[dynamic data: stats via manifest / catalog site-fetch — exception]
      RS --> WEB[llms.txt served — token@version:sha passed through]
    end
```

---

## Evidence

The state on this page reflects the repositories as they stand, read directly at file:line / commit granularity rather than inferred. It is a point-in-time reading of the two halves it contrasts — the spec side (structure and where `llms` content is generated) and the publish back-end (how each repo serves). The two boundaries it highlights — the missing `llms` bundle on the spec side and the pinned, lagging ref the site consumes — are precisely the drifts the lifecycle removes.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./08-spec-lifecycle.md](/spec/spec-lifecycle/) — the Spec-Lifecycle meta-spec whose current-state baseline this chapter records.
- [./05-publishing-principle.md](/spec/publishing-principle/) — the private-first publishing principle the lifecycle generalizes org-wide.
- [./00-overview.md](/spec/overview/) — the Meta-Specification entry point this family belongs to.
