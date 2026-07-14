---
title: ".wiki/"
description: "The wiki is the project's **discovery system** — the **entry point**, the single bottleneck through which a memo reaches everything the project knows. A project accumulates far more than any one memo..."
workbench_version: "0.2.0"
spec_file: "30-wiki.md"
order: 30
section: "Workbench"
normative: true
generated_at: "2026-07-14T17:47:27.309Z"
generated_from: "workbench/0.2.0/draft/spec/30-wiki.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: workbench/0.2.0/draft/spec/30-wiki.md."
---


The wiki is the project's **discovery system** — the **entry point**, the single bottleneck through which a memo reaches everything the project knows. A project accumulates far more than any one memo holds: the structured project architecture, and a long tail of unstructured material — research piles, `context/` documents, finalized decisions, the present-tense understanding distilled from all of it. The wiki is how a memo asks the workbench *what it already knows* instead of rediscovering it, and it answers regardless of the form the underlying knowledge takes. This chapter frames the wiki as that entry point; the **storage formats** it reads through — OKF and `design.md` — are listed below.

---

## Folder Contract

`.wiki/` is a **reserved, default-on** custom folder — present in every project like `.memo/`, not an opt-in extra — and this page is its per-folder entry:

```folder
{
  "name":       ".wiki/",
  "status":     "reserved-default-on",
  "level":      "project",
  "entryPoint": "index.md (published as \"overview\")",
  "convention": "OKF",
  "purpose":    "LLM-generated project wiki, an OKF-conformant knowledge bundle; reserved default-on, present in every project.",
  "goesIn":     "The generated wiki pages (OKF nodes + untyped links), including the index.md entry point published as \"overview\".",
  "doesNot":    "A second, drifting copy of the architecture graph (the wiki points at context/architecture-okf/, never copies it); the chronicle / timeline.",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](/workbench/folders/)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## Storage Formats

The wiki is the entry point that reads the project's knowledge **regardless of the form it is stored in**. It supports more than one storage format, and a query is answered the same way no matter which format holds the underlying knowledge:

| Storage format | What it stores | Reference |
|----------------|----------------|-----------|
| **OKF** (Open Knowledge Format) | the structured knowledge bundles — the wiki's own pages and the project architecture graph (nodes + untyped links) | [13-knowledge-format-okf.md](/workbench/knowledge-format-okf/) |
| **design.md** | the design format — a project's design intent and decisions in prose | [18-design.md](/workbench/design/) |

These formats sit **under** the wiki: they are the on-disk encodings the wiki reads, not separate discovery systems of their own. A reader reaches them *through* the wiki — ask the wiki, and it returns the current answer whether that answer was distilled from an OKF bundle or a `design.md`. New storage formats can be added under the same entry point without changing how a memo asks its question.

---

## The Bottleneck Over Everything

Two kinds of knowledge sit beneath the wiki, and the wiki is the entry point over **both**:

| Layer | What | Form |
|-------|------|------|
| **Structured** | the project architecture — which repos exist, how they connect ([41-project-architecture.md](/workbench/project-architecture/)) | OKF nodes + edges |
| **Unstructured** | research piles, `context/` files, distilled decisions — everything else the project holds | any form; the wiki categorizes and files it |

The user does not care which form a piece of knowledge is in — the wiki finds it. That is the whole point of a single entry point: knowledge is reached *through the wiki*, not by knowing in advance where each kind of thing lives.

---

## Indexes the Architecture, Does Not Copy It

The architecture is one of the things the wiki knows about, but the wiki **points at it, it does not duplicate it**. The wiki's index carries an entry that refers to the architecture bundle (`context/architecture-okf/`); the bundle stays the single source of truth, and the wiki never holds a second, drifting copy of the repo graph. This is the same no-copy rule the tools registry follows ([24-tools-registry.md](/specification/tools-registry/)): a reference whose target owns the content, so an update changes one place. A deterministic consumer that needs the architecture follows the pointer to `memo architecture locate`; a human or agent browsing the wiki follows the same pointer by hand.

---

## Present Tense, Not Chronology

The wiki answers in the **present tense**: a wiki page states what is understood to be true *now*, and a query returns the current consolidated understanding, optimized for fast answers. What the wiki is **not** is the timeline of how that understanding was reached — that is the chronicle ([26-memo-history.md](/specification/memo-history/)). The wiki gives the current answer; the chronicle gives the provenance and the order of change. A memo that asks "what does the project know about X right now?" reaches for the wiki; one that asks "does a conclusion from an earlier memo still hold?" reaches for the chronicle. Keeping the two distinct stops the wiki's convenience from being mistaken for an audit trail.

---

## Wiki for All, Enforced Architecture for Internal

The wiki is the **universal** entry point, but the structured architecture beneath it is not universally required. Because every project has a wiki, `.wiki/` is a **reserved, default-on** folder — present by default like `.memo/`, not an opt-in optional folder ([12-folders.md](/workbench/folders/)). This resolves the older tension in which the contract called `.wiki/` *optional* while this chapter called it universal: the universal intent wins, and the folder's status now matches it.

- **Every project** — internal or foreign — gets a wiki, because every project has unstructured knowledge worth categorizing and querying. The wiki is the entry point for all of them.
- **Only internal projects** are expected to carry a full project architecture beneath the wiki. A foreign, research-heavy project (piles of material, little repo structure of its own) uses the wiki for its unstructured data and is **not** forced into a complex architecture bundle — its absence is an accepted state, not a failure ([41-project-architecture.md](/workbench/project-architecture/)).

So "the wiki finds everything" holds for all projects; "the project has a structured architecture" holds for the internal ones.

---

## Keeping the Wiki Fresh — Two Triggers

The wiki is kept current by **two complementary triggers**, one at write time and one periodic:

- **Ingest at landing.** When a memo lands, its new knowledge is folded into the wiki (the ingest step of landing). This keeps the wiki current as the project produces knowledge, at the moment the knowledge is finalized.
- **Stale flag on the maintenance board.** Periodically, the maintenance discipline ([26-memo-history.md](/specification/memo-history/) and the maintenance chapter) flags wiki pages that have drifted from their sources, so staleness that accrues between landings is still caught.

Write-time freshness keeps the wiki growing correctly; periodic staleness detection catches the decay that write-time cannot see. Together they keep the entry point trustworthy.

---

## The About Convention

The wiki's discovery reach extends to the project's **scripts**. When something is written into a `scripts/` subfolder, that subfolder **SHOULD** carry an **`About`** — a short description of what the folder is for — and that `About` is **ingested into the wiki**. This is the third ingest source, alongside landing-time ingest and periodic staleness detection.

The convention closes a loop with the meaningful-subfolder rule ([20-cli.md](/workbench/cli/)): a scripts subfolder already carries its meaning in its name; the `About` records that meaning in prose, and ingesting it means the wiki can **answer** for what a scripts folder does rather than leaving a reader to infer it from the name alone. The effect is that the discovery system reaches the project's operational scripts the same way it reaches its research and architecture — ask the wiki, and the answer is there.

---

## Configurable Sources — the `wiki-source` Key

Which folders feed the wiki is a **configuration**, not a hardcoded list. A reserved `wiki-source` key declares the set of source stores the wiki ingests, so a project tunes what its discovery system draws on rather than accepting a fixed set baked into the ingest tool.

- **A default set, deliberately chosen.** By default the wiki draws on the project's **present-state boards** — the chronicle (`chronic/`), the maintenance board (`maintenance/`), and the goals board (`goals/`) — alongside the authored `context/` material and the `scripts/` `About` reach already described. These are the stores whose *current* state is worth surfacing through a present-tense entry point.
- **The memo store is not a default source.** The `.memo/` memo store is **excluded** from the default set: a finalized memo is a point-in-time, chronological record, and scraping the memo folder in bulk pulls stale, superseded detail into a present-tense wiki. A memo's *distilled* knowledge still reaches the wiki through **landing-time ingest** ([Keeping the Wiki Fresh](#keeping-the-wiki-fresh--two-triggers)) when it is finalized; what the default drops is treating the memo folder itself as a standing source. A project that wants the memo store in its wiki **MAY** add it to `wiki-source` explicitly.
- **Declared as project policy, read at ingest.** `wiki-source` is a project-level setting — the source stores named as data the ingest reads, the same declare-then-read discipline the folder and config chapters follow ([22-config.md](/workbench/config/)). Reading the key at ingest time is downstream tooling work; this chapter fixes the key, its default set, and the memo-store exclusion.

The `chronic/` source is read for its **current** content, not as a second chronicle: the wiki still answers in the present tense ([Present Tense, Not Chronology](#present-tense-not-chronology)), and the chronicle remains the authoritative timeline ([26-memo-history.md](/specification/memo-history/)). `wiki-source` decides *what the wiki draws on*; it does not blur the wiki/chronicle distinction.

---

## Conformity Requirements

The wiki's no-copy and ingest rules are checkable against its index. The blocks below encode this chapter's binding rules prose-first — each `statement` faces how the wiki indexes and ingests, each `check` faces the built index. They are the source the requirement store is harvested from ([23-requirements.md](/specification/requirements/)).

That the wiki points at the architecture rather than copying it is the no-copy rule, judged against the index:

```requirement
{
  "id": "REQ-974",
  "title": "The wiki points at the architecture, never duplicates it",
  "statement": "The wiki MUST index the project architecture by reference — its index carries a pointer to the architecture bundle (`context/architecture-okf/`), and the bundle stays the single source of truth. The wiki MUST NOT hold a second, drifting copy of the repo graph; a deterministic consumer follows the pointer to the architecture resolver rather than reading a wiki-held copy.",
  "scope": { "repos": [], "categories": ["wiki"], "tags": ["wiki", "no-copy", "architecture"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A reviewer inspects the wiki index's architecture entry. PASS when it is a pointer to the architecture bundle and holds no copy of the repo graph; BLOCKED when the wiki embeds a second copy of the nodes/edges; INCONCLUSIVE when the project has no architecture bundle to index.",
    "verify": [
      "Locate the wiki index entry for the architecture",
      "Confirm it references the bundle and holds no duplicated graph"
    ]
  },
  "grade": { "dimension": "no-copy adherence", "weight": 100 }
}
```

That a scripts subfolder's `About` is ingested into the wiki is a structural fact about the index:

```requirement
{
  "id": "REQ-975",
  "title": "A scripts subfolder's About is ingested into the wiki",
  "statement": "When something is written into a `scripts/` subfolder, that subfolder SHOULD carry an `About` — a short description of what the folder is for — and that `About` MUST be ingested into the wiki, so the discovery system can answer for what a scripts folder does rather than leaving a reader to infer it from the name. This is the third ingest source, alongside landing-time ingest and periodic staleness detection.",
  "scope": { "repos": [], "categories": ["wiki"], "tags": ["wiki", "about", "scripts"] },
  "severity": "info",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each `scripts/` subfolder carrying an `About` is represented in the wiki index",
      "The ingested entry reflects the subfolder's `About` description"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [41-project-architecture.md](/workbench/project-architecture/) — the structured layer the wiki indexes and points at.
- [13-knowledge-format-okf.md](/workbench/knowledge-format-okf/) — OKF, a storage format under the wiki: the on-disk format of both the wiki's pages and the architecture bundle.
- [18-design.md](/workbench/design/) — `design.md`, the design format; a storage format the wiki reads through.
- [24-tools-registry.md](/specification/tools-registry/) — the registry where the wiki is recorded as a tool with a `location` pointer, never a copy.
- [26-memo-history.md](/specification/memo-history/) — the chronicle, the present-tense wiki's chronological counterpart.
