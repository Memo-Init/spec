#!/usr/bin/env node
// build-spec-manifests.mjs — Memo 052 Kap 8 (one-time extraction).
//
// Emits the three per-version spec-manifest.json files (core/workbench/session) by reading
// the CURRENT generated/docs-payload/manifest.json and grouping each family's files by
// their existing sidebar_group. The group display labels + order are taken 1:1 from the
// site's (former) hardcoded sidebar.mjs maps, frozen here into the manifests. After this,
// the spec-manifest is the SINGLE source of the sub-categories — generate-manifest.mjs and
// sidebar.mjs both read it (the build hardcode is dissolved). Idempotent.

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const REFS = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )
const MANIFEST = JSON.parse( readFileSync( join( REPO, 'generated/docs-payload/manifest.json' ), 'utf-8' ) )


// Group display metadata — 1:1 from memo-init.github.io/src/data/sidebar.mjs (frozen here).
const CORE = {
    order: [ 'introduction', 'input', 'initialisierung', 'revision', 'execution', 'procedure', 'behavior', 'health', 'agents', 'git', 'skills' ],
    labels: {
        introduction: 'Introduction', input: 'Input', initialisierung: 'Initialisierung', revision: 'Revision',
        execution: 'Execution', procedure: 'Procedure', behavior: 'Behavior', health: 'Health',
        agents: 'Agents', git: 'Git & Repo', skills: 'Skills'
    }
}

const WORKBENCH = {
    order: [ 'introduction', 'root', 'projects', 'folders', 'custom', 'cli', 'tools', 'wiki', 'storage', 'core' ],
    labels: {
        introduction: 'Introduction', root: 'Root', projects: 'Projects', folders: 'Folders', custom: 'Custom',
        cli: 'CLI & Scripts', tools: 'Tools', wiki: 'Wiki', storage: 'Storage Formats', core: 'Core'
    }
}

const SESSION = {
    order: [ 'introduction', 'sop', 'genesis-root', 'enforcement', 'cli', 'recovery' ],
    labels: {
        introduction: 'Introduction', sop: 'SOP', 'genesis-root': 'Genesis Root',
        enforcement: 'Enforcement', cli: 'CLI', recovery: 'Recovery'
    }
}


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
    const manifest = {
        namespace,
        version,
        groups: buildGroups( { files, meta } ),
        fallback: 'append-by-NN'
    }
    const path = join( REPO, specDir, 'spec-manifest.json' )
    writeFileSync( path, JSON.stringify( manifest, null, 4 ) + '\n', 'utf-8' )
    const pageCount = manifest.groups.reduce( ( sum, group ) => sum + group.pages.length, 0 )
    console.log( `  ✓ ${ namespace }: ${ manifest.groups.length } groups, ${ pageCount } pages → ${ specDir }/spec-manifest.json` )

    return { path }
}


const main = () => {
    console.log( 'Extracting spec-manifests from manifest.json...' )

    writeManifest( {
        specDir: REFS.spec.specDir, namespace: 'core', version: REFS.spec.currentVersion,
        files: MANIFEST.files, meta: CORE
    } )
    writeManifest( {
        specDir: REFS.workbench.specDir, namespace: 'workbench', version: REFS.workbench.currentVersion,
        files: MANIFEST.workbench.files, meta: WORKBENCH
    } )
    writeManifest( {
        specDir: REFS.session.specDir, namespace: 'session', version: REFS.session.currentVersion,
        files: MANIFEST.session.files, meta: SESSION
    } )

    console.log( 'Done.' )
}


main()
