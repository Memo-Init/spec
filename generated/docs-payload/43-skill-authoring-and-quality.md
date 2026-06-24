---
title: "Skill Authoring & Quality"
description: "A skill is a procedure the system runs again and again, yet for most of the system's life skill quality was the one thing nothing governed. Chapters classify a skill against an agent and a task..."
spec_version: "0.1.0"
spec_file: "43-skill-authoring-and-quality.md"
order: 43
section: "Specification"
normative: true
generated_at: "2026-06-24T22:34:55.546Z"
generated_from: "spec/v0.1.0/43-skill-authoring-and-quality.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/43-skill-authoring-and-quality.md."
---


A skill is a procedure the system runs again and again, yet for most of the system's life skill quality was the one thing nothing governed. Chapters classify a skill against an agent and a task ([14-agents-skills-tasks.md](/specification/agents-skills-tasks/)); the entrypoint demands that each skill carry a distinct trigger ([02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/)); but no chapter ever said how *good* a skill must be, how it is tested, or how its written specification is kept honest. This chapter fills that gap. It governs the **quality** of a skill — its frontmatter contract, the trigger discipline that decides when it fires, the three-dimensional testing standard that proves it works, and the measurable link from every skill back to the chapter that specifies it. The guiding idea is to make skills **visible, testable, and inspectable** rather than trusted on sight: a skill should be ownable, which means its specification dependency is explicit and its behavior is asserted, not assumed.

The honest finding that motivates this chapter is uncomfortable and worth stating plainly: the skill, not the written specification, is usually where the *real, current* procedure lives. A skill is edited every time the procedure changes; a chapter is edited only when someone remembers to. So the skill leads and the chapter lags. Hiding that lag helps no one. The remedy is to make the skill-to-spec link explicit and machine-checkable, so the exact places where the written specification must catch up are surfaced as data rather than discovered by accident.

---

## The Frontmatter Contract

Every skill is a file (`SKILL.md`) whose frontmatter is its machine-readable contract. Three things are required, and one of them is the load-bearing addition this chapter introduces.

| Field | Required | Purpose |
|---|---|---|
| `name` | yes | Stable identifier for the skill; how other skills and the registry refer to it. |
| `description` | yes | The trigger surface (see below). One line that states when the skill fires. |
| `metadata.memo.category` | yes | The skill's category within the catalog, so it can be grouped and reasoned about as a set. |
| `metadata.memo.specs` | yes | The skill-to-spec link. The block that makes the skill's specification dependency explicit and inspectable. |

The `specs` block is the heart of the contract. It declares which chapters govern the skill:

- **`primary`** — a single spec id (for example `NN-some-chapter`) or `null`. The one chapter that most directly governs this skill. `null` is a legitimate value, not a gap (see the scope boundary below).
- **`all`** — the list of *every* governing chapter, with `primary` first when `primary` is non-null. A skill often draws on several chapters; `all` records the full dependency, not just the closest one.
- **`gaps`** (optional) — a list of behaviors the skill relies on for which **no chapter yet exists**. This is the field that makes the spec-lag honest: when a skill does something the written specification has not yet captured, that reliance is declared here instead of being silently assumed.
- **`scope`** (optional) — a marker for skills that sit *outside* the process specification's reach. Set only when `primary` is `null`; it records *why* the skill carries no mapping rather than leaving the absence unexplained.

The contract is deliberately small. It does not try to encode the procedure itself — the body of the skill does that — only the metadata that makes the skill addressable, categorizable, and traceable back to the chapters that justify it.

---

## Description as Trigger

A skill is not invoked by name in normal use; it is invoked because its `description` matched the situation. The `description` therefore **is** the trigger surface, and its quality is measured as trigger quality.

The entrypoint chapter requires that each skill carry a *distinct* trigger but gives no measure of how distinct, or how concrete. This chapter supplies the standard. A `description` must:

- **State concrete trigger conditions**, not a vague summary of the skill's purpose. "When the user asks to verify a built view against its design draft" is a trigger; "helps with design work" is not.
- **Be distinct from neighboring skills'**, so two skills do not both plausibly fire on the same input. Overlap is the most common cause of the wrong skill loading; the description is where overlap is removed.
- **Carry the realistic shapes of its input** — the phrasings, the languages, and the transcription noise a real request actually contains — because the trigger has to survive contact with messy input, not just a clean prompt.

A description that fails these tests is not a documentation defect; it is a *functional* defect, because a skill that fires on the wrong inputs (or fails to fire on the right ones) does not do its job regardless of how good its body is.

---

## The Three-Dimensional Quality Standard

A skill is proven against three independent dimensions. All three are necessary: a skill can fire correctly yet produce the wrong output, or produce the right output in isolation yet break the chain it sits in. The standard tests each dimension separately so a failure points at the dimension that caused it.

| Dimension | Question it answers | Standard |
|---|---|---|
| **Triggering** | Does the skill reliably fire on its intended inputs, and stay quiet on similar non-matching ones? | A high trigger-hit rate — at or above roughly **90%** across a representative set of should-fire, should-not-fire, and edge-case inputs. Below that, the `description` is refined and the set re-run. |
| **Execution** | Do the skill's steps produce the asserted output? | **Execution assertions** over the result — structure and content both — that hold when the skill ran correctly and fail when it did not. The output is checked, never assumed from the fact that the skill was invoked. |
| **Integration** | Does the skill chain correctly with the skills it depends on? | **Integration-chain fixtures** that exercise the skill together with its declared dependencies end to end, so a contract change in one link is caught where it breaks the next. |

**Test isolation is a hard rule.** A skill evaluation **MUST NOT** write into a user-home location or any shared real directory; it runs entirely against **repo-local fixtures**. A test that writes outside the repository corrupts the very state the live system depends on, and an evaluation that can damage production is not a test but a hazard. Reads may range wider, but every write stays inside the fixture tree.

---

## Where Skill Evals Live

A skill's evaluations live **alongside the skill** — an `evals/` folder sitting next to the `SKILL.md` it exercises. Co-location is the convention because it keeps the proof of a skill with the skill: when the procedure changes, its evals are right there to change with it, and a skill is never separated from the fixtures that assert its behavior. This is a convention about *placement*, not a mandate for a particular runner; the standard fixes where the evidence sits and what it must cover, and leaves the mechanism that runs it to the tooling.

---

## The Skill-to-Spec Coverage Gate

The `specs` block is only as valuable as the discipline that keeps it true, so the link is made **measurable**, not merely documented. A deterministic lint proves three things and reports a fourth:

- **Coverage (hard).** Every `SKILL.md` carries a `metadata.memo.specs` block. A skill with no declared specification dependency fails the gate; there is no opting out by omission.
- **Well-formedness (hard).** When `primary` is non-null it is the first entry of `all`; a `scope` marker appears only on out-of-process skills (those whose `primary` is `null`). A `scope` marker on a mapped skill is a contradiction and fails.
- **Spec existence (hard, when resolvable).** Every chapter id referenced by a skill resolves to a real chapter file. A reference to a chapter that does not exist is a dangling link and fails. When the specification side is not reachable, this check degrades to a skip rather than a false failure.
- **Orphans (report only).** Chapters referenced by **no** skill are listed as a warning, never a failure. A newly written chapter is expected to be unreferenced until a skill points at it, so an orphan is a prompt to wire it up, not a defect.

This gate is the direct mirror of two patterns the specification already relies on. It is the two-sided requirements model ([23-requirements.md](/specification/requirements/)) applied to skills: the `specs` block is the declaration, the lint is the check, and the same data both records the dependency and proves it. And it is the maintenance board ([33-maintenance.md](/specification/maintenance/)) applied to coverage: the link between skill and chapter is given a deterministic reading rather than left to trust, so drift between the two surfaces as a measured signal instead of an unpleasant surprise.

---

## When the Skill Leads the Spec

The `gaps` field exists because the alternative — pretending the written specification is always ahead of the skill — is a lie the system would have to keep telling. In practice the skill carries the live procedure and the chapter catches up afterward. Making that explicit turns an embarrassment into a tool:

- A behavior a skill **relies on but no chapter specifies** is declared in `gaps`, where it is visible rather than buried.
- The set of all `gaps` across all skills is, precisely, the **backlog of where the written specification must catch up** — a machine-readable to-do list for the spec, derived from the procedures actually in use.
- Closing a gap means writing (or extending) the chapter that governs the behavior, then moving the entry from `gaps` into `all`. The gap does not vanish silently; it is *resolved* by the specification catching up.

This reframes spec-lag from a failure to hide into a signal to act on. The skill is allowed to lead; the system simply refuses to let that lead go unrecorded.

---

## The Scope Boundary — Not Every Skill Maps

The classification chapter ([14-agents-skills-tasks.md](/specification/agents-skills-tasks/)) decides *what a skill is* against an agent and a task; this chapter governs *how good a skill is*. The two do not overlap, and one consequence of the boundary must be stated honestly: **not every skill belongs to the process specification at all.**

Some skills encode a coding standard, a documentation style, or an external/domain procedure that this specification deliberately does not own. Forcing such a skill to name a governing chapter would invent a mapping that is not real. These skills carry `primary: null` and a `scope` marker that records the reason — they are *out of process scope*, not *missing a mapping*. The distinction matters: a `null` primary with a scope marker is a correct, complete declaration, whereas a `null` primary with no explanation is an unfinished one. Naming the out-of-scope skills as a legitimate category keeps the coverage gate honest — it measures the skills the specification actually governs, and openly excuses the ones it does not, rather than pretending universal coverage that was never true.

---

## Related

- [./14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — classifies skill versus agent versus task; this chapter governs skill *quality* and assumes that classification.
- [./02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/) — requires a distinct trigger per skill; this chapter supplies the quality measure for that trigger.
- [./23-requirements.md](/specification/requirements/) — the two-sided declare-and-check model the coverage gate mirrors.
- [./33-maintenance.md](/specification/maintenance/) — the board pattern that turns a link into a measured signal, applied here to skill-to-spec coverage.
- [./11-quality-and-finalization.md](/specification/quality-and-finalization/) — the finalization discipline whose quality posture this chapter extends to skills themselves.
- [./30-primitives.md](/specification/primitives/) — the concept map; a skill is the procedure primitive this chapter measures.
