# Generated Artifacts — DO NOT EDIT

Everything in this directory is **auto-generated** from the source spec and the
`data/` refs. Do not edit these files by hand — your changes will be overwritten
on the next `npm run build`. Edit the sources instead:

- Spec chapters: `spec/v<version>/*.md` and `spec/workbench/*.md`
- Refs / metadata: `data/refs.manual.json` (validated by `data/refs.schema.json`)

## Artifacts and their generators

| Artifact | Generator | Source |
|----------|-----------|--------|
| `refs.resolved.json` | `scripts/generate-refs.mjs` | `data/refs.manual.json` + `data/refs.schema.json` |
| `docs-payload/<NN-name>.md` | `scripts/generate-docs-payload.mjs` | `spec/v<version>/*.md` |
| `docs-payload/workbench/<NN-name>.md` | `scripts/generate-docs-payload.mjs` | `spec/workbench/*.md` |
| `docs-payload/manifest.json` | `scripts/generate-manifest.mjs` | `generated/docs-payload/**/*.md` |
| `llms.txt` | `scripts/generate-llms-txt.mjs` | `spec/v<version>/*.md` + `spec/workbench/*.md` |

## Build

```bash
npm run build
```

Runs the four generators in sequence: `generate-refs` → `generate-docs-payload`
→ `generate-manifest` → `generate-llms-txt`. The build aborts with a non-zero
exit code if the refs manual fails schema validation.

## Payload format

Each `docs-payload/*.md` file is its source chapter with:

- YAML frontmatter prepended (`title`, `description`, `spec_version`,
  `spec_file`, `order`, `section`, `normative`, `generated_at`,
  `generated_from`, `generator`, `edit_warning`).
- The leading H1 stripped (the docs site renders the title from frontmatter).
- Intra-spec links `./NN-name.md` rewritten to `/specification/<slug>/` routes.
