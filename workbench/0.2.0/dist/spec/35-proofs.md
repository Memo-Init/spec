---
title: "proofs/"
description: "`proofs/` holds the evidence that a **view change was verified** — proof artifacts captured when a view changes. This page owns the `proofs/` spec; [12-folders.md](./12-folders.md) owns the..."
workbench_version: "0.2.0"
spec_file: "35-proofs.md"
order: 35
section: "Workbench"
normative: true
generated_at: "2026-07-14T17:27:22.814Z"
generated_from: "workbench/0.2.0/draft/spec/35-proofs.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: workbench/0.2.0/draft/spec/35-proofs.md."
---


`proofs/` holds the evidence that a **view change was verified** — proof artifacts captured when a view changes. This page owns the `proofs/` spec; [12-folders.md](/workbench/folders/) owns the specialized-folder tier.

---

## Folder Contract

```folder
{
  "name":       "proofs/",
  "status":     "optional",
  "level":      "project",
  "entryPoint": null,
  "convention": null,
  "purpose":    "Proofs captured when a view changes — the evidence a visual change was verified.",
  "goesIn":     "Captured proof artifacts (screenshots, before/after captures) tied to a view change.",
  "doesNot":    "Application snapshots (those are snapshots/); durable authored knowledge (that is context/).",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](/workbench/folders/)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## What proofs/ Captures

When a view — a UI surface — changes, a proof is captured to show the change was verified: before/after captures, screenshots. It is the evidence that the visual change actually happened and was checked, not merely asserted.

It is distinct from `snapshots/` ([37-snapshots.md](/workbench/snapshots/)), which holds whole-application snapshots: a proof is scoped to a **view change**, a snapshot to an **application state**. A proof answers "did this one view change verify?"; a snapshot answers "what did the whole application look like at this moment?".

---

## May Live Under .tmp/

`proofs/` is **specialized** — it matters to projects that capture view proofs and is irrelevant to those that do not. Such a project MAY keep `proofs/` as a top-level folder, or MAY place it under `.tmp/` when the captured material is ephemeral and need not persist.

Either placement is conformant. The choice follows from whether the proofs are kept as durable artifacts or as throwaway working material ([19-tmp.md](/workbench/tmp/)): durable proofs belong at the top level, ephemeral ones may live under `.tmp/` and be emptied like any other scratch.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [37-snapshots.md](/workbench/snapshots/) — application snapshots, the sibling specialized folder.
- [19-tmp.md](/workbench/tmp/) — where proofs may live when they are ephemeral.
- [12-folders.md](/workbench/folders/) — the folder contract and specialized-folder tier.
