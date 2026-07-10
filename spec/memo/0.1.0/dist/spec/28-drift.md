---
title: "Drift"
description: "Drift is treated as its own error class, distinct from a normal bug. It deserves a dedicated chapter because the usual bug-fixing instinct — find the broken copy, fix it, move on — actively makes..."
spec_version: "0.1.0"
spec_file: "28-drift.md"
order: 28
section: "Specification"
normative: true
generated_at: "2026-07-10T05:31:42.764Z"
generated_from: "spec/memo/0.1.0/draft/spec/28-drift.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/memo/0.1.0/draft/spec/28-drift.md."
---


Drift is treated as its own error class, distinct from a normal bug. It deserves a dedicated chapter because the usual bug-fixing instinct — find the broken copy, fix it, move on — actively makes drift worse. Where a bug is a single thing that is wrong, drift is a relationship that is wrong across many things, anchored to a source that keeps reproducing it. The chapters on orchestration and phases-and-prds carry the operational hooks (the idempotent lint/CI gate and the post-phase elimination rule); this chapter defines what drift *is*, how to detect it, why the obvious fix is harmful, and the protocol that resolves it at the root.

## What Drift Is

Drift occurs when a knowledge-unit — a statement, a command, a number, a convention — appears across multiple artifacts and the copies diverge from an authoritative source-of-truth (SoT), or, worse, all copies faithfully follow a source that is itself wrong. It has three defining properties that a normal bug does not:

- **Gradual.** No single edit introduces it. The copies drift apart (or the wrong source spreads) over many independent authoring acts.
- **Unnoticed.** Each copy looks locally correct in isolation. The error only exists in the divergence between copies, which no single reader sees.
- **Reproductive.** As long as the uncorrected source remains authoritative, every new author who reads it spawns another copy. The error count grows on its own.

A concrete, neutral illustration: an install command for a build artifact (for example, a package name that was renamed before first release) is written once into a getting-started section, then copied into several READMEs, a documentation site, and a top-level spec. Each copy is faithful to the one before it. Months later the command is wrong in a dozen places, none of which is "the" bug — they are all symptoms of one wrong source that nobody marked as the source.

## Bug vs Drift

| Axis | Bug | Drift |
|------|-----|-------|
| Locus | one place | a knowledge-unit replicated across many artifacts |
| Truth | code/behavior is wrong | copies diverge from an SoT, or all copies follow a WRONG SoT |
| Onset | introduced by an edit | accumulates gradually, unnoticed |
| Growth | static until fixed | reproductive — the uncorrected source keeps spawning copies |
| Right fix | fix the broken thing | fix the SoT, then propagate and gate |

The practical consequence: a drift cannot be closed by editing the artifact where it was noticed. That artifact is one copy among many, and the source that produced it is still live.

## Detection — the D1–D5 Checklist

Before treating a finding as drift, confirm it against five signals. A grep is the primary instrument because drift lives in replication, and replication is greppable.

- **D1 — Multi-occurrence.** The same knowledge-unit appears in more than one artifact. Verify by grepping the unit across ALL artifact surfaces (specs, READMEs, doc-sites, config, generated output), not just the file in hand.
- **D2 — SoT unclear.** No artifact is marked as the authoritative source for the unit; it is impossible to say which copy the others should match.
- **D3 — Divergence or wrong source.** The copies disagree with each other, OR they all agree but agree on a value that is wrong.
- **D4 — Reproductivity.** A new author following the current source would produce another wrong (or another divergent) copy.
- **D5 — Symptom-fix resistance.** Fixing the one visible copy would not stop new copies from appearing.

Escalate to the drift protocol when **D1 holds AND (D2 OR D3)** holds — that is, the unit is replicated and either has no clear source or is actually diverging/wrong. D4 and D5 confirm severity and rule out a one-off typo.

## Why a Symptom-Fix Is Negative

The instinct is to grep for the wrong unit, replace the one copy that was reported, and call it done. For drift this is not merely incomplete — it is negative:

- It lowers the visible copy count by exactly one, which *looks* like progress and lowers attention.
- It leaves the source intact, so the unit is still authoritative-but-wrong.
- The next author reads the still-wrong source and writes a fresh copy, restoring (or exceeding) the original count.

A symptom-fix therefore trades a true signal (an obvious wrong copy that might have led someone to the source) for a false sense of resolution, while the reproductive mechanism keeps running. The most expensive property of drift is the hidden source; patching copies hides it further.

## Resolution Protocol

The protocol fixes the unit where it comes from and then closes the gate it would re-enter through:

1. **Find the single source-of-truth (SSOT).** Map every copy (the D1 grep gives the map) and identify the one artifact the others should derive from. The real source is often the least-suspected one — frequently the spec itself rather than the READMEs that look wrong.
2. **Fix at the source in fresh context.** Repair the SSOT, not the copies, and do it in a clean context so the wrong value is not carried in from the contaminated session that surfaced it.
3. **Generate into all copies — do not hand-patch.** Propagate the corrected unit to every copy through a generation step, so the copies are derived from the source rather than re-typed. Hand-editing copies just re-creates the divergence risk.
4. **Set an idempotent lint/CI gate.** Add a gate that blocks any future manual copy of the unit — a check that fails when a copy diverges from the source. It must be idempotent (running it repeatedly changes nothing once green) and general enough to cover the unit class, not just the one literal string.
5. **Re-verify zero divergent.** Run the gate and confirm zero divergent copies remain across all surfaces.

The slogan for the protocol: fix where it COMES FROM, then close the gate it would re-enter through.

## Escalation Rule — After the Phase, Never Mid-Phase

When drift is discovered while a phase is running, the rule is: do NOT abort the phase to chase it. Aborting mid-phase fragments the work and tends to spawn new partial copies. Instead, record the finding and eliminate the drift immediately AFTER the current phase completes, as a dedicated step with its own fresh context. This keeps the in-flight phase coherent while guaranteeing the drift is resolved before the next phase can read the still-wrong source. The orchestration chapter owns the gate that enforces step 4; the phases-and-prds chapter owns this post-phase elimination step.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [08-phases-and-prds.md](/specification/phases-and-prds/) — owns the post-phase drift-elimination step that the escalation rule defers to.
- [13-orchestration.md](/specification/orchestration/) — holds the idempotent lint/CI gate that the resolution protocol installs.
- [16-git-security-versioning.md](/specification/git-security-versioning/) — source-vs-copy versioning, where divergent copies arise.
