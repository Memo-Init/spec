#!/usr/bin/env node
// generate-refs.mjs — memo-init spec refs resolver
//
// Reads data/refs.manual.json + data/refs.schema.json, validates the manual
// against the schema with AJV, and on success writes dist/refs.resolved.json
// (the manual plus a `generated` provenance block and a `validation` block).
//
// memo-init is simpler than FlowMCP: there are no github: imports to expand and
// no grading/best-practice tracks. The script just validates and stamps.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import Ajv from 'ajv'

import { aggregatePath, familyHeadPath } from './lib/layout.mjs'
import { composeSpecId } from './lib/spec-id.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO_ROOT = join( __dirname, '..' )
const MANUAL_PATH = join( REPO_ROOT, 'data/refs.manual.json' )
const SCHEMA_PATH = join( REPO_ROOT, 'data/refs.schema.json' )
const RESOLVED_PATH = aggregatePath( { repoRoot: REPO_ROOT, file: 'refs.resolved.json' } )
const GENERATOR = 'scripts/generate-refs.mjs'
// The families that carry a head + a refs block. Same list as the skill-map merge — the container's
// spec.json heads ARE the source of family identity, so it stays in lockstep with them.
const FAMILIES = [ 'memo', 'workbench', 'session', 'spec' ]
// The one spec-id format (Kap 4 / Kap 17). The token is the lowercase namespace name, so the build
// fails loud if any composed id drifts out of the shared format.
const SPEC_ID_RE = /^[a-z0-9][a-z0-9-]*@\d+\.\d+\.\d+:([0-9a-f]{7}|unknown)$/


const resolveCommit = ( { cwd } ) => {
    try {
        // Full 40-char HEAD SHA (Memo 064 MI-S3): fromCommit carries the full SHA; the 7-char shortSha
        // for specId / the llms stamp is derived downstream by composeSpecId (spec-id.mjs). The
        // `unknown` sentinel (no git, Kap 9) is preserved unchanged.
        return execSync( 'git rev-parse HEAD', { cwd } )
            .toString()
            .trim()
    } catch( err ) {
        return 'unknown'
    }
}


const main = async () => {
    const manualRaw = await readFile( MANUAL_PATH, 'utf-8' )
    const schemaRaw = await readFile( SCHEMA_PATH, 'utf-8' )
    const manual = JSON.parse( manualRaw )
    const schema = JSON.parse( schemaRaw )

    const ajv = new Ajv( { allErrors: true, strict: false } )
    const validate = ajv.compile( schema )
    const valid = validate( manual )

    if( !valid ) {
        const errors = validate.errors
            .map( ( e ) => `[ERROR] ${ e.instancePath || e.params?.missingProperty } — ${ e.message }` )
            .join( '\n' )
        console.error( errors )
        console.error( '[ERROR] Aborting refs.resolved.json generation. Manual review required.' )
        process.exit( 1 )
    }

    const fromCommit = resolveCommit( { cwd: REPO_ROOT } )

    const checks = [
        { field: 'schemaVersion', regex: '^refs/\\d+\\.\\d+\\.\\d+$', ok: /^refs\/\d+\.\d+\.\d+$/.test( manual.schemaVersion ) },
        { field: 'memo.currentVersion', regex: '^\\d+\\.\\d+\\.\\d+$', ok: /^\d+\.\d+\.\d+$/.test( manual.memo.currentVersion ) },
        { field: 'memo.specDir', regex: '^(draft/memo/\\d+\\.\\d+\\.\\d+/spec|spec/memo/\\d+\\.\\d+\\.\\d+/draft/spec)$', ok: /^(draft\/memo\/\d+\.\d+\.\d+\/spec|spec\/memo\/\d+\.\d+\.\d+\/draft\/spec)$/.test( manual.memo.specDir ) }
    ]

    const violations = checks.filter( ( c ) => !c.ok )
    if( violations.length > 0 ) {
        violations.forEach( ( v ) => {
            console.error( `[ERROR] ${ v.field } — does not match ${ v.regex }` )
        } )
        console.error( '[ERROR] Aborting refs.resolved.json generation. Manual review required.' )
        process.exit( 1 )
    }

    // Compose the spec identifier per family from its head (Memo 064 MI-S9, Kap 4). The token is the
    // head's lowercase namespace name (`slug`, e.g. `memo`) — NOT the uppercase `namespaceToken` (MC),
    // which is the manifest short-token qualifying GR-codes and stays audit-locked to the manifest.
    // `fromCommit` is resolved from HEAD exactly once above and only read here — no SHA→file→SHA loop.
    const families = await Promise.all( FAMILIES.map( async ( family ) => {
        const headPath = familyHeadPath( { repoRoot: REPO_ROOT, name: family } )
        const head = JSON.parse( await readFile( headPath, 'utf-8' ) )
        const specId = composeSpecId( { namespaceToken: head.slug, version: head.version, fromCommit } )

        return { family, headPath, head, specId }
    } ) )

    const malformed = families.filter( ( f ) => SPEC_ID_RE.test( f.specId ) === false )
    if( malformed.length > 0 ) {
        malformed.forEach( ( f ) => {
            console.error( `[ERROR] ${ f.family }.specId "${ f.specId }" does not match ${ SPEC_ID_RE }` )
        } )
        console.error( '[ERROR] Aborting refs.resolved.json generation. Manual review required.' )
        process.exit( 1 )
    }

    const resolved = {
        ...manual,
        generated: {
            at: new Date().toISOString(),
            fromCommit,
            generator: GENERATOR
        },
        validation: {
            passed: true,
            checks
        }
    }

    // Additive propagation into each family block (generated/validation blocks stay untouched).
    families.forEach( ( f ) => {
        resolved[ f.family ] = { ...resolved[ f.family ], specId: f.specId }
    } )

    await mkdir( dirname( RESOLVED_PATH ), { recursive: true } )
    await writeFile( RESOLVED_PATH, JSON.stringify( resolved, null, 4 ) + '\n', 'utf-8' )

    // Anchor the same string in each family head as a generated field (authored fields untouched).
    await Promise.all( families.map( async ( f ) => {
        const stamped = { ...f.head, generated: { ...( f.head.generated ?? {} ), specId: f.specId } }
        await writeFile( f.headPath, JSON.stringify( stamped, null, 4 ) + '\n', 'utf-8' )
    } ) )

    console.log( `[OK] Wrote ${ RESOLVED_PATH }` )
    families.forEach( ( f ) => console.log( `[OK] ${ f.family } specId = ${ f.specId }` ) )
}


main()
    .catch( ( err ) => {
        console.error( err )
        process.exit( 1 )
    } )
