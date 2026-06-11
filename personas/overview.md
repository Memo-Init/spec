# Personas Overview — Audience, Matrix, Trade-Offs

This document introduces the memo-init persona system and consolidates the three personas, shows their relationships at a glance, and makes the key trade-off decisions explicit. It is an **internal calibration tool**: persona names never appear on the website or in the spec — only navigation labels do. Use this document when a concrete question (landing copy, docs structure, trust signals, entry points) has to be weighed between persona needs.

The personas are derived directly from the memo's own motivation (Memo 001, Kap 1): a solo engineer keeping his methodology as personal IP, publishing it to secure authorship, modeled on a clean, well-run public org as the structural benchmark. Three personas cover the real audience — the author who runs the system, the engineer who adopts the method, and the leader who evaluates it for a team. (Memo 001, Kap 23 specifies 3–5; three strong ones are defined here.)

---

## 1. The three personas — at a glance

| Persona | Name | Age | Location | Profession | Main question |
|---------|------|-----|----------|------------|----------------|
| [Solo System-Author](./solo-system-author.md) | Aaron Brandt | 38 | Berlin | Independent engineer / system author | "How do I publish my own memo methodology, securing authorship, without exposing anything private or breaking my live system?" |
| [Agentic-Tooling Builder](./agentic-tooling-builder.md) | Priya Nair | 31 | Bangalore | Senior / founding engineer (startup) | "How do I turn my ad-hoc AI-coding habit into a structured, reproducible memo → PRD → rollout workflow I can actually adopt?" |
| [Evaluating Decision-Maker](./evaluating-decision-maker.md) | Anders Holm | 46 | Copenhagen | VP of Engineering (~120 engineers) | "In a few minutes — what is this, is the hands-off rollout real and safe, and is it reproducible enough for my team?" |

---

## 2. Persona matrix (3×3)

How do the personas behave toward each other? Each cell shows the relationship **from row to column**.

|             | **Aaron**   | **Priya**   | **Anders**  |
|-------------|-------------|-------------|-------------|
| **Aaron**   | ━           | Overlap     | Overlap     |
| **Priya**   | Overlap     | ━           | Overlap     |
| **Anders**  | Overlap     | Overlap     | ━           |

**How to read this:**
- **Overlap** = share substantial needs, benefit from the same improvements
- **Conflict** = have opposing needs, one solution can't serve both at once
- **Neutral** = little direct contact, indifferent to each other

**Observations:**
- All three personas overlap heavily — the audience is coherent. Everyone wants reproducibility, guardrails, honest framing, and a system understandable without knowing the author.
- The conflicts are not relationship-level but **depth-level**: the same surface (landing, hero) must serve a 90-second skim (Anders) and a runnable path (Priya) at once.
- Aaron is the author of the very thing the other two read — his fidelity and honesty are the substrate of both other personas' trust.

---

## 3. Conflicts (trade-off decisions)

These tensions require deliberate decisions. A solution can't serve both sides at once — choose, or balance carefully.

### Conflict 1: Landing depth — overview vs runnable path

| Position | Persona | Argument |
|----------|---------|----------|
| **Pro overview-first** | Anders | Needs to know WHAT it is and whether it's safe in ~90 seconds before any detail. |
| **Pro depth-first** | Priya | Wants the memo → PRD → rollout pipeline and where she plugs in, immediately. |
| **Trade-off** | — | **Pyramid, not mush.** A jargon-light one-sentence definition + hands-off/guardrails statement up top (Anders), with the pipeline and a runnable path one click down (Priya). Both satisfied within their patience window. |

### Conflict 2: Tone — honesty vs momentum

| Position | Persona | Argument |
|----------|---------|----------|
| **Pro strict honesty** | Aaron, Anders | Estimates marked as estimates, deviations documented; hype is a stop signal. |
| **Pro a little energy** | Priya | Tolerates and even likes a bit of momentum, as long as substance follows. |
| **Trade-off** | — | **Tone per section.** Hero may be crisp and slightly pointed; About / spec / rollout must be matter-of-fact with explicit evidence levels. Energy never replaces substance. |

### Conflict 3: Adoptability vs live-system protection

| Position | Persona | Argument |
|----------|---------|----------|
| **Pro adopt-and-remix** | Priya | Wants a buildable foundation she can adapt for her team. |
| **Pro protect the live system** | Aaron | Risky steps (symlink repointing, repo extraction) need verify/rollback and clean follow-up-work separation. |
| **Trade-off** | — | **Give the foundation, mark the guardrails.** The spec offers an adoptable method but flags exactly which steps touch a live system and how to do them atomically — so adoption doesn't teach the wrong habit. |

---

## 4. Overlaps (double and triple priorities)

Where multiple personas share needs, the value of a solution multiplies. Prioritize these.

| Shared need | Who shares it | Implication |
|-------------|---------------|-------------|
| **Reproducibility** | All three | Deterministic start prompts, state files, crash-recovery, evidence discipline belong front and center — not in an appendix. |
| **Guardrails on hands-off rollout** | All three | Quality gates, empty-context evaluators, verify/rollback must be visible as part of the rollout story, not implied. |
| **Self-explanatory without the author** | All three | No insider knowledge, no personal context. The org and spec must read clean to a stranger. |
| **Honest framing / evidence levels** | Aaron + Anders | FAKT / ANNAHME / VERMUTUNG and marked estimates double as a trust signal for evaluation. |
| **A runnable, named pipeline** | Priya + Aaron | memo → PRD → rollout must be concrete and followable, not just described philosophically. |

---

## 5. Persona-specific entry points (summary)

One frictionless path per persona that leads to success. Full mapping in [`entry-points.md`](./entry-points.md).

| Persona | Entry point | Core need | Success criterion |
|---------|-------------|-----------|--------------------|
| Aaron | `memo-sop` entrypoint (`02-memo-sop-entrypoint.md`) | The canonical re-entry point — the SOP that explains it all | Re-enters the full workflow from one skill/chapter |
| Priya | `01-philosophy.md` + rollout chapters (`12`–`13`) | The method's shape + the hands-off pipeline | Sees memo → PRD → rollout and where she plugs in |
| Anders | `00-overview.md` (vision + conformance) | "What is it, is it safe, is it reproducible" in minutes | Decides in a few minutes whether it earns a deeper look |

---

## 6. Friction map

When a feature, docs change, or asset is discussed: which persona does it rub against, and where?

### Aaron friction points
- Spec drifts from the verified system → fidelity lost, the whole point of publishing fails
- Bootstrap silently mutates the live workbench → broken daily-driver
- Private data (paths, secrets) leaks into the public org → authorship win becomes a liability
- Question-format mis-authored → recurring LLM failure resurfaces (authoring bug, not viewer bug)

### Priya friction points
- All philosophy, no runnable path → she closes the tab
- No clear "where do I plug in" → adoption stalls
- Guardrails implied but not specified → she can't lift them into her team
- So tightly coupled to one workbench she'd have to rebuild everything → not adoptable

### Anders friction points
- Hype / buzzwords in the first paragraph → evaluation ends in 90 seconds
- Hands-off automation with no visible guardrail → reads as a liability
- Obvious single-author dependency → won't scale to his org
- No reproducibility signals → looks like one-off magic

---

## 7. Recommendations for trade-off decisions

When a question has to be weighed between persona needs, these rules of thumb apply:

1. **For depth conflicts:** pyramid. Overview + safety statement on top (Anders), runnable pipeline one click down (Priya), full spec beneath (Aaron). Don't pack everything into one surface.
2. **For tone conflicts:** separate per section. Hero may be crisp; About / spec / rollout must be matter-of-fact with explicit evidence levels.
3. **For honesty vs polish:** honesty wins. A marked estimate beats a confident unverified claim — it serves Anders's trust and Aaron's discipline at once.
4. **For adoptability vs safety:** give the foundation, but flag every live-system step with verify/rollback. Adoption must not teach the unsafe habit.
5. **Default leaning:** when Priya's depth-hunger and Anders's skim-need collide on the same surface, lead with Anders's overview need (first impression decides adoption) and keep Priya's depth one reliable click away.

---

## 8. What these personas do NOT cover

The three personas cover the main audience, but not everything. Conscious gaps:

- **End users of memo-driven products** — they never see the memo system. Not a persona, because the spec doesn't reach them.
- **Open-source contributors to the spec itself** — currently folded into Priya (the adopter). Could become a fourth persona if external contribution becomes a goal.
- **Procurement / security / legal reviewers** — partially covered by Anders (he watches safety and single-author risk). Add a dedicated persona only if enterprise adoption is explicitly targeted.

For new recurring needs, a fourth or fifth persona can be added (Memo 001, Kap 23 allows up to five) — copy `_template.md` and register it here.
