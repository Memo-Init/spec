---
title: "Memo Strategies"
description: "A memo is classified along two independent dimensions that must not be conflated: its *type* (where the SOP stops) and its *strategy* (how the work is shaped on the way there). This chapter specifies..."
spec_version: "0.1.0"
spec_file: "05-memo-strategies.md"
order: 5
section: "Specification"
normative: true
generated_at: "2026-07-10T01:26:47.441Z"
generated_from: "spec/memo/0.1.0/draft/spec/05-memo-strategies.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/memo/0.1.0/draft/spec/05-memo-strategies.md."
---


A memo is classified along two independent dimensions that must not be conflated: its *type* (where the SOP stops) and its *strategy* (how the work is shaped on the way there). This chapter specifies the strategy dimension and how it stays orthogonal to the type.

## Two Orthogonal Dimensions

A memo has two independent classification dimensions. They MUST NOT be conflated.

- **Memo type** — the *endpoint*: where the SOP stops. A Strategy memo ends after finalization (analysis only, no code). An Implementation memo runs all the way through to code. A Sorting memo ends in a triage that distributes work across separate strands or threads (though the preferred pattern is ONE memo with multiple threads rather than splitting into separate memos).
- **Memo strategy** — the *workflow shape*: how the work is approached on the way to that endpoint.

The strategy is orthogonal to the type. A memo declares both. This chapter specifies the strategy dimension; the type endpoints are covered in [11-quality-and-finalization.md](/specification/quality-and-finalization/) and [08-phases-and-prds.md](/specification/phases-and-prds/).

---

## The Four Strategies

| Strategy | Meaning | Maps to type |
|----------|---------|--------------|
| **Research** | Research only, filed as standalone research artifacts. | Strategy |
| **Implementation** | A separate memo references the research and turns it into concrete work. | Implementation |
| **Mixture** | Research and implementation combined; some parts executed, some archived. | Sorting |
| **Iterative** | Decide the shape **while** doing — settle what it should look like and already complete parts of it in the same motion. | Implementation / Sorting |

---

## The `Memo-Strategy` Header Field

Every memo declares its strategy in a `Memo-Strategy` header field. The strategy SHOULD be set early — ideally at initialization — because it shapes how revisions are planned and how research is filed. The field is mutable across revisions in the same way the type is, but a deliberate early choice is preferred over late discovery.

For example, a memo that fixes the shape of a project while already producing deliverables in the same pass would declare `Memo-Strategy: Iterative`.

---

## Why Iterative

The **Iterative** strategy is useful when the work cannot be fully planned before it starts because the act of doing reveals the shape. A typical case: a frontend feature where the designer produces mockups and the implementer begins wiring components in the same memo pass — the final UI shape is not decided upfront but emerges from the parallel motion. This avoids a blocking hand-off between a design phase and an implementation phase.

Under the Iterative strategy:

- The memo is expected to interleave shaping decisions and concrete output, rather than completing all decisions before any output.
- A decision and the piece of work it enables MAY land in the same revision.
- The memo remains the authority over its own rollout; "deciding while doing" does not relax finalization. The Iterative strategy changes *when* parts are produced, not *whether* the finalization gate applies.

Naming this strategy makes the interleaving explicit and reviewable, rather than leaving it as an undocumented deviation from a plan-everything-first assumption.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [03-input-paths.md](/specification/input-paths/) — the transcript type that opens a memo and where the strategy is first set.
- [08-phases-and-prds.md](/specification/phases-and-prds/) — how the memo type's endpoint shapes phases and PRDs.
- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — the finalization gate that applies regardless of strategy.
