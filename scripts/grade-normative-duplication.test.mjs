// grade-normative-duplication.test.mjs — golden test for the cross-doc duplication/contradiction
// grade (Memo 075 WI-033). Runs Pass 1 against the FROZEN fixture under data/dup-fixtures/ (never the
// live corpus): WI-044 fixed the real /api/health contradiction in Phase 1, so the golden case must
// live in a frozen fixture to stay deterministic and independent of the live fix.
//
// Sibling convention: like every spec/scripts test this uses node:fs + node --test directly.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { analyzeCorpus } from './grade-normative-duplication.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const FIXTURES = join( __dirname, 'data', 'dup-fixtures' )


test( 'importing the grade script has no side effect (run-guard)', () => {
    assert.equal( typeof analyzeCorpus, 'function' )
} )


test( 'Pass 1 flags the frozen /api/health case as a contradiction candidate', async () => {
    const report = await analyzeCorpus( { corpusDir: FIXTURES } )

    const contradiction = report.candidates.find( ( c ) => c.type === 'contradiction' && c.token === '/api/health' )
    assert.ok( contradiction !== undefined, 'the /api/health cluster is a flagged contradiction candidate' )
    // both sides are located, one asserting the endpoint and one negating it
    assert.equal( contradiction.locations.length, 2 )
    assert.ok( contradiction.locations.some( ( l ) => l.includes( '(asserts)' ) ), 'one side asserts the endpoint' )
    assert.ok( contradiction.locations.some( ( l ) => l.includes( '(negates)' ) ), 'the other side negates it' )
} )


test( 'a single-sourced ID-format cluster (R10-09 positive pattern) is NOT flagged', async () => {
    const report = await analyzeCorpus( { corpusDir: FIXTURES } )

    // the id-format pair is high-overlap but the reference carries the "references, does not
    // duplicate" idiom, so it lands in `legitimate`, never in the flagged `candidates`.
    const flaggedIdFormat = report.candidates.some( ( c ) => c.locations.some( ( l ) => l.includes( 'id-format' ) ) )
    assert.equal( flaggedIdFormat, false, 'the single-sourced ID-format cluster is not a violation candidate' )

    const legitimateIdFormat = report.legitimate.some( ( c ) => c.locations.some( ( l ) => l.includes( 'id-format' ) ) )
    assert.equal( legitimateIdFormat, true, 'it is recognised as a legitimate reference (short rule + reference idiom)' )
} )


test( 'the analysis is deterministic — a re-run yields byte-identical candidate JSON', async () => {
    const first = await analyzeCorpus( { corpusDir: FIXTURES } )
    const second = await analyzeCorpus( { corpusDir: FIXTURES } )

    assert.equal( JSON.stringify( first.candidates ), JSON.stringify( second.candidates ) )
    assert.equal( JSON.stringify( first.legitimate ), JSON.stringify( second.legitimate ) )
} )


// The default-corpus path must never throw on a real tree (warn-not-block relies on it completing);
// resolve() keeps the fixture dir absolute so the run-guard comparison in the script holds.
test( 'analyzeCorpus over the fixture returns a bounded, well-formed report', async () => {
    const report = await analyzeCorpus( { corpusDir: resolve( FIXTURES ) } )

    assert.equal( report.fileCount, 4 )
    assert.ok( report.paragraphCount >= 4 )
    assert.ok( Array.isArray( report.candidates ) )
    assert.ok( Array.isArray( report.legitimate ) )
} )
