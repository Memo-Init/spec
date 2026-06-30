---
title: "Skill Authoring & Quality"
description: "A skill is a procedure the system runs again and again, yet for most of the system's life skill quality was the one thing nothing governed. Chapters classify a skill against an agent and a task..."
spec_version: "0.1.0"
spec_file: "43-skill-authoring-and-quality.md"
order: 43
section: "Specification"
normative: true
generated_at: "2026-06-30T22:47:32.159Z"
generated_from: "draft/memo/0.1.0/spec/43-skill-authoring-and-quality.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/43-skill-authoring-and-quality.md."
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

The three dimensions are scored with the same **shared scoring head** specified in [23-requirements.md](/specification/requirements/) (The Grading Model): ternary outcomes, a fresh-context grader that is not the doer, and a strict result object. This chapter adds only its domain axes — the three quality dimensions above — and reuses the head rather than restating it.

---

## The Executable Skill Grader

The three-dimensional standard above says what good looks like; on its own that is still a description a reader has to apply by hand. The standard is therefore given an **executable grader** — a harness that reads a skill's co-located evals and returns a score over the same three dimensions, so quality is *measured* rather than asserted. The grader is deliberately split along the line that separates what a machine can decide from what still needs judgement, and it never blurs the two.

**Triggering is scored deterministically where it can be.** The grader runs the skill's classified trigger set through a shared matcher and computes the hit rate directly — no judge is needed to know whether a labelled should-fire query activated the description. That hit rate maps onto the 1.0–5.0 band, with the ~90% standard landing near the top of the scale. Cases that carry no deterministic label, or are explicitly marked judgeable, are not faked into the number: they are emitted as a structured judge prompt for a fresh-context reader to decide, and they never silently inflate the score.

**Execution and Integration are scored in two tiers.** What can be read structurally — whether execution assertions are present at all, whether an integration-chain fixture exists — is decided deterministically and caps the dimension below the top of the scale, because presence alone is not proof. Whether those assertions actually *hold*, and whether the chain actually carries end to end, is a judgement: the grader emits a judge prompt rather than inventing a verdict it cannot earn. Presence is counted; correctness is judged.

The dimensions are combined with the **shared grading head** ([23-requirements.md](/specification/requirements/), The Grading Model), not a private one. Each dimension scores 1.0–5.0 under a provisional, openly-uncalibrated weight; the applicable weights sum to one, and a dimension the grader could not resolve is dropped and its weight redistributed rather than scored as a silent failure. The weighted aggregate is held against a single **production gate of 3.5** — a floored dimension drags the aggregate under the gate on its own, so there is no separate pass flag to forget. The outcome is **ternary** — `PASS` / `BLOCKED` / `INCONCLUSIVE` — and a missing eval file is `INCONCLUSIVE`, never a quiet `PASS`: an undecidable skill is reported as undecidable, not waved through.

Two rules bound the grader the same way they bound every other measurement in this specification. The **doer is never the grader** ([23-requirements.md](/specification/requirements/)): the harness runs in a fresh context, never the session that built the skill, so a skill cannot grade itself green. And the grader **measures only what the specification governs**: a skill marked out of process scope — one carrying `primary: null` and a `scope` marker — is *skipped*, not failed, because grading a coding-standard or external-domain skill against the process dimensions would invent a verdict that has no meaning. The grader's silence on those skills is the same honesty the scope boundary draws everywhere else in this chapter.

---

## Where Skill Evals Live

A skill's evaluations live **alongside the skill** — an `evals/` folder sitting next to the `SKILL.md` it exercises. Co-location is the convention because it keeps the proof of a skill with the skill: when the procedure changes, its evals are right there to change with it, and a skill is never separated from the fixtures that assert its behavior. This is a convention about *placement*, not a mandate for a particular runner; the standard fixes where the evidence sits and what it must cover, and leaves the mechanism that runs it to the tooling.

---

## Skill Scaffolding & Build Order

A skill is graded against its evals, which presupposes the evals exist. The author leg of the same discipline supplies the **build order** that gets a skill to that starting line — and it is careful to prepare scaffolding, never to write the procedure itself. Authoring a skill's body is craft; preparing its machine layer is mechanical, and only the mechanical part is automated.

Scaffolding does two things and stops. First it **stamps the skill-to-spec link**, reusing the exact same injector the coverage stamper uses, so a skill's `metadata.memo.specs` block is written by one parser and cannot drift between the two paths. Second it **scaffolds the missing eval skeletons** — the classified trigger set and the execution/integration assertions — as empty-but-valid shapes that parse cleanly and carry a loud "to be authored" marker, so the not-yet state announces itself rather than hiding behind an absent file.

The scaffold is bound by a hard **no-overwrite** rule: an eval file that already exists is never read and never rewritten, only reported as skipped. A skeleton is an instruction to the author, not a substitute for one — overwriting an authored fixture with an empty shape would destroy exactly the work the grader depends on. The leg is idempotent, so it can be re-run safely, and it writes nothing but the spec stamp and the missing skeletons: the body of the skill, the real cases inside those skeletons, and the judgement they encode all remain the author's to write.

---

## The Skill-to-Spec Coverage Gate

The `specs` block is only as valuable as the discipline that keeps it true, so the link is made **measurable**, not merely documented. A deterministic lint proves three things and reports a fourth:

- **Coverage (hard).** Every `SKILL.md` carries a `metadata.memo.specs` block. A skill with no declared specification dependency fails the gate; there is no opting out by omission.
- **Well-formedness (hard).** When `primary` is non-null it is the first entry of `all`; a `scope` marker appears only on out-of-process skills (those whose `primary` is `null`). A `scope` marker on a mapped skill is a contradiction and fails.
- **Spec existence (hard, when resolvable).** Every chapter id referenced by a skill resolves to a real chapter file. A reference to a chapter that does not exist is a dangling link and fails. When the specification side is not reachable, this check degrades to a skip rather than a false failure.
- **Orphans (report only).** Chapters referenced by **no** skill are listed as a warning, never a failure. A newly written chapter is expected to be unreferenced until a skill points at it, so an orphan is a prompt to wire it up, not a defect.

This gate is the direct mirror of two patterns the specification already relies on. It is the two-sided requirements model ([23-requirements.md](/specification/requirements/)) applied to skills: the `specs` block is the declaration, the lint is the check, and the same data both records the dependency and proves it. And it is the maintenance board ([33-maintenance.md](/specification/maintenance/)) applied to coverage: the link between skill and chapter is given a deterministic reading rather than left to trust, so drift between the two surfaces as a measured signal instead of an unpleasant surprise.

---

## The Bridge — A Per-Family Coverage Index

The coverage gate proves the link is *sound*; the **Bridge** makes it *legible*. Each specification family carries a generated Bridge page that turns the same skill-to-spec map around and reads it per chapter: for every page in the family it enumerates, by name, the skills that implement that page — a skill implements a page when the page's id appears in the skill's `all` list. A chapter that no skill implements yet prints an explicit "— none yet —", so the empty case is an honest signal that nothing has been built against that chapter rather than a silent omission.

The Bridge is never hand-written. It is generated from the skill-to-spec map, marked as generated, and regenerated on every build, so it cannot drift from the data it summarizes. The resolving coverage lint (check-skill-specs) is the gate that keeps that data true: it fails when a referenced chapter does not resolve, which is the same guarantee that lets the Bridge enumerate by name with confidence. Read together, the gate keeps the references real and the Bridge shows, at a glance, where the skills cluster and where the specification is still waiting for its first implementer.

These checks are unified into one maintenance gate, `memo spec doctor`, which runs three views in a single command — **skills** (the forward coverage lint above), **pages** (the inverse projection: each source chapter carries only the authored-source placeholder while the rendered backlink, the per-page Bridge, and the inverted map all agree with the map), and **requirements** (the store has no id-namespace collision and its index is fresh) — across all three families, and fails the build on any gap. It is the deliberate enforcer of full coverage: a partial state — a chapter with a missing placeholder, a drifted backlink, an id collision, or a stale index — cannot pass unnoticed. Where a sibling repository or the store is not checked out, the affected view degrades to an honest skip rather than a false pass.

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

## Conformity Requirements

The quality standard above is authored **prose-first** as declarative requirements (the prose-first guard, [35-memo-authoring.md](/specification/memo-authoring/)): each `statement` shapes how a skill and its evals are written, and each `check` feeds the finalization gate as a ternary `PASS` / `BLOCKED` / `INCONCLUSIVE` result ([23-requirements.md](/specification/requirements/)). The blocks below scope to the `skill` work category in `core` and are **harvested** into the requirement store. The three quality dimensions earn object `grade`s where they measure a spectrum; the structural rules stay `binary`.

Triggering is a measured spectrum — the ~90% standard above — so it carries an object `grade`:

```requirement
{
  "id": "REQ-773",
  "title": "Skill triggering meets the accuracy standard",
  "statement": "A skill's `description` MUST fire on at least roughly 90% of its should-fire inputs, produce zero false positives across its should-not-fire inputs, and classify its edge-case inputs correctly; when the should-fire rate falls below the bar, the `description` is refined and the set re-run rather than left failing.",
  "scope": { "repos": ["core"], "categories": ["skill"], "tags": ["skill-trigger"] },
  "severity": "blocker",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context evaluator runs the skill's trigger set — should-fire, should-not-fire, and edge-case inputs — and measures activation. PASS when the should-fire hit rate is at or above ~90% AND no should-not-fire input activates the skill; BLOCKED when the hit rate is below the bar or any false positive occurs; INCONCLUSIVE when the trigger set could not be run.",
    "verify": [
      "Run the should-fire inputs and compute the hit rate",
      "Run the should-not-fire inputs and confirm zero activations",
      "Run the edge-case inputs and confirm correct classification"
    ]
  },
  "grade": { "dimension": "trigger accuracy", "weight": 100 }
}
```

The trigger set it measures against must itself be classified, a structural assertion:

```requirement
{
  "id": "REQ-774",
  "title": "Each skill carries a classified trigger query set",
  "statement": "Every skill MUST carry a co-located trigger query set whose entries are classified into should-fire, should-not-fire, and edge-case buckets — each query assigned to exactly one bucket and all three buckets non-empty — so the triggering dimension has a representative set to measure against.",
  "scope": { "repos": ["core"], "categories": ["skill"], "tags": ["skill-trigger", "skill-evals-infrastructure"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The skill has a trigger query set co-located with its `SKILL.md`",
      "Each query is labelled exactly one of should-fire / should-not-fire / edge-case",
      "All three buckets carry at least one query"
    ]
  },
  "grade": "binary"
}
```

Execution assertions are counted and polarity-checked deterministically:

```requirement
{
  "id": "REQ-775",
  "title": "Each execution test carries three to five mixed-polarity assertions",
  "statement": "Each skill execution test MUST carry between three and five assertions covering both the output's structure and its content, and MUST include at least one positive assertion (the output must contain X) and at least one negative assertion (the output must not contain Y).",
  "scope": { "repos": ["core"], "categories": ["skill"], "tags": ["skill-execution"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each execution test declares between three and five assertions",
      "The assertions cover both output structure and output content",
      "At least one assertion is positive and at least one is negative"
    ]
  },
  "grade": "binary"
}
```

Whether the output is actually correct is a judged spectrum, graded by a fresh-context evaluator:

```requirement
{
  "id": "REQ-776",
  "title": "Skill output is verified, never assumed from invocation",
  "statement": "A skill's output MUST be checked against its declared format (files, folders, or structured content) and its content correctness MUST be verified against the input — the result is asserted, never inferred from the mere fact that the skill was invoked.",
  "scope": { "repos": ["core"], "categories": ["skill"], "tags": ["skill-execution"] },
  "severity": "blocker",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context evaluator runs the skill on a repo-local fixture input and judges the output. PASS when the output matches the declared format AND its content is factually correct and aligned with the input; BLOCKED when the format or content fails; INCONCLUSIVE when the skill could not be run against the fixture.",
    "verify": [
      "Run the skill against a repo-local fixture input",
      "Assert the output shape matches the declared format",
      "Assert the output content is correct and aligned with the input"
    ]
  },
  "grade": { "dimension": "execution correctness", "weight": 100 }
}
```

Autonomy is a countable property of a run:

```requirement
{
  "id": "REQ-777",
  "title": "Skill execution is autonomous",
  "statement": "A skill MUST run to completion without emitting unnecessary user prompts: unless the skill's design genuinely requires an input, the number of clarifying questions it raises during a run MUST be zero.",
  "scope": { "repos": ["core"], "categories": ["skill"], "tags": ["skill-execution"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Running the skill against a complete fixture input raises zero user prompts",
      "Any prompt that does occur is justified by a documented input requirement of the skill"
    ]
  },
  "grade": "binary"
}
```

Integration soundness is judged across the chain, and graded:

```requirement
{
  "id": "REQ-778",
  "title": "Skill integrates correctly within its declared chain",
  "statement": "A skill that sits in a chain MUST be exercised end-to-end together with its declared dependencies, and the output of each link MUST be a valid input to the next — a contract change in one link is caught where it breaks the following one.",
  "scope": { "repos": ["core"], "categories": ["skill"], "tags": ["skill-integration"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context evaluator runs the skill together with its declared upstream and downstream skills against fixtures. PASS when each link's output is consumed without error by the next; BLOCKED when a handoff fails; INCONCLUSIVE when the chain could not be exercised.",
    "verify": [
      "Identify the skill's declared chain neighbours",
      "Run the chain end-to-end on fixtures",
      "Confirm each output is a valid input to the next link"
    ]
  },
  "grade": { "dimension": "integration soundness", "weight": 100 }
}
```

Test isolation is the chapter's hard safety rule, a deterministic assertion that blocks:

```requirement
{
  "id": "REQ-779",
  "title": "Skill evaluations write only inside repo-local fixtures",
  "statement": "A skill evaluation MUST NOT write into a user-home location, a real repository, or any shared production directory: every write the evaluation performs MUST target the repo-local fixture tree, and reads may range wider but no write escapes it.",
  "scope": { "repos": ["core"], "categories": ["skill"], "tags": ["skill-testing-safety"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Every write performed by a skill evaluation targets a path inside the repo-local fixture tree",
      "No evaluation writes into a user-home path or a real (non-fixture) repository",
      "Real repositories are byte-unchanged after the evaluation runs"
    ]
  },
  "grade": "binary"
}
```

Finally, where the evals sit and what their fixtures mirror is structural:

```requirement
{
  "id": "REQ-780",
  "title": "Evals are co-located and fixtures mirror real structures",
  "statement": "A skill's evaluations MUST live alongside the skill (an `evals/` folder next to its `SKILL.md`), test-run results MUST be kept in a separate workspace area rather than mixed into the fixtures, and the fixtures MUST mirror the real artifact structures the skill operates on (for example a mock memo, a mock repo, and a mock PRD with representative files).",
  "scope": { "repos": ["core"], "categories": ["skill"], "tags": ["skill-evals-infrastructure"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "An `evals/` folder sits next to the skill's `SKILL.md`",
      "Test-run results are written under a separate workspace area, not into the fixture tree",
      "The fixture tree contains representative mock structures (mock memo, mock repo, mock PRD) that mirror real artifacts"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — classifies skill versus agent versus task; this chapter governs skill *quality* and assumes that classification.
- [./02-memo-sop-entrypoint.md](/specification/memo-sop-entrypoint/) — requires a distinct trigger per skill; this chapter supplies the quality measure for that trigger.
- [./23-requirements.md](/specification/requirements/) — the two-sided declare-and-check model the coverage gate mirrors.
- [./33-maintenance.md](/specification/maintenance/) — the board pattern that turns a link into a measured signal, applied here to skill-to-spec coverage.
- [./11-quality-and-finalization.md](/specification/quality-and-finalization/) — the finalization discipline whose quality posture this chapter extends to skills themselves.
- [./30-primitives.md](/specification/primitives/) — the concept map; a skill is the procedure primitive this chapter measures.
