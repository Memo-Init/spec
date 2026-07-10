# 18. Multidimensionality

| Field | Value |
|-------|-------|
| Status | Draft |
| Depends on | [17-git-workflow-and-ids.md](./17-git-workflow-and-ids.md) |
| Related | [16-git-security-versioning.md](./16-git-security-versioning.md), [13-orchestration.md](./13-orchestration.md), [08-phases-and-prds.md](./08-phases-and-prds.md), [00-overview.md](./00-overview.md) |

A single memo can coordinate work across **multiple repositories** at once. This is the multidimensional property of the memo system: the memo is the planning unit, and a planning unit naturally spans every repository a feature touches. The bootstrap memo of this very specification is an example — it coordinates the spec repo, the org-profile repo, the website repo, the viewer repo, the prompt-generator repo, and the core repo simultaneously.

This chapter fixes the recommended boundary of that coordination so the multi-repo reach does not blur the context it operates in.

---

## One Memo, Many Repos

A memo **MAY** coordinate several repositories. Each affected repository receives its own pull request (see [17-git-workflow-and-ids.md](./17-git-workflow-and-ids.md)); the memo's phases and PRDs span the repositories, and the dependency tree (`## Phase-Hints`) expresses which cross-repo work can run in parallel and which must wait.

This is what lets a feature be planned once and executed coherently across its full footprint, instead of being split into disconnected per-repo plans that drift apart.

---

## Project-Internal Default

Multi-repo coordination is **recommended only within the project and its repositories**. A memo lives in a project (`projects/{name}/.memo/`) and SHOULD coordinate only the repositories of that project (`projects/{name}/repos/`).

- Crossing the project boundary — a memo coordinating repositories that belong to a different project — is **possible** but is the exception, not the default. Exceptions MAY be made when a genuine cross-project dependency exists.
- The reason for the restriction is **context and state preservation**: a memo is a time document of project evolution — a persistent knowledge artifact that records decisions, rationale, and open questions at the moment they were made. A memo that reaches across projects blurs the context it is reasoning in, and exposes that record to contamination from changes in external repositories. Keeping coordination project-internal keeps the context sharp and the historical record intact (see [13-orchestration.md](./13-orchestration.md) and the context-rot model).

The system thinks in **projects** rather than in loose repositories: the project is the boundary of a coherent context, and the memo coordinates inside it.

---

## No Monorepo, One Domain per Repo

The multi-repo model is explicitly **not** a monorepo. Each repository owns **one domain**.

- A memo coordinating several repositories MUST NOT be read as a license to merge them into a monorepo. The repositories stay separate; the memo coordinates across the separation.
- One domain per repository keeps each repository's purpose clear and its dependency surface small. A repository that accreted several domains would re-create exactly the context-blurring the project-internal default is meant to avoid.
- Memos are time documents of project evolution: they record the state of knowledge and decisions at a point in time. Keeping each repository single-domain protects memo integrity — changes to an unrelated domain cannot retroactively contaminate a memo's historical record or distort future re-evaluation of past decisions.

The coordination happens at the **memo** level (the planning unit), not at the repository level (the code unit). The memo is multidimensional; each repository remains single-domain.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [17-git-workflow-and-ids.md](./17-git-workflow-and-ids.md) — the per-repo pull request and the memo-ID trail that ties the repositories together.
- [16-git-security-versioning.md](./16-git-security-versioning.md) — the deterministic git flow applied independently in each affected repository.
- [13-orchestration.md](./13-orchestration.md) — the phase orchestration that spans the repositories a memo coordinates.
- [00-overview.md](./00-overview.md) — conformance language.
