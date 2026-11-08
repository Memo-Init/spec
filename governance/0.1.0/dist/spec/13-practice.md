---
title: "Best Practice and Bad Practice"
description: "This chapter names the patterns and anti-patterns of the system. Behaviour can be steered by the options a skill writes out, and some behaviours are known to help while others are known to hurt...."
governance_version: "0.1.0"
spec_file: "13-practice.md"
order: 13
section: "Governance"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "governance/0.1.0/draft/spec/13-practice.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: governance/0.1.0/draft/spec/13-practice.md."
---


This chapter names the patterns and anti-patterns of the system. Behaviour can be steered by the options a skill writes out, and some behaviours are known to help while others are known to hurt. Naming them makes them recognisable; the catalog of bad practice and the named patterns below carry normative text, the remaining subjects are declared in *Scope*.

---

## The Bad-Practice Catalog

A behaviour enters the catalog when it interrupts or hampers communication. An entry names the behaviour, why it is bad practice, and what to do instead.

| Entry | Why it is bad practice | What to do instead |
|---|---|---|
| waiting by `sleep` in the thread of the orchestrator or of a lead | the thread is unreachable while it sleeps: neither the user nor a worker can reach it, and a message that arrives is read only when the sleep ends | wait for the completion message of the worker and stay reachable |

---

## A Deviation Is Traced to Its Cause

A deviation from the expected practice is not only repaired; it is traced to its cause. When an agent stores data in a repository that belongs outside repositories, the behaviour shows a deep misunderstanding of how the system works, and it must be questioned why it happened before the next run repeats it. The question goes to the cause — a wrong instruction, a misleading form, a contradiction in the context ([./12-contamination.md](/governance/contamination/)) — and not only to the misplaced file; a repair without that question treats the symptom and leaves the cause in place.

---

## Options Steer Behaviour, Research Keeps Scientific Standards

Original wording (German):

> „Durch verschiedene Angebote in den Skills können verhaltensweisen durch verschriftliche optionen gelenkt werden. Research sollte nicht "grep" benutzen. Und wissenschaftliche Standards einhalten.“

Two named patterns of the system follow from this:

- **Skills steer behaviour through the options they write out.** A behaviour the system wants is offered as a written option in the skill; an option that is not written out is not offered.
- **Research does not rely on partial keyword searches and keeps scientific standards.** Research reads a source whole before it cites it, instead of searching it for a keyword and citing the hit, and it keeps the standards of scientific work in what it cites and how.

*Provenance: the input transcript of the memo that founded this family, line 155, a statement of the user. Origin: user (`author = user`). Evidence level: opinion (`grade = opinion`).*

---

## Scope

The following subjects belong to this chapter and are declared here without normative force yet:

- The boundary for deferred findings is not between now and later, but between collecting them in a later phase of the same memo — which is allowed — and moving them out of the memo altogether, which breaks the principle of finishing what was started; a catch mechanism that is reinterpreted as a permission is an error of its own.

*Provenance: user statement carried over from an earlier draft that is classified as contaminated. Evidence level: assumption.*

- Interaction templates and the outlier as a signal: plannable handovers are defined as templates, and there is always a way to hand over without one; when an agent works out a standard handover itself instead of using the template, that deviation is a reason to look closer — a means of detection, not a ban.

*Provenance: user statement carried over from an earlier draft that is classified as contaminated. Evidence level: assumption.*

---

## The Seven Recurring Classes

Most findings of the system fall into seven recurring classes. They are written down as a model so that a future finding is assigned to its class instead of being investigated again as an individual case: the class carries the check, the individual case only the instance. A finding that fits no class stays an individual case until a second one of its kind appears. Each class below gives its name, a description, the mark by which it is recognised, and the question that checks for it.

### Vacuum-Green Gate

**Name.** Vacuum-Green Gate

**Description.** A check reports success over a basis that excludes what it is meant to check — an empty compared set, a path that holds nothing, a filter that drops every item. The class includes the chain of checks that stops after the first red link: its green report is then a statement about the first links only.

**Recognition mark.** A green verdict without a count, or with a count of zero; a chain whose later links never ran.

**Check.** Does the verdict name its compared set, is that set non-empty, and did every link of the chain run?

### Writer Without Reader

**Name.** Writer Without Reader

**Description.** A field is written and never read back, or a promise made in a schema, a description or a contract has nobody who fulfils it.

**Recognition mark.** A column, a file or a promised behaviour for which no reader and no fulfilling code path can be named.

**Check.** Who reads what is written here, and which code keeps the promise?

### Built But Not Armed

**Name.** Built But Not Armed

**Description.** Hooks, gates or checks are built and finished but stay inert, because they are not armed where they would act; arming may be the decision of someone other than the builder.

**Recognition mark.** A component reported as built that no configuration entry calls.

**Check.** Where is the component armed, and who holds the right to arm it?

### The Order Is the Defect

**Name.** The Order Is the Defect

**Description.** Not the build is defective but the order: an acceptance condition structurally misses its subject, cannot fail, or cannot be satisfied by any build.

**Recognition mark.** A condition that is green without the change, or red whatever the build does.

**Check.** Does the condition fail on a constructed violation and pass on a correct build?

### Resolvable Is Not Correct

**Name.** Resolvable Is Not Correct

**Description.** An identifier, a branch name, a reference or a line number resolves and means the wrong thing.

**Recognition mark.** A reference check that tests only that the target exists.

**Check.** Does the resolved target carry the meaning the reference claims, rather than merely exist?

### Two Truths Without an Arbiter

**Name.** Two Truths Without an Arbiter

**Description.** Two carriers hold the same fact — flat store and database, workshop and promoted copy, document and record — and no arbiter decides which one holds.

**Recognition mark.** Two readers get two different answers to the same question.

**Check.** Which carrier is named as the source, and which copy is derived from it?

### The Measuring Instrument Lies

**Name.** The Measuring Instrument Lies

**Description.** Not the program is defective but the way the number came about. The class includes the measurement that does not report its comparison basis: a measurement over the difference to the last recorded state becomes empty as soon as the measured work is committed, and its zero looks like a passed finding.

**Recognition mark.** A number without the basis it was measured against; a zero that appeared right after a commit.

**Check.** Does the measurement print its comparison basis, and does it show a non-zero value on a known positive control?

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./07-break-glass.md](/governance/break-glass/) — the escape duty that templates must not close.
- [./10-spirit.md](/governance/spirit/) — the error culture behind the anti-patterns.
- [./12-contamination.md](/governance/contamination/) — the symptoms the anti-patterns lead to.
