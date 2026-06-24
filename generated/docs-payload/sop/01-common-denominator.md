---
title: "The Common Denominator — Setup, Health, Update, Extras"
description: "Every SOP in the system provides the same four parts. This chapter defines them. An SOP **MUST** make each of the three core parts findable, and **MAY** add scope-specific extras. The four parts are..."
sop_version: "0.1.0"
spec_file: "01-common-denominator.md"
order: 1
section: "SOP"
normative: true
generated_at: "2026-06-24T20:40:20.473Z"
generated_from: "spec/sop/0.1.0/01-common-denominator.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/sop/0.1.0/01-common-denominator.md."
---


Every SOP in the system provides the same four parts. This chapter defines them. An SOP **MUST** make each of the three core parts findable, and **MAY** add scope-specific extras. The four parts are the predictable shape on which the [SOP overview](/specification/overview/) rests.

---

## The Four Parts

| Part | Question it answers | Required |
|------|---------------------|----------|
| **Setup** | How is the scope or environment created? | MUST |
| **Health** | Does the scope run correctly? | MUST |
| **Update** | How is the scope brought up to date? | MUST |
| **Extras** | What is specific to this scope and nothing else? | MAY |

### Setup

Setup describes how the scope comes into existence — what is created, in what order, and what the finished, ready state looks like. An SOP **MUST** define its Setup so that a fresh start reaches a known-good baseline without guesswork.

### Health

Health is the check function: a way to ask "is this scope in order?" and get a definite answer. An SOP **MUST** define a Health check whose result is observable (a pass/fail signal, a report, or an equivalent), so that the state of the scope is verified rather than assumed.

### Update

Update describes how an existing scope is brought to the current expected state — how a change defined centrally reaches the scope. An SOP **MUST** define its Update path so that improvements propagate rather than being re-implemented per scope.

### Extras

Extras are the parts that belong to one scope and not to SOPs in general. An SOP **MAY** define any number of extras. For example, the Workbench-SOP adds the wiki and the project conventions as extras; another scope would add its own. Extras **MUST NOT** be required of other SOPs.

---

## Why These Three Are the Core

Setup, Health, and Update are the connecting core because they are the questions every scope faces regardless of what it is: how do I create it, how do I know it is well, and how do I keep it current. Health in particular is the load-bearing one — it is the part that the workbench's health-check scripts implement, and the part a maintainer reaches for first. Pinning these three to a single shape across all SOPs is what makes an unfamiliar SOP navigable.

---

## Related

- [00-overview.md](/specification/overview/) — why a thin connecting layer exists.
- [02-instances.md](/specification/instances/) — the existing SOPs as instances of this shape.
