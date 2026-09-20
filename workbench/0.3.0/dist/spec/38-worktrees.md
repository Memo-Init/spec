---
title: ".worktrees/"
description: "`.worktrees/` is the **one consistent location** for a project's git worktrees — a dot-prefixed, gitignored area of generated checkouts with mandatory cleanup. This page owns the `.worktrees/` spec;..."
workbench_version: "0.3.0"
spec_file: "38-worktrees.md"
order: 38
section: "Workbench"
normative: true
generated_at: "2026-09-20T07:42:00.285Z"
generated_from: "workbench/0.3.0/draft/spec/38-worktrees.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: workbench/0.3.0/draft/spec/38-worktrees.md."
---


`.worktrees/` is the **one consistent location** for a project's git worktrees — a dot-prefixed, gitignored area of generated checkouts with mandatory cleanup. This page owns the `.worktrees/` spec; [12-folders.md](/workbench/folders/) owns the dot/no-dot machinery rule.

---

## Folder Contract

```folder
{
  "name":       ".worktrees/",
  "status":     "optional",
  "level":      "project",
  "entryPoint": null,
  "convention": null,
  "purpose":    "The one consistent location for git worktrees — generated machinery, gitignored, with mandatory cleanup.",
  "goesIn":     "Git worktrees of the project's repos/ repositories, one checkout per branch at .worktrees/<memo-id>/<slug>/.",
  "doesNot":    "Authored content; a permanent home for a checkout (a worktree MUST be removed via git worktree remove/prune when its work is done).",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](/workbench/folders/)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## One Location, Machinery, Gitignored

Git worktrees need one consistent home in every project; left unplaced they scatter and the disk fills with orphaned checkouts. A project's worktrees live under `.worktrees/` at the project root — not next to individual repositories, not in ad-hoc paths — so tooling and an agent both know where a worktree is without searching. `.worktrees/` holds generated checkouts, not authored content, so it carries a dot and is gitignored: its contents are never committed.

---

## Mandatory Cleanup

A worktree is transient. When work on its branch is done it MUST be removed via `git worktree remove`, and stale entries pruned via `git worktree prune`, so no disk debris is left behind. `.worktrees/` gives that mandatory-cleanup rule a fixed, registered place to point at.

**Merging and dissolving are part of the job, not a user decision.** Work is not finished when a worktree holds a result; it is finished when that result has been merged into its target branch and the worktree is gone. Neither the merge nor the removal is ever framed as an option, a question or a proposal to the user — the only user gate in this area is the **push** (Stage 4), and pushing is a different act from merging locally. A worktree still standing after its work is merged is an **open end**, and it stays one until it is either removed or carries a stated reason for remaining.

**Quiesce before merging.** A worktree's output MUST NOT be committed or merged while its worker may still be writing. Before the merge, the worker is stopped or verified idle; only then does the merge run. Skipping this produces a commit race whose symptoms are orphaned pointers and a half-committed state — a class of damage that is cheap to prevent here and expensive to diagnose afterwards. A clean `git status --porcelain` does not settle the question: it says the tree is clean at this instant, not that nobody is about to write to it.

---

## Per-Memo Subfolders

`.worktrees/` segments its contents by the active memo id, mirroring `.tmp/` ([19-tmp.md](/workbench/tmp/)) and `.trash/` ([32-trash.md](/workbench/trash/)): a checkout lives under `.worktrees/<memo-id>/`, one subfolder per memo. The three machine-local folders therefore share **one** structure, so what a memo left behind is read off the same shape in all three places.

- **`<memo-id>` is the id of the memo currently being worked on.** A tool or an agent creating a worktree while a memo is active MUST place it under that memo's subfolder — `.worktrees/<memo-id>/…` — never in the `.worktrees/` root directly.
- **`undefined/` is the fallback.** When no memo is active, `<memo-id>` is the literal `undefined`, so such checkouts land in `.worktrees/undefined/`. There is always a valid target: work never has to decide whether a memo happens to be active before it can pick a worktree path.

Segmentation does not soften the mandatory-cleanup rule above. Every subfolder, `.worktrees/undefined/` included, still holds transient checkouts that MUST be removed via `git worktree remove`/`prune` when their work is done.

### The Full Address: `.worktrees/<memo-id>/<slug>/`

A checkout does not lie in the memo folder directly; it occupies a named subfolder of it. The address has exactly **three** levels — the root, the memo id, and a `<slug>` naming the piece of work:

```
.worktrees/<memo-id>/<slug>/
```

`<slug>` is the same kebab-case slug that the branch carries (`{PREFIX}-{NNN}-<slug>`), so a folder on disk and a branch in git are readable off one another without a lookup table. **The path and the branch are two separate things and are recorded in two separate fields.** A single field holding "the worktree" cannot answer both *where is it* and *what is it called*, and a tool that needs the location must not have to parse a branch name to guess it.

Three levels are the point. A memo folder holding checkouts directly can say which memo left something behind but not *what* was left; with the slug, an unmerged leftover names its own piece of work.

### Repositories, and the One That Is Never a Target

A worktree is a checkout of a repository under `repos/`. A project may hold a **local, remote-less git root outside `repos/`** — a spec workshop is the standing example. Such a root is **never a worktree target**: it exists to be authored in directly, it has no remote to merge toward, and a checkout of it would put authored text in a generated, gitignored area. The exclusion is against that root specifically, not against its name: a repository under `repos/` that happens to be called the same thing is an ordinary target and is not caught by it.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [15-repos.md](/workbench/repos/) — the repositories a worktree is a checkout of.
- [12-folders.md](/workbench/folders/) — the folder contract and the dot/no-dot machinery rule.
