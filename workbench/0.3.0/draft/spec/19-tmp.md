# 19. .tmp/

| | |
|---|---|
| Status | Draft |
| Depends on | [12-folders.md](./12-folders.md) |
| Related | [32-trash.md](./32-trash.md), [16-context.md](./16-context.md) |

`.tmp/` is the project's **ephemeral scratch** folder: a dot-prefixed, machine-local area for throwaway working files that no part of the project depends on. It is the scratch counterpart to `.trash/` — where `.trash/` holds *recoverable* deletions, `.tmp/` holds files that were never meant to last at all. This page **owns** the `.tmp/` specification; [12-folders.md](./12-folders.md) owns the durable/scratch tier model, and [32-trash.md](./32-trash.md) points here rather than re-specifying scratch.

---

## Folder Contract

```folder
{
  "name":       ".tmp/",
  "status":     "optional",
  "level":      "project",
  "entryPoint": null,
  "convention": null,
  "purpose":    "Ephemeral scratch — throwaway working files no part of the project depends on.",
  "goesIn":     "Transient, discardable working material: intermediate output, scratch copies, staging for a multi-step operation.",
  "doesNot":    "The sole copy of anything that matters; durable knowledge; committed content (it is gitignored).",
  "git":        "discouraged",
  "remote":     "forbidden"
}
```

> The Folder Contract is the machine-readable ` ```folder ` block defined in the session conventions ([session/13-conventions.md](/session/conventions/)) — the authored source this folder's row in the central registry ([12-folders.md](./12-folders.md)) and the derived project config are generated from. Outside `repos/` no remote may be attached, so `remote` is `forbidden` and a local, own git is `discouraged`.

---

## What `.tmp/` Is For

`.tmp/` holds intermediate output that a tool or an agent produces while doing work and does not need afterwards — a half-rendered artifact, a scratch copy, a staging area for a multi-step operation. It is the right home for "I need somewhere to put this for a moment" so that such files do not litter the authored folders (`context/`, `repos/`, `design/`).

It carries a **leading dot** because it holds machine-generated, non-authored content — the same rule that dots `.trash/`, `.wiki/`, and `.memo/` and leaves `repos/`, `context/`, and `design/` undotted ([12-folders.md](./12-folders.md)). It is **gitignored**: nothing in `.tmp/` is ever committed.

---

## The Throwaway Guarantee

Two rules make `.tmp/` safe to rely on as scratch:

- **Safe to delete at any time.** Any process — a cleanup script, an agent, the user — MAY empty `.tmp/` without warning. A tool that writes to `.tmp/` MUST treat its contents as volatile.
- **Never the only copy.** `.tmp/` MUST NOT hold the sole copy of anything that matters. Material worth keeping belongs in an authored folder or, when it is a deliberate deletion, in `.trash/` ([32-trash.md](./32-trash.md)) — which is recoverable, where `.tmp/` is not.

The distinction from `.trash/` is the point: a deletion routed to `.trash/` is a thing the user might want back; a file in `.tmp/` is a thing no one will ever want back.

---

## Per-Memo Subfolders

`.tmp/` segments its contents by the active memo id: transient files live under `.tmp/<memo-id>/`, one subfolder per memo. This keeps one memo's scratch from colliding with another's and lets cleanup reason about the ephemeral material one memo at a time.

- **`<memo-id>` is the id of the memo currently being worked on.** A tool or an agent writing scratch while a memo is active MUST place it under that memo's subfolder — `.tmp/<memo-id>/…` — never in the `.tmp/` root directly.
- **`undefined/` is the fallback.** When no memo is active, `<memo-id>` is the literal `undefined`, so such files land in `.tmp/undefined/`. There is always a valid target: work never has to decide whether a memo happens to be active before it can pick a scratch path.

Segmentation does not soften the throwaway guarantee above. Every subfolder, `.tmp/undefined/` included, is still volatile scratch that any process MAY empty at any time and that MUST NOT hold the sole copy of anything that matters.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [32-trash.md](./32-trash.md) — the recoverable-deletion folder `.tmp/` is the throwaway counterpart to.
- [12-folders.md](./12-folders.md) — the folder contract and the dot/no-dot rule that classes `.tmp/` as machine-local.
- [16-context.md](./16-context.md) — the authored research store, where material worth keeping goes instead of `.tmp/`.
