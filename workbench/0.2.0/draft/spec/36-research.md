# 36. research/

| | |
|---|---|
| Status | Draft |
| Depends on | [12-folders.md](./12-folders.md) |
| Related | [15-repos.md](./15-repos.md), [34-data.md](./34-data.md) |

`research/` holds **cloned foreign / research repositories** the project reads but does not own — distinct from `repos/` (the project's own repos) and `data/` (raw feeds). This page owns the `research/` spec; [12-folders.md](./12-folders.md) owns the ownership/shape tier model.

---

## Folder Contract

```folder
{
  "name":       "research/",
  "status":     "optional",
  "level":      "project",
  "entryPoint": null,
  "convention": null,
  "purpose":    "Cloned foreign / research repositories the project reads but does not own — distinct from repos/ (own repos) and data/ (raw inputs).",
  "goesIn":     "Foreign clones studied or referenced (for example dune, spellbook), each someone else's repository.",
  "doesNot":    "The project's own repositories (those are repos/); raw feeds (those are data/).",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](./12-folders.md)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## research/ vs repos/ vs data/

`repos/` is the project's OWN git repositories — one domain each, code it owns. `research/` is cloned FOREIGN repositories it reads but does not own (for example dune, spellbook): authored content (no leading dot) but someone else's repos, kept out of `repos/` to keep the "own repositories" boundary clean. `data/` is raw feeds, not repositories at all. Keeping foreign clones in `research/` means the "one domain per repo" reasoning over `repos/` is not polluted by material the project does not maintain.

---

## Clones Bring Their Own Git

A foreign clone under `research/` carries its own git history and its own upstream origin — that origin belongs to the clone, not the workbench. The `remote` key is `forbidden` in the sense that a project MUST NOT attach ITS OWN publishable remote here (the "remote only in `repos/`" rule, [15-repos.md](./15-repos.md)); it does not ask you to strip a read-only clone's upstream. Nothing in `research/` is pushed as the project's own work.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related
- [15-repos.md](./15-repos.md) — the project's own repositories, and the remote-only-in-repos/ rule.
- [34-data.md](./34-data.md) — raw inputs, distinct from cloned repositories.
- [12-folders.md](./12-folders.md) — the folder contract and the ownership/shape tier model.
