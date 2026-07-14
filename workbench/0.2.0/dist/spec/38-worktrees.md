---
title: ".worktrees/"
description: "`.worktrees/` is the **one consistent location** for a project's git worktrees — a dot-prefixed, gitignored area of generated checkouts with mandatory cleanup. This page owns the `.worktrees/` spec;..."
workbench_version: "0.2.0"
spec_file: "38-worktrees.md"
order: 38
section: "Workbench"
normative: true
generated_at: "2026-07-14T17:27:22.814Z"
generated_from: "workbench/0.2.0/draft/spec/38-worktrees.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: workbench/0.2.0/draft/spec/38-worktrees.md."
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
  "goesIn":     "Git worktrees of the project's repos/ repositories, one checkout per branch under .worktrees/.",
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

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [15-repos.md](/workbench/repos/) — the repositories a worktree is a checkout of.
- [12-folders.md](/workbench/folders/) — the folder contract and the dot/no-dot machinery rule.
