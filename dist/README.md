# dist/ — Generated Artifacts — DO NOT EDIT

Everything in this directory is **auto-generated** from the source spec under `draft/` and the
`data/` refs. Do not edit these files by hand — your changes will be overwritten
on the next `npm run build`. Edit the sources instead:

- Spec chapters: `draft/<name>/<version>/spec/*.md`
- Refs / metadata: `data/refs.manual.json` (validated by `data/refs.schema.json`)

## Layout

```
dist/
  <name>/<version>/spec/    — rendered chapters with YAML frontmatter (source → site payload)
  <name>/<version>/bridge/  — per-page bridge projection (*.md) + dist backlinks (*.backlink.md)
  <name>/<version>/data/    — spec-manifest.json (sidebar group metadata for the site)
  inverted-map.json         — cross-family inverted skill→spec projection (read-only)
  manifest.json             — cross-family payload manifest (consumed by sync-spec.mjs)
  refs.resolved.json        — validated + stamped refs (from data/refs.manual.json)
  README.md                 — this file
```

Families: `memo`, `workbench`, `session`, `spec` (the meta-specification). Current version for each: `0.1.0`.

## Artifacts and their generators

| Artifact | Generator | Source |
|----------|-----------|--------|
| `dist/refs.resolved.json` | `scripts/generate-refs.mjs` | `data/refs.manual.json` + `data/refs.schema.json` |
| `dist/<name>/<v>/bridge/` | `scripts/generate-bridge.mjs` | `draft/<name>/<v>/data/skill-spec-map.json` |
| `dist/inverted-map.json` | `scripts/generate-bridge.mjs` | skill-spec-map across all families |
| `dist/<name>/<v>/spec/<NN-name>.md` | `scripts/generate-docs-payload.mjs` | `draft/<name>/<v>/spec/*.md` |
| `dist/manifest.json` | `scripts/generate-manifest.mjs` | `dist/<name>/<v>/spec/**/*.md` |
| `dist/<name>/<v>/data/spec-manifest.json` | `scripts/generate-manifest.mjs` | `draft/<name>/<v>/spec/spec-manifest.json` |

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

Each `dist/<name>/<version>/spec/*.md` file is its source chapter with:

- YAML frontmatter prepended (`title`, `description`, `spec_version`,
  `spec_file`, `order`, `section`, `normative`, `generated_at`,
  `generated_from`, `generator`, `edit_warning`).
- The leading H1 stripped (the docs site renders the title from frontmatter).
- Same-family links `./NN-name.md` rewritten to the family's own published route (`/specification/`, `/workbench/`, `/session/`, `/spec/`), derived from the family head.
