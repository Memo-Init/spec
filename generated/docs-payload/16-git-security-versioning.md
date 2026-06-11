---
title: "Git, Security and Versioning"
description: "This chapter is **normative** for the deterministic git flow, the mandatory worktree cleanup, the `git-security` gate, and the issue rules. The worktree-cleanup enforcement is **specified here and..."
spec_version: "0.1.0"
spec_file: "16-git-security-versioning.md"
order: 16
section: "Specification"
normative: true
generated_at: "2026-06-11T03:38:25.870Z"
generated_from: "spec/v0.1.0/16-git-security-versioning.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/16-git-security-versioning.md."
---


> Normative language (MUST/SHOULD/MAY) follows the conventions defined in [00-overview.md](/specification/overview/) (Conformance Language). RFC 2119 / BCP 14 keywords are used.

This chapter is **normative** for the deterministic git flow, the mandatory worktree cleanup, the `git-security` gate, and the issue rules. The worktree-cleanup enforcement is **specified here and partially present in the live skills** — the full enforcement is follow-up work (see below).

---

## Purpose

After a rollout stop, the system has historically handed work over to an uncontrolled commit-and-push — "it runs out of control". This chapter fixes a **deterministic git flow** so that what happens to a repository after a stop is specified, not improvised. Security is a fixed part of that flow, not an afterthought.

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

> **Follow-up (specified, not yet implemented):** the cleanup primitives are verified to exist in the live skills (`git worktree remove` in phase execution, `git worktree prune` in plan execution). This chapter raises them to an explicit, non-skippable rule. Bringing every skill fully in line with that rule is follow-up work, not part of this bootstrap.

---

## git-security as a Fixed Part

`git-security` is a fixed, non-optional part of the git flow. It is a standalone security check that runs autonomously and reports only when it BLOCKS.

It MUST run:

- before any commit (a Worker runs `git-security` before every commit),
- before any issue creation, and
- as a finalization gate (see [11-quality-and-finalization.md](/specification/quality-and-finalization/)).

It scans staged files and issue text for secrets (API keys, passwords, tokens — including mock credentials), absolute paths, `.env` files, and personal data. A finding returns BLOCKED and stops the commit or issue. Because every repository is treated as public by default, the check applies the public-context standard: only relative paths, no usernames or sensitive system paths, no real credentials in any `.example.env`.

---

## Issue Rules

Issues are part of this same security-governed area. An issue **MUST** be:

- **Neutral** — no private data, no personal information, no internal absolute paths.
- **Memo-ID referenced** — the issue references its work package by memo ID (`M{NNN}-{PP}` for a phase), so the trail is searchable (see [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/)).
- **Free of secrets** — the same `git-security` scan that gates commits also scans issue text before creation.

Work packages are addressed by ID rather than by absolute path; this reduces path exposure and keeps the public issue trail clean.

---

## Related

- [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/) — the memo-ID scheme, the phase/issue/commit/PR mapping, and the commit-is-not-push rule.
- [11-quality-and-finalization.md](/specification/quality-and-finalization/) — `git-security` as the tenth finalization gate.
- [13-orchestration.md](/specification/orchestration/) — the worktree lifecycle, the stale guard, and the visibility audit on re-entry.
- [00-overview.md](/specification/overview/) — conformance language.
