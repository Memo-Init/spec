---
title: "Project Structure & Local Guarantee"
description: "Every project lives under `projects/{name}/` and **MUST** follow a single, predictable layout. The mandatory and optional folders are specified in [12-folders.md](./12-folders.md); the split between..."
workbench_version: "0.1.0"
spec_file: "11-project-structure.md"
order: 11
section: "Workbench"
normative: true
generated_at: "2026-07-08T12:09:11.029Z"
generated_from: "draft/workbench/0.1.0/spec/11-project-structure.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/workbench/0.1.0/spec/11-project-structure.md."
---


Every project lives under `projects/{name}/` and **MUST** follow a single, predictable layout. The mandatory and optional folders are specified in [12-folders.md](/workbench/folders/); the split between the workbench root and the projects beneath it in [10-root-and-projects.md](/workbench/root-and-projects/). This chapter specifies the property those layouts exist to protect: the **local guarantee**.

---

## The Root Is Always Local

The workbench root and every project root are **local-only**. There is **no** git repository at the project root and **none** under `.memo/`.

- The absence of a git folder at these levels is a **structural** guarantee, not merely a rule a contributor is asked to follow. Material that has no enclosing repository cannot be pushed.
- Memos, requirements profiles, tools registries, context documents, proofs, and snapshots therefore stay on the developer's machine by construction. They **MUST NOT** be moved under a tracked repository at the project or `.memo/` level.
- Code that is meant to be shared lives in `repos/`, where each repository is its own git unit. Everything outside `repos/` stays local.

---

## The Only Egress Point Is GitHub Issues

A project's only sanctioned channel from the local environment to the outside world — besides the code in `repos/` — is **GitHub Issues**.

- When information needs to leave the local context (to coordinate work, file a bug, or reference a phase), it leaves as a GitHub Issue, written in neutral, public-safe language and referenced by memo ID.
- Issue text **MUST NOT** carry private data, absolute machine paths, secrets, or personal information. The git-security check applies to issue text exactly as it applies to staged code (see the core-spec git-security chapter).
- This single, narrow egress point is what keeps the local guarantee meaningful: there is one well-understood door, and it is guarded.

---

## The Local Guarantee

Taken together, the three properties form the **local guarantee**:

1. The root is local (no enclosing repository) — *structural*.
2. The only egress is GitHub Issues — *narrow and guarded*.
3. Everything shareable is isolated in `repos/` — *explicit*.

A project **MUST** preserve all three. The guarantee is the precondition for working with sensitive, half-formed, or personal material in memos and research without risk of accidental publication. Breaking any one of the three (for example, by initializing a repository at the project root) voids the guarantee and **MUST NOT** be done.

---

## Conformity Requirements

The local guarantee above is structural, so its rules are checkable. The blocks below are the prose-first, machine-readable form of this chapter's binding `MUST`s — each `statement` faces generation (it shapes how a project is laid out) and each `check` faces the structure audit and the push gate. They are the source the workbench requirement store is harvested from ([../../v0.1.0/23-requirements.md](/specification/requirements/)).

The root-is-local guarantee is a hard yes/no fact — there is either an enclosing repository or there is not — so its `check` is the whole story and its `grade` is `binary`:

```requirement
{
  "id": "REQ-950",
  "title": "Project root and memo store are never git repositories",
  "statement": "A project under `projects/<name>/` MUST NOT contain a git repository at the project root, and MUST NOT contain one under the memo store. The only git units in a project are the repositories under `repos/`; everything outside `repos/` stays local by construction, so material that has no enclosing repository cannot be pushed.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["structure", "local-guarantee"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No `.git` directory exists at the project root",
      "No `.git` directory exists under the project's memo store",
      "Every git working tree in the project resolves to a path under `repos/`"
    ]
  },
  "grade": "binary"
}
```

The egress rule is a content judgement on what may leave the local context, so it is delegated to the standalone security check rather than a structural assertion:

```requirement
{
  "id": "REQ-951",
  "title": "The only egress channel carries no private data",
  "statement": "A project's only sanctioned channel out of the local environment, besides the code in `repos/`, is GitHub Issues, written in neutral, public-safe language and referenced by memo ID. Issue text MUST NOT carry private data, absolute machine paths, secrets, or personal information; the same security check that gates staged code gates issue text.",
  "scope": { "repos": [], "categories": ["workbench"], "tags": ["egress", "security", "issues"] },
  "severity": "blocker",
  "check": {
    "kind": "skill",
    "skill": "git-security",
    "artifact": "git-security-report",
    "presence": "required",
    "verify": [
      "Run the security check over the issue text exactly as over staged code",
      "Confirm no secret, absolute path, or personal datum is present"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [10-root-and-projects.md](/workbench/root-and-projects/) — the workbench-root vs. project split that this guarantee spans.
- [12-folders.md](/workbench/folders/) — the mandatory and optional folders of a project.
- [32-trash.md](/workbench/trash/) — why deletion routes through `.trash/`.
