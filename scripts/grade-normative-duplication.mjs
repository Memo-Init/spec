#!/usr/bin/env node
// grade-normative-duplication.mjs — cross-doc duplication/contradiction grading (Memo 075 WI-033)
//
// The norm "references, does not duplicate" is saturated in the corpus, but every existing detector
// is intra-file / intra-store — none catches the SAME norm written out twice across two documents,
// nor two documents that state incompatible things (the /api/health case: one doc uses the endpoint,
// another says it does not exist). This is the missing cross-doc check, built on the two-pass
// AreaScorer pattern of grade-anchor-grounding.mjs and warn-not-block like lint-anchor-usage.mjs.
//
//   Pass 1 — deterministic (no API):
//     duplication  — paragraphs split on blank lines, word n-gram shingles per paragraph, Jaccard
//                    over cross-file pairs (via an inverted shingle index so it stays bounded). Two
//                    gates must hold (ratio >= 0.75 AND an absolute shared-shingle floor) so only a
//                    substantive near-identical restatement survives. A pair is then routed away from
//                    the candidate set when it is (a) a reference — an idiom ("references, does not
//                    duplicate", "single source", …) or a markdown link; (b) structural chrome — a
//                    table/blockquote/comment/fence/heading; or (c) the DESIGNED skill<->spec
//                    projection (a SKILL.md mirroring its draft spec, the source:spec coupling). What
//                    remains — the same norm written out in full in two authoring homes — is a
//                    duplication CANDIDATE.
//     contradiction — a fixed-meaning API endpoint (`/api/…`) that appears in >=2 files where one
//                    CLAUSE negates the endpoint and another asserts/uses it (CLI --flags were dropped
//                    — pervasive documentation, not conflict; negation is clause-scoped, not paragraph).
//   Pass 2 — AI grading (candidates only, fresh context, doer != grader):
//     --emit-prompts    writes one blind (a) duplication / (b) contradiction / (c) legitimate task
//                       per candidate cluster.
//     --consume-scores  ingests the scorer JSON and writes the report + score object
//                       (measure: normative-consistency-baseline).
//   bare invocation      runs Pass 1 and prints the candidate table (the npm-test hook path).
//
// Warn-not-block: EVERY path (including the top-level catch) exits 0 — a found candidate never fails
// a build, exactly like lint-anchor-usage.mjs.
//
// Sibling convention (deliberate, documented): the spec/scripts/* grading + generator tools are CLI
// tools that use `process.argv` mode-switching and `node:fs` directly — the established local pattern
// (grade-anchor-grounding.mjs and every other script here), a conscious deviation from the global
// no-process.argv/no-fs rule inside the spec-tooling context. House style otherwise holds: 4-space,
// no semicolons, single quotes, object params, object returns, no for/while, array methods.

import { readFile, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

import { discoverSpecs } from './lib/discover-specs.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const PROJECT_ROOT = resolve( REPO, '..' )
const OUT_PROMPTS = join( REPO, 'normative-duplication-prompts.json' )
const OUT_REPORT_JSON = join( REPO, 'normative-duplication-baseline.json' )
const OUT_REPORT_MD = join( REPO, 'normative-duplication-baseline.md' )

const SHINGLE_N = 5
const MIN_WORDS = 10
// Duplication gates (tuned WI-033, Phase 6): a genuine cross-doc duplication is a NEAR-IDENTICAL,
// SUBSTANTIVE restatement — not a 60%-overlapping fragment. The Jaccard floor was raised 0.6 -> 0.75
// and paired with an absolute shared-shingle floor, so a short high-ratio pair still needs real
// overlap. Both gates must hold (ratio AND substance). Before this tuning the bare scan flagged 367
// candidates on the live corpus (mostly CLI-flag noise + structural chrome + skill<->spec mirrors);
// after, ~35 high-signal duplications remain and the /api/health golden fixture still flags.
const JACCARD_MIN = 0.75
const MIN_SHARED_SHINGLES = 10
// A shingle shared by more than this many paragraphs is boilerplate — skip its bucket so the
// candidate-pair generation stays bounded on the live corpus.
const MAX_BUCKET = 30
// The bare scan prints at most this many candidate rows (the full set rides on --emit-prompts).
const DISPLAY_CAP = 25

const NEGATION_RE = /\b(nicht|kein|keine|keinen|niemals|does not exist|existiert nicht|no such|entfaellt|removed|deprecated|NOT|never)\b/i
// Reference idioms — a passage carrying one of these is a short-rule-plus-pointer or a use-not-a-home,
// a LEGITIMATE reference, never a duplication violation ("references, does not duplicate").
const REFERENCE_IDIOM_RE = /(references,?\s+does not duplicate|no second home|kein zweites zuhause|single source|single-source|owning place|owning definition|no double normativity|kanonische quelle|canonical source|authored source|defined in|siehe\b|\bsee\b|verweis|verweist|referenziert)/i
// A markdown link is a reference by construction — it points at the source instead of restating it.
const REFERENCE_LINK_RE = /\[[^\]]+\]\([^)]+\)/
// Non-normative structural chrome — table rows, blockquotes, HTML comments, code fences, headings. A
// pair where either side is pure chrome is scaffolding that legitimately recurs, not a duplicated
// norm; it is EXCLUDED (neither a violation candidate nor a "reference").
const CHROME_LINE_RE = /^\s*(\||>|<!--|```|#{1,6}\s)/
// Distinctive normative tokens with a FIXED meaning: an API endpoint asserted in one doc and negated
// in another is a genuine contradiction (the /api/health case). CLI --flags were dropped — they are
// documented pervasively across skills and their assert/negate co-occurrence is noise, not conflict.
const ENDPOINT_RE = /\/api\/[a-z0-9_/-]+/gi
// Negation is scoped to the CLAUSE the token sits in (split on sentence + comma + bracket + dash
// boundaries), so "use /api/documents (there is NO /api/health)" negates health, not documents.
const CLAUSE_RE = /[.;,\n(){}\[\]—–]+/


// ---------- corpus ----------

const mdAccept = ( { name } ) => name.endsWith( '.md' )
const skillAccept = ( { name } ) => name === 'SKILL.md'


// Recursively collect files a target accepts, skipping vendored/VCS trees so node_modules READMEs
// never enter the corpus (they are not authored norms).
const collectFiles = async ( { dirAbs, accept } ) => {
    if( existsSync( dirAbs ) === false ) return []
    const entries = await readdir( dirAbs, { withFileTypes: true } )
    const nested = await Promise.all( entries.map( async ( entry ) => {
        if( entry.name === 'node_modules' || entry.name === '.git' ) return []
        const full = join( dirAbs, entry.name )
        if( entry.isDirectory() === true ) return collectFiles( { dirAbs: full, accept } )
        if( accept( { name: entry.name } ) === true ) return [ full ]

        return []
    } ) )

    return nested.flat()
}


// The three authority levels (Kap 22): every family's draft spec bodies (all .md), the built skills
// (SKILL.md only — not vendored READMEs or shared fragments), and the global operator instructions
// (~/.claude/CLAUDE.md). A fixture run (--corpus) scans that one tree's .md instead. Every target is
// existsSync-guarded so a missing level just shrinks the corpus (warn-not-block never depends on one).
const buildCorpus = async ( { corpusDir } ) => {
    const groups = corpusDir !== undefined
        ? [ { dir: resolve( corpusDir ), accept: mdAccept } ]
        : [
            ...discoverSpecs( { repoRoot: REPO } ).map( ( family ) => ( { dir: join( REPO, family.specDir ), accept: mdAccept } ) ),
            { dir: resolve( REPO, '..', 'repos', 'core', 'skills' ), accept: skillAccept }
        ]
    const claudeMd = join( homedir(), '.claude', 'CLAUDE.md' )
    const extraFiles = corpusDir === undefined && existsSync( claudeMd ) === true ? [ claudeMd ] : []

    const nested = await Promise.all( groups.map( ( group ) => collectFiles( { dirAbs: group.dir, accept: group.accept } ) ) )
    const allPaths = [ ...nested.flat(), ...extraFiles ]

    const files = await Promise.all( allPaths.map( async ( path ) => {
        const text = await readFile( path, 'utf-8' ).catch( () => '' )
        const rel = path.startsWith( PROJECT_ROOT ) === true ? relative( PROJECT_ROOT, path ) : path

        return { rel, text }
    } ) )

    return files.filter( ( file ) => file.text.length > 0 )
}


// ---------- text primitives ----------

// Group consecutive non-blank lines into paragraphs, tracking each paragraph's 1-based start line.
// Functional fold (no for/while, no let) over the split lines.
const paragraphsOf = ( { text } ) => {
    const lines = text.split( '\n' )
    const folded = lines.reduce( ( state, line, idx ) => {
        if( line.trim() === '' ) {
            return state.current === null ? state : { done: [ ...state.done, state.current ], current: null }
        }
        if( state.current === null ) {
            return { done: state.done, current: { line: idx + 1, text: line } }
        }

        return { done: state.done, current: { line: state.current.line, text: `${ state.current.text }\n${ line }` } }
    }, { done: [], current: null } )

    return folded.current === null ? folded.done : [ ...folded.done, folded.current ]
}


const normalizeWords = ( { text } ) => text
    .toLowerCase()
    .replace( /`+/g, ' ' )
    .replace( /[^a-z0-9/_-]+/g, ' ' )
    .split( /\s+/ )
    .filter( ( word ) => word.length > 0 )


const shinglesOf = ( { words, n } ) => {
    if( words.length < n ) return new Set( words.length > 0 ? [ words.join( ' ' ) ] : [] )
    const count = words.length - n + 1
    const grams = Array.from( { length: count }, ( _, i ) => words.slice( i, i + n ).join( ' ' ) )

    return new Set( grams )
}


const sharedShingles = ( { a, b } ) => [ ...a ].filter( ( x ) => b.has( x ) ).length


const jaccard = ( { a, b } ) => {
    const inter = sharedShingles( { a, b } )
    const union = a.size + b.size - inter

    return union === 0 ? 0 : inter / union
}


// ---------- Pass 1: contradiction ----------

// A token is negated only when a negation word sits in the SAME clause as the token — not merely
// somewhere in the paragraph. This stops the co-location false positive where a passage recommends
// one endpoint while negating a different one in the next breath (e.g. CLAUDE.md line 353).
const clauseNegates = ( { text, token } ) => text
    .split( CLAUSE_RE )
    .some( ( clause ) => clause.toLowerCase().includes( token ) === true && NEGATION_RE.test( clause ) === true )


const contradictionScan = ( { corpus } ) => {
    const tokenMap = corpus.reduce( ( map, file ) => {
        file.paragraphs.forEach( ( para ) => {
            const tokens = [ ...new Set( ( para.text.match( ENDPOINT_RE ) || [] ).map( ( t ) => t.toLowerCase() ) ) ]
            tokens.forEach( ( token ) => {
                const negation = clauseNegates( { text: para.text, token } )
                const list = map.get( token ) ?? []
                list.push( { rel: file.rel, line: para.line, negation } )
                map.set( token, list )
            } )
        } )

        return map
    }, new Map() )

    return [ ...tokenMap.entries() ]
        .filter( ( [ , occ ] ) => {
            const files = new Set( occ.map( ( o ) => o.rel ) )
            const hasNeg = occ.some( ( o ) => o.negation === true )
            const hasPos = occ.some( ( o ) => o.negation === false )

            return files.size >= 2 && hasNeg === true && hasPos === true
        } )
        .map( ( [ token, occ ] ) => ( {
            type: 'contradiction',
            token,
            similarity: null,
            locations: occ
                .map( ( o ) => `${ o.rel }:${ o.line }${ o.negation === true ? ' (negates)' : ' (asserts)' }` )
                .sort()
        } ) )
        .sort( ( a, b ) => a.token.localeCompare( b.token ) )
}


// ---------- Pass 1: duplication ----------

// A paragraph is pure structural chrome when every non-blank line is a table row, blockquote, HTML
// comment, code fence or heading — scaffolding that recurs by design, not a duplicated norm.
const isChrome = ( { text } ) => text
    .split( '\n' )
    .every( ( line ) => line.trim() === '' || CHROME_LINE_RE.test( line ) === true )

const isSkillPath = ( { rel } ) => rel.endsWith( 'SKILL.md' ) === true
const isSpecDraftPath = ( { rel } ) => /\/draft\/spec\//.test( rel ) === true


const duplicationScan = ( { corpus } ) => {
    const paras = corpus
        .flatMap( ( file ) => file.paragraphs.map( ( para ) => ( { rel: file.rel, line: para.line, text: para.text, words: normalizeWords( { text: para.text } ) } ) ) )
        .filter( ( para ) => para.words.length >= MIN_WORDS )
        .map( ( para, idx ) => ( {
            ...para,
            idx,
            shingles: shinglesOf( { words: para.words, n: SHINGLE_N } ),
            idiom: REFERENCE_IDIOM_RE.test( para.text ) === true || REFERENCE_LINK_RE.test( para.text ) === true,
            chrome: isChrome( { text: para.text } )
        } ) )

    const byIdx = new Map( paras.map( ( para ) => [ para.idx, para ] ) )

    const index = paras.reduce( ( acc, para ) => {
        para.shingles.forEach( ( sh ) => {
            const bucket = acc.get( sh ) ?? []
            bucket.push( para.idx )
            acc.set( sh, bucket )
        } )

        return acc
    }, new Map() )

    const pairKeys = new Set()
    const pairs = []
    const buckets = [ ...index.values() ].filter( ( bucket ) => bucket.length >= 2 && bucket.length <= MAX_BUCKET )
    buckets.forEach( ( bucket ) => {
        bucket.forEach( ( a, i ) => {
            bucket.slice( i + 1 ).forEach( ( b ) => {
                const lo = Math.min( a, b )
                const hi = Math.max( a, b )
                const key = `${ lo }:${ hi }`
                if( pairKeys.has( key ) === false ) {
                    pairKeys.add( key )
                    pairs.push( [ lo, hi ] )
                }
            } )
        } )
    } )

    // A pair survives only when BOTH gates hold: the Jaccard ratio AND an absolute shared-shingle floor
    // (a short paragraph can hit a high ratio on a handful of shingles — MIN_SHARED_SHINGLES demands
    // that the overlap is substantive, not incidental).
    const scored = pairs
        .map( ( [ a, b ] ) => {
            const pa = byIdx.get( a )
            const pb = byIdx.get( b )

            return { pa, pb, sim: jaccard( { a: pa.shingles, b: pb.shingles } ), shared: sharedShingles( { a: pa.shingles, b: pb.shingles } ) }
        } )
        .filter( ( entry ) => entry.pa.rel !== entry.pb.rel && entry.sim >= JACCARD_MIN && entry.shared >= MIN_SHARED_SHINGLES )

    const toItem = ( { pa, pb, sim, type } ) => ( {
        type,
        similarity: Math.round( sim * 100 ) / 100,
        locations: [ `${ pa.rel }:${ pa.line }`, `${ pb.rel }:${ pb.line }` ].sort()
    } )

    // The DESIGNED skill<->spec projection: a SKILL.md paragraph mirroring its draft-spec source is the
    // source:spec coupling (Memo 056/039) — a reference by construction, not a duplicated home.
    const isSpecProjection = ( { pa, pb } ) => ( isSkillPath( { rel: pa.rel } ) === true && isSpecDraftPath( { rel: pb.rel } ) === true )
        || ( isSkillPath( { rel: pb.rel } ) === true && isSpecDraftPath( { rel: pa.rel } ) === true )

    // Classify each substantive high-overlap cross-file pair (priority order):
    //   legitimate  — either side is a reference (idiom or markdown link): a pointer, not a home.
    //   excluded    — either side is pure structural chrome, OR the pair is the skill<->spec projection.
    //   duplication — the remaining case: the same norm written out in full in two authoring homes.
    const classified = scored.map( ( entry ) => {
        if( entry.pa.idiom === true || entry.pb.idiom === true ) { return { bucket: 'legitimate', item: toItem( { ...entry, type: 'legitimate-reference' } ) } }
        if( entry.pa.chrome === true || entry.pb.chrome === true ) { return { bucket: 'excluded', item: toItem( { ...entry, type: 'structural-chrome' } ) } }
        if( isSpecProjection( { pa: entry.pa, pb: entry.pb } ) === true ) { return { bucket: 'excluded', item: toItem( { ...entry, type: 'skill-spec-projection' } ) } }

        return { bucket: 'duplication', item: toItem( { ...entry, type: 'duplication' } ) }
    } )

    // Deterministic order: similarity desc, then a stable type|locations tie-break (identical re-runs).
    const stableSort = ( a, b ) => ( b.similarity - a.similarity )
        || `${ a.type }|${ a.locations.join( ',' ) }`.localeCompare( `${ b.type }|${ b.locations.join( ',' ) }` )
    const pick = ( name ) => classified.filter( ( entry ) => entry.bucket === name ).map( ( entry ) => entry.item ).sort( stableSort )

    return { duplications: pick( 'duplication' ), legitimate: pick( 'legitimate' ), excluded: pick( 'excluded' ) }
}


// ---------- analysis ----------

const analyzeCorpus = async ( { corpusDir } = {} ) => {
    const files = await buildCorpus( { corpusDir } )
    const corpus = files.map( ( file ) => ( { rel: file.rel, paragraphs: paragraphsOf( { text: file.text } ) } ) )

    const contradictions = contradictionScan( { corpus } )
    const { duplications, legitimate, excluded } = duplicationScan( { corpus } )
    const candidates = [ ...contradictions, ...duplications ]
        .sort( ( a, b ) => `${ a.type }|${ a.locations.join( ',' ) }`.localeCompare( `${ b.type }|${ b.locations.join( ',' ) }` ) )

    return {
        fileCount: files.length,
        paragraphCount: corpus.reduce( ( n, file ) => n + file.paragraphs.length, 0 ),
        candidates,
        contradictions,
        duplications,
        legitimate,
        excluded
    }
}


// ---------- output ----------

const printScan = ( { analysis } ) => {
    console.log( `normative-duplication grade — ${ analysis.fileCount } file(s), ${ analysis.paragraphCount } paragraph(s) (Pass 1, deterministic, WARN-not-block).` )
    console.log( `candidates: ${ analysis.candidates.length } (contradiction ${ analysis.contradictions.length }, duplication ${ analysis.duplications.length }); legitimate references: ${ analysis.legitimate.length }; excluded (chrome + skill<->spec): ${ analysis.excluded.length }` )
    if( analysis.candidates.length === 0 ) {
        console.log( '[OK] no cross-doc duplication/contradiction candidates.' )

        return
    }
    console.log( '' )
    console.log( '| # | Typ | Similarity | Orte |' )
    console.log( '|---|-----|-----------|------|' )
    const shown = analysis.candidates.slice( 0, DISPLAY_CAP )
    shown.forEach( ( c, i ) => {
        console.log( `| ${ i + 1 } | ${ c.type } | ${ c.similarity ?? '—' } | ${ c.locations.join( ' · ' ) } |` )
    } )
    const remainder = analysis.candidates.length - shown.length
    if( remainder > 0 ) {
        console.log( `\n… and ${ remainder } more candidate(s). Run --emit-prompts for the full blind-judgement set.` )
    }
}


const emitPrompts = async ( { analysis } ) => {
    const prompts = analysis.candidates.map( ( cand, i ) => ( {
        id: `NDUP-${ String( i + 1 ).padStart( 3, '0' ) }`,
        type: cand.type,
        token: cand.token ?? null,
        similarity: cand.similarity,
        locations: cand.locations,
        task: `Read the passages at ${ cand.locations.join( ' and ' ) }. Classify this cluster blind and answer with exactly one of a|b|c plus one sentence why: (a) redundant duplication — the same norm is written out in full twice; (b) contradiction — the two passages state incompatible things; (c) legitimate — a short rule plus its full norm, or a use rather than a re-definition (the "references, does not duplicate" / "no second home" form).`
    } ) )
    await writeFile( OUT_PROMPTS, `${ JSON.stringify( { generatedBy: 'grade-normative-duplication (pass 1)', count: prompts.length, prompts }, null, 4 ) }\n`, 'utf-8' )
    printScan( { analysis } )
    console.log( `[OK] emitted ${ prompts.length } cluster prompt(s) -> ${ OUT_PROMPTS.replace( REPO + '/', '' ) }` )
}


const consumeScores = async ( { analysis, scoresPath } ) => {
    if( scoresPath === undefined || existsSync( scoresPath ) === false ) {
        console.error( '[WARN] --consume-scores needs a path to the scorer JSON; nothing consumed (exit 0).' )

        return
    }
    const scores = JSON.parse( await readFile( scoresPath, 'utf-8' ) )
    const verdicts = Array.isArray( scores.verdicts ) ? scores.verdicts : []
    const violations = verdicts.filter( ( v ) => v.verdict === 'a' || v.verdict === 'b' ).length

    const baseline = {
        measure: 'normative-consistency-baseline',
        clusterCount: analysis.candidates.length,
        contradictionCandidates: analysis.contradictions.length,
        duplicationCandidates: analysis.duplications.length,
        legitimateReferences: analysis.legitimate.length,
        excludedPairs: analysis.excluded.length,
        judgedViolations: violations,
        verdicts
    }
    await writeFile( OUT_REPORT_JSON, `${ JSON.stringify( baseline, null, 4 ) }\n`, 'utf-8' )

    const md = [
        '# Normative-Duplication Baseline (WI-033)',
        '',
        'Cross-doc duplication/contradiction grading (Pass 1 deterministic candidates -> Pass 2 blind judgement).',
        '',
        `**Candidates: ${ analysis.candidates.length }** (contradiction ${ analysis.contradictions.length }, duplication ${ analysis.duplications.length }); judged violations: ${ violations }.`,
        '',
        '| id | type | verdict | note |',
        '|----|------|---------|------|',
        ...verdicts.map( ( v ) => `| \`${ v.id ?? '' }\` | ${ v.type ?? '' } | ${ v.verdict ?? '' } | ${ v.note ?? '' } |` ),
        ''
    ].join( '\n' )
    await writeFile( OUT_REPORT_MD, md, 'utf-8' )

    console.log( `[OK] normative-consistency baseline: ${ violations }/${ analysis.candidates.length } judged violation(s) -> ${ OUT_REPORT_MD.replace( REPO + '/', '' ) }` )
}


const readFlag = ( { argv, flag } ) => {
    const idx = argv.indexOf( flag )

    return idx !== -1 ? argv[ idx + 1 ] : undefined
}


const main = async () => {
    const argv = process.argv.slice( 2 )
    const mode = argv.find( ( a ) => a === '--emit-prompts' || a === '--consume-scores' ) ?? '--scan'
    const corpusDir = readFlag( { argv, flag: '--corpus' } )

    const analysis = await analyzeCorpus( { corpusDir } )

    if( mode === '--emit-prompts' ) {
        await emitPrompts( { analysis } )
    } else if( mode === '--consume-scores' ) {
        await consumeScores( { analysis, scoresPath: readFlag( { argv, flag: '--consume-scores' } ) } )
    } else {
        printScan( { analysis } )
    }

    process.exit( 0 )
}


export { analyzeCorpus, duplicationScan, contradictionScan, paragraphsOf, jaccard, shinglesOf }


if( process.argv[ 1 ] !== undefined && resolve( process.argv[ 1 ] ) === fileURLToPath( import.meta.url ) ) {
    main().catch( ( err ) => {
        // Even an internal error must not block a build — report and exit 0 (warn-not-block).
        console.error( `[WARN][grade-error] normative-duplication grade could not complete: ${ err.message }` )
        process.exit( 0 )
    } )
}
