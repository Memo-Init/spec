<!-- TODO on publication: swap the static badges for a live generate.yml status badge once the repo has a remote -->
![Status: v0.1.0 Draft](https://img.shields.io/badge/Status-v0.1.0%20Draft-orange.svg) ![Conformance: RFC 2119](https://img.shields.io/badge/Conformance-RFC%202119-blue.svg) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

# memo-init / spec

The **memo-init specification** — an inductive, RFC-style description of the
memo-system (memo-driven, agentic software engineering) plus the **workbench
sub-spec**.

The spec is not invented top-down: it is **induced** from the live memo-toolkit,
so it documents the real, verified system rather than an idealized model. It uses
RFC 2119 / BCP 14 conformance language and is versioned per directory.

| | |
|---|---|
| **Status** | v0.1.0 Draft |
| **Conformance** | RFC 2119 / BCP 14 (see `spec/v0.1.0/00-overview.md`) |
| **Versioning** | per directory: `spec/v0.1.0/` — active version in `data/refs.manual.json` (never hardcoded) |

## Quickstart

Clone the repository and start reading from the overview chapter:

```bash
git clone https://github.com/memo-init/spec.git
cd spec
```

Begin with `spec/v0.1.0/00-overview.md`, then read the numbered chapters in
order. Generated artifacts under `generated/` are produced by the build:

```bash
npm i
npm run build
```

## Features

The repository is organized into a hand-written core spec, a workbench sub-spec,
and a generated machine-readable layer:

```
spec/v0.1.0/        Core spec chapters 00..18 (hand-written)
spec/workbench/     Sub-spec: project structure, requirements, tools, strands, wiki, trash
data/               refs.manual.json (source of truth) + refs.schema.json (AJV)
generated/          DO NOT EDIT — llms.txt, refs.resolved.json, docs-payload/ + manifest.json
scripts/            generate-refs / -docs-payload / -manifest / -llms-txt (.mjs)
personas/           3-5 audience personas + entry-points + tone-guide
.github/workflows/  generate + cross-repo dispatch (spec-updated / refs-updated)
```

- **Core spec:** chapters `00..18` under `spec/v0.1.0/`, hand-written.
- **Workbench sub-spec:** project structure, requirements, tools, strands, wiki,
  trash under `spec/workbench/`.
- **References:** `data/refs.manual.json` is the source of truth (validated by
  `data/refs.schema.json`); the active version is resolved there, never
  hardcoded.
- **Generated layer:** `generated/` holds `llms.txt`, `refs.resolved.json` and
  the docs-payload — do not edit by hand.
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
