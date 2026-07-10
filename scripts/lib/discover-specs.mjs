// discover-specs.mjs — central family discovery helper (M058 PRD-005 scanner).
//
// Real directory scanner: reads each family's spec.json and derives a full family record. The
// spec.json is the single source of family identity; specDir and dataDir are structurally derived
// from the slug and currentVersion (flat namespace-first layout, Memo 064 MI-S6 + flatten) so the
// record shape never drifts from the on-disk tree. A family is discovered directly at the repo root
// (<name>/spec.json) — the repo itself is the spec container.
//
// Record shape:
//   { name, namespace, prefix, version, specDir, dataDir, sopAnchor, docEntry, relatedRefs, manifestMeta }
// where specDir/dataDir are namespace-first (<name>/<version>/draft/{spec,data}) — resolved via
// ./layout.mjs.
//
// Family ORDER is canonical: memo → workbench → session → spec (the meta-spec last).
// Unknown families are appended after the known ones (alphabetically), so new parallel
// specs slot in deterministically.
// Callers MUST NOT re-implement the family list — add a spec.json under the container and
// extend refs.manual.json; discoverSpecs picks it up automatically.

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import { draftSpecDirRel, draftDataDirRel } from './layout.mjs'


// Canonical family order for sorting. Unknown families sort after the known ones.
const FAMILY_ORDER = [ 'memo', 'workbench', 'session', 'meta-spec' ]


// Read a spec.json from a family directory. Returns null when absent or unreadable.
const readSpecJson = ( { familyDirAbs } ) => {
    const path = join( familyDirAbs, 'spec.json' )
    if ( existsSync( path ) === false ) return null
    try {
        return JSON.parse( readFileSync( path, 'utf-8' ) )
    } catch {
        return null
    }
}


// Build a full family record from a spec.json manifest. specDir and dataDir are structurally
// derived per detected layout (never read from spec.json) so the on-disk tree is always consistent.
const buildFamilyRecord = ( { repoRoot, name, specJson } ) => {
    const version = specJson.currentVersion
    const specDir = draftSpecDirRel( { repoRoot, name, version } )
    const dataDir = draftDataDirRel( { repoRoot, name, version } )

    return {
        name,
        namespace: specJson.namespace ?? specJson.slug ?? name,
        prefix: specJson.prefix ?? '',
        version,
        specDir,
        dataDir,
        sopAnchor: specJson.sopAnchor ?? '',
        docEntry: specJson.docEntry ?? `/${ name }/overview/`,
        relatedRefs: specJson.relatedRefs ?? [],
        manifestMeta: specJson.sidebarMeta ?? { order: [], labels: {} }
    }
}


// Scan the repo root (the spec container) for family subdirs holding a <name>/spec.json. Non-family
// directories (scripts/, data/, node_modules/, …) carry no spec.json and are filtered out.
const scanContainer = ( { repoRoot } ) => {
    if ( existsSync( repoRoot ) === false ) return []

    return readdirSync( repoRoot, { withFileTypes: true } )
        .filter( ( e ) => e.isDirectory() === true )
        .map( ( e ) => {
            const specJson = readSpecJson( { familyDirAbs: join( repoRoot, e.name ) } )
            if ( specJson === null ) return null

            return buildFamilyRecord( { repoRoot, name: e.name, specJson } )
        } )
        .filter( ( r ) => r !== null )
}


// Discover all spec families in canonical order: memo → workbench → session → spec, then any
// additional families alphabetically. Scans the repo root, where each family lives at <name>/spec.json.
export const discoverSpecs = ( { repoRoot } ) => {
    const records = scanContainer( { repoRoot } )

    // Sort in canonical order: known families first (by FAMILY_ORDER index), then unknown
    // families alphabetically so new specs appear in a stable, predictable position.
    return records.sort( ( a, b ) => {
        const ia = FAMILY_ORDER.indexOf( a.name )
        const ib = FAMILY_ORDER.indexOf( b.name )
        if ( ia !== -1 && ib !== -1 ) return ia - ib
        if ( ia !== -1 ) return -1
        if ( ib !== -1 ) return 1

        return a.name.localeCompare( b.name )
    } )
}
