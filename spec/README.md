# spec/ — Namespace-first Spec Container — Generated dist/ is DO NOT EDIT

This is the namespace-first container (Memo 064 MI-S6). Each family lives at
`spec/<name>/<version>/{draft,dist,skills}/`; the `dist/` subtree and the container-level aggregates
below are **auto-generated** from the source spec under `draft/` and the `data/` refs. Do not edit
the generated files by hand — they are overwritten on the next `npm run build`. Edit the sources instead:

- Spec chapters: `spec/<name>/<version>/draft/spec/*.md`
- Refs / metadata: `data/refs.manual.json` (validated by `data/refs.schema.json`)

## Layout

```
spec/
  <name>/<version>/draft/spec/    — authored chapters (source of truth)
  <name>/<version>/draft/data/    — authored data (skill-spec-map.json, spec-manifest.json)
  <name>/<version>/dist/spec/     — rendered chapters with YAML frontmatter (source → site payload)
  <name>/<version>/dist/bridge/   — per-page bridge projection (*.md) + dist backlinks (*.backlink.md)
  <name>/<version>/dist/data/     — spec-manifest.json (sidebar group metadata for the site)
  <name>/<version>/skills/        — convention slot (F6 = C), no generator
  inverted-map.json               — cross-family inverted skill→spec projection (read-only)
  manifest.json                   — cross-family payload manifest (consumed by sync-spec.mjs)
  refs.resolved.json              — validated + stamped refs (from data/refs.manual.json)
  README.md                       — this file
```

Families: `memo`, `workbench`, `session`, `spec` (the meta-specification). Current version for each: `0.1.0`.

## Artifacts and their generators

| Artifact | Generator | Source |
|----------|-----------|--------|
| `spec/refs.resolved.json` | `scripts/generate-refs.mjs` | `data/refs.manual.json` + `data/refs.schema.json` |
| `spec/<name>/<v>/dist/bridge/` | `scripts/generate-bridge.mjs` | `spec/<name>/<v>/draft/data/skill-spec-map.json` |
| `spec/inverted-map.json` | `scripts/generate-bridge.mjs` | skill-spec-map across all families |
| `spec/<name>/<v>/dist/spec/<NN-name>.md` | `scripts/generate-docs-payload.mjs` | `spec/<name>/<v>/draft/spec/*.md` |
| `spec/manifest.json` | `scripts/generate-manifest.mjs` | `spec/<name>/<v>/dist/spec/**/*.md` |
| `spec/<name>/<v>/dist/data/spec-manifest.json` | `scripts/generate-manifest.mjs` | `spec/<name>/<v>/draft/spec/spec-manifest.json` |

## Build

```bash
npm run build
```

Runs the generators in sequence: `generate-refs` → `generate-docs-payload` → `generate-bridge`
→ `generate-manifest` → `check-bridge-inverse`. This order is mandatory (docs-payload before
bridge, both before manifest). The build aborts with a non-zero exit code if the refs manual
fails schema validation, a same-family link resolves into a foreign family's route, or the
bridge inverse check detects drift.

## Payload format

Each `spec/<name>/<version>/dist/spec/*.md` file is its source chapter with:

- YAML frontmatter prepended (`title`, `description`, `spec_version`,
  `spec_file`, `order`, `section`, `normative`, `generated_at`,
  `generated_from`, `generator`, `edit_warning`).
- The leading H1 stripped (the docs site renders the title from frontmatter).
- Same-family links `./NN-name.md` rewritten to the family's own published route (`/specification/`, `/workbench/`, `/session/`, `/spec/`), derived from the family head.
