// layout.mjs — namespace-first / medium-first path resolution (Memo 064 MI-S6).
//
// The repo migrates from medium-first (top-level draft/ and dist/ as the outermost split) to
// namespace-first (spec/<namespace>/<version>/{draft,dist,skills}/ — the namespace outermost).
// These resolvers detect a family's layout PER FAMILY (by where its spec.json lives), so the
// build stays green during a partial (tracer) migration and resolves to namespace-first once
// every family has moved. Cross-namespace aggregates move to the container level (spec/).
//
// House style: 4-space, no semicolons, single quotes, object params, object returns.

import { existsSync } from 'node:fs'
import { join } from 'node:path'


// A family is namespace-first when its head lives at spec/<name>/spec.json (the migrated
// container layout). Otherwise it is still medium-first (legacy draft/<name>/spec.json).
const isNamespaceFirst = ( { repoRoot, name } ) => {
    return existsSync( join( repoRoot, 'spec', name, 'spec.json' ) ) === true
}


// Relative specDir on the draft (authored) side, per detected layout.
const draftSpecDirRel = ( { repoRoot, name, version } ) => {
    return isNamespaceFirst( { repoRoot, name } ) === true
        ? join( 'spec', name, version, 'draft', 'spec' )
        : join( 'draft', name, version, 'spec' )
}


// Relative dataDir on the draft (authored) side, per detected layout.
const draftDataDirRel = ( { repoRoot, name, version } ) => {
    return isNamespaceFirst( { repoRoot, name } ) === true
        ? join( 'spec', name, version, 'draft', 'data' )
        : join( 'draft', name, version, 'data' )
}


// Absolute dist (generated) spec directory, per detected layout.
const distSpecDir = ( { repoRoot, name, version } ) => {
    return isNamespaceFirst( { repoRoot, name } ) === true
        ? join( repoRoot, 'spec', name, version, 'dist', 'spec' )
        : join( repoRoot, 'dist', name, version, 'spec' )
}


// Absolute dist (generated) bridge directory, per detected layout.
const distBridgeDir = ( { repoRoot, name, version } ) => {
    return isNamespaceFirst( { repoRoot, name } ) === true
        ? join( repoRoot, 'spec', name, version, 'dist', 'bridge' )
        : join( repoRoot, 'dist', name, version, 'bridge' )
}


// Absolute dist (generated) data directory, per detected layout.
const distDataDir = ( { repoRoot, name, version } ) => {
    return isNamespaceFirst( { repoRoot, name } ) === true
        ? join( repoRoot, 'spec', name, version, 'dist', 'data' )
        : join( repoRoot, 'dist', name, version, 'data' )
}


// Absolute path to a family head (spec.json), per detected layout.
const familyHeadPath = ( { repoRoot, name } ) => {
    return isNamespaceFirst( { repoRoot, name } ) === true
        ? join( repoRoot, 'spec', name, 'spec.json' )
        : join( repoRoot, 'draft', name, 'spec.json' )
}


// Cross-namespace aggregates (manifest / inverted-map / refs.resolved / README) live at the
// container level (spec/) once the namespace-first container exists, else at legacy top-level dist/.
const aggregatePath = ( { repoRoot, file } ) => {
    return existsSync( join( repoRoot, 'spec' ) ) === true
        ? join( repoRoot, 'spec', file )
        : join( repoRoot, 'dist', file )
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
