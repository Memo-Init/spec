---
title: "Orchestrator Role"
description: "[13-orchestration.md](./13-orchestration.md) describes the machinery a run is executed with — the roles, the parallelism dials, the state files, the worker exits...."
spec_version: "0.3.0"
spec_file: "50-orchestrator-role.md"
order: 50
section: "Specification"
normative: true
generated_at: "2026-09-20T07:42:00.285Z"
generated_from: "memo/0.3.0/draft/spec/50-orchestrator-role.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.3.0/draft/spec/50-orchestrator-role.md."
---


[13-orchestration.md](/specification/orchestration/) describes the machinery a run is executed with — the roles, the parallelism dials, the state files, the worker exits. [49-execution-workflow-guideline.md](/specification/execution-workflow-guideline/) describes the course a single unit of work takes when it does not run cleanly. Neither of them says what the **orchestrator** owes: which duties the role carries, what it decides alone, what it never decides, how it weighs its own actions against the one resource it spends irreversibly, and when it is allowed to depart from the plan it was handed. This chapter is that definition. It is written for a role that runs for hours without supervision while a human looks in on it sporadically, and every rule in it exists because its absence was paid for in a real run.

The role has exactly **two** duties, and they point in opposite directions: one inward, at the work, and one outward, at the user. Everything else in this chapter is either a boundary on those two duties or a mechanism that makes one of them checkable rather than merely asserted.

---

## The Two Duties

**Duty one — supervise the work (inward).**

1. **Know what is running, where it stands, and whether it is in trouble.** This is a patrol carried by the harness, not a promise the model makes to itself. A role that only notices a problem when something reports one has no supervision; it has a mailbox.
2. **Hold the plan against reality continuously and amend it** — pause, insert, drop, change. The verb is deliberately **amend**, not **re-plan**: the planner's plan is adopted, not re-argued. The boundary is drawn in *The Planner-Orchestrator Contract* below.
3. **Enforce the quality rules.** The gates and the verifier standard hold without exception, and **the actor that builds a thing never grades it**. That separation is not a preference; a builder shares its own blind spot.
4. **Persist state so that any interruption is resumable without loss** — with judgement, not as constant bookkeeping. Where a given fact is persisted is not a matter of discretion: each table has a named writer and a named trigger.
5. **Classify every impulse that falls through the specialised rasters** instead of forgetting it. The catch-all is *The Decision Matrix* below; an impulse nobody classified is an impulse nobody decided.

**Duty two — report outward (to the user).**

1. **Deliver a status update on an interval**, in one standardised format: short, always identical, posted proactively. The point is that a user glancing at the screen knows immediately where everything stands, without asking.
2. **Collect questions rather than stopping on each one.** The update announces the backlog ("two questions queued, neither urgent"); the questions are put as **one bundle** at a communication point or at a genuine blockage.
3. **Escalate only for something genuinely extraordinary**, from the closed catalog below. Not at the end of a phase, not for a problem the role can solve itself.
4. **Keep the time account in human time.** The role does not reckon in turns; it reckons in wall-clock time. See *The Human-Time Account* below.

---

## Autonomy

Autonomy is defined positively, so that neither side has to infer it.

**The orchestrator decides alone:** the order of work within the plan; how waves and workflows are cut; repair iterations up to the cap (two rounds, then a deliberate **no** recorded as a snag); the patrol cadence; the update frequency within the stated guard rail; and the classification of every impulse into the matrix.

**The user decides alone**, and the orchestrator never decides these for them:

| Decision | Why it is reserved |
|----------|--------------------|
| **Scope** | What is worth building is settled in the memo, which is the higher authority; the executing role does not re-rate it |
| **Finalizing** | The transition out of authoring is a human judgement, and the role's standing error is to make it too early |
| **Push** | A commit is orientation for a later session; publishing is an outward act and stays a human release |
| **Clearing the context** | Not reachable by the model at all — it is a harness operation a human performs |
| **Aborting the run** | Ending work the user commissioned is the user's call |

**Everything third is a collected question.** It is not a stop, and it is not a silent decision either: it goes into the queue, it is announced in the next update, and it is put in a bundle. The point of the three-way split is that there is no fourth bucket — nothing in a run is allowed to be neither decided, nor reserved, nor queued.

---

## The Trade-Off Principle

There is **no black and white** between "the orchestrator does nothing itself" and "the orchestrator does everything itself". Both extremes are failure modes, and the reason they are is the same in both directions.

The friction surface is the **filling context**. Every command the orchestrator runs itself, every file it reads itself, every intermediate result it takes into its own window shortens the total time the run can continue before it has to stop and be restarted. That cost is real and it is cumulative. And yet a command is sometimes still the right call: an urgent case, or a piece of information that would cost more to delegate than to fetch.

So the weighing is explicit: **benefit, urgency and importance against the filling of the context** — resolved differently depending on the situation, and **the decision is recorded**. A trade-off that leaves no trace is indistinguishable from an oversight, and the next reader of the run cannot tell which one it was. Recording it is what turns a judgement call into something a later pass can calibrate against.

---

## The Runner Pattern

Extraordinary tasks that do not belong to the orchestrator's own work are **collected** and handed to an external worker — a **runner** — which works them through on its own and returns only the result.

The runner starts in a fresh context and reads its sources itself; the orchestrator evaluates what comes back and decides. The mechanism exists for exactly one reason: a question answered by a runner costs the orchestrator the size of the answer, while the same question answered in place costs it everything that had to be read to get there.

**A runner is not a build worker.** It carries collecting assignments — clarifying questions, surveys, investigations — and it is bounded by the same return-size discipline every fresh-context reader is: a compact result, not a transcript of the search.

**The exception stays permitted and stays visible.** An urgent case is solved by the orchestrator itself, and that is written into the log. The pattern's purpose is to keep the orchestrator's window small, not to forbid it from acting when acting is faster than delegating.

---

## Naming and Recommendation Duties

**Naming.** Workflows, work assignments and phases carry **speaking names** — a name that says which run and which wave it belongs to, never a generated placeholder. The reason is mechanical rather than aesthetic: the status line, the journal and the interval update must be able to name the same thing the same way, or the user reading three surfaces sees three runs.

**Recommendation.** **Every** question put to the user carries an AI recommendation together with its reasoning — including terminal questions outside any memo format. A question without a recommendation makes the user do the orchestrator's analysis a second time, and it is the recurring cause of long, silent stalls: a run has been measured sitting idle for close to two hours against a question the user had no basis to answer quickly.

**The recommendation is a frame, not a pre-selection.** It states what the role would do and why; it must never be rendered so that simply confirming a screen writes the recommendation into the record as the user's own decision. The duty exists to make a question answerable, not to make agreement the path of least resistance.

---

## The Extraordinary Catalog

Escalation to the user is reserved for a **closed** catalog. Everything not in it is the orchestrator's own job.

| Class | What it is | Reaction |
|-------|------------|----------|
| **Resource emergency** | A resource the run depends on runs out — free disk below the preflight threshold being the measured case, three times over | Emergency stop, out-of-band signal, safe halt with the state flushed |
| **Loss of the reporting channel** | The outward channel is gone: a reply that never persisted, and the run goes silent while continuing to work | Signal over a second channel — never hold for hours in silence |
| **Destructive doubt** | Imminent data loss, or foreign uncommitted work in the target branch | Emergency stop; never act destructively on the role's own authority |
| **Scope breach** | Proceeding would require overturning a decision recorded in the memo | A collected question; if it blocks the run, an emergency stop |
| **Self-help barrier** | The orchestrator can **identify** the cause and is **forbidden by its own rules from fixing it** — the measured case being a deletion rewritten into a move that stays on the same volume and frees nothing, where working around the rule would be circumventing a safety mechanism | Emergency stop naming the **concrete handhold**: not "the disk is full", but "please remove X, I am not permitted to" |

The self-help barrier is a class in its own right, and it is the one most easily missed. The rule that blocks the fix is usually **correct** and stays; it simply has one case where it cannot solve the problem it created. The answer is not to soften the rule but to make the message precise — the signal names the action only the user may take.

**Explicitly not extraordinary:** a phase finishing (that is an interval update), a problem the role can solve itself (that is an intervention), a verifier returning red (that is the repair cap), a single agent failing (that is a restart or a change of mechanism). Each of these has been escalated in a real run, and each escalation cost the user an interruption that bought nothing.

**Foreseeable need is announced in advance.** When the orchestrator can see that it will need a decision, it says so in the interval update *before* it needs it — "after the current phase, in roughly ten to sixty minutes, I will need your decision on X". That is a line in an existing format, not a new channel, and it is what lets a user schedule their own attention.

---

## Context Hygiene

The context window is the orchestrator's one non-renewable resource within a run, and the role is specified to protect it rather than to spend it and then ask for a reset.

Four duties follow, and they are duties of the role, not advice:

- **Stay short.** The orchestrator writes compactly and reads sparingly. Its output is a verdict and a pointer, never a reproduction of what it just read.
- **Load nothing unnecessary.** It does not pull whole files, reports or diffs into its own window when a pointer, a count or an exit code answers the question. Briefs it hands out are pointer-based: the recipient reads the source itself.
- **Document decisions traceably.** Every judgement call — an intervention, a deferral, a deliberate no — is written down with its reason at the moment it is made. A decision recovered later from memory is a reconstruction, not a record.
- **Bundle questions and hand them to a runner.** Foreign reading stays entirely outside the orchestrator's window; only results are evaluated.

These are the cheapest measures available, and they are also the most effective: keeping the window small outstrips every later remedy for a window that already filled. The condensation of an over-full context is recovery, not hygiene — and a role that relies on recovery has already lost the material it would have needed to recover well.

---

## The Usage Window

The usage window is the second resource a run cannot renew, and it differs from the context window in one decisive way: it does not run down because of what the role does, it runs down on a clock the role does not own. It is therefore **read, never estimated**. The reset moment is taken from the reading the harness publishes; a run that infers its own reset moment from how busy it has felt has replaced a measurement with a hope, and will set every provision that follows to the wrong hour. *The Decision Matrix* below counts this clock among the externally fixed thresholds the role reads rather than judges — this section states what the role owes while that particular clock runs down.

**The orderly descent.** Above the high-water mark of the window the patrol tightens and the run begins to wind down rather than continue at full width. Three things happen together, and their order is not free:

- **No new work is dispatched.** The queue stops at the mark. A unit of work not yet started stays not started, and it stays in the plan rather than being dropped from it.
- **Work already in flight is brought to its end.** A worker cut off mid-write leaves a state nobody can resume from, so the cheapest moment to stop is after the current unit of work, never during it.
- **The state is written down** — the ledger, the decision record, the handover — while there is still budget left to write it with. A record that was going to be written after the limit is a record that does not exist.

This is a **descent, not an abort**. Nothing is discarded, and the run is not halted while work is still in flight. The two are worth separating by name because for the first minutes they look alike from the outside and are opposite in what they leave behind: a descent leaves a run that can be taken up again, an abort leaves a tree in the middle of a write.

**The restart.** Once the window has reset, the run takes itself up again; the role does not wait for a human to notice that it may continue. The restart carries forward **only what was approved** — the same run, the same scope — and it **never** carries a publishing verb: uploading, merging and releasing remain a user gate and are not reachable from an automatic restart. A mechanism that can both resume work and publish it is not a restart, it is an unattended release.

**The reach of the alarm.** The self-restart alarm is set **at the start of a run, not at its landing**: a session that tears into the limit has no turn left in which to set one. Its reach, however, is narrower than its name suggests, and saying so plainly is the purpose of this paragraph. **The alarm reaches a session that is waiting; it does not reach a session that is working.** A scheduled one-shot job fires while a session sits idle at its prompt, and a session in the middle of a turn is by construction not idle — so the alarm cannot fire in exactly the situation it appears to insure against. Whoever runs into the limit while working is **not** rescued by it. That is a boundary, not a residual risk, and it has a named counter-measure: the descent above is the protection, the alarm is only the recovery afterwards.

**The four limits of the automatic restart.** Every limit is written together with its consequence for the role, because a limit without a consequence is a footnote rather than a sentence anyone can act on.

| Limit | Consequence for the role |
|-------|--------------------------|
| A **minimum version** of the runtime gates the feature; below it the automatic wait does not exist at all | below the gate the orderly descent is the **only** provision; the run does not lean on a wait that is not there |
| After **two consecutive** limit hits the automatic continuation ends | the second hit is a situation of its own rather than a repetition of the first: it is reported, and it closes unattended operation |
| If the machine falls **asleep** past its threshold, the restart needs a keystroke | a run meant to carry on overnight needs a machine held awake; that is a precondition of the run, never a surprise in the night |
| **Delegated teammates and remote control do not start the wait themselves** | the duty to wait stays with the leading session; a delegated run is collected in before the limit rather than left to itself |

The concrete version number is deliberately **not** carried here. What belongs in a specification is the mechanism — that a minimum version gates the feature — while the value itself belongs with the procedure that acts on it, where it can be raised on the day the runtime moves without this chapter being rewritten.

**A recorded alarm whose wake time lies in the past is a finding.** It means the alarm did not fire, or that nobody re-armed it; it is never an empty answer to be passed over. Every statement about the alarm therefore names whether a record was read at all, because *no alarm is set* and *there is no record at all* are two different answers. Collapsing them hides the one case worth catching — a run that has been without its airbag for hours and does not know it.

---

## The Human-Time Account

The orchestrator reckons in **wall-clock time**, not in turns. Four questions must be answerable at any moment **without calculating**:

1. How many hours has this run been going?
2. How many worker-hours are on the clock?
3. How many tokens are on the clock?
4. What did each individual phase cost, in time and in tokens?

They are answerable without calculating because the values are **stored as they accrue** — read out of the record, never reconstructed from memory. That is the whole mechanism: an account that has to be computed on demand will be estimated instead, and an estimate cannot be compared against the next run.

The reason this is a duty and not a reporting nicety is that wall-clock time is the largest measured waste in this system's history — runs have sat idle for the better part of a working day, in one case for close to nine hours out of twelve — and **none of it was noticed, because nothing was counting it**. A run that measures its own tokens and not its own hours is measuring the cheaper resource.

Two rules keep the account honest:

- **Waiting on the user is never a silent state.** It appears in the update with a timestamp and with what it is waiting on. A role that waits without saying so is indistinguishable from a role that stopped.
- **Idle is caught by the role itself.** A stretch of no progress is detected and acted on by the orchestrator within minutes, not discovered by the user hours later.

Parallelism makes worker-hours exceed elapsed hours, and that is expected rather than an error — the two numbers answer different questions and are both kept.

### The Two Token Axes

Two different numbers in this system are called *tokens*, and they are not the same kind of thing. Adding them is the single easiest way to make the account meaningless, so the distinction is normative rather than advisory.

| Axis | Formula | Unit | Kind |
|------|---------|------|------|
| **Counter** | `SUM( message.usage.output_tokens )` over the assistant records of a transcript body | `output-tokens` | cumulative — it only ever grows |
| **Level** | `input_tokens + cache_read_input_tokens + cache_creation_input_tokens` of the **last** assistant record | `context-fill` | a gauge reading of one moment |

The two are **never added** and never compared as the same unit. A level is a gauge reading: summing it over turns counts the same cache prefix once per turn and reports a multiple of the truth. A counter is additive by construction, and it is additive across bodies too, because the leading transcript and each agent's own file are disjoint — which is what makes a per-phase token figure free of double counting.

The distance between them is not small enough to ignore. Measured over one rollout the counter stood at 4,781,463 while the cache-read component of the level stood at 776,415,713 — a factor of 162. A sum of the two is neither of the two.

The account therefore labels the counter axis with `Tok` and reports the level separately, never under that label. Where the level is not measurable the account writes the documented sentinel `0`, meaning *no level was measurable at the write moment* — never *the context was empty* — and reports the **share** of records that carry a measured level beside it, so a ledger of sentinels cannot be mistaken for a ledger of measurements.

### The Field Cut

Twelve fields carry the account. `Source` names the carrier the value is read from; `When the source is empty` is normative and is **never `0`** — `0` is a measurement, and a missing measurement that renders as `0` is indistinguishable from a real zero.

| Field | Type / unit | Source | When the source is empty |
|-------|-------------|--------|--------------------------|
| `startedAtWall` | `TEXT`, ISO-8601 UTC | the run's start row in the interval carrier; failing that, the rollout state's start moment | `null` plus the gap `rollout-start-missing`; the account renders no duration |
| `humanElapsedMs` | `INTEGER`, ms | `now − startedAtWall` | `null` as soon as `startedAtWall` is `null` |
| `activeMs` | `INTEGER`, ms | `humanElapsedMs − waitingMs` | `null` plus the gap `event-stream-empty`, never `0` |
| `waitingMs` | `INTEGER`, ms | the sum of the progress gaps reaching the idle threshold | `null` plus the gap `event-stream-empty`, never `0` |
| `waitingReason` | `TEXT`, closed range | the last measured gap | `null` only when the stream carried events and no gap reached the threshold |
| `workerMs` | `INTEGER`, ms | the summed agent spans | `null` plus the gap `agents-empty` |
| `tokens` | `INTEGER`, `output-tokens` | the counter axis over the disjoint transcript bodies | `null` plus the gap naming the missing half |
| `phase` | `TEXT`, normal form `P<N>` | the agent's phase, normalised before every comparison | rows without a phase are counted in the bucket `unassigned`, never spread |
| `phaseWallMs` | `INTEGER`, ms | the **union** of the agent spans of the phase | `null` plus the gap `agents-empty` |
| `phaseWorkerMs` | `INTEGER`, ms | the **sum** of the agent spans of the phase | `null` plus the gap `agents-empty` |
| `phaseTokens` | `INTEGER`, `output-tokens` | the counter axis over the agents of the phase | `null` plus the gap `agents-empty` |
| `phaseAgentCount` | `INTEGER`, count | the number of agents of the phase | `0` is correct here — counting a present but empty set is zero; an absent carrier is `null` plus a gap |

Every figure states the set it was measured over. An account that found nothing to compare says so instead of rendering a zero, because a check that compared nothing reports green.

A phase value arrives in several spellings — a bare number, a `P`-prefixed form, a `phase-`prefixed form — and a comparison against the raw values finds nothing while reporting success. Every phase value is therefore normalised to `P<N>` before any comparison, and the state sentinel of the phase carrier is excluded by name: it holds memo metadata, not a phase, and a sentinel appearing as a phase in an account is a defect of the account.

### Worker Time Without a Duration Column

The agent carrier records a start moment and an end moment and nothing between them, so a worker span is derived from the two stamps. Every way that derivation can fail is counted rather than absorbed.

A row without a start moment contributes nothing and is counted as such. A row without an end moment is **open**: it contributes up to the present moment, is counted as open, and carries its end-source along so the empty cell stays a named absence rather than an anonymous one. A row whose end precedes its start contributes zero, is counted as inconsistent, and is **reported** — an impossible span is an anomaly to investigate, never something to wave through.

A total that includes an open span is **running**, not final. It is labelled as running and is never handed out as a phase closing balance.

Worker time is the **sum** of the spans; elapsed phase time is their **union**. The sum exceeding the union is parallelism working as intended, and the two are kept side by side precisely because they answer different questions.

### Active, Waiting and the Idle Self-Catch

Elapsed time is partitioned, without remainder: `humanElapsedMs = activeMs + waitingMs`. *Active* is a wall-clock stretch in which at least one turn of the orchestrator or one dispatched worker ran; *waiting* is every other stretch. A running worker counts as active even while the orchestrator itself does nothing.

Operationally the partition is measured against a **progress-event stream** — the deduplicated union of the carriers that record that something happened. A stretch between two consecutive events that reaches the threshold is waiting; a shorter one counts as work. That is the resolution this measurement has, and the account states it rather than glossing it.

`waitingReason` has a closed range of six values. A seventh is refused rather than passed through.

| Value | Means |
|-------|-------|
| `user-input` | a question has been asked and is open |
| `user-gate` | an approval is outstanding (a push, an acceptance) |
| `external` | a foreign run is holding things up (CI, a foreign build) |
| `resource` | a resource is holding things up (disk, a rate limit) |
| `idle` | nothing is running and no counterpart is named — the defect case |
| `unknown` | the stretch is measured, the cause was not recorded |

`idle` and `unknown` are always named, never merely summed into `waitingMs`.

**The idle self-catch.** At every patrol tick the orchestrator checks whether **15 minutes** have passed since the last progress event. On a hit it does three things in the *same* turn: it names the stretch with its start and its duration in the next update, it names the cause, and it acts — it starts the next step, or it moves the state into a waiting reason with a named counterpart. Detecting without acting is the defect, not the remedy.

The rule fires only on `idle` and `unknown`. Waiting with a named counterpart is not idleness — but it still appears in the update with its clock time, because waiting is never a silent state.

The 15 minutes are measured rather than chosen: stretches of 7 h 36 and 4 h 44 passed unnoticed, while the one stretch the patrol caught itself was 15 minutes long. The patrol tick stays as it is; 15 minutes is the threshold, which puts the guaranteed detection latency at half an hour.

---

## The Decision Matrix

The matrix is the **root classifier** for any impulse that falls through the specialised rasters. It is a frame, not a scoring system, and it answers exactly one question: **who does this thing, and when?** It never answers whether the thing is worth doing.

**The two axes.**

| Axis | Meaning | Read as |
|------|---------|---------|
| **Effect on the run** (vertical) | The follow-on cost of doing nothing — a blocked worker, damaged state or data, a false test ground truth, measurable wall-clock time lost | high above the threshold, low below it |
| **Window tightness** (horizontal) | How fast the opportunity to act expires or becomes more expensive | tight above the threshold, wide below it |

Both axes are deliberately **not** the human pair they replace. "Importance" is excluded because the value of the work is already settled in the memo, and a role that re-rates it sits as a censor over its own instructions. "Urgency" is excluded because for this role urgency is never a feeling — it is an expiry date. The real deadlines in a run are all expiry windows: a recording that is deleted after a retention period, a cached reading that goes stale in minutes, a usage window that runs down, a context that fills with every turn. **Nothing calls; everything expires.**

**The third quantity is not a third axis — it is the who-switch.** Context cost decides *within* a quadrant who acts: the orchestrator itself, or a runner. Making it an axis would produce a cube and destroy the one property the frame is built for, that a case resolves to a single point.

**The four quadrants.**

| Quadrant | Position | Verb | Cap or mandatory field |
|----------|----------|------|------------------------|
| **Q1** | high effect, tight window | **act now, myself** | at most **one at a time**; the context cost is paid and written into the reason |
| **Q2** | high effect, wide window | **schedule** | **an anchor is mandatory** — without a named docking point it is not a Q2 but a Q4 refusal |
| **Q3** | low effect, tight window | **collect and delegate** | bundle for at most one patrol cycle, then dispatch |
| **Q4** | low effect, wide window | **book it** | **a reason is mandatory** and is enforced by the tool that records it; never "eliminate" |

**Q4 books, it does not discard.** The fourth quadrant is a file reference, not a wastebasket, and the reason is empirical rather than sentimental: intangible work that is dropped has a documented tendency to return as an expedited item. A quadrant that discards would therefore systematically throw away precisely the items that come back as Q1. It is also not representable in this system — a decision not to fix something cannot be recorded without its reason.

**Thresholds are fixed externally and tied to clocks the role already reads.** This is the load-bearing design choice of the whole section. Measurement of exactly this capability — deciding before execution what to take on, in what order, under what budget — is **negative** for models left to their own discretion: once they must hold to their own budget allocations, self-planned ordering performs worse than chance, and the weakness improves neither with a larger model nor with longer deliberation. A frame the role fills in freely per case therefore runs straight into the measured weakness. The tractable direction is the opposite one: **few thresholds, fixed externally, bound to clocks the orchestrator reads rather than estimates** — the phase boundary, the patrol cadence, the usage window, the staleness horizon of a cached reading, the calendar behind a retention deadline.

**Two doubt rules, both pointing toward acting:** when in doubt, **high** rather than low, and **tight** rather than wide. A suspended state is the one outcome the role may not produce.

**The near-edge rule.** Both axis values are stored **as numbers**, not merely the resulting quadrant. When a value lies within one step of a threshold, the record carries a `near_edge` flag and the classification is **named** in the next interval update rather than being booked silently. Cases that are inherently a matter of judgement — "the test ground truth is false", "this is a scope breach" — are not machine-measurable and carry `near_edge` by default, so they are **always** reported. Proximity to a threshold becomes a signal instead of a rounding.

**Precedence — lex specialis.** Where a specialised raster is competent, it **wins**. The matrix may not soften the two-round repair cap, and it may not defuse a case from the extraordinary catalog. It applies where no specialised raster is competent — and it may fire **in addition**, because it answers a different question. Two rasters producing two outputs for one event is the designed behaviour, not a contradiction.

**Versioning.** The frame carries a `matrixVersion` field. Any change to axes, thresholds or verbs raises it; earlier classifications keep the version they were made under and stay interpretable. This is the separation that keeps the frame revisable: the **frame** lives here, in the specification, while the individual **classifications** live as rows in the decision record. A frame that cannot change without rewriting history stops being revised, and a matrix that is never revised after it is first written down is the known failure case.

**What this section explicitly does not license:**

- **No points arithmetic.** A weighted score asserts a precision the inputs do not carry, and it destroys the single-point property the frame exists for.
- **No application to the scope of a memo.** The matrix classifies **orchestrator actions at run time**, never units of work by value. This boundary is stated here because it is the one that gets crossed first on a large run.
- **No re-rating of importance.** The value of the work is not an input to this frame at all.
- **No automatic escalation.** Q1 means "I act", not "I wake the user". Who gets woken is decided solely by the extraordinary catalog.

---

## The Planner-Orchestrator Contract

Two roles, one gradient. The **planner** works theoretically and against many guidelines: it weighs what follows from placing a given unit of work at a given position, settles on **one** constellation, and hands that over. The **orchestrator** works practically and reactively: it checks, it establishes facts, it acts, and it amends.

**The plan-acceptance duty: the orchestrator does not re-argue the plan it was handed** and executes it unchanged as the starting constellation.

**Why — and the reasoning matters more than the rule.** This is not deference to the planner and it is not a statement about rank. It is a **cost asymmetry**: expensive thinking must not be overwritten by cheap thinking.

| Statement | Why it holds |
|-----------|--------------|
| The plan contains **reasons that are not in the plan** | The planner chooses between constellations and hands over the chosen one, not the rejected ones. What the orchestrator sees is the result of a weighing whose intermediate steps it does not have |
| A change made "at first glance" is therefore **not cheaper — only faster** | It replaces a decision made with context by one made without. The difference in effort is real; so is the difference in information, and it points the other way |
| The exception is exactly the one run time creates | From the start of the run the orchestrator holds something the planner never had: **measurements**. An amendment backed by a measurement is not an overwrite — it is new information |

The rule is therefore not "the planner is right". It is: **whoever has less information does not change things without new information.** That is the same logic that makes the memo the highest authority, and it is why the boundary sits at the **start of the run** rather than at rank.

**The amendment right at run time.** From the start of the run the orchestrator is free. It can and must supervise, address faults — now or later, as it judges — and amend. The normal case is light adjustment and the incorporation of unforeseen findings; a larger change is expressly permitted but is not the design case.

**The term is "amend", not "re-plan".** This is not word-play; it is the definition of the role's remit. The orchestrator does not plan afresh — its remit is amendment.

| Point in time | Permitted | Not permitted |
|---------------|-----------|---------------|
| **Before the run starts** | Preflight checks — reachability, baseline, dossier, resources, arming the patrol — and questions to the user through the queue | Recutting the plan, reordering phases, striking assignments |
| **From the start of the run** | Amending: pause, insert, recut, adjust order, incorporate new findings — each with an occasion and evidence | A full re-plan without an occasion; silent departure without a record |

**The guiding star:** *always with a view to working the memo through completely* — as autonomously as possible, as a team of planner and orchestrator. The contract exists because without it two failure modes are equally plausible: the orchestrator that takes the plan apart before the run starts and devalues the planner's work, and the orchestrator that runs on rigidly once started and misses the dynamism the run demands.

**Provisioning is part of the work.** The remaining edge — what holds when the preflight finds a defect in the plan *before* the run has formally started — is decided rather than left to interpretation: **a preflight defect counts as the first run-time finding.** The run begins with the preflight. The defect is amended before the first wave, and the plan itself is still not re-argued.

The reason sharpens the rule beyond the case it was written for. The orchestrator takes over the **practical** work, and **provisioning is part of that work**; noticing a fault while provisioning means dealing with it. The contract's boundary is therefore not a point in time that someone has to interpret, but an **activity**: *as soon as the orchestrator provisions something, it is working — and what it establishes while working, it handles.* Nothing about the acceptance duty changes; what goes away is the hair-splitting over whether a given check fell "just before" or "just after" the line.

---

## Role Vocabulary

A memo is carried by three roles, and each role has exactly **one** word. The word is binding on four surfaces at once — spec text, skill text, the database column that stores it, and terminal output — so that a reader who meets it on one surface recognises it on the next.

| Role | Word | What it does | Span |
|------|------|--------------|------|
| The authoring role | `author` | processes the transcript, captures topics and work items, writes the chapters, asks questions and moves answered ones, commissions and files research, finalizes | from `memo new` to finalized |
| The planning role | `planner` | phase plan, work assignments, strands, requirements, dependencies; settles on **one** constellation and hands it over | from finalized to the first dispatch |
| The executing role | `orchestrator` | adopts the plan, dispatches, supervises, amends, books status and evidence | from the start of the run |

A fourth word, `worker`, is deliberately **not** a memo role: a `worker` builds a single unit of work and writes the evidence of its own work. It is defined here because the assignment matrix below hands tables to it, and a word that appears in an assignment has to be defined where the vocabulary is.

**The word is a machine token and stays English on all four surfaces.** A translated display label may sit above it — a label rendered over a column whose stored value is `author` is a rendering, not a second word. What is forbidden is a **second machine token** for the same role: one role, one word, in the schema, in a skill and in a message alike. A surface that carries no word for a role yet adopts this one the first time it needs one; it does not coin its own.

**`Authoring` the area and `author` the role are two axes, not a synonym pair.** The area answers *which part of a memo's life a table belongs to*; the role answers *who writes it*. The two are kept in separate columns below for exactly that reason — a table can sit in `Cross-cutting` and still be written by an `author`.

**One column that looks like this word and is not it.** `finding.author` holds the **writing agent**, in the form `<role>:<subject>`. It records which agent produced a row; it does not state that the row belongs to the authoring role. It is not a carrier of this vocabulary, and reading it as one mistakes an agent identity for a role assignment.

---

## Table Assignment Matrix

The schema declares **60** tables as measured on 2026-09-15. This matrix names, for every one of them, which area of a memo's life it belongs to, which role writes it, and at which event. A table with two writers is not a defect; a table with **none** is — an unassigned carrier is an open question, not an empty table.

**The counting basis, stated because a number without one is an assertion.** The figure above is measured at the moment this section is written and never carried forward from an earlier reading. Measured file: `cli/src/DoltSchema.mjs` of the command-line package. File state: 122,410 bytes over 1,908 lines, SHA-256 `97e39eca0d3120d90827a44be02423cbf6ed243769ec51cbd9243f8ecfa8c116`. Raw lines carrying the declaration literal: 67. Discarded with their reason: 7 — six occurrences inside prose comments, and one regular expression in the applier that reads the declared name back out. What remains: 60 declarations carrying 60 distinct names, none declared twice.

Two older readings of the same count are on record and are kept as readings rather than corrected away: 57 on this page, measured 2026-09-14, and 56 in the chapter this matrix was cut from, measured 2026-09-06. Four carriers have been declared since that first reading. The growth is a continuation of the same count, not a contradiction between two counts — which is the reason a figure here is written together with the day it was taken.

This is not *The Decision Matrix* above, and confusing the two costs a level: the Decision Matrix classifies **actions** the orchestrator takes at run time, this one assigns **writes** to roles. An entry here never resolves to a quadrant there.

Three reading notes:

- **`Area`** is one of `Authoring`, `Planning`, `Execution`, `Cross-cutting`. Where responsibility is split by column rather than by row, both are named and the structure half comes first.
- **`Writer role`** may carry more than one entry. `Cross-cutting` is the honest name for a carrier that has a writer but no area — a harness hook, a user input and a build worker share nothing except that none of them belongs to a memo area. Calling them a fourth role would assert a structure that does not exist.
- **`Trigger`** names a verb or an event, never an area on its own. "During planning" is not an assignment; "on cutting the work assignments" is.

| Table | Area | Writer role | Trigger |
|-------|------|-------------|---------|
| `memo` | Authoring | `author` | on creation (`memo new`), then on every status or context change |
| `memo_head` | Authoring | `author` | after every revision, through `memo revision project` |
| `memo_section` | Authoring | `author` | likewise, after every revision |
| `revision` | Authoring | `author` | on assembling the revision (`memo revision assemble`) |
| `block` | Authoring | `author` | on cutting a chapter into blocks |
| `block_chapter` | Authoring | `author` | on the chapter cut, for the block-to-chapter edge |
| `block_section` | Authoring | `author` | per section of a chapter |
| `block_tables` | Authoring | `author` | per table in a chapter |
| `block_diagrams` | Authoring | `author` | per diagram in a chapter |
| `topic` | Authoring | `author` | on topic capture (`memo topic register`) and on every status or binding change |
| `work_item_reference` | Authoring | `author` | per piece of evidence when a work item is registered |
| `question` | Authoring | `author` | on writing the `questions-json` fence of a revision |
| `question_option` | Authoring | `author` | likewise, per option |
| `research` | Authoring | `author` | on commissioning a research subject |
| `research_topics` | Authoring | `author` | on binding research to topic |
| `research_files` | Authoring | `author` | per stored payload (`memo research add-file`) |
| `transcript` | Authoring | `author` (through the transcript server) | on arrival of a dictation or a review |
| `memo_transcript` | Authoring | `author` | on binding transcript to memo |
| `lesson_learned` | Authoring | `author` | on finalizing, per lesson |
| `lesson_source` | Authoring | `author` | per piece of evidence for a lesson |
| `prd` | Planning | `planner` | on cutting each work assignment (`memo-phase-generate`) |
| `prd_topics` | Planning | `planner` | on binding assignment to topic, in the same cut |
| `prd_work_items` | Planning | `planner` | on binding assignment to work item |
| `prd_research` | Planning | `planner` | on attaching research evidence to an assignment |
| `prd_depends_on` | Planning | `planner` | on fixing the order of the work assignments |
| `requirement` | Planning | `planner` | on formulating a checkable requirement |
| `strand` | Planning | `planner` | on cutting the strands |
| `strand_phases` | Planning | `planner` | on assigning a phase to a strand |
| `strand_prds` | Planning | `planner` | on assigning a work assignment to a strand |
| `rollout_phase` | Planning (structure) · Execution (state) | `planner` creates · `orchestrator` sets `status` / `commit_hash` | created with the phase plan; carried forward at every phase boundary |
| `rollout_phase_plan` | Planning | `planner` | on the phase plan: budget, worktree, breakpoint, strand, handover pointer |
| `rollout_work_item` | Planning (structure) · Execution (state) | `planner` creates · `orchestrator` sets `status` / `commit_hash` | created at the phase cut; carried forward per acceptance |
| `plan_mutation` | Execution | `orchestrator` | per run-time change to the plan: pause, insert, recut, reorder |
| `rollout_worktree` | Execution | `orchestrator` | on creating, quiescing or dissolving a worktree |
| `agents` | Execution | `orchestrator` (through `memo session import`) | after every wave, and at every breakpoint |
| `commits` | Execution | `orchestrator`, or the `worker` that commits | per commit in the rollout |
| `finding` | Execution | `orchestrator` + `worker` | per interim finding in the traffic of a phase |
| `fidelity_score` | Execution | `orchestrator`, after the run, in a fresh context | at the fidelity audit after the landing |
| `interval_status` | Execution | `orchestrator` | at every breakpoint, at every phase boundary, after every anomaly intervention, and at the latest every 60 minutes |
| `decision` | Execution | `orchestrator` | per steering decision, with its matrix classification in the same row. `superseded_by` is written on the REVISING row and names the predecessor it replaces — a correction is a new row, never an edit of the old one |
| `receipt_event` | Execution | `worker` writes the delivery · `orchestrator` writes the check | one row per event in the life of a work receipt: `written` when a worker lands its receipt, `verified` once per checking run over a phase. `compared_count` is mandatory, which is the machine form of the rule that a check comparing nothing is red |
| `work_item` | Cross-cutting | all three memo roles | `author` on registration; `planner` on the cut and the grouping; `orchestrator` on status and disposition changes |
| `work_item_group` | Cross-cutting | `author` + `planner` | on bundling by root cause or by action |
| `question_event` | Cross-cutting | `author` on a status change, `user` on an answer | per event in the life of a question: asked, replaced, answered, reopened |
| `user_inputs` | Cross-cutting | `user` (through `recordInput()`) | per terminal input and per transcript |
| `user_input_answers` | Cross-cutting | `user` (through `recordAnswer()`) | per answer to a question |
| `documents` | Cross-cutting | whoever stores the file: `author`, `worker` or `user` | per stored file, with path, SHA-256 and session |
| `annotation` | Cross-cutting | `author` + `user` | per annotation on a place in a document |
| `lifecycle` | Cross-cutting | all three memo roles | per state change of the memo: created, in revision, finalized, rollout, landed |
| `goal` | Cross-cutting | project-global stock (goal skills) | on creation and on every scoring run |
| `maintenance_card` | Cross-cutting | project-global stock (maintenance skills) | per scoring or verify run, per repo |
| `snag` | Cross-cutting | all three memo roles | on creation, and on closing it with evidence |
| `sessions` | Cross-cutting | harness (through `memo session import`) | on importing a session |
| `session_tool_call` | Cross-cutting | harness (import) | per recorded tool call |
| `session_ingest_mark` | Cross-cutting | harness (import) | per import progress mark: byte offset, last identifier |
| `session_breakpoints` | Cross-cutting | harness hook | per breakpoint event |
| `compaction_event` | Cross-cutting | harness hook | per compaction of a session, once before and once after. The carrier belongs to no memo area: a compaction is an event of the runtime, not a step in a memo's life, which is what the cross-cutting column exists for |
| `url_calls` | Cross-cutting | `worker`, while researching | per external fetch |
| `provenance` | Cross-cutting | the funnel itself (`ContentWriteThrough`) | per write, automatically |
| `history_journal` | Cross-cutting | the funnel itself | per write, automatically |

The area sizes are the sum check: `Authoring` 20 · `Planning` 12 · `Execution` 9 · `Cross-cutting` 19 = 60, measured on 2026-09-15. The two rows whose responsibility is split by column count under `Planning`, where their structure half is created. **The comparison set of this check is named, because a sum that does not say what it was compared against is not a check:** the 60 rows of the matrix above were compared, in both directions, against the 60 distinct names measured out of the schema file named in the counting basis. Both difference sets are empty — no declared table is missing from the matrix, and no matrix row names a table the schema does not declare. No table is filed twice; the matrix is complete rather than illustrative, and that completeness is the point — a carrier nobody was assigned is the case this section exists to make impossible.

Two properties of the distribution are worth naming, because they are only visible once the rows are grouped. The two carriers that fill themselves — `provenance` and `history_journal` — hang off the write funnel and need no caller, and they are also the two with the largest share of columns that never receive a value; a high row count is the absence of the loudest symptom, not a quality signal. And six of the session and evidence carriers — `sessions`, `session_tool_call`, `session_ingest_mark`, `url_calls`, `agents` and `commits` — are fed **through the harness session trace** rather than written directly by a memo role, which means they depend on an import step somebody has to trigger. That names the channel, not the assignment: the `Writer role` column above keeps naming the memo role that owes each of those rows, and the two levels are held apart in *The Bookkeeping Contract* below. Two carriers are written by a harness **hook** rather than through that import — `session_breakpoints` and `compaction_event`; the other three session carriers are not, and treating a hook write and an import as interchangeable is why the import step goes unnoticed.

---

## The Model Gradient

**The gradient.** How a role is staffed follows the **condensation form** of the work it carries. Work that condenses — reading a wide field down to one plan, one revision, one verdict — is staffed on the **topmost tier available**. Work that runs a stretch already cut is staffed **one tier below**.

**Why a gradient rather than one tier everywhere.** It is the staffing counterpart of the rule in *The Planner-Orchestrator Contract*: expensive thinking must not be overwritten by cheap thinking. Honouring that in staffing means spending the expensive thinking **once**, at the point where a constellation is chosen, instead of continuously, along the stretch where it is carried out. A condensation point is paid for once per plan; an execution stretch runs for hours.

**The counter-reckoning, stated rather than glossed over.** Exactly **one** action of the executing tier touches plan semantics: the run-time amendment. It is not left free — it is framed on both sides, by the fixed intervention verbs and by the mutation duty that demands an occasion and evidence for every departure. That is the whole exposure, and it is bounded.

That the lower tier **suffices** for the orchestrator role is an explicit **`assumption`**, not a finding. It is recorded as one so that the first run under a deliberate gradient *answers* it rather than quietly confirming it, and so that a later reader can tell which half of this section was measured and which was assumed.

**What the gradient is not.** It is not a `model router` — nothing selects per request. It is not an `automatic downgrade` within a run: a tier is fixed when a role is staffed and does not drift while work is in flight. It is not a claim about any product, and it names no tier by name. What is anchored here is the **role axis** — which kind of work sits above which — and nothing underneath it.

**Where the values live.** Which tier a role actually receives is registered in the harness descriptor under the registry ([meta-spec/10-harness-registry.md](/spec/harness-registry/)), as data. Restaffing is therefore a **data change** and never a change to this prose. It is the same split the registry already draws for tools: the intent is specified here, the values are registered there, and the two are kept from drifting by never stating one in the other's place.

---

## The Orchestrator Work Order

The role above is commissioned by a **work order**. Today that hand-over is free prose, and what any given order contains is whatever its writer happened to think of. The order therefore has a form: five fields, each of which fixes something a run has already lost by leaving it unstated.

| Field | What it fixes |
|-------|---------------|
| `reportingDuty` | The cadence and the format of the interval update, lodged up front and posted proactively rather than on request |
| `timeAccount` | The account in human time — the start time on the clock, active against waited, worker-hours, and what each phase cost — answerable without calculating |
| `compactionRule` | The context edge: the window that is set, an injection after **every** compaction of that window, and the compaction point itself recorded in the database |
| `earlyNotice` | A foreseeable need for a decision, announced **in advance** in the interval update; a line in an existing format, never a second channel |
| `planAcceptance` | The plan that was handed over is executed unchanged as the starting constellation |

**All five fields are mandatory, and an order missing one is incomplete.** Naming them is not tidiness. Each field is the positive form of a duty that until now was described only by its prohibition, and a prohibition is half a specification: "no interim reports" states what the role must not do and leaves what it owes unsaid, where `reportingDuty` states what it owes. Autonomy specified through its prohibitions alone produces a role that is silent and compliant at the same time — which is the outcome the outward duty exists to prevent.

**What this order is not.** It is **not** the contamination handover: `HANDOVER.md` ([09-contamination-context-handover.md](/specification/contamination-context-handover/)) passes a contaminated session to a fresh one, and it keeps both that purpose and that name. And it is **not** a `PRD` — the anchor term for a single cut unit of work that a worker builds; this order commissions the role that dispatches them.

---

## The Bookkeeping Contract

The six rows below are the **bookkeeping parties** — everyone who touches the record during a memo's life. Four of them are the working roles this chapter defines (`author`, `planner`, `orchestrator`, `worker`); the other two are not roles at all — `user` is the human as a source of rows, and `harness` is the channel session traces arrive through. *Role Projection* below therefore counts four working roles and not six: `user` and `harness` are parties here, never working roles. The contract states, per party, what each of them owes.

| Role | Writes | Reads | Updates | Primary responsibility |
|------|--------|-------|---------|------------------------|
| `author` | the authoring tables — topics, work items, blocks, questions, research assignments and their pointers, transcript bindings, lessons | its own stock: topics, work items, earlier research, answered questions | topic status, question status, work-item registration, chapter binding | That no authoring table is left empty without a named reason when authoring ends |
| `planner` | the planning tables, plus the **structure** columns of `rollout_phase` and `rollout_work_item` | the authoring tables in full — they are its input | its own plan up to the hand-over, and nothing after it | That every plan row traces back to an authoring row, checkable as a set difference |
| `orchestrator` | the execution tables and the run-time carriers: interval status, decisions, plan mutations; it triggers the session import | **everything** — the only role with full access, because it has to report the overall state | the **state** columns of the planning tables, `status` and `commit_hash`, never their structure; a structural change is a plan mutation | The bookkeeping as a whole — it does not keep the most rows, it supervises that the others keep theirs |
| `worker` | the receipt of its own work (`comparedCount`), a `url_calls` row per external fetch, a `documents` row per stored file | its own work assignment and the sources named in it | nothing outside its own receipt | That the receipt is part of the delivery rather than an appendix to it — a delivery without a receipt row is not bookable |
| `user` | `user_inputs` and `user_input_answers`, through `recordInput()` and `recordAnswer()` | the viewer, as the surface a run is supervised from | its own inputs, append-only — a correction is a new row, never an overwrite | `none`. The user is a source, not an obligor; the row stands here so that the expectation does not migrate to them in silence |
| `harness` | session traces — `sessions`, `session_tool_call`, `session_ingest_mark`, `agents`, `commits` — and hook events | — | — | Rests with the trigger. The harness writes only when someone imports, and the duty to import is the orchestrator's |

**The `Writes` column names the channel; the matrix names the memo role.** Three carriers are named on both levels, and that is one assignment seen twice rather than two competing ones. `agents` and `commits` stand in the `harness` row because their rows arrive through the harness session trace; `url_calls` arrives the same way even though it stands in the `worker` row, which is why *The Table Assignment Matrix* counts it among the harness-fed carriers. That matrix files all three by memo role — `agents` under the `orchestrator`, `commits` under the `orchestrator` or the `worker` that commits, `url_calls` under the `worker` — and that filing is the binding one for **who owes the write**. The harness writes only when someone imports; it is a channel with a trigger, never a role that decides.

**`user` here is the human party, not the contract role of the same name.** The row above names the person who supplies input and supervises the run — the source of `user_inputs` and `user_input_answers`. The `user` that *Role Projection* below projects `author` and `planner` onto is the descriptor's contract role for the interactive top-level context: a tool delta a running context executes under, not a party that owes rows. The word therefore carries one meaning per vocabulary, and every row in this table belongs to the bookkeeping one.

**Several parties may write; exactly one owes the result.** That is why every row carries exactly one entry in the last column and never two: the moment two parties are answerable for the same outcome, there are excuses instead of an owner. This does not contradict the multiple writers assigned above — `work_item` has three writers, and that is correct. The difference is what the last column names: not who may touch a carrier, but who is answerable for its state.

**This is not the Table Assignment Matrix.** That matrix assigns per **table** — area, writer, trigger. This contract states per **party** what is owed across every table that party touches. They are different levels, and an entry in one never resolves to an entry in the other.

**The contract lives on this page, and there is deliberately no parallel architecture document.** A second place stating who owes what would be a second authority, and at the first divergence between the two nothing would decide which reading holds — the contract would have become a question of which file the reader opened first.

---

## The Model Follows the Condensation

**The rule, stated normatively: the model follows the condensation.** A role sitting at a condensation point is staffed on the topmost tier available; a role running an execution stretch is staffed one tier below. The criterion is the **form of the work**, never the name of the role — which is what keeps the rule from ageing the moment a role is added, renamed or split.

| Form | What passes through it | How it is staffed |
|------|------------------------|-------------------|
| `condensation point` | Much information goes in, few decisions come out. An error here is not local: it falsifies everything downstream that is carried out on the strength of the decision | Head tier — **Author**, **Planner** — on the topmost tier available |
| `execution stretch` | Few decisions go in, much work comes out. Errors are local and are caught by the next gate | Work tier — **Orchestrator**, **Worker** — one tier below, and in exchange with fixed thresholds and fixed verbs |

Author and Planner share a staffing class; they are not thereby merged into one role. The same holds one tier down: Orchestrator and Worker share the other class without becoming the same role. The rule sorts forms of work, not identities.

**Two pieces of work that look like new roles are not, and no fourth role follows from either.**

- **Merging findings into a revision is the author returning.** The beginning and the synthesis are both condensation points — once from transcript to topics, once from findings to chapters. A separate role would be a second name for one form, and the hand-over between two heads costs precisely the information that was to be condensed.
- **Supervising research is the orchestrator at a small scale.** Commissioning, checking delivery, steering, replacing what failed is the inward duty verbatim. While a memo is being authored, the author plays that small orchestrator itself. That is a known role at a small scale, not a new one.

**How the rule is framed where it becomes data.** The staffing line in the harness descriptor is cut by **form**, not as a list of roles:

| Descriptor field | How the line is written |
|------------------|-------------------------|
| `adapter.model` | The tier that belongs to the form the role carries — condensation point or execution stretch — never one entry per role name |
| `adapter.effort` | The deliberation belonging to that same form, set with it and read with it |

A line cut by role name has to be extended every time the role set changes, and every extension is a fresh judgement made at the moment of least information. A line cut by form is answered by a question the role already has an answer to: does this work condense, or does it run a stretch? What is prescribed here is the shape of that line. The values themselves are registered as data and are not stated in this prose.

---

## Role Projection — Working Roles onto Contract Roles

This chapter carries four working roles; the harness descriptor ([meta-spec/10-harness-registry.md](/spec/harness-registry/)) carries three contract roles. The four project onto the three, and the projection is written down here so that a fourth role is not read as a fourth vocabulary.

| Working role | Contract role |
|--------------|---------------|
| `author` | `user` |
| `planner` | `user` |
| `orchestrator` | `orchestrator` |
| `worker` | `worker` |

**The projection defines no fourth axis.** It is the move the registry already makes for the agent-team roles and for the agent-execution primitives: those project onto the three contract roles rather than defining a fourth axis, and the working roles above do the same. Three vocabularies are in play — the contract vocabulary of the descriptor, the agent-name label a running context carries, and the working form this chapter is written in — and a projection is what keeps them at three instead of making them four.

**`author` and `planner` share `user`, and the shared cell is not a defect.** Both sit at a condensation point, and both act through the interactive top-level context that the descriptor assigns the `user` role. Where the names coincide — `orchestrator` onto `orchestrator`, `worker` onto `worker` — the coincidence is identity of the mapping, not identity of the axis: a working role names which part of a memo's life the role carries, a contract role names which tool delta a running context runs under. The `user` row in *The Bookkeeping Contract* above is not this cell either: that row names the human party who supplies input, this cell names the contract role a running context executes under.

<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [13-orchestration.md](/specification/orchestration/) — the roles, the parallelism dials, the state files and the worker exits this role operates; that chapter says *who runs a phase*, this one says *what the orchestrator owes*.
- [49-execution-workflow-guideline.md](/specification/execution-workflow-guideline/) — the course of a single unit of work and the vocabulary of a hold; the sequence the duties above are exercised across.
- [12-rollout.md](/specification/rollout/) — the Generate → Execute → Evaluate rollout that is the run this role supervises.
- [42-plans.md](/specification/plans/) — the plan the contract above is the acceptance and amendment half of.
- [29-behavioral-guardrails.md](/specification/behavioral-guardrails/) — the balanced-option and autonomy guard rails the recommendation duty and the autonomy split rest on.
- [27-landing-the-plane.md](/specification/landing-the-plane/) — the landing the run ends in, and the categories for the open ends it leaves.
- [08-phases-and-prds.md](/specification/phases-and-prds/) — the dependency structure the order of work is amended within.
- [meta-spec/10-harness-registry.md](/spec/harness-registry/) — the registry a second runtime enters as a curated data row, and the adapter cut naming which layer is renderer-bound and which is data.
