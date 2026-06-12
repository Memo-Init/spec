# 05. Memo Strategies

| | |
|---|---|
| Status | Draft |
| Depends on | [03-input-paths.md](./03-input-paths.md) |
| Related | [06-memo-structure.md](./06-memo-structure.md), [08-phases-and-prds.md](./08-phases-and-prds.md), [11-quality-and-finalization.md](./11-quality-and-finalization.md) |

> **Normative.** Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](./00-overview.md) (Conformance).

---

## Two Orthogonal Dimensions

A memo has two independent classification dimensions. They MUST NOT be conflated.

- **Memo type** — the *endpoint*: where the SOP stops. A Strategy memo ends after finalization (analysis only, no code). An Implementation memo runs all the way through to code. A Sorting memo ends in a triage with sub-memos.
- **Memo strategy** — the *workflow shape*: how the work is approached on the way to that endpoint.

The strategy is orthogonal to the type. A memo declares both. This chapter specifies the strategy dimension; the type endpoints are covered in [11-quality-and-finalization.md](./11-quality-and-finalization.md) and [08-phases-and-prds.md](./08-phases-and-prds.md).

---

## The Four Strategies

| Strategy | Meaning | Maps to type |
|----------|---------|--------------|
| **Research** | Research only, filed as standalone research artifacts. | Strategy |
| **Implementation** | A follow-up memo references the research and turns it into work. | Implementation |
| **Mixture** | Research and implementation combined; some parts executed, some archived. | Sorting |
| **Iterative** | Decide the shape **while** doing — settle what it should look like and already complete parts of it in the same motion. | (genuinely new) |

---

## The `Memo-Strategie` Header Field

Every memo declares its strategy in a `Memo-Strategie` header field. The strategy SHOULD be set early — ideally at initialization — because it shapes how revisions are planned and how research is filed. The field is mutable across revisions in the same way the type is, but a deliberate early choice is preferred over late discovery.

For example, the bootstrap memo from which this specification is induced declares `Memo-Strategie: Iterative` — it fixes the shape of the organization and its repositories while already producing parts of that shape (this specification text) in the same pass.

---

## Iterative Is Genuinely New

The first three strategies describe arrangements that already existed implicitly: pure research, research-then-implement, and mixed-then-sorted. The **Iterative** strategy is genuinely new. It names the case where the work cannot be fully planned before it starts because the act of doing reveals the shape.

Under the Iterative strategy:

- The memo is expected to interleave shaping decisions and concrete output, rather than completing all decisions before any output.
- A decision and the piece of work it enables MAY land in the same revision.
- The memo remains the authority over its own rollout; "deciding while doing" does not relax finalization. The Iterative strategy changes *when* parts are produced, not *whether* the finalization gate applies.

Naming this strategy makes the interleaving explicit and reviewable, instead of leaving it as an undocumented deviation from a plan-everything-first assumption.

---

## Related

- [03-input-paths.md](./03-input-paths.md) — the transcript type that opens a memo and where the strategy is first set.
- [08-phases-and-prds.md](./08-phases-and-prds.md) — how the memo type's endpoint shapes phases and PRDs.
- [11-quality-and-finalization.md](./11-quality-and-finalization.md) — the finalization gate that applies regardless of strategy.
