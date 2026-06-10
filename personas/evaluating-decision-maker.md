# Anders Holm — Evaluating Decision-Maker

> 46-year-old engineering leader evaluating whether the memo-system approach is worth bringing to his team. He has a few minutes, not a few hours. He needs to know — in plain terms — what it is, whether the rollout is genuinely hands-off, what guardrails exist, and whether results are reproducible.

---

## Identity

| Field | Value |
|-------|-------|
| Name | Anders Holm |
| Age | 46 |
| Gender | male |
| Location | Copenhagen, Denmark |
| Profession | VP of Engineering at a mid-size B2B software company (~120 engineers); owns tooling strategy and engineering standards |
| Education | M.Sc. Software Engineering; long career from IC to engineering leadership |
| Languages | Danish (native), English (fluent, all work) |

---

## Biography

Anders started as a backend engineer, became a team lead, and now sets engineering standards across a dozen teams. He has watched the AI-coding wave move from novelty to daily reality and his teams already use coding agents — but unevenly, with no shared method, no reproducibility, and the occasional autonomous run that scared someone. He is not looking for another tool to install; he is looking for a **method** worth standardizing. He keeps a short list of approaches to evaluate and gives each one a few focused minutes before deciding whether it earns a deeper look or a pilot. memo-init is on that list because someone on his team mentioned its hands-off rollout and its guardrails. His first question is never "how does it work in detail" — it is "what is this, is it real, and is it safe to put in front of my engineers."

---

## Daily rhythm with the memo system

| Question | Answer |
|----------|--------|
| When does the memo system enter their work? | During an evaluation window — he is weighing it against other approaches for team adoption. |
| In what setting? | Office, between meetings; sometimes a quick read on a commute. |
| How much time per session? | First pass: 3–10 minutes. A second, deeper look only if the first pass earns it. |
| Frequency | One-off evaluation, then a possible pilot decision. Not a daily user himself. |

---

## Tools

| Category | Tools |
|----------|-------|
| IDE / editor | Rarely codes now; reads code in the browser and in PRs |
| OS | macOS |
| AI tools | Reviews what his teams use (Claude Code and others); evaluates rather than operates |
| Browser | Safari + Chrome |
| Communication | Slack (internal), GitHub (reads orgs, READMEs, issues), LinkedIn |
| Docs consumption style | Overview-first skimmer. Reads the landing, the org profile, the README. Drops in if substance is visible in 90 seconds. |

---

## Interests outside code

- **Engineering leadership and process** — reads on team scaling, standards, and how methods spread inside orgs.
- **Sailing** — weekends on the water; values systems that don't capsize under pressure.
- **History and biography** — long-form reading on how things were built and who built them.
- **Cooking for the family** — reliable, repeatable, no surprises.
- **Watches the AI-tooling space** at a strategic level, not a hands-on one.

---

## Personality

| Aspect | Value |
|--------|-------|
| Risk appetite (tech) | Low for team-wide adoption. High bar before anything reaches his engineers. |
| Learning style | Overview-first reader. Wants the shape and the trust signals before any detail. |
| Patience threshold | Very low for hype, very high once substance is shown. Decides the first impression in ~90 seconds. |
| Register | Matter-of-fact, skeptical of buzzwords, persuaded by evidence and honesty. |
| Values | Reproducibility, guardrails, safety for non-expert users, honest claims, a method that scales beyond one author. |

---

## Main question

> "In a few minutes — what is this memo system, is the hands-off rollout real and safe, and is it reproducible enough that I'd put it in front of my team?"

---

## Primary goals

1. Understand in plain language what the system is and what problem it solves.
2. Judge whether the hands-off rollout is genuine — and whether it has guardrails when something goes wrong.
3. See that results are reproducible — deterministic artifacts, state files, evidence discipline — not one-off magic.
4. Confirm it is self-explanatory without insider knowledge, so his engineers could pick it up.
5. Decide quickly whether it earns a deeper evaluation or a pilot.

---

## Pain points

1. Marketing language with no substance — an instant warning sign and usually a stop.
2. Hidden risk — autonomous runs with no visible guardrail, verify step, or rollback.
3. One-author dependency — a clever system nobody but its creator could run or maintain.
4. Irreproducibility — results that can't be re-derived or explained after the fact.
5. Having to read for an hour just to learn what the thing even is.

---

## Likes

1. A clear, jargon-light statement of what the system is, up top, in 60 seconds.
2. A genuinely hands-off rollout with explicit guardrails — quality gates, empty-context evaluators, verify/rollback on risky steps.
3. Reproducibility signals — deterministic start prompts, state files, crash-recovery, honest evidence levels.
4. A clean public org that is understandable without knowing the author.
5. Honest framing — estimates marked as estimates, deviations documented, no overclaiming.

---

## Quotes

> "I have five minutes. Tell me what it is and whether it's safe for my team — the details can wait for round two."

> "Hands-off automation is great. Hands-off with no guardrail is a liability. Which one is this?"

> "If it only works because one person built it, it doesn't scale to my org."

> "Buzzwords in the first paragraph and I'm gone. Show me reproducibility, not adjectives."

> "I trust a doc more when it admits what it hasn't measured. Honesty is a stronger signal than confidence."

---

## Relationships with other personas

### Overlap

- **The Solo System-Author:** Both want the system to be self-explanatory and honestly described. Aaron's evidence discipline (marking estimates, documenting deviations) is precisely the trust signal Anders is scanning for in his first few minutes.

- **The Agentic-Tooling Builder:** Both evaluate before committing and both care about guardrails and reproducibility. Anders decides whether the team adopts; Priya is the kind of engineer who would actually run it. If Anders greenlights, Priya implements.

### Conflict

- **The Agentic-Tooling Builder:** Priya wants depth and a runnable path immediately; Anders wants a 90-second overview before any depth. The same landing can't lead with both — overview-first for Anders, with depth one click away for Priya.

### Neutral

- **(no real neutrality)** — as the adoption gatekeeper, Anders has a stake in the author's honesty and the builder's ability to run the system.

---

## When would he become a fan?

If the overview tells him what the system is in under a minute, the rollout is visibly hands-off **with** guardrails (gates, empty-context evaluation, verify/rollback), reproducibility is evident, and nothing depends on one irreplaceable author. Then he greenlights a pilot and lets a builder like Priya run it.

## When would he walk away?

If the first impression is hype instead of substance, if the automation looks autonomous-but-ungoverned, or if the whole thing clearly hinges on its single creator. Any one of those ends the evaluation in his first few minutes.
