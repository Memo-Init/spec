---
title: "The Field Contract"
description: "The memo database stores a block, the chapter it is bound to, its sections, its tables and diagrams, the topics it carries and the work items filed under them. This chapter says what belongs in which..."
spec_version: "0.3.0"
spec_file: "52-field-contract.md"
order: 52
section: "Specification"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "memo/0.3.0/draft/spec/52-field-contract.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.3.0/draft/spec/52-field-contract.md."
---


The memo database stores a block, the chapter it is bound to, its sections, its tables and diagrams, the topics it carries and the work items filed under them. This chapter says what belongs in which field. Its rule is that **a field carries exactly one thing**: a number lives in a number column, a category in a category column, a title in a title column, and no text field repeats in a second form what another column already states.

The chapter exists because the stores grew field by field, and a field nobody specified collects whatever its first writer put into it. Where two columns end up holding the same statement, a reader cannot tell which one is meant, and a correction made in one of them leaves the other one wrong.

---

## Why a Field Contract

Without a statement per field, every fill is an interpretation, and every check can only measure whether a value is there, never whether it is right. That is how a gate reports green while a raw table carries an identifier where a title belongs.

**A title is a search field.** A user who runs a text search over the database finds a block by the words of its subject. A title that reads `B004` carries no information: whoever searches for it finds nothing, and whoever reads it learns nothing. A leading chapter number in a title is wrong for the same reason — it pushes search terms aside and repeats what the chapter column already carries. A field filled so that it is filled, rather than so that it is useful, produces a green figure over an empty field, which is the same class of defect as a gate that checks presence instead of correctness.

The contract below therefore names, for every field of the block level and of the topic and work-item level, what the field carries, what it does not carry, and the rule a machine can check it against.

---

## The Three Rules

1. **A field has one purpose, and the purpose decides the content.** A field MUST carry the content its purpose asks for. A value that satisfies a non-empty check but serves no reader of the field is not a valid value.
2. **A field carries exactly one thing.** A number MUST stand in a number field, a category in a category field, a title in a title field. A composition of several statements in one text field drifts apart at the first change: a renumbering changes the chapter column, and the title keeps the old number.
3. **An evidence stands in exactly one carrier.** Two carriers for one evidence mean that no check can say where it has to look. Every evidence of a work item MUST stand in one carrier, and the second place MUST NOT be written. Which kinds of record exist at all, and which table carries each, is the closed list in [51-memo-database.md](/specification/memo-database/), section Record Kinds.

---

## Block Fields

| Field | Content | Not | Check |
|-------|---------|-----|-------|
| `block.id` | the identifier `B###`, sequential per memo | — | matches `^B\d{3}$` |
| `block.title` | the subject title of the chapter in plain language — a search field; where no title is authored, the chapter heading without its number and its category mark | no leading number, no category mark, never the block's own identifier while the block is bound to a chapter | does not start with digits and a dot, does not end in `]`, differs from `id` for every bound block |
| `block.category` | one of `Code`, `Docs`, `Diagrams`, `Graphics`, `Text` — the English machine token of the category mark of the chapter heading, every token capitalised; the mark is display text and maps to its token: `[Code]` → `Code`, `[Docs]` → `Docs`, `[Diagramme]` → `Diagrams`, `[Grafik]` → `Graphics`, `[Text]` → `Text` | no free text, never a German mark such as `Diagramme`, never a second spelling such as `diagrams`; the mark is not repeated in the title or in the heading | a value from the closed list; a block written before the column existed carries none until the next projection derives it |
| `block.sort` | the position of the block in the ordered block store | no chapter number | a whole number, unique per memo |
| `block.topicIds` | the topics this chapter treats; in the database the edge is carried by `topic.block` | no topic the chapter only mentions | every identifier resolves; at least one |

---

## Chapter Binding Fields

| Field | Content | Not | Check |
|-------|---------|-----|-------|
| `block_chapter.chapter` | the chapter number, as a number | no title | a whole number that resolves to a numbered chapter heading of the newest revision |
| `block_chapter.heading` | the heading as the document states it, without its number and without its category mark | no number, no category mark, not a second title | equals the title part of the chapter line of the document |

The difference between `block.title` and `block_chapter.heading` is load-bearing and not a duplicate: `heading` is the comparison against the document, `title` is the subject name for display, sorting and search. Where the author sets no title, the title is derived from the heading — a derived value, not a second authored carrier.

---

## The Chapter Binding Table and Its Heading

`block_chapter` binds a block to the chapter of the revision it belongs to. It carries four columns: `block_id`, the edge to the block; `memo_id`, a label in a database that holds one memo, not a row reference; `chapter`, the chapter number and the actual statement of the row; and `heading`.

**The space objection.** A table of its own whose payload is one column repeating the neighbouring table looks like wasted space. The objection was measured and it holds: in the measured whole of a living memo database, `heading` was a copy of `block.title` — the same string in 55 of 55 chapter rows, with no row where the two differed. In that state the column told a reader nothing the block did not already tell.

**The code reason for a table of its own.** Two reasons stand against folding the binding into `block`, and they do not weigh the same:

- `CREATE TABLE IF NOT EXISTS` does not widen an existing table. A `chapter` column on `block` would have reached new databases only, while a table of its own reaches every database the first time the schema runs. This is a limitation of the tool, and the additive migration pass can lift it.
- A resolved heading makes a wrong number visible. A chapter number on its own looks plausible whether it is right or not; the heading the number resolves to is what a reader holds against the document. This is a design benefit, and it is the reason that survives the question whether the table would be built the same way today.

**The decision.** The table stays, and its `heading` column gets the job it was meant for: `block_chapter.heading` carries the heading as the document states it, without its number and without its category mark.

**The consequence.** The number lives in `block_chapter.chapter` and the category in `block.category`; `heading` is the comparison against the document, not a second title. The projection derives the column on every run from the chapter line of the newest revision: it splits that line into number, title and category mark and stores the title. A hand correction of the column therefore does not hold and is not meant to. Where a chapter number has to be resolved against a revision that no longer carries numbered chapter lines, the reader reassembles the document form from `chapter`, `heading` and `block.category`, mapping the stored token back to the mark the document states.

---

## Table and Section Fields

| Field | Content | Not | Check |
|-------|---------|-----|-------|
| `block_tables.title` | the subject title of the table, as it stands above it | no running number (`d1` to `d8`), no whole sentence | not `d` followed by a digit; unique per block |
| `block_section.name` | the machine value of the section | no free text, no heading | for a mandatory section, a value from the closed list of the chapter contract |

---

## The Block Tables Checked

The question asked of `block_chapter` is asked of every table that carries part of a block: does one of its columns carry the same thing as a column of a neighbouring table? The answer is read from the table definitions, column by column.

| Table | Column under suspicion | Verdict |
|-------|------------------------|---------|
| `block` | `title` against `block_chapter.heading`; `sort` against `block_chapter.chapter` | No duplicate. `title` is the subject name of the block; where none is authored, the projection falls back to the chapter heading without number and mark, a derived value rather than a second authored carrier. `sort` is the index of the block in the ordered block store, not its chapter number. `category` is the one carrier of the category mark. |
| `block_chapter` | `heading` against `block.title` | Straightened. `heading` used to repeat `block.title`; it now carries the document form of the heading without number and mark, so the row holds document form against subject title. `chapter` carries the number, `memo_id` stays a label. |
| `block_section` | `id` against `block_id` and `name` | No duplicate of a neighbouring table. `id` is the deterministic handle `<block_id>:<name>`, composed from two columns of the same row because the table has no composite key. `block_id` is the edge to `block`, `name` the section key, `body` the prose, `sort` the fixed section ordinal. |
| `block_tables` | `title` against `label`; `section` against `block_section.name` | No duplicate. `title` is the heading of the table, `label` the title of the payload file at capture time: two statements about two things. `section` names the section a table is anchored to and is an edge to `block_section.name`, not a copy of it. `tsv` and `payload_ref` are alternatives: a row carries its data inline or points at a file. |
| `block_diagrams` | `title` against `label`; `source` against `source_ref` | No duplicate. The same reading as `block_tables`: `title` is the heading of the diagram, `label` the title of the source file at capture time. A row carries its template inline in `source` or points at it through `source_ref` and `source_sha256`, never both. `section` is an edge to `block_section.name`. |

---

## Topic and Work-Item Fields

| Field | Content | Not | Check |
|-------|---------|-----|-------|
| `topic.title` | the subject, in one sentence — what is being talked about | no activity, no solution | does not start with an infinitive verb |
| `topic.phase` | `initial` or `revision` | — | a value from the closed list |
| `topic.block` | the block that treats this topic | not a block that only mentions it | resolves; exactly one |
| `topic.chapter` | derived: never written; readers resolve `topic.block` → `block_chapter.chapter` | no value of its own, no second binding beside the block | empty in every row; every writer refuses a value |
| `work_item.title` | the activity — what is to be done | no subject, no description of the problem | starts with a verb |
| `work_item.topic` | the topic the item arose under | — | resolves; mandatory |
| `work_item.provenance` | the file and the lines of its origin | no prose reference | `path:lines`; mandatory |
| `work_item.evidence` | retired: no longer written; every evidence of a work item, the completion proof included (`kind = completion-proof`), stands in `work_item_reference` | never a second carrier beside `work_item_reference` | empty in every row written since the retirement; a completed item that names a proof has exactly one reference row of that kind |
| `work_item.disposition` | set only when the item is not fixed | — | set ⇒ `disposition_note` mandatory |

**The difference between a topic and a work item is the difference between a subject and an activity.** "Quotes as database objects" is a topic; "create the quote table" is a work item. The difference is checkable: a topic title that starts with an infinitive is probably a work item, and the other way round.

**The proof is an evidence like any other.** A work item cites its sources as rows of `work_item_reference`; the deposited report that proves its completion is one more row of the same table, marked with the kind `completion-proof`. A waiver is not a proof — it is the named absence of one — and keeps its own column. The column `work_item.evidence` stays in the schema, because the schema only ever grows, and it is no longer written.

---

## Evidence Fields

| Field | Content | Not | Check |
|-------|---------|-----|-------|
| `evidence.capture` | how the statement came into being: `spoken`, `written`, `measured`, `derived`, `cited` or `pasted` | not who contributed it (that is `author`) | a value from the closed list |
| `evidence.grade` | the evidence level of the statement: `fact`, `measured`, `assumption`, `derived`, `presumption`, `unknown`, `expectation` or `opinion` | not the origin; no level glued to an origin | a value from the closed list; `fact` without `capture = 'measured'` is stored as `derived`, a weak grade with `capture = 'measured'` is stored as `measured` |
| `evidence.method` | the measurement technique — the command or the procedure | no result, no completeness | mandatory when `capture = 'measured'` |
| `evidence.completeness` | how complete the measurement is: `full`, `sample` or `unknown` | not the technique | a value from the closed list; mandatory when `capture = 'measured'` |
| `evidence.author` | who contributed the statement: `user`, `agent` or `tool` | not how it came into being | empty or a value from the closed list, refused otherwise by the writer |
| `evidence.supersedes` | the identifier of the revoked row this row replaces | no free text, no row of another memo | empty or resolves to an `evidence` row of the same memo |

On the Markdown surface `method` and `completeness` appear as the measurement statement at the level marker, and `author` as the second position beside the grade (labelling duty of the meta-specification); `supersedes` is mirrored by the invalidation mark at the revoked statement.

---

## Additional Sections

The mandatory sections of a chapter form a closed list and are checked; a block MAY carry additional `block_section` entries, which are carried and not checked. `block_section.name` of a mandatory section is one of the machine values of that closed list.

The closed list is the chapter contract of [06-memo-structure.md](/specification/memo-structure/), and its machine values are `context`, `userMandate`, `currentState`, `targetState`, `assessment`, `conclusion`, `evidence`, `topics`, `workItems` and `dependencies`. The rule holds for the list in whatever length the contract gives it; it is the rule that is decided, not a count. An additional section — an example, a risk, a counter-argument — stands under its own machine value from the section register and is rendered where the register places it. It is never held against the closed list, so adding one cannot turn a chapter red, and leaving one out cannot either.

---

## The Gate Checks Correctness, Not Presence

The earlier gates counted filled fields. The field contract turns that count into checkable statements, each of them decidable by a machine:

- a title equal to `B` and three digits is no title;
- a title that starts with a number and a dot carries a number that belongs elsewhere;
- a table title `d3` is the running number, not a title;
- a category outside the closed list, or a category mark left in a title or a heading, is a field carrying two things;
- a value in `topic.chapter` or in `work_item.evidence` is a write into a field that is no longer written.

A field that holds a value which breaks its check is red although it is filled. These checks belong into the same gate that checks the coverage of the topics by their blocks ([11-quality-and-finalization.md](/specification/quality-and-finalization/)), because both answer the same question — whether a memo can be planned from what its stores hold — and a second gate beside the first would be a second place to forget. Every run of the gate names how many fields it compared; a run that compared no field reports that it checked nothing, never a pass.

---

## Conformity Requirements

1. A writer of the memo database MUST fill each field listed above with the content its row names, and MUST NOT write into it what the row excludes.
2. `block_chapter.heading` MUST be derived from the chapter line of the document with its number and its category mark removed; the number MUST stand in `block_chapter.chapter` and the mark, as its English machine token, in `block.category`.
3. `block.title` MUST NOT carry a leading chapter number or a category mark. Where no title is authored, it MUST fall back to the derived chapter heading; only a block bound to no chapter MAY carry its identifier as title.
4. A writer MUST NOT set `topic.chapter`. A reader that needs the chapter of a topic MUST resolve it over `topic.block` and the chapter binding of that block.
5. Every evidence of a work item MUST stand in `work_item_reference`. The completion proof MUST be exactly one row of the kind `completion-proof` per completed item that names a proof, and `work_item.evidence` MUST NOT be written.
6. The checks of the mandatory sections MUST cover the closed list of the chapter contract and nothing beyond it.
7. The field gate MUST judge each value against its check, not merely its presence, and MUST state the number of fields it compared.

<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [51-memo-database.md](/specification/memo-database/) — the store whose fields this chapter specifies, and the write path every field is filled through.
- [06-memo-structure.md](/specification/memo-structure/) — the chapter contract, whose closed list of mandatory sections the section field is held against.
- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — the coverage gate the field checks belong to.
- [30-primitives.md](/specification/primitives/) — the block, the chapter, the topic and the work item as primitives.
- [28-drift.md](/specification/drift/) — the class of defect that appears when one statement is kept in two fields.
