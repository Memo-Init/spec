#!/usr/bin/env node
// generate-docs-payload.mjs — memo-init spec → docs payload
//
// Reads every chapter in four sibling spec families and prepends YAML
// frontmatter with discovery metadata, rewrites intra-spec links
// ./NN-name.md → /specification/<slug>/, and writes the result to
// dist/<name>/<version>/spec/:
//   memo      draft/memo/<version>/spec/*.md           → dist/memo/<version>/spec/<NN-name>.md
//   workbench draft/workbench/<version>/spec/*.md      → dist/workbench/<version>/spec/<NN-name>.md
//   session   draft/session/<version>/spec/*.md        → dist/session/<version>/spec/<NN-name>.md
//   spec      draft/spec/<version>/spec/*.md           → dist/spec/<version>/spec/<NN-name>.md (Meta-Spec, Memo 059)
//
// (The former SOP family was folded into the session family in Memo 049.)
// Each family carries its OWN version line (refs.manual.json keys spec /
// workbench / session) and stamps a per-family version frontmatter field
// (spec_version / workbench_version / session_version) — mirroring FlowMCP's
// grading_version / best_practice_version. The payload layout stays flat per
// family (the version rides in frontmatter, not the payload path), so the
// site sync paths stay stable.
//
// Output format documented in dist/README.md.

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )

// Per-family content versions are the curated values in data/refs.manual.json
// (spec / workbench / session .currentVersion) — the same single source generate-refs uses.
const REFS_MANUAL = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )

const readFamilyVersion = ( { family } ) => {
    const version = REFS_MANUAL?.[ family ]?.currentVersion
    if( typeof version !== 'string' || version.length === 0 ) {
        throw new Error( `[generate-docs-payload] data/refs.manual.json ${ family }.currentVersion missing or empty` )
    }
    return version
}

const SPEC_VERSION = readFamilyVersion( { family: 'memo' } )
const WORKBENCH_VERSION = readFamilyVersion( { family: 'workbench' } )
const SESSION_VERSION = readFamilyVersion( { family: 'session' } )
const SPEC_META_VERSION = readFamilyVersion( { family: 'spec' } )

const SPEC_DIR = join( REPO, REFS_MANUAL.memo.specDir )
const WORKBENCH_DIR = join( REPO, REFS_MANUAL.workbench.specDir )
const SESSION_DIR = join( REPO, REFS_MANUAL.session.specDir )
const SPEC_META_DIR = join( REPO, REFS_MANUAL.spec.specDir )
const PAYLOAD_DIR = join( REPO, 'dist', 'memo', SPEC_VERSION, 'spec' )
const WORKBENCH_PAYLOAD_DIR = join( REPO, 'dist', 'workbench', WORKBENCH_VERSION, 'spec' )
const SESSION_PAYLOAD_DIR = join( REPO, 'dist', 'session', SESSION_VERSION, 'spec' )
const SPEC_META_PAYLOAD_DIR = join( REPO, 'dist', 'spec', SPEC_META_VERSION, 'spec' )
const GENERATOR = 'scripts/generate-docs-payload.mjs'


// The per-family head (draft/<family>/spec.json) carries the family's identity and route.
const readFamilyHead = ( { family } ) => JSON.parse( readFileSync( join( REPO, 'draft', family, 'spec.json' ), 'utf-8' ) )


// Derive a family's own published route base from its head docEntry — never a route
// hardcoded to another family (WI-023 / SPEC-REQ-002). docEntry is either an absolute path
// (/specification/overview/) or a full URL (https://…/session/overview/); in both cases the
// FIRST path segment is the family's route (/specification/, /workbench/, /session/, /spec/).
// This is the single seam that lets a same-family link publish under the AUTHORING family's
// own route, so the site sync no longer has to compensate for a hardcoded intermediate route.
const routeBaseFromDocEntry = ( { docEntry } ) => {
    const pathPart = docEntry.replace( /^https?:\/\/[^/]+/, '' )
    const first = pathPart.split( '/' ).filter( ( seg ) => seg.length > 0 )[ 0 ] ?? ''

    return `/${ first }/`
}

const MEMO_ROUTE = routeBaseFromDocEntry( { docEntry: readFamilyHead( { family: 'memo' } ).docEntry } )
const WORKBENCH_ROUTE = routeBaseFromDocEntry( { docEntry: readFamilyHead( { family: 'workbench' } ).docEntry } )
const SESSION_ROUTE = routeBaseFromDocEntry( { docEntry: readFamilyHead( { family: 'session' } ).docEntry } )
const SPEC_META_ROUTE = routeBaseFromDocEntry( { docEntry: readFamilyHead( { family: 'spec' } ).docEntry } )


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


// Normative detection (WI-022 / Z1-14) — POSITION-AWARE, not a full-text match:
//   1. Hybrid override — a chapter that hosts an inline ```requirement block is normative
//      regardless of any Informative. lead: its requirement blocks stay binding, so the
//      machine-checkable rules are never read as non-normative.
//   2. Page marker — ONLY a `> **Informative.**` blockquote NEAR THE TOP (in the intro, before
//      the first `## ` heading) marks the WHOLE chapter non-normative.
//   3. Sectional marker — the same blockquote deeper in the body opens a single `## ` section
//      and marks only that section; it does NOT flip the whole chapter (a mid-page marker no
//      longer topples the chapter, which the former full-text regex did — e.g. workbench/02).
// The bold lead word must be exactly `Informative.`; a decorated lead (e.g.
// "Informative / forward-looking.") is not a page marker.
const detectNormative = ( { content } ) => {
    if( /```requirement/.test( content ) === true ) { return true }
    const head = content.split( /\n##\s/ )[ 0 ]
    const pageMarker = /^>\s*\*\*Informative\.\*\*/m.test( head )

    return pageMarker === false
}


// Rewrite spec links to published routes; an optional #anchor is preserved.
//
// Same-family intra-spec links "./NN-name.md" → "<routeBase><slug>/" where routeBase is the
// AUTHORING family's OWN route, derived from its head docEntry (WI-023). The generator emits the
// correct per-family route directly (memo → /specification/, workbench → /workbench/,
// session → /session/, spec → /spec/), so the site no longer re-routes an intermediate token.
//
// Cross-family links MUST be authored as absolute routes in the source. The former legacy special
// case that rewrote relative "../[../]<family>/NN-name.md" links was REMOVED (WI-119 / Z7-07): it
// silently rescued the forbidden relative form and masked dead on-disk links. A surviving relative
// cross-family link is now a defect that fails the build loudly here rather than being papered over.
const rewriteSpecLinks = ( { content, routeBase, filename } ) => {
    const crossFamily = content.match( /\]\(\.\.\/[^)]+\.md[^)]*\)/ )
    if( crossFamily !== null ) {
        throw new Error( `${ filename ?? 'spec page' }: forbidden relative cross-family link "${ crossFamily[ 0 ] }" — author it as the target family's absolute route (/specification/, /workbench/, /session/, /spec/).` )
    }

    return content.replace(
        /\]\(\.\/(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g,
        ( match, fname, anchor ) => `](${ routeBase }${ fname.replace( /^\d+-/, '' ) }/${ anchor ?? '' })`
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


const generateFile = async ( { filename, sourceDir, targetDir, section, routeBase, versionField, versionValue, sourceRelBase, sourceCommit, now } ) => {
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
    const bodyRewritten = rewriteSpecLinks( { content, routeBase, filename } )
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
// are touched — manifest.json and the workbench/ + session/ subdirs are left intact.
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


const generatePass = async ( { label, sourceDir, targetDir, section, routeBase, versionField, versionValue, sourceRelBase, sourceCommit, now } ) => {
    await mkdir( targetDir, { recursive: true } )
    await cleanTargetDir( { targetDir } )
    const chapters = await collectChapters( { sourceDir } )

    console.log( `Generating ${ label } payload from ${ chapters.length } files (${ versionField }=${ versionValue }, route=${ routeBase }, source_commit=${ sourceCommit })...` )
    const results = await Promise.all( chapters.map( async ( filename ) => {
        const result = await generateFile( { filename, sourceDir, targetDir, section, routeBase, versionField, versionValue, sourceRelBase, sourceCommit, now } )
        console.log( `  ✓ ${ filename } → ${ result.title }` )
        return result
    } ) )
    return results
}


// Route gate (WI-023 / SPEC-REQ-002): after generation, VERIFY — never assume — that every
// same-family link resolved to the AUTHORING family's own route, not a foreign family's route.
// For each family it re-reads the source, collects the same-family `./NN-name.md` links, derives
// the family's own route base independently from its head, and asserts the generated payload
// publishes each such link under that own route. A hardcoded-route regression (e.g. a spec-family
// link emitted under the memo route) makes the own-route form ABSENT from the payload and fails
// the build here, so the fix is checked structurally rather than trusted.
const assertSameFamilyRoutes = async ( { families } ) => {
    const failures = []
    await Promise.all( families.map( async ( family ) => {
        const routeBase = routeBaseFromDocEntry( { docEntry: readFamilyHead( { family: family.family } ).docEntry } )
        const chapters = await collectChapters( { sourceDir: family.sourceDir } )
        await Promise.all( chapters.map( async ( filename ) => {
            const source = await readFile( join( family.sourceDir, filename ), 'utf-8' )
            const output = await readFile( join( family.targetDir, filename ), 'utf-8' )
            // The top metadata table (Depends on / Related rows) is stripped from the published
            // body, so its same-family links never reach the output. Collect only the links that
            // SURVIVE — mirror the generator's transform (strip H1, strip the metadata table) and
            // then read the surviving same-family links from the body.
            const survivingBody = stripTopMetadataTable( { content: source.replace( /^#\s+.+?\n+/, '' ) } )
            const sameFamily = [ ...survivingBody.matchAll( /\]\(\.\/(\d{2}-[a-z0-9-]+)\.md(?:#[^)]*)?\)/g ) ]
            sameFamily.forEach( ( m ) => {
                const slug = m[ 1 ].replace( /^\d+-/, '' )
                const expected = `${ routeBase }${ slug }/`
                if( output.includes( expected ) === false ) {
                    failures.push( `${ family.label }/${ filename }: same-family link ./${ m[ 1 ] }.md did not publish under own route ${ expected }` )
                }
            } )
        } ) )
    } ) )

    if( failures.length > 0 ) {
        throw new Error( `[generate-docs-payload] route gate FAILED — same-family links resolved into a foreign family's route:\n  ${ failures.join( '\n  ' ) }` )
    }
    console.log( `\nRoute gate PASSED: every same-family link publishes under its own family route.` )
}


const reportPass = ( { label, results, targetDir } ) => {
    console.log( `\nGenerated ${ results.length } ${ label } files in ${ targetDir }` )
    console.log( `Normative: ${ results.filter( ( r ) => r.normative ).length }, Informative: ${ results.filter( ( r ) => !r.normative ).length }` )
}


const main = async () => {
    const sourceCommit = resolveCommit( { cwd: REPO } )
    const now = new Date().toISOString()

    const coreResults = await generatePass( {
        label: 'memo',
        sourceDir: SPEC_DIR,
        targetDir: PAYLOAD_DIR,
        section: 'Specification',
        routeBase: MEMO_ROUTE,
        versionField: 'spec_version',
        versionValue: SPEC_VERSION,
        sourceRelBase: REFS_MANUAL.memo.specDir,
        sourceCommit,
        now
    } )
    reportPass( { label: 'memo', results: coreResults, targetDir: PAYLOAD_DIR } )

    const workbenchResults = await generatePass( {
        label: 'workbench',
        sourceDir: WORKBENCH_DIR,
        targetDir: WORKBENCH_PAYLOAD_DIR,
        section: 'Workbench',
        routeBase: WORKBENCH_ROUTE,
        versionField: 'workbench_version',
        versionValue: WORKBENCH_VERSION,
        sourceRelBase: REFS_MANUAL.workbench.specDir,
        sourceCommit,
        now
    } )
    reportPass( { label: 'workbench', results: workbenchResults, targetDir: WORKBENCH_PAYLOAD_DIR } )

    const sessionResults = await generatePass( {
        label: 'session',
        sourceDir: SESSION_DIR,
        targetDir: SESSION_PAYLOAD_DIR,
        section: 'Session',
        routeBase: SESSION_ROUTE,
        versionField: 'session_version',
        versionValue: SESSION_VERSION,
        sourceRelBase: REFS_MANUAL.session.specDir,
        sourceCommit,
        now
    } )
    reportPass( { label: 'session', results: sessionResults, targetDir: SESSION_PAYLOAD_DIR } )

    // Fourth family: the Meta-Specification (spec). Its own version line rides in the
    // spec_meta_version frontmatter field (distinct from memo's spec_version) so the two
    // never collide even though both live under a "spec"-named path/route.
    const specMetaResults = await generatePass( {
        label: 'spec',
        sourceDir: SPEC_META_DIR,
        targetDir: SPEC_META_PAYLOAD_DIR,
        section: 'Meta-Spec',
        routeBase: SPEC_META_ROUTE,
        versionField: 'spec_meta_version',
        versionValue: SPEC_META_VERSION,
        sourceRelBase: REFS_MANUAL.spec.specDir,
        sourceCommit,
        now
    } )
    reportPass( { label: 'spec', results: specMetaResults, targetDir: SPEC_META_PAYLOAD_DIR } )

    // WI-023: verify the same-family rewrite landed in each family's OWN route (route gate).
    await assertSameFamilyRoutes( {
        families: [
            { family: 'memo', label: 'memo', sourceDir: SPEC_DIR, targetDir: PAYLOAD_DIR },
            { family: 'workbench', label: 'workbench', sourceDir: WORKBENCH_DIR, targetDir: WORKBENCH_PAYLOAD_DIR },
            { family: 'session', label: 'session', sourceDir: SESSION_DIR, targetDir: SESSION_PAYLOAD_DIR },
            { family: 'spec', label: 'spec', sourceDir: SPEC_META_DIR, targetDir: SPEC_META_PAYLOAD_DIR }
        ]
    } )
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
