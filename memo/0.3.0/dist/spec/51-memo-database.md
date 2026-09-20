---
title: "The Memo Database"
description: "A memo produces facts for as long as it lives — topics, work items, questions and their answers, research payloads, decisions, evidence of what was checked against what. This chapter says where those..."
spec_version: "0.3.0"
spec_file: "51-memo-database.md"
order: 51
section: "Specification"
normative: true
generated_at: "2026-09-20T07:42:00.285Z"
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

---

## The write path

**The decision is `F11=B`: the database becomes the write path.** It was taken against the recommendation that had been put alongside it, and it settles a question that had been open: whether the database is where writes land, or whether it is a projection of files that land first.

Three consequences follow, and they are not separable from the decision:

1. **The database is written first.** It is the destination of a write, not the drain of one.
2. **The file stores fall away.** They were the authoritative copy; they stop being one. Two homes for one fact is the condition this decision ends.
3. **The export is a rescue path, on demand and multi-generational.** The old rescue path was that the files were simply there. That path is gone, so an explicit export takes its place — at every breakpoint, holding **several generations**, because a single-generation backup fails in exactly the case a backup is for.

**The state in which both regimes exist at once is a transition, not an architecture.** It describes how things are on the way, never how they are meant to stay, and every description of it is written with that qualification attached. A transition that is documented as a design becomes permanent, because nothing in the text then says it is supposed to end.

**The reversal is carried out per store, not all at once**, and a store counts as reversed only when the set difference has been computed **in both directions** and the size of the compared set has been reported with the result. A comparison that found nothing to compare is red; see `S2` below.

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

<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [50-orchestrator-role.md](/specification/orchestrator-role/) — *The Table Assignment Matrix* and *The Bookkeeping Contract*: the single home for who writes which table, at which event, and who owes the result.
- [47-memo-lifecycle.md](/specification/memo-lifecycle/) — the states a memo passes through, which are what the lifecycle carrier of this store records.
- [12-rollout.md](/specification/rollout/) — the run whose planning and execution carriers this store holds.
- [22-tree-cli-recommended-way.md](/specification/tree-cli-recommended-way/) — the command tree through which every write into this store is made.
- [26-memo-history.md](/specification/memo-history/) — the chronicle, which narrates what the stored facts record.
- [28-drift.md](/specification/drift/) — the class of defect that appears when one fact is kept in two homes, which the write path above is the structural answer to.
