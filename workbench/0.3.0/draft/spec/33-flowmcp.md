# 33. flowmcp/

| | |
|---|---|
| Status | Draft |
| Depends on | [11-project-structure.md](./11-project-structure.md), [12-folders.md](./12-folders.md) |
| Related | [26-addons.md](./26-addons.md), [session/15-addons.md](/session/addons/), [31-browser-automation.md](./31-browser-automation.md) |

`flowmcp/` is the on-disk footprint of the **FlowMCP** custom folder — a globally-installed tool (the FlowMCP CLI) whose authored content and produced output live in a declared per-project area, in the pattern every custom folder follows ([26-addons.md](./26-addons.md)). This is the per-folder page for `flowmcp/`: it specifies the folder's *role* and the **three-location model** that keeps the global CLI truth, the regenerable local cache, and the authored content folder apart. The FlowMCP *tool* itself — its schemas and its search/list → call workflow — is owned by the FlowMCP project and is not restated here.

---

## Folder Contract

```folder
{
  "name":       "flowmcp/",
  "status":     "optional",
  "level":      "both",
  "entryPoint": null,
  "convention": null,
  "purpose":    "FlowMCP authored content and produced output — the footprint of the FlowMCP custom folder. It holds the material a project keeps and produces with FlowMCP (for example graded schema exports and reports), not the global CLI installation.",
  "goesIn":     "Authored FlowMCP content and produced output — schema grading exports, reports, produced artifacts.",
  "doesNot":    "The global CLI installation (that lives in ~/.flowmcp/, untouched); the regenerable namespace-index cache (that is .flowmcp/, gitignored).",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](./12-folders.md)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## The Three-Location Model of a Custom Folder

FlowMCP is a custom folder whose data spreads across **three distinct locations**, and keeping them apart is the whole point of this page. Conflating them is what lets a user's global CLI truth be overwritten, or a multi-gigabyte cache be committed by accident:

| Location | Role | Dot? | git |
|----------|------|------|-----|
| `~/.flowmcp/` | The **global CLI truth** — the FlowMCP CLI's own home: its installed schemas and its API keys. It is the single source of truth for the tool and lives **outside** the workbench; it is **never touched** by any workbench action. | — | outside the workbench |
| `<cwd>/.flowmcp/` | A **regenerable cache** — the per-working-directory `namespace-index.json` the CLI writes so it can resolve tools fast. It is machinery: deletable and rebuildable at any time, so it is **gitignored** and carries a dot. Obsolete `tools/`/`prompts/` sub-trees do not belong in it. | dot (generated machinery) | gitignored |
| `flowmcp/` | The **authored content and output** folder — the workbench-registered, non-dot folder that holds the material a project actually keeps: graded schema exports, reports, produced artifacts. | no dot (authored content) | local |

This is the same **"Tool Global, Data Project-Bound"** discipline every Add-on follows ([26-addons.md](./26-addons.md), [session/15-addons.md](/session/addons/)): the tool is installed once, globally (`~/.flowmcp/`); its regenerable working index is local machinery (`.flowmcp/`, a dot-prefixed, gitignored cache); and its durable, authored content sits in a registered non-dot folder (`flowmcp/`). The dot-prefix convention ([12-folders.md](./12-folders.md)) reads directly off this split: `.flowmcp/` is generated machinery, `flowmcp/` is authored content.

### `~/.flowmcp/` Is Never Touched

`~/.flowmcp/` is the FlowMCP CLI's own home and the **CLI truth** for the tool — the installed schemas and, critically, the user's API keys. No workbench action writes to it, moves it, or deletes it. A workbench operation that regenerates or cleans FlowMCP data acts only on the local `.flowmcp/` cache and the authored `flowmcp/` folder; the global home is left **untouched**. This mirrors the standing rule that a tool's own configuration is never silently overwritten.

### `.flowmcp/` Is a Regenerable, Gitignored Cache

The local `.flowmcp/` folder holds only the `namespace-index.json` cache the CLI rebuilds on demand. Because it is regenerable machinery, it is **gitignored**: wherever a `.flowmcp/` cache lands inside a git repository, `.flowmcp/` is added to that repository's `.gitignore`. It is never committed, and deleting it costs nothing — the CLI rebuilds it from `~/.flowmcp/` on the next run. Obsolete `tools/` and `prompts/` sub-trees are not part of the cache and do not belong in it.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [12-folders.md](./12-folders.md) — the folder contract and the dot-prefix convention this page's `.flowmcp/`-vs-`flowmcp/` split reads off.
- [26-addons.md](./26-addons.md) — the custom folder (Add-on) model `flowmcp/` is an instance of ("Tool Global, Data Project-Bound").
- [session/15-addons.md](/session/addons/) — the Add-on model: data boundaries and the per-Add-on SOP.
- [11-project-structure.md](./11-project-structure.md) — the local guarantee that keeps `flowmcp/` and `.flowmcp/` on the machine.
