---
title: "Permits"
description: "A **permit** is the smallest named unit of the permission system. It sits below the roles and gives a name to a collection of SOPs and skills that several roles need for the same kind of work. This..."
governance_version: "0.1.0"
spec_file: "03-permits.md"
order: 3
section: "Governance"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "governance/0.1.0/draft/spec/03-permits.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: governance/0.1.0/draft/spec/03-permits.md."
---


A **permit** is the smallest named unit of the permission system. It sits below the roles and gives a name to a collection of SOPs and skills that several roles need for the same kind of work. This chapter defines what a permit is, where it sits, how many of them there should be, what it binds to, and which machine token names it. Its validity over time — renewal and expiry — is the subject of [./04-permit-validity.md](/governance/permit-validity/).

---

## The Permit

A permit is a **named collection of SOPs and skills**. It gives a name to a collection that would otherwise have to be listed again for every role that needs it: whoever holds the permit has read the SOPs and skills it collects, and whoever requires the permit requires all of them at once. A permit is bound to a **task**, a **command** and a **location** — the three things the permission system can check before work begins. The permit for working in the repository folder of the workbench is the standard example: a researcher who only reads there and a coder who also creates, updates and removes there both need to understand the laws of that folder, and the permit is the place where that shared understanding is collected.

---

## A Layer Below the Roles

Permits form a layer **below** the roles. They normalise knowledge across roles: what several roles share is collected once in a permit instead of being repeated in each role, and the context each role carries is smoothed by it. A role is built on top of permits and adds what only a role has.

The difference between a role and a permit is one capability: **only a role may create sub-agents**. A permit never carries that right, however much knowledge it collects, and holding many permits does not turn an agent into a role. The roles and the criterion that defines them are specified in [./05-roles.md](/governance/roles/).

---

## Keep the Number Small

The number of permits **SHOULD** stay small. A permit is created only for a very fundamental unification — knowledge that genuinely recurs across several roles and that a role cannot do without when it enters a given task, command or location. Knowledge that only one role needs belongs to that role, not to a permit. Every additional permit is another unit that has to be read, renewed and checked; a permit that collects knowledge only one role uses adds that cost without adding the normalisation that justifies a permit in the first place.

---

## Binding

A permit binds at **two** points, and it **MUST** bind at both: at the **reading proof**, which shows that the SOPs and skills of the permit were read, and at the **tool list**, which limits what the holder can technically do. Reading binds the holder by content; the tool list binds the holder by mechanism. Measured against the same set of calls, a gate keyed on reading alone either refuses almost everything or lets almost everything pass; only the two bindings together give a gate that works between those extremes.

A permit **MUST** also carry its **location**. A permit without a location is an attribute of its holder — *this agent holds the repository permit* — and leaves open which repository it may touch; that is ambient authority, and it leaves the confused-deputy problem open. A permit that carries a checked location is a capability — *this agent may read this repository* — and closes it.

---

## Machine Token

The English machine token for the subject of this chapter is `permit`. It is used in the specification, in code, in tags and in field names alike, and it is not translated on any of these surfaces. There is **no second word** for the same subject: a surface that needs a token for it uses `permit` and does not coin its own. A translated display label rendered above a field whose stored value is `permit` is a rendering, not a second token — the distinction between a display label and the machine token beneath it is specified in [/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/). Moving existing tags and field names onto this token is migration work and is not part of this text.

---

## The Cut by Task, Command and Location

A permit is cut along three axes, and each is its own binding:

- **Task:** the entry points of a unit of work that require the permit (see *Permits in the Life Cycle of a Unit of Work*).
- **Command:** the tool rules the permit carries, written in the syntax of the harness permission rules — a tool name, optionally with a specifier, such as a path pattern for a file tool or a command prefix for a shell tool. A placeholder for the location lets one rule serve every location of the permit.
- **Location:** a project-relative pattern, such as `repos/*` for one repository directory. A location **MUST NOT** start with `/` and **MUST NOT** contain `..`; a single `*` stands for exactly one path segment.

A permit **MUST** declare a location, a reading binding (the SOPs it requires) and a tool list; a permit missing any of the three is invalid. The location of a call is the target path of a file tool relative to the project root. A target inside a git worktree is located at the repository the worktree belongs to, wherever on disk the worktree lies, so a worktree of a repository carries that repository's permits. A shell call is located by its working directory; the path arguments of a shell command are not evaluated, and that limit is part of the cut.

The field list of a permit is closed. A field that bounds validity beyond the two triggers of expiry is not part of it, and a validator reports any unknown field instead of carrying it along.

---

## The Reading Basis and the Writing Permit

Repository work rests on two permits, and only on two:

- **The reading basis** (`repo-worker`) collects what everyone who works inside a repository directory needs: the laws of the workbench and the git conventions of the organisation. It allows reading, searching and the read-only history commands at that location.
- **The writing permit** (`repo-coder`) is **built on** the reading basis. It adds the node standard of the organisation to the reading, and writing, editing, staging, committing, creating worktrees and running tests to the tools.

A permit built on another **MUST** resolve to the union of both: its required SOPs are those of the base plus its own, and its tools are those of the base plus its own. Holding the writing permit therefore carries the reading basis. A chain of permits **MUST NOT** form a cycle. Destructive operations — removing a worktree, recording a snag, deregistering a work item — are carried by neither permit.

---

## The Reading Limit of a Comment

The right to write a comment about a unit of code rests on having **read in full** the unit the comment speaks about. The **scope of the comment** decides which unit that is:

A comment about a method needs the method read in full, a comment about a class needs the class read in full, a comment in the head of a file needs the file read in full.

This limit lies **inside** an existing permit, and it is **not a new permit**. The writing permit says where work may happen; the reading says what a comment may be written about. Neither replaces the other: holding the writing permit for a repository does not entitle a comment about a class that was read in part, and a full reading does not entitle a write outside the permit's location. A keyword search is not a reading; it is declared as a keyword search under the principles of conduct in [./10-spirit.md](/governance/spirit/), and this chapter does not define reading a second time.

---

## Root and Project

Permits exist inside a **project** only. The level of a call is found by ascending from its working directory: the first directory carrying the project registry is a project; a directory carrying the workbench session folder and the projects folder is the workbench root; everything else lies outside the workbench. At the root a closing SOP **MUST** refuse the release, with the reason that the root level carries no permit; outside the workbench the permit layer decides nothing. A project that carries no registry of its own is seen from the root and carries no permit, which is the safe side.

---

## Permits in the Life Cycle of a Unit of Work

A permit is a precondition of the life cycle of a unit of work. The reading basis is required when a unit is generated, when it is built and when it is evaluated; each of those entry points **MUST** name the permit twice, as prose and as a machine-readable mark, and a hook refuses the entry point while its holder has no valid permit. The writing permit is not tied to an entry point: it binds through its tool list at the location where the writing happens.

Per stage of the life cycle — generate, execute, evaluate — a permit names the additional skills that stage needs. The naming is a declaration; it enforces nothing beyond what the entry points and the tool list already enforce.

---

## The Holder and the Three-Valued Check

Destructive rights do not rest on a permit as long as the holder cannot be checked; until then they keep running through deny rules and the user's release. The holder of an identity-bearing or destructive command is checked by comparing the name the command states with the name the harness gave the calling context. The check has four outcomes, and contradiction and absence of a statement **MUST NOT** be folded together:

| Outcome | What lies on the table | Destructive class | Reading, authorising, writing |
|---|---|---|---|
| match | the stated name and the harness name agree | not granted by a permit — the user's release is asked | allowed |
| contradiction | both are present, and they differ | refused | refused |
| no statement | the harness reports no sub-agent, or no harness name is readable | refused by the permit — the user's release is asked | allowed |
| malformed | a command that can carry a name carries none, or the name does not parse | refused | refused |

Folding contradiction into absence of a statement yields a gate that reports green over nothing; folding absence of a statement into contradiction yields a gate that blocks every main session, including the one writer of a memo store that commits on behalf of a worker. A command that has no slot for a name is decided by the harness alone. A check never rewrites the command it judges.

---

## Refused Commands Are Recorded

Every refusal of a permit gate **MUST** be recorded — in warn mode as well as in block mode — in an append-only ledger of the session: the gate, its verdict, its decision, the class of the command, its verb where it has one, and a hash prefix of the command. The ledger **MUST NOT** hold the command text, because a command can carry a secret. Without this record the effect of a gate stays a claim, and the decision to make it sharp has no measurement to stand on.

---

## An Asserted Identity Is Not Proof

An identity that an agent asserts about itself **MUST NOT** be accepted as proof when a permit is checked. A name the agent writes into a commit or a receipt is self-reported; unless it is verified against the agent identifier that the harness assigns, the whole permit model rests on self-disclosure. A permit check therefore compares the claimed identity with the identity the harness records, and a claim without that match counts as unverified.

---

## A Write Onto a Foreign Work Item Is Refused

A write that changes the status of a foreign work item — one held by another order or another agent — **MUST** be refused. A permit is bound to a place, and a work item outside the place of the permit belongs to its holder; setting it to done without disposition and reason records work that was never done. The refusal names the work item, its holder and the permit that would be needed, so that the agent hands the change to the holder instead.

---


## The Question Permit

The orchestrator role holds the right to put a question to the user only once it has met four care rules. The right sits **at the role**, not at the question: how a question has to look is settled by the question interface ([/specification/question-interface/](/specification/question-interface/)), and this section settles who may put it. The two places point at each other and neither repeats the other.

No rule of this kind existed before this section. That is stated as a measurement: a keyword search (not a search by concept) for `sorgfaltsregel`, `zulassungstest`, `frageberechtigung`, `entitled to ask`, `permitted to ask`, `may only ask` and `duty of care`, without regard to case, found 0 hits over 1,782 Markdown files on 2026-09-28.

### The Four Care Rules

The four rules are demanded together, never one instead of another. Each names how its keeping is checked: **computed** from the record, or **read**.

| Rule | Derived from | Check |
|---|---|---|
| The question passes the admission test of the question form: it stands in the `questions-json` block and carries at least two real options in the form `A) text`, a recommendation with its reasoning and the six lifecycle fields | the question interface | computed — the parser checks the form already |
| The carrier block lies above the conversation threshold, measured as the binary completeness of all mandatory sections of the block — a verdict, not a number | the conversation threshold of the block | computed — the completeness of the mandatory sections is measured in one run, without a new tool |
| The measurement the question rests on has run and names its comparison set; a question about something the orchestrator could have measured is not admissible | the marking duty of a measurement | read — that the comparison set is named can be checked, that the number is right cannot |
| The own stock was searched first — the database, the memo system, the existing topics and the answered questions; asking an answered question again is the most expensive fault on this channel | the search duty of the record | computed — the search leaves a trace on the read path |

### The Bookkeeper Establishes Compliance

Whether the rules were kept is established by the bookkeeper ([./05-roles.md](/governance/roles/), *The Bookkeeper*), not by the orchestrator itself and not by the user: a role that checks its own right checks nothing.

### Rejected, Not Discarded

A question put without its care rules met is **rejected, not discarded**. It stays in the stock under its id with the status `open`, carries the missing care step as its blocking reason, and stands with that reason among the held-back questions of the revision preface — the same place the conversation threshold uses for a question it holds back. The way to the release is therefore always named: run the missing measurement, search the stock, lift the block over the threshold. The rejection is recorded in the append-only ledger of *Refused Commands Are Recorded* above, because a question that is rejected again and again is a symptom, not a single case.

### The Duty to Ask Takes Precedence

The permit is read together with the duty to ask of the behavioral guardrails ([/specification/behavioral-guardrails/](/specification/behavioral-guardrails/), C13): below roughly 75 percent of planned implementation the question MUST be asked, and rejecting the intent without a question oversteps the competence of the role. A question that rule demands is never blocked by this permit; the missing care step is done first, with priority, and the question is not suppressed. A care rule that made a mandatory question disappear would only dress the overstepping in a procedure.

### The Worker Boundary

Systemic changes are discussed by the orchestrator with the user, in a defined process. A worker does not attempt a systemic change: it reports the change it sees to its lead, and the change travels upwards from there. The boundary follows the one-way direction of the role groups ([./05-roles.md](/governance/roles/)) — intervention runs downwards, and a right never travels upwards.

---

<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./04-permit-validity.md](/governance/permit-validity/) — renewal and expiry of a permit.
- [./05-roles.md](/governance/roles/) — the roles above the permits and the criterion that separates a role from a permit.
- [./06-subagents.md](/governance/subagents/) — how a permit travels into a sub-agent and shrinks on the way.
- [./08-runtime-enforcement.md](/governance/runtime-enforcement/) — the hooks that check a permit before a command runs.
- [/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/) — machine tokens versus display labels.
