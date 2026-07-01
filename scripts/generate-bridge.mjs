#!/usr/bin/env node
// generate-bridge.mjs — per-page "Bridge" projection generator (one read-projection of the
// single skill->spec edge — split per family in repos/spec/draft/*/0.1.0/data/ — no second data store).
//
// Emits, across all three spec families, ONE per-page bridge for every non-bridge chapter
// (the three NN-bridge.md hub pages are excluded — they are the in-nav output hubs). The
// derived record carries eight fields; the PUBLIC per-page bridge renders the reader-facing
// subset (Memo 059, PRD-001/PRD-003, Kap 1):
//   (1) SOP anchor              the family's canonical SOP entry chapter
//   (2) public entry points     skills marked roleHint:public-entry (else inferred: primary owners)
//   (3) required detail pages    the chapter's own Depends-on / Related links
//   (4) skill enumeration        100% named implementers, primary vs contributing, one-line purpose
//   (5) grading assignment       the grader skill (roleHint:grader, else inferred heuristic)
// The (7) internal-tooling classification (visibility:"internal" split-off) is retained on the
// internal inverted map, but is NOT rendered on any public bridge surface — per-page, hub, or
// coverage table. Publishing our public-vs-internal skill classification is itself an internal
// interpretation (Memo 059, Kap 1/Kap 6): the skill NAMES are publishable, our verdict about
// them is not. The (6) gaps roll-up (skill-ahead-of-spec, internal reification delta) and the
// (8) provenance hash are likewise computed on the record but NOT published on the public page
// or the inverted map. An empty implementer list is rendered as an honest "nothing built yet"
// — never hidden.
//
// Side projections, all generated and idempotent:
//   - a per-page "## Implemented by" backlink written into EACH non-bridge source chapter
//     (marker-bounded, inserted before "## Related"),
//   - the three NN-bridge.md hub pages reshaped to a coverage index that points at the
//     projection,
//   - the inverted map published to dist/inverted-map.json,
//   - a "Cluster" column maintained on the core chapter-index README.
//
// roleHint markers (grader / public-entry) are an ADD-only field on the map; where absent
// the generator falls back to a heuristic and marks the result `inferred`. No network, no
// secrets. Outward-safe: leak patterns (memo references, absolute paths) are stripped from
// any free text pulled out of a SKILL.md. Run-guarded; exit 0 on success.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { discoverSpecs } from './lib/discover-specs.mjs'
import { loadSkillMap } from './lib/load-skill-map.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const PROJECT_ROOT = resolve( REPO, '..', '..' )
// Sentinel file: presence of any family map confirms the split map is available.
const SENTINEL_MAP = resolve( REPO, 'draft', 'memo', '0.1.0', 'data', 'skill-spec-map.json' )

const GENERATOR = 'scripts/generate-bridge.mjs'
const NN_RE = /^\d{2}-.*\.md$/
const BRIDGE_RE = /^\d{2}-bridge\.md$/
const INVERTED_MAP_PATH = join( REPO, 'dist', 'inverted-map.json' )
const bridgeDirFor = ( { name, version } ) => join( REPO, 'dist', name, version, 'bridge' )

const BACKLINK_START = '<!-- BRIDGE:IMPLEMENTED-BY START — generated, do not edit -->'
const BACKLINK_END = '<!-- BRIDGE:IMPLEMENTED-BY END -->'

// PRD-014: per-family metadata for the enhanced hub written to dist/spec/ (Astro frontmatter).
// versionField mirrors generate-docs-payload.mjs; section mirrors its `section` param per family.
const FAMILY_META = {
    memo: { versionField: 'spec_version', section: 'Specification' },
    workbench: { versionField: 'workbench_version', section: 'Workbench' },
    session: { versionField: 'session_version', section: 'Session' },
    spec: { versionField: 'spec_meta_version', section: 'Meta-Spec' }
}

// dist/<name>/<version>/spec/ — the directory sync-spec.mjs reads to serve site content.
const specPayloadDirFor = ( { name, version } ) => join( REPO, 'dist', name, version, 'spec' )

// F2 Dist-Split (Memo 057): the source chapter is authored-only and carries ONLY this
// placeholder; the rendered "## Implemented by" block is a derived artifact written to the
// dist (dist/<family>/<version>/bridge/<stem>.backlink.md). Constant string — kept byte-identical
// in check-bridge-inverse.mjs, which fails when a source is missing the placeholder OR still
// carries a full block (error in all directions).
const PLACEHOLDER = '<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->'

// The three local families — derived from per-specDir spec.json manifests via discoverSpecs
// (M058 PRD-005 de-hardcoding seam). `name` is the family key; `prefix` qualifies page ids;
// `sopAnchor` is the SOP entry chapter; `docEntry` is the canonical public documentation
// entry; `relatedRefs` seed the hub footer. Falls back to hardcoded values when spec.json absent.
const FAMILIES = discoverSpecs( { repoRoot: REPO } )


const numberFromName = ( { name } ) => {
    const match = name.match( /^(\d{2})-/ )

    return match ? parseInt( match[ 1 ], 10 ) : -1
}


// Leak-safety: neutralize the outward-facing reference patterns (memo references, internal
// gate codes, goal ids, absolute paths) so free text pulled from a SKILL.md never leaks an
// inward instance into a generated page. A parenthetical that carried a leak is dropped whole.
const LEAK_TEST = [ /MEMO-\d+/, /\bMemo \d+/, /\bG\d{3}\b/, /\/Users\// ]
const sanitizeLeak = ( { text } ) => {
    return text
        .replace( /\([^)]*\)/g, ( group ) => LEAK_TEST.some( ( re ) => re.test( group ) ) ? '' : group )
        .replace( /MEMO-\d+/g, '' )
        .replace( /\bMemo \d+/g, '' )
        .replace( /\bG\d{3}\b/g, '' )
        .replace( /\/Users\/\S+/g, '' )
        .replace( /\(\s*\)/g, '' )
        .replace( /\s+([.,;:])/g, '$1' )
        .replace( /\s{2,}/g, ' ' )
        .trim()
}


// One-line purpose for a skill: the first sentence of its SKILL.md description, sanitized and
// capped. Returns a stable fallback when the file or the description line is unreadable.
const purposeFromContent = ( { content } ) => {
    const match = content.match( /^description:\s*(.*)$/m )
    if( match === null ) return ''
    const firstSentence = match[ 1 ].split( /\.\s/ )[ 0 ].replace( /\.$/, '' )
    const clean = sanitizeLeak( { text: firstSentence } )

    return clean.length > 130 ? `${ clean.slice( 0, 127 ).trim() }…` : clean
}


const loadPurposes = async ( { skills } ) => {
    const pairs = await Promise.all( skills.map( async ( skill ) => {
        const abs = join( PROJECT_ROOT, skill.path )
        const content = await readFile( abs, 'utf-8' ).catch( () => null )
        const purpose = content === null ? '' : purposeFromContent( { content } )

        return [ skill.skill, purpose ]
    } ) )

    return new Map( pairs )
}


// Page list for a family: the union of the manifest pages[] and the on-disk NN-*.md chapters,
// minus any bridge page, sorted by chapter number. Returns { pages, groups } where pages is a
// list of { stem, id } pairs and groups carries the manifest groups ({ id, label, order, pages })
// so the dist hub can group its "## Chapters" section by category, mirroring the left sidebar
// (PRD-004, Memo 059). The bridge page itself is stripped from each group's page list.
const collectPages = async ( { specDirAbs, prefix } ) => {
    const manifest = JSON.parse( readFileSync( join( specDirAbs, 'spec-manifest.json' ), 'utf-8' ) )
    const fromManifest = ( manifest.groups ?? [] )
        .flatMap( ( group ) => Array.isArray( group.pages ) === true ? group.pages : [] )
    const onDisk = ( await readdir( specDirAbs ) )
        .filter( ( name ) => NN_RE.test( name ) === true )
        .map( ( name ) => name.replace( /\.md$/, '' ) )
    const stems = [ ...new Set( [ ...fromManifest, ...onDisk ] ) ]
        .filter( ( stem ) => /-bridge$/.test( stem ) === false )
        .sort( ( a, b ) => numberFromName( { name: `${ a }.md` } ) - numberFromName( { name: `${ b }.md` } ) )
    const groups = ( manifest.groups ?? [] ).map( ( group ) => ( {
        id: group.id,
        label: group.label,
        order: group.order,
        pages: ( Array.isArray( group.pages ) === true ? group.pages : [] )
            .filter( ( stem ) => /-bridge$/.test( stem ) === false )
    } ) )

    return { pages: stems.map( ( stem ) => ( { stem, id: `${ prefix }${ stem }` } ) ), groups }
}


// Existing NN-bridge.md hub number (reuse keeps re-runs idempotent), else next free number.
const resolveBridgeNN = async ( { specDirAbs } ) => {
    const names = await readdir( specDirAbs )
    const existingBridge = names.find( ( name ) => BRIDGE_RE.test( name ) === true )
    if( existingBridge !== undefined ) return existingBridge.match( /^(\d{2})-/ )[ 1 ]
    const numbers = names
        .filter( ( name ) => NN_RE.test( name ) === true && BRIDGE_RE.test( name ) === false )
        .map( ( name ) => numberFromName( { name } ) )
    const next = ( numbers.length === 0 ? 0 : Math.max( ...numbers ) ) + 1

    return String( next ).padStart( 2, '0' )
}


// All implementer skill records for a page id (a skill implements a page when its `all[]`
// contains the page's family-qualified id), each tagged with its role, sorted name-first.
const implementersFor = ( { skills, id } ) => {
    return skills
        .filter( ( skill ) => Array.isArray( skill.all ) === true && skill.all.includes( id ) === true )
        .map( ( skill ) => ( { ...skill, role: skill.primary === id ? 'primary' : 'contributing' } ) )
        .sort( ( a, b ) => a.skill.localeCompare( b.skill ) )
}


// (5) grading assignment: an implementer flagged roleHint:grader is authoritative; otherwise
// infer one from category/name and mark it inferred. Returns null when nothing grades the page.
const graderFor = ( { implementers } ) => {
    const marked = implementers.find( ( skill ) => skill.roleHint === 'grader' )
    if( marked !== undefined ) return { skill: marked.skill, inferred: false }
    const guessed = implementers.find( ( skill ) => {
        return [ 'grade', 'evals' ].includes( skill.category ) === true || /score|grade|fidelity/.test( skill.skill ) === true
    } )

    return guessed === undefined ? null : { skill: guessed.skill, inferred: true }
}


// (2) public entry points: skills flagged roleHint:public-entry are authoritative; otherwise
// infer from the primary owners and mark inferred. Always returns an object with the family doc.
const publicEntriesFor = ( { implementers, family } ) => {
    const marked = implementers.filter( ( skill ) => skill.roleHint === 'public-entry' )
    if( marked.length > 0 ) return { skills: marked.map( ( s ) => s.skill ), inferred: false, doc: family.docEntry }
    const owners = implementers.filter( ( skill ) => skill.role === 'primary' )

    return { skills: owners.map( ( s ) => s.skill ), inferred: true, doc: family.docEntry }
}


// (3) required detail pages: the Depends-on + Related chapter links from the page's own top
// metadata table, de-duplicated and sorted. These are the pages a reader must follow next.
const detailPagesFrom = ( { content, selfStem } ) => {
    const head = content.split( /\n##\s/ )[ 0 ]
    const rows = head
        .split( '\n' )
        .filter( ( line ) => /^\|\s*(Depends on|Related)\s*\|/.test( line ) === true )
    const refs = rows
        .flatMap( ( line ) => [ ...line.matchAll( /\(\.\/(\d{2}-[^).]+)\.md\)/g ) ].map( ( m ) => m[ 1 ] ) )

    return [ ...new Set( refs ) ]
        .filter( ( stem ) => stem !== selfStem )
        .sort( ( a, b ) => numberFromName( { name: `${ a }.md` } ) - numberFromName( { name: `${ b }.md` } ) )
}


// (6)/(7): the chapter's primary owners drive both rolls. Their gaps are the skill-ahead-of-
// spec capabilities clustered here; owners in an out-of-scope cluster are the acknowledged
// "no numbered chapter by design" surface.
const primaryOwners = ( { implementers } ) => implementers.filter( ( skill ) => skill.role === 'primary' )

const gapsRollup = ( { implementers } ) => {
    const owners = primaryOwners( { implementers } )
    const gaps = owners.flatMap( ( skill ) => Array.isArray( skill.gaps ) === true ? skill.gaps : [] )

    return [ ...new Set( gaps ) ].sort( ( a, b ) => a.localeCompare( b ) )
}

// (7) acknowledged out-of-scope / internal tooling: the skills that touch this chapter but
// carry visibility:"internal" (F4, Memo 057). They are excluded from the public projection
// (backlink, coverage, enumeration, inverted-map) and listed here honestly, never hidden.
const internalToolingFor = ( { internal } ) => {
    return internal
        .map( ( skill ) => ( { skill: skill.skill, category: skill.category } ) )
        .sort( ( a, b ) => a.skill.localeCompare( b.skill ) )
}


// Distinct skill clusters (categories) implementing a page — the README "Cluster" cell.
const clustersFor = ( { implementers } ) => {
    return [ ...new Set( implementers.map( ( skill ) => skill.category ) ) ].sort( ( a, b ) => a.localeCompare( b ) )
}


// The derived, projection-complete record for one page (the inverted-map row + bridge source).
const buildRecord = ( { family, stem, id, content, skills, purposes } ) => {
    // F4 (Memo 057): only PUBLIC skills enter the projection (public entries, enumeration,
    // grader, gaps, clusters, coverage, inverted-map, backlink); internal-tooling skills
    // (visibility:"internal") are split off and acknowledged separately under field 7.
    const allImplementers = implementersFor( { skills, id } )
    const implementers = allImplementers.filter( ( skill ) => skill.visibility !== 'internal' )
    const internal = allImplementers.filter( ( skill ) => skill.visibility === 'internal' )
    const enumeration = implementers.map( ( skill ) => ( {
        skill: skill.skill,
        role: skill.role,
        category: skill.category,
        purpose: purposes.get( skill.skill ) ?? ''
    } ) )
    const record = {
        family: family.name,
        stem,
        id,
        sopAnchor: family.sopAnchor,
        publicEntries: publicEntriesFor( { implementers, family } ),
        detailPages: detailPagesFrom( { content, selfStem: stem } ),
        implementers: enumeration,
        internalCount: internal.length,
        requirementCount: ( content.match( /```requirement/g ) ?? [] ).length,
        grader: graderFor( { implementers } ),
        gaps: gapsRollup( { implementers } ),
        outOfScope: internalToolingFor( { internal } ),
        clusters: clustersFor( { implementers } )
    }
    const provenance = createHash( 'sha256' ).update( JSON.stringify( record ) ).digest( 'hex' ).slice( 0, 12 )

    return { ...record, provenance }
}


const relLink = ( { stem } ) => `[${ stem }](./${ stem }.md)`


// One per-page bridge page rendered with its public projection fields, leak-safe and generated.
// PRD-001/PRD-003 (Memo 059, Kap 1): the internal-only gaps roll-up, the provenance hash, and
// the internal-tooling (out-of-scope) classification are no longer rendered on this public-facing
// page — publishing our public-vs-internal verdict is itself internal interpretation. The
// provenance hash and the out-of-scope set are still computed on the record for idempotency and
// the internal inverted map; they are simply not displayed here.
const renderBridgePage = ( { record } ) => {
    const { stem, family, sopAnchor, publicEntries, detailPages, implementers, grader } = record

    const entryLine = publicEntries.skills.length === 0
        ? `Canonical docs entry: \`${ publicEntries.doc }\`. No entry-point skill flagged yet.`
        : `${ publicEntries.skills.map( ( s ) => `\`${ s }\`` ).join( ', ' ) }${ publicEntries.inferred === true ? ' _(inferred from primary owners)_' : '' } · docs entry \`${ publicEntries.doc }\``

    const detailLine = detailPages.length === 0
        ? '— none —'
        : detailPages.map( ( s ) => relLink( { stem: s } ) ).join( ', ' )

    const skillRows = implementers.length === 0
        ? '| — | — | nothing built against this chapter yet |'
        : implementers
            .map( ( s ) => `| \`${ s.skill }\` | ${ s.role } | ${ s.purpose === '' ? '—' : s.purpose } |` )
            .join( '\n' )

    const gradingLine = grader === null
        ? 'No grader assigned yet.'
        : `Grading handled by \`${ grader.skill }\`${ grader.inferred === true ? ' _(inferred)_' : '' }.`

    return [
        `# Bridge — ${ stem }`,
        '',
        '| Field | Value |',
        '|---|---|',
        '| Family | ' + family + ' |',
        '| Chapter | ' + relLink( { stem } ) + ' |',
        '',
        '> **Informative · generated.** One read-projection of the skill-to-spec edge. Do not edit by hand.',
        '',
        `<!-- Auto-generated by ${ GENERATOR } from the skill-to-spec map. -->`,
        '',
        '## 1. SOP anchor',
        '',
        `This chapter is entered through the ${ family } SOP: ${ relLink( { stem: sopAnchor } ) }.`,
        '',
        '## 2. Public entry points',
        '',
        entryLine,
        '',
        '## 3. Required detail pages',
        '',
        detailLine,
        '',
        '## 4. Implementing skills',
        '',
        '| Skill | Role | Purpose |',
        '|---|---|---|',
        skillRows,
        '',
        '## 5. Grading assignment',
        '',
        gradingLine,
        ''
    ].join( '\n' )
}


// The marker-bounded "## Implemented by" backlink for a source chapter (idempotent block).
const renderBacklink = ( { implementers } ) => {
    const body = implementers.length === 0
        ? '- — none yet (nothing built against this chapter) —'
        : implementers.map( ( s ) => `- \`${ s.skill }\` — ${ s.role }` ).join( '\n' )

    return [
        BACKLINK_START,
        '## Implemented by',
        '',
        'The skills below implement this chapter (primary owner first). The full per-page bridge with all eight projection fields is published under `dist/<family>/<version>/bridge/`.',
        '',
        body,
        '',
        BACKLINK_END
    ].join( '\n' )
}


// F2 Dist-Split: ensure the source chapter carries ONLY the placeholder (never the full
// block). A legacy full block (marker-bounded) is collapsed to the placeholder; an already-
// placeholdered source is left untouched; a source with neither gets the placeholder inserted
// before "## Related" (else appended). Idempotent. The rendered block is written to the dist.
const ensurePlaceholder = ( { content } ) => {
    const startIdx = content.indexOf( BACKLINK_START )
    if( startIdx !== -1 ) {
        const endIdx = content.indexOf( BACKLINK_END, startIdx )
        const tail = content.slice( endIdx + BACKLINK_END.length )

        return `${ content.slice( 0, startIdx ) }${ PLACEHOLDER }${ tail }`
    }
    if( content.indexOf( PLACEHOLDER ) !== -1 ) return content
    const relatedMatch = content.match( /\n##\s+Related\s*\n/ )
    if( relatedMatch !== null ) {
        const at = relatedMatch.index
        const next = `${ content.slice( 0, at ) }\n\n${ PLACEHOLDER }\n${ content.slice( at + 1 ) }`

        return next
    }
    const trimmed = content.replace( /\s+$/, '' )

    return `${ trimmed }\n\n${ PLACEHOLDER }\n`
}


// F6 (Memo 057): the family Overview + Sichten (view tables), generated into the hub. Three
// views over the same derived records: requirement presence per chapter, public implementer
// presence per chapter, and the skill->dependencies inversion. The internal-tooling
// classification (Memo 059, Kap 1) is not surfaced here — only the public implementer set is.
// "Bedienbarkeit, kein Sherlock Holmes": the whole family is legible from one page.
const renderOverviewAndViews = ( { records } ) => {
    const publicSkills = new Set( records.flatMap( ( r ) => r.implementers.map( ( s ) => s.skill ) ) )
    const sopAnchor = records.length === 0 ? null : records[ 0 ].sopAnchor
    const covered = records.filter( ( r ) => r.implementers.length > 0 ).length
    const withReqs = records.filter( ( r ) => r.requirementCount > 0 ).length

    const chapterRows = records
        .map( ( r ) => {
            const reqCell = r.requirementCount === 0 ? '—' : String( r.requirementCount )
            const publicCell = r.implementers.length === 0 ? '— none —' : r.implementers.map( ( s ) => `\`${ s.skill }\`` ).join( ', ' )
            const dependsCell = r.detailPages.length === 0 ? '—' : r.detailPages.map( ( s ) => relLink( { stem: s } ) ).join( ', ' )

            return `| ${ relLink( { stem: r.stem } ) } | ${ reqCell } | ${ publicCell } | ${ dependsCell } |`
        } )
        .join( '\n' )

    const skillToChapters = records.reduce( ( acc, r ) => {
        r.implementers.forEach( ( s ) => {
            const list = acc.get( s.skill ) ?? []
            acc.set( s.skill, [ ...list, { stem: r.stem, role: s.role } ] )
        } )

        return acc
    }, new Map() )
    const skillRows = [ ...skillToChapters.entries() ]
        .sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) )
        .map( ( pair ) => {
            const chapters = pair[ 1 ]
            const primaries = chapters.filter( ( c ) => c.role === 'primary' ).map( ( c ) => `${ relLink( { stem: c.stem } ) } (primary)` )
            const contribs = chapters.filter( ( c ) => c.role !== 'primary' ).map( ( c ) => relLink( { stem: c.stem } ) )
            const deps = [ ...primaries, ...contribs ].join( ', ' )

            return `| \`${ pair[ 0 ] }\` | ${ deps } |`
        } )
        .join( '\n' )

    return [
        '## Overview',
        '',
        `- **Implementer skills:** ${ publicSkills.size }`,
        `- **SOP anchor:** ${ sopAnchor === null ? '—' : relLink( { stem: sopAnchor } ) }`,
        `- **Coverage:** ${ covered } of ${ records.length } chapters; ${ withReqs } chapter(s) carry inline requirements.`,
        '',
        '## Views',
        '',
        '### By chapter — requirements · implementers · dependencies',
        '',
        '| Chapter | Reqs | Implementers | Depends on |',
        '|---|---|---|---|',
        chapterRows === '' ? '| — | — | — | — |' : chapterRows,
        '',
        '### By skill — dependencies (skill → chapters)',
        '',
        '| Skill | Chapters (dependencies) |',
        '|---|---|',
        skillRows === '' ? '| — | — |' : skillRows
    ].join( '\n' )
}


// The reshaped NN-bridge.md hub: a public overview + Sichten (F6) + projection pointer (in-nav,
// audit-clean). PRD-001 (Memo 059): the reader-facing intro is the public Soll-text; internal
// interpretation (coverage %, provenance, projection internals) is not surfaced in the prose.
const renderHubPage = ( { nn, family, records, relatedRefs } ) => {
    const overviewAndViews = renderOverviewAndViews( { records } )
    const relatedRow = relatedRefs.map( ( ref ) => `[./${ ref }.md](./${ ref }.md)` ).join( ', ' )
    const relatedList = relatedRefs.map( ( ref ) => `- [./${ ref }.md](./${ ref }.md)` ).join( '\n' )

    return [
        `# ${ nn }. Bridge`,
        '',
        '| Field | Value |',
        '|---|---|',
        '| Status | Draft |',
        `| Related | ${ relatedRow } |`,
        '',
        '> **Informative.**',
        '',
        'This page maps each specification chapter to the skills that implement it — so you can see which parts of the workflow are covered and where to look next.',
        '',
        '<!-- generated -->',
        `<!-- Auto-generated by ${ GENERATOR } from the skill-to-spec map. Do not edit by hand; re-run the spec build to regenerate. -->`,
        '',
        overviewAndViews,
        '',
        '## Related',
        '',
        relatedList,
        ''
    ].join( '\n' )
}


// Sanitize text to a valid Mermaid node id: alphanumeric + underscore only, no leading digit.
const toMermaidId = ( { text } ) => {
    const clean = text.replace( /[^a-zA-Z0-9]/g, '_' )

    return /^\d/.test( clean ) === true ? `n_${ clean }` : clean
}


// PRD-009 + PRD-003 (Memo 059, Kap 1): the "## Coverage summary" head-table for the dist hub.
// One quantification row per chapter, each chapter name a click-to-scroll intra-page anchor link
// into its block under "## Chapters". The internal-only gaps column, the coverage percentage, and
// the internal-classification count are no longer surfaced on the public page (PRD-001/PRD-003);
// the honest covered/total count and the public implementer count stay.
const renderCoverageSummary = ( { records } ) => {
    const covered = records.filter( ( r ) => r.implementers.length > 0 ).length
    const totalReqs = records.reduce( ( sum, r ) => sum + r.requirementCount, 0 )

    const headRows = records.map( ( r ) => {
        const coveredCell = r.implementers.length > 0 ? '✓' : '—'
        const reqCell = r.requirementCount === 0 ? '—' : String( r.requirementCount )

        return `| [${ r.stem }](#${ r.stem }) | ${ coveredCell } | ${ r.implementers.length } | ${ reqCell } |`
    } ).join( '\n' )

    const summaryRow = `| **Summary** | **${ covered } / ${ records.length }** | — | ${ totalReqs > 0 ? String( totalReqs ) : '—' } |`

    return [
        '## Coverage summary',
        '',
        '| Chapter | Covered | Implementers | Reqs |',
        '|---|---|---|---|',
        headRows === '' ? '| — | — | — | — |' : headRows,
        summaryRow
    ].join( '\n' )
}


// PRD-008: one named block per chapter (public skills, requirements, depends-on). The gaps row
// and the internal-tooling classification (Memo 059, Kap 1) are not rendered on the public page
// (PRD-003). The stem is the heading text so the coverage-summary link `(#<stem>)` resolves to
// this block's slug.
const renderChapterBlock = ( { record } ) => {
    const publicCell = record.implementers.length === 0
        ? '— none yet —'
        : record.implementers.map( ( s ) => `\`${ s.skill }\`` ).join( ', ' )
    const reqCell = record.requirementCount === 0 ? '—' : String( record.requirementCount )
    const depsCell = record.detailPages.length === 0
        ? '—'
        : record.detailPages.map( ( s ) => relLink( { stem: s } ) ).join( ', ' )

    return [
        `#### ${ record.stem }`,
        '',
        '| Field | Value |',
        '|---|---|',
        `| Covered | ${ record.implementers.length > 0 ? '✓ yes' : '— not yet' } |`,
        `| Skills | ${ publicCell } |`,
        `| Requirements | ${ reqCell } |`,
        `| Depends on | ${ depsCell } |`,
        ''
    ].join( '\n' )
}


// PRD-004 (Memo 059): the "## Chapters" section — the per-chapter blocks GROUPED by the
// spec-manifest groups[] categories (mirroring the left sidebar), each group a "### <label>"
// heading in manifest.groups[].order with its chapters indented under it as "#### <stem>". A
// chapter that belongs to no manifest group falls into a trailing "Other" group. The chapter
// stem stays the anchor target, so the coverage-summary click-to-scroll links keep working.
const renderChaptersSection = ( { records, groups } ) => {
    const byStem = new Map( records.map( ( r ) => [ r.stem, r ] ) )
    const assigned = new Set()
    const orderedGroups = [ ...( groups ?? [] ) ].sort( ( a, b ) => ( a.order ?? 0 ) - ( b.order ?? 0 ) )

    const groupBlocks = orderedGroups.flatMap( ( group ) => {
        const inGroup = ( group.pages ?? [] )
            .map( ( stem ) => byStem.get( stem ) )
            .filter( ( record ) => record !== undefined )
        inGroup.forEach( ( record ) => assigned.add( record.stem ) )
        if( inGroup.length === 0 ) return []

        return [ [
            `### ${ group.label ?? group.id }`,
            '',
            inGroup.map( ( record ) => renderChapterBlock( { record } ) ).join( '\n' )
        ].join( '\n' ) ]
    } )

    const leftover = records.filter( ( record ) => assigned.has( record.stem ) === false )
    const otherBlock = leftover.length === 0
        ? []
        : [ [
            '### Other',
            '',
            leftover.map( ( record ) => renderChapterBlock( { record } ) ).join( '\n' )
        ].join( '\n' ) ]

    const allBlocks = [ ...groupBlocks, ...otherBlock ]

    return [
        '## Chapters',
        '',
        allBlocks.length === 0 ? '— no chapters —' : allBlocks.join( '\n' )
    ].join( '\n' )
}


// PRD-011: By-skill section grouped by namespace (category). Each category becomes a named ###
// sub-section with a per-group count header + a skill-to-chapters dependency table. A total
// summary line closes the section so the namespace count is always visible.
const renderBySkillSection = ( { records } ) => {
    const skillData = new Map()
    records.forEach( ( r ) => {
        r.implementers.forEach( ( s ) => {
            const entry = skillData.get( s.skill ) ?? { category: s.category, chapters: [] }
            skillData.set( s.skill, {
                category: entry.category,
                chapters: [ ...entry.chapters, { stem: r.stem, role: s.role } ]
            } )
        } )
    } )

    const byCategory = new Map()
    skillData.forEach( ( data, skill ) => {
        const cat = data.category ?? 'uncategorized'
        const group = byCategory.get( cat ) ?? []
        byCategory.set( cat, [ ...group, { skill, chapters: data.chapters } ] )
    } )

    const sortedCats = [ ...byCategory.keys() ].sort()
    const totalSkills = skillData.size

    if( totalSkills === 0 ) {
        return [
            '## Skills by namespace',
            '',
            '— no public implementer skills yet —'
        ].join( '\n' )
    }

    const catBlocks = sortedCats.map( ( cat ) => {
        const skillsInCat = ( byCategory.get( cat ) ?? [] ).sort( ( a, b ) => a.skill.localeCompare( b.skill ) )
        const skillRows = skillsInCat.map( ( entry ) => {
            const primaries = entry.chapters
                .filter( ( c ) => c.role === 'primary' )
                .map( ( c ) => `${ relLink( { stem: c.stem } ) } (primary)` )
            const contribs = entry.chapters
                .filter( ( c ) => c.role !== 'primary' )
                .map( ( c ) => relLink( { stem: c.stem } ) )
            const chapterCell = [ ...primaries, ...contribs ].join( ', ' )

            return `| \`${ entry.skill }\` | ${ chapterCell } |`
        } ).join( '\n' )

        return [
            `### ${ cat } (${ skillsInCat.length } skill${ skillsInCat.length === 1 ? '' : 's' })`,
            '',
            '| Skill | Chapters |',
            '|---|---|',
            skillRows,
            ''
        ].join( '\n' )
    } ).join( '\n' )

    return [
        '## Skills by namespace',
        '',
        catBlocks,
        `**Summary: ${ sortedCats.length } namespace${ sortedCats.length === 1 ? '' : 's' } · ${ totalSkills } skill${ totalSkills === 1 ? '' : 's' } total**`
    ].join( '\n' )
}


// PRD-010 + PRD-005 (Memo 059): ONE Mermaid graph view for the dist hub — the skill dependency
// graph derived from the declared `requires` edges in the skill-spec map (real edges, not
// hardcoded). For the memo family this is the SOP entry graph: every requires-edge points
// X --> memo-sop, so memo-sop is the root of the graph, plus the rollout sub-chain
// (evaluate --> execute --> generate). The former second diagram — a reversed "SOP entry points"
// star (sop --> skill) — was a near-duplicate with the opposite arrow direction and has been
// removed (PRD-005). Rendered `flowchart TD`. A family with no declared requires edges renders an
// honest placeholder instead of a diagram. Skill nodes use the sk_ id prefix.
const renderMermaidSection = ( { records, familyName, skills } ) => {
    const skillsByName = new Map( ( skills ?? [] ).map( ( s ) => [ s.skill, s ] ) )

    const allImplementerNames = [ ...new Set( records.flatMap( ( r ) => r.implementers.map( ( s ) => s.skill ) ) ) ]
    const requiresEdges = allImplementerNames.flatMap( ( skillName ) => {
        const data = skillsByName.get( skillName )
        if( data === undefined || Array.isArray( data.requires ) === false || data.requires.length === 0 ) return []

        return data.requires.map( ( target ) => ( { from: skillName, to: target } ) )
    } )
    const requiresNodes = [ ...new Set( [ ...requiresEdges.map( ( e ) => e.from ), ...requiresEdges.map( ( e ) => e.to ) ] ) ].sort()

    const dagBlock = requiresEdges.length === 0
        ? [ '_(no skill dependencies declared in this family)_' ]
        : [
            '```mermaid',
            'flowchart TD',
            ...requiresNodes.map( ( s ) => `    sk_${ toMermaidId( { text: s } ) }["${ s }"]` ),
            ...requiresEdges.map( ( e ) => `    sk_${ toMermaidId( { text: e.from } ) } --> sk_${ toMermaidId( { text: e.to } ) }` ),
            '```'
        ]

    return [
        '## Graph views',
        '',
        `### Skill dependency graph — \`requires\` edges (${ familyName })`,
        '',
        ...dagBlock
    ].join( '\n' )
}


// Dist-hub page for dist/<family>/<version>/bridge/<nn>-bridge.md (also served on the site).
// PRD-004 (Memo 059) in-page order: a public Soll-text overview, then Graph views (the skill
// dependency graph as the lead visual — moved up from last), Coverage summary → Skills by
// namespace → Chapters (grouped by manifest groups[], mirroring the left sidebar).
// PRD-001: the intro is the reader-facing Soll-text; the coverage percentage and
// other internal interpretation are not surfaced (the generated-file notice is kept). The H1
// title is distinct from every ## / ### / #### heading, so there is no double-heading risk.
const renderDistHub = ( { nn, family, records, skills, groups } ) => {
    const coverageSummary = renderCoverageSummary( { records } )
    const bySkill = renderBySkillSection( { records } )
    const chapters = renderChaptersSection( { records, groups } )
    const graphViews = renderMermaidSection( { records, familyName: family, skills: skills ?? [] } )

    return [
        `# ${ nn }. Bridge — ${ family }`,
        '',
        'This page maps each specification chapter to the skills that implement it — so you can see which parts of the workflow are covered and where to look next.',
        '',
        '> **Informative · generated.** Do not edit by hand; re-run the spec build to regenerate.',
        '',
        `<!-- Auto-generated by ${ GENERATOR } from the skill-to-spec map. -->`,
        '',
        graphViews,
        '',
        coverageSummary,
        '',
        bySkill,
        '',
        chapters,
        ''
    ].join( '\n' )
}


// PRD-014: Escape a string value for embedding inside a double-quoted YAML scalar.
const escapeYaml = ( { value } ) => {
    return value
        .replace( /\\/g, '\\\\' )
        .replace( /"/g, '\\"' )
        .replace( /\n/g, ' ' )
}


// PRD-014: Rewrite same-family intra-spec links (./NN-name.md) to site-routed slugs
// (/specification/name/). sync-spec.mjs then re-routes /specification/ to /workbench/
// or /session/ for sibling families, so using /specification/ as the target is correct
// for all three families (mirrors what generate-docs-payload.mjs does).
const rewriteLinks = ( { content } ) => {
    return content.replace(
        /\]\(\.\/(\d{2}-[a-z0-9-]+)\.md(#[^)]*)?\)/g,
        ( match, fname, anchor ) => `](/specification/${ fname.replace( /^\d+-/, '' ) }/${ anchor ?? '' })`
    )
}


// PRD-014: Astro frontmatter for the enhanced hub written to dist/spec/. Mirrors the
// frontmatter shape that generate-docs-payload.mjs produces so generate-manifest and
// sync-spec.mjs consume it without surprises. normative=false (the hub is Informative).
const buildHubFrontmatter = ( { nn, family } ) => {
    const meta = FAMILY_META[ family ] ?? { versionField: `${ family }_version`, section: family }
    const version = FAMILIES.find( ( f ) => f.name === family )?.version ?? '0.1.0'
    const desc = escapeYaml( {
        value: `Bridge hub for the ${ family } specification: per-chapter skill coverage, Mermaid graph views, and by-skill namespace grouping.`
    } )
    const order = parseInt( nn, 10 )
    const now = new Date().toISOString()

    return [
        '---',
        `title: "Bridge"`,
        `description: "${ desc }"`,
        `${ meta.versionField }: "${ version }"`,
        `spec_file: "${ nn }-bridge.md"`,
        `order: ${ order }`,
        `section: "${ meta.section }"`,
        `normative: false`,
        `generated_at: "${ now }"`,
        `generated_from: "generated (bridge dist-hub)"`,
        `generator: "${ GENERATOR }"`,
        `edit_warning: "This file is auto-generated by ${ GENERATOR }. Do not edit by hand."`,
        '---'
    ].join( '\n' ) + '\n'
}


// Maintain the "Cluster" column on the core chapter-index README (idempotent). The Document /
// Title / Mode cells are preserved; the cluster cell is always recomputed from the map.
const updateReadmeCluster = async ( { specDirAbs, records } ) => {
    const readmePath = join( specDirAbs, 'README.md' )
    const content = await readFile( readmePath, 'utf-8' ).catch( () => null )
    if( content === null ) return { changed: false }
    const byStem = new Map( records.map( ( r ) => [ r.stem, r.clusters ] ) )
    const lines = content.split( '\n' )
    const headerIdx = lines.findIndex( ( line ) => /^\|\s*Document\s*\|\s*Title\s*\|\s*Mode\s*\|/.test( line ) === true )
    if( headerIdx === -1 ) return { changed: false }
    const cells = ( line ) => line.split( '|' ).slice( 1, -1 )
    const next = lines.map( ( line, index ) => {
        if( index < headerIdx ) return line
        if( /^\|/.test( line ) === false ) return line
        if( index === headerIdx ) return '| Document | Title | Mode | Cluster |'
        if( /^\|[\s:|-]+\|$/.test( line ) === true ) return '|----------|-------|------|---------|'
        const parts = cells( line )
        if( parts.length < 3 ) return line
        const stemMatch = parts[ 0 ].match( /(\d{2}-[^).\]]+)/ )
        const clusters = stemMatch === null ? [] : ( byStem.get( stemMatch[ 1 ] ) ?? [] )
        const clusterCell = clusters.length === 0 ? '—' : clusters.join( ', ' )

        return `| ${ parts[ 0 ].trim() } | ${ parts[ 1 ].trim() } | ${ parts[ 2 ].trim() } | ${ clusterCell } |`
    } )
    const rendered = next.join( '\n' )
    const changed = rendered !== content
    if( changed === true ) await writeFile( readmePath, rendered, 'utf-8' )

    return { changed }
}


const main = async () => {
    if( existsSync( SENTINEL_MAP ) === false ) {
        console.warn( `generate-bridge: skipped — per-family skill-spec-map.json not found at ${ SENTINEL_MAP }. The bridge is a cross-repo artifact (split maps live in the spec repo draft/ tree); when the data files are absent (e.g. an isolated CI checkout with stale assets), the committed bridge artifacts are kept as-is. Full regeneration + the inverse gate run locally / pre-push.` )
        return
    }
    const map = await loadSkillMap( { repoRoot: REPO } )
    const skills = Array.isArray( map.skills ) === true ? map.skills : []
    const purposes = await loadPurposes( { skills } )

    const families = await Promise.all( FAMILIES.map( async ( family ) => {
        const specDirAbs = join( REPO, family.specDir )
        const nn = await resolveBridgeNN( { specDirAbs } )
        const { pages, groups } = await collectPages( { specDirAbs, prefix: family.prefix } )

        const records = await Promise.all( pages.map( async ( { stem, id } ) => {
            const sourcePath = join( specDirAbs, `${ stem }.md` )
            const content = await readFile( sourcePath, 'utf-8' )
            const record = buildRecord( { family, stem, id, content, skills, purposes } )

            // per-page bridge → dist/<family>/<version>/bridge/<stem>.md
            const outDir = bridgeDirFor( { name: family.name, version: family.version } )
            await mkdir( outDir, { recursive: true } )
            await writeFile( join( outDir, `${ stem }.md` ), renderBridgePage( { record } ), 'utf-8' )

            // F2 Dist-Split: the rendered "## Implemented by" block → DIST only; the source
            // carries the placeholder (authored vs derived boundary).
            const block = renderBacklink( { implementers: record.implementers } )
            await writeFile( join( outDir, `${ stem }.backlink.md` ), `${ block }\n`, 'utf-8' )
            const nextContent = ensurePlaceholder( { content } )
            const backlinkChanged = nextContent !== content
            if( backlinkChanged === true ) await writeFile( sourcePath, nextContent, 'utf-8' )

            return { record, backlinkChanged }
        } ) )

        const recordList = records.map( ( r ) => r.record )

        // PRD-008/009/010/011: write the dist hub (enhanced bridge view with named ## sections,
        // count head-table, Mermaid graph views, and by-skill namespace grouping)
        const bridgeOutDir = bridgeDirFor( { name: family.name, version: family.version } )
        const distHubContent = renderDistHub( { nn, family: family.name, records: recordList, skills, groups } )
        const distHubPath = join( bridgeOutDir, `${ nn }-bridge.md` )
        const prevDistHub = await readFile( distHubPath, 'utf-8' ).catch( () => null )
        if( prevDistHub !== distHubContent ) await writeFile( distHubPath, distHubContent, 'utf-8' )

        // PRD-014: also write the enhanced hub to dist/spec/ with Astro frontmatter so
        // sync-spec.mjs serves it on the site. The build order (generate-docs-payload first,
        // generate-bridge second) ensures this write is NOT clobbered by the plain-hub write.
        // The H1 is stripped (frontmatter title takes over); same-family links are rewritten
        // to /specification/<slug>/ (sync-spec re-routes to /workbench/ or /session/ for
        // sibling families, mirroring generate-docs-payload's rewriteSpecLinks behaviour).
        const specOutDir = specPayloadDirFor( { name: family.name, version: family.version } )
        await mkdir( specOutDir, { recursive: true } )
        const specHubFrontmatter = buildHubFrontmatter( { nn, family: family.name } )
        const specHubBodyNoH1 = distHubContent.replace( /^#[^\n]+\n+/, '' )
        const specHubBodyRewritten = rewriteLinks( { content: specHubBodyNoH1 } )
        const specHubContent = specHubFrontmatter + '\n' + specHubBodyRewritten
        const specHubPath = join( specOutDir, `${ nn }-bridge.md` )
        const prevSpecHub = await readFile( specHubPath, 'utf-8' ).catch( () => null )
        const specHubChanged = prevSpecHub !== specHubContent
        if( specHubChanged === true ) await writeFile( specHubPath, specHubContent, 'utf-8' )

        // reshape the NN-bridge.md hub
        const hubPath = join( specDirAbs, `${ nn }-bridge.md` )
        const hubContent = renderHubPage( { nn, family: family.name, records: recordList, relatedRefs: family.relatedRefs } )
        const prevHub = await readFile( hubPath, 'utf-8' ).catch( () => null )
        if( prevHub !== hubContent ) await writeFile( hubPath, hubContent, 'utf-8' )

        const readme = family.name === 'memo'
            ? await updateReadmeCluster( { specDirAbs, records: recordList } )
            : { changed: false }

        return {
            key: family.name,
            version: family.version,
            specDir: family.specDir,
            nn,
            records: recordList,
            backlinkChanges: records.filter( ( r ) => r.backlinkChanged === true ).length,
            hubChanged: prevHub !== hubContent,
            distHubChanged: prevDistHub !== distHubContent,
            specHubChanged,
            readmeChanged: readme.changed
        }
    } ) )

    // publish the inverted map → dist/inverted-map.json
    const mapHash = createHash( 'sha256' ).update( JSON.stringify( map ) ).digest( 'hex' ).slice( 0, 12 )
    const inverted = {
        note: 'Inverted skill->spec projection (read-only): one entry per non-bridge spec page, listing its public implementer skills with role + the public projection fields. Generated from skill-spec-map.json. The internal-only gaps roll-up is not published here (Memo 059, PRD-003).',
        generator: GENERATOR,
        mapHash,
        pages: families.flatMap( ( family ) => family.records ).map( ( r ) => ( {
            family: r.family,
            id: r.id,
            stem: r.stem,
            sopAnchor: r.sopAnchor,
            publicEntries: r.publicEntries.skills,
            publicEntriesInferred: r.publicEntries.inferred,
            detailPages: r.detailPages,
            implementers: r.implementers.map( ( s ) => ( { skill: s.skill, role: s.role } ) ),
            grader: r.grader,
            outOfScope: r.outOfScope.map( ( o ) => o.skill ),
            clusters: r.clusters,
            requirementCount: r.requirementCount,
            internalCount: r.internalCount,
            provenance: r.provenance
        } ) )
    }
    await mkdir( dirname( INVERTED_MAP_PATH ), { recursive: true } )
    await writeFile( INVERTED_MAP_PATH, `${ JSON.stringify( inverted, null, 4 ) }\n`, 'utf-8' )

    const totalPages = families.reduce( ( sum, f ) => sum + f.records.length, 0 )
    families.forEach( ( f ) => {
        const covered = f.records.filter( ( r ) => r.implementers.length > 0 ).length
        console.log( `  ✓ ${ f.key }: ${ f.records.length } per-page bridge(s) → dist/${ f.key }/${ f.version }/bridge/ (${ covered } covered), hub ${ f.specDir }/${ f.nn }-bridge.md, dist-hub dist/${ f.key }/${ f.version }/bridge/${ f.nn }-bridge.md, spec-hub dist/${ f.key }/${ f.version }/spec/${ f.nn }-bridge.md (PRD-014), ${ f.backlinkChanges } backlink change(s)${ f.readmeChanged === true ? ', README cluster updated' : '' }` )
    } )
    console.log( `generate-bridge: ${ totalPages } per-page bridges across ${ families.length } families; inverted-map.json published to dist/ (mapHash ${ mapHash }).` )
}


const isEntrypoint = process.argv[ 1 ] === fileURLToPath( import.meta.url )
if( isEntrypoint === true ) {
    main().catch( ( err ) => {
        console.error( err )
        process.exit( 1 )
    } )
}
