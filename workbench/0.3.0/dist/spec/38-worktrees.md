---
title: ".worktrees/"
description: "`.worktrees/` is the **one consistent location** for a project's git worktrees — a dot-prefixed, gitignored area of generated checkouts with mandatory cleanup. This page owns the `.worktrees/` spec;..."
workbench_version: "0.3.0"
spec_file: "38-worktrees.md"
order: 38
section: "Workbench"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
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
  "goesIn":     "Git worktrees of the project's repos/ repositories, one checkout per branch at .worktrees/<memo-id>/<name>/.",
  "doesNot":    "Authored content; a permanent home for a checkout (a worktree whose work is merged MUST be moved into .trash/<memo-id>/worktrees/, see Mandatory Cleanup).",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](/workbench/folders/)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## One Location, Machinery, Gitignored

Git worktrees need one consistent home in every project; left unplaced they scatter and the disk fills with orphaned checkouts. A project's worktrees live under `.worktrees/` at the project root — not next to individual repositories, not in ad-hoc paths — so tooling and an agent both know where a worktree is without searching. A worktree found next to the repositories is moved under `.worktrees/<memo-id>/`; there is no exception for a tree declared open. `.worktrees/` holds generated checkouts, not authored content, so it carries a dot and is gitignored: its contents are never committed.

---

## Mandatory Cleanup

A worktree is transient. When its branch is contained in its merge target, a worktree MUST be moved into `.trash/<memo-id>/worktrees/` with `git worktree move`, so its registration follows it and no orphaned entry is left behind. `.worktrees/` gives that mandatory-cleanup rule a fixed, registered place to point at.

The system never runs `git worktree remove` or `git worktree prune`. `remove` deletes the tree together with every file git does not track, and `prune` acts on all orphaned registrations of a repository, including ones that belong to somebody else. A move loses nothing and orphans nothing.

Each move appends one line to the worktree ledger of the owning memo, including the moment the tree expires. The expiry is the project key `worktreeTrashExpiryDays` ([32-trash.md](/workbench/trash/)). Removing an expired worktree is a human act, exactly like emptying any other part of `.trash/`.

**Merging and filing are part of the job, not a user decision.** Work is not finished when a worktree holds a result; it is finished when that result has been merged into its target branch and the worktree is filed into the trash. Neither the merge nor the filing is ever framed as an option, a question or a proposal to the user — the only user gate in this area is the **push** (Stage 4), and pushing is a different act from merging locally. A worktree still standing after its work is merged is an **open end**, and it stays one until it is either filed or carries a stated reason for remaining.

**Quiesce before merging.** A worktree's output MUST NOT be committed or merged while its worker may still be writing. Before the merge, the worker is stopped or verified idle; only then does the merge run. Skipping this produces a commit race whose symptoms are orphaned pointers and a half-committed state — a class of damage that is cheap to prevent here and expensive to diagnose afterwards. A clean `git status --porcelain` does not settle the question: it says the tree is clean at this instant, not that nobody is about to write to it.

---

## Per-Memo Subfolders

`.worktrees/` segments its contents by the active memo id, mirroring `.tmp/` ([19-tmp.md](/workbench/tmp/)) and `.trash/` ([32-trash.md](/workbench/trash/)): a checkout lives under `.worktrees/<memo-id>/`, one subfolder per memo. The three machine-local folders therefore share **one** structure, so what a memo left behind is read off the same shape in all three places.

- **`<memo-id>` is the id of the memo currently being worked on.** A tool or an agent creating a worktree while a memo is active MUST place it under that memo's subfolder — `.worktrees/<memo-id>/…` — never in the `.worktrees/` root directly.
- **`UNDEFINED-{N}` is the fallback.** When no memo is active, a new entry takes the name `UNDEFINED-{N}`, where `{N}` is the smallest free number from 1 upward in the target folder, so such checkouts land in `.worktrees/UNDEFINED-1/`, `.worktrees/UNDEFINED-2/` and so on. Folders named `undefined` that already exist stay valid. There is always a valid target: work never has to decide whether a memo happens to be active before it can pick a worktree path.

Segmentation does not soften the mandatory-cleanup rule above. Every subfolder, including the fallback ones, still holds transient checkouts that MUST be filed into `.trash/<memo-id>/worktrees/` when their work is merged.

### The Full Address: `.worktrees/<memo-id>/<name>/`

A checkout does not lie in the memo folder directly; it occupies a named subfolder of it. The address has exactly **three** levels — the root, the memo id, and a folder name identifying the piece of work:

```
.worktrees/<memo-id>/pha{NN}[-prd{NN}][-{purpose}]--{repository}/
```

The level below `<memo-id>` is named `pha{NN}[-prd{NN}][-{purpose}]--{repository}` — phase and order first, then the repository name. `{NN}` is a two-digit number, `{purpose}` an optional kebab-case word such as `eval` or `line`, and at least one of the order or the purpose is present. Examples: `pha04-prd03--core`, `pha08-prd01-eval--core`, `pha04-line--core`.

The folder name and the branch are derived from the same identity — memo, phase, order or purpose, repository — and recorded in two fields; neither is parsed out of the other. **The path and the branch are two separate things and are recorded in two separate fields.** A single field holding "the worktree" cannot answer both *where is it* and *what is it called*, and a tool that needs the location must not have to parse a branch name to guess it.

Three levels are the point. A memo folder holding checkouts directly can say which memo left something behind but not *what* was left; with the phase, the order and the repository in the name, an unmerged leftover names its own piece of work.

**Existing worktrees keep their names.** A worktree that already exists is never renamed to fit this form; the form applies to newly created worktrees, and a move may establish it.

### Repositories, and the One That Is Never a Target

A worktree is a checkout of a repository under `repos/`. A project may hold a **local, remote-less git root outside `repos/`** — a spec workshop is the standing example. Such a root is **never a worktree target**: it exists to be authored in directly, it has no remote to merge toward, and a checkout of it would put authored text in a generated, gitignored area. The exclusion is against that root specifically, not against its name: a repository under `repos/` that happens to be called the same thing is an ordinary target and is not caught by it.

---

## References Into the Store

A rule that says where things are filed needs a rule for everything that points at them. No lasting wiring — hook commands, settings files, scripts, or symbolic links outside the tree — points into `.worktrees/` or `.trash/`. Before a tree is moved, its references are listed: the symbolic links inside the tree, the links that point at the tree, and the configured paths that name it. After the move, each of them resolves or is named — never broken in silence.

The reason is measured, not theoretical: an earlier mass rename left hard-wired hook paths pointing at nothing, and an appended `|| true` reported success while the hooks did not run.

---

## A Worktree Detector Has a Claim Side

A detector that reports undeclared worktrees **MUST** compare them against a claim side: the booked list of the worktrees that each order has claimed. Without that booking the detector holds every worktree against nothing to compare and reports all of them, which is a gate without a basis of comparison. Booking a worktree is therefore part of creating it, and the detector reports an empty claim side as a gap, not as a finding about each tree.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [15-repos.md](/workbench/repos/) — the repositories a worktree is a checkout of.
- [12-folders.md](/workbench/folders/) — the folder contract and the dot/no-dot machinery rule.
