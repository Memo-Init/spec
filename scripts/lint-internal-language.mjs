#!/usr/bin/env node
// lint-internal-language.mjs — BLOCKING internal-language gate over the outward-facing spec bodies
// (PRD-002 / Memo 072). Sibling of audit-spec-quality.mjs; this one guards a narrower, sharper class:
// internal vocabulary that must never reach a promotable, public spec page.
//
// It scans the numbered spec bodies of every family — the authored `draft/spec` AND the built
// `dist/spec` — for the leak class below and EXITS NON-ZERO on any hit, so a reintroduced internal
// term fails the workshop `npm test` before promotion (F4=B — clean before promote):
//
//   [FAKT] / [ANNAHME] / [VERMUTUNG]   the bracketed German evidence badges (internal calibration tags)
//   \bM0\d\d\b                          a bare memo number (M058, M029, …) leaking rollout provenance
//   empty-context agent                 process narration about how a page was produced
//   quality-gate returned               process narration about a gate verdict
//
// Allowlisted pages are exempt because their SUBJECT *is* the evidence-/ID-vocabulary the patterns
// match: the persona tone-guide DEFINES the evidence badges, the generated Bridge pages enumerate
// skills by name, and the ID-example chapters print `M003` / `M024`-style format samples. The
// allowlist is an explicit data structure, matching the REQ-056 "no-internal-ref" intent that the
// system's own vocabulary is documented public content, not a leak.
//
// Deterministic and read-only: no `Date.now` / `Math.random`, no writes. House style: 4-space,
// no semicolons, single quotes, object params, object returns. A `--dir <path>` flag scans an
// arbitrary tree of `.md` files (used by the standalone fixture tests) instead of the workshop.

import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { discoverSpecs } from './lib/discover-specs.mjs'
import { distSpecDir } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )


// The leak class. Each entry names one concrete internal-language instance and the regex that
// catches it. The scan is line-oriented so a hit reports a file:line the author can open.
const LEAK_PATTERNS = [
    { id: 'evidence-badge',        re: /\[(?:FAKT|ANNAHME|VERMUTUNG)\]/ },
    { id: 'memo-number',           re: /\bM0\d\d\b/ },
    { id: 'empty-context-agent',   re: /empty-context agent/ },
    { id: 'quality-gate-returned', re: /quality-gate returned/ }
]


// Pages whose subject IS the matched vocabulary — legitimately exempt.
//   pathSegments  a file whose path contains one of these lives in a private/generated area whose
//                 job is to name the vocabulary (persona tone-guide, the generated per-family Bridge).
//   filenames     a chapter (by basename) whose subject is the ID/answer/history schema, so it must
//                 print `M{NNN}` / `M003` / `M024`-style format examples.
const ALLOWLIST = {
    pathSegments: [ '/personas/', '/bridge/' ],
    filenames: [
        '17-git-workflow-and-ids.md',
        '35-memo-authoring.md',
        '26-memo-history.md',
        '07-revisions-and-questions.md',
        '34-question-interface.md'
    ]
}


const isAllowlisted = ( { filePath } ) => {
    const segmentHit = ALLOWLIST.pathSegments.some( ( segment ) => filePath.includes( segment ) )
    const nameHit = ALLOWLIST.filenames.some( ( name ) => filePath.endsWith( name ) )

    return segmentHit === true || nameHit === true
}


// Collect every `.md` file under a directory (recursively, array-methods only — no loops). A missing
// directory yields an empty list so a not-yet-built dist is skipped gracefully.
const collectMd = async ( { dirAbs } ) => {
    if( existsSync( dirAbs ) === false ) return []
    const entries = await readdir( dirAbs, { withFileTypes: true } )
    const nested = await Promise.all( entries.map( async ( entry ) => {
        const full = join( dirAbs, entry.name )
        if( entry.isDirectory() === true ) return collectMd( { dirAbs: full } )
        if( entry.name.endsWith( '.md' ) === true ) return [ full ]

        return []
    } ) )

    return nested.flat()
}


// Scan one file for every leak pattern. An allowlisted page contributes no hits.
const scanFile = async ( { filePath } ) => {
    if( isAllowlisted( { filePath } ) === true ) return []
    const content = await readFile( filePath, 'utf-8' )
    const lines = content.split( '\n' )
    const hits = []
    lines.forEach( ( line, index ) => {
        LEAK_PATTERNS.forEach( ( { id, re } ) => {
            const match = line.match( re )
            if( match !== null ) hits.push( { filePath, line: index + 1, pattern: id, match: match[ 0 ] } )
        } )
    } )

    return hits
}


// Resolve the scan targets. `--dir <path>` scans that tree (fixture mode); otherwise the workshop's
// per-family draft/spec AND dist/spec directories, discovered from each family head's currentVersion.
const resolveTargets = ( { argv } ) => {
    const dirFlagIndex = argv.indexOf( '--dir' )
    if( dirFlagIndex !== -1 && argv[ dirFlagIndex + 1 ] !== undefined ) {
        return { mode: 'dir', dirs: [ resolve( argv[ dirFlagIndex + 1 ] ) ] }
    }
    const families = discoverSpecs( { repoRoot: REPO } )
    const dirs = families.flatMap( ( family ) => {
        return [
            join( REPO, family.specDir ),
            distSpecDir( { repoRoot: REPO, name: family.name, version: family.version } )
        ]
    } )

    return { mode: 'workshop', dirs }
}


const main = async () => {
    const { mode, dirs } = resolveTargets( { argv: process.argv.slice( 2 ) } )
    const fileLists = await Promise.all( dirs.map( ( dirAbs ) => collectMd( { dirAbs } ) ) )
    const files = fileLists.flat()
    const hitLists = await Promise.all( files.map( ( filePath ) => scanFile( { filePath } ) ) )
    const hits = hitLists.flat()

    console.log( `internal-language lint — ${ files.length } spec bodies scanned (${ mode } mode, BLOCKING).` )

    if( hits.length === 0 ) {
        console.log( '[OK] no internal-language leaks.' )

        return
    }

    hits.forEach( ( hit ) => {
        const rel = hit.filePath.startsWith( REPO ) === true ? hit.filePath.slice( REPO.length + 1 ) : hit.filePath
        console.error( `  ✗ ${ rel }:${ hit.line } — ${ hit.pattern } (${ hit.match })` )
    } )
    console.error( `\nInternal-language gate FAILED: ${ hits.length } leak(s) in outward-facing spec bodies.` )
    process.exit( 1 )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
