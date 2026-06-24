#!/usr/bin/env node
// generate-manifest.mjs — memo-init docs-payload manifest
//
// Reads generated/docs-payload/**/*.md, parses each frontmatter, and writes
// generated/docs-payload/manifest.json summarizing all files. The core chapters
// live in manifest.files; the workbench sub-spec chapters live in
// manifest.workbench.files.
//
// memo-init is simpler than FlowMCP: no quality checker, no schema-stats fetch.
//
// Output format documented in generated/README.md.

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

const SPEC_VERSION = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) ).spec.currentVersion
const PAYLOAD_DIR = join( REPO, 'generated/docs-payload' )
const WORKBENCH_PAYLOAD_DIR = join( PAYLOAD_DIR, 'workbench' )
const MANIFEST_PATH = join( PAYLOAD_DIR, 'manifest.json' )
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


// Sidebar mapping: 00-01 are the introduction (overview + philosophy); the
// remaining chapters are grouped into one-word topic categories (Memo 041 Teil A —
// the order->group payload .memo/memos/041-.../context/category-remapping.json is the
// single source of truth for this table). The umbrella groups `foundations` and
// `finalization` were dissolved (Memo 041 F2=A) into the finer 12-group set:
// introduction, input, initialisierung, revision, execution, procedure, behavior,
// health, agents, git, skills (+ workbench, which is its own separate payload).
// Workbench files form their own group. Any chapter not listed here falls through to
// DEFAULT_GROUP — set to `introduction` so an accidentally-unmapped chapter surfaces at
// the very top of the sidebar where it is immediately noticed and fixed (fail-loud), and
// never points at a dissolved group (PRD-005 "Vollständigkeit" assertion). Every current
// chapter 02-44 is mapped explicitly, so the default never triggers today.
const DEFAULT_GROUP = 'introduction'
const SIDEBAR_GROUP_BY_ORDER = {
    2: 'introduction', 30: 'introduction',
    3: 'input', 4: 'input', 37: 'input',
    5: 'initialisierung', 6: 'initialisierung', 10: 'initialisierung', 35: 'initialisierung',
    7: 'revision', 11: 'revision', 20: 'revision', 34: 'revision', 40: 'revision',
    8: 'execution', 12: 'execution', 13: 'execution', 25: 'execution', 27: 'execution', 32: 'execution', 38: 'execution', 42: 'execution',
    22: 'procedure', 23: 'procedure', 24: 'procedure',
    9: 'behavior', 18: 'behavior', 21: 'behavior', 28: 'behavior', 29: 'behavior', 41: 'behavior',
    26: 'health', 31: 'health', 33: 'health',
    14: 'agents', 15: 'agents', 36: 'agents',
    16: 'git', 17: 'git', 19: 'git', 39: 'git', 44: 'git',
    43: 'skills'
}
const sidebarGroupFromFilename = ( { filename, group } ) => {
    if( group === 'workbench' ) return 'workbench'
    const match = filename.match( /^(\d{2})-/ )
    if( !match ) return DEFAULT_GROUP
    const order = parseInt( match[ 1 ], 10 )
    if( order <= 1 ) return 'introduction'
    return SIDEBAR_GROUP_BY_ORDER[ order ] ?? DEFAULT_GROUP
}


const collectEntries = async ( { dir, group } ) => {
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

    const entries = []
    for( const filename of names ) {
        const payloadPath = join( dir, filename )
        const payloadContent = await readFile( payloadPath, 'utf-8' )
        const fm = parseFrontmatter( { content: payloadContent } )
        if( !fm ) {
            console.warn( `  ! ${ group }/${ filename } — could not parse frontmatter, skipping` )
            continue
        }
        entries.push( {
            filename,
            slug: slugFromFilename( { filename } ),
            title: fm.title,
            description: fm.description,
            order: fm.order,
            section: fm.section,
            normative: fm.normative,
            sidebar_group: sidebarGroupFromFilename( { filename, group } )
        } )
        console.log( `  ✓ ${ group }/${ filename } — ${ fm.title }` )
    }
    return entries
}


const main = async () => {
    const now = new Date().toISOString()

    console.log( 'Building manifest from docs-payload...' )
    const coreFiles = await collectEntries( { dir: PAYLOAD_DIR, group: 'core' } )
    const workbenchFiles = await collectEntries( { dir: WORKBENCH_PAYLOAD_DIR, group: 'workbench' } )

    const manifest = {
        spec_version: SPEC_VERSION,
        generated_at: now,
        generator: GENERATOR,
        files: coreFiles,
        workbench: {
            files: workbenchFiles
        },
        stats: {
            total_files: coreFiles.length + workbenchFiles.length,
            core_files: coreFiles.length,
            workbench_files: workbenchFiles.length,
            normative_files: [ ...coreFiles, ...workbenchFiles ].filter( ( f ) => f.normative ).length,
            informative_files: [ ...coreFiles, ...workbenchFiles ].filter( ( f ) => !f.normative ).length
        }
    }

    await writeFile( MANIFEST_PATH, JSON.stringify( manifest, null, 4 ) + '\n', 'utf-8' )
    console.log( `\nManifest written to ${ MANIFEST_PATH }` )
    console.log( `Total: ${ manifest.stats.total_files } (core ${ manifest.stats.core_files }, workbench ${ manifest.stats.workbench_files }), Normative: ${ manifest.stats.normative_files }, Informative: ${ manifest.stats.informative_files }` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
