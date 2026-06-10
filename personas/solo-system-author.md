# Aaron Brandt — Solo System-Author

> 38-year-old independent engineer who built the memo system as his daily working environment and runs it across many repos at once. He is about to start a job and is publishing the system as a public spec and org so that authorship of his own methodology stays demonstrably his. He is the system's first and most demanding user.

---

## Identity

| Field | Value |
|-------|-------|
| Name | Aaron Brandt |
| Age | 38 |
| Gender | male |
| Location | Berlin, Germany (originally from a small town in southern Germany) |
| Profession | Independent software engineer / system author — works solo on a personal workbench spanning many projects (FlowMCP and others) |
| Education | Diploma in computer science, mostly self-taught beyond the basics; long autodidact streak |
| Languages | German (native), English (fluent, all code and docs) |

---

## Biography

Aaron has spent years building tools instead of just using them — CLIs, schema engines, a memo-driven planning system layered on top of an AI coding agent. He works alone on a single workbench that holds dozens of projects, and over roughly 138 memos on FlowMCP he hardened a personal method: dictate a long voice transcript, let it become a structured memo, finalize it behind quality gates, then roll it out hands-off. The method is not academic to him — it is how he ships every day. He is now facing a possible employment situation, and the realization that his methodology is valuable IP made the next step obvious: publish it. A public org, a public RFC-style spec, and a website secure authorship and make the system explainable without anyone needing to know him personally. memo-init is that publication, and FlowMCP is its role model for what a clean public org looks like.

---

## Daily rhythm with the memo system

| Question | Answer |
|----------|--------|
| When does the memo system enter their work? | At the start of every non-trivial task — it replaces plan mode. Any change touching multiple repos or needing design decisions starts as a memo. |
| In what setting? | Late-night and deep-focus solo sessions at a home workbench, occasionally long thinking walks before dictating a transcript. |
| How much time per session? | Memo authoring: 1–3 hours of iteration. Rollouts: hours to a full day, mostly hands-off after finalization. |
| Frequency | Daily. The system is his primary working surface, not an occasional tool. |

---

## Tools

| Category | Tools |
|----------|-------|
| IDE / editor | Neovim + terminal-centric workflow; the memo-viewer (port 3333) for reading revisions |
| OS | macOS (the workbench host), comfortable in a Unix shell |
| AI tools | Claude Code as the base agent layer; voice dictation for initial transcripts |
| Browser | Firefox + the local memo-viewer for live revision preview |
| Communication | GitHub Issues (the single sanctioned external exit point), occasional X/Twitter |
| Docs consumption style | Writes the docs himself; RTFM author rather than reader. Verifies against real code, never against memory. |

---

## Interests outside code

- **Systems thinking and methodology** — reads on agile engineering, planning discipline, evaluator–optimizer loops.
- **Long walks** before dictating — the long, dense initial transcript is part of his process.
- **Note-taking and personal knowledge management** — the memo and wiki concepts grew out of years of this habit.
- **Open-source craftsmanship** — admires clean, minimal public orgs that are understandable without knowing the author.
- **Music while working** — long focus sessions with instrumental sets.

---

## Personality

| Aspect | Value |
|--------|-------|
| Risk appetite (tech) | Medium. Bold in design, conservative when touching the live, daily-productive system — atomic changes, verify, rollback. |
| Learning style | Code tinkerer who writes the spec from verified reality, not from the mental model. |
| Patience threshold | High for his own iteration loops. Very low for unverified claims and "it works now" without a test. |
| Register | Matter-of-fact, precise, evidence-disciplined. Marks estimates as estimates. |
| Values | Authorship and IP ownership, reproducibility, guardrails over speed, hands-off rollout, honest evidence levels. |

---

## Main question

> "How do I publish my own memo methodology as a clean, public, self-explanatory system that secures my authorship — without exposing anything private and without breaking the live system I use every day?"

---

## Primary goals

1. Secure authorship of the methodology by publishing it as a public org, spec, and website before circumstances change.
2. Keep the spec faithful to the **real, verified** system — document what the code actually does, deviations included.
3. Preserve the hands-off rollout property: after finalization, nothing should need manual touching.
4. Make the system understandable to a stranger — no insider knowledge, no personal context required.
5. Protect the live, daily-productive workbench during risky steps (symlink repointing, repo extraction) with verify/rollback.

---

## Pain points

1. A recurring LLM failure: the question-format gets mis-authored (estimated ~40–60% valid, an estimate, not measured) — it is an authoring bug, not a viewer bug.
2. Scope creep — bootstrapping the org must not silently turn into live-skill changes; follow-up work has to stay clearly separated.
3. Disk clutter from un-cleaned worktrees — cleanup is mandatory work, not optional.
4. Context contamination — losing the empty-context guarantee that keeps evaluators honest.
5. Anything that risks leaking private data (paths, secrets) into a now-public org.

---

## Likes

1. The Generate → Execute → Evaluate loop applied at every level (rollout, phase, revision).
2. Evidence discipline: FAKT / ANNAHME / VERMUTUNG tags that force honesty about what is known.
3. Deterministic artifacts — the prompt generator producing a hashable, LLM-free start prompt.
4. A spec that is versioned per directory and never hardcodes the active version.
5. A clean public org modeled on FlowMCP, understandable without knowing the author.

---

## Quotes

> "Code written is not code that works. Nothing is 'done' until a test has run."

> "I write the spec from what the system really does — the seven deviations between my mental model and the code stay in the doc, honestly."

> "After finalization I want to not touch anything. Hands-off is the whole point of the rollout."

> "The question-format breaking is my fault, not the viewer's — the viewer is correct. It's a recurring authoring failure, and I'll say so plainly."

> "Publishing this isn't vanity. It's how authorship of my own method stays demonstrably mine."

---

## Relationships with other personas

### Overlap

- **The Agentic-Tooling Builder:** Both want the methodology written down so it can be reused. Aaron authors it from his own daily practice; the Builder adopts it for their workflow. Every clarity improvement Aaron makes lands directly in the Builder's hands.

- **The Evaluating Decision-Maker:** Both need the system to be self-explanatory without insider context. Aaron writes for that reader; the Decision-Maker is that reader at minute zero. Honest evidence levels serve both — Aaron's discipline is the Decision-Maker's trust signal.

### Conflict

- **The Agentic-Tooling Builder:** Aaron is conservative about touching the live system (verify/rollback, follow-up-work separation), while the Builder wants to adopt and adapt aggressively. The spec must give the Builder enough to build on without inviting them to break the same live-system guarantees Aaron protects.

### Neutral

- **(no real neutrality)** — Aaron is the author of the system every other persona reads, so he has an active stake in each of them.

---

## When would he become a fan?

He already is the system's first believer — he becomes its public advocate when the spec faithfully mirrors the verified system, the org is clean and private-data-free, and a stranger can understand the method from the docs alone. At that point publication has done its job: authorship is secured and the method speaks for itself.

## When would he walk away?

If publication forced the spec to drift from reality (marketing the system instead of describing it), or if the bootstrap silently mutated his live, daily-productive workbench and broke it. A system he can no longer trust to run his own work every day is worthless to him, public or not.
