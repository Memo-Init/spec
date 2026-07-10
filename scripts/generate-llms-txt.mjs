#!/usr/bin/env node
// generate-llms-txt.mjs — per-family concatenated spec for LLM consumption (Memo 064 MI-S1/MI-S2).
//
// Restored from .trash/M058-20260701-0050/ and rewired onto the namespace-first layout (Memo 064
// MI-S6). For EACH discovered spec family it concatenates that family's dist chapters
// (spec/<ns>/<version>/dist/spec/NN-*.md, in NN order) into
// spec/<ns>/<version>/dist/generated/llms.txt, with a byte-identical llms-schema-spec.txt alias
// next to it (site convention, Kap-15 table).
//
// The generated/ folder lives INSIDE dist/ (the atomic copy unit, Kap 15): the docs site receives
// this bundle by pure copy and never re-synthesizes it — the core of "docs generate no content".
//
// The header's `Source:` line is the shared spec identifier composed through composeSpecId (Kap 17,
// MI-S2) — ONE token format, up front (refs.resolved.json) and at the back (this stamp). `fromCommit`
// is read once from the resolved refs aggregate (the value generate-refs stamped), and shortSha is
// its 7-char prefix, derived by composeSpecId — never hardcoded, never a second formatter.
//
// Determinism: readdir -> sort -> concat -> write. The header carries no timestamp, so two builds at
// the same HEAD produce byte-identical output. House style: 4-space, no semicolons, single quotes.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { discoverSpecs } from './lib/discover-specs.mjs'
import { distSpecDir, familyHeadPath, aggregatePath } from './lib/layout.mjs'
import { composeSpecId } from './lib/spec-id.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )


// The provenance token (Kap 17): fromCommit is read once from the resolved refs aggregate — the same
// value generate-refs stamped from HEAD — so the llms Source: line and the reference-ID up front
// share one commit. Absent refs (no prior generate-refs) fall back to the `unknown` sentinel.
const readFromCommit = () => {
    const refsPath = aggregatePath( { repoRoot: REPO, file: 'refs.resolved.json' } )
    try {
        const refs = JSON.parse( readFileSync( refsPath, 'utf-8' ) )
        return refs.generated?.fromCommit ?? 'unknown'
    } catch( error ) {
        return 'unknown'
    }
}


const collectChapters = async ( { sourceDir } ) => {
    let entries
    try {
        entries = await readdir( sourceDir )
    } catch( error ) {
        return []
    }
    return entries
        .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
        .sort( ( a, b ) => a.localeCompare( b ) )
}


const readSection = async ( { sourceDir } ) => {
    const chapters = await collectChapters( { sourceDir } )
    const parts = await Promise.all( chapters.map( async ( filename ) => {
        const content = await readFile( join( sourceDir, filename ), 'utf-8' )
        return content.replace( /\s*$/, '' )
    } ) )
    return { count: chapters.length, text: parts.join( '\n\n---\n\n' ) }
}


const buildBundle = ( { title, slug, version, specId, sectionText } ) => {
    const header = [
        `# ${ title } v${ version }`,
        '',
        `Spec-only concatenation of every chapter of the ${ slug } spec family, in NN order.`,
        'The docs site receives this bundle by copy — it never re-synthesizes it.',
        '',
        `Source: ${ specId }`,
        ''
    ].join( '\n' )

    return [ header, sectionText, '' ].join( '\n' )
}


const emitFamily = async ( { name, version, fromCommit } ) => {
    const head = JSON.parse( readFileSync( familyHeadPath( { repoRoot: REPO, name } ), 'utf-8' ) )
    const specId = composeSpecId( { namespaceToken: head.slug, version: head.version, fromCommit } )
    const sourceDir = distSpecDir( { repoRoot: REPO, name, version } )
    const section = await readSection( { sourceDir } )
    const bundle = buildBundle( { title: head.title, slug: head.slug, version: head.version, specId, sectionText: section.text } )

    const outDir = join( dirname( sourceDir ), 'generated' )
    await mkdir( outDir, { recursive: true } )
    const llmsPath = join( outDir, 'llms.txt' )
    const aliasPath = join( outDir, 'llms-schema-spec.txt' )
    await writeFile( llmsPath, bundle, 'utf-8' )
    await writeFile( aliasPath, bundle, 'utf-8' )

    return { name, chapters: section.count, specId, llmsPath }
}


const main = async () => {
    const families = discoverSpecs( { repoRoot: REPO } )
    const fromCommit = readFromCommit()

    const results = await Promise.all( families.map( ( { name, version } ) => {
        return emitFamily( { name, version, fromCommit } )
    } ) )

    results.forEach( ( r ) => {
        console.log( `[OK] ${ r.name }: ${ r.chapters } chapters -> ${ r.llmsPath } (Source: ${ r.specId })` )
    } )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
