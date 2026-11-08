---
title: "Writing Conventions"
description: "A **convention** is a standing rule the whole organization follows — how the orchestrator talks to the user, how a repository is scaffolded, how code in a given language is formatted. A convention is..."
spec_meta_version: "0.3.0"
spec_file: "06-conventions-writing.md"
order: 6
section: "Meta-Spec"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "meta-spec/0.3.0/draft/spec/06-conventions-writing.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: meta-spec/0.3.0/draft/spec/06-conventions-writing.md."
---


A **convention** is a standing rule the whole organization follows — how the orchestrator talks to the user, how a repository is scaffolded, how code in a given language is formatted. A convention is not a per-memo decision; it is a body of standards that applies across memos and sessions. This chapter specifies how a convention is *written* and *registered*: the format it takes as prose, and the mechanism that makes it a first-class, findable, enforceable rule rather than a paragraph buried in a chapter. The rule is deliberately conservative — conventions reuse an existing registry primitive; writing a convention **MUST NOT** introduce a new one.

---

## How a Convention Is Written

A convention is authored prose-first, as a readable list or table in the chapter that owns its subject. The authored form:

- **Names each rule addressably.** Each convention carries a stable, short identifier (for example the `J1`–`J12` communication conventions) so it can be referenced, discussed, and registered without ambiguity.
- **Lives in one owning chapter.** The readable body of a convention stays single-source in the chapter whose subject it is — the communication conventions in the communication chapter, the formatting conventions in the formatting standard — and is not restated elsewhere.
- **Is registered separately from where it is described.** The prose says *what* the rule is; a policy block ([the registration mechanism](#the-policy-block-mechanism) below) records *how* it is activated and tracked. The two are kept apart so a rule is never normatively duplicated: the chapter is the readable source, the policy block is the machine registration, and neither claims to be the other.

Writing a convention therefore has two moves: author the readable rule in its owning chapter, and register the set as a policy block. It does **not** involve inventing a bespoke store or a new kind of registry entry.

---

## The Policy-Block Mechanism

Conventions are registered as a **policy block** in the session namespace registry ([/session/namespace-registry/](/session/namespace-registry/)), which is the **normative home** of the policy-block mechanism. The policy block is the existing registry primitive for "a body of standards that is always findable, of which a sub-set must be read by a checkpoint" — the same `kind:"policy"` block that already registers the development standards. A convention set reuses it as-is. This chapter does **not** re-specify how a policy block behaves — that would be the double normativity the next section forbids — but summarizes, informatively, the three properties that bear on writing a convention:

> **Informative** (normative source: [/session/namespace-registry/](/session/namespace-registry/)). A policy block reserves a namespace and contributes its member rules but is never a gate predecessor (its `requires[]` is empty and it feeds no precondition edge); it gates only through the separate assertions axis, as a redirect at a named checkpoint, never as a hard block; and its registration follows the trinary `REQ-SS-POLICY`, so being registered does not make it gate the way an SOP-instance block gates — it is findable by construction and enforced only at its checkpoints.

Because the mechanism already exists, registering a new convention set is a matter of adding its rules to a policy block, not of designing new machinery. This is the YAGNI discipline in force: the standards body ("a set of conventions that must be followed") is exactly what a policy block models, so a convention set **MUST** register as one rather than spawn a parallel primitive.

---

## No Double Normativity

A convention has one normative home. When a convention set is registered as a policy block, the readable table in its owning chapter remains the human-facing source, and the policy block holds the activation-and-tracking registration — the two do not both assert the rule. A reader who wants to *understand* a convention reads the owning chapter; a tool that must *enforce* it reads the policy block. Keeping the description and the registration in separate places, each single-source, is what prevents the two copies from drifting.

The communication conventions `J1`–`J12` are the worked example: their readable table lives in the communication chapter ([/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/)), and their registration lives in the session policy block ([/session/namespace-registry/](/session/namespace-registry/)). The table describes; the policy block registers; neither restates the other.

---

## The Anchor-Term Convention

An **anchor term** is a term whose meaning the organization fixes once and then reuses everywhere, so that a reader — human or model — recovers the same meaning from the word wherever it appears. The anchor-term convention is the org-wide, smallest-common-denominator rule for grounding such terms: every family and every project applies it identically, and a family that does not fit the rule does not fork a local variant — it sharpens this meta-spec convention and works forward from there. The convention is itself a convention, authored and registered exactly as this chapter prescribes: its readable rules live here, and the set of grounded terms is registered as a policy-block adjunct — **not** as a new registry primitive.

A term qualifies as an anchor term only when it carries all of the following **four-plus-one** mandatory properties:

| Rule | Property | What it requires |
|---|---|---|
| **AT1** | **One canonical label** | The term has exactly one preferred label; alternative wordings are recorded as known mis-labels, never used as the term. |
| **AT2** | **One owning chapter** | Exactly one chapter carries the in-document definition; no other chapter restates it (No Double Normativity, above). |
| **AT3** | **Explicit negative delimitation** | The owning chapter states what the term is **not** — the neighbouring meanings a reader's prior would otherwise supply. |
| **AT4** | **Usage obligation** | The term is used *functionally* in the chapters that need it, not merely declared once in a glossary. Grounding comes from consistent use, not from the definition alone. |
| **+AT5** | **Lived congruence** | The process the term describes actually behaves as the term says. A definition the guardrails contradict is not grounded; text and behaviour are corrected together. |

`AT1`–`AT4` fix the term on the page; `AT5` is the "plus one" that binds the page to the running process — the meaning is anchored only when the system lives it.

**Registration by reference, not repetition.** The set of anchor terms is held once, in an org register, and referenced from wherever a term is used — the meaning is fixed in one place and pointed at, never copied. The register borrows its *mechanics* from the OASF tag standard (a stable identifier that outlives a re-labelling, a versioned immutable record, known mis-labels as a warning signal) and its *entry fields* from SKOS (canonical label, definition, and negative delimitation as a sharpened scope note). It borrows neither URIs, triples, nor a reasoner: this is a controlled vocabulary carried by the existing store-and-generator pipeline, not a semantic-web stack. Each entry carries a stable `id`, the canonical `label`, the `definition`, the `negativeDelimitation`, the known `misLabels`, a `version` (SemVer), the `owningChapter`, and an optional `namespaceToken` for cross-family qualification.

**The register is an adjunct, never a new primitive.** Consistent with this chapter's opening rule, grounding a term **MUST** register through the existing `kind:"policy"` block; it **MUST NOT** spawn a parallel registry machine. The register store is rendered deterministically from its authored source by the shared generation-script line, and a warning-only usage lint reports drift — a term defined twice, a term never used, a missing negative delimitation, a known mis-label appearing in prose. Enforcement is warn-not-block: the convention guides authoring, it never gates a build.

**Form of a term.** How a term is written is fixed in the [Styleguide](/spec/styleguide/): the word-formation rule (a coined word is written out in full, a compound is built from the full word) and the character strings of internal identifiers.

**Deliberately out of scope.** The convention grounds *terms*; it does **not** add a glyph or sigil notation for marking them in prose (the words carry the grounding, not a decoration), and it does not import the single-token framing, the consciousness reading, or the triple-store machinery from the research that motivated it.

---

## Neutral Register — No Sensational Language

Outward-facing text — specifications, skills, and published docs — uses a **neutral register**. Sensational or extreme framings that work in conversation do **not** cross into the written artifact: a vivid slogan buys attention at the cost of precision and ages badly. This is the addressable convention **`NR1`**: when a strong phrase is tempting, neutralize it to the plain, precise term rather than carry it onto the page.

| Sensational | Neutral |
|-------------|---------|
| "holy grail" | "biggest lever" |
| "poisoned" | "derailed" |
| "the spec is holy" | "specification authority" |
| "smart / dumb zone" | "a curve, not two zones" |

The register applies to the written artifact only; a spoken or in-conversation framing is unaffected — the rule governs what reaches the page, not how a point is made aloud. Like the other conventions in this chapter, `NR1` reuses the existing policy-block mechanism (above) rather than a new registry primitive: its readable rule lives here in its owning chapter, its activation is tracked as a policy-block member, and the two do not restate each other (No Double Normativity).

---


---

## Formality Register — NR2

`NR1` fixes that outward text stays neutral; `NR2` fixes the orthogonal **formality axis** — how formal or colloquial the wording is, scaled by audience. The written artifact defaults to a **formal, precise register**. A **working register** — the way one writes among colleagues in an internal note — is permitted only in inward-facing working artifacts (memos, working notes) and **never crosses to an outward artifact** (spec, skill, published doc); when inward substance is promoted outward, it is rewritten to the formal register in the same move.

The formality axis is orthogonal to *locality* (where the bytes live) and to *direction* (who the reader is). A note inside `.memo/` may use the working register; the moment its substance is promoted to a spec or a skill it is re-registered as formal. The failure `NR2` prevents is the colloquial phrase carried verbatim onto the page — content-correct, register-wrong.

`NR2` composes with, and does not restate, the axes owned elsewhere: the inward/outward direction and the `J1`–`J12` trust layer live in the communication chapter ([/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/)), and one-language-per-artifact likewise. `NR2` adds only the formality dimension. Like the other conventions in this chapter, `NR2` reuses the policy-block mechanism rather than a new registry primitive: its readable rule is single-source in this section, its activation is tracked as a policy-block member, and the two do not restate each other (No Double Normativity).

---

## An Identifier Is Unique Along the Reading Path

A normative identifier **MUST** be unique along the reading path on which it is used. When a document assigns an identifier that a specification page on the same reading path already carries normatively, a reader who follows the path meets two rules under one name. Before a new identifier is assigned, the pages on its reading path are searched for it; a hit calls for a new identifier, not for a second meaning.

---

## The Right to Comment

A comment about a unit MUST NOT be written by a reader who has not read the unit in full. The unit is set by what the comment speaks about — a method, a class, or the whole file for a comment in the head of a file — and the right reaches exactly as far as the reading.

A comment is in this respect the same act as a quotation: a quotation requires the quoted document read in full, and a comment requires the code unit it describes read in full. The condition is the same; the object differs — the document for the quotation, the unit of code for the comment. The limit is placed inside an existing permit and is specified in the permit chapter of the governance family ([/governance/permits/](/governance/permits/)); this section states the right, that chapter states where it sits.

---

## Where the Comment Rule Holds

The rule of the previous section holds under three conditions, and it is stated together with them so that a first counter-case does not switch it off as a whole:

- It holds in a project that keeps a **database** as a second store beside the code, so that the reasoning a comment leaves out has a place to live.
- It holds for comments whose scope reaches **beyond the changed** place — a comment on a class or a file head, not the line next to a one-line change.
- It becomes stricter the more agents work in **parallel** on the same code, because every orphaned comment then reaches every context it is loaded into.

The counter-conditions are part of the rule. Without a database, many comments are useful, because the comment is the only store and a text search finds it; the rule would be harmful there. For a small change, reading only part of the file is not critical. Context loss on a large scale appears only under scale and time pressure. Outside the three conditions above, the rule **does not apply**.

---

## Comment Form

A comment unit has a fixed form in four parts:

1. **Delimitation.** A unit that spans more than one line is a block `/* ... */`. A run of `//` lines over two or more lines is not a unit, because it marks neither its beginning nor its end; a single line may use `//`.
2. **Length.** A unit is at most 500 characters long. Longer reasoning moves out of the code and is reached through the identifier.
3. **Rewriting.** An agent that rewrites the comment of another agent ends it with `(rewritten: <agent id>)`, where the agent id is the `<role>:<name>` form the agent naming assigns.
4. **Identifier.** A work-item identifier stands in the qualified form `M{NNN}-WI-{NNN}`; where a comment names a step of a memo as a time anchor, it uses the canonical form `M{NNN}-{PP}-{RR}`. The admission of the one internal reference in a code comment is specified in the communication chapter ([/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/)).

---

## The Described Reference

A **described reference** is a comment that carries an identifier and a short factual statement, and nothing else. The identifier makes the full reasoning findable in the database; the statement is readable without that background. Identifier and brevity are **one rule**, not two: the comments that carry an identifier today are also the longest ones, so a rule that asked for the identifier without the length cap would make comments longer, and a cap without the identifier would cut reasoning without leaving a way back to it.

A comment that states behaviour and has a body of 40 characters or more MUST carry the qualified work-item identifier `M{NNN}-WI-{NNN}`. The threshold of 40 characters separates a statement from a marker; a bare `WI-{NNN}` names a work item of no memo in particular and does not satisfy the rule.

| It carries | It does not carry |
|---|---|
| the qualified work-item identifier, through which the reasoning resolves | the reasoning itself |
| a short factual statement of what holds here | the derivation of how it was found |
| where needed, the memo step identifier as a coarse time anchor | a narrated history of earlier versions |
| the deviation, where the code deliberately departs from the norm | a repetition of the norm itself |
| a clear beginning and end mark | doubt about where it begins and ends |
| — | a summary of what the code beside it already says |
| — | a description of units the writer has not read |

---

## The Comment Chain as an Audit Object

The path from a partial reading to a propagated error is an audit object of its own. Laid out, it has six steps, and the layout shows where a rule can take hold:

| Step | What happens | Where a rule takes hold |
|---|---|---|
| 1 | An agent searches a very large file by text and reads its first thousand lines | full reading of the unit that is written about |
| 2 | It places two comments inside one method, based on what it has read | permitted: the method has been read |
| 3 | It also writes a text about the whole class at the top, based on the thousand lines | the break: the unit of the comment is larger than the unit that was read |
| 4 | The text about the class grows longer and more technical than the knowledge supports | an evidence level per statement |
| 5 | Months later a second agent reaches another place and sees only part of the comment | the comment carries no date, so its age cannot be seen |
| 6 | It reads the comment as a valid description and builds on it | an identifier through which the statement resolves in the database |

The break lies at step 3, not at step 1: reading a thousand lines is not an error as long as the writing stays within them. The right of [The Right to Comment](#the-right-to-comment) is the rule placed at that step. The phenomena along the chain are named only: blind searching at steps 1 and 5, self-sustaining elaboration at step 4, and repetition drift at step 6.

The chain has a computable feature: **the newest commit on the code right below a comment is younger than the newest commit on the comment itself.** A comment with that feature may describe code that has changed since it was written. A check measures the feature over the history of the repository and reports it; it does not fail on it, because no threshold has been set.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./05-publishing-principle.md](/spec/publishing-principle/) — what of the conventions and their implementation is published versus kept private.
- [./02-per-chapter-format.md](/spec/per-chapter-format/) — the chapter format a convention's readable body is authored in.
- [./13-styleguide.md](/spec/styleguide/) — the styleguide that fixes the written form of terms and identifiers.
- [/session/namespace-registry/](/session/namespace-registry/) — the policy block (`kind:"policy"`, `REQ-SS-POLICY`) a convention set registers as.
- [/specification/internal-vs-external-communication/](/specification/internal-vs-external-communication/) — the communication chapter that owns the readable `J1`–`J12` table.
