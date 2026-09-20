#!/usr/bin/env node
// generate-harness-skills-manifest.mjs — emit the per-harness, per-role skills manifest.
//
// For every harness registered in data/harnesses.manual.json, this reads the descriptor's
// toolContract.roles{} and writes one skills.manifest.json per role at
//   <bindNamespace>/<bindVersion>/skills/<harnessId>/<harnessVersion>/<role>/skills.manifest.json
// carrying { specId, harnessRef, role, compatibleRange, skills[] } (WI-3-09 / WI-3-10).
//
// The skills[] list is filled from the single-source role map (draft/data/skill-roles.json): every
// skill resolves to exactly one role (assignments[name] ?? defaultRole), so the three role sets
// PARTITION the skill index — no skill in two manifests. The map is the declared role->skill source
// the generator was missing; the specs-to-skills verify.mjs role-registration check cross-guards this
// index against the real skill folders on disk.
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
const BIND_VERSION = '0.3.0'
// The single-source role map lives in the same namespace's draft data (skill names are plain strings).
const MAP_PATH = join( REPO, BIND_NAMESPACE, BIND_VERSION, 'draft', 'data', 'skill-roles.json' )


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


const buildManifest = ( { specId, harnessRef, roleName, role, version, skills } ) => {
    return {
        specId,
        harnessRef,
        role: roleName,
        compatibleRange: compatibleRangeFor( { role, version } ),
        skills
    }
}


// Resolve every skill in the single-source map to exactly one role and group the sorted names per
// role. resolvedRole = assignments[name] ?? defaultRole. Two inconsistencies fail loud (never a
// silent drop): an assignment for a name missing from the skills index, and a skill resolving to a
// role the harness contract does not declare. The result partitions the index across the given roles.
const resolveByRole = ( { map, roleNames } ) => {
    const skills = Array.isArray( map.skills ) === true ? map.skills : []
    const assignments = map.assignments ?? {}
    const defaultRole = map.defaultRole

    const known = new Set( skills )
    const strayAssignments = Object.keys( assignments ).filter( ( name ) => known.has( name ) === false )
    if( strayAssignments.length > 0 ) {
        throw new Error( `skill-roles.json: assignment(s) for skill(s) not in the index: ${ strayAssignments.join( ', ' ) }` )
    }

    const roleSet = new Set( roleNames )
    const resolved = skills.map( ( name ) => ( { name, role: assignments[ name ] ?? defaultRole } ) )
    const stray = resolved.filter( ( entry ) => roleSet.has( entry.role ) === false )
    if( stray.length > 0 ) {
        const detail = stray.map( ( entry ) => `${ entry.name }->${ entry.role }` ).join( ', ' )
        throw new Error( `skill-roles.json: skill(s) resolve to a role the harness contract does not declare: ${ detail }` )
    }

    const byRole = Object.fromEntries( roleNames.map( ( roleName ) => {
        const names = resolved
            .filter( ( entry ) => entry.role === roleName )
            .map( ( entry ) => entry.name )
            .sort()

        return [ roleName, names ]
    } ) )

    return { byRole, total: skills.length }
}


const emitForHarness = async ( { harnessRef, meta, specId, map } ) => {
    const descriptorPath = join( REPO, meta.descriptor )
    const descriptor = JSON.parse( await readFile( descriptorPath, 'utf-8' ) )
    const roles = descriptor.toolContract?.roles ?? {}
    const roleNames = Object.keys( roles )
    const { byRole } = resolveByRole( { map, roleNames } )

    return Promise.all( roleNames.map( async ( roleName ) => {
        const role = roles[ roleName ]
        const outDir = join( REPO, BIND_NAMESPACE, BIND_VERSION, 'skills', meta.harnessId, meta.version, roleName )
        await mkdir( outDir, { recursive: true } )
        const skills = byRole[ roleName ] ?? []
        const manifest = buildManifest( { specId, harnessRef, roleName, role, version: meta.version, skills } )
        const outPath = join( outDir, 'skills.manifest.json' )
        await writeFile( outPath, JSON.stringify( manifest, null, 4 ) + '\n', 'utf-8' )

        return { path: `${ BIND_NAMESPACE }/${ BIND_VERSION }/skills/${ meta.harnessId }/${ meta.version }/${ roleName }/skills.manifest.json`, count: skills.length }
    } ) )
}


const main = async () => {
    const registry = JSON.parse( await readFile( REGISTRY_PATH, 'utf-8' ) )
    const map = JSON.parse( await readFile( MAP_PATH, 'utf-8' ) )
    const entries = Object.entries( registry.harnesses ?? {} )
    const specId = `${ BIND_NAMESPACE }@${ BIND_VERSION }`

    const nested = await Promise.all( entries.map( ( [ harnessRef, meta ] ) => {
        return emitForHarness( { harnessRef, meta, specId, map } )
    } ) )
    const written = nested.flat()

    written.forEach( ( entry ) => console.log( `  ✓ ${ entry.path } (${ entry.count } skill(s))` ) )
    console.log( `${ GENERATOR }: ${ written.length } role manifest(s) for ${ entries.length } harness(es), ${ map.skills.length } skill(s) partitioned.` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
