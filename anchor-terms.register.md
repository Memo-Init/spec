# Anchor-Term Register

> **Informative.** This page is rendered deterministically from `data/anchor-terms.json` by
> `scripts/generate-anchor-register.mjs`. Do not hand-edit — edit the store and re-render. The register is a
> policy-block adjunct of the meta-spec anchor-term convention (`06-conventions-writing.md`),
> not a new registry primitive.

Provenance: generated from commit `317b4e88b69f94e8f0dd62b9ce621d549cf03377`.

**14** anchor terms, registered under `/session/namespace-registry/`.

| id | label | owning chapter | version |
|----|-------|----------------|---------|
| `AT-memo` | **Memo** | memo / 06-memo-structure | 1.0.0 |
| `AT-revision` | **Revision** | memo / 07-revisions-and-questions | 1.0.0 |
| `AT-topic` | **Topic** | memo / 04-input-pipeline | 1.0.0 |
| `AT-goal` | **Goal** | memo / 31-goals | 1.0.0 |
| `AT-block` | **Block** | memo / 08-phases-and-prds | 1.0.0 |
| `AT-prd` | **PRD** | memo / 08-phases-and-prds | 1.0.0 |
| `AT-phase` | **Phase** | memo / 08-phases-and-prds | 1.0.0 |
| `AT-strand` | **Strand** | memo / 25-strands | 1.0.0 |
| `AT-requirement` | **Requirement** | memo / 23-requirements | 1.0.0 |
| `AT-tool` | **Tool** | memo / 24-tools-registry | 1.0.0 |
| `AT-plan` | **Plan** | memo / 42-plans | 1.0.0 |
| `AT-role-user` | **User Role** | meta-spec / 10-harness-registry | 1.0.0 |
| `AT-role-orchestrator` | **Orchestrator Role** | meta-spec / 10-harness-registry | 1.0.0 |
| `AT-role-worker` | **Worker Role** | meta-spec / 10-harness-registry | 1.0.0 |

---

### Memo — `AT-memo`

- **Definition:** A versioned strategy document and the single highest authority over its own rollout; its content is local and MUST NOT be uploaded.
- **Not:** NOT a shareable or uploadable document, and NOT a cross-memo container — a memo has authority over its OWN rollout; the cross-memo span belongs to a goal or a plan.
- **Owning chapter:** memo / 06-memo-structure (AT2)
- **Known mis-labels:** `document`, `spec doc`, `note`
- **Version:** 1.0.0

### Revision — `AT-revision`

- **Definition:** One immutable snapshot of a memo's content, stored as REV-XX.md; each change produces a new file, so the history is forward-only.
- **Not:** NOT an in-place edit — a revision is never mutated; a change is always a new REV-XX file.
- **Owning chapter:** memo / 07-revisions-and-questions (AT2)
- **Known mis-labels:** `version`, `edit`, `draft`
- **Version:** 1.0.0

### Topic — `AT-topic`

- **Definition:** An atomic point extracted from the input during the five-step input pipeline; the complete topic list serves as a writing checklist and is the head of the Topic to Block to PRD chain.
- **Not:** NOT too small to omit and NOT cross-memo — extraction is exhaustive and topics are memo-scoped.
- **Owning chapter:** memo / 04-input-pipeline (AT2)
- **Known mis-labels:** `point`, `item`, `note`
- **Version:** 1.0.0

### Goal — `AT-goal`

- **Definition:** A cross-memo intent (id G###) that spans several memos and outlives any one; defined by intent not surface, and scored in a fresh context against real state.
- **Not:** NOT scoped inside one memo and NOT surface-defined — a goal spans the memo sequence and is never scored in the session that did the work.
- **Owning chapter:** memo / 31-goals (AT2)
- **Known mis-labels:** `milestone`, `task`, `objective`
- **Version:** 1.0.0

### Block — `AT-block`

- **Definition:** A structure node inside a memo carrying its own B### identifier; it references one or more topics and is the unit PRDs are derived from.
- **Not:** NOT a synonym for a context block — it is an addressable structure node with a B### id, not a chunk of prose context.
- **Owning chapter:** memo / 08-phases-and-prds (AT2)
- **Known mis-labels:** `context block`, `section`, `chunk`
- **Version:** 1.0.0

### PRD — `AT-prd`

- **Definition:** A block-derived chunk of work sized so one PRD fits into one context (hard cap one third, smart-zone one quarter) and is implementable by one agent in one thread.
- **Not:** NOT a multi-thread or multi-context unit — if work needs a second thread, that is the signal to chunk into more PRDs, not to span one PRD across threads.
- **Owning chapter:** memo / 08-phases-and-prds (AT2)
- **Known mis-labels:** `task`, `ticket`, `story`
- **Version:** 1.0.0

### Phase — `AT-phase`

- **Definition:** A sequential, mandatory unit of the rollout that bundles PRDs executed together and in order, carrying an orchestration role and a mandatory depends-on.
- **Not:** NOT optional and NOT parallel by default — a phase is mandatory and sequential; depends-on is a required characteristic, not decoration.
- **Owning chapter:** memo / 08-phases-and-prds (AT2)
- **Known mis-labels:** `stage`, `step`, `milestone`
- **Version:** 1.0.0

### Strand — `AT-strand`

- **Definition:** The emergent dependency closure over phases — the transitive closure of the depends-on edges, derived by walking the graph, never authored.
- **Not:** NOT authored and NOT a thematic bundle — a strand is emergent, and it is a tag, never part of the numeric memo ID.
- **Owning chapter:** memo / 25-strands (AT2)
- **Known mis-labels:** `thread`, `track`, `theme`
- **Version:** 1.0.0

### Requirement — `AT-requirement`

- **Definition:** A single addressable statement that must, should, or may hold; two-sided (statement faces generation, check faces the gate) with an optional grade axis, resolving to a ternary status.
- **Not:** NOT one-sided and NOT self-graded — a requirement faces both generation and the gate, a check that did not run MUST NOT report PASS, and the doer MUST NOT be the grader.
- **Owning chapter:** memo / 23-requirements (AT2)
- **Known mis-labels:** `rule`, `constraint`, `spec`
- **Version:** 1.0.0

### Tool — `AT-tool`

- **Definition:** An external capability a phase or PRD depends on, recorded as a descriptor in the per-project tools registry that says that a tool exists, what it is for, and where it lives.
- **Not:** NOT a runtime and NOT an enforced gate — the registry is descriptive and a RECOMMENDATION; a memo MUST NOT be blocked solely because no registry is present.
- **Owning chapter:** memo / 24-tools-registry (AT2)
- **Known mis-labels:** `service`, `dependency`, `integration`
- **Version:** 1.0.0

### Plan — `AT-plan`

- **Definition:** The execution-side primitive above the single memo: it spans one or more finalized memos and sequences their phases into a single ordered run (id PLAN-###-slug).
- **Not:** NOT a replacement for the per-memo stage model — a plan nests the four stages per carried memo; and phase order stays the memo's to decide (memo authority).
- **Owning chapter:** memo / 42-plans (AT2)
- **Known mis-labels:** `roadmap`, `project`, `backlog`
- **Version:** 1.0.0

### User Role — `AT-role-user`

- **Definition:** The interactive role in the harness tool-contract roles{} (10-harness-registry): the surface a developer drives directly; it adds the interaction tool to core.required[] and is the top-level trust reference the other two roles are bounded under.
- **Not:** NOT the same as a 'User session' type — the role is the tool-contract delta in roles.user, while the session type is the session-tier classification that anchors trust; and NOT a self-granted privilege.
- **Owning chapter:** meta-spec / 10-harness-registry (AT2)
- **Known mis-labels:** `interactive agent`, `human`, `operator`
- **Version:** 1.0.0

### Orchestrator Role — `AT-role-orchestrator`

- **Definition:** The coordinating role in the harness tool-contract roles{} (10-harness-registry): it adds the coordination tools to core.required[] and carries the gate-dependent taskCrud marker; it runs work on the user's behalf and MUST NOT exceed the user's trust level.
- **Not:** NOT a new authority — the orchestrator is the user's context continued into coordination, bounded by monotonicity, never a separate higher privilege; and NOT the same as the agent-team 'Lead' name (13-orchestration), which is one deployment of this role.
- **Owning chapter:** meta-spec / 10-harness-registry (AT2)
- **Known mis-labels:** `lead`, `coordinator`, `manager`
- **Version:** 1.0.0

### Worker Role — `AT-role-worker`

- **Definition:** The scoped-execution role in the harness tool-contract roles{} (10-harness-registry): it adds structured-output and removes the coordination tools, executing one bounded unit of work in an isolated context.
- **Not:** NOT an orchestrator — a worker cannot coordinate a team or spawn one; and NOT a persistent identity — a worker is a scoped, one-unit execution, bounded below the orchestrator that started it.
- **Owning chapter:** meta-spec / 10-harness-registry (AT2)
- **Known mis-labels:** `subagent`, `executor`, `agent`
- **Version:** 1.0.0
