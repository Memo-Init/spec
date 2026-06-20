---
title: "Knowledge Format — OKF Conformance"
description: "The project wiki under `.wiki/` is a **knowledge bundle**: a directory of Markdown pages with YAML frontmatter, cross-linked into a portable graph. This chapter declares that bundle **conformant to..."
spec_version: "0.1.0"
spec_file: "02-knowledge-format-okf.md"
order: 2
section: "Workbench"
normative: true
generated_at: "2026-06-20T12:43:33.617Z"
generated_from: "spec/workbench/02-knowledge-format-okf.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/02-knowledge-format-okf.md."
---


The project wiki under `.wiki/` is a **knowledge bundle**: a directory of Markdown pages with YAML frontmatter, cross-linked into a portable graph. This chapter declares that bundle **conformant to the Open Knowledge Format (OKF)** — an open specification, Apache-2.0, that formalizes the same LLM-maintained-wiki pattern the wiki already implements. Conformance is declared as a **non-destructive superset**: the wiki keeps its richer frontmatter and adds nothing the format forbids. Nothing here changes that `context/` is the primary, immutable source (see [01-project-structure.md](/specification/project-structure/)); OKF is a presentation and interchange label on the *generated* wiki, never a replacement for the sources it is distilled from.

---

## Why OKF, and Why It Costs Nothing

OKF requires exactly one frontmatter field — `type` — and ordinary Markdown links between pages. The wiki already satisfies both: every generated page carries `type`, and cross-references are standard Markdown links (no Obsidian `[[wikilink]]` syntax). The wiki's frontmatter is in fact *richer* than OKF asks for: it adds `title`, `created`/`updated`, `sources[]` (provenance), `status`, and `tags`. OKF is explicit that a consumer **MUST** preserve unknown keys and **SHOULD NOT** reject documents carrying them. The richer fields are therefore valid **OKF extension keys** — they survive a round-trip through any conformant tool untouched.

The practical consequence is that adopting OKF is **additive**: declare conformance, make three small alignments, and keep every existing field. No field is deprecated, and no information is lost.

---

## The Knowledge Bundle

A wiki bundle is an OKF **Knowledge Bundle**: a directory tree where each non-reserved `.md` file is one concept document and the directory hierarchy expresses grouping. Two properties carry over from OKF and **MUST** hold:

- **Path is identity.** A concept's id is its file path minus the `.md` suffix (`pages/concepts/strands.md` → `pages/concepts/strands`). There are no naming rules beyond the `.md` suffix and the reserved filenames below.
- **The graph is pages plus links.** Concepts are nodes; ordinary Markdown links are the edges. Links are **untyped** — the nature of a relationship is stated in the surrounding prose, not encoded in the link.

---

## The Three Alignments

Declaring conformance requires three small changes to the bundle's shape. They are the entire delta between the wiki as built and an OKF-conformant bundle.

- **(a) `index.md` carries no concept frontmatter.** OKF reserves `index.md` (and `log.md`) as structural files that **MUST NOT** be used as concept documents, and `index.md` **MUST NOT** carry concept frontmatter (`title`, `type`, `sources`, and the rest). The wiki's `index.md` is a catalog — a grouped list of links with short descriptions — and stays exactly that. The single permitted exception is the bundle-root marker described in (c).
- **(b) Link convention is declared OKF-conformant.** OKF recommends bundle-absolute links (`/pages/concepts/strands.md`) for stability under moves and permits relative links. The wiki uses standard relative Markdown links (`../concepts/strands.md`); this chapter declares that form **OKF-conformant**. Either form is acceptable; the binding rule is that links are ordinary Markdown, never a wiki-specific dialect.
- **(c) `okf_version` marks the bundle root.** The bundle-root `index.md` **MAY** carry a minimal frontmatter block containing the single key `okf_version` — the one place OKF allows a frontmatter-like marker on a reserved file, and the only frontmatter key permitted on any `index.md`. The wiki sets it to the current OKF version. The literal version number is recorded in the refs data, not hardcoded in prose (see [00-overview.md](/specification/overview/) on independent versioning).

---

## Extension Keys — Nothing Is Given Up

Every frontmatter field beyond `type` is retained as an **OKF extension key**:

| Field | Role under OKF |
|-------|----------------|
| `type` | OKF's single REQUIRED field — present on every concept page. |
| `title` | Extension key (maps to OKF's RECOMMENDED `title`). |
| `created`, `updated` | Extension keys (OKF has one optional `timestamp`; the wiki keeps both). |
| `sources[]` | Extension key — provenance the wiki adds and OKF does not standardize. |
| `status` | Extension key (`current` / `stale` / `stub`). |
| `tags` | Extension key (maps to OKF's RECOMMENDED `tags`). |

A conformant external consumer reads `type` and the links and ignores the rest without error; the wiki's own tooling reads all of it. This is the superset in one line: **OKF-conformant on the surface OKF cares about, richer underneath.**

---

## Two Layers: Permissive Outward, Strict Inward

OKF defines a **permissive consumer** — it tolerates broken links, missing optional fields, an absent `index.md`, and unknown `type` values rather than rejecting a bundle. That tolerance is the right posture for *interchange* between tools and organizations. It is **not** the posture for the wiki's own upkeep, where form strictness is what makes staleness and inconsistency detectable (the principle inherited from the contamination/handover concern, see [09-contamination-context-handover.md](../v0.1.0/09-contamination-context-handover.md)).

These two postures do not conflict; they are two layers. Outward, the bundle is a permissively-consumable OKF artifact. Inward, `wiki-lint` enforces a stricter contract. The strict inward check is specified next.

---

## The `wiki-lint` Conformance Check

`wiki-lint` carries an **OKF-conformance check** in addition to its structural and content checks. It is strict (severity Error for the binding rules) precisely because it runs *inward*:

- **`type` present.** Every concept page under `pages/` **MUST** carry a `type` frontmatter field — the one rule a bundle cannot drop and stay conformant.
- **`index.md` concept-frontmatter-free.** The reserved `index.md` files **MUST NOT** carry concept frontmatter; the bundle-root `index.md` **MAY** carry only the `okf_version` key (alignments (a) and (c)). Any other frontmatter key on an `index.md` is an error.
- **Links resolve.** Intra-bundle Markdown links **MUST** point at existing files. Where an external OKF consumer would tolerate a broken link, the wiki's own lint does not.
- **`okf_version` present (advisory).** The bundle-root `index.md` SHOULD declare `okf_version`; its absence is reported as information, not an error.

A bundle that passes these checks is, by construction, an OKF-conformant knowledge bundle that any permissive OKF consumer — for example a static graph visualizer that needs only `type` and the link graph — can read.

---

## What This Is Not

- **Not a replacement for `context/`.** The sources stay primary and immutable; the wiki is the generated, present-tense view, and OKF is a label on that view (see [01-project-structure.md](/specification/project-structure/) and [26-memo-history.md](../v0.1.0/26-memo-history.md) for the wiki-vs-history boundary).
- **Not a new storage or runtime.** OKF prescribes no database, server, agent framework, or SDK. Conformance is a documentation-and-shape contract, nothing more.
- **Not a migration of existing bundles.** Adoption is additive. An existing wiki becomes conformant on its next `wiki-ingest` rebuild, which produces a frontmatter-free `index.md` with the `okf_version` marker; no destructive rewrite is forced.

---

## Related

- [00-overview.md](/specification/overview/) — the workbench sub-spec and its independent versioning, where the format version is read from refs data.
- [01-project-structure.md](/specification/project-structure/) — `.wiki/` as an optional per-project bundle, and `context/` as the primary immutable source.
- [24-tools-registry.md](../v0.1.0/24-tools-registry.md) — the wiki as a present-tense query tool, the concern distinct from its on-disk format.
- [26-memo-history.md](../v0.1.0/26-memo-history.md) — why the wiki answers in the present tense and the history carries the chronology.
- [06-trash.md](/specification/trash/) — superseded wiki pages are trashed, not deleted.
