---
title: "Knowledge Format — OKF Conformance"
description: "OKF is **one of the wiki's storage formats** — it sits under the wiki ([30-wiki.md](./30-wiki.md)), the entry point that reads the project's knowledge regardless of the form it is stored in,..."
workbench_version: "0.3.0"
spec_file: "13-knowledge-format-okf.md"
order: 13
section: "Workbench"
normative: true
generated_at: "2026-07-17T23:43:43.034Z"
generated_from: "workbench/0.3.0/draft/spec/13-knowledge-format-okf.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: workbench/0.3.0/draft/spec/13-knowledge-format-okf.md."
---


OKF is **one of the wiki's storage formats** — it sits under the wiki ([30-wiki.md](/workbench/wiki/)), the entry point that reads the project's knowledge regardless of the form it is stored in, alongside the `design.md` convention ([18-design.md](/workbench/design/)). It is not a standalone discovery concept; this chapter is its format reference.

OKF (the Open Knowledge Format) is the **storage format** the workbench uses for knowledge bundles — a directory of Markdown pages with YAML frontmatter, cross-linked into a portable graph. Two bundles use it: the project wiki under `.wiki/` (the entry point, [30-wiki.md](/workbench/wiki/)) and the project architecture under `context/architecture-okf/` (the repo graph, [41-project-architecture.md](/workbench/project-architecture/)). This chapter is the **format reference**: it declares those bundles **conformant to OKF** — an open specification, Apache-2.0 — as a **non-destructive superset** that keeps richer frontmatter and adds nothing the format forbids. It is a format detail, not a headline: a reader understands "the wiki" and "the project architecture" as concepts in their own chapters, and comes here only for the on-disk encoding. Nothing here changes that `context/` is the primary, immutable source (see [11-project-structure.md](/workbench/project-structure/)); OKF is a presentation and interchange label on the *generated* bundle, never a replacement for the sources it is distilled from.

---

## Scope — Opt-In, Not a Mandate

**OKF is opt-in per sub-folder; the default for a folder is plain Markdown.** OKF is **not** a `context/`-wide mandate: exactly two bundles adopt it — `.wiki/` and `context/architecture-okf/` — and every other `context/` sub-folder stays plain Markdown ([16-context.md](/workbench/context/)). The opt-in is concrete rather than only prose: the per-folder OKF convention is bound through `.workbench/folder-lints.json` ([22-config.md](/workbench/config/)), **scoped to those two folders only**. Opt-in is the *presence* of that binding; the absence of any such binding elsewhere is what keeps OKF from spreading across the rest of `context/`.

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
- **(c) `okf_version` marks the bundle root.** The bundle-root `index.md` **MAY** carry a minimal frontmatter block containing the single key `okf_version` — the one place OKF allows a frontmatter-like marker on a reserved file, and the only frontmatter key permitted on any `index.md`. The wiki sets it to the current OKF version. The literal version number is recorded in the refs data, not hardcoded in prose (see [00-overview.md](/workbench/overview/) on independent versioning).

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

OKF defines a **permissive consumer** — it tolerates broken links, missing optional fields, an absent `index.md`, and unknown `type` values rather than rejecting a bundle. That tolerance is the right posture for *interchange* between tools and organizations. It is **not** the posture for the wiki's own upkeep, where form strictness is what makes staleness and inconsistency detectable (the principle inherited from the contamination/handover concern, see [09-contamination-context-handover.md](/specification/contamination-context-handover/)).

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

- **Not a replacement for `context/`.** The sources stay primary and immutable; the wiki is the generated, present-tense view, and OKF is a label on that view (see [11-project-structure.md](/workbench/project-structure/) and [26-memo-history.md](/specification/memo-history/) for the wiki-vs-history boundary).
- **Not a new storage or runtime.** OKF prescribes no database, server, agent framework, or SDK. Conformance is a documentation-and-shape contract, nothing more.
- **Not a migration of existing bundles.** Adoption is additive. An existing wiki becomes conformant on its next `wiki-ingest` rebuild, which produces a frontmatter-free `index.md` with the `okf_version` marker; no destructive rewrite is forced.

---

## Conformity Requirements

The inward OKF-conformance check is the strict layer, and its rules are file-level facts. They apply to **every** OKF-adopting bundle, not only the wiki: per [16-context.md](/workbench/context/) (REQ-958), OKF is adopted by exactly two folders — the project wiki **and** the `architecture-okf/` sub-folder of `context/` — so the conformance rules below MUST reach **both** bundles, and neither may be left silently un-checked. The blocks below encode this chapter's binding `MUST`s prose-first — each `statement` faces how a knowledge bundle is generated, each `check` faces the bundle on disk. They are the source the requirement store is harvested from ([23-requirements.md](/specification/requirements/)).

The one rule a bundle cannot drop and stay conformant is a hard yes/no fact:

```requirement
{
  "id": "REQ-976",
  "title": "Every concept page carries a type frontmatter field",
  "statement": "Every concept page under `pages/` of an OKF knowledge bundle MUST carry a `type` frontmatter field — OKF's single required field, the one rule a bundle cannot drop and stay conformant. A page's id is its file path minus the `.md` suffix; there are no naming rules beyond the suffix and the reserved filenames.",
  "scope": { "repos": [], "categories": ["wiki", "workbench"], "tags": ["okf", "wiki-lint", "frontmatter"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each non-reserved `.md` page under `pages/` carries a `type` frontmatter field"
    ]
  },
  "grade": "binary"
}
```

The reserved files carry no concept frontmatter, with one permitted marker — a hard yes/no over each `index.md`:

```requirement
{
  "id": "REQ-977",
  "title": "Reserved index.md files carry no concept frontmatter",
  "statement": "The reserved `index.md` (and `log.md`) files MUST NOT be used as concept documents and MUST NOT carry concept frontmatter (`title`, `type`, `sources`, and the rest). The single permitted exception is the bundle-root `index.md`, which MAY carry only the `okf_version` key; any other frontmatter key on an `index.md` is an error.",
  "scope": { "repos": [], "categories": ["wiki", "workbench"], "tags": ["okf", "wiki-lint", "reserved-files"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No `index.md` carries concept frontmatter",
      "The bundle-root `index.md` carries at most the single `okf_version` key"
    ]
  },
  "grade": "binary"
}
```

Intra-bundle link resolution is a hard yes/no the strict inward lint enforces where a permissive consumer would not:

```requirement
{
  "id": "REQ-978",
  "title": "Intra-bundle Markdown links resolve to existing files",
  "statement": "Intra-bundle Markdown links MUST point at existing files. Where an external, permissive OKF consumer would tolerate a broken link, the wiki's own inward lint does not — a dangling intra-bundle link is an error. Links MUST be ordinary Markdown (relative or bundle-absolute), never a wiki-specific dialect.",
  "scope": { "repos": [], "categories": ["wiki", "workbench"], "tags": ["okf", "wiki-lint", "links"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Every intra-bundle Markdown link target exists",
      "No link uses a non-Markdown wiki dialect"
    ]
  },
  "grade": "binary"
}
```

The bundle-root version marker is advisory, so its absence is information rather than an error:

```requirement
{
  "id": "REQ-979",
  "title": "The bundle root declares okf_version (advisory)",
  "statement": "The bundle-root `index.md` SHOULD declare `okf_version`, set to the current OKF version read from the refs data rather than hardcoded in prose. Its absence is reported as information, not an error — the marker is the one frontmatter-like key OKF permits on a reserved file.",
  "scope": { "repos": [], "categories": ["wiki", "workbench"], "tags": ["okf", "wiki-lint", "version"] },
  "severity": "info",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The bundle-root `index.md` declares an `okf_version` key, or its absence is reported as information"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [00-overview.md](/workbench/overview/) — the workbench spec and its independent versioning, where the format version is read from refs data.
- [11-project-structure.md](/workbench/project-structure/) — `.wiki/` as an optional per-project bundle, and `context/` as the primary immutable source.
- [41-project-architecture.md](/workbench/project-architecture/) — the project-architecture bundle, the other consumer of this format (concept first, OKF as encoding).
- [30-wiki.md](/workbench/wiki/) — the wiki entry point, the **parent category** under which OKF is one storage format; also the format's primary consumer.
- [18-design.md](/workbench/design/) — `design.md`, the wiki's other storage format alongside OKF.
- [16-context.md](/workbench/context/) — `context/`, where OKF is opt-in for the `architecture-okf/` sub-folder and plain Markdown is the default elsewhere.
- [22-config.md](/workbench/config/) — `.workbench/folder-lints.json`, the binding that scopes the OKF convention to `.wiki/` and `architecture-okf/` only.
- [24-tools-registry.md](/specification/tools-registry/) — the wiki as a present-tense query tool, the concern distinct from its on-disk format.
- [26-memo-history.md](/specification/memo-history/) — why the wiki answers in the present tense and the history carries the chronology.
- [32-trash.md](/workbench/trash/) — superseded wiki pages are trashed, not deleted.
