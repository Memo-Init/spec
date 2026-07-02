#!/usr/bin/env node
// audit-spec-quality.mjs — idempotent spec-quality gate over ALL FOUR spec families
// (memo, workbench, session, spec — WI-025 / Z7-10; formerly the memo family only).
//
// It runs two tiers of checks over every numbered spec page:
//
//   BLOCKING (exit 1) — machine-checkable structural invariants that hold across all families:
//     (H1)          a single `# NN. Title` heading on the first line
//     (META/STATUS) a header metadata table with a `Status` row directly under the H1
//     (PLACEHOLDER) a non-bridge chapter carries the implemented-by placeholder and NOT a
//                   hand-written "## Implemented by" backlink (the authored-vs-derived split)
//     (CATEGORY)    one category per chapter — no stem appears in two of the manifest's groups
//     (TOKEN)       a family's spec.json namespaceToken matches its spec-manifest.json token
//                   (F3 / Z2-02, Z3-04 — the short manifest token MC/SE/WB is canonical)
//     (MARKER)      a top-of-page `Informative` marker uses the exact `**Informative.**` lead
//     (LINK-FORM)   cross-family links are absolute routes, never relative `../…` (SPEC-REQ-002).
//                   Phase 3 migrated the 55 legacy links; now BLOCKING so a reintroduced relative
//                   cross-family link fails the gate (WI-119 / Z7-07)
//     (INTRO/REL)   intro prose before the first `##` and a bottom `## Related` — for the memo
//                   family these stay BLOCKING (unchanged); for the sibling families they are
//                   reported as P3-handoff (Phase 3 owns the content backfill)
//     (LEAK)        no internal references (REQ-056) in outward-facing text — over the numbered
//                   pages AND the chapter-index README of every family
//
//   P3-HANDOFF (exit 0, reported ⚠) — content debts surfaced but non-blocking:
//     (INTRO/REL)   missing intro/Related on a sibling (non-memo) family page
//
// README (repo-level) is exempt from the structural rules; the chapter-index README is leak-scanned.
// Read-only by default. Opt-in: --emit-evidence back-writes the REQ-056 scanner evidence into the
// requirements store (used by the memo-finalize gate; never on the CI/push path).

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverSpecs } from './lib/discover-specs.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const PROJECT_ROOT = resolve( REPO, '..', '..' )

const REFS_MANUAL = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )
// All spec families (memo, workbench, session, spec) discovered from draft/*/spec.json.
const FAMILIES = discoverSpecs( { repoRoot: REPO } )

const REQ_ID = 'REQ-056'

const NN_RE = /^\d{2}-.*\.md$/
const BRIDGE_RE = /^\d{2}-bridge\.md$/
// F2 Dist-Split placeholder — byte-identical to generate-bridge.mjs / check-bridge-inverse.mjs.
const PLACEHOLDER = '<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->'
const BACKLINK_START = '<!-- BRIDGE:IMPLEMENTED-BY START — generated, do not edit -->'


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


// The chapter head = everything before the first `## ` section heading (the H1, metadata table
// and intro prose live here).
const headOf = ( { content } ) => content.split( /\n##\s/ )[ 0 ]


const hasH1 = ( { content } ) => {
    const first = content.split( '\n' ).find( ( line ) => line.trim() !== '' ) ?? ''

    return /^#\s+\d{2}\.\s+\S/.test( first )
}


// A metadata table (identified by a `Status` row) sits in the head, directly under the H1.
const hasMetaStatusTable = ( { content } ) => {
    return /^\|\s*Status\s*\|/m.test( headOf( { content } ) )
}


const hasIntroProse = ( { content } ) => {
    const lines = content.split( '\n' )
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


// The authored-vs-derived split (SPEC-REQ-003): a non-bridge chapter MUST carry the placeholder
// and MUST NOT carry a full hand-written "## Implemented by" block (that lives only in the dist).
const placeholderViolations = ( { content, isBridge } ) => {
    const out = []
    if( isBridge === false && content.indexOf( PLACEHOLDER ) === -1 ) out.push( 'MISSING_PLACEHOLDER' )
    if( content.indexOf( BACKLINK_START ) !== -1 ) out.push( 'HANDWRITTEN_BACKLINK' )
    return out
}


// Marker position/form (WI-022 / SPEC-REQ marker rule): a page-level `Informative` marker in the
// head must use the exact bold lead `**Informative.**`. A decorated lead ("Informative /
// forward-looking.") is only valid as a sectional marker deeper in the body, never as a page
// marker; caught here so a malformed page marker cannot silently mis-flag the chapter.
const markerFormViolation = ( { content } ) => {
    const headMarker = headOf( { content } ).match( /^>\s*\*\*Informative[^\n]*/m )
    if( headMarker === null ) return null
    return /^>\s*\*\*Informative\.\*\*/.test( headMarker[ 0 ] ) ? null : 'MARKER_MALFORMED'
}


// A cross-family link authored in relative `../…/NN-name.md` form (SPEC-REQ-002): it MUST be the
// target family's absolute route instead. Same-family links stay relative `./NN-name.md`. Returns
// the count of cross-family relative links (Phase 3 owns the migration of these).
const crossFamilyRelativeLinks = ( { content } ) => {
    return [ ...content.matchAll( /\]\(\.\.\/[^)]+\.md[^)]*\)/g ) ].length
}


// Head-token consistency (F3 / Z2-02, Z3-04): a family's spec.json namespaceToken MUST match its
// spec-manifest.json namespaceToken. The short manifest token (MC / SE / WB) is canonical; a
// diverging spec.json token (the legacy long form MEMO / SESSION) is a defect, because GR-codes and
// the coverage board qualify a family by exactly one token and two forms would collide silently.
const tokenConsistency = ( { familyName, specDirAbs } ) => {
    const specJsonPath = join( REPO, 'draft', familyName, 'spec.json' )
    const manifestPath = join( specDirAbs, 'spec-manifest.json' )
    if( existsSync( specJsonPath ) === false || existsSync( manifestPath ) === false ) return []
    const specToken = JSON.parse( readFileSync( specJsonPath, 'utf-8' ) ).namespaceToken
    const manifestToken = JSON.parse( readFileSync( manifestPath, 'utf-8' ) ).namespaceToken
    if( specToken === undefined || manifestToken === undefined ) return []
    if( specToken !== manifestToken ) return [ `TOKEN_MISMATCH:spec.json=${ specToken } manifest=${ manifestToken }` ]

    return []
}


// One-category-per-chapter (SPEC-REQ-005): a stem listed in two of the manifest's groups is a
// conflict. Read once per family from its spec-manifest.json.
const categoryConflicts = ( { specDirAbs } ) => {
    const manifestPath = join( specDirAbs, 'spec-manifest.json' )
    if( existsSync( manifestPath ) === false ) return []
    const manifest = JSON.parse( readFileSync( manifestPath, 'utf-8' ) )
    const groups = Array.isArray( manifest.groups ) === true ? manifest.groups : []
    const counts = new Map()
    groups.forEach( ( group ) => {
        const stems = Array.isArray( group.pages ) === true ? group.pages : []
        stems.forEach( ( stem ) => {
            counts.set( stem, ( counts.get( stem ) ?? 0 ) + 1 )
        } )
    } )

    return [ ...counts.entries() ]
        .filter( ( pair ) => pair[ 1 ] > 1 )
        .map( ( pair ) => `CATEGORY_CONFLICT:${ pair[ 0 ] }` )
}


// Audit one page. `family` is null for the repo-level README (leak-only). Returns the page's
// blocking + handoff violation lists and its internal-ref hits.
const auditPage = async ( { specDirAbs, filename, family, leakOnly = false } ) => {
    const content = await readFile( join( specDirAbs, filename ), 'utf-8' )
    const blocking = []
    const handoff = []

    if( leakOnly === false ) {
        const isBridge = BRIDGE_RE.test( filename )
        const isMemo = family === 'memo'

        // Structural invariants — blocking for every family.
        if( !hasH1( { content } ) ) blocking.push( 'MISSING_H1' )
        if( !hasMetaStatusTable( { content } ) ) blocking.push( 'MISSING_META_STATUS' )
        placeholderViolations( { content, isBridge } ).forEach( ( v ) => blocking.push( v ) )
        const marker = markerFormViolation( { content } )
        if( marker !== null ) blocking.push( marker )

        // Intro / Related — blocking for memo (unchanged), P3-handoff for the sibling families.
        if( !hasIntroProse( { content } ) ) ( isMemo ? blocking : handoff ).push( 'MISSING_INTRO' )
        if( !hasRelatedSection( { content } ) ) ( isMemo ? blocking : handoff ).push( 'MISSING_RELATED' )

        // Link form — cross-family links MUST be absolute routes (SPEC-REQ-002). Phase 3 migrated
        // the 55 legacy relative links; this is now BLOCKING so a reintroduced relative cross-family
        // link fails the gate (WI-119 / Z7-07 — mirrors the generator's fail-loud assertion).
        const crossRel = crossFamilyRelativeLinks( { content } )
        if( crossRel > 0 ) blocking.push( `LINK_FORM:${ crossRel } cross-family relative link(s)` )
    }

    const internalRefs = findInternalRefs( { content } )
    internalRefs.forEach( ( ref ) => {
        blocking.push( `INTERNAL_REF:${ ref.pattern }@L${ ref.line }(${ ref.match })` )
    } )

    return { family, filename, blocking, handoff, internalRefs }
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
        summary: { leakCount, checked: 'all 4 spec families (numbered pages + chapter-index README)' }
    }
    const evidencePath = resolve( evidenceDir, `${ REQ_ID }.evidence.json` )
    await writeFile( evidencePath, `${ JSON.stringify( evidence, null, 2 ) }\n` )
    console.log( `  evidence: ${ evidencePath } (${ status })` )
}


const auditFamily = async ( { family } ) => {
    const specDirAbs = join( REPO, family.specDir )
    const all = await readdir( specDirAbs )
    const pages = all
        .filter( ( f ) => NN_RE.test( f ) === true )
        .sort()
    const numbered = await Promise.all( pages.map( ( filename ) => auditPage( { specDirAbs, filename, family: family.name } ) ) )
    // The chapter-index README is outward-facing too — leak-scan it (no structural rules).
    const readmeResult = existsSync( join( specDirAbs, 'README.md' ) ) === true
        ? [ await auditPage( { specDirAbs, filename: 'README.md', family: family.name, leakOnly: true } ) ]
        : []
    // One-category-per-chapter is a family-level (manifest) invariant.
    const catViolations = categoryConflicts( { specDirAbs } )
    // Head-token consistency is a family-level (spec.json ↔ manifest) invariant.
    const headViolations = tokenConsistency( { familyName: family.name, specDirAbs } )

    return { family: family.name, results: [ ...numbered, ...readmeResult ], catViolations, headViolations, pageCount: pages.length }
}


const main = async () => {
    const emit = process.argv.slice( 2 ).includes( '--emit-evidence' )
    const families = await Promise.all( FAMILIES.map( ( family ) => auditFamily( { family } ) ) )

    const allResults = families.flatMap( ( f ) => f.results )
    const blockingCount = families.reduce( ( sum, f ) => {
        const pageBlockers = f.results.reduce( ( n, r ) => n + r.blocking.length, 0 )
        return sum + pageBlockers + f.catViolations.length + f.headViolations.length
    }, 0 )
    const handoffs = allResults.flatMap( ( r ) => r.handoff.map( ( v ) => `${ r.family }/${ r.filename }: ${ v }` ) )
    const leakCount = allResults.reduce( ( sum, r ) => sum + r.internalRefs.length, 0 )

    families.forEach( ( f ) => {
        console.log( `\n== ${ f.family } (${ f.pageCount } pages) ==` )
        f.catViolations.forEach( ( v ) => console.log( `  ✗ [manifest] ${ v }` ) )
        f.headViolations.forEach( ( v ) => console.log( `  ✗ [head] ${ v }` ) )
        f.results.forEach( ( r ) => {
            const marks = [ ...r.blocking, ...r.handoff.map( ( v ) => `⚠${ v }` ) ]
            const status = marks.length === 0 ? 'ok' : marks.join( ', ' )
            console.log( `  ${ r.blocking.length === 0 ? '✓' : '✗' } ${ r.filename } — ${ status }` )
        } )
    } )

    if( handoffs.length > 0 ) {
        console.log( `\n⚠ P3-handoff (${ handoffs.length } non-blocking content debt(s) — Phase 3 owns these):` )
        handoffs.forEach( ( h ) => console.log( `  ⚠ ${ h }` ) )
    }

    if( emit === true ) {
        await emitEvidence( { status: leakCount === 0 ? 'PASS' : 'BLOCKED', leakCount } )
    }

    if( blockingCount > 0 ) {
        console.error( `\nSpec-quality gate FAILED: ${ blockingCount } blocking violation(s) across ${ FAMILIES.length } families (${ leakCount } internal-reference leak(s)).` )
        process.exit( 1 )
    }
    console.log( `\nSpec-quality gate PASSED: ${ FAMILIES.length } families, 0 blocking violations, 0 internal-reference leaks; ${ handoffs.length } P3-handoff note(s).` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
