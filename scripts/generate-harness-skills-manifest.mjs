#!/usr/bin/env node
// generate-harness-skills-manifest.mjs — emit the per-harness, per-role skills manifest.
//
// For every harness registered in data/harnesses.manual.json, this reads the descriptor's
// toolContract.roles{} and writes one skills.manifest.json per role at
//   <bindNamespace>/<bindVersion>/skills/<harnessId>/<harnessVersion>/<role>/skills.manifest.json
// carrying { specId, harnessRef, role, compatibleRange, skills[] } (WI-3-09 / WI-3-10).
//
// Ownership (WI-3-10): the harness skills structure is bound to ONE namespace, not spread across
// all four. meta-spec owns the harness registry norm, so it owns the skills structure too.
//
// Deterministic: it embeds no timestamp and no commit SHA, so a re-run is byte-identical and the
// skills/ tree stays clean between builds. Not registered in harnesses.manual.json = not built.
//
// House style: 4-space, no semicolons, single quotes, object params, object returns, async/await.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const REGISTRY_PATH = join( REPO, 'data/harnesses.manual.json' )
const GENERATOR = 'scripts/generate-harness-skills-manifest.mjs'
// The one namespace the first harness skills structure is bound to (WI-3-10 ownership rule).
const BIND_NAMESPACE = 'meta-spec'
const BIND_VERSION = '0.1.0'


// compatibleRange calibration (WI-3-10): a role pins to an EXACT harness version when its tool
// contract is patch-sensitive — it carries a gate-dependent / time-variant tool (e.g. taskCrud)
// whose availability can shift between patch releases. Otherwise it binds to a MINOR range
// (^major.minor), because a stable role contract survives patch bumps. The choice is derived from
// the descriptor itself, so the range can never drift from the contract it describes.
const compatibleRangeFor = ( { role, version } ) => {
    const parts = version.split( '.' )
    const major = parts[ 0 ]
    const minor = parts[ 1 ]
    const exact = role.taskCrud !== undefined

    return exact === true ? `=${ version }` : `^${ major }.${ minor }`
}


const buildManifest = ( { specId, harnessRef, roleName, role, version } ) => {
    return {
        specId,
        harnessRef,
        role: roleName,
        compatibleRange: compatibleRangeFor( { role, version } ),
        skills: []
    }
}


const emitForHarness = async ( { harnessRef, meta, specId } ) => {
    const descriptorPath = join( REPO, meta.descriptor )
    const descriptor = JSON.parse( await readFile( descriptorPath, 'utf-8' ) )
    const roles = descriptor.toolContract?.roles ?? {}
    const roleNames = Object.keys( roles )

    return Promise.all( roleNames.map( async ( roleName ) => {
        const role = roles[ roleName ]
        const outDir = join( REPO, BIND_NAMESPACE, BIND_VERSION, 'skills', meta.harnessId, meta.version, roleName )
        await mkdir( outDir, { recursive: true } )
        const manifest = buildManifest( { specId, harnessRef, roleName, role, version: meta.version } )
        const outPath = join( outDir, 'skills.manifest.json' )
        await writeFile( outPath, JSON.stringify( manifest, null, 4 ) + '\n', 'utf-8' )

        return `${ BIND_NAMESPACE }/${ BIND_VERSION }/skills/${ meta.harnessId }/${ meta.version }/${ roleName }/skills.manifest.json`
    } ) )
}


const main = async () => {
    const registry = JSON.parse( await readFile( REGISTRY_PATH, 'utf-8' ) )
    const entries = Object.entries( registry.harnesses ?? {} )
    const specId = `${ BIND_NAMESPACE }@${ BIND_VERSION }`

    const nested = await Promise.all( entries.map( ( [ harnessRef, meta ] ) => {
        return emitForHarness( { harnessRef, meta, specId } )
    } ) )
    const written = nested.flat()

    written.forEach( ( path ) => console.log( `  ✓ ${ path }` ) )
    console.log( `${ GENERATOR }: ${ written.length } role manifest(s) for ${ entries.length } harness(es).` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
