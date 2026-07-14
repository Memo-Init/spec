---
title: "data/"
description: "`data/` is the project's **raw-input** folder: feeds and source material exactly as ingested, before any processing. It is the input side that `context/` is derived from. This page **owns** the..."
workbench_version: "0.2.0"
spec_file: "34-data.md"
order: 34
section: "Workbench"
normative: true
generated_at: "2026-07-14T17:27:22.814Z"
generated_from: "workbench/0.2.0/draft/spec/34-data.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: workbench/0.2.0/draft/spec/34-data.md."
---


`data/` is the project's **raw-input** folder: feeds and source material exactly as ingested, before any processing. It is the input side that `context/` is derived from. This page **owns** the `data/` specification; [12-folders.md](/workbench/folders/) owns the raw/processed tier model.

---

## Folder Contract

```folder
{
  "name":       "data/",
  "status":     "optional",
  "level":      "project",
  "entryPoint": null,
  "convention": null,
  "purpose":    "Raw inputs — feeds and source material as ingested, before processing; the input side context/ is derived from.",
  "goesIn":     "Raw feeds, dumps, and source files exactly as they arrive, un-processed.",
  "doesNot":    "Processed or derived material (that is context/); cloned repositories (those are research/ or repos/).",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](/workbench/folders/)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## data/ vs context/

`data/` holds raw inputs as they arrive; `context/` holds the processed, derived result produced **from** the raw data. The contract is directional: `data/` is the input, `context/` is what is derived from it. A project that only works with processed docs has a `context/` and no `data/`; a project that ingests raw feeds keeps them in `data/` and writes the distilled result into `context/`.

Keeping the two apart is the point. Raw dumps MUST NOT be mixed into the readable research store: a raw feed in `context/` pollutes what is meant to be the distilled, human-legible result, and a distilled document in `data/` breaks the guarantee that everything there is un-processed source. When both folders are present, the flow reads one way — `data/` in, `context/` out.

---

## Raw, Not Authored

`data/` carries **no leading dot** because it holds authored-domain material a person places there — it is not machine-generated ([12-folders.md](/workbench/folders/)). Yet it is **un-processed**: feeds as ingested, before any distillation. The dot rule and the processed rule are independent, and `data/` sits where they cross — undotted because a person owns it, raw because nothing has touched it yet.

It is **durable** knowledge: material in `data/` is kept, not swept. This is what separates it from `.tmp/` scratch, which any process MAY empty at any time. A raw feed is worth keeping precisely because `context/` is derived from it — discard the input and the derivation can no longer be reproduced.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [16-context.md](/workbench/context/) — the processed, derived side that `data/` feeds.
- [36-research.md](/workbench/research/) — cloned foreign repositories, distinct from raw feeds.
- [12-folders.md](/workbench/folders/) — the folder contract and the raw/processed tier model.
