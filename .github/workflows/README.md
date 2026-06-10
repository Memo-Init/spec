# spec — CI workflows & cross-repo fan-out

The `spec` repo is the source of truth. On change it regenerates `generated/` and
fans out to the two consuming repos via `repository_dispatch`.

```
spec (push to spec/** or data/refs.*)
  ├─ generate.yml ........ runs npm run build → commits generated/*
  ├─ notify-docs-site.yml  → dispatch "spec-updated"  → Memo-Init/memo-init.github.io (deploy.yml)
  └─ notify-org-profile.yml→ dispatch "refs-updated"  → Memo-Init/.github (update-readme.yaml)
```

| Workflow | Trigger | Effect |
|----------|---------|--------|
| `generate.yml` | push to `spec/**`, `data/refs.*`, `scripts/**` | regenerate + commit `generated/` |
| `notify-docs-site.yml` | push to `spec/**`, `generated/**` | `repository_dispatch: spec-updated` → website rebuild |
| `notify-org-profile.yml` | push to `data/refs.manual.json`, `generated/refs.resolved.json` | `repository_dispatch: refs-updated` → org profile regen |

## Required secret: `REPO_DISPATCH_TOKEN`

A fine-grained Personal Access Token, stored as a repository (or org) secret named
`REPO_DISPATCH_TOKEN`, with:

- **Repository access:** `Memo-Init/spec`, `Memo-Init/memo-init.github.io`, `Memo-Init/.github`
- **Permissions:** `Contents: read and write` and `Metadata: read` (Contents write is needed both
  for `generate.yml` to push artifacts and for the dispatch targets to accept the event).

The token is referenced only as `${{ secrets.REPO_DISPATCH_TOKEN }}` — never commit a token value.
Without the secret the workflows are inert (no fan-out); the repos still build standalone.

> The default `GITHUB_TOKEN` is deliberately **not** used for the artifact push, because a push made
> with `GITHUB_TOKEN` does not trigger the `notify-*` workflows. The PAT closes that loop.
