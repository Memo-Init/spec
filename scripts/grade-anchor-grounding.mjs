#!/usr/bin/env node
// grade-anchor-grounding.mjs — fresh-context grounding measurement (Memo 066 WI-09)
//
// The hauseigene probe of the central remaining assumption (Kap 13): does the fixed meaning of an
// anchor term actually ARRIVE at a reader who has only the spec text? The AreaScorer pattern:
//   --emit-prompts   deterministically writes one blind-definition task per term (points a fresh
//                    agent at the owning family's spec ONLY) and writes the answer key SEPARATELY
//                    (the register's definition + negative delimitation — NEVER given to the definer).
//   [fresh agents]   a blind-definer defines each term incl. its non-meaning from spec alone; an
//                    independent scorer compares to the key (doer is not the grader).
//   --consume-scores ingests the scorer's JSON and writes the baseline report + score object.
//
// Scoring per term (scorer-assigned): meaningRecovered 0..2, negationRecovered 0..2 -> term score /4.
// Baseline = mean of term scores, as a percentage. Paths resolve via the family head, never hardcoded.

import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { draftSpecDirRel, familyHeadPath } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO_ROOT = join( __dirname, '..' )
const STORE_PATH = join( REPO_ROOT, 'data/anchor-terms.json' )
const PROMPTS_PATH = join( REPO_ROOT, 'anchor-grounding-prompts.json' )
const KEY_PATH = join( REPO_ROOT, 'anchor-grounding-key.json' )
const BASELINE_JSON = join( REPO_ROOT, 'anchor-grounding-baseline.json' )
const BASELINE_MD = join( REPO_ROOT, 'anchor-grounding-baseline.md' )


const familyVersion = async ( { family } ) => {
    const headPath = familyHeadPath( { repoRoot: REPO_ROOT, name: family } )
    if( existsSync( headPath ) === false ) return { ok: false }
    const head = JSON.parse( await readFile( headPath, 'utf-8' ) )
    return { ok: true, version: head.version }
}


const emitPrompts = async ( { store } ) => {
    const prompts = await Promise.all( store.terms.map( async ( term ) => {
        const ver = await familyVersion( { family: term.owningFamily } )
        const specDirRel = ver.ok === true ? draftSpecDirRel( { name: term.owningFamily, version: ver.version } ) : null
        return {
            id: term.id,
            label: term.label,
            owningFamily: term.owningFamily,
            owningChapter: term.owningChapter,
            specDir: specDirRel,
            task: `Read ONLY the ${ term.owningFamily } spec chapters under ${ specDirRel }. Using nothing but that text, write (1) a one-sentence definition of "${ term.label }" as this specification uses it, and (2) an explicit statement of what "${ term.label }" is NOT (its nearest wrong meaning). Do not use any outside knowledge and do not read any file named anchor-terms*. If the spec does not make the meaning recoverable, say so.`
        }
    } ) )

    // The answer key stays separate — never handed to the blind definer.
    const key = store.terms.map( ( t ) => ( {
        id: t.id,
        label: t.label,
        definition: t.definition,
        negativeDelimitation: t.negativeDelimitation
    } ) )

    await writeFile( PROMPTS_PATH, `${ JSON.stringify( { terms: prompts }, null, 4 ) }\n`, 'utf-8' )
    await writeFile( KEY_PATH, `${ JSON.stringify( { terms: key }, null, 4 ) }\n`, 'utf-8' )
    console.log( `[OK] emitted ${ prompts.length } blind-definition prompts -> ${ PROMPTS_PATH.replace( REPO_ROOT + '/', '' ) }` )
    console.log( `[OK] answer key (kept separate) -> ${ KEY_PATH.replace( REPO_ROOT + '/', '' ) }` )
}


const consumeScores = async ( { store, scoresPath } ) => {
    const scores = JSON.parse( await readFile( scoresPath, 'utf-8' ) )
    const byId = new Map( scores.terms.map( ( s ) => [ s.id, s ] ) )

    const rows = store.terms.map( ( t ) => {
        const s = byId.get( t.id ) || { meaningRecovered: 0, negationRecovered: 0, note: 'no score' }
        const termScore = s.meaningRecovered + s.negationRecovered
        return { id: t.id, label: t.label, meaning: s.meaningRecovered, negation: s.negationRecovered, termScore, max: 4, note: s.note || '' }
    } )

    const total = rows.reduce( ( acc, r ) => acc + r.termScore, 0 )
    const max = rows.length * 4
    const pct = Math.round( ( total / max ) * 100 )

    const baseline = {
        measure: 'anchor-grounding-baseline',
        termCount: rows.length,
        totalScore: total,
        maxScore: max,
        pct,
        perTerm: rows
    }

    await writeFile( BASELINE_JSON, `${ JSON.stringify( baseline, null, 4 ) }\n`, 'utf-8' )

    const md = [
        '# Anchor-Grounding Baseline (WI-09)',
        '',
        `Fresh-context measurement of whether each anchor term's fixed meaning arrives from spec text alone.`,
        `Per term: meaningRecovered (0..2) + negationRecovered (0..2). Baseline = mean, as %.`,
        '',
        `**Baseline: ${ pct }%** (${ total }/${ max } across ${ rows.length } terms).`,
        '',
        '| id | label | meaning /2 | negation /2 | /4 | note |',
        '|----|-------|-----------|-------------|----|------|',
        ...rows.map( ( r ) => `| \`${ r.id }\` | ${ r.label } | ${ r.meaning } | ${ r.negation } | ${ r.termScore } | ${ r.note } |` ),
        ''
    ].join( '\n' )
    await writeFile( BASELINE_MD, md, 'utf-8' )

    console.log( `[OK] baseline: ${ pct }% (${ total }/${ max }) -> ${ BASELINE_MD.replace( REPO_ROOT + '/', '' ) }` )
}


const main = async () => {
    const mode = process.argv[ 2 ]
    const store = JSON.parse( await readFile( STORE_PATH, 'utf-8' ) )

    if( mode === '--emit-prompts' ) {
        await emitPrompts( { store } )
    } else if( mode === '--consume-scores' ) {
        const scoresPath = process.argv[ 3 ]
        if( scoresPath === undefined || existsSync( scoresPath ) === false ) {
            console.error( '[ERROR] --consume-scores needs a path to the scorer JSON' )
            process.exit( 1 )
        }
        await consumeScores( { store, scoresPath } )
    } else {
        console.error( 'usage: grade-anchor-grounding.mjs --emit-prompts | --consume-scores <scores.json>' )
        process.exit( 1 )
    }
}


main().catch( ( err ) => {
    console.error( err )
    process.exit( 1 )
} )
