# Persona Entry-Points (Spec & Docs Mapping)

> **Internal calibration document.** Persona names **never** appear on the website or in the spec — only navigation labels and chapter titles are visible.
> Aligned with `docs.entryPoints`: each persona has one recommended entry point into the spec/docs that leads to their success criterion. Based on Memo 001 (Kap 1 motivation, Kap 23 personas note) and the spec chapter map (REV-04 Kap 3–23).

## The three personas

| Persona | Role (internal) | Main question | Patience | Key friction |
|---------|-----------------|---------------|----------|--------------|
| **Aaron** (38, Berlin) | Solo System-Author | "Publish my method, secure authorship, don't break my live system" | High for his own loops; low for unverified claims | Spec drifting from reality, scope creep into live skills, private-data leak |
| **Priya** (31, Bangalore) | Agentic-Tooling Builder | "Turn ad-hoc AI coding into a reproducible memo → PRD → rollout workflow" | Medium — reads a real spec, bounces off pure theory | All philosophy no runnable path, guardrails implied not specified |
| **Anders** (46, Copenhagen) | Evaluating Decision-Maker | "What is it, is hands-off safe, is it reproducible — in minutes?" | Very low — ~90 seconds first impression | Buzzwords, ungoverned automation, single-author dependency |

## Entry points into the spec/docs (target state)

| Persona | Entry point (spec file / docs page) | What they find there | Success criterion |
|---------|-------------------------------------|----------------------|--------------------|
| **Aaron** | `02-memo-sop-entrypoint.md` (`memo-sop` entrypoint) | The canonical entry/re-entry skill — the SOP that explains the whole workflow; the verified system, honestly described | Re-enters the full method from one chapter; confirms the spec mirrors reality |
| **Priya** | `01-philosophy.md` + rollout chapters `12-rollout.md` / `13-orchestration.md` | The guardrails philosophy (the autobahn analogy) + the hands-off Generate → Execute → Evaluate pipeline, agents-as-base-layer | Sees memo → PRD → rollout end-to-end and where she plugs in |
| **Anders** | `00-overview.md` (vision + RFC-2119 conformance block) | A jargon-light statement of what the system is, the hands-off + guardrails claim, reproducibility signals | Decides in a few minutes whether it earns a deeper look |

**IMPORTANT:** Persona labels never appear in navigation. Visible labels are only "Overview", "Philosophy", "Memo-SOP", "Input", "Strategies", "Quality & Finalization", "Rollout", "Orchestration", "Agents & Skills", "Prompt-Generator", "Git & Security", "Workbench", etc. The persona logic sits underneath.

## Conflict rule

| Conflict | Resolution |
|----------|------------|
| **Priya ↔ Anders (same surface)** | **Anders leads on the landing/overview.** First impression decides team adoption (longer leverage). Priya's depth lives one reliable click down — never gated behind the overview. |
| Exception | A page explicitly aimed at builders (e.g. a "how the rollout works" guide) leads depth-first; the overview page stays skim-first. |
| **Aaron ↔ Priya** | Give the adoptable foundation, but flag every live-system step (symlink repointing, repo extraction) with verify/rollback — adoption must not teach the unsafe habit. |
| **Aaron ↔ Anders** | No real conflict — Aaron's evidence discipline (marked estimates, documented deviations) **is** Anders's trust signal. They reinforce each other. |

## Persona-driven search phrases (input for sitemap / SEO)

| Persona | Example search query | Target page |
|---------|---------------------|-------------|
| Aaron | "publish methodology as RFC spec" / "memo-driven planning system" | `00-overview.md` + `02-memo-sop-entrypoint.md` |
| Priya | "AI coding agent workflow structure" / "memo PRD rollout hands-off" | `01-philosophy.md` + `12-rollout.md` |
| Anders | "is agentic rollout safe" / "reproducible AI coding method guardrails" | `00-overview.md` (vision + conformance) |

## Important rules (from `overview.md`)

| Rule | Rationale |
|------|-----------|
| **Persona names never on the website or in the spec** | Personas are internal calibration models, not user-facing labels. |
| **No "For Decision Makers" header** | Direct targeting feels pushy. Use "Overview" / "What is the memo system" + visible trust signals (guardrails, evidence levels, clean org) — Anders finds it himself. |
| **Tone per section** | Hero may be crisp; About / spec / rollout must be matter-of-fact with explicit evidence levels. |
| **Substance > momentum** | Reproducibility and guardrails dominate; any energy is complementary, never a substitute for substance. |
| **Depth one click away, never gated** | Anders skims the overview; Priya must reach the runnable pipeline without friction. |

## Usage

- **Spec-authoring (Phase 2)** checks each chapter against the entry-points table — does the entry chapter for each persona deliver the success criterion?
- **Website-structure PRDs** verify that `00-overview` (Anders), `01-philosophy` + rollout (Priya), and `02-memo-sop-entrypoint` (Aaron) are reachable from the landing within each persona's patience window.
- **Tone review** checks each section against `tone-guide.md` per persona.

## Audit trail

Source: `personas/overview.md`, `personas/{solo-system-author, agentic-tooling-builder, evaluating-decision-maker}.md`, Memo 001 REV-04 (Kap 1 motivation, Kap 3 philosophy/entry, Kap 4 memo-sop, Kap 11–13 rollout, Kap 23 personas).
