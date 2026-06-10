# memo-init / spec

The **memo-init specification** — an inductive RFC-style description of the memo-system
(memo-driven, agentic software engineering) plus the **workbench sub-spec**.

| | |
|---|---|
| **Status** | v0.1.0 Draft |
| **Conformance** | RFC 2119 / BCP 14 (see `spec/v0.1.0/00-overview.md`) |
| **Versioning** | per directory: `spec/v0.1.0/` — active version in `data/refs.manual.json` (never hardcoded) |

## Layout

```
spec/v0.1.0/        Core spec chapters 00..18 (hand-written)
spec/workbench/     Sub-spec: project structure, requirements, tools, strands, wiki, trash
data/               refs.manual.json (source of truth) + refs.schema.json (AJV)
generated/          DO NOT EDIT — llms.txt, refs.resolved.json, docs-payload/ + manifest.json
scripts/            generate-refs / -docs-payload / -manifest / -llms-txt (.mjs)
personas/           3–5 audience personas + entry-points + tone-guide
.github/workflows/  generate + cross-repo dispatch (spec-updated / refs-updated)
```

## Provenance

The spec is **induced** from the live memo-toolkit (`cli/memo-toolkit/`). It documents the
**real, verified** system (Memo 001, F5=A); the 7 model↔code deviations remain internal docs.

License: MIT
