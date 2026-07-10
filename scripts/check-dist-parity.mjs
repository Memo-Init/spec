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
import { join, dirname, resolve, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
// Flat namespace-first container (Memo 064 MI-S6 + flatten): the repo IS the container. Per-namespace
// dist lives at <ns>/<ver>/dist/ and the cross-namespace aggregates at the repo root. The whole repo
// root is scanned for dist bridge hubs (non-content dirs are skipped in collectBridgeHubs).
const CORE_ROOT = resolve( REPO, '..', '..', 'repos', 'core' )
const BRIDGE_HUB_RE = /\d{2}-bridge\.md$/
// Directories at the repo root that never hold generated dist artifacts — skipped when walking the
// tree so the scan stays fast and never recurses into node_modules or git internals.
const SKIP_DIRS = new Set( [ 'node_modules', '.git', '.trash' ] )
// A bridge hub is a GENERATED artifact only when it sits under a `dist` path segment
// (namespace-first <ns>/<ver>/dist/**). Authored hubs (draft/) are excluded so an authored source
// hub is never flagged by the structural scan.
const underDist = ( { path } ) => relative( REPO, path ).split( sep ).includes( 'dist' ) === true
// Root-level cross-namespace aggregates (generator output — checked for parity alongside the
// per-namespace dist). README.md is intentionally NOT here: it is a hand-maintained doc, not
// generator output, so parity must not police it.
const AGGREGATE_RE = /^(manifest|inverted-map|refs\.resolved)\.json$/

// The distinctive ALT-hub signatures (renderOverviewAndViews, removed in F2). Either one present in
// a bridge hub means the old format leaked back into dist/.
const ALT_SIGNATURES = [
    /^###\s+By chapter — requirements/m,
    /^\|\s*Chapter\s*\|\s*Reqs\s*\|\s*Implementers\s*\|\s*Depends on\s*\|/m
]
// The NEU hub carries the coverage summary (renderCoverageSummary). Its absence in a hub is itself a
// divergence (neither ALT nor a well-formed NEU hub).
const NEU_SIGNATURE = /^##\s+Coverage summary/m

// Volatile fields that differ every build by design (stripped before the Layer-2 comparison). The
// provenance commit SHA lives in two serializations that BOTH churn on every commit and carry no
// content: `fromCommit` (the full SHA in refs.resolved.json) and `specId` (the composeSpecId short-SHA
// token stamped into refs.resolved.json and each family head). A committed dist is always stamped
// with the PARENT commit (dist is committed together with the sources that reference the pre-commit
// HEAD), so a fresh reference build necessarily bumps this SHA — normalizing it keeps Layer 2 a
// CONTENT gate, not a per-commit-SHA gate. The ALT-format defect is caught structurally by Layer 1
// and by the chapter/hub BODY comparison here, neither of which this strip touches.
const VOLATILE = /^\s*"?(generated_at|generatedAt|at|fromCommit|source_commit|specId)"?\s*[:=]/
// The same provenance short-SHA is stamped into each llms bundle header as `Source: <ns>@<ver>:<sha>`
// (the composeSpecId token). Tightly matched to that exact header shape so a prose line that merely
// starts with "Source:" is never stripped; the bundle BODY (the concatenated chapters) is still compared.
const SOURCE_STAMP = /^Source:\s+[a-z0-9-]+@\d+\.\d+\.\d+:([0-9a-f]{7}|unknown)$/


// Recursively collect every dist bridge hub file (<family>/<version>/{spec,bridge}/NN-bridge.md).
// Non-content root dirs (node_modules, .git, .trash) are skipped so the walk stays fast.
const collectBridgeHubs = async ( { dir } ) => {
    const entries = await readdir( dir, { withFileTypes: true } ).catch( () => [] )
    const nested = await Promise.all( entries.map( async ( entry ) => {
        if( entry.isDirectory() === true ) {
            if( SKIP_DIRS.has( entry.name ) === true ) return []
            return collectBridgeHubs( { dir: join( dir, entry.name ) } )
        }
        return BRIDGE_HUB_RE.test( entry.name ) === true ? [ join( dir, entry.name ) ] : []
    } ) )

    return nested.flat()
}


// Layer 1: structural ALT-format assertion over the committed dist bridge hubs (flat namespace-first).
const structuralAssertion = async () => {
    const collected = await collectBridgeHubs( { dir: REPO } )
    const hubs = collected.filter( ( path ) => underDist( { path } ) === true )
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
        .filter( ( line ) => VOLATILE.test( line ) === false && SOURCE_STAMP.test( line ) === false )
        .join( '\n' )
}


// Source-path provenance (generated_from / edit_warning frontmatter, specDir in refs) legitimately
// changes when a file is MOVED (the MI-S6 layout migration). For a rename these are neutralized on
// top of the timestamp strip, so a content-stable move is not a divergence — the chapter BODY is
// still compared, so genuine spec drift in a moved file is still caught. Applied ONLY to renames,
// so normal (non-migration) builds keep the strict timestamp-only comparison unchanged.
const PROVENANCE = /^\s*"?(generated_from|edit_warning|specDir)"?\s*[:=]/

const normalizeMoved = ( { text } ) => {
    return normalize( { text } )
        .split( '\n' )
        .filter( ( line ) => PROVENANCE.test( line ) === false )
        .join( '\n' )
}


const gitShow = ( { ref } ) => {
    try {
        return execSync( `git show ${ ref }`, { cwd: REPO, maxBuffer: 128 * 1024 * 1024 } ).toString()
    } catch( err ) {
        return null
    }
}


// Is a repo-relative path a generated artifact (per-namespace dist, or a container-level aggregate)?
// README.md (any layer) is a hand-maintained doc, not generator output, so it is never in scope.
const isGenerated = ( { path } ) => /(^|\/)README\.md$/.test( path ) === false
    && ( path.split( '/' ).includes( 'dist' ) === true || AGGREGATE_RE.test( path ) === true )


// Layer 2: full reference-build parity (core present). Assumes the caller ran `npm run build`.
// Scans the whole working tree; isGenerated() filters to per-namespace dist artifacts and the
// root-level aggregates. Rename entries (git mv, the MI-S6 flatten) are parsed so a moved-then-rebuilt
// file compares its OLD committed blob against its NEW working blob (timestamp-normalized) — a
// content-stable move is not a divergence, while a genuinely stale committed artifact at a stable
// path is still caught.
const referenceBuildParity = async () => {
    // A high rename limit keeps git detecting the flatten moves as renames even across the ~400-file
    // layout shift (below-limit rename pairs would otherwise split into delete+add).
    const status = execSync( 'git -c diff.renameLimit=20000 status --porcelain', { cwd: REPO } ).toString().trim()
    const lines = status === '' ? [] : status.split( '\n' )
    const entries = lines.map( ( line ) => {
        const body = line.slice( 3 )
        if( body.includes( ' -> ' ) === true ) {
            const parts = body.split( ' -> ' )

            return { committedPath: parts[ 0 ].trim(), workingPath: parts[ 1 ].trim() }
        }
        const path = body.trim()

        return { committedPath: path, workingPath: path }
    } )
    const generated = entries
        .filter( ( entry ) => isGenerated( { path: entry.workingPath } ) === true || isGenerated( { path: entry.committedPath } ) === true )

    const results = await Promise.all( generated.map( async ( entry ) => {
        const committed = gitShow( { ref: `HEAD:${ entry.committedPath }` } )
        const workingPath = join( REPO, entry.workingPath )
        const workingExists = existsSync( workingPath )
        if( committed === null ) return { path: entry.workingPath, reason: 'present in reference build but absent from committed dist', divergent: true }
        if( workingExists === false ) return { path: entry.committedPath, reason: 'committed in dist but absent from reference build', divergent: true }
        const working = await readFile( workingPath, 'utf-8' )
        const norm = entry.committedPath !== entry.workingPath ? normalizeMoved : normalize
        const divergent = norm( { text: committed } ) !== norm( { text: working } )

        return { path: entry.workingPath, reason: 'content differs from reference build (non-timestamp)', divergent }
    } ) )

    return { checked: generated.length, violations: results.filter( ( r ) => r.divergent === true ) }
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
