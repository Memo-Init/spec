#!/usr/bin/env node
// generate-docs-payload.mjs — memo-init spec → docs payload
//
// Reads every chapter in spec/v<version>/*.md (core) and spec/workbench/*.md
// (sub-spec), prepends YAML frontmatter with discovery metadata, rewrites
// intra-spec links ./NN-name.md → /specification/<slug>/, and writes the result
// to generated/docs-payload/<NN-name>.md (core) and
// generated/docs-payload/workbench/<NN-name>.md (workbench).
//
// memo-init is simpler than FlowMCP: no grading or best-practice tracks, no
// metadata-footer relocation. The chapters already carry a "## Related" footer.
//
// Output format documented in generated/README.md.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

// Spec content version is the curated value in data/refs.manual.json
// (spec.currentVersion) — the same single source generate-refs uses.
const REFS_MANUAL = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )
const SPEC_VERSION = REFS_MANUAL?.spec?.currentVersion
if( typeof SPEC_VERSION !== 'string' || SPEC_VERSION.length === 0 ) {
    throw new Error( '[generate-docs-payload] data/refs.manual.json spec.currentVersion missing or empty' )
}

const SPEC_DIR = join( REPO, `spec/v${ SPEC_VERSION }` )
const WORKBENCH_DIR = join( REPO, 'spec/workbench' )
const PAYLOAD_DIR = join( REPO, 'generated/docs-payload' )
const WORKBENCH_PAYLOAD_DIR = join( PAYLOAD_DIR, 'workbench' )
const GENERATOR = 'scripts/generate-docs-payload.mjs'


// Strip the top metadata table (Status / Depends on / Related) that each source
// chapter carries directly under its H1. The reading order should be content-first;
// the same metadata is preserved in the chapter's bottom "## Related" footer, which
// is intentionally left untouched (Memo 002, Kap 1). The leading table block can use
// either a "| Field | Value |" or a borderless "| | |" header — both are handled by
// matching the first table block at the body start and removing it ONLY when it
// contains a "Status" row. That guard prevents stripping a leading content table.
const stripTopMetadataTable = ( { content } ) => {
    return content.replace(
        /^\s*\|[^\n]*\|[ \t]*\n\|[ \t:\-|]+\|[ \t]*\n(?:\|[^\n]*\|[ \t]*\n)+/,
        ( match ) => /\|\s*Status\s*\|/.test( match ) ? '' : match
    )
}


const resolveCommit = ( { cwd } ) => {
    try {
        return execSync( 'git rev-parse HEAD', { cwd } )
            .toString()
            .trim()
            .slice( 0, 7 )
    } catch( err ) {
        return 'unknown'
    }
}


const escapeYamlString = ( { value } ) => {
    return value
        .replace( /\\/g, '\\\\' )
        .replace( /"/g, '\\"' )
        .replace( /\n/g, ' ' )
}


const extractTitle = ( { content } ) => {
    const match = content.match( /^#\s+(.+?)\s*$/m )
    if( !match ) return null
    // Strip a leading "NN. " or "NN — " chapter-number prefix → clean nav title.
    return match[ 1 ]
        .replace( /^\d+\.\s*/, '' )
        .replace( /^\d+\s*[—–-]\s*/, '' )
        .trim()
}


const extractDescription = ( { content } ) => {
    const lines = content.split( '\n' )
    const candidates = lines
        .map( ( line ) => line.trim() )
        .filter( ( line ) => line !== '' )
        .filter( ( line ) => !line.startsWith( '#' ) )
        .filter( ( line ) => !line.startsWith( '>' ) )
        .filter( ( line ) => !line.startsWith( '---' ) )
        .filter( ( line ) => !line.startsWith( '|' ) )
        .filter( ( line ) => !line.startsWith( '```' ) )
        .filter( ( line ) => !/^this document uses the key words/i.test( line ) )
        .filter( ( line ) => !/\bBCP ?14\b/i.test( line ) && !/\bRFC ?2119\b/i.test( line ) )

    if( candidates.length === 0 ) return ''
    let desc = candidates[ 0 ]
    if( desc.length > 200 ) {
        desc = desc.slice( 0, 200 ).replace( /\s+\S*$/, '' ) + '...'
    }
    return desc
}


const slugFromFilename = ( { filename } ) => {
    return filename
        .replace( /^\d+-/, '' )
        .replace( /\.md$/, '' )
}


const orderFromFilename = ( { filename } ) => {
    const match = filename.match( /^(\d+)-/ )
    return match ? parseInt( match[ 1 ], 10 ) : 999
}


// Normative detection: a chapter explicitly marked "> **Informative.**" near its
// top is non-normative (philosophy / motivation / index prose). All other
// chapters carry normative language and assume the conformance interpretation.
const detectNormative = ( { content } ) => {
    return !/\*\*Informative\.\*\*/.test( content )
}


// Rewrite intra-spec links "./NN-name.md" → "/specification/<slug>/". The leading
// "./" and the "NN-" prefix are dropped; an optional #anchor is preserved.
const rewriteSpecLinks = ( { content } ) => {
    return content.replace(
        /\]\(\.\/(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g,
        ( match, fname, anchor ) => `](/specification/${ fname.replace( /^\d+-/, '' ) }/${ anchor ?? '' })`
    )
}


const buildFrontmatter = ( { filename, title, description, order, section, normative, sourceRelBase, sourceCommit, now } ) => {
    const relativeSourcePath = `${ sourceRelBase }/${ filename }`
    const sourceUrl = `${ REFS_MANUAL.github.specRepo }/blob/${ sourceCommit }/${ relativeSourcePath }`
    const lines = []
    lines.push( '---' )
    lines.push( `title: "${ escapeYamlString( { value: title } ) }"` )
    lines.push( `description: "${ escapeYamlString( { value: description } ) }"` )
    lines.push( `spec_version: "${ SPEC_VERSION }"` )
    lines.push( `spec_file: "${ filename }"` )
    lines.push( `order: ${ order }` )
    lines.push( `section: "${ section }"` )
    lines.push( `normative: ${ normative }` )
    lines.push( `generated_at: "${ now }"` )
    lines.push( `generated_from: "${ relativeSourcePath }"` )
    lines.push( `generator: "${ GENERATOR }"` )
    lines.push( `edit_warning: "This file is auto-generated. Source: ${ relativeSourcePath }."` )
    lines.push( '---' )
    return lines.join( '\n' ) + '\n'
}


const generateFile = async ( { filename, sourceDir, targetDir, section, sourceRelBase, sourceCommit, now } ) => {
    const sourcePath = join( sourceDir, filename )
    const content = await readFile( sourcePath, 'utf-8' )

    const title = extractTitle( { content } ) || filename
    const description = extractDescription( { content } )
    const order = orderFromFilename( { filename } )
    const normative = detectNormative( { content } )

    const frontmatter = buildFrontmatter( { filename, title, description, order, section, normative, sourceRelBase, sourceCommit, now } )

    // Rewrite intra-spec links, then strip the leading H1 (the docs site renders
    // the page title from the frontmatter, so the body H1 would be a duplicate),
    // then strip the top metadata table so the reading order is content-first
    // (Memo 002, Kap 1) — the bottom "## Related" footer keeps the metadata.
    const bodyRewritten = rewriteSpecLinks( { content } )
    const bodyNoH1 = bodyRewritten.replace( /^#\s+.+?\n+/, '' )
    const body = stripTopMetadataTable( { content: bodyNoH1 } )

    const output = frontmatter + '\n' + body

    const targetPath = join( targetDir, filename )
    await writeFile( targetPath, output, 'utf-8' )
    return { filename, title, normative, descLength: description.length }
}


const collectChapters = async ( { sourceDir } ) => {
    const entries = await readdir( sourceDir, { withFileTypes: true } )
    return entries
        .filter( ( dirent ) => dirent.isFile() && /^\d{2}-/.test( dirent.name ) && dirent.name.endsWith( '.md' ) )
        .map( ( dirent ) => dirent.name )
        .sort( ( a, b ) => a.localeCompare( b ) )
}


const generatePass = async ( { label, sourceDir, targetDir, section, sourceRelBase, sourceCommit, now } ) => {
    await mkdir( targetDir, { recursive: true } )
    const chapters = await collectChapters( { sourceDir } )

    console.log( `Generating ${ label } payload from ${ chapters.length } files (version=${ SPEC_VERSION }, source_commit=${ sourceCommit })...` )
    const results = []
    for( const filename of chapters ) {
        const result = await generateFile( { filename, sourceDir, targetDir, section, sourceRelBase, sourceCommit, now } )
        results.push( result )
        console.log( `  ✓ ${ filename } → ${ result.title }` )
    }
    return results
}


const main = async () => {
    const sourceCommit = resolveCommit( { cwd: REPO } )
    const now = new Date().toISOString()

    const coreResults = await generatePass( {
        label: 'core',
        sourceDir: SPEC_DIR,
        targetDir: PAYLOAD_DIR,
        section: 'Specification',
        sourceRelBase: `spec/v${ SPEC_VERSION }`,
        sourceCommit,
        now
    } )
    console.log( `\nGenerated ${ coreResults.length } core files in ${ PAYLOAD_DIR }` )
    console.log( `Normative: ${ coreResults.filter( ( r ) => r.normative ).length }, Informative: ${ coreResults.filter( ( r ) => !r.normative ).length }` )

    const workbenchResults = await generatePass( {
        label: 'workbench',
        sourceDir: WORKBENCH_DIR,
        targetDir: WORKBENCH_PAYLOAD_DIR,
        section: 'Workbench',
        sourceRelBase: 'spec/workbench',
        sourceCommit,
        now
    } )
    console.log( `\nGenerated ${ workbenchResults.length } workbench files in ${ WORKBENCH_PAYLOAD_DIR }` )
    console.log( `Normative: ${ workbenchResults.filter( ( r ) => r.normative ).length }, Informative: ${ workbenchResults.filter( ( r ) => !r.normative ).length }` )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
