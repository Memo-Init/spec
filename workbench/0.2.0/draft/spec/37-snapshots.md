# 37. snapshots/

| | |
|---|---|
| Status | Draft |
| Depends on | [12-folders.md](./12-folders.md) |
| Related | [35-proofs.md](./35-proofs.md), [19-tmp.md](./19-tmp.md) |

`snapshots/` holds **application snapshots** — captured states of the running application, kept for reference or comparison. This page owns the `snapshots/` spec; [12-folders.md](./12-folders.md) owns the specialized-folder tier.

---

## Folder Contract

```folder
{
  "name":       "snapshots/",
  "status":     "optional",
  "level":      "project",
  "entryPoint": null,
  "convention": null,
  "purpose":    "Application snapshots — captured states of the running application.",
  "goesIn":     "Snapshot artifacts of the application, captured for reference or comparison.",
  "doesNot":    "View-change proofs (those are proofs/); raw inputs (those are data/).",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](./12-folders.md)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## What a Snapshot Captures

A snapshot records a state of the whole running application — captured for later reference or comparison. It differs from `proofs/`: a proof is scoped to a single **view** change, evidence that a visual change was verified, whereas a snapshot captures an **application** state.

---

## May Live Under .tmp/

`snapshots/` is **specialized** — it matters to projects that capture application snapshots and is irrelevant to others. Such a project MAY keep `snapshots/` as a top-level folder, or MAY place it under `.tmp/` when the captured material is ephemeral and need not persist. Either placement is conformant; the choice follows from whether the snapshots are kept as durable artifacts or as throwaway working material ([19-tmp.md](./19-tmp.md)).

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [35-proofs.md](./35-proofs.md) — view-change proofs, the sibling specialized folder.
- [19-tmp.md](./19-tmp.md) — where snapshots may live when they are ephemeral.
- [12-folders.md](./12-folders.md) — the folder contract and specialized-folder tier.
