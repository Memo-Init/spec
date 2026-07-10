// layout.mjs — flat namespace-first path resolution (Memo 064 MI-S6 + flatten).
//
// The repo IS the spec container: each family (namespace) lives directly at the repo root as
// <namespace>/<version>/{draft,dist,skills}/, and the cross-namespace aggregates
// (manifest / inverted-map / refs.resolved) sit at the repo root next to them. There is no
// intermediate spec/ container directory and no legacy medium-first (top-level draft/, dist/) tree —
// both are gone. These resolvers are the single site that knows the on-disk shape, so consumers
// derive their paths structurally and never drift from the tree.
//
// House style: 4-space, no semicolons, single quotes, object params, object returns.

import { existsSync } from 'node:fs'
import { join } from 'node:path'


// A family exists when its head lives at <repoRoot>/<name>/spec.json (the flat namespace-first
// layout). Kept as a real existence probe so consumers can skip a missing family gracefully.
const isNamespaceFirst = ( { repoRoot, name } ) => {
    return existsSync( join( repoRoot, name, 'spec.json' ) ) === true
}


// Relative specDir on the draft (authored) side.
const draftSpecDirRel = ( { name, version } ) => {
    return join( name, version, 'draft', 'spec' )
}


// Relative dataDir on the draft (authored) side.
const draftDataDirRel = ( { name, version } ) => {
    return join( name, version, 'draft', 'data' )
}


// Absolute dist (generated) spec directory.
const distSpecDir = ( { repoRoot, name, version } ) => {
    return join( repoRoot, name, version, 'dist', 'spec' )
}


// Absolute dist (generated) bridge directory.
const distBridgeDir = ( { repoRoot, name, version } ) => {
    return join( repoRoot, name, version, 'dist', 'bridge' )
}


// Absolute dist (generated) data directory.
const distDataDir = ( { repoRoot, name, version } ) => {
    return join( repoRoot, name, version, 'dist', 'data' )
}


// Absolute path to a family head (spec.json).
const familyHeadPath = ( { repoRoot, name } ) => {
    return join( repoRoot, name, 'spec.json' )
}


// Cross-namespace aggregates (manifest / inverted-map / refs.resolved) live at the repo root.
const aggregatePath = ( { repoRoot, file } ) => {
    return join( repoRoot, file )
}


export {
    isNamespaceFirst,
    draftSpecDirRel,
    draftDataDirRel,
    distSpecDir,
    distBridgeDir,
    distDataDir,
    familyHeadPath,
    aggregatePath
}
