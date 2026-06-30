// discover-specs.mjs — central family discovery helper (M058 PRD-005, de-hardcoding seam).
//
// Reads each family's per-specDir spec.json (canonical source when present). Falls back to
// refs.manual.json + hardcoded values when absent. Returns an ordered array (core → workbench
// → session) of family records suitable for generate-bridge.mjs and build-spec-manifests.mjs.
//
// Record shape:
//   { name, namespace, prefix, version, specDir, dataDir, sopAnchor, docEntry, relatedRefs, manifestMeta }
// where manifestMeta = { order:[...], labels:{...} } (sidebar group meta per family).
//
// Callers MUST NOT re-implement the family list — this is the single seam through which a new
// parallel spec is added: add a spec.json in its specDir + extend refs.manual.json, done.

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'


// Canonical fallback values used when no spec.json is present in the family's specDir.
// These mirror the formerly hardcoded FAMILIES / CORE / WORKBENCH / SESSION constants across
// generate-bridge.mjs and build-spec-manifests.mjs. When a spec.json exists it takes precedence.
const FALLBACKS = {
    core: {
        name: 'core',
        namespace: 'core',
        prefix: '',
        sopAnchor: '02-memo-sop-entrypoint',
        relatedRefs: [ '43-skill-authoring-and-quality', '00-overview' ],
        manifestMeta: {
            order: [ 'introduction', 'input', 'initialisierung', 'revision', 'execution', 'procedure', 'behavior', 'health', 'agents', 'git', 'skills' ],
            labels: {
                introduction: 'Introduction', input: 'Input', initialisierung: 'Initialisierung', revision: 'Revision',
                execution: 'Execution', procedure: 'Procedure', behavior: 'Behavior', health: 'Health',
                agents: 'Agents', git: 'Git & Repo', skills: 'Skills'
            }
        }
    },
    workbench: {
        name: 'workbench',
        namespace: 'workbench',
        prefix: 'workbench/',
        sopAnchor: '02-sop-entrypoint',
        relatedRefs: [ '00-overview' ],
        manifestMeta: {
            order: [ 'introduction', 'root', 'projects', 'folders', 'custom', 'cli', 'tools', 'wiki', 'storage', 'core' ],
            labels: {
                introduction: 'Introduction', root: 'Root', projects: 'Projects', folders: 'Folders', custom: 'Custom',
                cli: 'CLI & Scripts', tools: 'Tools', wiki: 'Wiki', storage: 'Storage Formats', core: 'Core'
            }
        }
    },
    session: {
        name: 'session',
        namespace: 'session',
        prefix: 'session/',
        sopAnchor: '10-sop',
        relatedRefs: [ '00-overview' ],
        manifestMeta: {
            order: [ 'introduction', 'sop', 'genesis-root', 'enforcement', 'cli', 'recovery' ],
            labels: {
                introduction: 'Introduction', sop: 'SOP', 'genesis-root': 'Genesis Root',
                enforcement: 'Enforcement', cli: 'CLI', recovery: 'Recovery'
            }
        }
    }
}


// Read optional spec.json from a specDir. Returns null when absent or unreadable (never throws).
const readSpecJson = ( { specDirAbs } ) => {
    const path = join( specDirAbs, 'spec.json' )
    if( existsSync( path ) === false ) return null
    try {
        return JSON.parse( readFileSync( path, 'utf-8' ) )
    } catch {
        return null
    }
}


// Derive the canonical docEntry for a family, using spec.json when available and falling back
// to the refs.manual.json entryPoints (preserving the original resolution logic exactly).
const resolveDocEntry = ( { specJson, refs, refKey } ) => {
    if( specJson?.docEntry !== undefined ) return specJson.docEntry
    if( refKey === 'session' ) return refs.session?.url ?? '/session/overview/'
    if( refKey === 'workbench' ) return refs.docs?.entryPoints?.toolMaintainer ?? '/workbench/overview/'

    return refs.docs?.entryPoints?.memoAuthor ?? '/specification/overview/'
}


// Build a full family record from refs + optional spec.json + fallback values.
const buildFamilyRecord = ( { refs, refKey, fallback, repoRoot } ) => {
    const refEntry = refs[ refKey ]
    const specDir = refEntry.specDir
    const specDirAbs = join( repoRoot, specDir )
    const specJson = readSpecJson( { specDirAbs } )

    return {
        name: fallback.name,
        namespace: specJson?.namespace ?? specJson?.slug ?? fallback.namespace,
        prefix: specJson?.prefix ?? fallback.prefix,
        version: refEntry.currentVersion,
        specDir,
        dataDir: specDir,
        sopAnchor: specJson?.sopAnchor ?? fallback.sopAnchor,
        docEntry: resolveDocEntry( { specJson, refs, refKey } ),
        relatedRefs: specJson?.relatedRefs ?? fallback.relatedRefs,
        manifestMeta: specJson?.sidebarMeta ?? fallback.manifestMeta
    }
}


// Discover all spec families in canonical order: core (spec) → workbench → session.
// Falls back fully to hardcoded values when no spec.json is found in a family's specDir.
export const discoverSpecs = ( { repoRoot } ) => {
    const refs = JSON.parse( readFileSync( join( repoRoot, 'data/refs.manual.json' ), 'utf-8' ) )

    return [
        buildFamilyRecord( { refs, refKey: 'spec', fallback: FALLBACKS.core, repoRoot } ),
        buildFamilyRecord( { refs, refKey: 'workbench', fallback: FALLBACKS.workbench, repoRoot } ),
        buildFamilyRecord( { refs, refKey: 'session', fallback: FALLBACKS.session, repoRoot } )
    ]
}
