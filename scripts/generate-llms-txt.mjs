#!/usr/bin/env node
// generate-llms-txt.mjs — memo-init concatenated spec for LLM consumption
//
// Concatenates all chapters of the three sibling spec families, in NN order, into a
// single generated/llms.txt with a top header block (title + summary + source URL):
//   Core Specification  — spec/v<spec_version>/*.md
//   Workbench Spec       — spec/workbench/<wb_version>/*.md
//   Session Spec         — spec/session/<session_version>/*.md
//
// Output format documented in generated/README.md.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

const REFS_MANUAL = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )
const SPEC_VERSION = REFS_MANUAL.memo.currentVersion
const WORKBENCH_VERSION = REFS_MANUAL.workbench.currentVersion
const SESSION_VERSION = REFS_MANUAL.session.currentVersion
const SOURCE_URL = REFS_MANUAL.github.specRepo

const SPEC_DIR = join( REPO, REFS_MANUAL.memo.specDir )
const WORKBENCH_DIR = join( REPO, REFS_MANUAL.workbench.specDir )
const SESSION_DIR = join( REPO, REFS_MANUAL.session.specDir )
const LLMS_PATH = join( REPO, 'generated/llms.txt' )


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


const main = async () => {
    const header = [
        `# memo-init Specification v${ SPEC_VERSION }`,
        '',
        'A planning-first scaffold that turns long, dictated transcripts into discrete,',
        'executable work orders and governs the human-AI interaction around them. This file',
        'concatenates the core specification followed by the workbench spec and the session spec',
        '(three independently versioned sibling families).',
        '',
        `Source: ${ SOURCE_URL }`,
        ''
    ].join( '\n' )

    const core = await readSection( { sourceDir: SPEC_DIR } )
    const workbench = await readSection( { sourceDir: WORKBENCH_DIR } )
    const session = await readSection( { sourceDir: SESSION_DIR } )

    const body = [
        header,
        '\n========================================',
        '# Memo Specification',
        '========================================\n',
        core.text,
        '\n========================================',
        `# Workbench Spec v${ WORKBENCH_VERSION }`,
        '========================================\n',
        workbench.text,
        '\n========================================',
        `# Session Spec v${ SESSION_VERSION }`,
        '========================================\n',
        session.text,
        ''
    ].join( '\n' )

    await mkdir( dirname( LLMS_PATH ), { recursive: true } )
    await writeFile( LLMS_PATH, body, 'utf-8' )

    console.log( `[OK] Wrote ${ LLMS_PATH } (core ${ core.count } + workbench ${ workbench.count } + session ${ session.count } chapters)` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
