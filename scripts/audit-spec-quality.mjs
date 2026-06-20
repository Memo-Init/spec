#!/usr/bin/env node
// audit-spec-quality.mjs — idempotent spec-quality gate
//
// Checks every numbered spec page (00-NN) in the source tree for
//   (a) intro prose between the metadata table and the first "## " heading
//   (b) a bottom "## Related" section
//   (c) no internal references in outward-facing text (Memo 035, ch19) — over the
//       numbered pages AND the chapter-index README. This is the deterministic check
//       (runner) of REQ-056: outward-facing spec text MUST NOT carry memo-numbered gate
//       codes, concrete goal-store ids, or memo references in prose. The ID/goal SCHEMA
//       itself is public vocabulary and exempt (a line documenting the format).
// README (repo-level) is exempt from (a)/(b); the chapter-index README is leak-scanned.
// Exits 1 on any violation, 0 when clean.
// Read-only by default: writes nothing, so repeated runs are stable (Spec ch28 idempotent
// gate). Opt-in: --emit-evidence back-writes the REQ-056 scanner evidence into the
// requirements store (used by the memo-finalize gate; never on the CI/push path).

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const PROJECT_ROOT = resolve( REPO, '..', '..' )

const SPEC_VERSION = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) ).spec.currentVersion
const SPEC_DIR = join( REPO, `spec/v${ SPEC_VERSION }` )

const REQ_ID = 'REQ-056'


// Internal-reference catalog (REQ-056, derived from ch19 "No Internal References" /
// "Leak Prohibition"). Each pattern names a concrete inward instance:
//   - memo-numbered gate / answer codes (e.g. a lint gate named after the memo that bore it)
//   - concrete goal-store ids (e.g. a single goal id)
//   - memo references in prose (capitalized "Memo NNN")
// The ID schema itself (ch17: M{NNN}-{PP}-{RR}, the goal pattern G\d{3}) is documented
// public vocabulary, NOT a leak — lines carrying a schema token are exempt.
const INTERNAL_REF_PATTERNS = [
    { id: 'memo-gate-code', re: /MEMO-\d+/ },
    { id: 'goal-id', re: /\bG\d{3}\b/ },
    { id: 'memo-ref', re: /\bMemo \d+/ }
]


// A line documenting the ID/goal FORMAT is exempt: a regex token (\d) or a curly
// placeholder ({NNN}, {N}, {CTX}, ...) marks the line as schema, not a concrete instance.
const isSchemaLine = ( { line } ) => {
    return /\\d|\{[A-Z]+\}/.test( line )
}


const findInternalRefs = ( { content } ) => {
    const lines = content.split( '\n' )
    const hits = []
    lines.forEach( ( line, index ) => {
        if( isSchemaLine( { line } ) === true ) return
        INTERNAL_REF_PATTERNS.forEach( ( { id, re } ) => {
            const match = line.match( re )
            if( match !== null ) hits.push( { line: index + 1, pattern: id, match: match[ 0 ] } )
        } )
    } )

    return hits
}


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


const auditPage = async ( { filename, leakOnly = false } ) => {
    const content = await readFile( join( SPEC_DIR, filename ), 'utf-8' )
    const violations = []
    if( leakOnly === false ) {
        if( !hasIntroProse( { content } ) ) violations.push( 'MISSING_INTRO' )
        if( !hasRelatedSection( { content } ) ) violations.push( 'MISSING_RELATED' )
    }
    const internalRefs = findInternalRefs( { content } )
    internalRefs.forEach( ( ref ) => {
        violations.push( `INTERNAL_REF:${ ref.pattern }@L${ ref.line }(${ ref.match })` )
    } )

    return { filename, violations, internalRefs }
}


// Opt-in: back-write the REQ-056 scanner evidence so the requirements runner (kind=tool)
// consumes a real PASS/BLOCKED instead of staying INCONCLUSIVE. Dual-scan the store
// (.memo/_requirements preferred, legacy .memo/requirements as fallback). No store -> skip.
const emitEvidence = async ( { status, leakCount } ) => {
    const candidates = [ '_requirements', 'requirements' ]
        .map( ( name ) => resolve( PROJECT_ROOT, '.memo', name ) )
    const storeDir = candidates.find( ( dir ) => existsSync( dir ) === true )
    if( storeDir === undefined ) {
        console.error( '--emit-evidence: no requirements store under .memo — evidence not written.' )

        return
    }
    const evidenceDir = resolve( storeDir, 'reports', 'evidence' )
    await mkdir( evidenceDir, { recursive: true } )
    const evidence = {
        status,
        scanner: 'audit-spec-quality.mjs',
        tactic: 'no-internal-ref-scan',
        summary: { leakCount, checked: 'spec/v0.1.0 numbered pages + chapter-index README' }
    }
    const evidencePath = resolve( evidenceDir, `${ REQ_ID }.evidence.json` )
    await writeFile( evidencePath, `${ JSON.stringify( evidence, null, 2 ) }\n` )
    console.log( `  evidence: ${ evidencePath } (${ status })` )
}


const main = async () => {
    const emit = process.argv.slice( 2 ).includes( '--emit-evidence' )
    const all = await readdir( SPEC_DIR )
    const pages = all
        .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
        .sort()
    const numbered = await Promise.all( pages.map( ( filename ) => auditPage( { filename } ) ) )
    // The chapter-index README is outward-facing too — leak-scan it (no intro/related rule).
    const readmeResult = existsSync( join( SPEC_DIR, 'README.md' ) ) === true
        ? [ await auditPage( { filename: 'README.md', leakOnly: true } ) ]
        : []
    const results = [ ...numbered, ...readmeResult ]
    const failures = results.filter( ( r ) => r.violations.length > 0 )
    const leakCount = results.reduce( ( sum, r ) => sum + r.internalRefs.length, 0 )

    results.forEach( ( r ) => {
        const status = r.violations.length === 0 ? 'ok' : r.violations.join( ',' )
        console.log( `  ${ r.violations.length === 0 ? '✓' : '✗' } ${ r.filename } — ${ status }` )
    } )

    if( emit === true ) {
        await emitEvidence( { status: leakCount === 0 ? 'PASS' : 'BLOCKED', leakCount } )
    }

    if( failures.length > 0 ) {
        console.error( `\nSpec-quality gate FAILED: ${ failures.length } page(s) with violations (${ leakCount } internal-reference leak(s)).` )
        process.exit( 1 )
    }
    console.log( `\nSpec-quality gate PASSED: ${ pages.length } pages + README, 0 violations, 0 internal-reference leaks.` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
