---
title: "The SOP System"
description: "This chapter specifies the SOP mechanics that roles and permits use. The project has many rules that are essential for some kinds of work and useless for others; the SOP system loads each rule only..."
governance_version: "0.1.0"
spec_file: "02-sop-system.md"
order: 2
section: "Governance"
normative: true
generated_at: "2026-11-08T15:43:20.872Z"
generated_from: "governance/0.1.0/draft/spec/02-sop-system.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: governance/0.1.0/draft/spec/02-sop-system.md."
---


This chapter specifies the SOP mechanics that roles and permits use. The project has many rules that are essential for some kinds of work and useless for others; the SOP system loads each rule only where the work needs it, so that knowledge needed for writing code does not clog the context of a research task. How an SOP is built and registered in general is not this chapter's subject.

---

## Start SOP and Closing SOP

A role and a permit each carry **two** SOPs. The **start SOP** says what the role or permit allows, where it applies and which SOPs have to be read for it. The **closing SOP** is the step that ends the reading: it **MUST NOT** release anything before every SOP the start SOP names has been read in the same session, and running it earlier releases nothing.

Every dependency of a start SOP **MUST** be filed twice: once as prose in the skill text, visible and readable for the agent, and once as a machine-readable list that a tool reads — a marked line in the skill and the matching edges in the registry. The two filings **MUST** name the same set; a validator reports every difference, so the text an agent reads and the structure a session is checked against cannot drift apart unnoticed.

---

## Sandwich SOP and Single SOP

There are two forms of SOP rule, and every rule **MUST** have exactly one of them:

- A **sandwich SOP** is opened and closed around the SOPs it requires: start SOP, the required SOPs, closing SOP. Roles and permits are sandwich SOPs, because what they allow is released only after the reading is complete.
- A **single SOP** stands on its own, without a closing SOP. Command classes use single SOPs: before a command of the class runs, its one SOP must have been read, and nothing is released afterwards.

A rule that mixes the two — a closing SOP without a start SOP, or a single SOP that releases a permission — is malformed.

---

## Release After the Check

The release of a role or permit is a **named state**, `granted`, and it **MUST** arise only from passing the check of the closing SOP. That check is expressed as edges that are evaluated **after** the closing SOP ran (`when: post`), one for each required SOP; the release happens exactly when every one of them passes. A closing SOP without any such edge releases nothing.

The check **MUST** be decided by a hook — a deterministic layer outside the holder — and never by the holder itself. A refused release is recorded together with its reason, so that a refusal is a measurement and not a silence. Edges evaluated before an entry point runs (`when: pre`) and edges evaluated after it ran (`when: post`) are the only two directions; an edge with any other direction is a reported error, never silently dropped.

---

## Portioned Knowledge

An SOP that routes to child skills is an **umbrella**: it carries no procedure of its own and names the skills that hold it. Its members are filed twice, like every dependency of a start SOP: once as prose in the skill text, and once as a machine-readable list in the frontmatter, `metadata.memo.members`, one entry `<skill>: <mode>` per member. The mode is one of `always`, `contextual` and `checkpoint`, with the meaning the session family gives these values ([/session/namespace-registry/](/session/namespace-registry/)); it is the machine form of the relevance criterion of [./09-progressive-disclosure.md](/governance/progressive-disclosure/). A check reports every listed member the prose does not name, every member that names no installed skill and every mode outside the three values. Knowledge that no umbrella names is not portioned: it is either loaded whole or not found.

---

## Handover Through Expected Errors

A handover to an agent — a composed prompt, an order sheet, a skill the receiver loads — **MUST** name the errors the receiver can expect: every hook that can stop a command of the handed-over work, with the condition it checks, the first words of its message and the behaviour it expects. The handover names where that list lives, which is the blocking-hooks table of the SOPs the receiver loads, and it leaves no hidden hook unnamed. With the expected errors in view, the receiver reads the parts of the handover as one connected piece of information, and a hook error reads as a misalignment to correct, not as behaviour to expect.

---

## Scope

- Tasks, commands and locations as the three occasions a check can key on, and the entry points and permission instruments that turn a trigger into a checked permission.
- The SOP standard itself is delegated: how an SOP is built and registered is owned by the session family ([/session/sop/](/session/sop/)) and is not restated here.

---

## A Zone Is Armed by a Receipted Precondition

A zone of the write matrix is armed only by a precondition that a receipt can satisfy. A zone row that requires a procedure which does not exist yet would be refused as a lockout edge, so the zone stays without a precondition, and the largest zone of a project can then be written without any receipted procedure. The order is fixed: first the permit or the procedure that can be receipted exists, then the zone row that requires it is added; a zone row **MUST NOT** be armed before its precondition can be met.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./03-permits.md](/governance/permits/) — the permit, which carries a start SOP and a closing SOP.
- [./08-runtime-enforcement.md](/governance/runtime-enforcement/) — the hooks that check the closing SOP.
- [/session/sop/](/session/sop/) — the SOP standard this chapter delegates to.
