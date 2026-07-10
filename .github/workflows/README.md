# spec — CI workflows & cross-repo fan-out

The `spec` repo is the source of truth and is the flat namespace-first container: each family
lives at `<ns>/<version>/{draft,dist,skills}/` and the cross-family aggregates
(`manifest.json`, `inverted-map.json`, `refs.resolved.json`) sit at the repo root (Memo 064
flatten). Authored source is under each family's `draft/`; the committed `dist/` mirror is
maintained by the author on commit. On change the repo verifies parity and fans out to the two
consuming repos via `repository_dispatch`.

```
spec (push under <ns>/**, data/refs.* or scripts/**)
  ├─ generate.yml ........ read-only dist-parity gate (Memo 061 F6; the bot no longer commits)
  ├─ notify-docs-site.yml  → dispatch "spec-updated"  → Memo-Init/memo-init.github.io (deploy.yml)
  └─ notify-org-profile.yml→ dispatch "refs-updated"  → Memo-Init/.github (update-readme.yaml)
```

| Workflow | Trigger | Effect |
|----------|---------|--------|
| `generate.yml` | push under `<ns>/**` (memo, workbench, session, meta-spec), root aggregates, `data/refs.*`, `scripts/**` | read-only dist-parity gate (no ALT hub reaches the site) |
| `notify-docs-site.yml` | push under `**/dist/**`, `manifest.json`, `inverted-map.json`, `refs.resolved.json` | `repository_dispatch: spec-updated` → website rebuild |
| `notify-org-profile.yml` | push to `data/refs.manual.json`, `refs.resolved.json` | `repository_dispatch: refs-updated` → org profile regen |

## Required secret: `PUBLISH_SPEC_CHANGES`

A fine-grained Personal Access Token, stored as a repository (or org) secret named
`PUBLISH_SPEC_CHANGES`, with:

- **Repository access:** `Memo-Init/spec`, `Memo-Init/memo-init.github.io`, `Memo-Init/.github`
- **Permissions:** `Contents: read and write` and `Metadata: read` (Contents write is needed both
  for `generate.yml` to push artifacts and for the dispatch targets to accept the event).

The token is referenced only as `${{ secrets.PUBLISH_SPEC_CHANGES }}` — never commit a token value.
Without the secret the workflows are inert (no fan-out); the repos still build standalone.

> The default `GITHUB_TOKEN` is deliberately **not** used for the artifact push, because a push made
> with `GITHUB_TOKEN` does not trigger the `notify-*` workflows. The PAT closes that loop.
