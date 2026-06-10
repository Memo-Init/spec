#!/usr/bin/env node
// generate-refs.mjs — memo-init spec refs resolver
//
// Reads data/refs.manual.json + data/refs.schema.json, validates the manual
// against the schema with AJV, and on success writes generated/refs.resolved.json
// (the manual plus a `generated` provenance block and a `validation` block).
//
// memo-init is simpler than FlowMCP: there are no github: imports to expand and
// no grading/best-practice tracks. The script just validates and stamps.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import Ajv from 'ajv'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO_ROOT = join( __dirname, '..' )
const MANUAL_PATH = join( REPO_ROOT, 'data/refs.manual.json' )
const SCHEMA_PATH = join( REPO_ROOT, 'data/refs.schema.json' )
const RESOLVED_PATH = join( REPO_ROOT, 'generated/refs.resolved.json' )
const GENERATOR = 'scripts/generate-refs.mjs'


const resolveCommit = ( { cwd } ) => {
    try {
        return execSync( 'git rev-parse --short HEAD', { cwd } )
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
        { field: 'spec.currentVersion', regex: '^\\d+\\.\\d+\\.\\d+$', ok: /^\d+\.\d+\.\d+$/.test( manual.spec.currentVersion ) },
        { field: 'spec.specDir', regex: '^spec/v\\d+\\.\\d+\\.\\d+$', ok: /^spec\/v\d+\.\d+\.\d+$/.test( manual.spec.specDir ) }
    ]

    const violations = checks.filter( ( c ) => !c.ok )
    if( violations.length > 0 ) {
        violations.forEach( ( v ) => {
            console.error( `[ERROR] ${ v.field } — does not match ${ v.regex }` )
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

    await mkdir( dirname( RESOLVED_PATH ), { recursive: true } )
    await writeFile( RESOLVED_PATH, JSON.stringify( resolved, null, 4 ) + '\n', 'utf-8' )

    console.log( `[OK] Wrote ${ RESOLVED_PATH }` )
}


main()
    .catch( ( err ) => {
        console.error( err )
        process.exit( 1 )
    } )
