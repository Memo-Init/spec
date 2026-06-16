#!/usr/bin/env node
// audit-spec-quality.mjs — idempotent spec-quality gate
//
// Checks every numbered spec page (00-30) in the source tree for
//   (a) intro prose between the metadata table and the first "## " heading
//   (b) a bottom "## Related" section
// README is exempt (not a numbered page). Exits 1 on any violation, 0 when clean.
// Read-only: writes nothing, so repeated runs are stable (Spec ch28 idempotent gate).

import { readdir, readFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

const SPEC_VERSION = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) ).spec.currentVersion
const SPEC_DIR = join( REPO, `spec/v${ SPEC_VERSION }` )


const isMetaTableLine = ( { line } ) => {
    return line.trim().startsWith( '|' )
}


const hasIntroProse = ( { content } ) => {
    const lines = content.split( '\n' )
    // Find the metadata table block (the leading "|...|" run that contains a Status row).
    const firstTableIndex = lines.findIndex( ( line ) => isMetaTableLine( { line } ) )
    if( firstTableIndex === -1 ) return false
    const afterTable = lines
        .slice( firstTableIndex )
        .findIndex( ( line, i ) => i > 0 && !isMetaTableLine( { line } ) )
    const bodyStart = afterTable === -1 ? lines.length : firstTableIndex + afterTable
    const firstHeadingOffset = lines
        .slice( bodyStart )
        .findIndex( ( line ) => /^##\s/.test( line ) )
    const headingIndex = firstHeadingOffset === -1 ? lines.length : bodyStart + firstHeadingOffset
    const between = lines.slice( bodyStart, headingIndex )
    const prose = between
        .map( ( line ) => line.trim() )
        .filter( ( line ) => line !== '' )
        .filter( ( line ) => !line.startsWith( '|' ) )
        .filter( ( line ) => !line.startsWith( '#' ) )
        .filter( ( line ) => !line.startsWith( '---' ) )
        .filter( ( line ) => !line.startsWith( '```' ) )
        .filter( ( line ) => !line.startsWith( '>' ) )
    return prose.length > 0
}


const hasRelatedSection = ( { content } ) => {
    return /^##\s+Related\s*$/m.test( content )
}


const auditPage = async ( { filename } ) => {
    const content = await readFile( join( SPEC_DIR, filename ), 'utf-8' )
    const violations = []
    if( !hasIntroProse( { content } ) ) violations.push( 'MISSING_INTRO' )
    if( !hasRelatedSection( { content } ) ) violations.push( 'MISSING_RELATED' )
    return { filename, violations }
}


const main = async () => {
    const all = await readdir( SPEC_DIR )
    const pages = all
        .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
        .sort()
    const results = await Promise.all( pages.map( ( filename ) => auditPage( { filename } ) ) )
    const failures = results.filter( ( r ) => r.violations.length > 0 )

    results.forEach( ( r ) => {
        const status = r.violations.length === 0 ? 'ok' : r.violations.join( ',' )
        console.log( `  ${ r.violations.length === 0 ? '✓' : '✗' } ${ r.filename } — ${ status }` )
    } )

    if( failures.length > 0 ) {
        console.error( `\nSpec-quality gate FAILED: ${ failures.length } page(s) with violations.` )
        process.exit( 1 )
    }
    console.log( `\nSpec-quality gate PASSED: ${ pages.length } pages, 0 violations (README exempt).` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
