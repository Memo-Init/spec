#!/usr/bin/env node
// generate-folder-registry.mjs — memo-init derived folder registry (Memo 074, PRD-07)
//
// The folder contract is machine-readable: each per-folder page in the workbench draft opens
// with a fenced ```folder block (defined in session/13-conventions.md). Those blocks are the
// single authored SOURCE; this generator reads them and derives the canonical registry —
// dist/data/folder-registry.json — the same way generate-manifest.mjs derives the nav manifest.
//
// The registry is the base a project's `.workbench/folders.generated.json` is materialized from
// (the manual `.workbench/config.json` overrides it; the runtime merge is specified in 22-config.md
// and is out of this build's scope). This script also lints:
//   - completeness of each block   — every required key present, every value in range (HARD FAIL)
//   - agreement block vs table      — a block's status/level matches its registry-table row (HARD FAIL)
//   - coverage of the registry      — every registered folder that warrants a page has a block (WARN)
//
// House style: 4-space, no semicolons, single quotes, object params, object returns.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { draftSpecDirRel, distDataDir } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

const REFS_MANUAL = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )
const NAME = 'workbench'
const VERSION = REFS_MANUAL[ NAME ].currentVersion
const DRAFT_DIR = join( REPO, draftSpecDirRel( { name: NAME, version: VERSION } ) )
const OUT_PATH = join( distDataDir( { repoRoot: REPO, name: NAME, version: VERSION } ), 'folder-registry.json' )
const GENERATOR = 'scripts/generate-folder-registry.mjs'

// Allowed value sets for the enum keys (the block schema, mirrored from session/13-conventions.md).
const REQUIRED_KEYS = [ 'name', 'status', 'level', 'entryPoint', 'convention', 'purpose', 'goesIn', 'doesNot', 'git', 'remote' ]
const ENUMS = {
    status: [ 'mandatory', 'optional', 'reserved-default-on', 'conditional' ],
    level: [ 'root', 'project', 'both' ],
    git: [ 'recommended', 'discouraged' ],
    remote: [ 'allowed', 'forbidden' ]
}

// Registered folders that are exempt from the coverage check because they warrant no per-folder
// block by design: two are authored files, `.claude/` is Claude-Code settings, `.session/` is owned
// by the session spec, `.flowmcp/` shares 33-flowmcp's page (its block names `flowmcp/`), and `spec/`
// is specified by its own sections in 12-folders.md rather than a spoke page.
const COVERAGE_EXEMPT = [ 'ABOUT.md', 'CLAUDE.md', '.claude/', '.session/', '.flowmcp/', 'spec/' ]


const extractFolderBlocks = ( { content, filename } ) => {
    const matches = [ ...content.matchAll( /```folder\n([\s\S]*?)\n```/g ) ]
    return matches.map( ( match ) => ( { raw: match[ 1 ], filename } ) )
}


const isNonEmptyString = ( value ) => typeof value === 'string' && value.trim().length > 0

const validateBlock = ( { raw, filename } ) => {
    let parsed = null
    try {
        parsed = JSON.parse( raw )
    } catch( error ) {
        return { ok: false, errors: [ `${ filename }: folder block is not valid JSON (${ error.message })` ], parsed: null }
    }

    const errors = []
    const missing = REQUIRED_KEYS.filter( ( key ) => !( key in parsed ) )
    if( missing.length > 0 ) errors.push( `${ filename }: folder block missing key(s): ${ missing.join( ', ' ) }` )

    Object.entries( ENUMS ).forEach( ( [ key, allowed ] ) => {
        if( ( key in parsed ) && !allowed.includes( parsed[ key ] ) ) {
            errors.push( `${ filename }: "${ key }" is "${ parsed[ key ] }" — must be one of ${ allowed.join( ' | ' ) }` )
        }
    } )

    if( ( 'name' in parsed ) && !( isNonEmptyString( parsed.name ) && parsed.name.endsWith( '/' ) ) ) {
        errors.push( `${ filename }: "name" must be a non-empty string ending with "/"` )
    }

    const textKeys = [ 'purpose', 'goesIn', 'doesNot' ]
    textKeys.forEach( ( key ) => {
        if( ( key in parsed ) && !isNonEmptyString( parsed[ key ] ) ) errors.push( `${ filename }: "${ key }" must be a non-empty string` )
    } )

    const nullableKeys = [ 'entryPoint', 'convention' ]
    nullableKeys.forEach( ( key ) => {
        if( ( key in parsed ) && parsed[ key ] !== null && !isNonEmptyString( parsed[ key ] ) ) {
            errors.push( `${ filename }: "${ key }" must be a string or null` )
        }
    } )

    return { ok: errors.length === 0, errors, parsed }
}


// Normalizers from the human registry-table wording to the machine block enums.
const TABLE_STATUS = {
    'Mandatory': 'mandatory',
    'Optional': 'optional',
    'reserved (custom folder, default-on)': 'reserved-default-on',
    'Required (conditional)': 'conditional'
}
const TABLE_LEVEL = { 'Root': 'root', 'Project': 'project', 'Both': 'both' }

// The rows of the central contract table in 12-folders.md — name plus the human status/level
// cells. Feeds both the coverage warn and the block ↔ table agreement check.
const readRegisteredRows = ( { content } ) => {
    const section = content.split( '## The Folder Contract' )[ 1 ]
    if( !section ) return []
    const table = section.split( /\n## / )[ 0 ]
    const lines = table.split( '\n' ).filter( ( line ) => line.trim().startsWith( '|' ) )
    return lines
        .map( ( line ) => {
            const cells = line.split( '|' ).map( ( cell ) => cell.trim() )
            const token = ( cells[ 1 ] ?? '' ).match( /`([^`]+)`/ )
            if( !token || token[ 1 ] === 'Path' ) return null
            return { name: token[ 1 ], statusRaw: cells[ 2 ] ?? '', levelRaw: cells[ 3 ] ?? '' }
        } )
        .filter( ( row ) => row !== null )
}


const main = async () => {
    const files = ( await readdir( DRAFT_DIR ) )
        .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
        .sort()

    const perFile = await Promise.all( files.map( async ( filename ) => {
        const content = await readFile( join( DRAFT_DIR, filename ), 'utf-8' )
        return extractFolderBlocks( { content, filename } )
    } ) )
    const blocks = perFile.flat()

    const validated = blocks.map( ( block ) => validateBlock( block ) )
    const errors = validated.flatMap( ( result ) => result.errors )

    // Duplicate folder names across blocks are a hard failure — one block per folder.
    const names = validated.filter( ( r ) => r.ok ).map( ( r ) => r.parsed.name )
    const seen = new Set()
    const duplicates = names.filter( ( name ) => seen.has( name ) ? true : ( seen.add( name ), false ) )
    duplicates.forEach( ( name ) => errors.push( `duplicate folder block for "${ name }"` ) )

    if( errors.length > 0 ) {
        console.error( `generate-folder-registry: ${ errors.length } completeness error(s):` )
        errors.forEach( ( e ) => console.error( `  ✗ ${ e }` ) )
        process.exit( 1 )
    }

    const folders = {}
    validated.forEach( ( result, index ) => {
        folders[ result.parsed.name ] = { ...result.parsed, sourcePage: blocks[ index ].filename }
    } )

    const foldersContent = await readFile( join( DRAFT_DIR, '12-folders.md' ), 'utf-8' )
    const registered = readRegisteredRows( { content: foldersContent } )
    const covered = new Set( names )

    // Agreement (HARD FAIL): a block whose status/level disagrees with its registry-table row —
    // the "shape and agreement" half of the Folder-Page Contract lint (session/13-conventions.md).
    const agreementErrors = []
    registered.forEach( ( row ) => {
        const block = folders[ row.name ]
        if( !block ) return
        const wantStatus = TABLE_STATUS[ row.statusRaw ]
        const wantLevel = TABLE_LEVEL[ row.levelRaw ]
        if( wantStatus && block.status !== wantStatus ) agreementErrors.push( `${ row.name }: block status "${ block.status }" disagrees with the registry table ("${ row.statusRaw }" → ${ wantStatus })` )
        if( wantLevel && block.level !== wantLevel ) agreementErrors.push( `${ row.name }: block level "${ block.level }" disagrees with the registry table ("${ row.levelRaw }" → ${ wantLevel })` )
    } )
    if( agreementErrors.length > 0 ) {
        console.error( `generate-folder-registry: ${ agreementErrors.length } agreement error(s) (block ↔ registry table):` )
        agreementErrors.forEach( ( e ) => console.error( `  ✗ ${ e }` ) )
        process.exit( 1 )
    }

    // Coverage (WARN only): a registered folder with no block that is not exempt by design.
    const gaps = registered
        .map( ( row ) => row.name )
        .filter( ( name ) => !covered.has( name ) && !COVERAGE_EXEMPT.includes( name ) )
    gaps.forEach( ( name ) => console.warn( `  ! coverage: registered folder "${ name }" has no folder block (add one, or exempt it)` ) )

    const registry = {
        generated_at: new Date().toISOString(),
        generator: GENERATOR,
        source: `${ NAME }/${ VERSION }/draft/spec (\`\`\`folder blocks)`,
        count: Object.keys( folders ).length,
        folders
    }

    await mkdir( dirname( OUT_PATH ), { recursive: true } )
    await writeFile( OUT_PATH, JSON.stringify( registry, null, 4 ) + '\n', 'utf-8' )
    console.log( `generate-folder-registry: ${ registry.count } folder block(s) → ${ OUT_PATH.replace( REPO + '/', '' ) }` )
    console.log( `  agreement: block status/level checked against the registry table, 0 disagreements` )
    console.log( `  coverage: ${ registered.length } registered, ${ covered.size } with blocks, ${ gaps.length } warn, ${ COVERAGE_EXEMPT.length } exempt by design` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
