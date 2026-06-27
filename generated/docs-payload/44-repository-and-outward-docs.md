---
title: "Repository Scaffolding & Outward Documentation"
description: "The git area governs how a repository is committed, secured, identified, and released, but it stops at the repository's surface. The surface itself — the folder layout a new repository is born with,..."
spec_version: "0.1.0"
spec_file: "44-repository-and-outward-docs.md"
order: 44
section: "Specification"
normative: true
generated_at: "2026-06-27T21:21:21.605Z"
generated_from: "spec/v0.1.0/44-repository-and-outward-docs.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/44-repository-and-outward-docs.md."
---


The git area governs how a repository is committed, secured, identified, and released, but it stops at the repository's surface. The surface itself — the folder layout a new repository is born with, the structure of its README, the shape of its issues, the org-profile page that lists it, and the prose register of everything a stranger reads — is a separate body of rules, and it is the body this chapter fixes. Where [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/) decides *whether* an artifact may be published and what it must not leak, this chapter decides what a published artifact *looks like*: it owns the structure and mechanics, while the write-policy stays with the communication chapter. The two are complementary and one does not absorb the other.

The unifying idea is that a repository is the first thing an outside reader meets, and a reader who arrives at a half-scaffolded folder, an unstructured README, or an issue that narrates an internal process forms a worse impression than the work deserves. Every convention below exists to make the repository legible to that reader on first contact, without insider context and without a second explanation. The conventions are deliberately fixed and lean toward the deterministic form — a layout a script can scaffold, a README block order a generator can fill, a table a tool renders — for the same reason memo content prefers the deterministic form (see [35-memo-authoring.md](/specification/memo-authoring/)): a fixed shape produced the same way every time does not drift and costs nothing to reproduce.

---

## Repository Scaffolding

A new repository is scaffolded into a **standard folder layout** rather than grown ad hoc. The layout makes the repository's shape predictable across projects: source under a `src/` root, tests under a `tests/` root split into unit, integration, and helper areas, a continuous-integration workflow under `.github/workflows/`, and the baseline files at the root. A reader who knows the layout knows where to look in any repository that follows it.

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

## Related

- [16-git-security-versioning.md](/specification/git-security-versioning/) — the deterministic git flow and the security gate the pre-push checklist complements.
- [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/) — the commit-message form, the identifier-to-issue mapping, and the commit-to-issue reference this chapter's scaffolding and issues rely on.
- [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/) — the outward write-policy and leak prohibition; this chapter adds the structure, that chapter keeps the policy.
- [35-memo-authoring.md](/specification/memo-authoring/) — the deterministic-form and generated-table instinct that the README and profile-page mechanics share.
- [24-tools-registry.md](/specification/tools-registry/) — the tool catalog that the scaffolding and generation steps draw on.
- [00-overview.md](/specification/overview/) — conformance language and the one-language-per-artifact rule.
</content>
</invoke>
