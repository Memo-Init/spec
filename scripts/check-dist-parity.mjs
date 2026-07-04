#!/usr/bin/env node
// check-dist-parity.mjs — F6 (Memo 061): the HARD, blocking CI parity gate.
//
// Guarantees that the COMMITTED dist/ equals the canonical reference build (generate-bridge with
// the sibling ../core repo present → NEU-format bridge). It is the last line of defence after
// F2 (one canonical hub format) and F5 (the regen-bot no longer commits): the only remaining way
// ALT-format or any stale/hand-edited dist could reach the site is a committer checking in a dist/
// that does not match the generators. This gate catches exactly that and FAILS the build.
//
// Deliberately BLOCKING (exit 1 on divergence). The Memo-060 WI-027 guard only *warned* and let a
// divergent dist through — that "warn, don't block" was the root cause of the live ALT-bridge
// defect. This gate is the begruendete Ausnahme from the otherwise `warn-not-block` house style.
//
// Contract: the caller runs `npm run build` FIRST (with ../core checked out), so the working-tree
// dist/ IS the reference build. This script then diffs each committed dist blob against the
// working-tree file, normalizing volatile timestamp / commit-stamp lines that legitimately change
// on every run and carry no content.
//
// No network, no writes. Read-only over git + the working tree.

import { execSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

// Volatile fields that differ every build by design (non-deterministic timestamps / commit refs).
// They are stripped from BOTH sides before comparison, so only real content divergence remains.
//   frontmatter: generated_at: "…"
//   json:        "at": "…", "generatedAt": "…", "fromCommit": "…"
//   frontmatter: source_commit stamp (if present)
const VOLATILE = /^\s*"?(generated_at|generatedAt|at|fromCommit|source_commit)"?\s*[:=]/


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


const main = async () => {
    // Every dist/ path that differs from HEAD after the reference build (modified / added / deleted /
    // untracked). Porcelain status lines are `XY path`; a rename is not expected under dist/.
    const status = execSync( 'git status --porcelain -- dist', { cwd: REPO } ).toString().trim()
    const entries = ( status === '' ? [] : status.split( '\n' ) )
        .map( ( line ) => ( { code: line.slice( 0, 2 ).trim(), path: line.slice( 3 ).trim() } ) )
        .filter( ( entry ) => entry.path.startsWith( 'dist/' ) )

    const results = await Promise.all( entries.map( async ( entry ) => {
        const committed = gitShow( { ref: `HEAD:${ entry.path }` } )
        const workingPath = join( REPO, entry.path )
        const workingExists = existsSync( workingPath )

        // A dist file the reference build produced but HEAD does not carry (or vice versa) is a
        // structural divergence — the committed dist is not the canonical build output.
        if( committed === null ) return { path: entry.path, reason: 'present in reference build but absent from committed dist', divergent: true }
        if( workingExists === false ) return { path: entry.path, reason: 'committed in dist but absent from reference build', divergent: true }

        const working = await readFile( workingPath, 'utf-8' )
        const divergent = normalize( { text: committed } ) !== normalize( { text: working } )

        return { path: entry.path, reason: 'content differs from reference build (non-timestamp)', divergent }
    } ) )

    const violations = results.filter( ( r ) => r.divergent === true )
    const inspected = entries.length

    if( violations.length > 0 ) {
        console.error( `check-dist-parity FAILED — ${ violations.length } dist file(s) diverge from the ../core reference build:` )
        violations.forEach( ( v ) => console.error( `  ✗ ${ v.path } — ${ v.reason }` ) )
        console.error( '\nThe committed dist/ is not the canonical generator output. Rebuild locally with the sibling' )
        console.error( 'core repo present (`npm run build`) and commit the regenerated dist/ (committed-dist = Wahrheit, F5).' )
        process.exit( 1 )
    }

    console.log( `check-dist-parity PASSED — committed dist/ matches the ../core reference build (${ inspected } file(s) inspected, timestamp-only churn ignored).` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
