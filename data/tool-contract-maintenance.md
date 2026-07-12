# Maintaining the Werkzeug-Vertrag (tool contract)

Maintenance source for the tool-contract artefacts (Memo 067, PRD-010 / WI-2-09). The 42-tool
snapshot (`data/tool-inventory.json`) is a photo of a moving target — the upstream
`tools-reference.md` changes (deprecations, new tools; T026 logged four in one window). Without a
maintenance source the artefact drifts silently and the pre-flight (PRD-009) then checks against a
stale Soll-Liste. This page anchors the reconcile as a maintenance task on the existing
Maintenance / DriftSensor machine (M029 / M030), NOT a new scoring system.

## When to run

- On a harness update (a new `claude-code@<version>` is installed / registered).
- On a `tools-reference.md` changelog delta (a deprecation, rename or new tool is announced).

## How to reconcile

1. Re-snapshot the upstream: fetch the current `tools-reference.md` and capture it as a small JSON
   array `[{ "name": "...", "status": "..." }]` at a temp path.
2. Diff it against the current inventory:
   `node scripts/reconcile-tool-contract.mjs --inventory data/tool-inventory.json --reference <snapshot.json>`.
   The probe reports `added` / `removed` / `statusChanged` as an object and a `contentStamp`
   (snapshot hash + date). It is **WARN-only**: it never writes the artefact and always exits 0.
3. If drift is reported, carry it into the inventory **by hand in the workshop** (add rows, set
   `status`/`replacedBy`/`renamedFrom`, keep the count truthful), then regenerate the mirror with
   `node scripts/generate-tool-contract.mjs` and promote with `npm run build`. Never edit
   `repos/spec/data/*` directly (tier discipline, PRD-006).
4. Re-bless the maintenance edge: `memo maintenance verify <Mid> --edge tools-reference` records the
   fresh provenance stamp.

## The maintenance edge (non-git axis — named exception)

The contract artefact hangs on an upstream edge:

- **Edge:** `tool-inventory.json` → `tools-reference.md` (kind: `requires`).
- **verifiedAt axis:** because the upstream is **not a git repo**, drift is carried on a
  **content stamp** (snapshot hash + fetch date), **not a git-SHA**. The `DriftSensor` is
  git-centric (`commitsSinceVerified` counts commits); here that engine does not apply, so the
  freshness axis is the snapshot hash/date instead. This is a **deliberately documented exception**,
  not a rebuild of the DriftSensor — flagged already by the P2 worker before this landed.

## WARN, never block

Maintenance is the roof, WARN is the window. A stale **Pflege** state surfaces in the pre-flight
(PRD-009) as a **WARN** (analogous to the `memo spec drift-check` WARN), it does **not** block a
rollout. The pre-flight blocks only on missing **tools** (a `required[]` element absent or denied),
never on a stale maintenance edge. No auto-write: the reconcile reports drift; the human-approved
nachzug runs through the workshop → promotion path.
