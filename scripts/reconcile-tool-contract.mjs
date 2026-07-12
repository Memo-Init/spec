#!/usr/bin/env node
// reconcile-tool-contract.mjs — the maintenance reconcile probe (Memo 067, PRD-010 / WI-2-09).
//
// The 42-tool snapshot is a photo of a moving target: the upstream tools-reference.md changes
// (deprecations, new tools — T026 logged four in one window). This probe diffs the CURRENT
// tool-inventory.json against a freshly-placed tools-reference snapshot and REPORTS added / removed /
// statusChanged as an object. It is WARN-only: it NEVER writes the artefact (the follow-up runs
// human-approved through the workshop -> promotion path), and it ALWAYS exits 0 (a stale maintenance
// state is a Maintenance-Window WARN, not a rollout block — the pre-flight blocks on missing TOOLS,
// not on a stale PFLEGE state).
//
// Upstream is NOT a git repo, so drift is carried on a content-stamp (snapshot hash + fetch date),
// NOT a git-SHA — a deliberately documented exception to the git-centric DriftSensor (see
// data/tool-contract-maintenance.md). House style: .mjs, 4-space, no semicolons, async/await, no
// for/while; constants in scripts/data/config.mjs. This is a workshop entry-point script, so it reads
// its flags from argv the same way the CLI bin does.

import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from './data/config.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO_ROOT = join( __dirname, '..' )


const parseFlags = ( { argv } ) => {
    return argv.reduce( ( acc, token, index, all ) => {
        if( token.startsWith( '--' ) === true ) {
            const next = all[ index + 1 ]
            acc[ token.slice( 2 ) ] = ( next === undefined || next.startsWith( '--' ) === true ) ? true : next
        }

        return acc
    }, {} )
}


const readJson = async ( { path } ) => JSON.parse( await readFile( path, 'utf-8' ) )


// normalizeReference — the reference snapshot may be the reduced form the tests write ([{name}]) or a
// richer capture ([{name,status}]). Only name (+ optional status) are read; anything else is ignored.
const normalizeReference = ( { reference } ) => {
    const list = Array.isArray( reference ) ? reference : []

    return list
        .filter( ( entry ) => entry !== null && typeof entry === 'object' && typeof entry.name === 'string' )
        .map( ( entry ) => ( { name: entry.name, status: typeof entry.status === 'string' ? entry.status : null } ) )
}


const diff = ( { inventory, reference } ) => {
    const invByName = new Map( inventory.map( ( entry ) => [ entry.name, entry ] ) )
    const refByName = new Map( reference.map( ( entry ) => [ entry.name, entry ] ) )

    const added = reference
        .filter( ( entry ) => invByName.has( entry.name ) === false )
        .map( ( entry ) => entry.name )
        .sort()
    const removed = inventory
        .filter( ( entry ) => refByName.has( entry.name ) === false )
        .map( ( entry ) => entry.name )
        .sort()
    const statusChanged = reference
        .filter( ( entry ) => entry.status !== null && invByName.has( entry.name ) === true && invByName.get( entry.name ).status !== entry.status )
        .map( ( entry ) => ( { name: entry.name, was: invByName.get( entry.name ).status, now: entry.status } ) )

    return { added, removed, statusChanged }
}


const main = async () => {
    const flags = parseFlags( { argv: process.argv.slice( 2 ) } )
    const inventoryPath = typeof flags.inventory === 'string' ? resolve( process.cwd(), flags.inventory ) : join( REPO_ROOT, config.paths.toolInventory )
    if( typeof flags.reference !== 'string' ) {
        console.error( '[ERROR] reconcile-tool-contract: --reference <snapshot.json> is required (a freshly placed tools-reference snapshot)' )
        console.error( 'usage: node scripts/reconcile-tool-contract.mjs [--inventory <path>] --reference <path>' )
        process.exit( 2 )
    }

    const referencePath = resolve( process.cwd(), flags.reference )
    const inventory = await readJson( { path: inventoryPath } )
    const referenceText = await readFile( referencePath, 'utf-8' )
    const reference = normalizeReference( { reference: JSON.parse( referenceText ) } )

    const { added, removed, statusChanged } = diff( { inventory, reference } )
    const drift = added.length > 0 || removed.length > 0 || statusChanged.length > 0

    // Content-stamp: the "verifiedAt" axis for a non-git upstream (snapshot hash + iso date), the
    // documented exception to the git-centric DriftSensor. NO write happens here — report only.
    const report = {
        inventoryCount: inventory.length,
        referenceCount: reference.length,
        contentStamp: { snapshotHash: createHash( 'sha256' ).update( referenceText ).digest( 'hex' ).slice( 0, 12 ), checkedAt: new Date().toISOString() },
        added,
        removed,
        statusChanged,
        drift,
        verdict: drift === true ? 'WARN' : 'fresh',
        autoWrite: false
    }

    console.log( JSON.stringify( report, null, 4 ) )
    if( drift === true ) {
        console.error( `WARN: tool-inventory drift vs reference — added=[${ added }] removed=[${ removed }] statusChanged=${ statusChanged.length }; re-snapshot + re-bless via "memo maintenance verify" (WARN, not a block).` )
    }

    // WARN, never block: always exit 0 so the maintenance window never fails a build (F10=A parallel).
    process.exit( 0 )
}


main().catch( ( error ) => {
    console.error( error )
    process.exit( 1 )
} )
