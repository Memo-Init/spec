---
title: "Git & Security"
description: "After a rollout stop, the system has historically handed work over to an uncontrolled commit-and-push — \"it runs out of control\". This chapter fixes a **deterministic git flow** so that what happens..."
spec_version: "0.2.0"
spec_file: "16-git-security-versioning.md"
order: 16
section: "Specification"
normative: true
generated_at: "2026-07-13T19:05:19.052Z"
generated_from: "memo/0.2.0/draft/spec/16-git-security-versioning.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: memo/0.2.0/draft/spec/16-git-security-versioning.md."
---


After a rollout stop, the system has historically handed work over to an uncontrolled commit-and-push — "it runs out of control". This chapter fixes a **deterministic git flow** so that what happens to a repository after a stop is specified, not improvised. Security is a fixed part of that flow, not an afterthought — and that security extends to destructive git operations, which must never silently overwrite uncommitted work.

---

## The Problem and the Fix

The problem: when the rollout stops (overflow, hard blocker, user stop), the AI is left to commit and push on its own judgement, and the result is unpredictable — half-finished branches, surprise pushes, worktrees left on disk.

The fix: the git flow is **deterministic**. Worktrees are the standard isolation mechanism; their resolution is mandatory; `git-security` is a fixed gate; and the issue rules are part of the same area. Commit is not push — a commit is an orientation marker for a future session, and a push is never executed automatically (see [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)).

---

## Worktrees with Mandatory Cleanup

The standard flow uses **git worktrees**: the Lead creates a worktree per Worker (add), the Worker works in isolation, and the result is later committed and merged.

The resolution and cleanup of a worktree is a **non-skippable part of the work** — no litter on disk. The rules:

- After a successful merge, the worktree **MUST** be removed immediately: `git worktree remove <worktree-path>`. No zombie folder is left behind.
- If `git worktree remove` fails (e.g. a dirty worktree), the Lead **MUST** escalate — a worktree is never simply left lying around.
- On plan re-entry, a visibility audit checks all worktrees, unmerged branches, uncommitted trees, and stashes read-only for built-but-invisible work; clean fully-merged worktrees are removed (`git worktree prune` for stale administrative entries), and unmerged/uncommitted work is presented to the user with its content.

The single-active-worktree invariant holds per phase: the Lead verifies the target worktree's branch before each Worker assignment and does not assign a Worker until the branch is correct (the stale guard, see [13-orchestration.md](/specification/orchestration/)).

---

## git-security as a Fixed Part

`git-security` is a fixed, non-optional part of the git flow. It is a standalone security check that runs autonomously and reports only when it BLOCKS.

It MUST run:

- before any commit (a Worker runs `git-security` before every commit),
- before any issue creation, and
- as a finalization gate (see [11-quality-and-finalization.md](/specification/quality-and-finalization/)).

It scans staged files and issue text for secrets (API keys, passwords, tokens — including mock credentials), absolute paths, `.env` files, and personal data. The same scan also rejects two classes of injected text in an outward-facing artifact: an **AI/assistant attribution trailer** — a co-authorship line crediting an automated assistant, or a tool-generated promotional footer the committer never wrote — and an **injection imperative**, an instruction smuggled into a commit message or issue body aimed at a downstream reader or agent. A finding returns BLOCKED and stops the commit or issue. Because every repository is treated as public by default, the check applies the public-context standard: only relative paths, no usernames or sensitive system paths, no real credentials in any `.example.env`.

---

## Issue Rules

Issues are part of this same security-governed area. An issue **MUST** be:

- **Neutral** — no private data, no personal information, no internal absolute paths.
- **Work-package referenced** — the issue references its work package by a traceable ID, so the trail is searchable (see [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)).
- **Free of secrets** — the same `git-security` scan that gates commits also scans issue text before creation.

Work packages are addressed by ID rather than by absolute path; this reduces path exposure and keeps the public issue trail clean.

---

## Destructive git-ops over a dirty tree

Some git operations overwrite the working tree without confirmation: a path-scoped checkout (`git checkout <ref> -- <path>`), a `git restore`, a `git reset --hard`, and `git clean`. When such an operation is run too broadly over a tree that holds uncommitted edits, those edits are overwritten in place and are gone — the only surviving version is what was last committed. This is a real, irreversible data-loss class, not a hypothetical one.

The governing principle is **Working-Clone ≠ Backup**. The local working clone is **NOT** a backup. Only state that is **committed AND pushed to the remote (`origin`)** is protected: the remote is the durable backup. Uncommitted edits live in exactly one place — the working tree — and have no copy anywhere; if they are overwritten, no recovery exists.

### Pre-Destructive-Guard (normative)

Before running any potentially-destructive git operation that can overwrite dirty or protected files — `git checkout … -- <path>`, `git restore`, `git reset --hard`, `git clean` — the actor:

- **MUST** first determine whether the working tree is dirty or holds protected files in the operation's path range. A broad destructive path operation over a dirty tree is **NEVER** run.
- **MUST**, when dirty or protected files are in range, secure those files first — stash or commit them — **OR** narrow the operation so its path scope tightly excludes every dirty/protected file. Securing first and tight scoping are the only two permitted ways forward; running broad-and-dirty is not.
- **MUST NOT** widen a destructive path operation beyond the specific files it is meant to touch. The default scope is the narrowest path that achieves the intent, never the whole tree or a parent directory.

### Protected-files / disposition check (normative)

Where a controlled stop or rollout records the working tree's dirty and protected files in a readiness marker's disposition (the enumerated list of files that must not be lost), that disposition is authoritative:

- Before any destructive git-op, the actor **MUST** consult the recorded disposition of protected/dirty files.
- Every file named there **MUST** be stashed or committed before the op runs, **OR** the op **MUST** be narrowed so that none of those files fall within its path scope.
- A destructive git-op that would overwrite a file the disposition marks as protected, without first securing it, **MUST NOT** be run.

---

## Conformity Requirements

The security rules above are not only prose. The chapter's binding security `MUST`s are authored here **prose-first** as declarative requirements (the prose-first guard, [35-memo-authoring.md](/specification/memo-authoring/)): each rule's `statement` faces generation (it shapes the prompt that builds the git flow) and its `check` faces the commit/issue/finalization gate (it verifies the actual scan result, ternary `PASS` / `BLOCKED` / `INCONCLUSIVE`). These checks are deterministic — they verify a scan outcome or a staged-file set, never the mere presence of a claim — and the doer is not the grader: verification runs in a fresh context. The structured blocks below are the machine-readable source the requirement store is **harvested** from ([23-requirements.md](/specification/requirements/)).

The gate is only as strong as its invocation: `git-security` is not advisory, it runs at each fixed point and a non-PASS result stops the work rather than being logged and ignored. The whole rule is the gate, so the `grade` is `binary`:

```requirement
{
  "id": "REQ-880",
  "title": "git-security runs at every fixed gate and a non-PASS short-circuits",
  "statement": "git-security MUST run at each fixed gate of the git flow — before every commit, before every issue creation, and at finalization — and a result other than PASS MUST short-circuit the gate (the commit, issue, or finalization stops); a gate MUST NOT proceed on a BLOCKED or unrun scan.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-security", "gate"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Before a commit is created, a git-security scan has run and returned PASS",
      "Before an issue is created, a git-security scan has run over the issue body and returned PASS",
      "A non-PASS scan result halts the gated action rather than allowing it to proceed"
    ]
  },
  "grade": "binary"
}
```

Absolute filesystem paths leak a developer's machine layout into a public artifact; the scan flags them deterministically and returns a hard yes/no, so its `grade` is `binary`:

```requirement
{
  "id": "REQ-881",
  "title": "Security scan blocks machine-layout absolute paths",
  "statement": "The security scan MUST flag absolute filesystem paths that expose a developer's machine layout (a user-home or system-root prefix, POSIX or Windows) anywhere in staged content outside the version-control and dependency directories, and MUST return BLOCKED on a match; only relative paths belong in published content.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-security", "path-scan"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "git-security",
    "tactic": "absolute-path-scan",
    "verify": [
      "Run the scan over the staged files",
      "Assert any user-home or system-root absolute path outside ignored directories yields BLOCKED",
      "Assert relative paths are not flagged"
    ]
  },
  "grade": "binary"
}
```

The highest-value scan catches real credentials while letting structural placeholders through, so it neither leaks a secret nor blocks an obvious dummy — a hard yes/no rule, hence `binary`:

```requirement
{
  "id": "REQ-882",
  "title": "Security scan blocks secrets and realistic credential shapes, allows placeholders",
  "statement": "The security scan MUST detect secret-bearing tokens — by keyword (password, secret, api key, token, credential, private key, ssh key) and by realistic credential shape (provider-prefixed API keys, cloud access-key identifiers, JWT bearer tokens) — and return BLOCKED on a match, while explicitly allowing structural placeholders (for example `your_api_key_here` or `<TOKEN>`); a context-aware exception covers test fixtures and security-documentation comments.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-security", "secret-scan"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "git-security",
    "tactic": "secrets-format-entropy-scan",
    "verify": [
      "Run the scan over the staged content",
      "Assert a keyword-bearing or realistically-shaped credential yields BLOCKED",
      "Assert a structural placeholder is allowed (not BLOCKED)"
    ]
  },
  "grade": "binary"
}
```

Some paths must never enter a commit at all — secrets aside, an environment file or a generated directory has no business being staged:

```requirement
{
  "id": "REQ-883",
  "title": "Environment and generated directories are never staged",
  "statement": "A commit MUST NOT stage an environment file (`.env`) or a generated/dependency directory (`node_modules/`, `coverage/`, `.nyc_output/`); an `.example.env` MAY be staged only after it is scanned and confirmed to carry placeholder values, never real credentials.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-security", "staged-paths"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The staged file set contains no `.env` file",
      "The staged file set contains no path under `node_modules/`, `coverage/`, or `.nyc_output/`",
      "A staged `.example.env`, if present, passed the secret scan with no real value"
    ]
  },
  "grade": "binary"
}
```

Personal data is softer than a secret but still does not belong in a public trail; it is surfaced as a warning rather than a hard stop, so its severity is `warning`:

```requirement
{
  "id": "REQ-884",
  "title": "Security scan surfaces personal data",
  "statement": "The security scan SHOULD flag personal data — email addresses, IP addresses, and usernames embedded in paths — in staged content, with a context-aware exception for the `package.json` author field and security-documentation comments; a finding is surfaced as a warning rather than a hard stop.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-security", "personal-data"] },
  "severity": "warning",
  "check": {
    "kind": "tool",
    "tool": "git-security",
    "tactic": "personal-data-scan",
    "verify": [
      "Run the scan over the staged content",
      "Assert email/IP/username-in-path findings are reported",
      "Assert the package.json author field and security comments are excepted"
    ]
  },
  "grade": "binary"
}
```

An issue body is published text too, so it gets the same scrub as staged code, and a finding stops issue creation:

```requirement
{
  "id": "REQ-885",
  "title": "Issue text is scanned with the same checks as staged code",
  "statement": "When issue text is provided, the security scan MUST apply the same checks (absolute paths, secrets, personal data) to the issue body — catching secrets in error messages and machine paths in reproduction steps — and a finding MUST return BLOCKED and stop issue creation.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-security", "issue-scan"] },
  "severity": "blocker",
  "check": {
    "kind": "tool",
    "tool": "git-security",
    "tactic": "issue-text-scan",
    "verify": [
      "Run the scan over the issue body",
      "Assert a secret in an error message or an absolute path in a reproduction step yields BLOCKED",
      "Assert issue creation is stopped on a finding"
    ]
  },
  "grade": "binary"
}
```

A commit message is an outward-facing artifact, and two kinds of injected text must never reach it — an attribution trailer the committer never wrote and an imperative aimed at a downstream agent. The scan detects both deterministically, so the rule is `binary`:

```requirement
{
  "id": "REQ-886",
  "title": "Commit messages carry no attribution trailer or injection imperative",
  "statement": "A commit message MUST NOT carry an AI/assistant attribution trailer — a co-authorship line crediting an automated assistant, or a tool-generated promotional footer the committer never wrote — nor an injection imperative (an instruction smuggled into the message text aimed at a downstream reader or agent); the scan MUST detect such a trailer or imperative and BLOCK the commit (or strip the offending trailer) before it is published.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-security", "attribution-trailer"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "The commit subject and body contain no co-authorship trailer attributing the commit to an automated assistant",
      "The commit message contains no tool-generated promotional footer",
      "The commit message contains no imperative addressed to a downstream reader or agent"
    ]
  },
  "grade": "binary"
}
```

A broad destructive git operation over a dirty tree is an irreversible data-loss class; the guard is checkable against the recorded disposition of protected files:

```requirement
{
  "id": "REQ-887",
  "title": "Destructive git-ops consult the protected-files disposition first",
  "statement": "Before running a destructive git operation that can overwrite the working tree (`git checkout … -- <path>`, `git restore`, `git reset --hard`, `git clean`), the actor MUST consult the recorded disposition of protected/dirty files and MUST first secure every file named there (stash or commit) OR narrow the operation's path scope so that no protected/dirty file falls within it; a broad-and-dirty destructive op MUST NOT be run.",
  "scope": { "repos": [], "categories": ["git"], "tags": ["git-security", "destructive-op"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No destructive git-op runs over a dirty tree without first stashing/committing the in-range dirty files or narrowing the path scope to exclude them",
      "Every file marked protected in the recorded disposition is secured or out of the op's path scope before the op runs"
    ]
  },
  "grade": "binary"
}
```

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/) — the memo-ID scheme, the phase/issue/commit/PR mapping, and the commit-is-not-push rule.
- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — `git-security` as the tenth finalization gate.
- [13-orchestration.md](/specification/orchestration/) — the worktree lifecycle, the stale guard, and the visibility audit on re-entry.
- [00-overview.md](/specification/overview/) — conformance language.
