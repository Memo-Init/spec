---
title: "Transcript Reliability"
description: "A transcript is a human speaking a task into a microphone, transcribed by software into the input field. Transcripts are **highly variable in reliability**, and the spec until now treated them as..."
spec_version: "0.1.0"
spec_file: "37-transcript-reliability.md"
order: 37
section: "Specification"
normative: true
generated_at: "2026-06-30T22:47:32.159Z"
generated_from: "draft/memo/0.1.0/spec/37-transcript-reliability.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/37-transcript-reliability.md."
---


A transcript is a human speaking a task into a microphone, transcribed by software into the input field. Transcripts are **highly variable in reliability**, and the spec until now treated them as trustworthy input without question. This chapter names that gap: it defines what makes a transcript unreliable, the interpretation rule that follows, the deterministic reliability estimate that flags suspect spots (the Step 2b of [04-input-pipeline.md](/specification/input-pipeline/)), and how this input-side concern is distinct from the output-side notion of contamination.

---

## What a Transcript Is, and Why It Is Raw

The developer speaks; the **transcription software** (not the model, not the developer) writes the text, and the developer never edits it — it lands in the field unedited. Two failure modes follow from that, and neither is a typo:

- **Invention, not misspelling.** Transcription errors carry no grammar mistakes, so they cannot be caught grammatically. Instead the software **adds invented text** — provider sign-offs and copyright boilerplate ("bis bald", "copyright bei WDR und tschüssi", "subtitles by …"). This is a different class from a word-confusion: a confusion swaps a *known* word, an invention appends *foreign* text.
- **Silent provider downgrade.** The provider can switch the transcription model to a weaker one without warning, so quality drops with no trigger. A reliability estimate must therefore work even when no specific cause is known.

---

## The Length Statistic

Errors become **more** visible the longer the developer speaks. When the same point is made from several angles, an extreme deviation stands out against the redundancy; a **short** transcript offers no comparison, so an invented word looks more plausibly real. The consequence is a paradox the estimate must respect: the **long initial transcript** is at once the **most dangerous** (the most surface to invent on) and the **most checkable** (redundancy is the detector). This is why reliability carries a separate **confidence**: a long, redundant transcript is measured with high confidence; a short one is measured cautiously, with low confidence rather than a false alarm.

---

## The Raw-Transcript Interpretation Rule

The existing raw-transcript rule (Step 1 of [04-input-pipeline.md](/specification/input-pipeline/)) preserves the unedited text. This chapter adds the missing **semantic** half — how that raw text MUST be *interpreted*:

> **Raw-Transcript Default-Assumption.** A transcript is, by default, **100 % raw machine output**. Its wording is NOT contaminated by the developer — the software auto-copies it into the field unedited. Therefore an implementation MUST NOT treat any odd spelling, invented term, or name in a transcript as a developer **decision**. A specific wording is intended **only** when the developer **explicitly announces it** ("I want to discuss X, it is written like this") or **spells it out** letter by letter. Anything else is machine text and MUST be questioned, never adopted as intent.

The canonical failure this rule prevents is deriving a **naming convention from a transcription artifact** — taking a transcribed spelling and turning it into a decided term. It is the same class as a discarded invented name in the dictionary (an AI invention, not a developer wish): such a term is removed entirely, never merely negated. The rule is the middle piece of a three-link chain: *preserve* the raw text (Step 1), *never interpret* a wording as a decision (this rule), *ask rather than invent* (Step 3's "ask" duty).

---

## The Reliability Estimate

The estimate is a deterministic, cheap score in the spirit of the other deterministic scores (readiness, blast-radius): an **estimate against a threshold, not a 0/1 proof**, that never aborts. It returns a `reliability` value, a `confidence`, the underlying `signals`, located `findings`, and a `recommendation`. A low score means "re-confirm the flagged spots with the developer", never "discard".

| Signal | What it measures | Effect |
|--------|------------------|--------|
| `lengthWords` | word count of the raw body | context for `confidence` (short → lower confidence), not the score |
| `boilerplateHits` | matches against a provider-boilerplate list (sign-offs, copyright) | lowers reliability; each becomes a located finding |
| `dictionaryHitDensity` | dictionary corrections per 100 words — many known mishearings means a noisy transcript | lowers reliability |
| `topicCohesion` | share of the text that belongs to the dominant theme; a deep outlier ("blue elephants" mid-spec) is an invention flag | lowers reliability on outliers |
| `crossAngleRedundancy` | rough intra-transcript repetition — more is **more checkable** | raises `confidence`, not the score |
| `unannouncedNovelTokens` | rare CamelCase / capitalized non-dictionary tokens not announced or spelled out — naming-bug candidates | becomes a finding (read with the interpretation rule above) |

The lowering signals combine into `reliability ∈ [0,1]`; `lengthWords` and `crossAngleRedundancy` modulate `confidence` only. Boilerplate hits and unannounced novel tokens produce **findings** with their location, so the developer is asked about specific spots rather than the whole input. The default threshold is calibratable on the real distribution. The estimate is wired as Step 2b of the input pipeline — after the dictionary scan, before topic extraction — and runs **WARN, never block**.

---

## The Dictionary and Its CLI

Recurring mis-hearings are corrected once in a shared **transcription dictionary** (`.memo/_references/transcription-dictionary.md`): a flat `Falsch | Richtig | Notiz` table, consulted before topic extraction and applied as non-content-changing, word-bounded replacements. Two minimal CLI surfaces back it deterministically (minimal by intent — only what is needed):

- `memo transcript score <file>` — run the reliability estimate over a raw transcript and return the score object.
- `memo dictionary add "<wrong>" "<right>" --note "<evidence>"` — append a proven mis-hearing to the table rather than hand-editing it.

The dictionary's parser and applier are a shared primitive (one module both the cross-memo check and these commands use), not a detail buried in one caller.

---

## Distinct from Contamination

Transcript reliability is **not** contamination, and the two MUST NOT be conflated — they are different axes:

| Term | Axis | Source |
|------|------|--------|
| context rot | cause: LLM output degrades as input length grows | [09-contamination-context-handover.md](/specification/contamination-context-handover/) |
| contamination | effect: a document written out of a rotten context | [09-contamination-context-handover.md](/specification/contamination-context-handover/) |
| transcript reliability | input: the machine transcript invents or is noisy, *before* the model reads it | this chapter |

Contamination describes the model's own degraded **output** context; transcript reliability describes foreign **input** from the transcription software, upstream of the model. Using "contaminated" for a noisy transcript would blur the sharp contamination definition — hence the separate term.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [04-input-pipeline.md](/specification/input-pipeline/) — Step 2b, where the reliability estimate runs, and Step 1's raw-transcript preservation rule this chapter's interpretation rule extends.
- [03-input-paths.md](/specification/input-paths/) — the four transcript types; the long `memo-init` transcript is the estimate's focus.
- [09-contamination-context-handover.md](/specification/contamination-context-handover/) — contamination and context rot, the distinct output-side axes.
- [30-primitives.md](/specification/primitives/) — the glossary where transcript reliability sits beside context rot and contamination.
- [10-proactive-research.md](/specification/proactive-research/) — Step 5 research, which must not run on invented topics.
