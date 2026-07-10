#!/usr/bin/env node
// generate-anchor-register.mjs — memo-init anchor-term register resolver + renderer
//
// Reads data/anchor-terms.json + data/anchor-terms.schema.json, validates the store
// against the schema with AJV, then enforces the anchor-term convention structurally
// (AT1: one canonical label per term; AT2: every owningChapter resolves via its family
// head). On success it writes anchor-terms.resolved.json (the store plus a provenance
// block) and renders anchor-terms.register.md (the deterministic, human-readable page).
//
// The register is a policy-block adjunct of meta-spec 06-conventions-writing.md — a store
// carried by the existing store-and-generator pipeline, NOT a new registry primitive.
// Paths resolve via the family head (lib/layout.mjs), never hardcoded (Memo 064 / M066).

import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import Ajv from 'ajv'

import { draftSpecDirRel, familyHeadPath, aggregatePath } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO_ROOT = join( __dirname, '..' )
const STORE_PATH = join( REPO_ROOT, 'data/anchor-terms.json' )
const SCHEMA_PATH = join( REPO_ROOT, 'data/anchor-terms.schema.json' )
const RESOLVED_PATH = aggregatePath( { repoRoot: REPO_ROOT, file: 'anchor-terms.resolved.json' } )
const REGISTER_PATH = aggregatePath( { repoRoot: REPO_ROOT, file: 'anchor-terms.register.md' } )
const GENERATOR = 'scripts/generate-anchor-register.mjs'


const resolveCommit = ( { cwd } ) => {
    try {
        return execSync( 'git rev-parse HEAD', { cwd } )
            .toString()
            .trim()
    } catch( err ) {
        return 'unknown'
    }
}


const abort = ( { errors } ) => {
    errors.forEach( ( e ) => console.error( e ) )
    console.error( '[ERROR] Aborting anchor-register generation. Manual review required.' )
    process.exit( 1 )
}


// AT2 — the owning chapter must resolve, family-head-robust: read the family head for its
// version, then check <family>/<version>/draft/spec/<owningChapter>.md exists on disk.
const resolveOwningChapter = async ( { term } ) => {
    const headPath = familyHeadPath( { repoRoot: REPO_ROOT, name: term.owningFamily } )
    if( existsSync( headPath ) === false ) {
        return { ok: false, reason: `family head missing for "${ term.owningFamily }" (${ headPath })` }
    }

    const head = JSON.parse( await readFile( headPath, 'utf-8' ) )
    const specDirRel = draftSpecDirRel( { name: term.owningFamily, version: head.version } )
    const chapterAbs = join( REPO_ROOT, specDirRel, `${ term.owningChapter }.md` )

    if( existsSync( chapterAbs ) === false ) {
        return { ok: false, reason: `owningChapter "${ term.owningChapter }" does not resolve (${ join( specDirRel, term.owningChapter ) }.md)` }
    }

    return { ok: true, chapterRel: join( specDirRel, `${ term.owningChapter }.md` ) }
}


const renderRegister = ( { store, fromCommit } ) => {
    const rows = store.terms
        .map( ( t ) => `| \`${ t.id }\` | **${ t.label }** | ${ t.owningFamily } / ${ t.owningChapter } | ${ t.version } |` )
        .join( '\n' )

    const details = store.terms
        .map( ( t ) => {
            const misLabels = t.misLabels.length > 0
                ? t.misLabels.map( ( m ) => `\`${ m }\`` ).join( ', ' )
                : '_(none known)_'
            return [
                `### ${ t.label } — \`${ t.id }\``,
                '',
                `- **Definition:** ${ t.definition }`,
                `- **Not:** ${ t.negativeDelimitation }`,
                `- **Owning chapter:** ${ t.owningFamily } / ${ t.owningChapter } (AT2)`,
                `- **Known mis-labels:** ${ misLabels }`,
                `- **Version:** ${ t.version }`
            ].join( '\n' )
        } )
        .join( '\n\n' )

    return [
        '# Anchor-Term Register',
        '',
        '> **Informative.** This page is rendered deterministically from `data/anchor-terms.json` by',
        `> \`${ GENERATOR }\`. Do not hand-edit — edit the store and re-render. The register is a`,
        '> policy-block adjunct of the meta-spec anchor-term convention (`06-conventions-writing.md`),',
        '> not a new registry primitive.',
        '',
        `Provenance: generated from commit \`${ fromCommit }\`.`,
        '',
        `**${ store.terms.length }** anchor terms, registered under \`${ store.policyBlock }\`.`,
        '',
        '| id | label | owning chapter | version |',
        '|----|-------|----------------|---------|',
        rows,
        '',
        '---',
        '',
        details,
        ''
    ].join( '\n' )
}


const main = async () => {
    const storeRaw = await readFile( STORE_PATH, 'utf-8' )
    const schemaRaw = await readFile( SCHEMA_PATH, 'utf-8' )
    const store = JSON.parse( storeRaw )
    const schema = JSON.parse( schemaRaw )

    const ajv = new Ajv( { allErrors: true, strict: false } )
    const validate = ajv.compile( schema )
    const valid = validate( store )

    if( !valid ) {
        const errors = validate.errors
            .map( ( e ) => `[ERROR] ${ e.instancePath || e.params?.missingProperty } — ${ e.message }` )
        abort( { errors } )
    }

    // AT1 — one canonical label per term, and ids are unique (OASF stable identity).
    const labels = store.terms.map( ( t ) => t.label.toLowerCase() )
    const ids = store.terms.map( ( t ) => t.id )
    const dupLabels = labels.filter( ( l, i ) => labels.indexOf( l ) !== i )
    const dupIds = ids.filter( ( id, i ) => ids.indexOf( id ) !== i )

    if( dupLabels.length > 0 || dupIds.length > 0 ) {
        const errors = [
            ...dupLabels.map( ( l ) => `[ERROR] duplicate label "${ l }" — AT1 requires exactly one term per canonical label` ),
            ...dupIds.map( ( id ) => `[ERROR] duplicate id "${ id }" — an anchor-term id MUST be unique` )
        ]
        abort( { errors } )
    }

    // AT2 — every owningChapter resolves via its family head (path never hardcoded).
    const resolutions = await Promise.all( store.terms.map( async ( term ) => {
        const res = await resolveOwningChapter( { term } )
        return { term, res }
    } ) )

    const unresolved = resolutions.filter( ( r ) => r.res.ok === false )
    if( unresolved.length > 0 ) {
        const errors = unresolved.map( ( r ) => `[ERROR] ${ r.term.id }: ${ r.res.reason }` )
        abort( { errors } )
    }

    const fromCommit = resolveCommit( { cwd: REPO_ROOT } )

    const resolved = {
        ...store,
        generated: {
            at: new Date().toISOString(),
            fromCommit,
            generator: GENERATOR,
            termCount: store.terms.length
        },
        validation: {
            passed: true,
            ajv: true,
            uniqueLabels: true,
            owningChaptersResolve: true
        }
    }

    await writeFile( RESOLVED_PATH, `${ JSON.stringify( resolved, null, 4 ) }\n`, 'utf-8' )
    await writeFile( REGISTER_PATH, renderRegister( { store, fromCommit } ), 'utf-8' )

    console.log( `[OK] anchor-register: ${ store.terms.length } terms validated (AJV + AT1 + AT2).` )
    console.log( `[OK] wrote ${ RESOLVED_PATH.replace( REPO_ROOT + '/', '' ) }` )
    console.log( `[OK] wrote ${ REGISTER_PATH.replace( REPO_ROOT + '/', '' ) }` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
