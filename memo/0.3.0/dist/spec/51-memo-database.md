---
title: "The Memo Database"
description: "A memo produces facts for as long as it lives — topics, work items, questions and their answers, research payloads, decisions, evidence of what was checked against what. This chapter says where those..."
spec_version: "0.3.0"
spec_file: "51-memo-database.md"
order: 51
section: "Specification"
normative: true
generated_at: "2026-11-08T15:43:20.872Z"
generated_from: "memo/0.3.0/draft/spec/51-memo-database.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.3.0/draft/spec/51-memo-database.md."
---


A memo produces facts for as long as it lives — topics, work items, questions and their answers, research payloads, decisions, evidence of what was checked against what. This chapter says where those facts live: in **one authoritative store per fact**, and in a database rather than in a folder of files that each hold part of the answer. The viewer is a **view onto that store**, not a second copy of it, and the store is what a later reader queries instead of re-reading the prose that produced it.

The chapter exists because the store was, for a long time, real in the code and absent from the specification. A carrier that nobody specified is a carrier nobody can be held to, and the rules at the end of this chapter are the direct consequence of that gap having been paid for once already.

---

## Storage form

The carrier format is **doltlite**. It is a versioned store with SQL semantics, and the file it writes is not an SQLite file even though the two are easily confused.

- **The file carries the identifier `CTLD`.** That marker is how the format announces itself, and it is the first thing to check when a tool disagrees with another about what the file is.
- **An SQLite client does not answer the question.** Pointed at a memo database it reports `file is not a database`. That message is the client stating that it cannot read the format — it is **not** a verdict that the file is damaged, and reading it as one has already cost one investigation. Reading goes through the **read-only accessor** of the store instead.
- **Reading is read-only on purpose.** A write-capable connection changes the file the moment it opens it, so a reader that only wants to count would leave a trace in what it was counting.
- **The format version is pinned, and the pin is checked in preflight.** The concrete version is not carried in this prose: it is data, it moves when the runtime moves, and a number written here would be a second place to maintain. What is normative is that a pin exists and that a run verifies it before it writes.

---

## Where the databases live

The shape of the storage is specified here; the file names of one machine are not. A page that hard-codes a path becomes wrong the first time a layout changes, and the layout is not what makes this design work.

| Store | What it holds |
|-------|---------------|
| **One database per memo** | everything that belongs to that memo's own life — its topics, its work items, its questions, its plan, its run |
| **The project-global store** | what spans memos and belongs to the project rather than to any single memo |
| **The unbound catch-all** | input that arrived without a memo binding, kept rather than dropped until it can be bound |

The catch-all is deliberate and is not a defect to be tidied away. Input that arrives before there is a memo to attach it to has to land somewhere; the alternative is losing it, and a lost input is the one failure this design cannot recover from.

Three stores, three purposes, and no fact held in two of them. Where the same fact appears in more than one home, that is a **finding**, not a design — and it is the case the write path below closes.

**The split is fixed: one memo database per memo for everything of that memo's own life; one project database for what spans memos — the mental model, maintenance, goals, the chronicle, snags and research.** The split exists so that the system scales (the user's own words: one database per project for project-wide functions). It is built, filled and undisputed; a fact that belongs to one memo does not move into the project database, and a fact that spans memos is not copied into each of them.

---

## The write path

**The decision is `F11=B`: the database becomes the write path.** It was taken against the recommendation that had been put alongside it, and it settles a question that had been open: whether the database is where writes land, or whether it is a projection of files that land first.

Three consequences follow, and they are not separable from the decision:

1. **The database is written first.** It is the destination of a write, not the drain of one.
2. **The file stores stay as the projection of the entities the database carries, and as the authoritative carrier of revisions and of `context/`, which the database holds only as path plus `sha256`.** For blocks, topics, work items and transcripts the database is authoritative and the file store is their projection: the projection never deletes or overwrites a row of these entities from the files, and an entity that exists only in the database is written out to the files. Two homes for one fact stay closed because each fact has exactly one authoritative home.
3. **The export is a rescue path, on demand and multi-generational.** The old rescue path was that the files were simply there. That path is gone, so an explicit export takes its place — at every breakpoint, holding **several generations**, because a single-generation backup fails in exactly the case a backup is for.

**The state in which both regimes exist at once is a transition, not an architecture.** It describes how things are on the way, never how they are meant to stay, and every description of it is written with that qualification attached. A transition that is documented as a design becomes permanent, because nothing in the text then says it is supposed to end.

**The reversal is carried out per store, not all at once**, and a store counts as reversed only when the set difference has been computed **in both directions** and the size of the compared set has been reported with the result. A comparison that found nothing to compare is red; see `S2` below.

---

## The Offload Rule

This section exists so that "the database is too big" is answered by the measured cause and not by moving content out. **The offload rule is a single-case rule, never a saving programme:** a single cell value above **65,536 bytes** is not stored inline but as a reference; below that threshold everything stays in the database. The size of a memo database comes from how it is written — every statement autocommitted outside a transaction leaves a tree state behind — not from what it holds, so moving content out would save little and cost the joins that keep a memo answerable.

**A value that is too large is stored as a pointer site:** a path column and a `sha256` column on the row, a base the path is resolved against (`memo` or `project`), and the kind `reference` for a payload that is only pointed at. The register of pointer sites is `PointerSites` in the command-line package; it carries `block_tables`, `research_files`, `documents` and `block_diagrams`. A new pointer site is added only when a column crosses the threshold — not in advance, and not for a column that merely could grow.

The candidates, measured on 2026-10-11 over every text column of the largest memo database (602,199,576 bytes, 62 tables, 22,024,309 bytes of cell content):

| Column | Largest cell (bytes) | Over 65,536? |
|--------|---------------------:|--------------|
| `transcript.text` | 26,450 | no — kept inline on purpose: the transcript is the source a reader quotes from |
| `user_inputs.payload_verbatim` | 26,450 | no — the verbatim user input is the record itself |
| `memo_section.body` | 10,802 | no |
| `memo.context` | 8,960 | no |
| `rollout_phase.spillover` | 7,961 | no |
| `receipt_event.result_paths` | 7,937 | no |
| `decision.reason` | 5,448 | no |
| `session_tool_call.input_excerpt` | 1,198 | no — already cut at the source |

Comparison basis: every text column of the 62 tables, `MAX(LENGTH(CAST(column AS BLOB)))`. No cell crosses the threshold today, so no column is offloaded and the pointer-site register is unchanged. When a measurement finds a column above it, that column is named here with the day it was measured and gets its pointer site.

---

## Control Against Scale

This section records why the decision **"everything stays in the database"** holds against the cost of size, with the measurements that carry it.

| Measurement | Value | Comparison basis |
|-------------|-------|------------------|
| Opening a memo database of 3.2 MB | 0.06–0.23 s | three carriers, measured on 2026-09-27 and 2026-09-28 |
| Opening a memo database of 11 MB | 0.48–0.94 s | the same three carriers |
| Opening a memo database of 73 MB | 2.5–4.4 s | the same three carriers |
| The first query on an open database | under 3 ms | the same three carriers |
| Autocommitted against bracketed writing | factor 28.5 (18,173 against 637 bytes per row) | 500 identical rows written both ways, measured on 2026-09-27 |
| Cold open of a 4.9 MB / 130 MB / 602 MB memo database | about 0.03 s / 0.79–0.94 s / 2.5–2.6 s | three live carriers, three opens each, measured on 2026-10-11 |
| A query on a held, already open handle | 0.01–0.85 ms (median 0.02 ms) | twenty queries per carrier on the same three carriers, measured on 2026-10-11 |

The cost lies in opening a carrier and in the way it is written, not in what it holds. Both are answered without moving content out: writing goes through a bracket — one transaction per write, the data rows in one, the ledger rows in a second, then one commit — and reading goes through one held handle per database file instead of an open per query. Control therefore stays where it is — every fact in one queryable store with its history — and scale is bought with the bracket and the held handle.

---

## Table inventory

**The schema declares 60 tables, measured on 2026-09-15.** The number is stated together with the day it was taken, because the schema grows while the system that owns it is being built, and a bare count is a claim about a present that expires.

The counting basis: measured against `cli/src/DoltSchema.mjs` of the command-line package, file state 122,410 bytes over 1,908 lines, SHA-256 `97e39eca0d3120d90827a44be02423cbf6ed243769ec51cbd9243f8ecfa8c116`. 67 raw lines carry the declaration literal; 7 are discarded with their reason — six inside prose comments, one a regular expression in the applier — leaving 60 declarations and 60 distinct names. The measuring commands:

```
grep -c '`CREATE TABLE IF NOT EXISTS ' cli/src/DoltSchema.mjs
grep -o '`CREATE TABLE IF NOT EXISTS [a-zA-Z_]*' cli/src/DoltSchema.mjs | sed 's/.*EXISTS //' | sort -u | wc -l
```

The exit code is taken **before** any pipe, and what is checked is the **number**, never the exit status: a counting tool reports a non-zero status on zero hits, which makes a successful measurement look like a failed one.

**Where each of those tables is assigned is not repeated here.** *The Table Assignment Matrix* in [50-orchestrator-role.md](/specification/orchestrator-role/) names, per table, its area, its writing role and its trigger, and *The Bookkeeping Contract* on the same page names, per party, what that party owes. Both live there and are referenced from here rather than restated: a second full statement of either would be a second authority, and at the first divergence nothing would decide which one holds.

The three roles those assignments are written against are `author`, `planner` and `orchestrator`, with `worker` beside them for a single unit of work. The words are defined once, in *Role Vocabulary* on the same page, and this chapter uses them without coining alternatives — one role, one word, in the schema, in a skill and in a message alike.

**The matrix fixes responsibilities, not schemas.** It does not say which columns a table receives, it does not change a field, and it does not cause a write to happen. Where it assigns a table to a role that does not serve it today, that is a **statement with an addressee** — it records who owes the write. It is never the claim that the carrier is already built; `S4` below is the rule that keeps those two apart.

---

## The Database Boundary

A memo is answerable from its store only when it is clear what the store carries and what lies beside it. The boundary below is that statement. **Pointers live in the database, the payload stays a file:** where a fact is a file that a reader opens as a whole, the database holds its path and its `sha256`, never a second copy of its text.

| In the database | Beside the database |
|-----------------|---------------------|
| The registers of the memo — topics, work items, blocks, questions, decisions, findings — each with its identifier | The revision files `revisions/REV-NN.md` as frozen states; the store holds their text section by section, the file is the frozen form it was read from |
| Every quote and every evidence row in `evidence`, with its verbatim text, its source span, its checksum and its filter state, bound through `evidence_binding` to the section it carries | The payloads under `context/`, reached through the pointer tables `documents` and `research_files` (path plus `sha256`) |
| The revision text per chapter and per section in `block_section`, and the four positions without a block in the five tables `revision_head`, `revision_context_field`, `revision_context_reference`, `revision_phase_item` and `revision_finalization_check` | The evidence markers in the prose (measured, fact, assumption, derived, presumption, unknown, expectation, opinion); `evidence.grade` carries only the grade of one piece of evidence, the marker stays in the text |
| The full text of every recording in `transcript` | The harness session files a terminal channel is bound from; the store keeps what was bound, not the session |
| For a terminal input the word count in `user_inputs` as the minimum record; the full text of a terminal input is not stored there | — |

A fact on the left is answered by a query; a fact on the right is answered by opening the file the pointer names, and the checksum says whether the file is still the one the store pointed at. A fact that appears on both sides is a finding (see [28-drift.md](/specification/drift/)), not a convenience.

---

## Record Kinds

The record kinds of a memo are a **closed** list of three, each with the table that carries it:

| Kind | Carrying table | What it holds |
|------|----------------|---------------|
| quote | `evidence` | a verbatim excerpt with capture `spoken`, `written`, `cited` or `pasted`; the view `quote` shows them |
| opinion | `block_section` | the section `assessment`, heading `Bewertung` — the distilled opinion beside the measurement |
| finding | `finding` | a finding of a check or a review, with its identifier |

A fourth kind is a schema change of this page, not a value somebody writes.

Measurement and statement are **not record kinds of their own**. A measurement is an `evidence` row with `capture = 'measured'`, whose `method` and `completeness` are mandatory; the certainty of a statement is the `grade` of its evidence and the level marker in the text. The fields are listed in [52-field-contract.md](/specification/field-contract/), section Evidence Fields.

Revocation is the `supersedes` edge of `evidence`: the replacing row names the revoked row in `supersedes`, and the text mark `[INVALIDIERT → EV-NNN]` at the revoked statement names the replacing row. Text and store carry the same revocation.

---

## Mandatory Entries

A database that declares every table can still be empty exactly where the chain from a recording to a work item has to close. The mandatory entries name those rows. Each rule holds the memo folder and the memo database against each other, and each names the set it compared.

| Rule | Entry the memo database MUST carry | Tables read |
|------|-------------------------------------|-------------|
| **ME-01** | the `memo` row of the memo | `memo` |
| **ME-02** | one `transcript` row per recording under `transcripts/` | `transcript` |
| **ME-03** | one `user_inputs` row per recording of an art the capture chain takes, matched by the checksum of the file | `user_inputs` |
| **ME-04** | one `block` row per block file, and one `block_topics` row per topic id of that block file | `block`, `block_topics` |
| **ME-05** | at least one living (not deregistered) `work_item` per topic of `block_topics` | `block_topics`, `work_item` |
| **ME-06** | at least one `mandated` evidence binding per User-Auftrag (`block_section` row `userMandate`) | `block_section`, `evidence_binding` |

The gate is `memo db mandatory --memo <NNN>`. It is read-only. It exits 0 only when every rule held. It exits 1 on any missing entry, naming each subject under its rule. It also exits 1 when a rule cannot be measured because the database lacks one of its tables: such a rule is `unmeasured`, never held. Every rule reports its comparison basis beside its violations (`S2`).

Three of the rules close the chain from a chapter to its work and to the words that ordered it, and they are carried as requirements so that the store itself can be held to them:

```requirement
{
  "id": "REQ-1016",
  "title": "Every chapter's block carries its topic edges in the memo database",
  "statement": "Every chapter of a memo is carried by a block, and for every block file the memo database MUST carry one `block` row and one `block_topics` row per topic id of that block file (rule ME-04); a block whose topic edges are missing from the store MUST be named by the gate as a violation of ME-04.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["memo-database", "mandatory-entries"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "memo",
    "tactic": "db-mandatory",
    "verify": [
      "Run `memo db mandatory --memo <NNN>`",
      "Assert that rule ME-04 is held and names its comparison basis (block files and their topic ids)"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-1017",
  "title": "Every topic of a block has a living work item in the memo database",
  "statement": "For every topic a block points at through `block_topics`, the memo database MUST carry at least one living (not deregistered) `work_item` (rule ME-05); a topic without one MUST be named by the gate as a violation of ME-05.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["memo-database", "mandatory-entries"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "memo",
    "tactic": "db-mandatory",
    "verify": [
      "Run `memo db mandatory --memo <NNN>`",
      "Assert that rule ME-05 is held and names its comparison basis (the topics of block_topics)"
    ]
  },
  "grade": "binary"
}
```

```requirement
{
  "id": "REQ-1018",
  "title": "Every User-Auftrag carries a bound quote in the memo database",
  "statement": "For every User-Auftrag of a block (`block_section` row `userMandate`), the memo database MUST carry at least one `evidence_binding` with role `mandated` (rule ME-06); a User-Auftrag without a bound quote MUST be named by the gate as a violation of ME-06, never passed as a warning.",
  "scope": { "repos": [], "categories": ["memo"], "tags": ["memo-database", "mandatory-entries"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "memo",
    "tactic": "db-mandatory",
    "verify": [
      "Run `memo db mandatory --memo <NNN>`",
      "Assert that rule ME-06 is held and names its comparison basis (the userMandate rows of block_section)"
    ]
  },
  "grade": "binary"
}
```

---

## Self-understanding rules

Five rules govern how this system talks about its own store. They are normative, they apply to every revision, every report and every gate, and each of them exists because its absence produced a wrong answer that read as a right one.

| Rule | Statement |
|------|-----------|
| **S1** | **A table in a revision comes from a query against the store — or it names its source.** Figures recalled from memory are not figures. Where a query is not possible today because the carrier does not exist, that is said plainly instead of being passed over in silence. |
| **S2** | **Every number names its comparison basis.** "22 of 56 tables, measured on 2026-09-06" is a measurement; "many tables are empty" is not. A check that found nothing to compare reports green while having checked nothing, which is why the compared set is named beside the result rather than implied by it. |
| **S3** | **Every number carries the day it was taken.** The store is written to while it is being read. A number without a date is a claim about the present that is wrong tomorrow. |
| **S4** | **A writer without a caller counts as not built.** A new carrier is reported finished only once a step of the working chain actually drives it; until then there is code that could write and nothing that does. |
| **S5** | **Every table has a named writer and a named trigger — or it is an open question, not an empty table.** S5 is the generalisation of S4: S4 examines a single carrier, S5 examines the whole stock. A table that nobody was assigned is the finding; a table that is assigned and still empty is merely early. |

**S5 is what makes the inventory above more than a number.** The count says how many carriers exist; S5 says that each one of them is either wired to a named writer and a named trigger, or is carried explicitly as an open question with its reason. Leaving a carrier out of that reckoning without saying so is not an acceptable outcome — a silently omitted table is indistinguishable from one nobody noticed.

## A Promised Refusal Is Tested at the Gap

A refusal that a command promises for a gap between the flat store and its carrier **MUST** be tested at exactly that gap. A command that promises to refuse loudly but returns exit code zero while rows are missing makes every completeness statement read too low, and nobody notices because the promise is believed. The test constructs the gap, runs the command and requires a non-zero exit.

## Every Writer of a Table Passes the Pointer Boundary

Every writer of a table that stores pointers **MUST** pass the same pointer boundary, which turns a path into a base-relative pointer. A second writer that does not pass the boundary stores absolute pointers, and every evaluation that takes the pointers as relative computes wrong. The rule binds per table, not per writer: before a new writer of a table goes into service, it is checked against the boundary of that table.

## A Generic Writer Declares the Gate of Each Table

A generic writer that builds its insert statements at runtime **MUST** declare, for each table it writes, which entity gate that table requires and whether the writer passes it. A writer that reaches most carriers through one runtime path can go around an entity gate without any guard seeing it, because the guard looks for the spelling of the write and not for the concept. An inventory of writers is therefore taken by concept — which code writes which table — and not by searching for the text of the statement.


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [50-orchestrator-role.md](/specification/orchestrator-role/) — *The Table Assignment Matrix* and *The Bookkeeping Contract*: the single home for who writes which table, at which event, and who owes the result.
- [47-memo-lifecycle.md](/specification/memo-lifecycle/) — the states a memo passes through, which are what the lifecycle carrier of this store records.
- [12-rollout.md](/specification/rollout/) — the run whose planning and execution carriers this store holds.
- [22-tree-cli-recommended-way.md](/specification/tree-cli-recommended-way/) — the command tree through which every write into this store is made.
- [26-memo-history.md](/specification/memo-history/) — the chronicle, which narrates what the stored facts record.
- [28-drift.md](/specification/drift/) — the class of defect that appears when one fact is kept in two homes, which the write path above is the structural answer to.
