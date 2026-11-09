<!-- TODO on publication: swap the static badges for a live generate.yml status badge once the repo has a remote -->
![Status: v0.1.0 Draft](https://img.shields.io/badge/Status-v0.1.0%20Draft-orange.svg) ![Conformance: RFC 2119](https://img.shields.io/badge/Conformance-RFC%202119-blue.svg) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

# memo-init / spec

The **memo-init specification** — an inductive, RFC-style description of the
memo-system (memo-driven, agentic software engineering) as four sibling families:
**memo**, **workbench**, **session**, and the **meta-specification** (`spec`, the
family that specifies spec structure itself).

The spec is not invented top-down: it is **induced** from the live memo-toolkit,
so it documents the real, verified system rather than an idealized model. It uses
RFC 2119 / BCP 14 conformance language and is versioned per family and version.

| | |
|---|---|
| **Status** | v0.1.0 Draft |
| **Conformance** | RFC 2119 / BCP 14 (each family's `00-overview` carries its conformance anchor) |
| **Versioning** | per family + version: `<family>/<version>/draft/spec/` — active version in `data/refs.manual.json` (never hardcoded) |

## Quickstart

Clone the repository and start reading from the overview chapter:

```bash
git clone https://github.com/memo-init/spec.git
cd spec
```

Begin with `memo/0.1.0/draft/spec/00-overview.md`, then read the numbered chapters
in order. Generated artifacts under each family's `dist/` are produced by the build:

```bash
npm i
npm run build
```

## Layout

This repository **is** the namespace-first spec container: each family (namespace)
lives directly at the repo root as `<name>/<version>/{draft,dist,skills}/`. The
`dist/` subtree and the root-level cross-family aggregates are **auto-generated**
from the source spec under each family's `draft/` and the `data/` refs. Do not edit
the generated files by hand — they are overwritten on the next `npm run build`. Edit
the sources instead:

- Spec chapters: `<name>/<version>/draft/spec/*.md`
- Refs / metadata: `data/refs.manual.json` (validated by `data/refs.schema.json`)

```
<name>/<version>/draft/spec/    — authored chapters (source of truth)
<name>/<version>/draft/data/    — authored data (skill-spec-map.json, spec-manifest.json)
<name>/<version>/dist/spec/     — rendered chapters with YAML frontmatter (source → site payload)
<name>/<version>/dist/bridge/   — per-page bridge projection (*.md) + dist backlinks (*.backlink.md)
<name>/<version>/dist/data/     — spec-manifest.json (sidebar group metadata for the site)
<name>/<version>/dist/generated/ — llms.txt spec bundles (copied to the docs site)
<name>/<version>/skills/        — convention slot (F6 = C), no generator
<name>/spec.json                — per-family head: identity, route, sidebar metadata, edges
manifest.json                   — cross-family payload manifest (consumed by sync-spec.mjs)
inverted-map.json               — cross-family inverted skill→spec projection (read-only)
refs.resolved.json              — validated + stamped refs (from data/refs.manual.json)
data/                           — refs.manual.json (source of truth) + refs.schema.json (AJV)
scripts/                        — generate-refs / -docs-payload / -bridge / -manifest / -llms-txt + gates (.mjs)
personas/                       — audience personas + entry-points + tone-guide
.github/workflows/              — generate + cross-repo dispatch (spec-updated / refs-updated)
```

Families: `memo`, `workbench`, `session`, `spec` (the meta-specification, internal
namespace `meta-spec`, route `/spec/`). Current version for each: `0.1.0`.

- **Four families:** `memo` (a single memo's lifecycle), `workbench` (project
  structure, folders, CLI, config, wiki), `session` (the session genesis layer
  and SOP area), and `spec` — the **meta-specification** that specifies spec
  structure itself. Each is authored under `<family>/<version>/draft/spec/` and
  published to `<family>/<version>/dist/`.
- **References:** `data/refs.manual.json` is the source of truth (validated by
  `data/refs.schema.json`); the active version per family is resolved there,
  never hardcoded.
- **Generated layer:** each family's `dist/` holds the rendered chapter payload,
  the per-page bridges + backlinks and the llms.txt bundle; the root-level
  `manifest.json` and `inverted-map.json` are the cross-family aggregates — do not
  edit by hand; run `npm run build` instead.
- **Personas:** `personas/` holds the audience personas, entry-points and a
  tone-guide.

## Artifacts and their generators

| Artifact | Generator | Source |
|----------|-----------|--------|
| `refs.resolved.json` | `scripts/generate-refs.mjs` | `data/refs.manual.json` + `data/refs.schema.json` |
| `<name>/<v>/dist/bridge/` | `scripts/generate-bridge.mjs` | `<name>/<v>/draft/data/skill-spec-map.json` |
| `inverted-map.json` | `scripts/generate-bridge.mjs` | skill-spec-map across all families |
| `<name>/<v>/dist/spec/<NN-name>.md` | `scripts/generate-docs-payload.mjs` | `<name>/<v>/draft/spec/*.md` |
| `manifest.json` | `scripts/generate-manifest.mjs` | `<name>/<v>/dist/spec/**/*.md` |
| `<name>/<v>/dist/data/spec-manifest.json` | `scripts/generate-manifest.mjs` | `<name>/<v>/draft/spec/spec-manifest.json` |
| `<name>/<v>/dist/generated/llms.txt` | `scripts/generate-llms-txt.mjs` | `<name>/<v>/dist/spec/*.md` |

## Build

```bash
npm run build
```

Runs the generators in sequence: `generate-refs` → `generate-docs-payload` →
`generate-bridge` → `generate-manifest` → `generate-llms-txt` →
`check-bridge-inverse`. This order is mandatory (docs-payload before bridge, both
before manifest). The build aborts with a non-zero exit code if the refs manual
fails schema validation, a same-family link resolves into a foreign family's route,
or the bridge inverse check detects drift.

## Payload format

Each `<name>/<version>/dist/spec/*.md` file is its source chapter with:

- YAML frontmatter prepended (`title`, `description`, `spec_version`,
  `spec_file`, `order`, `section`, `normative`, `generated_at`,
  `generated_from`, `generator`, `edit_warning`).
- The leading H1 stripped (the docs site renders the title from frontmatter).
- Same-family links `./NN-name.md` rewritten to the family's own published route
  (`/specification/`, `/workbench/`, `/session/`, `/spec/`), derived from the
  family head.

## Provenance

The spec is **induced** from the live memo-toolkit (`memo-toolkit`). It documents
the real, verified system; the model-to-code deviations remain internal docs.

## Table of Contents

- [memo-init / spec](#memo-init--spec)
  - [Quickstart](#quickstart)
  - [Layout](#layout)
  - [Artifacts and their generators](#artifacts-and-their-generators)
  - [Build](#build)
  - [Payload format](#payload-format)
  - [Provenance](#provenance)
  - [Contributing](#contributing)
  - [License](#license)

## Contributing

Contributions are welcome! Please open an issue first to discuss what you would
like to change.

## License

[MIT](LICENSE)
