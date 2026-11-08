---
title: "Overview"
description: "This is the entry point of the **Governance Specification** (Draft). Where the memo, workbench, session and meta-specification families describe the work, the place it happens, the session it runs in..."
governance_version: "0.1.0"
spec_file: "00-overview.md"
order: 0
section: "Governance"
normative: true
generated_at: "2026-11-08T15:43:20.872Z"
generated_from: "governance/0.1.0/draft/spec/00-overview.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: governance/0.1.0/draft/spec/00-overview.md."
---


This is the entry point of the **Governance Specification** (Draft). Where the memo, workbench, session and meta-specification families describe the work, the place it happens, the session it runs in and the shape of the specifications themselves, this family describes **who may do what, under which conditions, and in which spirit**: the permit that bundles knowledge for one task, the roles that sit above the permits, the sub-agents a role may create, the enforcement that checks all of it at runtime, and the spirit that the cut of roles and permits carries through the system.

The family is young. A chapter that so far only declares its subject says so in a note at its top; a chapter without that note carries normative text. Every subject this family owns is named here already, so that no part of the concept is left without a place while the text is still being written.

---

## Purpose

The system standardises how agents and the user interact, and that standardisation only pays off above a threshold. Below it, following a shared pattern of behaviour costs more than it returns, and every participant is better off improvising. Above it, keeping to the pattern becomes useful in its own right, because every participant gains from every other participant's predictability. This family exists to carry the system over that threshold: it names the patterns, binds them to the roles that must keep them, and makes their keeping checkable.

The permission system has one goal. The SOP system carries the knowledge of the **whole** system in portions, split so finely that a portion is loaded only when the work at hand needs it. Used correctly, this produces focus: commands and instructions arrive precise and uniform, and the structure of the skills that deliver them defines the expectable errors, so that an agent perceives the delivered prompts as **connected** information rather than as a heap of unrelated rules.

The scope of this family is not up for negotiation. Every statement of the input that set this family up has a place in it — either as normative text in a chapter of this family, or as a declared subject that a chapter carries forward, or as a delegation to the family that owns it. A statement without a place is a defect of this specification, not a judgement about the statement.

---

## Why a Separate Family

Several locations were weighed against each other before this family was created: extending an existing family — the workbench, the session or the memo family —, writing a standalone text about the spirit of the system, or distributing the content over the four existing families without a new location. The location chosen is a family of its own.

The reason is that the content forms **one connected mechanism**. The permit, the role above it, the sub-agent a role creates and the enforcement that checks all three only make sense together, and the chapters on the spirit of the system belong to the same unit, because the cut of roles and permits is what shapes that spirit. Distributing the mechanism over four families would have kept every part and lost the connection; a family of its own, with its own name, makes the unit readable as a unit. The name was chosen so that it carries the spirit chapters as well as the permission mechanics.

The alternative that was weighed most seriously was to extend the session family by a small number of chapters. It would have needed fewer files and no separate promotion step, and the session family already owns the SOP area. It was rejected in favour of a family that can hold the full mechanism and the spirit chapters side by side. The SOP standard itself stays with the session family; this family delegates to it rather than restating it (see *Family Responsibility* below).

---

## Conformance

The RFC-2119 interpretation of the key words in the chapters of this family is the one the meta-specification establishes in its conformance anchor ([/spec/overview/](/spec/overview/)). This family references that anchor and does not restate it. A chapter of this family that carries a page-level `Informative` marker is non-normative; every other chapter is read under that interpretation.

---

## Family Responsibility

This family declares its responsibility in the three-field shape the meta-specification defines. Each subject is owned by exactly one family; a delegated subject is referenced, never restated.

- **`provides`** — the purpose and the subject ownership of the permission system; the permit and its validity, renewal and expiry; the role vocabulary, the roles and the role groups; sub-agents and attenuation; the exception role; enforcement at runtime; progressive disclosure; the spirit of the system and its own constitution; the risk surface of the roles; the contamination rule and the contamination symptoms; the named practice patterns of the system.
- **`delegates`** — the SOP standard and the registration mechanics, owned by the session family ([/session/sop/](/session/sop/), [/session/namespace-registry/](/session/namespace-registry/)); controlled language and the labelling duty, owned by the meta-specification ([/spec/controlled-language/](/spec/controlled-language/)); git, versioning and agent identifiers, owned by the memo family ([/specification/git-workflow-and-ids/](/specification/git-workflow-and-ids/)); the term contamination itself, owned by the memo family ([/specification/contamination-context-handover/](/specification/contamination-context-handover/)); the table assignment and the bookkeeping contract per party, owned by the memo family ([/specification/orchestrator-role/](/specification/orchestrator-role/)); the database, owned by the memo family ([/specification/memo-database/](/specification/memo-database/)); temporary files and the trash, owned by the workbench family ([/workbench/tmp/](/workbench/tmp/), [/workbench/trash/](/workbench/trash/)).
- **`requires`** — the session family, as the genesis root every family leans on, and the meta-specification, for the shape of this very declaration — the same two preconditions the other families declare.

The line between the fields is the line between what this family writes new and what it only references. Everything under `provides` is written here and nowhere else; everything under `delegates` is read at its owner. In particular, this family does not own the SOP standard: the session family owns how an SOP is built and registered, while this family owns the pairing of a start SOP and a closing SOP that a role and a permit each carry ([./02-sop-system.md](/governance/sop-system/)).

---

## How the Building Blocks Connect

The building blocks of this family are not independent features. They form one chain, and each link presupposes the one before it:

1. **The user is the only entry point.** Work enters the system through the user, and a user-facing command is a door from outside that hands over to the SOPs inside ([./01-entry-points.md](/governance/entry-points/)).
2. **A permit bundles knowledge for one task.** A permit is a named collection of SOPs and skills, bound to a task, a command and a location ([./03-permits.md](/governance/permits/)).
3. **A role sits above the permits.** A role is a collection of permits and skills, and only a role may create sub-agents ([./05-roles.md](/governance/roles/)). The lead role and the orchestrator role are such roles; a worker is not.
4. **A sub-agent receives fewer rights than its creator.** Rights travel downwards only, and they shrink on the way ([./06-subagents.md](/governance/subagents/)).
5. **Enforcement checks all of it at runtime.** What an SOP promises is checked by a hook before a command runs, and every hook is mirrored in the SOP text so that the agent can know the expected behaviour in advance ([./08-runtime-enforcement.md](/governance/runtime-enforcement/)).
6. **The spirit acts through all of it.** It acts directly through words, and indirectly through the cut of roles and permits that the chain above describes ([./10-spirit.md](/governance/spirit/)).

---

## Subject Ownership Map

Every subject of the input that set this family up has exactly one place. Subjects this family owns point at its own chapters; subjects another family owns point at that family's chapter. No row is left without an owner.

| Subject | Owner | Chapter |
|---|---|---|
| Controlled prompt injection | governance | [01-entry-points](/governance/entry-points/) |
| User entry point versus SOP | governance | [01-entry-points](/governance/entry-points/) |
| SOP system | governance | [02-sop-system](/governance/sop-system/) |
| Goal | governance | [00-overview](/governance/overview/) |
| Permissions and access permits | governance | [03-permits](/governance/permits/) |
| Roles and permits | governance | [03-permits](/governance/permits/), [04-permit-validity](/governance/permit-validity/), [06-subagents](/governance/subagents/) |
| Role groups | governance | [05-roles](/governance/roles/), [06-subagents](/governance/subagents/) |
| Tasks, commands and locations | governance | [02-sop-system](/governance/sop-system/), [03-permits](/governance/permits/) |
| Entry points and permission instruments | governance | [02-sop-system](/governance/sop-system/) |
| Hooks, runtime and permissions | governance | [04-permit-validity](/governance/permit-validity/), [08-runtime-enforcement](/governance/runtime-enforcement/) |
| Progressive disclosure | governance | [09-progressive-disclosure](/governance/progressive-disclosure/) |
| Best practice and bad practice | governance | [13-practice](/governance/practice/) |
| Holism | governance | [07-break-glass](/governance/break-glass/) |
| Standing clearance | governance | [14-standing-clearance](/governance/standing-clearance/) |
| Spirit and own constitution | governance | [10-spirit](/governance/spirit/) |
| Risks and estimates | governance | [11-risk-surface](/governance/risk-surface/) |
| Contamination symptoms | governance | [12-contamination](/governance/contamination/) |
| Labelling duty and form language | meta-spec | [controlled-language](/spec/controlled-language/) |
| Language, skills and expectability | meta-spec | [controlled-language](/spec/controlled-language/) |
| Writing things down | meta-spec (comment convention) · memo (search system) | [conventions-writing](/spec/conventions-writing/) · [memo-database](/specification/memo-database/) |
| Git, versioning and agent IDs | memo | [git-workflow-and-ids](/specification/git-workflow-and-ids/) |
| Repository practice | workbench | [repos](/workbench/repos/) |
| Temporary files and trash | workbench | [tmp](/workbench/tmp/) · [trash](/workbench/trash/) |
| Database strategy | memo | [memo-database](/specification/memo-database/) |
| Database size | memo | [memo-database](/specification/memo-database/) |
| Status display | memo | [memo-database](/specification/memo-database/) |
| Bookkeeper | governance | [05-roles](/governance/roles/) |

The subject *Controlled prompt injection* is assigned a place, not a content: its content is not yet specified, and the chapter that holds the place says so ([./01-entry-points.md](/governance/entry-points/)).

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./03-permits.md](/governance/permits/) — the permit: a named collection of SOPs and skills for one task, command and location.
- [./05-roles.md](/governance/roles/) — the role vocabulary, the role tables and the cut of lead, orchestrator, author, worker and bookkeeper.
- [./10-spirit.md](/governance/spirit/) — the spirit of the system and its own constitution.
- [./12-contamination.md](/governance/contamination/) — how contaminated sources and earlier positions are weighed.
- [/session/sop/](/session/sop/) — the SOP standard this family delegates to.
