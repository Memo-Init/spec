#!/usr/bin/env node
// generate-tool-contract.mjs — the deterministic mirror generator (Memo 067, PRD-006 / WI-2-14).
//
// ONE source (the registered harness descriptor's toolContract branch), ONE derived local mirror
// (data/tool-contract.json). The pre-flight (PRD-009) and the SessionStart hook (PRD-007) read the
// MIRROR, never the descriptor directly. Pure transform, no network, no secrets.
//
// Reconcile (the harness descriptor carries a note: "reconcile core.required against the WI-2-05
// tool-inventory snapshot when it lands"): this generator does exactly that cross-check and stamps
// the result into the mirror's provenance — required[] against the 42-tool inventory, and every
// role-delta token too. A role token that is neither an inventory tool NOR a known capability/gate
// marker (config.knownNonInventoryRoleTokens) is FLAGGED (Ölstand-Prinzip: flag, never silently drop).
//
// Idempotent: on unchanged input the file is left byte-identical (the previous generatedAt is kept);
// only a genuine content change bumps generatedAt. House style: .mjs, 4-space, no semicolons,
// async/await, no for/while (Array methods), constants in scripts/data/config.mjs.

import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from './data/config.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO_ROOT = join( __dirname, '..' )


const readJson = async ( { path } ) => {
    const raw = await readFile( path, 'utf-8' )

    return { raw, value: JSON.parse( raw ) }
}


const resolveDescriptor = async ( { registry } ) => {
    const entry = registry.harnesses[ config.descriptorId ]
    if( entry === undefined || typeof entry.descriptor !== 'string' ) {
        return { ok: false, reason: `harness "${ config.descriptorId }" is not registered in ${ config.paths.harnessRegistry }` }
    }

    const path = join( REPO_ROOT, entry.descriptor )
    const read = await readJson( { path } ).catch( ( error ) => ( { error } ) )
    if( read.error !== undefined ) {
        return { ok: false, reason: `cannot read descriptor ${ entry.descriptor }: ${ read.error.message }` }
    }

    return { ok: true, descriptor: read.value, raw: read.raw, path: entry.descriptor }
}


// reconcile — the cross-check the descriptor note asks for. required[] and every role add/remove
// token are matched against the inventory name set. Non-inventory role tokens split into KNOWN
// capability/gate markers (config-listed) and UNEXPECTED tokens (flagged).
const reconcile = ( { toolContract, inventoryNames } ) => {
    const names = new Set( inventoryNames )
    const required = Array.isArray( toolContract.core?.required ) ? toolContract.core.required : []
    const requiredMissing = required.filter( ( name ) => names.has( name ) === false ).sort()

    const roles = toolContract.roles !== null && typeof toolContract.roles === 'object' ? toolContract.roles : {}
    const roleTokens = Object.values( roles )
        .flatMap( ( role ) => [ ...( role.add ?? [] ), ...( role.remove ?? [] ) ] )
    const uniqueTokens = [ ...new Set( roleTokens ) ]
    const nonInventory = uniqueTokens.filter( ( token ) => names.has( token ) === false )
    const known = new Set( config.knownNonInventoryRoleTokens )
    const roleMarkers = nonInventory.filter( ( token ) => known.has( token ) === true ).sort()
    const roleUnexpected = nonInventory.filter( ( token ) => known.has( token ) === false ).sort()

    return {
        inventoryCount: names.size,
        requiredCount: required.length,
        requiredMatched: required.filter( ( name ) => names.has( name ) === true ).sort(),
        requiredMissing,
        roleMarkers,
        roleUnexpected,
        clean: requiredMissing.length === 0 && roleUnexpected.length === 0
    }
}


// buildCorePayload — everything EXCEPT the volatile generatedAt, so idempotency compares content.
const buildCorePayload = ( { toolContract, sha, reconciled } ) => {
    return {
        required: Array.isArray( toolContract.core?.required ) ? [ ...toolContract.core.required ] : [],
        roles: toolContract.roles ?? {},
        generatedFrom: `${ config.descriptorId }@${ sha }`,
        reconcile: reconciled
    }
}


const main = async () => {
    const registry = await readJson( { path: join( REPO_ROOT, config.paths.harnessRegistry ) } )
    const found = await resolveDescriptor( { registry: registry.value } )
    if( found.ok !== true ) {
        console.error( `[ERROR] generate-tool-contract: ${ found.reason }` )
        process.exit( 1 )
    }

    const inventory = await readJson( { path: join( REPO_ROOT, config.paths.toolInventory ) } )
    const inventoryNames = inventory.value.map( ( entry ) => entry.name )

    const toolContract = found.descriptor.toolContract
    if( toolContract === null || typeof toolContract !== 'object' || toolContract.stub === true ) {
        console.error( '[ERROR] generate-tool-contract: descriptor toolContract is absent or a stub — fill WI-3-11 first' )
        process.exit( 1 )
    }

    const sha = createHash( 'sha256' ).update( found.raw ).digest( 'hex' ).slice( 0, 12 )
    const reconciled = reconcile( { toolContract, inventoryNames } )
    const corePayload = buildCorePayload( { toolContract, sha, reconciled } )

    const contractPath = join( REPO_ROOT, config.paths.toolContract )
    const previous = await readJson( { path: contractPath } ).catch( () => null )
    const previousCore = previous === null
        ? null
        : ( () => {
            const { generatedAt, ...rest } = previous.value

            return rest
        } )()

    const unchanged = previousCore !== null && JSON.stringify( previousCore ) === JSON.stringify( corePayload )
    if( unchanged === true ) {
        console.log( `generate-tool-contract: unchanged (${ config.descriptorId }@${ sha }) — kept byte-identical (idempotent).` )
        console.log( reconciled.clean === true
            ? '  reconcile: CLEAN — required[] and role tokens agree with the 42-tool inventory (bar known markers).'
            : `  reconcile: FLAGGED — requiredMissing=[${ reconciled.requiredMissing }] roleUnexpected=[${ reconciled.roleUnexpected }]` )

        return
    }

    const payload = { ...corePayload, generatedAt: new Date().toISOString() }
    await writeFile( contractPath, JSON.stringify( payload, null, 4 ) + '\n', 'utf-8' )

    console.log( `generate-tool-contract: wrote ${ config.paths.toolContract } (generatedFrom ${ config.descriptorId }@${ sha }).` )
    console.log( `  required (${ payload.required.length }): ${ payload.required.join( ', ' ) }` )
    console.log( reconciled.clean === true
        ? '  reconcile: CLEAN — required[] and role tokens agree with the 42-tool inventory (bar known markers).'
        : `  reconcile: FLAGGED — requiredMissing=[${ reconciled.requiredMissing }] roleUnexpected=[${ reconciled.roleUnexpected }]` )
    console.log( `  role markers (non-inventory, known): ${ reconciled.roleMarkers.join( ', ' ) || '(none)' }` )
}


main().catch( ( error ) => {
    console.error( error )
    process.exit( 1 )
} )
