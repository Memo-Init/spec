---
title: "The Wiki — Entry Point"
description: "The wiki is the **entry point** — the single bottleneck through which a memo reaches everything the project knows. A project accumulates far more than any one memo holds: the structured project..."
spec_version: "0.1.0"
spec_file: "04-wiki.md"
order: 4
section: "Workbench"
normative: true
generated_at: "2026-06-22T17:45:05.095Z"
generated_from: "spec/workbench/04-wiki.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/workbench/04-wiki.md."
---


The wiki is the **entry point** — the single bottleneck through which a memo reaches everything the project knows. A project accumulates far more than any one memo holds: the structured project architecture, and a long tail of unstructured material — research piles, `context/` documents, finalized decisions, the present-tense understanding distilled from all of it. The wiki is how a memo asks the workbench *what it already knows* instead of rediscovering it, and it answers regardless of the form the underlying knowledge takes. This chapter frames the wiki as that entry point; its on-disk format is OKF ([02-knowledge-format-okf.md](/specification/knowledge-format-okf/)).

---

## The Bottleneck Over Everything

Two kinds of knowledge sit beneath the wiki, and the wiki is the entry point over **both**:

| Layer | What | Form |
|-------|------|------|
| **Structured** | the project architecture — which repos exist, how they connect ([03-project-architecture.md](/specification/project-architecture/)) | OKF nodes + edges |
| **Unstructured** | research piles, `context/` files, distilled decisions — everything else the project holds | any form; the wiki categorizes and files it |

The user does not care which form a piece of knowledge is in — the wiki finds it. That is the whole point of a single entry point: knowledge is reached *through the wiki*, not by knowing in advance where each kind of thing lives.

---

## The Wiki Indexes the Architecture — It Does Not Copy It

The architecture is one of the things the wiki knows about, but the wiki **points at it, it does not duplicate it**. The wiki's index carries an entry that refers to the architecture bundle (`context/architecture-okf/`); the bundle stays the single source of truth, and the wiki never holds a second, drifting copy of the repo graph. This is the same no-copy rule the tools registry follows ([../v0.1.0/24-tools-registry.md](../v0.1.0/24-tools-registry.md)): a reference whose target owns the content, so an update changes one place. A deterministic consumer that needs the architecture follows the pointer to `memo architecture locate`; a human or agent browsing the wiki follows the same pointer by hand.

---

## Present Tense, Not Chronology

The wiki answers in the **present tense**: a wiki page states what is understood to be true *now*, and a query returns the current consolidated understanding, optimized for fast answers. What the wiki is **not** is the timeline of how that understanding was reached — that is the chronicle ([../v0.1.0/26-memo-history.md](../v0.1.0/26-memo-history.md)). The wiki gives the current answer; the chronicle gives the provenance and the order of change. A memo that asks "what does the project know about X right now?" reaches for the wiki; one that asks "does a conclusion from an earlier memo still hold?" reaches for the chronicle. Keeping the two distinct stops the wiki's convenience from being mistaken for an audit trail.

---

## Every Project Gets a Wiki; Only Internal Projects Get Enforced Architecture

The wiki is the **universal** entry point, but the structured architecture beneath it is not universally required:

- **Every project** — internal or foreign — gets a wiki, because every project has unstructured knowledge worth categorizing and querying. The wiki is the entry point for all of them.
- **Only internal projects** are expected to carry a full project architecture beneath the wiki. A foreign, research-heavy project (piles of material, little repo structure of its own) uses the wiki for its unstructured data and is **not** forced into a complex architecture bundle — its absence is an accepted state, not a failure ([03-project-architecture.md](/specification/project-architecture/)).

So "the wiki finds everything" holds for all projects; "the project has a structured architecture" holds for the internal ones.

---

## Keeping the Wiki Fresh — Two Triggers

The wiki is kept current by **two complementary triggers**, one at write time and one periodic:

- **Ingest at landing.** When a memo lands, its new knowledge is folded into the wiki (the ingest step of landing). This keeps the wiki current as the project produces knowledge, at the moment the knowledge is finalized.
- **Stale flag on the maintenance board.** Periodically, the maintenance discipline ([../v0.1.0/26-memo-history.md](../v0.1.0/26-memo-history.md) and the maintenance chapter) flags wiki pages that have drifted from their sources, so staleness that accrues between landings is still caught.

Write-time freshness keeps the wiki growing correctly; periodic staleness detection catches the decay that write-time cannot see. Together they keep the entry point trustworthy.

---

## Related

- [03-project-architecture.md](/specification/project-architecture/) — the structured layer the wiki indexes and points at.
- [02-knowledge-format-okf.md](/specification/knowledge-format-okf/) — OKF, the on-disk format of both the wiki and the architecture bundle.
- [../v0.1.0/24-tools-registry.md](../v0.1.0/24-tools-registry.md) — the registry where the wiki is recorded as a tool with a `location` pointer, never a copy.
- [../v0.1.0/26-memo-history.md](../v0.1.0/26-memo-history.md) — the chronicle, the present-tense wiki's chronological counterpart.
