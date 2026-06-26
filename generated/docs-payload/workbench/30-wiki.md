---
title: "The Wiki — Entry Point"
description: "The wiki is the project's **discovery system** — the **entry point**, the single bottleneck through which a memo reaches everything the project knows. A project accumulates far more than any one memo..."
workbench_version: "0.1.0"
spec_file: "30-wiki.md"
order: 30
section: "Workbench"
normative: true
generated_at: "2026-06-26T10:09:30.468Z"
generated_from: "spec/workbench/0.1.0/30-wiki.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/0.1.0/30-wiki.md."
---


The wiki is the project's **discovery system** — the **entry point**, the single bottleneck through which a memo reaches everything the project knows. A project accumulates far more than any one memo holds: the structured project architecture, and a long tail of unstructured material — research piles, `context/` documents, finalized decisions, the present-tense understanding distilled from all of it. The wiki is how a memo asks the workbench *what it already knows* instead of rediscovering it, and it answers regardless of the form the underlying knowledge takes. This chapter frames the wiki as that entry point; the **storage formats** it reads through — OKF and `DESIGN.md` — are listed below.

---

## Storage Formats

The wiki is the entry point that reads the project's knowledge **regardless of the form it is stored in**. It supports more than one storage format, and a query is answered the same way no matter which format holds the underlying knowledge:

| Storage format | What it stores | Reference |
|----------------|----------------|-----------|
| **OKF** (Open Knowledge Format) | the structured knowledge bundles — the wiki's own pages and the project architecture graph (nodes + untyped links) | [13-knowledge-format-okf.md](/specification/knowledge-format-okf/) |
| **DESIGN.md** | the design convention — a project's design intent and decisions in prose | [18-design.md](/specification/design/) |

These formats sit **under** the wiki: they are the on-disk encodings the wiki reads, not separate discovery systems of their own. A reader reaches them *through* the wiki — ask the wiki, and it returns the current answer whether that answer was distilled from an OKF bundle or a `DESIGN.md`. New storage formats can be added under the same entry point without changing how a memo asks its question.

---

## The Bottleneck Over Everything

Two kinds of knowledge sit beneath the wiki, and the wiki is the entry point over **both**:

| Layer | What | Form |
|-------|------|------|
| **Structured** | the project architecture — which repos exist, how they connect ([41-project-architecture.md](/specification/project-architecture/)) | OKF nodes + edges |
| **Unstructured** | research piles, `context/` files, distilled decisions — everything else the project holds | any form; the wiki categorizes and files it |

The user does not care which form a piece of knowledge is in — the wiki finds it. That is the whole point of a single entry point: knowledge is reached *through the wiki*, not by knowing in advance where each kind of thing lives.

---

## The Wiki Indexes the Architecture — It Does Not Copy It

The architecture is one of the things the wiki knows about, but the wiki **points at it, it does not duplicate it**. The wiki's index carries an entry that refers to the architecture bundle (`context/architecture-okf/`); the bundle stays the single source of truth, and the wiki never holds a second, drifting copy of the repo graph. This is the same no-copy rule the tools registry follows ([../../v0.1.0/24-tools-registry.md](/specification/tools-registry/)): a reference whose target owns the content, so an update changes one place. A deterministic consumer that needs the architecture follows the pointer to `memo architecture locate`; a human or agent browsing the wiki follows the same pointer by hand.

---

## Present Tense, Not Chronology

The wiki answers in the **present tense**: a wiki page states what is understood to be true *now*, and a query returns the current consolidated understanding, optimized for fast answers. What the wiki is **not** is the timeline of how that understanding was reached — that is the chronicle ([../../v0.1.0/26-memo-history.md](/specification/memo-history/)). The wiki gives the current answer; the chronicle gives the provenance and the order of change. A memo that asks "what does the project know about X right now?" reaches for the wiki; one that asks "does a conclusion from an earlier memo still hold?" reaches for the chronicle. Keeping the two distinct stops the wiki's convenience from being mistaken for an audit trail.

---

## Every Project Gets a Wiki; Only Internal Projects Get Enforced Architecture

The wiki is the **universal** entry point, but the structured architecture beneath it is not universally required:

- **Every project** — internal or foreign — gets a wiki, because every project has unstructured knowledge worth categorizing and querying. The wiki is the entry point for all of them.
- **Only internal projects** are expected to carry a full project architecture beneath the wiki. A foreign, research-heavy project (piles of material, little repo structure of its own) uses the wiki for its unstructured data and is **not** forced into a complex architecture bundle — its absence is an accepted state, not a failure ([41-project-architecture.md](/specification/project-architecture/)).

So "the wiki finds everything" holds for all projects; "the project has a structured architecture" holds for the internal ones.

---

## Keeping the Wiki Fresh — Two Triggers

The wiki is kept current by **two complementary triggers**, one at write time and one periodic:

- **Ingest at landing.** When a memo lands, its new knowledge is folded into the wiki (the ingest step of landing). This keeps the wiki current as the project produces knowledge, at the moment the knowledge is finalized.
- **Stale flag on the maintenance board.** Periodically, the maintenance discipline ([../../v0.1.0/26-memo-history.md](/specification/memo-history/) and the maintenance chapter) flags wiki pages that have drifted from their sources, so staleness that accrues between landings is still caught.

Write-time freshness keeps the wiki growing correctly; periodic staleness detection catches the decay that write-time cannot see. Together they keep the entry point trustworthy.

---

## The About Convention — Scripts Folders Feed the Wiki

The wiki's discovery reach extends to the project's **scripts**. When something is written into a `scripts/` subfolder, that subfolder **SHOULD** carry an **`About`** — a short description of what the folder is for — and that `About` is **ingested into the wiki**. This is the third ingest source, alongside landing-time ingest and periodic staleness detection.

The convention closes a loop with the meaningful-subfolder rule ([20-cli.md](/specification/cli/)): a scripts subfolder already carries its meaning in its name; the `About` records that meaning in prose, and ingesting it means the wiki can **answer** for what a scripts folder does rather than leaving a reader to infer it from the name alone. The effect is that the discovery system reaches the project's operational scripts the same way it reaches its research and architecture — ask the wiki, and the answer is there.

---

## Related

- [41-project-architecture.md](/specification/project-architecture/) — the structured layer the wiki indexes and points at.
- [13-knowledge-format-okf.md](/specification/knowledge-format-okf/) — OKF, a storage format under the wiki: the on-disk format of both the wiki's pages and the architecture bundle.
- [18-design.md](/specification/design/) — `DESIGN.md`, the design convention; a storage format the wiki reads through.
- [../../v0.1.0/24-tools-registry.md](/specification/tools-registry/) — the registry where the wiki is recorded as a tool with a `location` pointer, never a copy.
- [../../v0.1.0/26-memo-history.md](/specification/memo-history/) — the chronicle, the present-tense wiki's chronological counterpart.
