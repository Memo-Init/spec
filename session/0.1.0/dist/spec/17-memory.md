---
title: "Memory"
description: "The **memory store** is the per-project set of small Markdown files the harness carries across sessions — durable notes about what a project is, what was learned, and what to look up again. Each..."
session_version: "0.1.0"
spec_file: "17-memory.md"
order: 17
section: "Session"
normative: true
generated_at: "2026-07-12T00:58:34.150Z"
generated_from: "session/0.1.0/draft/spec/17-memory.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: session/0.1.0/draft/spec/17-memory.md."
---


The **memory store** is the per-project set of small Markdown files the harness carries across sessions — durable notes about what a project is, what was learned, and what to look up again. Each project instance ([12-instances.md](/session/instances/)) has its own store, and the harness injects a project's memory into the session as operating context. The store has grown large and useful, yet until this chapter it had **no normative schema**: the file format lived only in the harness-injected memory directive, and the historical `# Memory` block once cited in the global config no longer exists. This chapter fixes the schema so that every consumer — the index, statistics, and any future lint — can rely on one shape rather than parse two.

This chapter normalizes the **shape** of the store (frontmatter schema, type vocabulary, index consistency). It does **not** govern the memory *data* itself: writing, editing, and migrating memory files is a data operation, subject to the additive-and-reviewed discipline the enforcement chapter states for the live config ([02-enforcement.md](/session/enforcement/)), applied in spirit to a batch migration.

---

## The Store

A memory store is a per-project folder of Markdown files plus a single human-readable index (`MEMORY.md`). The files are **data managed by the harness**, not source under the project's own version control; the memo system and other Add-ons ([15-addons.md](/session/addons/)) keep their data in project folders, whereas the memory store is the harness's own cross-session channel. Because the store is harness-managed, this specification governs the **contract** the files satisfy — their frontmatter and their index relationship — and leaves the storage location and injection mechanics to the harness.

---

## Frontmatter Schema

Every memory file (other than the `MEMORY.md` index) **MUST** open with a YAML frontmatter block that carries:

| Field | Requirement | Meaning |
|---|---|---|
| `name` | MUST | A short identifier for the entry; matches the file's slug. |
| `description` | MUST | A one-line summary used by the index and by discovery. |
| `metadata.node_type` | MUST equal `memory` | Marks the file as a memory node. |
| `metadata.type` | MUST be one of the four types below | The entry's kind. |
| `metadata.originSessionId` | SHOULD | The session that authored the entry (provenance). |

The canonical form is the **nested** `metadata` block:

```
---
name: <slug>
description: "<one line>"
metadata:
  node_type: memory
  type: <project|feedback|reference|user>
  originSessionId: <uuid>
---
```

The older scheme — a **top-level** `type:` field paired with a filename prefix such as `feedback_` or `project_` — is **DEPRECATED**. A file **MUST NOT** rely on the filename prefix to carry its type; the type **MUST** be declared in `metadata.type`. Existing top-level-`type` files SHOULD be migrated by lifting the value into `metadata.type` (a pure frontmatter transformation where a top-level `type` is already present).

### Type Vocabulary

`metadata.type` **MUST** be exactly one of:

| Type | Purpose |
|---|---|
| `project` | Durable facts about the project — what it is, its architecture, its infrastructure. The default kind for orientation notes. |
| `feedback` | A behavioral or process lesson — a rule the collaboration should follow, usually distilled from a correction. |
| `reference` | Look-up material — a design reference, a codex, or a table consulted rather than acted on directly. |
| `user` | Role, expertise, and preferences of the person (see below). |

An implementation reading a memory file **MUST** treat an absent or out-of-vocabulary `metadata.type` as a schema violation, not silently coerce it.

### Alignment With the Harness Memory Directive

The four-type vocabulary — including `user` — is also the vocabulary defined by the harness-injected memory directive; this schema is authored to **agree** with that directive rather than diverge from it. The nested `metadata: { node_type: memory, type, originSessionId }` shape stated here is the shape the live stores already carry, cross-checked against the directive's definition before this chapter was written. Where the directive and this chapter both speak, they say the same thing; this chapter is the durable, citable record of the shape.

---

## The `user` Type

The `user` type names **who the person is** — their role, expertise, and working preferences — as distinct from facts about the project (`project`) or lessons about the process (`feedback`). It is defined here even though it is not yet populated, so that a store which begins to record person-bound context has a normative slot for it.

The **content** of those preferences is **not** authored in this Org specification. Person-bound coding and working-style preferences have their normative home in the personal-brand `user-preferences` specification — a public, normative declaration of collaboration preferences, authored in the personal-brand spec workshop and promoted to its public spec repo. A `user`-typed memory entry is therefore a **pointer** into those preferences, not a second copy of them: this chapter **references** that declaration and **MUST NOT** duplicate its preference text.

The split is deliberate. The preference *content* is a published stance and lives in `user-preferences`; the store *mechanics* — this frontmatter schema, the index, the lifecycle — are **internal wiring** and stay in the Org specification (session). Keeping the two apart means the person's declared preferences have one authoritative source, while the machinery that records them is specified once, here.

---

## Index Consistency

Each store carries a single `MEMORY.md` index that lists its entries. The index and the file set **MUST** stay consistent:

- Every index link **MUST** resolve to a file that exists — a link to a missing file is a defect, not a style choice.
- Every memory file **MUST** be either **referenced** by the index **or** explicitly **archived** — a file that is neither is an orphan and signals unmanaged decay.
- Archiving follows the **Trash principle**: an entry is never deleted to remove it from the active set. It is retired — for example by an `archived` status the index and the harness loader both honor — so no content is lost.

The lifecycle mechanism that realizes "archived" (a status flag, an archive folder, or an index omission) is a design choice recorded per project; this chapter fixes only the **invariant** — no dead links, and no file that is neither referenced nor archived.

---

## Provenance

The location of this chapter (session slot 17) follows a finding-based recommendation: the store mechanics are harness-level wiring, which places them in the session family alongside the other cross-session contracts, rather than in the memo or workbench families. The recommendation is recorded as such; the store's *data* placement and any per-project index conventions remain outside this schema.

<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [00-overview.md](/session/overview/) — the session glossary this chapter's terms join.
- [02-enforcement.md](/session/enforcement/) — the additive-and-reviewed discipline (REQ-SS-NOWRITE) applied in spirit to a memory-data migration.
- [12-instances.md](/session/instances/) — the per-project instance model each memory store belongs to.
- [15-addons.md](/session/addons/) — the Add-on data model this contrasts with: Add-on data lives in project folders, the memory store is the harness's own cross-session channel.
- [workbench/10-root-and-projects.md](/workbench/root-and-projects/) — the MUST-move-out table and signpost doctrine that governs where a rule's authoritative home is (the seam a redundant feedback memory is measured against).
