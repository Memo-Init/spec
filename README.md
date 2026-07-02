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
| **Versioning** | per family + version: `draft/<family>/<version>/spec/` — active version in `data/refs.manual.json` (never hardcoded) |

## Quickstart

Clone the repository and start reading from the overview chapter:

```bash
git clone https://github.com/memo-init/spec.git
cd spec
```

Begin with `draft/memo/0.1.0/spec/00-overview.md`, then read the numbered chapters
in order. Generated artifacts under `dist/` are produced by the build:

```bash
npm i
npm run build
```

## Features

The repository is organized into four hand-written sibling spec families under
`draft/`, and a generated machine-readable layer under `dist/`:

```
draft/<family>/<version>/spec/   Hand-written chapters (memo, workbench, session, spec)
draft/<family>/<version>/data/   skill-spec-map.json (the bridge source edge)
draft/<family>/spec.json         Per-family head: identity, route, sidebar metadata
data/                            refs.manual.json (source of truth) + refs.schema.json (AJV)
dist/                            DO NOT EDIT — rendered payload, bridges, manifest, inverted-map
scripts/                         generate-refs / -docs-payload / -bridge / -manifest + gates (.mjs)
personas/                        audience personas + entry-points + tone-guide
.github/workflows/               generate + cross-repo dispatch (spec-updated / refs-updated)
```

- **Four families:** `memo` (a single memo's lifecycle), `workbench` (project
  structure, folders, CLI, config, wiki), `session` (the session genesis layer
  and SOP area), and `spec` — the **meta-specification** that specifies spec
  structure itself. Each is authored under `draft/<family>/<version>/spec/` and
  published to `dist/<family>/<version>/`.
- **References:** `data/refs.manual.json` is the source of truth (validated by
  `data/refs.schema.json`); the active version per family is resolved there,
  never hardcoded.
- **Generated layer:** `dist/` holds the rendered chapter payload, the per-page
  bridges + backlinks, `manifest.json`, and `inverted-map.json` — do not edit by
  hand; run `npm run build` instead.
- **Personas:** `personas/` holds the audience personas, entry-points and a
  tone-guide.

## Provenance

The spec is **induced** from the live memo-toolkit (`memo-toolkit`). It documents
the real, verified system; the model-to-code deviations remain internal docs.

## Table of Contents

- [memo-init / spec](#memo-init--spec)
  - [Quickstart](#quickstart)
  - [Features](#features)
  - [Provenance](#provenance)
  - [Contributing](#contributing)
  - [License](#license)

## Contributing

Contributions are welcome! Please open an issue first to discuss what you would
like to change.

## License

[MIT](LICENSE)
