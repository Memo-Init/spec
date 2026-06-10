#!/usr/bin/env node
// generate-llms-txt.mjs — memo-init concatenated spec for LLM consumption
//
// Concatenates all core chapters (spec/v<version>/*.md, in NN order) followed by
// all workbench chapters (spec/workbench/*.md, in NN order) into a single
// generated/llms.txt with a top header block (title + summary + source URL).
//
// Output format documented in generated/README.md.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

const REFS_MANUAL = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )
const SPEC_VERSION = REFS_MANUAL.spec.currentVersion
const SOURCE_URL = REFS_MANUAL.github.specRepo

const SPEC_DIR = join( REPO, `spec/v${ SPEC_VERSION }` )
const WORKBENCH_DIR = join( REPO, 'spec/workbench' )
const LLMS_PATH = join( REPO, 'generated/llms.txt' )


const collectChapters = async ( { sourceDir } ) => {
    const entries = await readdir( sourceDir )
    return entries
        .filter( ( f ) => /^\d{2}-/.test( f ) && f.endsWith( '.md' ) )
        .sort( ( a, b ) => a.localeCompare( b ) )
}


const readSection = async ( { sourceDir } ) => {
    const chapters = await collectChapters( { sourceDir } )
    const parts = []
    for( const filename of chapters ) {
        const content = await readFile( join( sourceDir, filename ), 'utf-8' )
        parts.push( content.replace( /\s*$/, '' ) )
    }
    return { count: chapters.length, text: parts.join( '\n\n---\n\n' ) }
}


const main = async () => {
    const header = [
        `# memo-init Specification v${ SPEC_VERSION }`,
        '',
        'A planning-first scaffold that turns long, dictated transcripts into discrete,',
        'executable work orders and governs the human-AI interaction around them. This file',
        'concatenates the full core specification followed by the workbench sub-spec.',
        '',
        `Source: ${ SOURCE_URL }`,
        ''
    ].join( '\n' )

    const core = await readSection( { sourceDir: SPEC_DIR } )
    const workbench = await readSection( { sourceDir: WORKBENCH_DIR } )

    const body = [
        header,
        '\n========================================',
        '# Core Specification',
        '========================================\n',
        core.text,
        '\n========================================',
        '# Workbench Sub-Spec',
        '========================================\n',
        workbench.text,
        ''
    ].join( '\n' )

    await mkdir( dirname( LLMS_PATH ), { recursive: true } )
    await writeFile( LLMS_PATH, body, 'utf-8' )

    console.log( `[OK] Wrote ${ LLMS_PATH } (core ${ core.count } + workbench ${ workbench.count } chapters)` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
