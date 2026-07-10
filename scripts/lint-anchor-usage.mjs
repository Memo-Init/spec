#!/usr/bin/env node
// lint-anchor-usage.mjs — memo-init anchor-term usage lint (WARN-not-block, Memo 066 WI-08)
//
// Reads data/anchor-terms.json and checks each anchor term against the actual spec text:
//   [definition]  the canonical label appears in its owning chapter (the definition lives there)
//   [delimit]     a paragraph in the owning chapter that names the term also states a negation
//                 (the negative delimitation is lived in the prose, not only in the register — AT3)
//   [usage]       the label is used functionally across the owning family, not declared once (AT4)
//   [mis-label]   distinctive known mis-labels surfacing in prose are reported (advisory, OASF)
//
// This is a WARNING lint by design (F3=C, warn-not-block): it never fails a build. It docks onto
// the existing ORG-1 generation-script line and reports like ORG-3's DriftSensor (WARN, never block).
// It ALWAYS exits 0. Paths resolve via the family head (lib/layout.mjs), never hardcoded.

import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { draftSpecDirRel, familyHeadPath } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO_ROOT = join( __dirname, '..' )
const STORE_PATH = join( REPO_ROOT, 'data/anchor-terms.json' )
const FAMILIES = [ 'memo', 'meta-spec', 'session', 'workbench' ]
const USAGE_MIN_CHAPTERS = 2
const NEGATION_RE = /\b(not a\b|not an\b|is not\b|are not\b|NOT\b|never\b|rather than\b|MUST NOT\b|instead of\b)/


const familyVersion = async ( { family } ) => {
    const headPath = familyHeadPath( { repoRoot: REPO_ROOT, name: family } )
    if( existsSync( headPath ) === false ) return { ok: false }
    const head = JSON.parse( await readFile( headPath, 'utf-8' ) )
    return { ok: true, version: head.version }
}


const readFamilyChapters = async ( { family, version } ) => {
    const dirRel = draftSpecDirRel( { name: family, version } )
    const dirAbs = join( REPO_ROOT, dirRel )
    if( existsSync( dirAbs ) === false ) return []
    const entries = await readdir( dirAbs )
    const mds = entries.filter( ( e ) => e.endsWith( '.md' ) )
    const chapters = await Promise.all( mds.map( async ( file ) => {
        const text = await readFile( join( dirAbs, file ), 'utf-8' )
        return { stem: file.replace( /\.md$/, '' ), text }
    } ) )
    return chapters
}


// A word-boundary count of the label across a chapter's text. Case-insensitive and plural-tolerant:
// the primitives are capitalized names (Block, Tool) that appear as lowercase, plural prose
// (block/blocks, tool/tools), so functional usage is measured with `i` and an optional trailing `s`.
const labelRegex = ( { label, flags } ) => {
    const escaped = label.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' )
    return new RegExp( `\\b${ escaped }s?\\b`, flags )
}


const countLabel = ( { text, label } ) => {
    const matches = text.match( labelRegex( { label, flags: 'gi' } ) )
    return matches === null ? 0 : matches.length
}


// [delimit] — is there a paragraph in the owning chapter that names the term AND states a negation?
const hasLivedDelimitation = ( { text, label } ) => {
    const paragraphs = text.split( /\n\s*\n/ )
    const labelRe = labelRegex( { label, flags: 'i' } )
    const naming = paragraphs.filter( ( p ) => labelRe.test( p ) )
    return naming.some( ( p ) => NEGATION_RE.test( p ) )
}


const main = async () => {
    const store = JSON.parse( await readFile( STORE_PATH, 'utf-8' ) )

    // Pre-load every family's chapters once (usage is measured within the owning family).
    const familyText = {}
    await Promise.all( FAMILIES.map( async ( family ) => {
        const ver = await familyVersion( { family } )
        familyText[ family ] = ver.ok === true
            ? await readFamilyChapters( { family, version: ver.version } )
            : []
    } ) )

    const warnings = []

    store.terms.forEach( ( term ) => {
        const chapters = familyText[ term.owningFamily ] || []
        const owning = chapters.find( ( c ) => c.stem === term.owningChapter )

        if( owning === undefined ) {
            warnings.push( `[WARN][resolve] ${ term.id }: owning chapter ${ term.owningFamily }/${ term.owningChapter } not found` )
            return
        }

        // [definition] label present in owning chapter
        if( countLabel( { text: owning.text, label: term.label } ) === 0 ) {
            warnings.push( `[WARN][definition] ${ term.id }: label "${ term.label }" does not appear in its owning chapter ${ term.owningChapter }` )
        }

        // [delimit] negative delimitation lived in the owning chapter's prose
        if( hasLivedDelimitation( { text: owning.text, label: term.label } ) === false ) {
            warnings.push( `[WARN][delimit] ${ term.id }: no paragraph in ${ term.owningChapter } both names "${ term.label }" and states a negation (AT3 not lived in prose)` )
        }

        // [usage] used across at least USAGE_MIN_CHAPTERS chapters of the owning family (AT4)
        const usedIn = chapters.filter( ( c ) => countLabel( { text: c.text, label: term.label } ) > 0 ).length
        if( usedIn < USAGE_MIN_CHAPTERS ) {
            warnings.push( `[WARN][usage] ${ term.id }: "${ term.label }" used in only ${ usedIn } chapter(s) of ${ term.owningFamily } (min ${ USAGE_MIN_CHAPTERS }; declared not used?)` )
        }

        // [mis-label] distinctive (multi-word) known mis-labels surfacing anywhere in the owning family
        const distinctive = term.misLabels.filter( ( m ) => m.includes( ' ' ) )
        distinctive.forEach( ( mis ) => {
            const hits = chapters.filter( ( c ) => c.text.includes( mis ) ).length
            if( hits > 0 ) {
                warnings.push( `[INFO][mis-label] ${ term.id }: known mis-label "${ mis }" appears in ${ hits } ${ term.owningFamily } chapter(s) — review it is not used AS the term` )
            }
        } )
    } )

    console.log( `anchor-usage lint — ${ store.terms.length } terms across ${ FAMILIES.length } families (WARN-not-block).` )
    if( warnings.length === 0 ) {
        console.log( '[OK] no drift signals.' )
    } else {
        warnings.forEach( ( w ) => console.log( w ) )
        console.log( `\n${ warnings.length } advisory signal(s). This lint never blocks a build (exit 0).` )
    }

    process.exit( 0 )
}


main().catch( ( err ) => {
    // Even an internal error must not block a build — report and exit 0 (warn-not-block).
    console.error( `[WARN][lint-error] anchor-usage lint could not complete: ${ err.message }` )
    process.exit( 0 )
} )
