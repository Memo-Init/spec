---
title: "Migration and Publication"
description: "Folding the former SOP spec into this family is not a no-op: the SOP chapters were a **published** sibling family with live URLs under `/sop/…`, and those URLs MUST keep resolving. This chapter..."
session_version: "0.1.0"
spec_file: "14-migration.md"
order: 14
section: "Session"
normative: true
generated_at: "2026-07-01T17:09:35.557Z"
generated_from: "draft/session/0.1.0/spec/14-migration.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/session/0.1.0/spec/14-migration.md."
---


Folding the former SOP spec into this family is not a no-op: the SOP chapters were a **published** sibling family with live URLs under `/sop/…`, and those URLs MUST keep resolving. This chapter records what the fold touches and the rule that protects existing links.

---

## The Slug Fold

The SOP chapters move from the `sop` family to the `session` family. Their published slugs change family root `/sop/<x>/ → /session/<x>/`, and the former SOP `overview` is renamed to `sop` so it does not collide with the session `overview`:

| Old URL | New URL |
|---------|---------|
| `/sop/overview/` | `/session/sop/` |
| `/sop/common-denominator/` | `/session/common-denominator/` |
| `/sop/instances/` | `/session/instances/` |
| `/sop/conventions/` | `/session/conventions/` |

Old `/sop/…` URLs **MUST** continue to resolve. Astro `redirects` map each old URL to its new home; a published link is never silently broken. The `sop` family is removed from the publishing pipeline only once the redirects are in place.

---

## Pipeline Touch-Points

The fold is mechanical across the spec and site build, and every touch-point is enumerated so none is missed:

| File | Change |
|------|--------|
| `repos/spec/data/refs.manual.json` | remove the `sop` family key (version + url) |
| `repos/spec/scripts/generate-docs-payload.mjs` | stop generating the `sop/` payload; the `session/` payload now carries the SOP-area chapters |
| `repos/spec/scripts/generate-manifest.mjs` | drop the `sop` block; give the `session` family its grouped nav map (Introduction · SOP · Genesis Root · Enforcement · CLI · Recovery) |
| `repos/memo-init.github.io/scripts/sync-spec.mjs` | drop the `sop` family sync |
| `repos/memo-init.github.io/src/data/sidebar.mjs` | drop `sopItems`; give the `session` family its group labels and order |
| `repos/memo-init.github.io/astro.config.mjs` | drop the SOP sidebar section and badge; add the `redirects` for the old `/sop/…` URLs |
| `llms.txt` / `llms-full.txt` | regenerate from the content tree — they pick up the moved pages automatically |

---

## Requirement-Record Rewrite

The config migration ([05-config-cascade.md](/specification/config-cascade/)) also reaches the requirements store. REQ-061's stored definition names the former config home (`.workbench/registry.json`) in its **advisory** clause; that reference is updated to name the session-tier home (`.session/config.json`) as the specified target, while remaining accurate that the live wiring is migrated by `session init` rather than rewritten in place. The `REQ-SS-*` identifiers are spec-internal (defined in [02-enforcement.md](/specification/enforcement/)); they carry no separate store records and need no rewrite.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [00-overview.md](/specification/overview/) — the absorbed SOP area whose URLs this fold preserves.
- [05-config-cascade.md](/specification/config-cascade/) — the config migration whose requirement record this chapter rewrites.
- [03-recovery.md](/specification/recovery/) — the fail-safe posture the migration must not weaken.
