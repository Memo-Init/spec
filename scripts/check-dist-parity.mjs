#!/usr/bin/env node
// check-dist-parity.mjs — F6 (Memo 061): the HARD, blocking parity gate, in two complementary
// layers so it works BOTH in CI (where the private ../core repo cannot be checked out) and locally.
//
// The defect this guards (Memo 060 → 061): a stale/ALT-format bridge hub committed into dist/ and
// served on the site. After F2 (one canonical hub format) and F5 (the regen-bot no longer commits),
// a committed dist that diverges from the generators is the only remaining path to that defect.
//
//   Layer 1 — structural ALT-format assertion (ALWAYS, core-independent, CI-viable):
//     scans every committed dist bridge HUB (dist/**/NN-bridge.md) and FAILS if any still carries
//     the ALT renderOverviewAndViews signature (the "## Overview" + "### By chapter — requirements"
//     views / the "| Chapter | Reqs | Implementers | Depends on |" table) or is missing the NEU
//     "## Coverage summary". This is the EXACT live defect and needs neither ../core nor a rebuild,
//     so it runs in CI where core (a PRIVATE repo) is absent. This is the CI gate.
//
//   Layer 2 — full reference-build parity (WHEN ../core is present: local / pre-push):
//     assumes the caller ran `npm run build` first (core present → canonical NEU dist) and diffs
//     each committed dist blob against the working-tree reference build, timestamp-normalized.
//     Catches broader drift (e.g. stale skill Purpose cells) that Layer 1 cannot see. Skipped when
//     core is absent — Layer 1 still blocks the format defect.
//
// Both layers are BLOCKING (exit 1). Deliberately hard: the Memo-060 WI-027 guard only *warned* and
// let a divergent dist through — that "warn, don't block" was the root cause. No network, no writes.

import { execSync } from 'node:child_process'
import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const DIST = join( REPO, 'dist' )
const CORE_ROOT = resolve( REPO, '..', '..', 'repos', 'core' )
const BRIDGE_HUB_RE = /\d{2}-bridge\.md$/

// The distinctive ALT-hub signatures (renderOverviewAndViews, removed in F2). Either one present in
// a bridge hub means the old format leaked back into dist/.
const ALT_SIGNATURES = [
    /^###\s+By chapter — requirements/m,
    /^\|\s*Chapter\s*\|\s*Reqs\s*\|\s*Implementers\s*\|\s*Depends on\s*\|/m
]
// The NEU hub carries the coverage summary (renderCoverageSummary). Its absence in a hub is itself a
// divergence (neither ALT nor a well-formed NEU hub).
const NEU_SIGNATURE = /^##\s+Coverage summary/m

// Volatile fields that differ every build by design (stripped before the Layer-2 comparison).
const VOLATILE = /^\s*"?(generated_at|generatedAt|at|fromCommit|source_commit)"?\s*[:=]/


// Recursively collect every dist bridge hub file (dist/<family>/<version>/{spec,bridge}/NN-bridge.md).
const collectBridgeHubs = async ( { dir } ) => {
    const entries = await readdir( dir, { withFileTypes: true } ).catch( () => [] )
    const nested = await Promise.all( entries.map( async ( entry ) => {
        const full = join( dir, entry.name )
        if( entry.isDirectory() === true ) return collectBridgeHubs( { dir: full } )
        return BRIDGE_HUB_RE.test( entry.name ) === true ? [ full ] : []
    } ) )

    return nested.flat()
}


// Layer 1: structural ALT-format assertion over the committed dist bridge hubs.
const structuralAssertion = async () => {
    if( existsSync( DIST ) === false ) {
        return { checked: 0, violations: [ { path: 'dist/', reason: 'dist/ directory missing' } ] }
    }
    const hubs = await collectBridgeHubs( { dir: DIST } )
    const results = await Promise.all( hubs.map( async ( path ) => {
        const content = await readFile( path, 'utf-8' )
        const rel = relative( REPO, path )
        const altHit = ALT_SIGNATURES.some( ( re ) => re.test( content ) === true )
        if( altHit === true ) return { path: rel, reason: 'carries the ALT hub format (## Overview / By-chapter views)' }
        if( NEU_SIGNATURE.test( content ) === false ) return { path: rel, reason: 'missing the NEU "## Coverage summary" — not a well-formed canonical hub' }

        return null
    } ) )

    return { checked: hubs.length, violations: results.filter( Boolean ) }
}


const normalize = ( { text } ) => {
    return text
        .split( '\n' )
        .filter( ( line ) => VOLATILE.test( line ) === false )
        .join( '\n' )
}


const gitShow = ( { ref } ) => {
    try {
        return execSync( `git show ${ ref }`, { cwd: REPO, maxBuffer: 128 * 1024 * 1024 } ).toString()
    } catch( err ) {
        return null
    }
}


// Layer 2: full reference-build parity (core present). Assumes the caller ran `npm run build`.
const referenceBuildParity = async () => {
    const status = execSync( 'git status --porcelain -- dist', { cwd: REPO } ).toString().trim()
    const entries = ( status === '' ? [] : status.split( '\n' ) )
        .map( ( line ) => ( { code: line.slice( 0, 2 ).trim(), path: line.slice( 3 ).trim() } ) )
        .filter( ( entry ) => entry.path.startsWith( 'dist/' ) )

    const results = await Promise.all( entries.map( async ( entry ) => {
        const committed = gitShow( { ref: `HEAD:${ entry.path }` } )
        const workingPath = join( REPO, entry.path )
        const workingExists = existsSync( workingPath )
        if( committed === null ) return { path: entry.path, reason: 'present in reference build but absent from committed dist', divergent: true }
        if( workingExists === false ) return { path: entry.path, reason: 'committed in dist but absent from reference build', divergent: true }
        const working = await readFile( workingPath, 'utf-8' )
        const divergent = normalize( { text: committed } ) !== normalize( { text: working } )

        return { path: entry.path, reason: 'content differs from reference build (non-timestamp)', divergent }
    } ) )

    return { checked: entries.length, violations: results.filter( ( r ) => r.divergent === true ) }
}


const main = async () => {
    // Layer 1 — always.
    const structural = await structuralAssertion()
    if( structural.violations.length > 0 ) {
        console.error( `check-dist-parity FAILED (Layer 1 — structural) — ${ structural.violations.length } bridge hub(s) diverge from the canonical NEU format:` )
        structural.violations.forEach( ( v ) => console.error( `  ✗ ${ v.path } — ${ v.reason }` ) )
        console.error( '\nAn ALT-format (or malformed) bridge hub is committed in dist/. Rebuild locally with the sibling' )
        console.error( 'core repo present (`npm run build`) and commit the regenerated NEU dist/ (F2 canonical hub).' )
        process.exit( 1 )
    }
    console.log( `check-dist-parity: Layer 1 (structural ALT-format assertion) PASSED — ${ structural.checked } bridge hub(s) are canonical NEU.` )

    // Layer 2 — only when the private core repo is present (local / pre-push).
    if( existsSync( CORE_ROOT ) === false ) {
        console.log( 'check-dist-parity: Layer 2 (full ../core reference-build parity) SKIPPED — core repo absent (expected in CI; private repo). Layer 1 guards the format defect.' )
        return
    }
    const parity = await referenceBuildParity()
    if( parity.violations.length > 0 ) {
        console.error( `check-dist-parity FAILED (Layer 2 — reference build) — ${ parity.violations.length } dist file(s) diverge from the ../core reference build:` )
        parity.violations.forEach( ( v ) => console.error( `  ✗ ${ v.path } — ${ v.reason }` ) )
        console.error( '\nThe committed dist/ is not the canonical generator output. Rebuild locally (`npm run build`) and commit the regenerated dist/.' )
        process.exit( 1 )
    }
    console.log( `check-dist-parity: Layer 2 (full ../core reference-build parity) PASSED — ${ parity.checked } file(s) inspected, timestamp-only churn ignored.` )
    console.log( 'check-dist-parity PASSED.' )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
