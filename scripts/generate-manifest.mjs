#!/usr/bin/env node
// generate-manifest.mjs — memo-init docs-payload manifest
//
// Reads dist/<name>/<version>/spec/**/*.md, parses each frontmatter, and writes
// dist/manifest.json summarizing all files across the three
// sibling spec families:
//   manifest.files            — core chapters (manifest.spec_version)
//   manifest.workbench        — { version, files[] } (own version line)
//   manifest.session          — { version, files[] } (own version line; absorbs the former SOP family, Memo 049)
//
// Each family gets its own sidebar_group mapping (Introduction-first), mirroring
// FlowMCP's buildGradingBlock / buildBestPracticeBlock. The workbench/session blocks
// are additive — manifest.files (core) stays byte-compatible.
//
// Output format documented in dist/README.md.

import { readdir, readFile, writeFile, copyFile, mkdir } from 'node:fs/promises'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readSpecManifest, groupForFile } from './lib/spec-manifest.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

const REFS_MANUAL = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )
const SPEC_VERSION = REFS_MANUAL.memo.currentVersion
const WORKBENCH_VERSION = REFS_MANUAL.workbench.currentVersion
const SESSION_VERSION = REFS_MANUAL.session.currentVersion

const PAYLOAD_DIR = join( REPO, 'dist', 'memo', SPEC_VERSION, 'spec' )
const WORKBENCH_PAYLOAD_DIR = join( REPO, 'dist', 'workbench', WORKBENCH_VERSION, 'spec' )
const SESSION_PAYLOAD_DIR = join( REPO, 'dist', 'session', SESSION_VERSION, 'spec' )
const MANIFEST_PATH = join( REPO, 'dist', 'manifest.json' )
const GENERATOR = 'scripts/generate-manifest.mjs'


const parseFrontmatter = ( { content } ) => {
    const match = content.match( /^---\n([\s\S]*?)\n---/ )
    if( !match ) return null
    const frontmatter = {}
    const lines = match[ 1 ].split( '\n' )
    lines.forEach( ( line ) => {
        const kv = line.match( /^([a-zA-Z_]+):\s*(.*)$/ )
        if( !kv ) return
        const key = kv[ 1 ]
        let value = kv[ 2 ].trim()
        if( /^".*"$/.test( value ) ) {
            value = value.slice( 1, -1 ).replace( /\\"/g, '"' )
        } else if( value === 'true' ) {
            value = true
        } else if( value === 'false' ) {
            value = false
        } else if( /^\d+$/.test( value ) ) {
            value = parseInt( value, 10 )
        }
        frontmatter[ key ] = value
    } )
    return frontmatter
}


const slugFromFilename = ( { filename } ) => {
    return filename
        .replace( /^\d+-/, '' )
        .replace( /\.md$/, '' )
}


// Memo 052 Kap 8: the sub-category grouping is no longer hardcoded here. The three former
// per-family order→group maps (SIDEBAR_GROUP_BY_ORDER + WORKBENCH_/SESSION_ variants) plus
// the lockstep duplicate in sidebar.mjs are DISSOLVED. The single source is now the
// per-version spec-manifest.json on the spec level (<specDir>/spec-manifest.json), read by
// this build AND the public site AND the Spec Viewer. A chapter's sidebar_group is the id of
// the manifest group whose pages[] lists it; an unlisted chapter falls back to the manifest's
// first group (fail-soft, warned) instead of a hardcoded DEFAULT_GROUP.
const loadFamilyManifest = ( { specDir, label } ) => {
    const result = readSpecManifest( { specDir: join( REPO, specDir ) } )
    if( !result.found ) {
        console.warn( `  ! ${ label }: spec-manifest not found (${ result.messages.join( '; ' ) }) — grouping degrades to first group` )
    }
    return result
}

const SPEC_MANIFEST = loadFamilyManifest( { specDir: REFS_MANUAL.memo.specDir, label: 'memo' } )
const WORKBENCH_MANIFEST = loadFamilyManifest( { specDir: REFS_MANUAL.workbench.specDir, label: 'workbench' } )
const SESSION_MANIFEST = loadFamilyManifest( { specDir: REFS_MANUAL.session.specDir, label: 'session' } )

// Per-family grouping closure: spec-manifest lookup, fallback to the first group id.
const makeGroupFn = ( { manifest } ) => {
    const fallback = manifest.groups.length > 0 ? manifest.groups[ 0 ].id : 'introduction'
    return ( { filename } ) => groupForFile( { groups: manifest.groups, filename } ) ?? fallback
}

const sidebarGroupFromFilename = makeGroupFn( { manifest: SPEC_MANIFEST } )
const workbenchSidebarGroupFromFilename = makeGroupFn( { manifest: WORKBENCH_MANIFEST } )
const sessionSidebarGroupFromFilename = makeGroupFn( { manifest: SESSION_MANIFEST } )


const collectEntries = async ( { dir, groupFn, label } ) => {
    let names
    try {
        const all = await readdir( dir )
        names = all
            .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
            .sort()
    } catch( error ) {
        console.warn( `No payload found in ${ dir } (${ error.message })` )
        return []
    }

    const collected = await Promise.all( names.map( async ( filename ) => {
        const payloadPath = join( dir, filename )
        const payloadContent = await readFile( payloadPath, 'utf-8' )
        const fm = parseFrontmatter( { content: payloadContent } )
        if( !fm ) {
            console.warn( `  ! ${ label }/${ filename } — could not parse frontmatter, skipping` )
            return null
        }
        console.log( `  ✓ ${ label }/${ filename } — ${ fm.title }` )
        return {
            filename,
            slug: slugFromFilename( { filename } ),
            title: fm.title,
            description: fm.description,
            order: fm.order,
            section: fm.section,
            normative: fm.normative,
            sidebar_group: groupFn( { filename } )
        }
    } ) )
    return collected.filter( ( entry ) => entry !== null )
}


// Additive family block: { version, files[] }, or null when the payload subdir is
// absent/empty (so a not-yet-authored family does not break the build).
const buildFamilyBlock = async ( { dir, groupFn, label, version } ) => {
    const files = await collectEntries( { dir, groupFn, label } )
    if( files.length === 0 ) return { version, files: [] }
    return { version, files }
}


const main = async () => {
    const now = new Date().toISOString()

    console.log( 'Building manifest from docs-payload...' )
    const coreFiles = await collectEntries( { dir: PAYLOAD_DIR, groupFn: sidebarGroupFromFilename, label: 'memo' } )
    const workbench = await buildFamilyBlock( { dir: WORKBENCH_PAYLOAD_DIR, groupFn: workbenchSidebarGroupFromFilename, label: 'workbench', version: WORKBENCH_VERSION } )
    const session = await buildFamilyBlock( { dir: SESSION_PAYLOAD_DIR, groupFn: sessionSidebarGroupFromFilename, label: 'session', version: SESSION_VERSION } )

    const allFiles = [ ...coreFiles, ...workbench.files, ...session.files ]

    const manifest = {
        spec_version: SPEC_VERSION,
        generated_at: now,
        generator: GENERATOR,
        files: coreFiles,
        workbench,
        session,
        stats: {
            total_files: allFiles.length,
            core_files: coreFiles.length,
            workbench_files: workbench.files.length,
            session_files: session.files.length,
            normative_files: allFiles.filter( ( f ) => f.normative ).length,
            informative_files: allFiles.filter( ( f ) => !f.normative ).length
        }
    }

    await mkdir( dirname( MANIFEST_PATH ), { recursive: true } )
    await writeFile( MANIFEST_PATH, JSON.stringify( manifest, null, 4 ) + '\n', 'utf-8' )
    console.log( `\nManifest written to ${ MANIFEST_PATH }` )
    console.log( `Total: ${ manifest.stats.total_files } (memo ${ manifest.stats.core_files }, workbench ${ manifest.stats.workbench_files }, session ${ manifest.stats.session_files }), Normative: ${ manifest.stats.normative_files }, Informative: ${ manifest.stats.informative_files }` )

    // Memo 052 Kap 8: copy each per-version spec-manifest into the docs-payload so it travels
    // the same path as the payload to the public site (sync-spec.mjs → src/data). The site's
    // sidebar.mjs reads its group labels/order from these instead of a hardcoded lockstep map.
    await copySpecManifestsToPayload()
}


const copySpecManifestsToPayload = async () => {
    const families = [
        { specDir: REFS_MANUAL.memo.specDir, name: 'memo', version: SPEC_VERSION },
        { specDir: REFS_MANUAL.workbench.specDir, name: 'workbench', version: WORKBENCH_VERSION },
        { specDir: REFS_MANUAL.session.specDir, name: 'session', version: SESSION_VERSION }
    ]

    await Promise.all( families.map( async ( family ) => {
        const src = join( REPO, family.specDir, 'spec-manifest.json' )
        if( !existsSync( src ) ) {
            console.warn( `  ! ${ family.name }: no spec-manifest.json at ${ src } — site sidebar will fall back` )
            return
        }
        const dataDir = join( REPO, 'dist', family.name, family.version, 'data' )
        await mkdir( dataDir, { recursive: true } )
        const dst = join( dataDir, 'spec-manifest.json' )
        await copyFile( src, dst )
        console.log( `  ✓ spec-manifest → ${ dst.replace( REPO + '/', '' ) }` )
    } ) )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
