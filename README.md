# memo-init spec workshop — private authoring home

This is the **project-local, private authoring home** for the memo-init specification (Memo 064).
It is the WORKBENCH-sphere counterpart of the public promotion target `repos/spec`: the five spec
namespaces are developed here and promoted (copied) to the public container once ready. Modeled on
`projects/flowmcp/spec`.

- **Not published, not pushed.** It carries an opt-in local git with **no remote** (F7=A). The git
  exists so the build can stamp a real short SHA as provenance instead of `unknown`.
- **Two-commit pattern (like `../flowmcp/spec`).** Commit 1 lands the sources + tooling; then
  `npm run build` runs (stamping the artifacts with commit 1's SHA); then commit 2 lands the built
  artifacts. `.gitignore` excludes only `node_modules/` and `.DS_Store` — the built `dist/` and the
  root aggregates ARE committed.

## Layout

```
<ns>/<version>/draft/spec/    — authored chapters (source of truth)
<ns>/<version>/draft/data/    — authored data (skill-spec-map.json, spec-manifest.json)
<ns>/<version>/dist/          — built payload, bridges, data, generated llms bundles (committed)
<ns>/<version>/skills/        — convention slot
<ns>/spec.json               — per-namespace head: identity, route, sidebar metadata, edges
scripts/                     — the generator (node built-ins + ajv), copied from repos/spec
data/                        — refs.manual.json (source of truth) + refs.schema.json (AJV)
refs.resolved.json           — validated + stamped refs (committed)
manifest.json / inverted-map.json — cross-namespace aggregates (committed)
```

Namespaces and their current versions: `memo` `0.3.0`, `workbench` `0.3.0`, `session` `0.3.0`,
`meta-spec` `0.3.0`, `governance` `0.1.0`.
The per-namespace llms bundles land at `<ns>/<version>/dist/generated/llms.txt`.

## Build

```bash
npm install    # one dependency: ajv (schema validation in generate-refs)
npm run build
npm test       # audit-spec-quality + check-bridge-inverse
```

Runs the generator chain: `generate-refs` → `generate-docs-payload` → `generate-bridge` →
`generate-manifest` → `check-bridge-inverse` → `generate-llms-txt`. This mirrors the public
`repos/spec` build minus its `spec-drift` gate (which needs the global `memo` CLI).

The skill↔spec bridge reads the sibling `repos/core` skills for the per-chapter Purpose cells. Since
this workshop sits one level higher than `repos/spec` (`<project>/spec` vs `<project>/repos/spec`),
`generate-bridge` resolves the project root as `resolve(REPO, '..')` (the one line adapted from the
verbatim copy) so `repos/core` is found and the bridge hubs match the public repo exactly.

## Documentation Files

Markdown files outside the product folders (the chapters under `<ns>/<version>/` and the fixtures under
`scripts/data/`), each with the reason it exists beside this README:

| File | Reason |
|------|--------|
| `anchor-grounding-baseline.md` | Measured baseline of how well each anchor term is understood from the spec text alone |
| `anchor-terms.register.md` | Generated view of the anchor-term store, rendered by a script and never edited by hand |
| `anchor-terms.dictionary.md` | Generated dictionary view of the same anchor-term store, rendered by the same script |
| `data/tool-contract-maintenance.md` | Maintenance procedure for the tool-contract snapshot, so it does not drift silently |
