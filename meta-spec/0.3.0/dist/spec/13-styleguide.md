---
title: "Styleguide"
description: "The **styleguide** fixes the written form of the documents the organization authors and generates. It classifies every Markdown construct in use as required, allowed, restricted or forbidden, it..."
spec_meta_version: "0.3.0"
spec_file: "13-styleguide.md"
order: 13
section: "Meta-Spec"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "meta-spec/0.3.0/draft/spec/13-styleguide.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: meta-spec/0.3.0/draft/spec/13-styleguide.md."
---


The **styleguide** fixes the written form of the documents the organization authors and generates. It classifies every Markdown construct in use as required, allowed, restricted or forbidden, it fixes the character strings of the internal identifiers, it names the artifacts it binds, it states the rule by which new words are formed, and it fixes how a document cites its sources and splits into header and body. The vocabulary and sentence rules stay in [Controlled Language](/spec/controlled-language/), and the chapter format stays in [Per-Chapter Format](/spec/per-chapter-format/); this chapter references them rather than restating them.

---

## Scope

This styleguide binds code comments, commit messages and merge messages, as well as memo text, specification text and terminal output. An outward-facing README is the one artifact class that is not bound by its structure rules; it keeps its own pattern.

---

## Markdown Constructs

Each construct carries one class from the closed set `required`, `allowed`, `restricted` and `forbidden`. A rule names the form lint rule (`FR-01` to `FR-09` of `memo form check`) only where that lint carries it.

| Construct | Class | Rule |
|---|---|---|
| Headings | restricted | Levels 1 to 3 only; level 4 and deeper is forbidden (`FR-01`). Block headings are named `### Ist-Zustand` and `### Soll-Zustand` (`FR-06`). |
| Tables | allowed | A table carries a heading or a bold line directly above it (`FR-04`). From five entries of the same kind a table is used; from eight entries the table is generated. |
| Lists | allowed | Under `### Ist-Zustand` every item begins with an evidence level (`FR-02`, `FR-03`). |
| Blockquotes | restricted | Only verbatim user quotes, each with its evidence identifier (`FR-08`). |
| Code fences | allowed | The fence names its language; no prose inside a fence. |
| Block-meta fence | required | One line per numbered memo chapter carrying `id`, `topics`, `repos`, `tags` and `chapter`. |
| Mermaid fence | allowed | Only `flowchart TD`. |
| Vega-Lite fence | allowed | Only quantitative diagrams. |
| Inline code | allowed | Identifiers, paths, commands and key words used as data. |
| Bold | restricted | The defined term and the lead word of a marker. |
| Italic | restricted | Work titles and foreign words; never a requirement. |
| Links | allowed | Family-internal links take the form `./NN-name.md`. |
| Reference markers | allowed | Superscript digits `¹ ² ³` after a statement that cites a web link or a document; each resolves in the reference list of the body (*References and Document Structure*). |
| HTML comments | restricted | Generated markers only. |
| Horizontal rules | restricted | One `---` between the sections of a chapter. |

---

## Internal Identifiers

Each recognized identifier prefix has one row. The shape is derived from the separator and digit fields of the identifier vocabulary of the core command line, not written from memory.

| Prefix | Entity | Shape |
|---|---|---|
| `M` | memo | `M` followed by three to four digits, no separator |
| `MNT` | maintenance card | `MNT`, a hyphen, then three to four digits |
| `T` | topic | `T` followed by three to four digits, no separator |
| `B` | block | `B` followed by three to four digits, no separator |
| `G` | goal | `G` followed by three to four digits, no separator |
| `WI` | work item | `WI`, a hyphen, then three to four digits |
| `RES` | research | `RES`, a hyphen, then three to four digits |
| `PRD` | PRD | `PRD`, a hyphen, then one to four digits |
| `REQ` | requirement | `REQ`, a hyphen, then three to four digits |
| `PLAN` | plan | `PLAN`, a hyphen, then three to four digits |
| `ANM` | annotation | `ANM`, a hyphen, then three to four digits |
| `LL` | lesson learned | `LL`, a hyphen, then three to four digits |
| `REV` | revision | `REV`, a hyphen, then two to four digits |
| `SR` | controlled-language rule | `SR`, a hyphen, then two to three digits |

---

## Word Formation

A coined word MUST be written out in full. The term Berechtigungsschein is written in full, and a compound is formed from the full word, never from a clipped form. A clipped coinage MUST NOT appear in a name, a title, a tag or a field name. Where an English machine token is needed, the token of the register is used: `permit` for the Berechtigungsschein (decision F22).

---

## References and Document Structure

Original wording (German), a statement of the user from the input transcript of the memo that founded the governance family, line 124:

> „Es wird angestrebt möglich Akademisch arbeit abzulegen. Und Internetlinks und Dokumente korrekt als ¹ ² ³ zu hinterlegen und akademishc zu behandeln. Die Dokumenten sollten immer eine HEader und einen Body haben. Verweise sind im Body anzuführen. Meta informationen im header.“

- **Academic references.** A document SHOULD be written to the standard of academic work. A web link or a document that a statement cites is marked with a superscript number (`¹`, `²`, `³`, …), numbered in the order of first citation. Each number resolves to exactly one entry of the reference list: the number, the title, the URL or the path, and for a web link the date it was accessed. A source cited again keeps its first number.
- **Header and body.** Every document MUST have a header and a body. The header carries the meta information — status, dependencies, related documents and the standards declaration, in the form [Per-Chapter Format](/spec/per-chapter-format/) fixes. The body carries the content. References MUST stand in the body: the superscript markers at the statements and the reference list at the end of the body, never in the header.

The outward-facing README stays outside these rules, as *Scope* states.

---

<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./06-conventions-writing.md](/spec/conventions-writing/) — the anchor-term convention whose terms this chapter gives a written form.
- [./12-controlled-language.md](/spec/controlled-language/) — the vocabulary and sentence rules this styleguide complements.
- [./02-per-chapter-format.md](/spec/per-chapter-format/) — the chapter format and the standards declaration of document headers.
