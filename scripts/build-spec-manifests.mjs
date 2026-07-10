#!/usr/bin/env node
// build-spec-manifests.mjs — Memo 052 Kap 8 (one-time extraction).
//
// Emits the three per-version spec-manifest.json files (core/workbench/session) by reading
// the CURRENT dist/manifest.json and grouping each family's files by
// their existing sidebar_group. The group display labels + order are taken 1:1 from the
// site's (former) hardcoded sidebar.mjs maps, frozen here into the manifests. After this,
// the spec-manifest is the SINGLE source of the sub-categories — generate-manifest.mjs and
// sidebar.mjs both read it (the build hardcode is dissolved). Idempotent.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverSpecs } from './lib/discover-specs.mjs'
import { aggregatePath } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const MANIFEST = JSON.parse( readFileSync( aggregatePath( { repoRoot: REPO, file: 'manifest.json' } ), 'utf-8' ) )


// Group display metadata is now sourced from each family's spec.json sidebarMeta field via
// discoverSpecs (M058 PRD-005 de-hardcoding seam). The formerly hardcoded CORE / WORKBENCH /
// SESSION consts are removed; their values are preserved byte-for-byte in spec.json manifests.


// Build the groups[] for one family from its manifest file entries. Files are bucketed by
// their existing sidebar_group; pages are the NN-slug filename stems ordered by file.order;
// groups follow the meta order (unknown keys appended, mirroring sidebar.mjs). Reproduces
// the current grouping exactly — that is what keeps the regression diff empty.
const buildGroups = ( { files, meta } ) => {
    const sorted = [ ...files ].sort( ( a, b ) => a.order - b.order )
    const buckets = {}

    sorted
        .forEach( ( file ) => {
            const key = typeof file.sidebar_group === 'string' ? file.sidebar_group : meta.order[ 0 ]
            if( !buckets[ key ] ) { buckets[ key ] = [] }
            buckets[ key ].push( file.filename.replace( /\.md$/, '' ) )
        } )

    const orderedKeys = meta.order.filter( ( key ) => buckets[ key ] )
    const extraKeys = Object.keys( buckets ).filter( ( key ) => !meta.order.includes( key ) )
    const allKeys = [ ...orderedKeys, ...extraKeys ]

    return allKeys.map( ( key, index ) => ( {
        id: key,
        label: meta.labels[ key ] ?? key,
        order: index + 1,
        pages: buckets[ key ]
    } ) )
}


const writeManifest = ( { specDir, namespace, version, files, meta } ) => {
    const path = join( REPO, specDir, 'spec-manifest.json' )
    // Preserve the uniform machine-head fields (Memo 055) if the existing manifest carries them.
    // This script owns only namespace/version/groups/fallback; the head fields are authored
    // separately and MUST survive a re-run (otherwise a regenerate silently drops them).
    const existing = existsSync( path ) ? JSON.parse( readFileSync( path, 'utf-8' ) ) : {}
    const headKeys = [ 'namespaceToken', 'hasRequirements', 'hasGrading', 'requirementsRef', 'gradingRef' ]
    const preserved = headKeys
        .filter( ( key ) => existing[ key ] !== undefined )
        .reduce( ( acc, key ) => ( { ...acc, [ key ]: existing[ key ] } ), {} )
    const manifest = {
        namespace,
        version,
        ...preserved,
        groups: buildGroups( { files, meta } ),
        fallback: 'append-by-NN'
    }
    writeFileSync( path, JSON.stringify( manifest, null, 4 ) + '\n', 'utf-8' )
    const pageCount = manifest.groups.reduce( ( sum, group ) => sum + group.pages.length, 0 )
    console.log( `  ✓ ${ namespace }: ${ manifest.groups.length } groups, ${ pageCount } pages → ${ specDir }/spec-manifest.json` )

    return { path }
}


const main = () => {
    console.log( 'Extracting spec-manifests from manifest.json...' )

    const families = discoverSpecs( { repoRoot: REPO } )
    families.forEach( ( family ) => {
        // Memo (core) files live at MANIFEST.files (top-level); all other families at MANIFEST[name].files.
        const files = family.name === 'memo' ? MANIFEST.files : MANIFEST[ family.name ].files
        writeManifest( {
            specDir: family.specDir,
            namespace: family.namespace,
            version: family.version,
            files,
            meta: family.manifestMeta
        } )
    } )

    console.log( 'Done.' )
}


main()
