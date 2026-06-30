---
title: "Implementation-Fidelity Audit"
description: "A memo's completeness gate guards exactly one seam — the revision-to-finalization transition — once, at topic granularity. That gate is defined in..."
spec_version: "0.1.0"
spec_file: "45-implementation-fidelity-audit.md"
order: 45
section: "Specification"
normative: true
generated_at: "2026-06-30T23:32:54.347Z"
generated_from: "draft/memo/0.1.0/spec/45-implementation-fidelity-audit.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/45-implementation-fidelity-audit.md."
---


A memo's completeness gate guards exactly one seam — the revision-to-finalization transition — once, at topic granularity. That gate is defined in [11-quality-and-finalization.md](/specification/quality-and-finalization/). Everything downstream of finalization is outside its view: whether the finalized revision actually reached the PRDs, whether the PRDs actually reached the code and the spec, whether a broad documentation PRD was quietly skipped while the code PRDs ran. The **implementation-fidelity audit** is the retrospective, whole-chain generalization of that gate. It traces a memo from its first revision all the way to the artifacts on disk, on **information-item** granularity, and reports where information was lost or built wrongly — distrusting every PASS report on the way.

The audit exists because that loss is real and has been observed. A documented rollout (recorded as the defect `DEF-045-ROLLOUT`) dropped its broad `[Docs]` PRDs — a naming sweep that became a one-line no-op, two specification files that were never created, a chapter that was never touched — while its `[Code]` and security PRDs ran to completion, and the rollout's own conformity report blessed the result as "all chapters realized". No existing gate caught it: the revision gates saw only the local round, finalization saw only the revision-to-finalize seam at topic level, and the rollout evaluate trusted its own report. The audit is the mechanism that would have caught it, and the manual run of it on that memo is what surfaced the loss.

---

## What the Audit Is

The implementation-fidelity audit is a **retrospective, fresh-context, non-blocking** measurement of how faithfully a finished memo was implemented end to end. It is the structural sibling of goal scoring ([31-goals.md](/specification/goals/)) and maintenance scoring ([33-maintenance.md](/specification/maintenance/)): a fresh context measures the **real artifact state**, distrusts every conformity report, produces a strict score object, and persists it through a deterministic CLI. It does not block a rollout and it does not finalize anything; it delivers a score and a loss table that a human or a later step reads.

The unit of the audit is the **information item**, not the topic and not the chapter. An information item is a single decision, constraint, example, or reference carried by a revision. Topic granularity — the unit the completeness gate uses — is too coarse to see a loss that was never registered as a topic in the first place; the observed `DEF-045-ROLLOUT` losses were precisely of that kind. The audit therefore inventories items directly from the revision text and follows each item, not each topic.

A chapter, a rollout, or a finalization that this audit reports as low-fidelity is **not** thereby reverted or re-gated. The audit is informative output (a number plus evidence). Acting on it — re-opening a memo, re-running a phase, filing the loss as work — is a separate, human-initiated decision, in keeping with the autonomy and landing rules ([38-stage-model.md](/specification/stage-model/)).

---

## The Four Hops

The audit walks the memo's lifecycle as four hops. Each hop has its own loss class, and each hop re-verifies against the real artifact rather than trusting the prior stage's report.

| Hop | Seam | What it checks |
|-----|------|----------------|
| **A — Revision trace** | `REV-01 → … → REV-N(final)` | Inventory the information items of `REV-01`; for each adjacent revision pair, classify every item as *survived*, *dropped*, *renamed*, or *(mis-)merged*. A drop with no recorded decision (no `### F{N}` answer, no triage entry) is a finding. |
| **B — Finalization fidelity** | `REV-N → finalized/consolidated revision` | The completeness gate ([11-quality-and-finalization.md](/specification/quality-and-finalization/)) generalized from topic to information-item granularity, plus "was anything merged incorrectly or silently absorbed?" |
| **C — Rollout coverage** | `finalized revision → PRDs → code/spec` | Every final-revision item maps to a PRD and to a real artifact change. Consumes the rollout's `conformity-report.md` and per-PRD state **distrustfully** and re-verifies at the Ist (the utilization-gate posture of [12-rollout.md](/specification/rollout/)). |
| **D — Ist check** | `claimed artifact → filesystem / spec / tests` | A direct sample of the heaviest items checked against the real files, the real spec text, and tests that actually run — never against a self-report. |

Hop A starts at `REV-01` deliberately: a loss that happened between the first and second revision is invisible to every gate that takes the finalized revision as its universe (the validation skills of [11-quality-and-finalization.md](/specification/quality-and-finalization/) and the PRD validation of [12-rollout.md](/specification/rollout/) both do). Hop B is where the audit and the completeness gate overlap — the gate is the special case of Hop B at topic granularity and at finalization time. Hops C and D are the part no existing mechanism performs at all.

The audit **MUST** run in a fresh context (its own empty session), never in the session that produced the work. A session that did the work reports it as done and hides the gap (the lesson behind goal scoring's never-same-session rule, [31-goals.md](/specification/goals/)). For the same reason a green `conformity-report.md` is **not** evidence: Hop C and Hop D measure the artifact, not the claim.

---

## The Fidelity Score Object

The audit returns exactly one object. The fields are fixed so the persisted result is machine-readable and comparable across memos.

| Field | Type | Meaning |
|-------|------|---------|
| `pct` | number 0..100 | Honest end-to-end implementation fidelity of the finalized memo against the real artifacts. |
| `lostItems` | array | Items lost on the way; each carries `{ item, lastSeen, lostAtHop, class, severity, evidence }` where `class` is `drop` \| `rename` \| `merge` \| `mis-merged` \| `unimplemented`. |
| `misImplemented` | array | Items present but built wrongly against the memo's intent; each carries `{ item, expected, actual, severity, evidence }`. |
| `status` | `ok` \| `degraded` \| `broken` | Lifecycle band derived from `pct` and the worst finding severity; never auto-flips a memo's state. |
| `confidence` | string | Provenance, e.g. "fresh-context trace of all revisions + repos/spec + repos/core". |
| `evidence` | array | Concrete pointers (file:line, commit, command output) backing `pct` and the findings. |

The companion human-readable artifact is a **loss table** — one row per finding — with the columns `Item | last seen | lost at hop | class | severity | evidence`. The score object drives comparison and persistence; the loss table is what a person reads.

The audit's posture — fresh context, distrust every conformity report, a strict score object — is the **shared scoring head** specified once in [23-requirements.md](/specification/requirements/) (The Grading Model). The fidelity audit follows that head and adds only its domain axes (`pct` + the loss/mis-implemented findings across the four hops); it does not restate the contract.

---

## Persistence

The score object is persisted through a deterministic CLI leaf, modeled on the goal-score persistence split ([31-goals.md](/specification/goals/)): the **judgement is computed by the fresh-context LLM**, the **CLI only stores the finished object**. The store is the per-memo append-only **findings channel** ([13-orchestration.md](/specification/orchestration/), the inter-agent shared memory): the fidelity result is written as a finding under a dedicated `fidelity` thread tag, append-only and dedup-keyed, so successive audits of the same memo accumulate rather than clobber. The audit never writes the memo or the revisions directly.

---

## Where It Hooks Into the Workflow

The audit is primarily **standalone and retrospective** — runnable at any time against any finished memo, exactly like goal scoring. It **MAY** additionally be offered as a **Stage-2 landing check** ([38-stage-model.md](/specification/stage-model/)): after a rollout reaches PASS, the audit runs once and delivers its score plus loss table into the landing record. Even there it stays **non-blocking** — it contributes findings, it does not hold the plane on the ground. That placement is deliberate: it is consistent with the rule that landing reports honestly rather than re-gating, and it puts the strongest available loss detector at the exact moment the memo claims to be done.

---

## Delimitation — Not Workbench Validation

This audit is **not** the workbench's validation overview. The workbench `validation-overview` chapter is a wayfinder over *machine-tier and code validation* — hook contracts on `Write`/`Edit`, runtime skill/tool checks, egress and trash policy, dependency install gates. That tier validates **code and environment correctness** as actions happen. The implementation-fidelity audit operates one tier up: it validates **memo-to-artifact fidelity** across a memo's whole lifecycle, retrospectively, on information items. The two never overlap — one asks "is this write allowed and correct right now", the other asks "did everything the memo decided actually survive into the artifacts". Keeping them in separate families (this chapter in the core memo-SOP family, the validation overview in the workbench family) is intentional; neither absorbs the other.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — the completeness gate (gate 10) is the special case of Hop B: topic granularity, at finalization, once. This audit generalizes it to information-item granularity across the whole chain, retrospectively.
- [12-rollout.md](/specification/rollout/) — the rollout evaluate verifies the finalized revision against the code at rollout close; its universe begins at the finalized revision. Hops A and B see the part before that universe; Hop C re-verifies the rollout's own coverage claim distrustfully.
- [07-revisions-and-questions.md](/specification/revisions-and-questions/) — describes the contaminated-revision rescue as a manual procedure; this audit is its automation on the loss-detection side (it finds the loss; the rescue repairs it).
- [28-drift.md](/specification/drift/) — drift is a divergence between an artifact and its source **after** a memo is done; the fidelity audit is about loss **within** a memo's own implementation. A degraded fidelity score is not drift, and the two are reported separately.
- [38-stage-model.md](/specification/stage-model/) — the optional landing-check hook lives in Stage 2.
