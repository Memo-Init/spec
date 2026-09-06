# 49. Execution Workflow Guideline

| Field | Value |
|-------|-------|
| Status | Draft |
| Depends on | [13-orchestration.md](./13-orchestration.md) |
| Related | [08-phases-and-prds.md](./08-phases-and-prds.md), [12-rollout.md](./12-rollout.md), [27-landing-the-plane.md](./27-landing-the-plane.md), [38-stage-model.md](./38-stage-model.md), [48-research-waves-and-depth.md](./48-research-waves-and-depth.md) |

[13-orchestration.md](./13-orchestration.md) says **who** runs a phase — the roles, the dials, the state files, the three worker exits. What it has never said is **how a unit of work is actually worked through when it does not run cleanly**: something is built, the check fails, an adversarial read finds it mechanically green but unfaithful, a fix is pushed in, a second problem cuts across, one unit is held back with a stated reason, another is pulled forward, the workers are quiesced, the work is committed, the held unit comes back, the result is re-checked in the real environment, and the run lands. Every one of those steps has happened; none of them was written down. This chapter writes them down, and it fixes the vocabulary for the hold — the point where an unnamed suspended state does the most damage.

It also carries the revision of the orchestration rule. The earlier rule permitted a script-driven run for research only and forbade it for phase execution, on the stated grounds that agents are native to the harness and integrate better. The measurement contradicts that reasoning rather than softening it: of 32 recorded script-driven runs, **17 were implementation work**, 6 were research and 6 were verification gates — the pattern the rule described was not the pattern in use. The rule is therefore **replaced**, not extended (the answered question F16=A). An **execution workflow** — a Dynamic Workflow that works a phase — is a permitted mechanism, bounded by the fit rule below. This chapter states the course of the work; the search-side method of a research run stays in [48-research-waves-and-depth.md](./48-research-waves-and-depth.md) and is neither repeated nor weakened here.

---

## The Three Mechanisms and Their Fit

Orchestration has **three** mechanisms, not two. [13-orchestration.md](./13-orchestration.md) names them; this section decides which one a given piece of work pulls.

| Mechanism | What it is | Fit |
|-----------|------------|-----|
| **research fan-out** | model-driven: the Lead spawns a handful of parallel sub-agents and decides per turn (default 2–4) | a genuine **search** — see [48-research-waves-and-depth.md](./48-research-waves-and-depth.md) |
| **agent team** | native: Lead / Worker / Evaluator / Phase Evaluator, dependency-gated | **unknown** structure, and any run that must be steered while it is running |
| **execution workflow** | script-driven: a Dynamic Workflow (the type-(c) primitive of [14-agents-skills-tasks.md](./14-agents-skills-tasks.md)) whose script holds the loop, the branching and the intermediate results, applied to working a phase | **known** structure — the phases are known, the units per phase are known, the per-unit sequence is known |

**The fit rule is the structure, not the taste.** Known structure pulls the **execution workflow**: when the phases, the units and the per-unit sequence are fixed before the run starts, a script decides the same way twice, records what it did, and keeps the intermediate results out of the orchestrator's context. Unknown structure pulls the **agent team**: when the shape of the work is still being discovered, a script has nothing to hold.

**Three things only an agent team can do**, and they are the honest reason to choose it:

- **Talk to a unit while it works.** A running agent can be re-aimed mid-run; a script's step cannot.
- **Absorb the unforeseen.** When the structure turns out to be different from the assumption, an agent adapts inside the same run.
- **Ask back.** An agent can put a question to the user; a script can only stop.

The comparison behind the fit rule, measured over recorded runs of both kinds:

| Dimension | Execution workflow | Agent team |
|-----------|--------------------|------------|
| Determinism | the script decides; repeatable | improvised per turn |
| Orchestrator context | a leverage of roughly 90:1, up to 395:1 with a compact return | every intermediate step lands in the context |
| Visibility for the user | a phase view with consumption and runtime per unit | text messages |
| Traceability | a complete run record — script, result, log, phases, and per agent its state, model, consumption, tool calls, runtime | fewer fields; no terminal state per member |
| Intervention while running | **no** | yes |
| Resume | yes, finished units are skipped without re-cost | restart |
| Fit | known structure | unknown structure |

The single design lever against the orchestrator's context is the **size of the return**: one measured run returned 88 kilobytes and fell to a leverage of 45:1. A compact verdict is not a style preference; it is the mechanism that makes the leverage real.

Choosing the execution workflow changes **nothing** about the bounds that already hold. The parallelism dials of [13-orchestration.md](./13-orchestration.md) still bound how many units run at once, the dependency tree still decides which units may share a moment, and raising the parallelism beyond the dependency-gated default still requires measured evidence.

---

## The Sequence of a Unit of Work

The sequence below is the course of **one** unit of work that does not run cleanly. Every step is a step that occurred in a real run; none is constructed. The steps are in order, and each names its **actor** and the **context** that actor runs in.

| # | Step | What happens | Actor and context |
|---|------|--------------|-------------------|
| 1 | `assign` | Take the unit up: a **pointer-based** brief (the worker reads the unit's document and the spec itself, they are not pasted in), assign the worktree | Orchestrator, lean context |
| 2 | `build` | Build inside the isolated worktree | Worker, fresh context |
| 3 | `verify` | **One consolidated verifier**, compact verdict — PASS/FAIL plus minimal evidence plus the commit id | Verifier, fresh context |
| 4 | `verify-fail` | The adversarial read against the **transcripts and the finalized revision** — never against the unit's own document, which shares its blind spot. The recurring find is *mechanically green but unfaithful*: a writer that no caller ever reaches | Adversarial reviewer, fresh context |
| 5 | `fix` | The orchestrator pushes **one targeted fix** into the running run, then re-verifies once, targeted | Orchestrator, lean context → Worker, its existing build context |
| 6 | `anomaly` | A problem that cuts across the unit is reported as an **anomaly** and investigated — never quietly waved through | Orchestrator, lean context |
| 7 | `disposition` | A hold carries an **explicit disposition** from the register below; a permanent no carries its reason and its resume condition as a snag | Orchestrator, lean context |
| 8 | `reorder` | Another unit is pulled forward — the execution order is a recommendation, not a dogma; each increment starts in a fresh context | Orchestrator, lean context; the pulled-forward unit starts in a fresh one |
| 9 | `quiesce` | Before committing, the workers are **quiesced** — or verified idle and mtime-stable. A commit taken while a worker still writes produces orphaned pointers and a half-committed second state | Orchestrator, lean context — reads the disk, not the return channel |
| 10 | `commit` | One commit per unit, in the canonical format, **no push**; then the state files and the recovery point are updated | Orchestrator, lean context |
| 11 | `resume` | The blocker clears — the held unit is pushed back into the run, verified, committed | Orchestrator, lean context; the resumed unit gets a fresh Worker context |
| 12 | `gate` | Diffs in user-gated areas are presented **bundled at the end**, reversible and with backups; per diff a hard yes or a no plus snag, never applied mid-run | User gate — the user's own host-session context, not an agent context |
| 13 | `real-env` | After the merge, re-verify in the **real** environment: a worktree produces its own false signals, and locally green is not the target environment green. Gaps close as their own fix commits | Orchestrator, lean context, in the real checkout — not a worktree |
| 14 | `landing` | Name the open ends honestly, write the chronicle and the handover, clean up the worktrees. Landing is not optional; the stages are defined in [38-stage-model.md](./38-stage-model.md) and are not restated here | Orchestrator, lean context |

Two properties of the sequence are load-bearing. It is **not a happy path**: steps 4 through 8 and step 11 exist only because a run went sideways, and a guideline that omits them describes a run nobody has. And its fresh-context steps are **fresh on purpose** — the actor that built a thing cannot grade whether it is faithful, so steps 3 and 4 never run in the building context.

---

## Dispositions — the Vocabulary of a Hold

A unit that is put down is the most expensive thing in a run, because a hold without a name is indistinguishable from work that was simply forgotten. Every hold therefore carries exactly one **disposition** from the register below, and a disposition is only valid when it carries what its `requires` list demands. The register is data, not prose, so a machine can check a hold rather than a reader having to interpret one.

```dispositions
{
    "id": "execution-dispositions",
    "rule": "Every unit of work that is put down carries exactly one disposition from this register. A hold without a disposition is inadmissible: an unnamed suspended state cannot be distinguished from forgotten work, and neither the resume step nor the landing step can see it.",
    "dispositions": [
        {
            "id": "done",
            "label": "Done",
            "meaning": "The unit is finished and was verified in a fresh context; the verdict and its evidence exist.",
            "requires": [ "verdict", "evidence", "commit-id" ]
        },
        {
            "id": "partial",
            "label": "Partially done",
            "meaning": "A finished partial state: a nameable part of the unit holds and is verified, the remaining scope is named and is carried on as its own unit.",
            "requires": [ "what-holds", "remaining-scope", "carrier-of-the-remainder" ]
        },
        {
            "id": "deferred",
            "label": "Deferred by decision",
            "meaning": "The unit is put down deliberately although it could be worked, because another unit goes first. Deferral is a decision, not a pause.",
            "requires": [ "reason", "resume-condition" ]
        },
        {
            "id": "blocked",
            "label": "Blocked on an external dependency",
            "meaning": "The unit cannot proceed because something outside the run holds it — a foreign uncommitted change in the target file, a missing tool, an unavailable dependency.",
            "requires": [ "blocker", "owner-or-source", "resume-condition" ]
        },
        {
            "id": "user-gated",
            "label": "Held for a user decision",
            "meaning": "The unit touches an area only the user may release. It is prepared as a reversible proposal with a backup and presented bundled at the end of the run, never applied mid-run.",
            "requires": [ "proposal-diff", "backup", "rollback-path" ]
        },
        {
            "id": "no-with-snag",
            "label": "Deliberate no, recorded as a snag",
            "meaning": "The unit is deliberately not built. This is a decision, not a suspended state, and it is only valid as a recorded snag — the reason why it was refused and the condition under which it would be taken up again.",
            "requires": [ "reason", "resume-condition", "snag-record" ]
        }
    ]
}
```

The register is the **authored source**; `dist/data/execution-dispositions.json` is derived from it by the build and is never written by hand. The derivation fails loudly: a missing block, invalid JSON, a missing mandatory field, or a run over **zero** entries is an error, not a pass — and the deriver reports how many entries it compared, because a check that found nothing to compare has not run.

These dispositions describe a **unit of work over the run**. They are not the per-unit worker exits of [13-orchestration.md](./13-orchestration.md) (`set` / `justified-omit` / `blocked`), which classify each single thing a worker was asked to produce, and they are not the OPEN ENDS categories of [27-landing-the-plane.md](./27-landing-the-plane.md), which classify what the finished run leaves unresolved. The three vocabularies sit at three different granularities and are not interchangeable.

---

## One Consolidated Verifier per Unit of Work

The verification effort per unit settled at a value that was reached from both sides, and both error margins are worth naming because both were paid for.

- **Too little.** The orchestrator verifies itself, in its own context. The context fills with the material it is coordinating, and the run has to be interrupted for a reset every couple of hours.
- **Too much.** Seven separate verifiers per unit, each around ninety thousand tokens, and the same again after the fix for the re-verification. The cost is real and the additional finds are not.

**The anchor is one consolidated verifier per unit of work**, in a **fresh context**, checking all dimensions in one pass, returning a **compact verdict** — PASS/FAIL, minimal evidence, the commit id — with a fix and a re-verification only on a red result. Its brief is pointer-based: the verifier reads the sources itself rather than receiving them pasted in. This is a best practice, not a bound; what makes it work is that the return is compact, because the return size is the only lever the orchestrator has against its own context.

---

## What a Measured Run Showed

The five statements below were measured on the run this chapter was written for, and they are what an execution workflow has to be designed against.

- **Scale.** **75 sub-agents over 11 phases**, one unit of work per agent, each in an empty context, each with its own conformance gate. That — not three agents — is the order of magnitude the guideline is written for.
- **The return channel is unreliable; the disk is not.** An agent can work correctly, end regularly, and still never deliver. The orchestrator therefore checks the **written file**, not the message. A comparison that found nothing to compare is a finding, never a green.
- **The real concurrency was about two**, not the nominal upper bound. The dials of [13-orchestration.md](./13-orchestration.md) — a default of 8, a maximum of 16, `min(16, cores - 2)` — stand unchanged as the Soll bound; the measured reality on the host was two. A wave of ten agents therefore takes close to five times as long as the upper bound suggests. This chapter **quotes** that number; it does not change the dials.
- **Five ordering and file conflicts sat at the level of the unit of work and no invariant found them** at the time — the ordering half has since been closed by a unit-level check, the file half has not; see the gap below.
- **One check had to be sharpened four times**, and every sharpening was re-run against **all** earlier phases — see the rule below.

---

## The Gap That Was Named, and What Has Since Closed Half of It

The invariant gate carries its checks under stable ids. **`C11` checks the ordering topologically at the level of the phase only**: it reads the phase numbers from the ordering line and the dependencies per phase (`scripts/memo-invariants.py`, check `C11`). A level below the phase does not appear in it. That is why the five conflicts above — ordering and file collisions **between units inside a phase** — passed the gate unseen: on the phase level the graph was sound, and one level down nobody was looking.

The reference above names the check by its **id**, not by a line range and not by a count of checks. Both of those move: the gate grows a check whenever a run finds a class it missed, and a line number is stale the moment anything above it changes. A guideline that pins a volatile number teaches the next reader a fact that has already expired.

**The ordering half is now closed.** A **unit-level ordering check** (`C27` in the gate) was added — the sibling of `C11` one level down, reading the ordering of the units *inside* a phase where `C11` reads the ordering of the phases. Where `C11` stayed green across the whole damage, the new check reads the level the damage lived on. Its rules live in the gate; this chapter references it and does not restate them.

The reference deliberately carries **both** the id and the description. The id makes the check findable in one search; the description is the insurance, because this project has no allocation mechanism for check ids and has already had one collision — the number this check was commissioned under had been taken by another unit of work. With both present, a later renumbering degrades the reference instead of breaking it.

**The file half is still open.** The five conflicts were ordering **and** file collisions. The new check covers the ordering; **no check in the gate compares which files two units of the same phase will touch**. That half remains the **orchestrator's** responsibility before the fan-out, not the gate's afterwards — worth stating plainly, rather than letting the closure of one half imply the closure of both.

**Closing it required bending the rule this chapter states, and that is recorded rather than quietly dropped.** This section once argued that a gate is not changed in the middle of the run it is grading. The check was added mid-run regardless, because the same memo that commissioned this chapter also commissioned the check: holding it back would have meant refusing one of the memo's own units of work in order to protect a sentence in another. The exception is narrow, and its shape is what made it tolerable — the new check only **adds** a rejection and can never turn a previously red result green, so no already-accepted phase is retroactively softened by it. The re-run rule below therefore applies to it in full: it counts as performed only once it has been run against every phase already accepted. A mid-run gate change that could **loosen** an earlier verdict remains disallowed.

---

## A Sharpened Check Is Re-Run Against Everything Already Accepted

When a check is sharpened mid-run — because it let something through that it should have caught — the sharpening is **not complete until the sharpened check has been re-run against every phase already accepted under the old form**.

The reason is one-directional and cheap to state: work accepted under the weaker check was never held to the stricter one. Leaving it accepted turns the sharpening into a retroactive softening of everything that came before it, and the run then carries two grades of the same standard while claiming one. **A sharpening that has not been re-run against the earlier phases counts as not performed** — the check is recorded as still open, not as tightened.


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [13-orchestration.md](./13-orchestration.md) — the roles, the parallelism dials, the state files, the worker exits and the crash recovery this sequence runs inside; the mechanism policy this chapter is the fit half of.
- [14-agents-skills-tasks.md](./14-agents-skills-tasks.md) — the three agent-execution primitives; the execution workflow is the type-(c) Dynamic Workflow applied to a phase.
- [08-phases-and-prds.md](./08-phases-and-prds.md) — the dependency tree that decides which units may share a moment.
- [12-rollout.md](./12-rollout.md) — the Generate→Execute→Evaluate rollout the sequence above is one unit of.
- [27-landing-the-plane.md](./27-landing-the-plane.md) — the OPEN ENDS categories of the landing step, distinct from the dispositions here.
- [38-stage-model.md](./38-stage-model.md) — the four stages the `landing` step points at rather than restating.
- [48-research-waves-and-depth.md](./48-research-waves-and-depth.md) — the method of a **search**; this chapter governs the course of an **execution** and repeats none of its rules.
