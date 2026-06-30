#!/usr/bin/env node
// check-bridge-inverse.mjs — inverse skill->spec coverage gate (the dedicated INVERSE
// assertion, distinct from the forward repos/core lint check-skill-specs.mjs).
//
// The forward lint proves every skill points at a real chapter. This gate proves the
// reverse projection is faithful: the rendered Bridge artifacts must agree, edge for edge,
// with the skill-to-spec map. For every non-bridge chapter across all three families it
// asserts that
//   (1) the chapter's "## Implemented by" backlink lists EXACTLY the map's implementer set,
//   (2) generated/bridge/<family>/<stem>.md exists (the per-page projection is materialized),
//   (3) generated/bridge/inverted-map.json lists EXACTLY the map's implementer set for it.
// Any divergence — a stale backlink, a missing bridge page, a drifted inverted map — is a
// hard violation. The gate regenerates nothing; it only reads, so injected drift surfaces.
// No network, no secrets. Exit 0 when the projection is consistent, 1 on any drift.

import { readdir, readFile } from 'node:fs/promises'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const MAP_PATH = resolve( REPO, '..', 'core', 'data', 'skill-spec-map.json' )
const REFS = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )
const BRIDGE_OUT = join( REPO, 'generated/bridge' )
const INVERTED_PATH = join( BRIDGE_OUT, 'inverted-map.json' )

const NN_RE = /^\d{2}-.*\.md$/
const BACKLINK_START = '<!-- BRIDGE:IMPLEMENTED-BY START — generated, do not edit -->'
const BACKLINK_END = '<!-- BRIDGE:IMPLEMENTED-BY END -->'

const FAMILIES = [
    { key: 'core', prefix: '', specDir: REFS.spec.specDir },
    { key: 'workbench', prefix: 'workbench/', specDir: REFS.workbench.specDir },
    { key: 'session', prefix: 'session/', specDir: REFS.session.specDir }
]


const numberFromName = ( { name } ) => {
    const match = name.match( /^(\d{2})-/ )

    return match ? parseInt( match[ 1 ], 10 ) : -1
}


// Implementer skill names for a page id, sorted — the expectation every projection is checked against.
const expectedImplementers = ( { skills, id } ) => {
    return skills
        .filter( ( skill ) => Array.isArray( skill.all ) === true && skill.all.includes( id ) === true )
        .map( ( skill ) => skill.skill )
        .sort( ( a, b ) => a.localeCompare( b ) )
}


// Parse the skill names out of a chapter's "## Implemented by" backlink block.
const backlinkImplementers = ( { content } ) => {
    const startIdx = content.indexOf( BACKLINK_START )
    if( startIdx === -1 ) return null
    const endIdx = content.indexOf( BACKLINK_END, startIdx )
    if( endIdx === -1 ) return null
    const block = content.slice( startIdx, endIdx )

    return [ ...block.matchAll( /^-\s+`([^`]+)`/gm ) ]
        .map( ( m ) => m[ 1 ] )
        .sort( ( a, b ) => a.localeCompare( b ) )
}


const sameList = ( { a, b } ) => a.length === b.length && a.every( ( v, i ) => v === b[ i ] )


const collectStems = async ( { specDirAbs } ) => {
    return ( await readdir( specDirAbs ) )
        .filter( ( name ) => NN_RE.test( name ) === true && /-bridge\.md$/.test( name ) === false )
        .map( ( name ) => name.replace( /\.md$/, '' ) )
        .sort( ( a, b ) => numberFromName( { name: `${ a }.md` } ) - numberFromName( { name: `${ b }.md` } ) )
}


const main = async () => {
    const map = JSON.parse( await readFile( MAP_PATH, 'utf-8' ) )
    const skills = Array.isArray( map.skills ) === true ? map.skills : []
    const violations = []

    if( existsSync( INVERTED_PATH ) === false ) {
        console.error( 'check-bridge-inverse: generated/bridge/inverted-map.json missing — run the spec build first.' )
        process.exit( 1 )
    }
    const inverted = JSON.parse( await readFile( INVERTED_PATH, 'utf-8' ) )
    const invertedById = new Map( ( inverted.pages ?? [] ).map( ( p ) => [ p.id, p.implementers.map( ( i ) => i.skill ).sort( ( a, b ) => a.localeCompare( b ) ) ] ) )

    const perFamily = await Promise.all( FAMILIES.map( async ( family ) => {
        const specDirAbs = join( REPO, family.specDir )
        const stems = await collectStems( { specDirAbs } )

        await Promise.all( stems.map( async ( stem ) => {
            const id = `${ family.prefix }${ stem }`
            const expected = expectedImplementers( { skills, id } )

            // (1) backlink in the source chapter
            const content = await readFile( join( specDirAbs, `${ stem }.md` ), 'utf-8' )
            const backlink = backlinkImplementers( { content } )
            if( backlink === null ) {
                violations.push( `${ family.key }/${ stem }: source chapter has no "## Implemented by" backlink block` )
            } else if( sameList( { a: backlink, b: expected } ) === false ) {
                violations.push( `${ family.key }/${ stem }: backlink [${ backlink.join( ', ' ) }] != map [${ expected.join( ', ' ) }]` )
            }

            // (2) per-page bridge materialized
            const bridgePath = join( BRIDGE_OUT, family.key, `${ stem }.md` )
            if( existsSync( bridgePath ) === false ) {
                violations.push( `${ family.key }/${ stem }: per-page bridge generated/bridge/${ family.key }/${ stem }.md missing` )
            }

            // (3) inverted-map entry
            const fromInverted = invertedById.get( id )
            if( fromInverted === undefined ) {
                violations.push( `${ family.key }/${ stem }: id "${ id }" absent from inverted-map.json` )
            } else if( sameList( { a: fromInverted, b: expected } ) === false ) {
                violations.push( `${ family.key }/${ stem }: inverted-map [${ fromInverted.join( ', ' ) }] != map [${ expected.join( ', ' ) }]` )
            }
        } ) )

        return stems.length
    } ) )

    const totalPages = perFamily.reduce( ( sum, n ) => sum + n, 0 )

    if( violations.length > 0 ) {
        console.error( `check-bridge-inverse: ${ violations.length } inverse-projection violation(s) over ${ totalPages } chapters` )
        violations.forEach( ( v ) => console.error( `  ✗ ${ v }` ) )
        process.exit( 1 )
    }
    console.log( `check-bridge-inverse: 0 violations — backlinks, per-page bridges, and inverted-map agree with the map over ${ totalPages } chapters.` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
