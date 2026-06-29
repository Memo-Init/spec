#!/usr/bin/env node
// generate-bridge.mjs — per-family "Bridge" coverage page generator.
//
// Reads the skill->spec source-of-truth map (repos/core/data/skill-spec-map.json) plus the
// three local spec-family manifests and emits ONE Bridge page per family. A Bridge page
// enumerates, for every chapter in that family, the skills that implement it BY NAME; a
// chapter with no implementer prints an explicit "— none yet —" — the honest signal that
// nothing has been built against it yet.
//
// A skill implements a page P when its `all[]` array contains P's family-qualified id:
//   core      bare "NN-slug"
//   workbench "workbench/NN-slug"
//   session   "session/NN-slug"
//
// The page is fully generated (edit-warning + <!-- generated --> marker). The generator is
// idempotent (a re-run reuses the existing NN-bridge.md and writes the same bytes, never
// bumping the number) and run-guarded (acts only when invoked as the entrypoint). No network,
// no secrets. Exit 0 on success.

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const MAP_PATH = resolve( REPO, '..', 'core', 'data', 'skill-spec-map.json' )
const REFS = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )

const GENERATOR = 'scripts/generate-bridge.mjs'
const NN_RE = /^\d{2}-.*\.md$/
const BRIDGE_RE = /^\d{2}-bridge\.md$/

// The three local families. `prefix` is the family-qualifier prepended to a page stem to
// form the id a skill's `all[]` would carry; `relatedRefs` seed the metadata + Related links.
const FAMILIES = [
    { key: 'core', prefix: '', specDir: REFS.spec.specDir, relatedRefs: [ '43-skill-authoring-and-quality', '00-overview' ] },
    { key: 'workbench', prefix: 'workbench/', specDir: REFS.workbench.specDir, relatedRefs: [ '00-overview' ] },
    { key: 'session', prefix: 'session/', specDir: REFS.session.specDir, relatedRefs: [ '00-overview' ] }
]


const numberFromName = ( { name } ) => {
    const match = name.match( /^(\d{2})-/ )

    return match ? parseInt( match[ 1 ], 10 ) : -1
}


// Page list for a family: the union of the manifest pages[] and the on-disk NN-*.md chapters
// (so the index is 100% complete even if a chapter is not yet listed in the nav manifest),
// minus any bridge page, sorted by chapter number. Each entry is a { stem, id } pair.
const collectPages = async ( { specDirAbs, prefix } ) => {
    const manifest = JSON.parse( readFileSync( join( specDirAbs, 'spec-manifest.json' ), 'utf-8' ) )
    const fromManifest = ( manifest.groups ?? [] )
        .flatMap( ( group ) => Array.isArray( group.pages ) === true ? group.pages : [] )
    const onDisk = ( await readdir( specDirAbs ) )
        .filter( ( name ) => NN_RE.test( name ) === true )
        .map( ( name ) => name.replace( /\.md$/, '' ) )
    const stems = [ ...new Set( [ ...fromManifest, ...onDisk ] ) ]
        .filter( ( stem ) => /-bridge$/.test( stem ) === false )
        .sort( ( a, b ) => numberFromName( { name: `${ a }.md` } ) - numberFromName( { name: `${ b }.md` } ) )

    return stems.map( ( stem ) => ( { stem, id: `${ prefix }${ stem }` } ) )
}


// The bridge page's own NN: reuse an existing NN-bridge.md (keeps re-runs idempotent), else
// the next free number = max(existing chapter NN) + 1, zero-padded. Bridge pages are excluded
// from the max so a re-run never bumps the number.
const resolveBridgeNN = async ( { specDirAbs } ) => {
    const names = await readdir( specDirAbs )
    const existingBridge = names.find( ( name ) => BRIDGE_RE.test( name ) === true )
    if( existingBridge !== undefined ) return existingBridge.match( /^(\d{2})-/ )[ 1 ]
    const numbers = names
        .filter( ( name ) => NN_RE.test( name ) === true && BRIDGE_RE.test( name ) === false )
        .map( ( name ) => numberFromName( { name } ) )
    const next = ( numbers.length === 0 ? 0 : Math.max( ...numbers ) ) + 1

    return String( next ).padStart( 2, '0' )
}


const implementersFor = ( { skills, id } ) => {
    return skills
        .filter( ( skill ) => Array.isArray( skill.all ) === true && skill.all.includes( id ) === true )
        .map( ( skill ) => skill.skill )
        .sort( ( a, b ) => a.localeCompare( b ) )
}


const renderSection = ( { stem, implementers } ) => {
    const head = `### [${ stem }](./${ stem }.md)`
    const body = implementers.length === 0
        ? '— none yet —'
        : implementers.map( ( name ) => `- ${ name }` ).join( '\n' )

    return `${ head }\n\n${ body }`
}


const renderPage = ( { nn, familyKey, pages, skills, relatedRefs } ) => {
    const sections = pages
        .map( ( { stem, id } ) => renderSection( { stem, implementers: implementersFor( { skills, id } ) } ) )
        .join( '\n\n' )
    const relatedRow = relatedRefs
        .map( ( ref ) => `[./${ ref }.md](./${ ref }.md)` )
        .join( ', ' )
    const relatedList = relatedRefs
        .map( ( ref ) => `- [./${ ref }.md](./${ ref }.md)` )
        .join( '\n' )

    return [
        `# ${ nn }. Bridge`,
        '',
        '| Field | Value |',
        '|---|---|',
        '| Status | Draft |',
        `| Related | ${ relatedRow } |`,
        '',
        '> **Informative.**',
        '',
        `This page is the Bridge for the ${ familyKey } specification family: a generated coverage index that names, for every chapter below, the skills that implement it. An empty list is an honest signal that nothing has been built against that chapter yet. The mapping is derived from the skill-to-spec map and kept truthful by the resolving coverage lint.`,
        '',
        '<!-- generated -->',
        `<!-- Auto-generated by ${ GENERATOR } from the skill-to-spec map. Do not edit by hand; re-run the spec build to regenerate. -->`,
        '',
        '## Coverage',
        '',
        sections,
        '',
        '## Related',
        '',
        relatedList,
        ''
    ].join( '\n' )
}


const main = async () => {
    const map = JSON.parse( await readFile( MAP_PATH, 'utf-8' ) )
    const skills = Array.isArray( map.skills ) === true ? map.skills : []

    const results = await Promise.all( FAMILIES.map( async ( family ) => {
        const specDirAbs = join( REPO, family.specDir )
        const nn = await resolveBridgeNN( { specDirAbs } )
        const pages = await collectPages( { specDirAbs, prefix: family.prefix } )
        const content = renderPage( { nn, familyKey: family.key, pages, skills, relatedRefs: family.relatedRefs } )
        const targetPath = join( specDirAbs, `${ nn }-bridge.md` )
        const prev = await readFile( targetPath, 'utf-8' ).catch( () => null )
        if( prev !== content ) await writeFile( targetPath, content, 'utf-8' )
        const populated = pages.filter( ( { id } ) => implementersFor( { skills, id } ).length > 0 ).length

        return { family: family.key, file: `${ family.specDir }/${ nn }-bridge.md`, pages: pages.length, populated, changed: prev !== content }
    } ) )

    results.forEach( ( r ) => {
        const state = r.changed === true ? '[written]' : '[unchanged]'
        console.log( `  ✓ ${ r.family }: ${ r.file } — ${ r.pages } pages (${ r.populated } populated, ${ r.pages - r.populated } none-yet) ${ state }` )
    } )
    console.log( `generate-bridge: ${ results.length } bridge page(s) generated.` )
}


const isEntrypoint = process.argv[ 1 ] === fileURLToPath( import.meta.url )
if( isEntrypoint === true ) {
    main().catch( ( err ) => {
        console.error( err )
        process.exit( 1 )
    } )
}
