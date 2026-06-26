#!/usr/bin/env node
// generate-manifest.mjs — memo-init docs-payload manifest
//
// Reads generated/docs-payload/**/*.md, parses each frontmatter, and writes
// generated/docs-payload/manifest.json summarizing all files across the three
// sibling spec families:
//   manifest.files            — core chapters (manifest.spec_version)
//   manifest.workbench        — { version, files[] } (own version line)
//   manifest.sop              — { version, files[] } (own version line)
//
// Each family gets its own sidebar_group mapping (Introduction-first), mirroring
// FlowMCP's buildGradingBlock / buildBestPracticeBlock. The workbench/sop blocks
// are additive — manifest.files (core) stays byte-compatible.
//
// Output format documented in generated/README.md.

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

const REFS_MANUAL = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )
const SPEC_VERSION = REFS_MANUAL.spec.currentVersion
const WORKBENCH_VERSION = REFS_MANUAL.workbench.currentVersion
const SOP_VERSION = REFS_MANUAL.sop.currentVersion
const SESSION_VERSION = REFS_MANUAL.session.currentVersion

const PAYLOAD_DIR = join( REPO, 'generated/docs-payload' )
const WORKBENCH_PAYLOAD_DIR = join( PAYLOAD_DIR, 'workbench' )
const SOP_PAYLOAD_DIR = join( PAYLOAD_DIR, 'sop' )
const SESSION_PAYLOAD_DIR = join( PAYLOAD_DIR, 'session' )
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


// Core sidebar mapping: 00-01 are the introduction (overview + philosophy); the
// remaining chapters are grouped into one-word topic categories (Memo 041 Teil A —
// the order->group payload .memo/memos/041-.../context/category-remapping.json is the
// single source of truth for this table). The 12-group set: introduction, input,
// initialisierung, revision, execution, procedure, behavior, health, agents, git,
// skills. Any chapter not listed here falls through to DEFAULT_GROUP — set to
// `introduction` so an accidentally-unmapped chapter surfaces at the very top of the
// sidebar where it is immediately noticed and fixed (fail-loud). Every current
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
    26: 'health', 31: 'health', 33: 'health', 45: 'health',
    14: 'agents', 15: 'agents', 36: 'agents',
    16: 'git', 17: 'git', 19: 'git', 39: 'git', 44: 'git',
    43: 'skills'
}
const sidebarGroupFromFilename = ( { filename } ) => {
    const match = filename.match( /^(\d{2})-/ )
    if( !match ) return DEFAULT_GROUP
    const order = parseInt( match[ 1 ], 10 )
    if( order <= 1 ) return 'introduction'
    return SIDEBAR_GROUP_BY_ORDER[ order ] ?? DEFAULT_GROUP
}


// Workbench sidebar mapping (own family, Introduction-first). Number ranges keep the
// reading order Introduction → Folders → CLI → Tools → Reference:
//   00-09 introduction · 10-19 folders · 20-29 cli · 30-39 tools · 40+ reference.
//
// Special-cases (numbers stay put so published slug links never break — categories are
// introduced by overriding specific orders, not by renumbering files):
//   - 22, 23, 41 → 'core' (Memo 045 Ch5 + Memo 047 Ch5): the `.workbench/` config (22, producing
//     side), the hooks contract (23, consuming side), and the merged Architecture chapter (41 — the
//     core two-level diagram + project architecture, formerly 40+41 in 'reference') form the workbench
//     Core. The 'reference' category is dissolved: 40 was merged into 41 and 41 moves to Core, so no
//     workbench chapter maps to 'reference' anymore.
//   - 30, 13, 18 → 'wiki' (Memo 045 Ch7 + Memo 047 Ch4.5): the wiki (30) is its own category,
//     and its storage formats move conceptually under it — OKF (13) and DESIGN.md (18) both. 18
//     joins symmetrically with 13: 30-wiki lists both as storage formats, so the design convention
//     sits under the wiki the same way OKF does (the 045 asymmetry where 18 stayed in 'folders').
const workbenchSidebarGroupFromFilename = ( { filename } ) => {
    const match = filename.match( /^(\d{2})-/ )
    if( !match ) return 'introduction'
    const order = parseInt( match[ 1 ], 10 )
    // Memo 047 Ch5 (F7=A) nav-restructure:
    //   - 25 → 'core': the validation overview is the wayfinder over the hooks-contract enforcement,
    //     so it sits with the config/hooks Core pair (was 'cli').
    //   - 26 → 'folders': the add-on MODEL reunites with the add-on TAXONOMY in 12-folders — the
    //     "Add-on story split across 12+26" finding (was 'cli').
    //   - 32 → 'folders': trash is a registered folder; its page belongs with the folder contract
    //     (was 'tools').
    if( order === 22 || order === 23 || order === 25 || order === 41 ) return 'core'
    if( order === 30 || order === 13 || order === 18 ) return 'wiki'
    if( order === 26 || order === 32 ) return 'folders'
    if( order <= 9 ) return 'introduction'
    if( order <= 19 ) return 'folders'
    if( order <= 29 ) return 'cli'
    if( order <= 39 ) return 'tools'
    return 'reference'
}


// SOP-Spec is deliberately thin — a single Introduction group.
const sopSidebarGroupFromFilename = () => 'introduction'


// Session-Spec is deliberately thin — a single Introduction group (Genesis Root family).
const sessionSidebarGroupFromFilename = () => 'introduction'


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
    const coreFiles = await collectEntries( { dir: PAYLOAD_DIR, groupFn: sidebarGroupFromFilename, label: 'core' } )
    const workbench = await buildFamilyBlock( { dir: WORKBENCH_PAYLOAD_DIR, groupFn: workbenchSidebarGroupFromFilename, label: 'workbench', version: WORKBENCH_VERSION } )
    const sop = await buildFamilyBlock( { dir: SOP_PAYLOAD_DIR, groupFn: sopSidebarGroupFromFilename, label: 'sop', version: SOP_VERSION } )
    const session = await buildFamilyBlock( { dir: SESSION_PAYLOAD_DIR, groupFn: sessionSidebarGroupFromFilename, label: 'session', version: SESSION_VERSION } )

    const allFiles = [ ...coreFiles, ...workbench.files, ...sop.files, ...session.files ]

    const manifest = {
        spec_version: SPEC_VERSION,
        generated_at: now,
        generator: GENERATOR,
        files: coreFiles,
        workbench,
        sop,
        session,
        stats: {
            total_files: allFiles.length,
            core_files: coreFiles.length,
            workbench_files: workbench.files.length,
            sop_files: sop.files.length,
            session_files: session.files.length,
            normative_files: allFiles.filter( ( f ) => f.normative ).length,
            informative_files: allFiles.filter( ( f ) => !f.normative ).length
        }
    }

    await writeFile( MANIFEST_PATH, JSON.stringify( manifest, null, 4 ) + '\n', 'utf-8' )
    console.log( `\nManifest written to ${ MANIFEST_PATH }` )
    console.log( `Total: ${ manifest.stats.total_files } (core ${ manifest.stats.core_files }, workbench ${ manifest.stats.workbench_files }, sop ${ manifest.stats.sop_files }, session ${ manifest.stats.session_files }), Normative: ${ manifest.stats.normative_files }, Informative: ${ manifest.stats.informative_files }` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
