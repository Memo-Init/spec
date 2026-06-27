---
title: "The Common Denominator — Setup, Health, Update, Extras"
description: "Every SOP in the system provides the same four parts. This chapter describes them: three core parts that recur in every SOP, plus scope-specific extras. The four parts are the predictable shape on..."
session_version: "0.1.0"
spec_file: "11-common-denominator.md"
order: 11
section: "Session"
normative: true
generated_at: "2026-06-27T01:35:51.713Z"
generated_from: "spec/session/0.1.0/11-common-denominator.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/session/0.1.0/11-common-denominator.md."
---


> **Mostly informative; the Page Contract below is normative.** This chapter describes the common shape every SOP is expected to take and names the parts and what each is for. The descriptive parts do not impose conformance levels on the individual SOPs, which govern their own scope — but the **SOP Page Contract** is **normative (MUST)** and lint-enforced, because it is the single shape the memo-SOP and Workbench-SOP reference rather than restate.

Every SOP in the system provides the same four parts. This chapter describes them: three core parts that recur in every SOP, plus scope-specific extras. The four parts are the predictable shape on which the [SOP entry-point mechanism](/specification/sop/) rests.

---

## The Four Parts

| Part | Question it answers | Role |
|------|---------------------|------|
| **Setup** | How is the scope or environment created? | core |
| **Health** | Does the scope run correctly? | core |
| **Update** | How is the scope brought up to date? | core |
| **Extras** | What is specific to this scope and nothing else? | scope-specific |

### Setup

Setup describes how the scope comes into existence — what is created, in what order, and what the finished, ready state looks like. An SOP's Setup is what lets a fresh start reach a known-good baseline without guesswork.

### Health

Health is the check function: a way to ask "is this scope in order?" and get a definite answer. An SOP's Health check produces an observable result (a pass/fail signal, a report, or an equivalent), so that the state of the scope is verified rather than assumed.

### Update

Update describes how an existing scope is brought to the current expected state — how a change defined centrally reaches the scope. An SOP's Update path is what lets improvements propagate rather than being re-implemented per scope.

### Extras

Extras are the parts that belong to one scope and not to SOPs in general. An SOP may have any number of extras. For example, the Workbench-SOP adds the wiki and the project conventions as extras; another scope would add its own. Extras are specific to their SOP and are not part of the common denominator.

---

## Why These Three Are the Core

Setup, Health, and Update are the connecting core because they are the questions every scope faces regardless of what it is: how do I create it, how do I know it is well, and how do I keep it current. Health is the part the workbench's health-check scripts implement (see the Workbench-SOP). Keeping these three to a single shape across all SOPs is what makes an unfamiliar SOP navigable.

The same three parts have an **executable form** in the CLI doctrine's standard verbs ([04-cli.md](/specification/cli/)): **`init` realizes Setup, `doctor` realizes Health, `update` realizes Update**, and a family's own scope leaves are its Extras. The four parts and the standard verbs are not two systems but one common denominator seen twice — a procedure a reader follows and the commands an agent runs.

---

## The SOP Page Contract (normative)

The four parts are not only a description; they fix the **required shape of a single SOP entry-point page**. Every SOP instance's entry-point page **MUST** realize this shape:

```markdown
# «X»-SOP

> "This is the «X»-SOP, an instance of the SOP standard that it extends;
>  below is how it realizes Setup, Health, and Update for «scope», plus its extras."

## Entry points     — MUST name the doors into the scope, not imply them
## Setup            — MUST: how the scope is created / reaches a known-good baseline
## Health           — MUST: the check that answers "is this scope in order?"
## Update           — MUST: how the scope is brought to the current expected state
## Extras           — OPTIONAL: zero or more scope-specific parts
```

The contract is three things together: the opening **inheritance declaration** (the canonical first sentence in [12-instances.md](/specification/instances/)), the **entry points named explicitly**, and the three core parts — **Setup**, **Health**, **Update** — each present as a named section. **Extras** are optional and scope-specific (zero or more).

**Lint-Gate.** A lint checks every registered SOP page against this contract: a page missing a core part, the inheritance declaration, or its named entry points **fails** the lint. The lint reads the SOP registrants from the namespace registry ([06-namespace-registry.md](/specification/namespace-registry/)) and verifies each instance's page satisfies the shape above. This page is the **single source** of the contract — the memo-SOP and the Workbench-SOP **reference** it and declare only how they realize each part, never restating the shape.

---

## Related

- [10-sop.md](/specification/sop/) — why a thin connecting mechanism exists inside the session standard.
- [12-instances.md](/specification/instances/) — the existing SOPs as instances of this shape.
- [13-conventions.md](/specification/conventions/) — the naming and brevity conventions shared across SOPs.
