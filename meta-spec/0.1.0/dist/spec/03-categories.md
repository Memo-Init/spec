---
title: "Navigation Categories"
description: "A family is more than a flat list of chapters. Its chapters cluster into topics — an introduction, one or more subject areas, and the generated bridge — and the reader meets those clusters as the..."
spec_meta_version: "0.1.0"
spec_file: "03-categories.md"
order: 3
section: "Meta-Spec"
normative: true
generated_at: "2026-07-11T22:30:17.205Z"
generated_from: "meta-spec/0.1.0/draft/spec/03-categories.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: meta-spec/0.1.0/draft/spec/03-categories.md."
---


A family is more than a flat list of chapters. Its chapters cluster into topics — an introduction, one or more subject areas, and the generated bridge — and the reader meets those clusters as the groups in the left navigation. This chapter specifies the **navigation categories**: the `groups[]` mechanism in a family's `spec-manifest.json` that names those clusters, orders them, and assigns each chapter to one. The categories are data, single-sourced in the family head, so the sidebar, the site, and the bridge hub all group a family the same way without any of them hardcoding the grouping.

---

## The `groups[]` Mechanism

The family manifest ([Per-Chapter Format](/spec/per-chapter-format/)) carries a `groups[]` array. Each group is a category of chapters:

| Field | Meaning |
|-------|---------|
| `id` | A stable, lowercase category key, unique within the family. |
| `label` | The human-readable heading shown in the navigation. |
| `order` | The category's position in the sidebar; groups render in ascending `order`. |
| `pages[]` | The chapter stems (`NN-name`, without `.md`) that belong to this category, in reading order. |

A minimal head declares at least an `introduction` group holding `00-overview` and a `bridge` group holding the generated `NN-bridge`. As a family grows, subject groups are added between them.

```jsonc
{
  "namespace": "spec",
  "namespaceToken": "SPEC",
  "groups": [
    { "id": "introduction", "label": "Introduction", "order": 1, "pages": ["00-overview"] },
    { "id": "structure",    "label": "Structure",    "order": 2, "pages": ["02-per-chapter-format", "03-categories", "04-bridge-standard"] },
    { "id": "bridge",       "label": "Bridge",        "order": 5, "pages": ["01-bridge"] }
  ],
  "fallback": "append-by-NN"
}
```

---

## Assignment Rules

Two rules keep grouping unambiguous, and a build **MUST** enforce them:

- **One category per chapter.** A chapter stem appears in exactly one group's `pages[]`. A chapter listed in two groups is a conflict and **MUST fail the build** — the grouping is never resolved by an arbitrary pick.
- **Fallback is explicit, not silent.** A chapter present on disk but absent from every group's `pages[]` is stamped into the family's **first group**, with a warning — a named, warned degradation, never a silent drop, so an unlisted chapter surfaces in review rather than disappearing from the navigation. The family's declared `fallback` (default `append-by-NN`) governs a separate concern: how an unknown *group key* is ordered relative to the declared groups (appended by its number), not where an unlisted *page* lands.

Category `order` is independent of chapter number. The generated bridge is conventionally the **last** category even though its chapter number may be low, and a subject group may gather chapters whose numbers are not contiguous. Ordering the navigation by category rather than by raw file number is deliberate: it lets a family regroup its reading path without renumbering, and it keeps published slugs — which are number-independent ([Per-Chapter Format](/spec/per-chapter-format/)) — stable across a regroup.

---

## Single-Source, Read by Three Consumers

The categories are declared **once**, in the family's `spec-manifest.json`, and read by three independent consumers that **MUST NOT** re-declare them:

| Consumer | Use |
|----------|-----|
| Manifest build | Stamps each chapter's `sidebar_group` from the group whose `pages[]` lists it; an unlisted chapter falls back to the first group, warned. |
| Published site | Reads the same manifest to order and label the left navigation, so the site's sidebar and the spec's declared groups can never drift. |
| Bridge hub | Groups its per-chapter coverage blocks under the same category headings, mirroring the sidebar ([The Bridge Standard](/spec/bridge-standard/)). |

Having one declaration read by all three is the point: an earlier design duplicated the grouping as a hardcoded map inside each consumer, and the copies drifted. The rule is that a family's grouping lives in its head and nowhere else — the `spec.json` **MAY** carry a parallel sidebar-metadata view for a viewer that consumes it, but that view is derived from the same category set, and the `bridge` group is conventionally omitted from it because a viewer surfaces authored chapters, not the generated hub.

---


## Conformity Requirements

```requirement
{
  "id": "SPEC-REQ-005",
  "title": "One category per chapter, explicit fallback",
  "statement": "Every chapter stem MUST appear in exactly one group's `pages[]`. A stem listed in two groups MUST fail the build. A chapter present on disk but absent from every group is assigned to the family's first group with a warning — never silently dropped.",
  "scope": { "repos": [], "categories": ["spec"], "tags": ["spec-categories"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No chapter stem appears in more than one group's pages[]",
      "An unlisted on-disk chapter is stamped into the first group and a warning is emitted"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./02-per-chapter-format.md](/spec/per-chapter-format/) — the family head that carries the `groups[]` array.
- [./04-bridge-standard.md](/spec/bridge-standard/) — the bridge hub that mirrors these categories in its coverage view.
- [./00-overview.md](/spec/overview/) — the meta-specification entry point.
