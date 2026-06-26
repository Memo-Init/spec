#!/usr/bin/env node
// generate-docs-payload.mjs — memo-init spec → docs payload
//
// Reads every chapter in three sibling spec families and prepends YAML
// frontmatter with discovery metadata, rewrites intra-spec links
// ./NN-name.md → /specification/<slug>/, and writes the result to
// generated/docs-payload/:
//   core      spec/v<spec_version>/*.md          → docs-payload/<NN-name>.md
//   workbench spec/workbench/<wb_version>/*.md    → docs-payload/workbench/<NN-name>.md
//   sop       spec/sop/<sop_version>/*.md         → docs-payload/sop/<NN-name>.md
//
// Each family carries its OWN version line (refs.manual.json keys spec /
// workbench / sop) and stamps a per-family version frontmatter field
// (spec_version / workbench_version / sop_version) — mirroring FlowMCP's
// grading_version / best_practice_version. The payload layout stays flat per
// family (the version rides in frontmatter, not the payload path), so the
// site sync paths stay stable.
//
// Output format documented in generated/README.md.

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

// Per-family content versions are the curated values in data/refs.manual.json
// (spec / workbench / sop .currentVersion) — the same single source generate-refs uses.
const REFS_MANUAL = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )

const readFamilyVersion = ( { family } ) => {
    const version = REFS_MANUAL?.[ family ]?.currentVersion
    if( typeof version !== 'string' || version.length === 0 ) {
        throw new Error( `[generate-docs-payload] data/refs.manual.json ${ family }.currentVersion missing or empty` )
    }
    return version
}

const SPEC_VERSION = readFamilyVersion( { family: 'spec' } )
const WORKBENCH_VERSION = readFamilyVersion( { family: 'workbench' } )
const SOP_VERSION = readFamilyVersion( { family: 'sop' } )
const SESSION_VERSION = readFamilyVersion( { family: 'session' } )

const SPEC_DIR = join( REPO, `spec/v${ SPEC_VERSION }` )
const WORKBENCH_DIR = join( REPO, `spec/workbench/${ WORKBENCH_VERSION }` )
const SOP_DIR = join( REPO, `spec/sop/${ SOP_VERSION }` )
const SESSION_DIR = join( REPO, `spec/session/${ SESSION_VERSION }` )
const PAYLOAD_DIR = join( REPO, 'generated/docs-payload' )
const WORKBENCH_PAYLOAD_DIR = join( PAYLOAD_DIR, 'workbench' )
const SOP_PAYLOAD_DIR = join( PAYLOAD_DIR, 'sop' )
const SESSION_PAYLOAD_DIR = join( PAYLOAD_DIR, 'session' )
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


// Rewrite spec links to published routes; an optional #anchor is preserved.
//
// (1) Same-family intra-spec links "./NN-name.md" → "/specification/<slug>/". For
//     workbench/sop pages, sync-spec re-routes "/specification/<slug>/" to the page's
//     own family route (family-scoped), so same-family links land correctly.
// (2) Cross-family links "../[../]<family>[/<version>]/NN-name.md" → the absolute route
//     of the TARGET family: core "v<x.y.z>" → /specification/, workbench → /workbench/,
//     sop → /sop/. The final route is emitted directly because sync-spec's re-routing is
//     family-scoped and cannot fix a cross-family link (this is why such links previously
//     survived unrewritten and 404'd on the site). Any depth of "../" and an optional
//     version subdir are tolerated, so the rewrite is robust to where the source file sits.
const rewriteSpecLinks = ( { content } ) => {
    const sameFamily = content.replace(
        /\]\(\.\/(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g,
        ( match, fname, anchor ) => `](/specification/${ fname.replace( /^\d+-/, '' ) }/${ anchor ?? '' })`
    )
    return sameFamily.replace(
        /\]\((?:\.\.\/)+(?:(v\d+\.\d+\.\d+)|(workbench|sop|session)(?:\/\d+\.\d+\.\d+)?)\/(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g,
        ( match, coreVersion, family, fname, anchor ) => {
            const route = coreVersion ? 'specification' : family
            return `](/${ route }/${ fname.replace( /^\d+-/, '' ) }/${ anchor ?? '' })`
        }
    )
}


const buildFrontmatter = ( { filename, title, description, order, section, normative, versionField, versionValue, sourceRelBase, sourceCommit, now } ) => {
    const relativeSourcePath = `${ sourceRelBase }/${ filename }`
    const lines = []
    lines.push( '---' )
    lines.push( `title: "${ escapeYamlString( { value: title } ) }"` )
    lines.push( `description: "${ escapeYamlString( { value: description } ) }"` )
    lines.push( `${ versionField }: "${ versionValue }"` )
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


const generateFile = async ( { filename, sourceDir, targetDir, section, versionField, versionValue, sourceRelBase, sourceCommit, now } ) => {
    const sourcePath = join( sourceDir, filename )
    const content = await readFile( sourcePath, 'utf-8' )

    const title = extractTitle( { content } ) || filename
    const description = extractDescription( { content } )
    const order = orderFromFilename( { filename } )
    const normative = detectNormative( { content } )

    const frontmatter = buildFrontmatter( { filename, title, description, order, section, normative, versionField, versionValue, sourceRelBase, sourceCommit, now } )

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


// Remove stale generated chapter files (NN-*.md) before regenerating, so a renamed
// or removed source chapter never lingers in the payload. Only NN-prefixed .md files
// are touched — manifest.json and the workbench/ + sop/ subdirs are left intact.
const cleanTargetDir = async ( { targetDir } ) => {
    let names
    try {
        names = await readdir( targetDir )
    } catch( error ) {
        return
    }
    const stale = names.filter( ( name ) => /^\d{2}-.*\.md$/.test( name ) )
    await Promise.all( stale.map( ( name ) => rm( join( targetDir, name ), { force: true } ) ) )
}


const generatePass = async ( { label, sourceDir, targetDir, section, versionField, versionValue, sourceRelBase, sourceCommit, now } ) => {
    await mkdir( targetDir, { recursive: true } )
    await cleanTargetDir( { targetDir } )
    const chapters = await collectChapters( { sourceDir } )

    console.log( `Generating ${ label } payload from ${ chapters.length } files (${ versionField }=${ versionValue }, source_commit=${ sourceCommit })...` )
    const results = await Promise.all( chapters.map( async ( filename ) => {
        const result = await generateFile( { filename, sourceDir, targetDir, section, versionField, versionValue, sourceRelBase, sourceCommit, now } )
        console.log( `  ✓ ${ filename } → ${ result.title }` )
        return result
    } ) )
    return results
}


const reportPass = ( { label, results, targetDir } ) => {
    console.log( `\nGenerated ${ results.length } ${ label } files in ${ targetDir }` )
    console.log( `Normative: ${ results.filter( ( r ) => r.normative ).length }, Informative: ${ results.filter( ( r ) => !r.normative ).length }` )
}


const main = async () => {
    const sourceCommit = resolveCommit( { cwd: REPO } )
    const now = new Date().toISOString()

    const coreResults = await generatePass( {
        label: 'core',
        sourceDir: SPEC_DIR,
        targetDir: PAYLOAD_DIR,
        section: 'Specification',
        versionField: 'spec_version',
        versionValue: SPEC_VERSION,
        sourceRelBase: `spec/v${ SPEC_VERSION }`,
        sourceCommit,
        now
    } )
    reportPass( { label: 'core', results: coreResults, targetDir: PAYLOAD_DIR } )

    const workbenchResults = await generatePass( {
        label: 'workbench',
        sourceDir: WORKBENCH_DIR,
        targetDir: WORKBENCH_PAYLOAD_DIR,
        section: 'Workbench',
        versionField: 'workbench_version',
        versionValue: WORKBENCH_VERSION,
        sourceRelBase: `spec/workbench/${ WORKBENCH_VERSION }`,
        sourceCommit,
        now
    } )
    reportPass( { label: 'workbench', results: workbenchResults, targetDir: WORKBENCH_PAYLOAD_DIR } )

    const sopResults = await generatePass( {
        label: 'sop',
        sourceDir: SOP_DIR,
        targetDir: SOP_PAYLOAD_DIR,
        section: 'SOP',
        versionField: 'sop_version',
        versionValue: SOP_VERSION,
        sourceRelBase: `spec/sop/${ SOP_VERSION }`,
        sourceCommit,
        now
    } )
    reportPass( { label: 'sop', results: sopResults, targetDir: SOP_PAYLOAD_DIR } )

    const sessionResults = await generatePass( {
        label: 'session',
        sourceDir: SESSION_DIR,
        targetDir: SESSION_PAYLOAD_DIR,
        section: 'Session',
        versionField: 'session_version',
        versionValue: SESSION_VERSION,
        sourceRelBase: `spec/session/${ SESSION_VERSION }`,
        sourceCommit,
        now
    } )
    reportPass( { label: 'session', results: sessionResults, targetDir: SESSION_PAYLOAD_DIR } )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
