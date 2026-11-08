---
title: "Roles and Role Groups"
description: "A **role** sits above the permits. It collects permits and skills, and it holds the one capability a permit never holds: it may create sub-agents. This chapter first states the criterion that makes..."
governance_version: "0.1.0"
spec_file: "05-roles.md"
order: 5
section: "Governance"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "governance/0.1.0/draft/spec/05-roles.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: governance/0.1.0/draft/spec/05-roles.md."
---


A **role** sits above the permits. It collects permits and skills, and it holds the one capability a permit never holds: it may create sub-agents. This chapter first states the criterion that makes something a role, then fixes **one** role vocabulary with a deterministic table per role, and then cuts the individual roles — orchestrator, lead, bookkeeper and author — together with the worker functions that run below them. The order is deliberate: a word comes first, a role second, its rights third, because a role that cannot be named on every surface cannot carry a right.

---

## The Criterion of a Role

A role is defined by one capability: **only a role creates sub-agents, and only with fewer rights than it holds itself**. Everything else a role carries — knowledge, permits, skills — can also be collected in a permit; the right to create sub-agents cannot. Whatever creates sub-agents is therefore a role, and whatever does not is either a permit or a function that runs inside a role.

By this criterion the **Lead Role** is a role of its own: the lead is the agent that creates worker sub-agents and has them carry out the work. The lead role is not the orchestrator contract role, and it is not a second name for the orchestrator: it is a separate role that runs under that contract role, with a narrower reach and without contact to the user. A lead never becomes an orchestrator by holding more permits, because the difference is not one of knowledge.

The bookkeeper stands outside this chain. It creates no sub-agents and is neither above nor below the orchestrator, the lead or the workers; it watches the procedure rather than the work. The criterion separates the chain roles from the worker functions, and it does not apply to the bookkeeper, whose standing is defined in *The Bookkeeper* below.

---

## Role Vocabulary

There is **one** role vocabulary. Each role has exactly one word, and the word is fixed by the table below; no surface coins a second word for a role that already has one.

| Word | Tier | Area | Booking value | Contract role |
|---|---|---|---|---|
| `orchestrator` | 1 | rollout | `orchestrator` | `orchestrator` |
| `author` | 1 | research (authoring up to finalization) | `author` | `user` |
| `lead` | 2 | research or rollout | `lead` | `orchestrator` |
| `worker` | 3 | any | `worker` | `worker` |
| `bookkeeper` | standalone | procedure | `bookkeeper` | `worker` |

The word of a role is binding on four surfaces at once — the specification text, the skill text, the stored agent label in the form `<word>:<subject>`, and the terminal output — as the memo family states for its working roles ([/specification/orchestrator-role/](/specification/orchestrator-role/)). Whoever introduces a role serves all four surfaces in one go; a role that is present on fewer than four of them is a role that cannot be booked, and it **MUST NOT** be given rights until it can.

The *Contract role* column names the tool contract a running context executes under ([/spec/harness-registry/](/spec/harness-registry/)). A working role projects onto a contract role; it does not add a contract role of its own.

---

## Two SOPs Per Role

Every role carries **two** SOPs, as [./02-sop-system.md](/governance/sop-system/) requires of every role and permit: the **start SOP** `role-<name>` and the **closing SOP** `role-<name>-close`. A role is a sandwich SOP: start SOP, the required SOPs, closing SOP.

| Role skill | Start SOP | Closing SOP | Required SOPs |
|---|---|---|---|
| author | `role-author` | `role-author-close` | `session-sop`, `workbench-sop`, `memo-sop` |
| planner | `role-planner` | `role-planner-close` | `session-sop`, `workbench-sop`, `memo-sop` |
| orchestrator | `role-orchestrator` | `role-orchestrator-close` | `session-sop`, `workbench-sop`, `memo-sop`, `controlled-language` |
| lead | `role-lead` | `role-lead-close` | `session-sop`, `workbench-sop`, `memo-sop` |
| worker | `role-worker` | `role-worker-close` | `session-sop`, `workbench-sop`, `memo-sop` |
| bookkeeper | `role-bookkeeper` | `role-bookkeeper-close` | `session-sop`, `workbench-sop`, `memo-sop` |

- **The start SOP** says what the role is and which SOPs have to be read for it. Loading it is the **role reset**: every reading and every permit the holder had before is revoked ([./04-permit-validity.md](/governance/permit-validity/)). It **MUST** file its required SOPs twice — as a prose list and as the marked line `<!-- role-requires: … -->` — and both filings **MUST** name the same set.
- **The closing SOP** ends the reading. It **MUST NOT** be executable before every required SOP has been read in the same session: the gate before every tool call reads the marked line of the start SOP and refuses the call of the closing SOP while one of the SOPs it names is unread, and the refusal **MUST** name every missing SOP, so that the agent meets the expected behaviour and not a silent stop. The registry edges (`when: pre` and `when: post`, one per required SOP) carry the same set as the machine-readable twin. Loading the closing SOP is **not** a role reset.
- **The release of the role.** The release is a **named state**, `role-granted`, and it **MUST** arise only from a successful closing SOP after which a hook has judged every required SOP as read; a hook records it, never the holder. A closing SOP with a SOP missing releases nothing and records the refusal with the missing SOPs. The state is shown to the agent on its channel. Today the release carries the state itself and the start of the role's command count; no tool right depends on it yet. The expiry of the role takes the release away.
- **The role carries the count.** The command count of the holder starts at the release of the role — before a release, at the role reset — the permits granted under the role count onto it, an advance warning names the commands that remain and every SOP read since the reset, and the expiry of the role revokes every reading and every permit of the holder ([./04-permit-validity.md](/governance/permit-validity/), *The Role Carries the Count*).
- **The required SOPs per role.** Every role reads the three SOPs of the SOP chain. A role adds an SOP of its own where this chapter names one for it: the orchestrator answers the user in normalised language (*The Answer Duty*), so it also reads `controlled-language`. Knowledge for work at a place — git and node for a repository — is not a role's: it is carried by the permits the work needs (`repo-worker`, `repo-coder`; [./03-permits.md](/governance/permits/)), which normalise that knowledge across roles, so a role does not carry it a second time.
---

## Role Tables

Each role is described by exactly one table with the same seven fields in the same order. The tables are deterministic: two readers who look up the same field of the same role get the same answer, and a field that a role does not fill is written out rather than left away.

The seventh field, *Communication*, names with whom a role communicates and over which path. A role is created only with its communication field filled, and the default is no communication at runtime. Communication between roles is defined, not improvised ([./11-risk-surface.md](/governance/risk-surface/)).

### Role: `orchestrator`

| Field | Value |
|---|---|
| Word | `orchestrator` |
| Tier | 1 |
| Rights | Creates sub-agents — leads and workers — only with fewer rights than it holds itself; appoints the leads; is the only chain role that holds the communication with the user; holds almost every right and carries the highest quality claim of all roles. It is the only role that lays down a snag in the cross-memo snag store (`memo snag add`) — the last resort, recorded with its creator and counter-cleared by the highest level. |
| Booking value | `orchestrator` |
| Contract role | `orchestrator` |
| Surfaces | spec: this chapter · skill: `role-orchestrator` · stored label: `orchestrator:<subject>` · terminal: the same label |
| Communication | the user, and its leads and workers through defined handover documents |

### Role: `author`

| Field | Value |
|---|---|
| Word | `author` |
| Tier | 1 |
| Rights | Creates research sub-agents only with fewer rights than it holds itself; writes the authoring tables of a memo; its span ends with the finalization of the memo. |
| Booking value | `author` |
| Contract role | `user` |
| Surfaces | spec: this chapter · skill: `role-author` · stored label: `author:<subject>` · terminal: the same label |
| Communication | the user, and research results as delivered files |

### Role: `lead`

| Field | Value |
|---|---|
| Word | `lead` |
| Tier | 2 |
| Rights | Creates worker sub-agents only with fewer rights than it holds itself; communicates only with the orchestrator. |
| Booking value | `lead` |
| Contract role | `orchestrator` |
| Surfaces | spec: this chapter · skill: `role-lead` · stored label: `lead:<subject>` · terminal: the same label |
| Communication | the orchestrator only; its workers through order sheets and receipts |

### Role: `worker`

| Field | Value |
|---|---|
| Word | `worker` |
| Tier | 3 |
| Rights | Creates no sub-agents; carries out one bounded unit of work and writes the proof of its own work. It lays down no snag in the cross-memo snag store; a defect it cannot fix goes back to its lead as a finding. |
| Booking value | `worker` |
| Contract role | `worker` |
| Surfaces | spec: this chapter · skill: `role-worker` · stored label: `worker:<subject>` · terminal: the same label |
| Communication | none at runtime; it delivers its receipt |

### Role: `bookkeeper`

| Field | Value |
|---|---|
| Word | `bookkeeper` |
| Tier | standalone |
| Rights | Creates no sub-agents; watches the procedure, as described in *The Bookkeeper* below. |
| Booking value | `bookkeeper` |
| Contract role | `worker` |
| Surfaces | spec: this chapter · skill: `role-bookkeeper` · stored label: `bookkeeper:<subject>` · terminal: the same label |
| Communication | none at runtime; it writes referrals into the record |

---

## Worker Functions

Workers are **functions on tier 3, not roles**. They create no sub-agents, so by the criterion above they are not roles; they are the different kinds of bounded work a worker carries out. A function is named in the subject of the stored label, while the booking value stays the one listed here.

| Function | What it does | Booking value |
|---|---|---|
| `prd-generator` | cuts and writes one unit of work from the material it is given | `worker` |
| `prd-builder` | carries out one unit of work and writes the proof of it | `worker` |
| `prd-evaluator` | checks one finished unit of work in a fresh context | `evaluator` |
| `researcher` | researches one subject in depth and delivers the result as a file | `research` |
| `transcriber` | takes a user transcript in, cleans it and checks it | `worker` |
| `finalizer` | runs the readiness checks that close the authoring of a memo | `worker` |
| `planner` | turns a finalized memo into a phase plan and hands it over | `worker` |

The two booking values `evaluator` and `research` are kept: they already exist as stored values and separate the fresh-context checker and the research fan-out from the other workers. The `planner` is a worker function, as in the role tree the system was designed from, and not a head role.

The workers know nothing of each other. A generating worker does not know which worker will build its unit, and a building worker does not know which worker will check it; yet all of them carry **one** common goal, and each of them works autonomously to complete its own part as professionally as possible.

The role information is neutral: what holds equally for generating, building and evaluating a unit is stated once, for all three, and none of the three is told about the other two. The will to carry the work out correctly is conveyed through the structure — through the cut of the unit, the conditions it is checked against, and the proof it must deliver — and not through direct words of encouragement.

---

## The Orchestrator

The orchestrator is the **authorized officer** of the system: like a holder of general commercial power of attorney, it can do almost everything, and therefore it carries the highest quality claim of all roles. Its limits are as clear as its reach. Its rights pass downwards only — every lead and every worker it creates holds fewer rights than it does —, and above it the user always remains the highest authority ([./10-spirit.md](/governance/spirit/)).

Its standing duty is to **keep the machine running** and to prevent blockages: work that has been commissioned has to flow, and a stop that nobody resolves is the orchestrator's failure, not the worker's. Because it is the most powerful agent, it carries the strictest duty to keep its own context clean — the more powerful an agent is, the more it has to guard its context, and this applies to the leads as well, which are in constant communication with their workers.

A memo is a **closed environment**. The orchestrator is obliged to close that environment correctly, so that the memo works as a link in a chain of memos; an orchestrator whose actions break that chain does not act in the spirit of this system. This is a setting by the user, not a derived rule, and it can be changed only by the user.

*Provenance: user statement carried over from an earlier draft that is classified as contaminated. Evidence level: assumption.*

### The Answer Duty

The user speaks freely. The orchestrator is the user's only real counterpart and answers in normalised language: the approved words of the anchor-term register and the rules SR-01 to SR-12 of [controlled-language](/spec/controlled-language/). Hand-overs between roles use the same words; the dictionary view of the register is the list of those words. The user is never asked to speak in this form.

---

## The Lead

The lead is a role between the orchestrator and the workers. It differs from the orchestrator in two ways: it never ascends to the orchestrator, and it has no contact with the user. It differs from a worker in one way: it creates sub-agents, while a worker does not. A lead is appointed by the orchestrator and focuses on carrying out the work it was given.

Research and rollout need differently cut leads, because the work in the two areas follows different rules. A **research lead** works completely and accurately: a document is read in full before it may be quoted, and the strict rules for each part of a revision apply, because the revision is the basis of all later work. A **rollout lead** may use a narrower search, because the information it works on already has a structure that is better suited to a targeted search. The booking value of both is `lead`; the area is carried in the subject of the stored label.

A lead communicates **only with the orchestrator**. It does not address the user, and it does not open a channel to another lead; a question it cannot answer goes to the orchestrator.

---

## The Bookkeeper

The bookkeeper is a **role of its own**. It is responsible for the correctness of the database entries and for the record always showing the current state of the project. It administers the project version history that sits outside the repository folder and sets strategic reset points in it; that history cannot be deleted by any other role and lies outside their reach. And it is responsible for every user input being recorded, because a user intent can only be traced back — and shown to have been the user's view until the end — when every input that formed it was recorded along the way.

The bookkeeper watches the **procedure, not the practical work**. It does not check folders or review results; it checks that the mandatory entries were made and that the procedure was kept, and it intervenes quickly where the procedure was broken, to strengthen the spirit of the system and the efficiency of the work. It stands alone in the role groups, with no edge upwards or downwards to the orchestrator, the lead or the workers.

### The Bookkeeper Is a Calculator

The bookkeeper is a calculator driven by a cadence, not a reader. The orchestrator cannot skip it. It is woken at the breakpoint of the tool-call cadence — the same cadence the session breakpoints are counted at — and not called up by any role. Its one data source is the queue that the one write path fills: every write of every other role leaves one pending item in it, in the same commit as the write itself. When it is woken, the bookkeeper works the queue to its end, including items that arrive while it works. There is no interval and no wake-up per write.

### The Five Surfaces

| Surface | What it calculates | Comparison set |
|---|---|---|
| `carrier-checks` | the carrier checks of the memo | every verdict line of the checks |
| `parity` | the flat stock against the database, axis by axis | the compared rows of each axis; an axis that compared nothing is red |
| `reporting-duty` | the open work items that carry a disposition | all open work items; none open is not measurable |
| `chronicle` | one line of a time line per run, without grading | the memo-level breakpoints since the previous run |
| `user-inputs` | the completeness of the user inputs in the record | the harness session |

The completeness of the user inputs is calculated against the session the user worked in, never against the record's own copy of itself, and it is never green without a comparison: a record can be consistent with itself and still miss what nobody recorded. Every surface names the side it counts from and how much it compared.

### Five Construction Rules

It never blocks and always calculates. Five rules hold the bookkeeper to that, each of them built and tested:

- It uses no lifecycle event that can block.
- A wake-up is not a start.
- Arrival order is a race, so processing is idempotent.
- It does not rely on the parent field of an agent.
- It checks its own carriers before it calculates.

### The Referral

A referral hangs at the block and goes to the lead, not to the worker that caused it and not to the orchestrator. The lead carries the phase and with it the whole block, while a worker works on units smaller than a block; the one who can work a finding off at the block is therefore the lead. A referral has exactly two states, open and resolved, and no way to be deleted. Only the lead resolves it, once, with a note. A phase does not close while a referral is open or a queue item is pending.

### Findings Go Into the Order Sheet

A finding of the bookkeeper goes into the order sheet of the responsible lead, never into a lesson. A lesson is read by whoever looks for one; an order sheet is read by the lead who has to act.

### The Bookkeeper Checks the Question Permit

The bookkeeper establishes whether the orchestrator kept the four care rules of the question permit ([./03-permits.md](/governance/permits/), *The Question Permit*). The orchestrator cannot establish it about itself without turning the permit into a self-assessment, and the user is not the checker of a procedure. Three of the rules the bookkeeper computes over the record: the admission test of the question form, the conversation threshold of the carrier block as a binary verdict, and the search of the own stock as a trace on the read path before the question was put. The fourth it reads: it checks that the measurement names its comparison set, not that its number is right.

### The Blind Spot

The bookkeeper sees what was entered, never what was not entered. A row that nobody wrote leaves nothing to calculate over. The other side is covered by the phase matrix ([/specification/orchestrator-role/](/specification/orchestrator-role/), section *The Phase Matrix*), which holds every order of a running phase against the carriers it has to fill.

### Supervision of the Lead

The bookkeeper supervises the lead. The supervision of the roles is asymmetric: workers are supervised closely, the orchestrator is supervised by the user, and the lead stands between them with much room. The bookkeeper fills that middle tier with two means — the referrals it counts per phase, with their age, and the phase gate it holds. It does not intervene in the work.

### Strategic Version Points

The bookkeeper sets the strategic version points of the project version history. There are four occasions:

- before the rollout begins
- at every phase close
- before the local merge into the main line
- at the landing

The version history lies outside the repository folders, has no remote, and cannot be deleted by any other role; the deletion protection itself is built elsewhere.

### The Orchestrator's Triple Task

The orchestrator carries three tasks at once: the conversation with the user, the working off of the run, and the holding together of the stock. Measured on one memo, 5 of 236 open work items carried a disposition — 2.1 %, with all open work items of the memo as the comparison set. A role that carries three tasks at once does not also supervise the procedure; the supervision of the procedure is the bookkeeper's.

The watch of a running phase is enforced at the turn end of the leading session: while a worktree of a running phase exists and no watch is booked, the turn end is refused with the two commands that arm it. A command-line leaf cannot call the harness tool that creates the timer; what is deterministic is the trigger, not the call. The bookkeeper's finding for an unarmed watch stays the second carrier.

---

## The Author

The author is the role that writes a memo. It takes input in, captures topics and work items, writes the chapters, asks the questions, commissions research and finalizes. It makes its mandatory entries into the record **during** the work, not at its end: an entry made only after the revision is complete has lost the moment it was meant to record, and an authoring step that leaves a carrier empty has to name the reason when authoring ends.

The author is bounded against the orchestrator by time: the author's span runs up to the finalization of a memo, the orchestrator's span starts with the rollout. The two never hold the same memo at the same time.

The author is a role and not a worker function, by the criterion at the top of this chapter: it commissions research and creates research sub-agents for it. The transcriber and the finalizer of the role tree remain worker functions; the author **MAY** hand work to them, as any role may hand work to the functions below it.

---

## Gradient and Horizon

The lower a role sits, the more practical its instructions are. The large idea of the system is shaped from the theoretical into the practical on the way down, until it reaches the worker as a concrete instruction: a worker deep in a problem needs no theory of the system, it needs to know what to do.

The horizon widens on the way up. The worker thinks of carrying out and evaluating its own unit of work. The lead thinks of the work in the context of the other units of its phase, and somewhat beyond. The orchestrator keeps the phases and the current state in view, oversees the whole memo, and sees its own work in the chain of the tasks before and after it.

Each role therefore has a goal horizon of its own: the worker's horizon is its own assignment, the lead's horizon is the phase, the orchestrator's horizon is the memo. A role that does not know the goal of its level cannot judge its own contribution, which is why each role carries the sentence that states where it stands in the system and what it answers for.

*Provenance: user statement carried over from an earlier draft that is classified as contaminated. Evidence level: assumption.*

---

## Equal Standing at the Role Level

The roles stand equal at the role level, not on the plane of the persons or bearers who carry them. The question whether a worker is as important as the architect confuses a role with its bearer: a role is a part of the system's carrying structure, and a bearer is whoever fills it at the moment. The equal standing is a statement about the roles. What a distribution among them looks like follows from it, and is stated in [./10-spirit.md](/governance/spirit/).

The work divides into content and form. Content is basically more work than form — if form outweighed content, the system would be a bureaucratic monster that produces structure and little else. The higher a role stands, the fewer bearers it has, the more theoretical it becomes, and the more its work is about form. Without form there is no structure and no scaling; without workers there is no content for the form to shape. Neither half stands without the other.

The quantities follow from this: one system architect, one or two orchestrators or one per strand, many leads, and still more workers. The architecture only becomes necessary once there are many workers. If the number of workers falls away, the reason for everything above them falls away with it.

The message that reaches each role differs on purpose; that difference is not a breach of the equal standing, as [/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/) states.

---

## The Tool Duty

Every role receives the tools its work demands. The reason is the weakest link: the chain gives way at its weakest point, so a role without its tools is not a matter of comfort but a risk for the whole system, and it is recorded as a system risk.

The duty is checkable. The measuring rule compares each role against the list of tools its work demands, and a role for which the list is missing or unmet counts as a risk. The comparison set is the five roles of the table in *Role Vocabulary*. A role without its tools is a finding to be named, not a state to be tolerated.

---

## The Asymmetry of Supervision

The supervision of the roles is asymmetric, and this chapter names that as a finding. Workers are supervised closely. The orchestrator is supervised by the user, and the norm text around it is dense: a chapter of its own, a status report at an interval, bundles of questions and a duty to recommend. The lead stands between the two, holds much power, and is supervised in the procedure by no one — the least supervised of the three roles. The bookkeeper fills the middle tier, as the section *Supervision of the Lead* describes; it is not repeated here.

The null finding is stated with its measurement. On 2026-09-28, of 122 chapters, 0 of 122 carried a title for the lead, the worker or the bookkeeper, and exactly 1 of 122 carried a role name, the orchestrator role. The measurement was repeated on 2026-10-12 over the chapters of all five families of this tree: 1 of 132 titles names a single role (the orchestrator role), and none names the lead, the worker or the bookkeeper. The roles now stand together in this chapter. This section builds no new supervision procedure; it names the finding and the means, the bookkeeper.

The warning of the user stays in his words. *Original wording (German):* „Und da müssen wir aufpassen, dass es nicht Elite wird. LEAD.“ In English: the lead must not become an elite.

---

## Role Group Tree

The roles are ordered in three groups, from the top down `orchestrator` > `lead` > `worker`, and one position stands outside that order: the bookkeeper. The table gives every booking value exactly one row; a worker function is booked under the value of its row in *Worker Functions* and has no row of its own.

| Role | Group | Rank | Creates sub-agents |
|---|---|---|---|
| `orchestrator` | `orchestrator` | 3 | yes |
| `author` | — | — | yes |
| `lead` | `lead` | 2 | yes |
| `worker` | `worker` | 1 | no |
| `bookkeeper` | `standalone` | — | no |
| `evaluator` | `worker` | 1 | no |
| `research` | `worker` | 1 | no |

The rank counts upwards — the higher the rank, the higher the group — and so runs opposite to the tier numbers of *Role Vocabulary*. A dash marks a value that is not decided by the role table. The author holds tier 1 beside the orchestrator, but the table assigns it to none of the three groups, so no rule of this chapter places it above or below another role. The one dash with a different reason is the bookkeeper's rank: the standalone position carries no rank by definition.

The tree is not a reporting line. It only orders which role a session may take on and into whose work a role may intervene. A session may carry more than one role, but only downwards: every further role it takes on lies below the one it already holds.

---

## No Ascent

A role is taken on only downwards. An orchestrator may take on the role of a lead; a lead never takes on the role of the orchestrator; a worker takes on no other role. The bookkeeper takes on no role of a group and is taken on by none. A change sideways within the same rank is not a step downwards and is not covered by this rule — a `worker` does not become an `evaluator` by it. A role whose group the role table does not decide takes on no other role and is taken on by none, until the table decides its group.

The machine form is `mayBecome(from, to)` of the role table in the reference implementation. How the rule is enforced when a sub-agent is created is specified elsewhere.

---

## The Lead Owns the Phase

The phase is the granularity of the lead. The lead cuts the units of work of its phase — itself, or through a planner that belongs to the worker group —, distributes the work items so that every worker that generates a unit of work receives exactly that unit's share, and merges at the end of the phase. Whoever writes the cut, the responsibility for it stays with the lead.

The distribution is checkable. The shares of a phase are pairwise disjoint, and together they cover the living stock of the phase. `memo phase shares` computes both and refuses a phase whose shares do not add up; no generating worker starts before that check is green.

---

## The Planner Belongs to the Worker Group

The planner belongs to the worker group. The reason is the criterion of a role: creating sub-agents lifts a role above the worker group, and the planner creates none. It is booked as `worker`, and its function is named in the subject of the stored label.

The placement rests on that criterion, not on a track record. Planning held apart from execution has carried where it concerned the phase plan, and it has not carried where it concerned the cut of the units of work. The booked role `planner` itself has never been applied in a run that went to its end, so there is no evidence for it or against it, in either direction.

---

## Duties Anchored From the Executing Layer

This section gives each duty of the executing roles that so far stood only in the executing layer — in a skill, a template or a test — a normative home with its own identifier. Nine such duties had no anchor in the specification. A role duty that lives only in the executing layer falls out at every re-derivation of that layer, as a positive-control duty once already did; anchored here, it survives the next derivation. Each identifier is a spelled-out English name built from the role, the word duty and the subject, and it is the stable token by which skills and templates cite the duty.

### Worker Duty: Self-Acceptance

**Identifier.** worker-duty-self-acceptance

Before handing in, the worker **MUST** run every machine-checkable acceptance condition of its own order itself, with the same commands that the reviewer runs afterwards. It delivers this self-acceptance as one script: one call yields one table with, per condition, the command, the exit code measured before any pipe, the count with its comparison set, the verdict and the negative case. Every condition carries at least one negative case — a constructed violation that the check must catch, measured red and then reverted without residue. No count is green over an empty set; a comparison set of zero is a finding, never a pass. The verdict `OK` is allowed only when every satisfiable condition is measured green; otherwise the verdict is `PROBLEM` with the red condition named in plain words, and an `OK` without a green measurement of its own is a false statement. The duty sits with the worker because a failure costs it minutes while context, tree and tools are open, whereas the same failure after handing in costs a reviewer, a new order and a second round; the reviewer verifies and does not measure anew.

### Worker Duty: Completion Receipt

**Identifier.** worker-duty-completion-receipt

Every worker **MUST** write its completion receipt after its commit and before it ends. The receipt names the commit and the paths of the result inside that commit; a receipt with the verdict `OK` over files that are not committed is refused. A receipt is never overwritten: a second landing is a new attempt with its own number.

### Worker Duty: The Verdict Carries the Result

**Identifier.** worker-duty-verdict-carries-result

The verdict of a receipt **MUST** carry the result of the work, never the fact that the agent ran; that the agent has run is already shown by the receipt existing. `OK` means that the order is really fulfilled, `PROBLEM` means aborted or an own check red. The opening word of the note and the field say the same, and a contradiction between them is refused when the receipt is written and reported when it is checked.

### Worker Duty: The Base of the Result Paths

**Identifier.** worker-duty-result-base

The receipt **MUST** name the base against which its result paths are resolved — for a rollout worker its own work tree — and store that base in the receipt. The check resolves the paths against the stored base, not against the root of the checker; otherwise the honest worker is blocked and a receipt that points at an untouched project file passes. The base itself must be an existing directory inside the project root, and every named path must be a non-empty regular file inside the base.

### Evaluator Duty: Completion Receipt

**Identifier.** evaluator-duty-completion-receipt

The evaluator **MUST** also write a completion receipt before it ends, and its verdict field carries its judgement: its `PASS` becomes `OK`, its `FAIL` becomes `PROBLEM`. The same binding as for the worker applies, for the same reason: that the evaluator has run is shown by the receipt existing. Without this duty at the evaluator, receipts carried `OK` for having run while their notes opened with `FAIL`.

### Lead Duty: The Slim Worker Type

**Identifier.** lead-duty-slim-worker-type

The lead **MUST** start a rollout worker as the slim agent type: an explicit tool allow-list without the tool that spawns agents, no additional servers, the required skills preloaded and the gate hooks on board. When that agent type is not installed in the environment, this is a finding: the lead records it, continues with the standard type and does not claim to have started a slim worker.

### Lead Duty: Name at Spawn

**Identifier.** lead-duty-name-at-spawn

The lead **MUST** spawn every worker with a name composed of role and subject, in the form `worker:prd-07`, and put the human sense — a short title of the order — into the description. The name is the machine label and the description is for people; free text in the name is not allowed.

### Lead Duty: The Label Line in the Prompt

**Identifier.** lead-duty-label-line

The composed prompt of every worker **MUST** carry the machine-readable label line verbatim, with the value composed for the name at spawn. It is the only join key that the agent itself can write into its artefacts, and the line by which the completion gate recognises the worker. Without it the gate does not recognise the worker and lets it through, because an unlabelled agent is passed on purpose rather than a foreign one being blocked.

### Evaluator Duty: Name at Spawn

**Identifier.** evaluator-duty-name-at-spawn

The lead **MUST** spawn every evaluator in a fresh context, without carry-over from the work it checks, with a name composed of the role `evaluator` and the subject, and with a description that states that the context is fresh.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./03-permits.md](/governance/permits/) — the permits below the roles.
- [./06-subagents.md](/governance/subagents/) — how a role creates sub-agents with fewer rights.
- [./10-spirit.md](/governance/spirit/) — the user as the highest authority and the spirit effect of the role cut.
- [/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/) — the message that differs per role, which does not contradict the equal standing.
- [/specification/orchestrator-role/](/specification/orchestrator-role/) — the duties of the orchestrator in a run and the four-surface rule for role words.
- [/spec/harness-registry/](/spec/harness-registry/) — the contract roles the working roles project onto.
