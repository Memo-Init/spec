---
title: "The Bridge Standard"
description: "Every family carries one generated chapter that is not authored prose: the **bridge**. The bridge maps each specification chapter to the skills that implement it, so a reader can see which parts of..."
spec_meta_version: "0.1.0"
spec_file: "04-bridge-standard.md"
order: 4
section: "Meta-Spec"
normative: true
generated_at: "2026-07-02T13:49:37.873Z"
generated_from: "draft/spec/0.1.0/spec/04-bridge-standard.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/spec/0.1.0/spec/04-bridge-standard.md."
---


Every family carries one generated chapter that is not authored prose: the **bridge**. The bridge maps each specification chapter to the skills that implement it, so a reader can see which parts of the workflow are covered, which skill to reach for, and where a chapter has nothing built against it yet. This chapter specifies the bridge as a standard — what a bridge page contains, what it deliberately does *not* publish, and how the authored source and the generated projection are kept apart. The family bridge hubs (this family's [01-bridge](/spec/bridge/), and the memo, workbench, and session bridges) are generated instances of this standard; the standard is authored here, the instances are regenerated on every build.

The bridge is a **read-projection** of a single edge — the skill-to-spec map — and nothing else is a second source of truth. It is regenerated deterministically; it is never hand-edited.

The map is authored data, not generated: it lives at `draft/<family>/<version>/data/skill-spec-map.json` ([Per-Chapter Format](/spec/per-chapter-format/)). Its minimal schema is one entry per implementing skill, each carrying the chapter stem it implements, a `roleHint` of `primary` or `contributor`, and a one-line `purpose`; an entry **MAY** additionally carry an internal `gaps` note and a `visibility` marker. The stem-to-skill edges are the whole public projection; the `gaps` and `visibility` fields are internal and never published (see *What the Bridge Does Not Publish* below, and [The Publishing Principle](/spec/publishing-principle/)).

---

## The Public Projection

For each non-bridge chapter the bridge derives a record and renders the reader-facing subset of it. The published fields are, in full, these **six**:

| Field | Content |
|-------|---------|
| **SOP anchor** | The family's canonical entry chapter — where a reader starts. |
| **Public entry points** | The skills a reader invokes to enter this chapter's workflow (flagged, else inferred from the primary owners and marked *inferred*), plus the family's canonical docs entry. |
| **Required detail pages** | The chapter's own `Depends on` / `Related` links — the pages to read next. |
| **Implementing skills** | Every skill that implements the chapter, named in full, split into primary owner and contributing skills, each with a one-line purpose. An empty list is rendered honestly as "nothing built yet". |
| **Grading assignment** | The skill that grades the chapter's work, where one exists. |
| **Acknowledged internal tooling** | Skills that touch the chapter but are internal (out of public scope) — listed openly, never silently dropped. |

The bridge hub gathers these per-chapter records into a family overview: a coverage summary (a raw count of how many chapters have an implementer — an `n of m` figure, never a percentage or a coverage classification, [The Publishing Principle](/spec/publishing-principle/)), a by-skill view (which chapters each skill depends on, grouped by namespace), the per-chapter blocks **grouped by the navigation categories** ([Navigation Categories](/spec/categories/)), and a graph view of the skills' declared dependency edges. The whole family stays legible from this one page.

A family bridge therefore renders in **two forms**, both generated from the same map: the family **hub page** — the reserved `NN-bridge` chapter ([01-bridge](/spec/bridge/)) that carries the overview, the views, and every per-chapter block — and the **per-chapter backlink** materialized into `dist/<family>/<version>/bridge/<stem>.backlink.md`, projected onto each authored chapter through its placeholder. The hub is the family-wide view; the backlink is the single-chapter view.

---

## What the Bridge Does Not Publish

Two fields are computed on the internal record but **MUST NOT** be rendered on the public bridge page or the published inverted map:

- **The gaps roll-up** — where a skill's capability runs ahead of what a chapter specifies. This is *our internal interpretation* of the delta between skill and spec, not a fact about the published specification.
- **The provenance hash** — an internal idempotency and drift marker.

These are withheld for a principled reason, not an incidental one: they are internal interpretation and classification of the generated spec, and internal interpretation is private ([The Publishing Principle](/spec/publishing-principle/)). The provenance hash is still computed on the record — it drives idempotency and the *internal* inverted map — but it **MUST NOT** appear in any **published** artifact: neither displayed on the public bridge page nor carried as a field in the published `dist/<family>/<version>/inverted-map.json`. "Rendered" here means both surfaces — the human-readable page and the machine-readable JSON — and a leak assertion in the bridge inverse gate checks both. The rule is direction, not secrecy: a reader outside the project does not share the context that makes a gaps note meaningful, so publishing it would leak inward calibration onto an outward page.

An **empty** implementer list, by contrast, is always shown — "nothing built against this chapter yet" is an honest public fact about coverage, not internal interpretation.

---

## Authored Source Versus Generated Projection

The bridge keeps a strict boundary between what an author writes and what the build derives:

- **The bridge chapter itself is generated.** Its `NN-bridge` file is reshaped on every build from the skill-to-spec map. An author does not edit it; the reserved `NN-bridge` name ([Per-Chapter Format](/spec/per-chapter-format/)) marks it.
- **The per-chapter "Implemented by" backlink is generated into the dist, not the source.** Each authored chapter carries only a placeholder marker above its `## Related` section; the rendered backlink block lives in `dist/<family>/<version>/bridge/<stem>.backlink.md`. A source chapter that carries a full backlink block instead of the placeholder, or that is missing the placeholder, is a violation — the authored-versus-derived split is checked in both directions.
- **The projection is verified against the map.** A dedicated inverse gate asserts, for every non-bridge chapter, that the rendered backlink, the materialized per-page bridge, and the published inverted map each list exactly the map's implementer set. Any divergence — a stale backlink, a missing page, a drifted map — is a hard failure. The gate regenerates nothing; it only reads, so injected drift surfaces instead of being silently repaired.

This is why the bridge can be trusted as a coverage view: it is not maintained by hand, it is projected from one edge, and the projection is gated against that edge on every build.

---

## Leak Safety

Because the bridge pulls free text (a skill's one-line purpose) out of skill definitions, the generator neutralizes outward-facing leak patterns — internal references, absolute paths, internal codes — before rendering, so an inward instance never reaches a published page. The bridge is an outward-facing artifact and is held to the same review as any other ([/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/)).

---


## Conformity Requirements

```requirement
{
  "id": "SPEC-REQ-006",
  "title": "The public bridge does not leak internal fields",
  "statement": "The gaps roll-up and the provenance hash are internal interpretation and MUST NOT appear in any published bridge artifact — neither on the public bridge page nor as a field in the published `dist/<family>/<version>/inverted-map.json`. A leak assertion in the bridge inverse gate MUST verify both surfaces. An empty implementer list, by contrast, is always shown honestly.",
  "scope": { "repos": [], "categories": ["spec"], "tags": ["spec-bridge", "spec-publishing"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No published bridge page renders a gaps roll-up or a provenance hash",
      "The published inverted-map.json carries no provenance field",
      "A chapter with zero implementers renders 'nothing built yet' rather than being omitted"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./01-bridge.md](/spec/bridge/) — this family's generated bridge hub, an instance of the standard specified here.
- [./03-categories.md](/spec/categories/) — the navigation categories the bridge hub mirrors in its per-chapter view.
- [./05-publishing-principle.md](/spec/publishing-principle/) — why the gaps roll-up and provenance are withheld: internal interpretation is private.
- [/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/) — the outward-facing review the bridge, as a published artifact, must pass.
