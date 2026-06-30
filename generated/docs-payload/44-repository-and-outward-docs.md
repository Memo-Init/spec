---
title: "Repository Scaffolding & Outward Documentation"
description: "The git area governs how a repository is committed, secured, identified, and released, but it stops at the repository's surface. The surface itself — the folder layout a new repository is born with,..."
spec_version: "0.1.0"
spec_file: "44-repository-and-outward-docs.md"
order: 44
section: "Specification"
normative: true
generated_at: "2026-06-30T22:23:50.208Z"
generated_from: "draft/memo/0.1.0/spec/44-repository-and-outward-docs.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/44-repository-and-outward-docs.md."
---


The git area governs how a repository is committed, secured, identified, and released, but it stops at the repository's surface. The surface itself — the folder layout a new repository is born with, the structure of its README, the shape of its issues, the org-profile page that lists it, and the prose register of everything a stranger reads — is a separate body of rules, and it is the body this chapter fixes. Where [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/) decides *whether* an artifact may be published and what it must not leak, this chapter decides what a published artifact *looks like*: it owns the structure and mechanics, while the write-policy stays with the communication chapter. The two are complementary and one does not absorb the other.

The unifying idea is that a repository is the first thing an outside reader meets, and a reader who arrives at a half-scaffolded folder, an unstructured README, or an issue that narrates an internal process forms a worse impression than the work deserves. Every convention below exists to make the repository legible to that reader on first contact, without insider context and without a second explanation. The conventions are deliberately fixed and lean toward the deterministic form — a layout a script can scaffold, a README block order a generator can fill, a table a tool renders — for the same reason memo content prefers the deterministic form (see [35-memo-authoring.md](/specification/memo-authoring/)): a fixed shape produced the same way every time does not drift and costs nothing to reproduce.

---

## Repository Scaffolding

A new repository is scaffolded with a **predictable shape** rather than grown ad hoc: a continuous-integration workflow under `.github/workflows/` and the baseline files at the root. A reader who knows the convention knows where to look in any repository that follows it. The language-specific source and test folder layout (for a Node project, a `src/` root and a `tests/` split) is a coding-standard concern governed by the project's own standard (personal-brand/user-preferences), not this org spec — this chapter keeps only the repository-process rules.

The baseline files a scaffolded repository carries:

| File | Role |
|------|------|
| `package.json` | Module manifest — name, description, entry point, and the test scripts the CI workflow invokes. |
| `.gitignore` | Excludes dependencies, environment files (every `.env` except a dummy example), coverage output, OS cruft, and IDE folders. A real environment file is **never** committed. |
| `LICENSE` | The chosen license, present from the first commit. |
| `README.md` | The outward-facing entry document (structured in the next section). |
| `.github/workflows/` | The test-on-push CI workflow that runs the suite with coverage on every push. |

### License Selection Is a Conscious Decision

The license is a **deliberate choice**, never a silent default. The standard posture is that a repository is public and open-source unless declared otherwise, but which permissive license applies — a plain permissive license, one that adds an explicit patent grant, a simplified variant, or a proprietary declaration when the work is *not* to be open — is a decision the author makes consciously and records in the `LICENSE` file from the start. Choosing a license by omission is the failure mode this rule forbids.

### The First-Commits Sequence

A repository is bootstrapped in a fixed three-step commit sequence, so that its history starts legibly rather than as one opaque "initial import":

| Order | Commit | Content |
|-------|--------|---------|
| 1 | Initialize repository | `.gitignore`, `LICENSE`, `package.json` |
| 2 | Add project structure | `src/`, `tests/`, the CI workflow |
| 3 | Add first feature | the initial module plus a basic test |

Each of these commits is a normal commit and follows the canonical commit-message form and issue/identifier mapping defined in [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/) — scaffolding does not get a private commit convention.

### The Test-on-Push Convention

The CI workflow convention is **test on push**: every push runs the test suite with coverage, and the coverage result is reported. The workflow file carries a stable, predictable name so that other tooling — the org-profile generator below among them — can reference it by that name rather than by guessing. The point of pinning the convention is the same as pinning the layout: a fixed name is a name a machine can rely on.

---

## README Structure

A README is the repository's front door and is authored to a **fixed block order**, so that a reader meets the same sequence in every repository and a generator can fill the blocks predictably. The block structure, top to bottom:

| Block | Purpose |
|-------|---------|
| Badges | At-a-glance status — CI result, coverage, contribution stance. |
| Headline | The one-line identity of the module. |
| Description | What the module is and the problem it solves, in prose (see the prose-style section). |
| Architecture diagram | Optional — a diagram when the structure warrants one (below). |
| Quickstart | Clone, install, and a minimal runnable usage example. |
| Features | What the module offers, framed as readable text, not a naked list. |
| Table of contents | Clickable links to the headings and the documented methods. |
| Methods | Per-method documentation in the input/output format below. |
| Contribution | How an outside contributor engages — the invitation to open an issue first. |
| License | The license, linking the `LICENSE` file. |

### Per-Method Input/Output Format

Each public method is documented in a **fixed input/output shape** so the documentation is comparable across methods and across repositories. A method's entry carries: a heading naming the method, a short statement of its purpose, the call signature, an **input table** of the parameters, a minimal example, and a **returns** block describing the output. The input table is the canonical four columns — key, type, description, and whether the parameter is required — with a fifth column only when a parameter has a property (an enumeration, a constraint) that does not fit the four. The returns block is short for a simple result and gains its own output table when the result is a structured object. This is the same "structured payload rendered to a fixed shape" instinct that governs memo tables (see [35-memo-authoring.md](/specification/memo-authoring/)).

### Architecture Diagrams in READMEs

A README **MAY** carry a diagram for architecture, data flow, a process, or module relationships, and **SHOULD** when the structure is non-trivial. The discipline is restraint: a diagram is reserved for a real relationship, not forced onto a trivial two-component link or onto terminal/CLI output, and it stays small enough to read at a glance with every node and edge labeled and a one-sentence lead-in stating what it shows. A diagram that has to be explained twice is not earning its place.

---

## Issue Management

An issue is an outward-facing artifact that a stranger can read, and it exists to coordinate work — which is why [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/) holds it to minimalism. This chapter adds the *structure* an issue takes once it is opened.

### Classification Taxonomy

Every issue is classified into one of three levels, and the level sets the urgency:

| Level | Threshold | Disposition |
|-------|-----------|-------------|
| Blocker | Functional | Functionality is broken — fix immediately. |
| Presentation | Embarrassment | Visible to users and reflects badly even if it functions — fix immediately. |
| Polish | Nice-to-have | Recorded as an issue for later, not an interrupt. |

The classification is what tells a reader, and the author, whether an issue stops the line or waits.

### Issue Content

An issue states the **problem**, the **reproduction** steps that trigger it, and the **expected-versus-actual** pair that pins down the defect — what should happen set against what does. It carries the context a reader needs to act (the affected area, repository, and branch; a proof image for a visual defect) and the references that tie it back, including related issues. It does **not** narrate the internal working steps that led to it; that restraint is the minimalism rule from the communication chapter, and this chapter's content list is everything an issue legitimately holds — no more.

### Commit-to-Issue Referencing

A commit references its issue, and the reference is what threads the published trail together: from a commit one reaches the issue, and a closing keyword on the issue's last commit lets the merge close it. The granularity is deliberately coarse — the default is one issue per phase rather than one per change, so a multi-step body of work produces a handful of issues, not dozens. Fewer, well-scoped issues mean a smaller outward surface, which is the same restraint the communication chapter calls issue minimalism. The exact identifier-to-issue-to-commit mapping is the git area's (see [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)); this chapter only fixes that the reference is mandatory and that the granularity is coarse by default.

---

## Org and User Profile

A profile page — the README shown on an organization's or a user's account landing page — lists the repositories and their live status, and it is **generated, not hand-maintained**. The mechanism is a tracked configuration plus a generator: a structured configuration file declares which repositories appear in which grouped tables, a fixed template declares the page layout with named placeholders, and a generator reads both and writes the final profile README, substituting a rendered status table for each placeholder. A continuous-integration action re-runs the generator on push, so the published page stays current without manual editing.

Two properties make this worth specifying rather than leaving to hand-editing. First, the generated README is **output and is never edited directly** — a manual edit is overwritten on the next generation run, so the configuration and the template are the only things authored by hand. Second, the layout is **fixed**: the author edits the per-repository descriptions and adds a new grouped section when a new family of repositories appears, but the section order and heading hierarchy are intentional and not rearranged casually. This is the same separation the README method tables rely on — a structured source rendered to a fixed shape — applied to the profile page. The status tables themselves draw their badges (CI result, coverage, release, issue counts, license) from the repositories they reference, which is why the repository's CI workflow name has to be the stable, predictable one fixed in the scaffolding section.

---

## Outward Prose Style

The prose in a README description, a project introduction, an application, or landing-page copy follows a **readable middle-ground style**: structured enough to follow without effort, human enough to be worth reading. It sits between rigid enumeration and undifferentiated flowing text — criteria and short lists are welcome, but they serve the prose and never replace it. This style governs narrative outward text; it does not apply to code comments, to specification or API reference material, or to operational checklists, which have their own forms.

The style's working rules:

| Rule | What it means |
|------|---------------|
| Lead with the concrete | Open a paragraph with a specific fact, number, or example before explaining why it matters. |
| Short sentences carry weight | Key statements are short and declarative; longer sentences only connect them. |
| Numbers, not adjectives | Replace vague qualifiers with an actual count or a concrete comparison. |
| Lists serve the paragraph | A list is framed by an introductory sentence; a naked bullet list with no context is forbidden, and a series under three items folds into the sentence. |
| Active voice, named subjects | Name who does what; avoid floating passive constructions and impersonal phrasing. |
| Structure through paragraphs | One idea per paragraph with a concrete opening; reserve numbering for genuine sequences. |
| End with forward momentum | Close on a consequence or the next step, not on a restatement of what was just said. |

Crossing the prose style is the **one-language-per-artifact** rule (see [00-overview.md](/specification/overview/)): an outward document is written in a single publication language and does not mix a second working language into it. A stray label in the inward working language reads as insider noise to the outside reader, exactly as the communication chapter's leak prohibition describes.

---

## Pre-Push Quality

Before a repository's work is pushed, it passes a **pre-push checklist** — the structural counterpart to the security gate the git area runs (see [16-git-security-versioning.md](/specification/git-security-versioning/)). The checklist confirms the repository is fit to be seen and fit to be trusted:

| Check | Requirement |
|-------|-------------|
| Secrets scan | No credential, key, token, or personal datum in **any** file — and this explicitly **includes mock files and test fixtures**. |
| No realistic fakes | A mock value must look **obviously fake**; a realistic credential-shaped string trips secret scanners and draws harvesting bots even when the value is not genuine. |
| Dependency hygiene | No committed dependencies, build artifacts, or coverage output; the lockfile is current and dependencies are not superfluous. |
| Test coverage | Public methods are tested and the suite passes — full success before a push, no exceptions. |
| Relative paths only | No absolute path and no path carrying a username or a system location reaches a published file. |

The secrets-scan rule's distinctive point is that scanners match on **format and entropy, not on truth**: a fabricated string that merely *looks* like a real secret is as harmful as a real one, because it trips the same push-protection and attracts the same automated scans. The defense is to make mock values plainly artificial. This checklist verifies the *structure and content* of what is about to be published; the communication chapter's separate outward review verifies its *direction and register*, and the git area's security gate verifies its *secrets and paths* — the three are layered, not redundant, and a push passes only when all three are clean.

---

## Conformity Requirements

The conventions above are normative, and the binding `MUST`s of each section are authored here **prose-first** as declarative requirements (the prose-first guard, [35-memo-authoring.md](/specification/memo-authoring/)): each rule's `statement` faces generation — it shapes the prompt that scaffolds a repository, fills a README block, or writes an issue — and its `check` faces the pre-push gate, where it verifies a real artifact with a ternary `PASS` / `BLOCKED` / `INCONCLUSIVE`. The structured blocks below are the machine-readable source the requirement store is **harvested** from ([23-requirements.md](/specification/requirements/)); the prose stays the document, and the blocks are its funnel tip. Most are hard structural yes/no rules whose `check` is the whole story (`grade: binary`); the few that judge a quality spectrum — method-doc completeness, diagram restraint, issue minimalism, prose readability — carry an object `grade`, and one carries the honest `todo` where a grade belongs but is not yet calibrated.

### Scaffolding

A scaffolded repository is born with a CI workflow and the baseline root files, which a script can assert by presence — a hard structural rule, so `grade` is `binary`. The language-specific source/test folder layout is out of scope here (it lives in the project coding standard, personal-brand/user-preferences):

```requirement
{
  "id": "REQ-710",
  "title": "Repository carries the CI workflow and baseline root files",
  "statement": "A scaffolded repository MUST carry a continuous-integration workflow under `.github/workflows/` together with the baseline root files `package.json`, `.gitignore`, `LICENSE`, and `README.md`. The language-specific source and test folder layout (for Node, a `src/` root and a `tests/` split) is governed by the project's own coding standard (personal-brand/user-preferences), not this spec.",
  "scope": { "repos": [], "categories": ["repository"], "tags": ["scaffolding"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The directory `.github/workflows/` exists and carries a CI workflow",
      "The root files `package.json`, `.gitignore`, `LICENSE`, and `README.md` all exist"
    ]
  },
  "grade": "binary"
}
```

The module manifest defines the test scripts the CI workflow invokes, read directly from `package.json`, a hard yes/no. The ES-module mode (`"type": "module"`) is a Node language-level choice owned by the project coding standard (personal-brand/user-preferences), not this spec:

```requirement
{
  "id": "REQ-711",
  "title": "package.json defines the CI test scripts",
  "statement": "The repository's `package.json` MUST define the test scripts the CI workflow invokes (a `test` script plus the coverage script the test-on-push workflow runs), so the workflow references them by name rather than guessing. The ES-module mode (`\"type\": \"module\"`) is a Node language-level choice governed by the project's own coding standard (personal-brand/user-preferences), not this spec.",
  "scope": { "repos": [], "categories": ["repository"], "tags": ["scaffolding"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "`package.json` `scripts` defines a `test` script and the coverage script the CI workflow invokes"
    ]
  },
  "grade": "binary"
}
```

The license is a recorded decision, present from the first commit and naming a real license rather than defaulting by omission — a structural rule the `LICENSE` file proves:

```requirement
{
  "id": "REQ-712",
  "title": "A conscious LICENSE is present from the first commit",
  "statement": "A `LICENSE` file MUST be present from the first commit and name a deliberately chosen license (a permissive license, a patent-granting one, a simplified variant, or a proprietary declaration); choosing a license by omission is forbidden.",
  "scope": { "repos": [], "categories": ["repository"], "tags": ["scaffolding"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A `LICENSE` file exists at the repository root",
      "The `LICENSE` file names a recognized license rather than an empty placeholder"
    ]
  },
  "grade": "binary"
}
```

The ignore file keeps dependencies and real environment files out of history — a security-relevant baseline whose absence is a hard block:

```requirement
{
  "id": "REQ-713",
  "title": ".gitignore excludes dependencies and real environment files",
  "statement": "The repository's `.gitignore` MUST exclude installed dependencies, coverage output, OS and IDE cruft, and every environment file except a dummy example, so that a real environment file is never committed.",
  "scope": { "repos": [], "categories": ["repository"], "tags": ["scaffolding"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "`.gitignore` excludes the dependency directory and coverage output",
      "`.gitignore` excludes every `.env` file except the dummy example",
      "No real (non-example) environment file is tracked in the repository"
    ]
  },
  "grade": "binary"
}
```

The history starts in the fixed three-step bootstrap sequence so it reads legibly rather than as one opaque import; this is a presentation nicety on the commit graph, so it gates as a `warning`:

```requirement
{
  "id": "REQ-714",
  "title": "Repository history opens with the three-step bootstrap sequence",
  "statement": "A repository's first three commits MUST follow the bootstrap sequence — initialize the repository (`.gitignore`, `LICENSE`, `package.json`), then add the project structure (`src/`, `tests/`, the CI workflow), then add the first feature with a basic test — rather than a single opaque initial import.",
  "scope": { "repos": [], "categories": ["repository"], "tags": ["scaffolding"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The repository's first three commits correspond to initialize, add-structure, and add-first-feature in that order"
    ]
  },
  "grade": "binary"
}
```

The CI workflow carries the stable, predictable name other tooling references, and it runs the suite with coverage on a current Node runtime — read from the workflow file, a hard yes/no:

```requirement
{
  "id": "REQ-715",
  "title": "A test-on-push CI workflow exists under the stable name",
  "statement": "The repository MUST carry a test-on-push CI workflow under `.github/workflows/` with the stable, predictable filename that the org-profile generator references, and the workflow MUST run the test suite with coverage on the supported Node major version.",
  "scope": { "repos": [], "categories": ["repository"], "tags": ["scaffolding", "ci"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A workflow file with the stable test-on-push filename exists under `.github/workflows/`",
      "The workflow pins the supported Node major version and runs the suite with coverage"
    ]
  },
  "grade": "binary"
}
```

### README Structure

A README is authored to the fixed block order so a reader meets the same sequence everywhere; the presence of the required blocks is a structural rule, gating as a `warning` because a thin README is a presentation defect, not a functional one:

```requirement
{
  "id": "REQ-716",
  "title": "README follows the fixed block order",
  "statement": "Every code-module README MUST carry the fixed block order — badges, headline, description, an optional architecture diagram, quickstart, features, table of contents, methods, contribution, and license — so a reader meets the same sequence in every repository and a generator can fill the blocks predictably.",
  "scope": { "repos": [], "categories": ["readme"], "tags": ["readme"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The README contains a headline, a description, a quickstart, a features block, a table of contents, a methods section, a contribution block, and a license block",
      "The blocks appear in the fixed top-to-bottom order"
    ]
  },
  "grade": "binary"
}
```

The badge row reflects live status and points the CI badge at the test-on-push workflow rather than any release workflow, which is checkable by reading the README markup:

```requirement
{
  "id": "REQ-717",
  "title": "README badges reflect status and reference the test-on-push workflow",
  "statement": "The README badges block MUST carry an at-a-glance status row — CI result, coverage, and contribution stance — and its CI badge MUST reference the test-on-push workflow, never a release-only workflow.",
  "scope": { "repos": [], "categories": ["readme"], "tags": ["readme"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The README opens with a badges block carrying CI, coverage, and contribution badges",
      "The CI badge URL references the test-on-push workflow filename, not a release workflow"
    ]
  },
  "grade": "binary"
}
```

Whether every public method is documented to the fixed input/output shape is a completeness spectrum a fresh-context reviewer judges, so this rule earns an object `grade`:

```requirement
{
  "id": "REQ-718",
  "title": "README documents each public method in the input/output shape",
  "statement": "The README methods section MUST document each public method in the fixed input/output shape — a heading naming the method, its purpose, the call signature, an input table of parameters with the canonical four columns (key, type, description, required), a minimal example, and a returns block that becomes an output table when the result is a structured object.",
  "scope": { "repos": [], "categories": ["readme"], "tags": ["readme", "methods"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer compares the public methods of the module against the README methods section. PASS when every public method has an entry carrying purpose, signature, a four-column input table, an example, and a returns block; BLOCKED when a public method is undocumented or an entry omits the input or returns shape; INCONCLUSIVE when the method surface could not be enumerated.",
    "verify": [
      "Enumerate the module's public methods",
      "Confirm each has a README entry in the input/output shape with the four-column input table"
    ]
  },
  "grade": { "dimension": "method-doc completeness", "weight": 100 }
}
```

A diagram is reserved for a real relationship and stays small and fully labeled; whether a given diagram earns its place is a judgment, so this rule carries an object `grade`:

```requirement
{
  "id": "REQ-719",
  "title": "README architecture diagrams are restrained and fully labeled",
  "statement": "A README diagram MUST be reserved for a genuine architecture, data-flow, process, or module relationship — never forced onto a trivial two-component link or onto terminal output — and it MUST stay small enough to read at a glance, in a fenced block, with every node and edge labeled and a one-sentence lead-in stating what it shows.",
  "scope": { "repos": [], "categories": ["diagram"], "tags": ["readme", "diagram"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer reads each README diagram. PASS when the diagram depicts a non-trivial relationship, is fenced, fits at a glance with every node and edge labeled, and is introduced by a one-sentence lead-in; BLOCKED when it diagrams a trivial link or terminal output, leaves nodes or edges unlabeled, or grows past a glance; INCONCLUSIVE when no diagram is present.",
    "verify": [
      "Locate each diagram in the README",
      "Judge whether it depicts a real relationship and is small, fenced, labeled, and introduced"
    ]
  },
  "grade": { "dimension": "diagram restraint", "weight": 100 }
}
```

### Org and User Profile

The org-profile README is the generator's output and is regenerated on push, so a hand-edit is overwritten — the invariant is that it is never edited directly, a hard structural rule:

```requirement
{
  "id": "REQ-720",
  "title": "The profile README is generated output, never hand-edited",
  "statement": "An organization or user profile README MUST be the generator's output, regenerated on push — it MUST NOT be edited by hand, because a manual edit is overwritten on the next run; only the configuration and the template are authored directly.",
  "scope": { "repos": [], "categories": ["org-profile"], "tags": ["profile"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The generated profile README is produced by the generator from the configuration and template",
      "A CI action re-runs the generator on push so a hand-edit cannot survive"
    ]
  },
  "grade": "binary"
}
```

The generation mechanism is a tracked configuration plus a fixed template plus a generator plus the CI action that re-runs it — all four must be present for the page to stay current:

```requirement
{
  "id": "REQ-721",
  "title": "The profile generation inputs are all present",
  "statement": "A profile repository MUST carry the full generation mechanism — a tracked configuration file declaring the grouped status tables, a fixed template with named placeholders, the generator that reads both and writes the profile README, and the CI action that re-runs the generator on push — so the published page stays current without manual editing.",
  "scope": { "repos": [], "categories": ["org-profile"], "tags": ["profile"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "A tracked configuration file declares the grouped status tables",
      "A template with named placeholders and a generator that consumes both are present",
      "A CI action re-runs the generator on push"
    ]
  },
  "grade": "binary"
}
```

Each status table draws its badges from the repository it references, so every configured workflow path must match a real workflow filename — a cross-file structural assertion:

```requirement
{
  "id": "REQ-722",
  "title": "Profile workflow references match a real workflow filename",
  "statement": "Each profile status-table entry's referenced workflow path MUST exactly match the filename of an existing workflow under that repository's `.github/workflows/`, so the rendered badge resolves rather than pointing at a missing workflow.",
  "scope": { "repos": [], "categories": ["org-profile"], "tags": ["profile"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Every workflow path declared in the profile configuration matches an existing workflow filename in the referenced repository"
    ]
  },
  "grade": "binary"
}
```

### Issue Management

An opened issue carries the fixed content shape — its classification plus problem, reproduction, expected-versus-actual, and context — which a reader of the issue body can confirm:

```requirement
{
  "id": "REQ-723",
  "title": "An issue carries its classification and the fixed content shape",
  "statement": "Every issue MUST carry its classification level (blocker, presentation, or polish) and the fixed content shape — the problem, the reproduction steps, the expected-versus-actual pair, and the context a reader needs to act (affected area, repository, branch, and a proof image for a visual defect).",
  "scope": { "repos": [], "categories": ["issue"], "tags": ["issue"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The issue states a classification level",
      "The issue body carries problem, reproduction, expected-versus-actual, and context"
    ]
  },
  "grade": "binary"
}
```

Whether an issue stays outward-minimal — stating the defect without narrating the internal working steps that led to it — is a register judgment a reviewer makes, so this rule earns an object `grade`:

```requirement
{
  "id": "REQ-724",
  "title": "An issue is outward-minimal and does not narrate internal process",
  "statement": "An issue MUST stay outward-minimal: it states the defect and the context a stranger needs, and it MUST NOT narrate the internal working steps that produced it, since an issue is an outward-facing artifact a stranger reads.",
  "scope": { "repos": [], "categories": ["issue"], "tags": ["issue"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer reads the issue as an outsider. PASS when the issue holds only the defect, reproduction, expected-versus-actual, and acting context; BLOCKED when it narrates internal working steps or insider process; INCONCLUSIVE when the issue body could not be read.",
    "verify": [
      "Read the issue body and comments as an outsider",
      "Judge whether any internal process narration is present"
    ]
  },
  "grade": { "dimension": "issue minimalism", "weight": 100 }
}
```

In a published repository a commit references its issue so the outward trail threads together, and the granularity is coarse by default; the presence of the reference is checkable on the commit, while the exact identifier mapping stays with the git area. Whether a unit of work references an issue at all is governed by Rule C1 ([17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)): a local-only repo orients by memo-ID and creates no outward issue, so the rule below is the published-repo case, not a universal one:

```requirement
{
  "id": "REQ-725",
  "title": "A published-repo commit references its issue (Rule C1)",
  "statement": "In a published (outward) repository, a commit MUST carry a reference to the issue it belongs to, so that from a commit a reader reaches the issue and a closing keyword can let the merge close it; the default granularity is one issue per phase, keeping the outward surface small. This is the published-repo half of Rule C1 (17-git-workflow-and-ids.md): a local-only (never-pushed) repo creates no outward issue and orients by memo-ID instead, so this rule MUST NOT be read as requiring an issue in a repository that is never published.",
  "scope": { "repos": [], "categories": ["repository"], "tags": ["issue", "commit"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "In a published repo, each commit message carries a reference to its issue",
      "The issue granularity is coarse (about one issue per phase, not one per change)",
      "A local-only repo is not required to carry an issue reference (it orients by memo-ID per Rule C1)"
    ]
  },
  "grade": "binary"
}
```

### Outward Prose Style

An outward document is written in a single publication language with no second working language mixed in; whether a stray inward-language label reads as insider noise is a register call, and a calibrated grade belongs here but is not yet written, so the slot is the honest `todo`:

```requirement
{
  "id": "REQ-726",
  "title": "An outward document holds to one publication language",
  "statement": "An outward document — a README, a project introduction, an application, or landing-page copy — MUST be written in a single publication language and MUST NOT mix a second working language into it; a stray inward-language label reads as insider noise to the outside reader.",
  "scope": { "repos": [], "categories": ["blog"], "tags": ["outward-prose"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer reads the document for language purity. PASS when the whole document is in one publication language; BLOCKED when a second working language is mixed in; INCONCLUSIVE when the document could not be read.",
    "verify": [
      "Read the outward document end to end",
      "Flag any stray second-language label or phrase"
    ]
  },
  "grade": "todo"
}
```

The narrative outward prose follows the readable middle-ground style — concrete openings, short declarative key statements, numbers over adjectives, lists that serve the paragraph, active voice, and a forward-momentum close; how well it does is a quality spectrum, so this rule carries an object `grade`:

```requirement
{
  "id": "REQ-727",
  "title": "Outward prose follows the readable middle-ground style",
  "statement": "Narrative outward prose MUST follow the readable middle-ground style — lead each paragraph with a concrete fact, number, or example; keep key statements short and declarative; replace vague adjectives with concrete numbers; frame every list with an introductory sentence and fold a sub-three-item series into the sentence; use active voice with named subjects; and close on a consequence rather than a self-summary.",
  "scope": { "repos": [], "categories": ["blog"], "tags": ["outward-prose"] },
  "severity": "info",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer scores the prose against the middle-ground style rules. PASS when paragraphs open concretely, key statements are short, numbers replace vague adjectives, lists are framed, voice is active, and sections end with forward momentum; BLOCKED when the text drifts into naked bullet lists, passive impersonal phrasing, warm-up filler, or summary endings; INCONCLUSIVE when no narrative prose is present.",
    "verify": [
      "Read the narrative outward prose",
      "Score it against the readable middle-ground style rules"
    ]
  },
  "grade": { "dimension": "prose readability", "weight": 100 }
}
```

### Pre-Push Quality

The secrets scan is a tool gate over every file, mocks and fixtures included, and it matches on format and entropy rather than truth, so a realistic-looking fake fails as hard as a real secret — a hard yes/no run by the security tool:

```requirement
{
  "id": "REQ-728",
  "title": "No secret or realistic fake survives the pre-push scan",
  "statement": "Before a push, no credential, key, token, client identifier, or personal datum MUST appear in any file — explicitly including mock files and test fixtures — and a mock value MUST look obviously fake, because a realistic-looking fabricated secret trips the same push-protection and harvesting scans as a real one.",
  "scope": { "repos": [], "categories": ["repository"], "tags": ["pre-push", "security"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "git-security",
    "tactic": "secrets-format-entropy-scan",
    "verify": [
      "Scan every staged file, including mocks and fixtures, for credential-shaped strings by format and entropy",
      "BLOCK when any real or realistic-looking secret is found"
    ]
  },
  "grade": "binary"
}
```

A published file carries only relative paths, never an absolute path or one bearing a username or system location — a structural scan over the file content:

```requirement
{
  "id": "REQ-729",
  "title": "Only relative paths reach a published file",
  "statement": "No absolute path, and no path carrying a username or a system location, MUST reach a published file; outward code and configuration use relative paths only.",
  "scope": { "repos": [], "categories": ["repository"], "tags": ["pre-push", "paths"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No tracked file carries an absolute filesystem path",
      "No tracked file carries a path containing a username or a system location"
    ]
  },
  "grade": "binary"
}
```

The repository commits no dependencies, build artifacts, or coverage output, and its lockfile is current with no superfluous dependencies — a structural state check over the tree:

```requirement
{
  "id": "REQ-730",
  "title": "Dependency hygiene holds before a push",
  "statement": "Before a push, the repository MUST NOT commit installed dependencies, build artifacts, or coverage output, and its lockfile MUST be current with no superfluous dependencies.",
  "scope": { "repos": [], "categories": ["repository"], "tags": ["pre-push", "dependencies"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No dependency directory, build artifact, or coverage output is tracked",
      "The lockfile is current and the dependency set carries no superfluous entries"
    ]
  },
  "grade": "binary"
}
```

The public methods are tested and the suite passes in full before a push — a hard outcome verified by running the suite with coverage:

```requirement
{
  "id": "REQ-731",
  "title": "The test suite passes with public methods covered",
  "statement": "Before a push, the repository's test suite MUST pass in full with no failures, and the public methods MUST be exercised by the coverage run — full success before a push, no exceptions.",
  "scope": { "repos": [], "categories": ["repository"], "tags": ["pre-push", "tests"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "npm",
    "tactic": "test-suite-coverage-run",
    "verify": [
      "Run the repository test suite with coverage",
      "Assert zero failures and that every public method is exercised"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [16-git-security-versioning.md](/specification/git-security-versioning/) — the deterministic git flow and the security gate the pre-push checklist complements.
- [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/) — the commit-message form, the identifier-to-issue mapping, and the commit-to-issue reference this chapter's scaffolding and issues rely on.
- [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/) — the outward write-policy and leak prohibition; this chapter adds the structure, that chapter keeps the policy.
- [35-memo-authoring.md](/specification/memo-authoring/) — the deterministic-form and generated-table instinct that the README and profile-page mechanics share.
- [24-tools-registry.md](/specification/tools-registry/) — the tool catalog that the scaffolding and generation steps draw on.
- [00-overview.md](/specification/overview/) — conformance language and the one-language-per-artifact rule.
</content>
</invoke>
