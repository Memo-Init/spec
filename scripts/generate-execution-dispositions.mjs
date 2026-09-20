#!/usr/bin/env node
// generate-execution-dispositions.mjs — memo-init derived execution-disposition register (PRD-P7)
//
// The disposition vocabulary of the execution guideline is machine-readable: chapter
// 49-execution-workflow-guideline.md opens its register as a fenced ```dispositions block. That
// block is the single authored SOURCE; this generator reads it and derives the canonical register —
// dist/data/execution-dispositions.json — the same way generate-folder-registry.mjs derives the
// folder registry from its ```folder blocks.
//
// A hold on a unit of work is only valid when it carries one of these ids together with everything
// the id's `requires` list demands, so the register has to be readable by a machine rather than
// interpreted out of prose.
//
// The script lints and HARD FAILS on:
//   - a missing block, more than one block, or a block that is not valid JSON
//   - a missing mandatory field on the block or on any entry (id, label, meaning, requires)
//   - a duplicate entry id, or a `requires` list that is not a non-empty list of strings
//   - a run over ZERO entries — a deriver that found nothing to compare has not run
//
// Every run reports how many entries it saw, so a green line always states its comparison base.
//
// House style: 4-space, no semicolons, single quotes, object params, object returns.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { draftSpecDirRel, distDataDir } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

const REFS_MANUAL = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )
const NAME = 'memo'
const VERSION = REFS_MANUAL[ NAME ].currentVersion
const SOURCE_PAGE = '49-execution-workflow-guideline.md'
const SOURCE_PATH = join( REPO, draftSpecDirRel( { name: NAME, version: VERSION } ), SOURCE_PAGE )
const OUT_PATH = join( distDataDir( { repoRoot: REPO, name: NAME, version: VERSION } ), 'execution-dispositions.json' )
const GENERATOR = 'scripts/generate-execution-dispositions.mjs'

// The block schema. The top level carries the register id plus the rule that an unnamed hold is
// inadmissible; each entry carries its id, its human label, its meaning, and what a hold under that
// id must carry to be valid.
const REQUIRED_BLOCK_KEYS = [ 'id', 'rule', 'dispositions' ]
const REQUIRED_ENTRY_KEYS = [ 'id', 'label', 'meaning', 'requires' ]

// The ids the guideline names; a register that lost one of them is a defect, not a shorter register.
const REQUIRED_IDS = [ 'done', 'partial', 'deferred', 'blocked', 'user-gated', 'no-with-snag' ]


const isNonEmptyString = ( value ) => typeof value === 'string' && value.trim().length > 0


const extractDispositionBlocks = ( { content } ) => {
    const matches = [ ...content.matchAll( /```dispositions\n([\s\S]*?)\n```/g ) ]

    return matches.map( ( match ) => match[ 1 ] )
}


const validateEntry = ( { entry, index } ) => {
    const where = `dispositions[${ index }]`
    if( entry === null || typeof entry !== 'object' || Array.isArray( entry ) === true ) {
        return [ `${ where }: entry must be an object` ]
    }

    const errors = []
    const missing = REQUIRED_ENTRY_KEYS.filter( ( key ) => !( key in entry ) )
    if( missing.length > 0 ) errors.push( `${ where }: missing key(s): ${ missing.join( ', ' ) }` )

    const textKeys = [ 'id', 'label', 'meaning' ]
    textKeys.forEach( ( key ) => {
        if( ( key in entry ) && !isNonEmptyString( entry[ key ] ) ) errors.push( `${ where }: "${ key }" must be a non-empty string` )
    } )

    if( 'requires' in entry ) {
        const requires = entry.requires
        const ok = Array.isArray( requires ) && requires.length > 0 && requires.every( ( item ) => isNonEmptyString( item ) )
        if( ok === false ) errors.push( `${ where }: "requires" must be a non-empty list of strings — a disposition that demands nothing cannot be checked` )
    }

    return errors
}


const validateBlock = ( { raw } ) => {
    let parsed = null
    try {
        parsed = JSON.parse( raw )
    } catch( error ) {
        // count stays 0 so the caller always has a comparison base to report, even here.
        return { ok: false, errors: [ `${ SOURCE_PAGE }: dispositions block is not valid JSON (${ error.message })` ], parsed: null, count: 0 }
    }

    const errors = []
    const missing = REQUIRED_BLOCK_KEYS.filter( ( key ) => !( key in parsed ) )
    if( missing.length > 0 ) errors.push( `${ SOURCE_PAGE }: dispositions block missing key(s): ${ missing.join( ', ' ) }` )

    if( ( 'id' in parsed ) && !isNonEmptyString( parsed.id ) ) errors.push( `${ SOURCE_PAGE }: "id" must be a non-empty string` )
    if( ( 'rule' in parsed ) && !isNonEmptyString( parsed.rule ) ) errors.push( `${ SOURCE_PAGE }: "rule" must be a non-empty string` )

    const entries = Array.isArray( parsed.dispositions ) === true ? parsed.dispositions : []
    if( Array.isArray( parsed.dispositions ) === false ) errors.push( `${ SOURCE_PAGE }: "dispositions" must be a list` )

    entries.forEach( ( entry, index ) => validateEntry( { entry, index } ).forEach( ( e ) => errors.push( `${ SOURCE_PAGE }: ${ e }` ) ) )

    const ids = entries
        .filter( ( entry ) => entry !== null && typeof entry === 'object' && isNonEmptyString( entry.id ) )
        .map( ( entry ) => entry.id )
    const seen = new Set()
    ids
        .filter( ( id ) => seen.has( id ) === true ? true : ( seen.add( id ), false ) )
        .forEach( ( id ) => errors.push( `${ SOURCE_PAGE }: duplicate disposition id "${ id }"` ) )

    REQUIRED_IDS
        .filter( ( id ) => seen.has( id ) === false )
        .forEach( ( id ) => errors.push( `${ SOURCE_PAGE }: the register does not carry the required disposition "${ id }"` ) )

    return { ok: errors.length === 0, errors, parsed, count: entries.length }
}


const main = async () => {
    const content = await readFile( SOURCE_PATH, 'utf-8' )
    const blocks = extractDispositionBlocks( { content } )

    // No block and two blocks are the same defect class: there is no single authored source to
    // derive from. Reported before parsing, because neither case has a count to report.
    if( blocks.length !== 1 ) {
        console.error( `generate-execution-dispositions: expected exactly 1 \`\`\`dispositions block in ${ SOURCE_PAGE }, found ${ blocks.length }` )
        process.exit( 1 )
    }

    const validated = validateBlock( { raw: blocks[ 0 ] } )

    // A run over zero entries is the vacuum-green failure mode: nothing to compare is a finding,
    // never a pass. Checked FIRST so the message names that cause rather than burying it under the
    // per-id errors an empty register also produces.
    if( validated.parsed !== null && validated.count === 0 ) {
        console.error( `generate-execution-dispositions: 0 entries seen — a register without entries is a finding, not a green run` )
        process.exit( 1 )
    }

    if( validated.ok === false ) {
        console.error( `generate-execution-dispositions: ${ validated.errors.length } completeness error(s), ${ validated.count } entr(ies) seen:` )
        validated.errors.forEach( ( e ) => console.error( `  ✗ ${ e }` ) )
        process.exit( 1 )
    }

    const dispositions = {}
    validated.parsed.dispositions.forEach( ( entry ) => {
        dispositions[ entry.id ] = { ...entry, sourcePage: SOURCE_PAGE }
    } )

    const registry = {
        generated_at: new Date().toISOString(),
        generator: GENERATOR,
        source: `${ NAME }/${ VERSION }/draft/spec/${ SOURCE_PAGE } (\`\`\`dispositions block)`,
        id: validated.parsed.id,
        rule: validated.parsed.rule,
        count: validated.count,
        dispositions
    }

    await mkdir( dirname( OUT_PATH ), { recursive: true } )
    await writeFile( OUT_PATH, JSON.stringify( registry, null, 4 ) + '\n', 'utf-8' )
    console.log( `generate-execution-dispositions: ${ registry.count } disposition(s) seen → ${ OUT_PATH.replace( REPO + '/', '' ) }` )
    console.log( `  required: ${ REQUIRED_IDS.length } named id(s) checked, 0 missing` )
    console.log( `  fields: id/label/meaning/requires checked on ${ registry.count } entr(ies), 0 incomplete` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
