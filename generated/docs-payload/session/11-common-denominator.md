---
title: "The Common Denominator — Setup, Health, Update, Extras"
description: "Every SOP in the system provides the same four parts. This chapter describes them: three core parts that recur in every SOP, plus scope-specific extras. The four parts are the predictable shape on..."
session_version: "0.1.0"
spec_file: "11-common-denominator.md"
order: 11
section: "Session"
normative: false
generated_at: "2026-06-26T21:14:26.848Z"
generated_from: "spec/session/0.1.0/11-common-denominator.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/session/0.1.0/11-common-denominator.md."
---


> **Informative.** This chapter describes the common shape every SOP is expected to take. It names the parts and what each is for; it does not impose conformance levels on the individual SOPs, which govern their own scope.

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

---

## Related

- [10-sop.md](/specification/sop/) — why a thin connecting mechanism exists inside the session standard.
- [12-instances.md](/specification/instances/) — the existing SOPs as instances of this shape.
- [13-conventions.md](/specification/conventions/) — the naming and brevity conventions shared across SOPs.
