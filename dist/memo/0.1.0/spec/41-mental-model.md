---
title: "User Mental Model"
description: "The **User Mental Model** is a project-global primitive that records *where the developer tends to go inside decision spaces* — learned not from any single memo but accumulated across the whole memo..."
spec_version: "0.1.0"
spec_file: "41-mental-model.md"
order: 41
section: "Specification"
normative: true
generated_at: "2026-07-01T01:12:29.418Z"
generated_from: "draft/memo/0.1.0/spec/41-mental-model.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/41-mental-model.md."
---


The **User Mental Model** is a project-global primitive that records *where the developer tends to go inside decision spaces* — learned not from any single memo but accumulated across the whole memo sequence. Every finalized memo carries an answered-questions section that pairs, per question, the agent's recommendation against the developer's actual decision. Read across many memos, those pairs reveal stable tendencies: a leaning toward the minimal solution first or toward the complete one, a habit of working deferred scope into the current memo rather than spinning out a follow-up, a preference for sober prose over narrative. The mental model is the distilled portrait of those leanings. It is the structural **mirror of the goal store** ([31-goals.md](/specification/goals/)): where a goal sits *above* a single memo to measure an intent across the sequence, the mental model sits *above* a single memo to measure a *preference* across the sequence. Both are project-global, both are derived from the project's own accumulated history, and both exist to make the agent's future judgement sharper than a single memo's context could.

---

## What the Mental Model Is

The mental model answers a question no single memo can: *which way does this developer usually decide when the agent offers a choice?*

- **A preference portrait, not a transcript.** It is not a log of every answer; it is the distilled tendency that emerges once dozens of recommendation-versus-decision pairs are read together. One disagreement is noise; a repeated pattern is a tendency.
- **Learned from answered questions.** The source is each finalized memo's answered-questions record — specifically the pair of *what the agent recommended* and *what the developer actually decided*. Where the two diverge consistently, an axis is born.
- **Project-global, single profile.** Unlike a goal (one entry per intent), the mental model is a **single** profile for the whole project, because there is one developer whose taste the project is learning. The store holds exactly one snapshot, replaced whole on each derivation rather than appended to.
- **Advisory, never authoritative.** The model biases the agent's recommendation; it never makes a decision. It is an input to the agent's reasoning, not a substitute for the developer's.

---

## The Profile Schema

The whole mental model lives in a single `profile.json` under `.memo/mental-model/`. It has four parts:

- **`axes`** — the decision tendencies, each `{ key, tendency, confidence, evidence[] }`. The `key` names the decision space (for example a minimal-versus-complete axis); `tendency` is a short reading of which way the developer leans; `confidence` is `low | medium | high`; and `evidence` lists the concrete answered-question pointers that support the reading.
- **`extremes`** — flagged absolute opinions, each `{ topic, note, evidence }`. These are the strongly-held, non-negotiable positions, captured separately because they carry a special signal (below).
- **`derivedFrom`** — the list of memo numbers the derivation walked, in the order it read them (newest first). This is what makes staleness countable: it records exactly how far back the current portrait sees.
- **`lastDerivation`** — the timestamp of the snapshot, or null when no derivation has run yet.

A fresh project with no derivation renders a clear "nothing learned yet" rather than an error: an absent profile is a normal early state, not a fault.

---

## Derivation Runs in a Fresh Context

The derivation — reading the answered-question pairs and distilling axes — is a **fresh-context judgement**, never the working session. This is the same discipline goal scoring follows: a session that did the work is biased about it, so an unbiased reader, starting from an empty context, walks the finalized memos chronologically (newest back toward oldest) and reads each one's answered-questions section.

The store itself is **deterministic and does nothing clever**. It does not compute the derivation; it only **persists a finished one** and reads it back. The split is deliberate:

- **`derive`** records a finished fresh-context derivation, replacing the single profile (a derivation is a fresh snapshot, not an append).
- **`show`** renders the persisted profile — an axes table, the extreme-opinion list, and a summary line — and is read-only.

Keeping the judgement in the skill and the persistence in the store means the store is testable and total, while the genuinely hard part — reading taste out of history — stays where fresh context can be guaranteed.

---

## The Advisory Contract

The mental model **sharpens the agent's recommendation; it never replaces a question.** This is its single most important boundary.

- **It biases, it does not answer.** When the agent forms a recommendation for a question, the relevant axis tilts that recommendation toward the developer's known leaning — so the recommended option is more often the one the developer would have picked anyway. That is the whole value: better recommendations, fewer rounds.
- **Questions stay essential.** The model is **never a question-killer**. Knowing a tendency is not the same as knowing the answer to *this* question, and the developer's right of decision is not delegable (see [34-question-interface.md](/specification/question-interface/) and [21-human-computer-interaction.md](/specification/human-computer-interaction/)). Pre-thinking more raises the *quality* of questions; it never removes them.
- **It never auto-answers silently.** The model may inform how the agent pre-thinks, but it must not flip a decision on the developer's behalf without that being visible and bounded. Pre-answering on the developer's behalf is governed separately and only above a high confidence bar (see [34-question-interface.md](/specification/question-interface/)); below that bar the question is surfaced.

---

## The Extreme-Opinion Flag

Some opinions are recorded not as a gentle tendency but as an **absolute**: a position the developer holds without compromise. These are flagged separately, because an absolute opinion carries a diagnostic signal that a soft tendency does not.

When a developer holds an unusually hard line on something, the most useful reading is often **not** "the developer is being unreasonable" but "**the system itself is probably off**" — a misconfigured environment, a broken git habit, a tool that keeps doing the wrong thing, a default that fights the workflow. An extreme opinion is therefore treated as a pointer at the system's own rough edges (git / env / config) rather than as a personality quirk to be worked around. Captured this way, the flag turns a recurring frustration into an actionable maintenance hint instead of a stalemate.

---

## Staleness and the Freshness Cockpit

The mental model is only as good as how far back it has read. It goes **stale** when its newest derived-from memo number falls behind the newest memo in the project — that is, when memos have been finalized since the last derivation, so the current portrait no longer reflects the most recent decisions.

This staleness is a **counting signal**, not a guess: compare the highest memo number in `derivedFrom` against the highest memo number in the project, and the gap is the staleness. Because it is countable, it belongs on the project's freshness cockpit — the `memo health` projection (see [12-rollout.md](/specification/rollout/)) — which surfaces the mental model as one of its counting freshness signals, alongside the other things that drift behind the project's leading edge. When the gap is wide enough, the cockpit **recommends a re-derivation**; it never runs one silently. As with goal optimization and maintenance re-verification, the developer triggers the act — the system surfaces the need and waits.

`memo health` therefore carries the mental model as one freshness signal among several: a single counting check that says *the learned preference portrait is N memos behind the project*, so the developer can decide whether a refresh is worth it now.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [21-human-computer-interaction.md](/specification/human-computer-interaction/) — the two developer touchpoints and the canonical interaction model the mental model learns from and serves.
- [34-question-interface.md](/specification/question-interface/) — where the mental model biases each recommendation, and the answer-split / on-behalf contract that bounds pre-answering.
- [31-goals.md](/specification/goals/) — the goal store, the structural mirror of the mental model (intent above a memo versus preference above a memo).
- [12-rollout.md](/specification/rollout/) — the freshness cockpit (`memo health`) that surfaces the mental model's staleness as a counting signal.
- [33-maintenance.md](/specification/maintenance/) — the backward-view measuring discipline whose freshness reading the cockpit shares.
- [00-overview.md](/specification/overview/) — mission and authority model (the developer holds the right of decision the mental model never displaces).
</content>
</invoke>
