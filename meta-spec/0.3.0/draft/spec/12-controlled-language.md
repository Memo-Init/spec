# 12. Controlled Language

| Field | Value |
|---|---|
| Status | Draft |
| Depends on | [./06-conventions-writing.md](./06-conventions-writing.md) |
| Related | [./02-per-chapter-format.md](./02-per-chapter-format.md), [./00-overview.md](./00-overview.md) |

A **controlled language** is a deliberately restricted subset of a natural language: a fixed vocabulary with one meaning per word, plus a small body of writing rules that bound sentence length, voice, and structure. The reference instance is ASD-STE100 (Simplified Technical English), the ASD's international standard for technical documentation, built from two parts — a Dictionary of approved words and a body of Writing Rules. This chapter registers the organization's own controlled-language profile: a curated, binding twelve-rule set in the STE spirit. It does **not** adopt STE wholesale, and it does **not** re-specify the anchor-term register that its vocabulary rules build on — that register is the Dictionary half and lives in [Writing Conventions](./06-conventions-writing.md); this chapter references it rather than restating it (No Double Normativity). The chapter reads under the RFC-2119 conformance interpretation the family establishes in its overview ([./00-overview.md](./00-overview.md)).

The twelve rules are authored in German and reproduced here verbatim, with one marked exception (`SR-04`, see ‡ below), because a controlled-language rule set is inseparable from the language it controls: STE controls English, this profile controls German. The rules govern German-language artifacts — terminal output and memo prose — so they appear below as a quoted normative specimen in German, framed by this chapter's English description.

---

## Two Parts, After STE

Like STE, the profile is split in two, and the split is orthogonal to how each rule is enforced (see [Carriers](#carriers)):

- **Part 1 — Vocabulary** (`SR-01`–`SR-06`) is the Dictionary half: one term with one meaning, mis-labels replaced by the approved label, no bare IDs, no reference jargon, new terms only through the register, abbreviations only when registered.
- **Part 2 — Sentence and Structure** (`SR-07`–`SR-12`) is the Writing-Rules half: short sentences, one idea per sentence, active voice with a named actor, verbs over nominalizations, result first with marked warnings, exact values over weasel words.

The anchor-term register specified in [Writing Conventions](./06-conventions-writing.md) is the Dictionary equivalent: each entry already carries the STE mechanics — a canonical label, exactly one approved meaning, a negative delimitation, and known mis-labels. Part 1 **MUST** reuse that register; it **MUST NOT** spawn a parallel vocabulary store.

---

## Scope

The profile applies to **terminal output and memo prose** — the two German-language artifacts the organization emits and authors (decision F9=A). Specification and code texts are **out of scope**: they are English artifacts under the one-language-per-artifact convention, and the register-neutral rules that govern them ([Writing Conventions](./06-conventions-writing.md), `NR1`/`NR2`) already cover them. A conforming terminal output or memo prose text **MUST** hold to `SR-01`–`SR-12`; a specification or code text is **not** measured against them.

---

## Part 1 — Vocabulary (Dictionary Part): SR-01–SR-06

| # | Regel | STE-Vorbild |
|---|-------|-------------|
| SR-01 | **Ein Begriff = eine Bedeutung.** Fuer jedes Konzept NUR das kanonische Anker-Label (Memo, Revision, Topic, Block, PRD, Phase, …), nie Synonyme („Dokument" fuer Memo, „Version" fuer Revision sind verboten). | one word, one meaning |
| SR-02 | **Mis-Labels sind non-approved words.** Steht ein Wort in `misLabels` eines AT-Eintrags, wird es durch das approved Label ersetzt — mechanisch lintbar. | non-approved words + Ersetzung |
| SR-03 | **Keine nackten IDs.** Jede ID (T043, B012, PRD-03, REQ-050) wird bei Erstnennung pro Ausgabe mit Typ + Klartext gefuehrt: „Topic T043 (ASD-STE100-Sprachstandard)". Eine ID ist nie alleiniges Satzsubjekt. | approved meaning explizit machen |
| SR-04 | **Referenz-Jargon verboten.** Nie „in R1 war T4/5 falsch". Immer voll aufloesen. Kein Slash-Buendeln, keine Ad-hoc-Kuerzel (R1, T4/5, P2-3). | Dictionary statt Jargon ‡ |
| SR-05 | **Neue Fachbegriffe nur ueber das Register.** Dauerhafte neue Begriffe werden als AT-Eintrag vorgeschlagen (Definition + Not + misLabels) — nicht ad hoc eingefuehrt. | Technical Names/Verbs |
| SR-06 | **Abkuerzungen nur wenn registriert.** Erste Nennung ausgeschrieben; nicht registrierte Abkuerzungen sind verboten. | approved words only |

‡ The rule NAME of `SR-04` deviates from the source chapter it was taken from and is marked here so this chapter's verbatim claim stays checkable. A later decision renamed it to **Referenz-Jargon verboten**, together with the CLI command and the lint engine that carry the same name, so that rule, skill, specification chapter and command read alike — one subject, one name. The retired wording is recorded where that decision was taken and is deliberately **not** reproduced here: the decision was to retire it completely rather than leave a second name in circulation. Effect, patterns and the rule id `SR-04` are unchanged; the deviation is one of naming, not of normative content.

---

## Part 2 — Sentence and Structure (Writing-Rules Part): SR-07–SR-12

| # | Regel | STE-Vorbild |
|---|-------|-------------|
| SR-07 | **Kurze Saetze.** Anweisungen/Statusmeldungen max. ~20 Woerter, Erklaerungen max. ~25 Woerter. | 20/25-Woerter-Regel |
| SR-08 | **Eine Information pro Satz.** Hoechstens ein Nebensatz; keine Schachtelsaetze, keine Klammer-Kaskaden. | one instruction per sentence |
| SR-09 | **Aktiv mit benanntem Akteur.** „Ich habe die Tests ausgefuehrt" / „Das CLI hat den Store geschrieben" — nie „es wurde…" ohne Akteur. | active voice |
| SR-10 | **Verbalstil statt Nominalstil.** „pruefen" statt „eine Pruefung durchfuehren"; einfache Verbformen. | restricted verb forms |
| SR-11 | **Ergebnis zuerst, Warnungen markiert.** Erst Status (PASS/FAIL/BLOCKED), dann Begruendung; Warnungen als eigener Satz mit Marker am Anfang, im Imperativ wenn Handlung noetig. | warnings first, imperative |
| SR-12 | **Exakte Werte statt Wieselwoerter.** „3 von 5 Tests rot" statt „einige Tests scheitern"; Fuellwoerter und Extremwoerter sind gestrichen. | controlled vocabulary, precision |

---

## Carriers

Each rule is enforced by one of three carriers. The source memo records the anchoring verbatim:

> Verankerung: SR-01/02/05 laufen ueber das bestehende Anker-Register (Store + Generator); SR-03/04 sind regex-lintbar; SR-07–12 sind Stilregeln fuer Output-Style + Spec-Kapitel. Basis: ASD-STE100 Issue 9 (kostenlos), tekom-Leitlinie als deutsches Pendant, Anker-Register = Dictionary-Aequivalent.

- **Register** — routed through the anchor-term register (store + generator) of [Writing Conventions](./06-conventions-writing.md); a mis-label or a missing term is caught where the register is authored.
- **Regex-Lint** — mechanically checkable by pattern (bare-ID shapes, slash bundles, ad-hoc abbreviations).
- **Stil** — a style rule for the output-style carrier and this chapter; it guides authoring and is not mechanically linted.

| Regel | Carrier | Mechanism |
|-------|---------|-----------|
| SR-01 | Register | one canonical anchor label per concept |
| SR-02 | Register | `misLabels` list → approved label substitution |
| SR-03 | Regex-Lint | bare-ID pattern (type + plain text required at first mention) |
| SR-04 | Regex-Lint | slash-bundle and ad-hoc-abbreviation pattern |
| SR-05 | Register | new term proposed as an AT entry, never ad hoc |
| SR-06 | Register + Regex-Lint † | approved-abbreviation membership + first-mention-spelled-out pattern |
| SR-07 | Stil | sentence-length budget (~20 / ~25 words) |
| SR-08 | Stil | one idea, at most one subordinate clause |
| SR-09 | Stil | active voice, named actor |
| SR-10 | Stil | verbs over nominalizations |
| SR-11 | Stil | status first, warnings marked |
| SR-12 | Stil | exact values, no weasel or extreme words |

† The source (REV-03 Kap 10; research `2026-08-19--asd-ste100.md`, lines 129–132) does **not** assign a carrier to `SR-06`. `Register + Regex-Lint` is derived, not quoted: the register holds which abbreviations are approved, and "first mention spelled out" is pattern-checkable. The gap was surfaced rather than papered over; the derived carrier is a deliberate authoring decision on that basis, and it stays marked as derived so a future register/lint owner can revisit it.

---

<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./06-conventions-writing.md](./06-conventions-writing.md) — the anchor-term register and policy-block mechanism the vocabulary rules (`SR-01`/`SR-02`/`SR-05`) reuse as their Dictionary half.
- [./02-per-chapter-format.md](./02-per-chapter-format.md) — the chapter format and inline-requirement convention this chapter is authored in.
- [./00-overview.md](./00-overview.md) — the family overview and the RFC-2119 conformance interpretation the requirement keywords read under.
