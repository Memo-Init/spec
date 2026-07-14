# 21. scripts/

| | |
|---|---|
| Status | Draft |
| Depends on | [12-folders.md](./12-folders.md), [20-cli.md](./20-cli.md) |
| Related | [00-overview.md](./00-overview.md), [22-config.md](./22-config.md), [23-hooks-contract.md](./23-hooks-contract.md), [24-skills-scope.md](./24-skills-scope.md), [The SOP common denominator](/session/common-denominator/) |

A project's `scripts/` folder holds the executable entry points that bring its environment up, tear it down, and check that it is healthy. This chapter specifies the script family, the boot contract that keeps service startup declarative, and the workbench-level health scripts that verify the workbench setup itself.

---

## Folder Contract

`scripts/` is a registered (mandatory) folder, and this page is its per-folder entry:

| Field | Value |
|-------|-------|
| Name | `scripts/` |
| Status | Mandatory |
| Level | Project |
| Entry-point | meaningful sub-folders |
| Convention | startup-script convention |
| Purpose | Environment and health scripts — the project's bring-up, tear-down, health, and session-lifecycle entry points. |
| Goes in | The lifecycle script family — `dev.sh` / `staging.sh` (bring-up), `cleanup.sh` (tear-down), `health-check.sh` (health), and the `start-the-plane` / `land-the-plane` session-lifecycle pair — each under a meaningful subfolder. |
| Does not | A flat pile of scripts at the `scripts/` root; non-script material. |

> The Folder Contract follows the fixed per-folder shape defined in the session conventions ([session/13-conventions.md](/session/conventions/)); its first six fields mirror this folder's row in the central contract table ([12-folders.md](./12-folders.md)).

---

## The Script Family

A project's environment is operated through a small, named family of scripts. The names are conventional so that an agent or a developer knows what to run without reading each one:

| Script | Role |
|--------|------|
| `dev.sh` | Bring the project up for local development. |
| `staging.sh` | Bring the project up in a staging configuration. |
| `cleanup.sh` | Tear the environment down and remove transient state. |
| `health-check.sh` | Verify that the environment is in working order. |
| `start-the-plane` | The **session-start ritual** — bring the workspace to a known-good baseline at the start of work. |
| `land-the-plane` | The **Landing-the-Plane ritual** — the end-of-work close-down (tidy, chronicle, handover) before a session is put down. |

The last two are the **session-lifecycle** members of the family: `start-the-plane` opens a
session and `land-the-plane` closes it (the Landing-the-Plane SOP,
[27-landing-the-plane.md](/session/landing-the-plane/)). They live in the same `scripts/` storage
and follow the same subfolder convention as the rest of the family.

Scripts **MUST** live in **meaningful subfolders** of `scripts/`, not as a flat pile at the top level. A bare `dev.sh` says too little about *which* environment it starts; the **subfolder name carries the meaning** (for example `scripts/rails/dev.sh`). This is the same convention the CLI chapter applies to commands — meaning lives in the name, not in a comment (see [20-cli.md](./20-cli.md)), and it connects to the About convention that documents what a scripts subfolder does.

### The Storage Location — `scripts/`

`scripts/` is the **defined storage location** for the whole lifecycle family — the bring-up
(`dev.sh` / `staging.sh`), the tear-down (`cleanup.sh`), the health check (`health-check.sh`), and
the session-lifecycle pair (`start-the-plane` / `land-the-plane`). All of them live under
`scripts/`, each in a meaningful subfolder (REQ-966), so there is **one** answer to "where do this
project's lifecycle scripts live?". Because the location is defined here once, a project's SOP
**references** `scripts/` rather than re-listing the scripts inline — a runbook or project-SOP skill
points at `scripts/` for the start / stop / `start-the-plane` / `land-the-plane` scripts instead of
duplicating them.

### Stage Scripts Pair With Stage env Files

A stage's bring-up script and its environment file share the **same stage word**: `dev.sh` pairs
with `.development.env`, `staging.sh` with `.staging.env`. The env-file naming schema
`<name>.<stage>.env` is *defined* in the session config cascade
([05-config-cascade.md](/session/config-cascade/)) — this is only the cross-reference from the
script side; the schema and its read-only doctor check are not duplicated here.

---

## The Boot Contract

Service startup is **declarative**. A project **declares** the services it runs and the ports they use; the agent then calls the project's startup script rather than composing an ad-hoc boot sequence inline.

- A project **MUST** declare its services and ports in a place the startup script reads, and the agent **MUST** boot the project by invoking that script.
- Inlining the boot sequence — starting services by hand in whatever order, with literal ports, outside the declared contract — is an **anti-pattern**. It hides what the project actually runs, drifts from the declaration, and cannot be checked. The declared-and-scripted path is the only conformant one.

The contract keeps the question "what does this project run, and how do I start it?" answerable from one place, and keeps the health check (below) meaningful, because it checks the same declared services.

---

## Workbench-Health-Scripts

Beyond a single project's `health-check.sh`, the **workbench level** has its own health scripts that verify the *setup of the workbench itself* — that the projects are correctly constituted, independent of whether any one project's services run. Typical checks:

- Does every repository under each project's `repos/` have a `.git`?
- Does every repository have a configured remote?
- Does each project carry the mandatory folders (see [12-folders.md](./12-folders.md))?

These checks **categorize** the workbench state rather than building anything. They are the workbench's realization of the **Health** part of the common SOP denominator (see [the SOP common denominator](/session/common-denominator/)): a definite, observable answer to "is this scope in order?". The workbench-SOP's Health step is exactly this family of checks.

---

## Workbench-Health as a Deterministic SOP Method

Workbench-Health is **the Health method** of the workbench-SOP made concrete: the checks above are not advisory inspections but **deterministic tests** that produce a definite answer — **pass**, **fail**, or **report** — over the workbench scope. Determinism is the point: the same workbench in the same state always yields the same verdict, so "is this scope in order?" is answered the same way by a human, an agent, or a CI step. The check family is the workbench's realization of the common SOP standard's Health part ([the SOP common denominator](/session/common-denominator/)) and is what [24-skills-scope.md](./24-skills-scope.md) routes the workbench's Health responsibility to.

Two deterministic checks carry the method:

- **Folder placement.** Every **mandatory registered folder** **MUST** be present and at the **right level** — a root-level folder at the root, a per-project folder under its project (the level split is drawn in [10-root-and-projects.md](./10-root-and-projects.md); the per-project layout is the authoritative contract in [12-folders.md](./12-folders.md)). The check is two-directional: a missing mandatory folder is a **fail**, and an **unexpected top-level entry** — something present that the registered layout does not account for — is **flagged** in the report. The structure is verified against the declared layout, not against a guess.

- **Repo-status correctness.** Each repository's **declared status** — the three axes `visibility` / `remote` / `facing` ([22-config.md](./22-config.md)) — **MUST match reality**. A repository declared `outward` **MUST** actually have its named remote; one declared `inward` **MUST** have no remote (or `none`). A declaration that contradicts the repository's real git state is a **fail**. This is the **verification side** of the declared-status work: [22-config.md](./22-config.md) is where the status is *declared*, and the inward-push gate ([23-hooks-contract.md](./23-hooks-contract.md)) *reads* the declaration to decide a push — Workbench-Health (together with **git-security**) is what keeps that declaration **honest**, so the gate consumes a record that has been checked against reality rather than trusted.

Because both checks are deterministic (pass / fail / report), Workbench-Health is the structural verification half of the workbench's two deterministic mechanisms — paired with the hook-based gating of [23-hooks-contract.md](./23-hooks-contract.md). It builds nothing and decides nothing about content quality; it answers, definitively, whether the workbench's structure and its declared repo statuses are in order.

---

## Direction — Self-Healing Workbench (Informative)

> **Informative.** This subsection records a **direction only** and is forward-looking. The mechanism is **deferred** to a later revision / rollout and is **not** specified or built here.

The deterministic Health method above *detects* that the workbench is out of order; the longer-term direction is for the workbench to also *act* on what it detects — to **self-heal** and, eventually, **self-evolve**. The motivating case is capability rather than structure: when a need surfaces at the **workbench level** — for instance during *Landing the Plane*, where a recurring gap in the tooling becomes visible — the workbench should be able to **add the missing capability (a skill) on demand**, rather than the operator hand-rolling it every time. The aim is to step out of the manual "rat race" in which the same gap is patched by hand session after session.

This is named as an aspiration so the spec is honest about where it points, **without over-specifying a mechanism**: how a need is detected, how a capability is proposed, and what guardrails (no-auto-write, human acceptance) bound an automatic addition are **left open** for a future revision. The PRD-able, buildable part of this chapter is the deterministic folder-placement and repo-status tests above; self-healing is the direction those tests point toward, not a commitment made here.

---

## Conformity Requirements

The script-folder rules are checkable, and the boot contract is judged against the declared-and-scripted path. The blocks below encode this chapter's binding rules prose-first — each `statement` faces how scripts are laid out and how a project is booted, each `check` faces the structure audit and the boot path. The Workbench-Health folder-placement and repo-status tests are not restated here — they are owned as conformity rules on their home pages ([12-folders.md](./12-folders.md), [15-repos.md](./15-repos.md)). These blocks are the source the requirement store is harvested from ([23-requirements.md](/specification/requirements/)).

That scripts live in meaningful subfolders is a structural fact:

```requirement
{
  "id": "REQ-966",
  "title": "Scripts live in meaningful subfolders, not a flat pile",
  "statement": "A project's scripts MUST live in meaningful subfolders of `scripts/`, not as a flat collection at the top level — the subfolder name carries the meaning a bare `dev.sh` cannot (for example `scripts/rails/dev.sh`). The meaning lives in the folder name, the same self-describing principle the CLI convention applies to commands.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["scripts", "structure"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No executable script sits directly at the `scripts/` root",
      "Each script lives under a named, meaningful subfolder of `scripts/`"
    ]
  },
  "grade": "binary"
}
```

Whether a project boots through its declared script rather than an inline sequence is a behavioural rule a reviewer judges, so this block earns an object `grade`:

```requirement
{
  "id": "REQ-967",
  "title": "Service startup is declarative, never inlined",
  "statement": "A project MUST declare its services and ports in a place the startup script reads, and the agent MUST boot the project by invoking that script. Inlining the boot sequence — starting services by hand, with literal ports, outside the declared contract — is an anti-pattern: it hides what the project runs, drifts from the declaration, and cannot be checked. The declared-and-scripted path is the only conformant one.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["scripts", "boot-contract"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A reviewer inspects how the project is brought up. PASS when services and ports are declared and boot runs through the startup script; BLOCKED when a boot sequence is composed inline with literal ports outside the declared contract; INCONCLUSIVE when the project declares no services to boot.",
    "verify": [
      "Locate the declared services/ports and the startup script that reads them",
      "Confirm boot invokes the script rather than an inline sequence"
    ]
  },
  "grade": { "dimension": "boot-contract adherence", "weight": 100 }
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [20-cli.md](./20-cli.md) — the meaningful-subfolder convention, shared with the CLI.
- [12-folders.md](./12-folders.md) — the `scripts/` folder and the mandatory per-project layout the folder-placement check verifies.
- [10-root-and-projects.md](./10-root-and-projects.md) — the root-vs-project level split the folder-placement check tests against.
- [22-config.md](./22-config.md) — where each repository's three-axis status is *declared*; Workbench-Health verifies the declaration matches reality.
- [23-hooks-contract.md](./23-hooks-contract.md) — the inward-push gate that *reads* the declared status; Workbench-Health and git-security keep that declaration honest.
- [24-skills-scope.md](./24-skills-scope.md) — the workbench-SOP's Health responsibility that routes to this chapter's deterministic checks.
- [The SOP common denominator](/session/common-denominator/) — Setup, Health, Update; the health scripts realize Health.
