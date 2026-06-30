#!/usr/bin/env node
// generate-bridge.mjs — per-page "Bridge" projection generator (one read-projection of the
// single skill->spec edge in repos/core/data/skill-spec-map.json — no second data store).
//
// Emits, across all three spec families, ONE per-page bridge for every non-bridge chapter
// (the three NN-bridge.md hub pages are excluded — they are the in-nav output hubs). A
// per-page bridge carries the EIGHT mandatory fields of the projection:
//   (1) SOP anchor              the family's canonical SOP entry chapter
//   (2) public entry points     skills marked roleHint:public-entry (else inferred: primary owners)
//   (3) required detail pages    the chapter's own Depends-on / Related links
//   (4) skill enumeration        100% named implementers, primary vs contributing, one-line purpose
//   (5) grading assignment       the grader skill (roleHint:grader, else inferred heuristic)
//   (6) gaps roll-up             skill-ahead-of-spec gaps of the chapter's primary owners
//   (7) acknowledged out-of-scope primary owners whose domain has no numbered chapter
//   (8) provenance hash          a content hash of the derived record (idempotent)
// An empty implementer list is rendered as an honest "nothing built yet" — never hidden.
//
// Side projections, all generated and idempotent:
//   - a per-page "## Implemented by" backlink written into EACH non-bridge source chapter
//     (marker-bounded, inserted before "## Related"),
//   - the three NN-bridge.md hub pages reshaped to a coverage index that points at the
//     projection,
//   - the inverted map published to generated/bridge/inverted-map.json,
//   - a "Cluster" column maintained on the core chapter-index README.
//
// roleHint markers (grader / public-entry) are an ADD-only field on the map; where absent
// the generator falls back to a heuristic and marks the result `inferred`. No network, no
// secrets. Outward-safe: leak patterns (memo references, absolute paths) are stripped from
// any free text pulled out of a SKILL.md. Run-guarded; exit 0 on success.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
const PROJECT_ROOT = resolve( REPO, '..', '..' )
const MAP_PATH = resolve( REPO, '..', 'core', 'data', 'skill-spec-map.json' )
const REFS = JSON.parse( readFileSync( join( REPO, 'data/refs.manual.json' ), 'utf-8' ) )

const GENERATOR = 'scripts/generate-bridge.mjs'
const NN_RE = /^\d{2}-.*\.md$/
const BRIDGE_RE = /^\d{2}-bridge\.md$/
const BRIDGE_OUT = join( REPO, 'generated/bridge' )

const BACKLINK_START = '<!-- BRIDGE:IMPLEMENTED-BY START — generated, do not edit -->'
const BACKLINK_END = '<!-- BRIDGE:IMPLEMENTED-BY END -->'

// Out-of-process skill clusters: their capabilities have no numbered spec chapter by design
// (spec 06 / 40 say so explicitly). Used for field (7) and the README cluster note.
const OUT_OF_SCOPE_CATEGORIES = [ 'visual', 'domain', 'flowmcp', 'grade' ]

// The three local families. `prefix` is the family-qualifier prepended to a page stem to
// form the id a skill's `all[]` carries; `sopAnchor` is the family's SOP entry chapter;
// `docEntry` is the canonical public documentation entry; `relatedRefs` seed the hub footer.
const FAMILIES = [
    { key: 'core', prefix: '', specDir: REFS.spec.specDir, sopAnchor: '02-memo-sop-entrypoint', docEntry: REFS.docs?.entryPoints?.memoAuthor ?? '/specification/overview/', relatedRefs: [ '43-skill-authoring-and-quality', '00-overview' ] },
    { key: 'workbench', prefix: 'workbench/', specDir: REFS.workbench.specDir, sopAnchor: '02-sop-entrypoint', docEntry: REFS.docs?.entryPoints?.toolMaintainer ?? '/workbench/overview/', relatedRefs: [ '00-overview' ] },
    { key: 'session', prefix: 'session/', specDir: REFS.session.specDir, sopAnchor: '10-sop', docEntry: REFS.session?.url ?? '/session/overview/', relatedRefs: [ '00-overview' ] }
]


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
// minus any bridge page, sorted by chapter number. Each entry is a { stem, id } pair.
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

    return stems.map( ( stem ) => ( { stem, id: `${ prefix }${ stem }` } ) )
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

const outOfScopeFor = ( { implementers } ) => {
    return primaryOwners( { implementers } )
        .filter( ( skill ) => OUT_OF_SCOPE_CATEGORIES.includes( skill.category ) === true )
        .map( ( skill ) => ( { skill: skill.skill, category: skill.category } ) )
}


// Distinct skill clusters (categories) implementing a page — the README "Cluster" cell.
const clustersFor = ( { implementers } ) => {
    return [ ...new Set( implementers.map( ( skill ) => skill.category ) ) ].sort( ( a, b ) => a.localeCompare( b ) )
}


// The derived, projection-complete record for one page (the inverted-map row + bridge source).
const buildRecord = ( { family, stem, id, content, skills, purposes } ) => {
    const implementers = implementersFor( { skills, id } )
    const enumeration = implementers.map( ( skill ) => ( {
        skill: skill.skill,
        role: skill.role,
        category: skill.category,
        purpose: purposes.get( skill.skill ) ?? ''
    } ) )
    const record = {
        family: family.key,
        stem,
        id,
        sopAnchor: family.sopAnchor,
        publicEntries: publicEntriesFor( { implementers, family } ),
        detailPages: detailPagesFrom( { content, selfStem: stem } ),
        implementers: enumeration,
        grader: graderFor( { implementers } ),
        gaps: gapsRollup( { implementers } ),
        outOfScope: outOfScopeFor( { implementers } ),
        clusters: clustersFor( { implementers } )
    }
    const provenance = createHash( 'sha256' ).update( JSON.stringify( record ) ).digest( 'hex' ).slice( 0, 12 )

    return { ...record, provenance }
}


const relLink = ( { stem } ) => `[${ stem }](./${ stem }.md)`


// One per-page bridge page rendered with all eight fields, leak-safe and generated.
const renderBridgePage = ( { record } ) => {
    const { stem, family, sopAnchor, publicEntries, detailPages, implementers, grader, gaps, outOfScope, provenance } = record

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

    const gapsBlock = gaps.length === 0
        ? '— none —'
        : gaps.map( ( g ) => `- ${ g }` ).join( '\n' )

    const outOfScopeBlock = outOfScope.length === 0
        ? '— none —'
        : outOfScope.map( ( o ) => `- \`${ o.skill }\` — ${ o.category } cluster, no numbered chapter by design` ).join( '\n' )

    return [
        `# Bridge — ${ stem }`,
        '',
        '| Field | Value |',
        '|---|---|',
        '| Family | ' + family + ' |',
        '| Chapter | ' + relLink( { stem } ) + ' |',
        '| Provenance | `' + provenance + '` |',
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
        '',
        '## 6. Gaps roll-up',
        '',
        gapsBlock,
        '',
        '## 7. Acknowledged out-of-scope',
        '',
        outOfScopeBlock,
        '',
        '## 8. Provenance',
        '',
        `Derived-record hash \`${ provenance }\` over the skill-to-spec map. Regenerated on every build.`,
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
        'The skills below implement this chapter (primary owner first). The full per-page bridge with all eight projection fields is published under `generated/bridge/`.',
        '',
        body,
        '',
        BACKLINK_END
    ].join( '\n' )
}


// Insert/replace the backlink block in a source chapter: replace between markers if present,
// else insert immediately before "## Related", else append. Returns the (possibly) new content.
const applyBacklink = ( { content, block } ) => {
    const startIdx = content.indexOf( BACKLINK_START )
    if( startIdx !== -1 ) {
        const endIdx = content.indexOf( BACKLINK_END, startIdx )
        const tail = content.slice( endIdx + BACKLINK_END.length )
        const next = `${ content.slice( 0, startIdx ) }${ block }${ tail }`

        return next
    }
    const relatedMatch = content.match( /\n##\s+Related\s*\n/ )
    if( relatedMatch !== null ) {
        const at = relatedMatch.index
        const next = `${ content.slice( 0, at ) }\n\n${ block }\n${ content.slice( at + 1 ) }`

        return next
    }
    const trimmed = content.replace( /\s+$/, '' )

    return `${ trimmed }\n\n${ block }\n`
}


// The reshaped NN-bridge.md hub: a coverage index + projection pointer (in-nav, audit-clean).
const renderHubPage = ( { nn, family, records, relatedRefs } ) => {
    const covered = records.filter( ( r ) => r.implementers.length > 0 ).length
    const pct = records.length === 0 ? 0 : Math.round( ( covered / records.length ) * 100 )
    const sections = records
        .map( ( r ) => {
            const head = `### ${ relLink( { stem: r.stem } ) }`
            const body = r.implementers.length === 0
                ? '— none yet —'
                : r.implementers.map( ( s ) => `- \`${ s.skill }\` — ${ s.role }` ).join( '\n' )

            return `${ head }\n\n${ body }`
        } )
        .join( '\n\n' )
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
        `This page is the Bridge hub for the ${ family } specification family: the in-navigation coverage index that names, for every chapter, the skills that implement it and marks the primary owner. It is the entry point to the per-page Bridge projection (SOP anchor, public entry points, required detail pages, the fully named skill enumeration with grading assignment, the gaps roll-up, the acknowledged out-of-scope surface, and a provenance hash) published under \`generated/bridge/\`. An empty list is an honest signal that nothing has been built against that chapter yet; the mapping is derived from the skill-to-spec map and kept truthful by the inverse coverage gate.`,
        '',
        `**Coverage:** ${ covered } of ${ records.length } chapters have at least one implementer (${ pct }%).`,
        '',
        '<!-- generated -->',
        `<!-- Auto-generated by ${ GENERATOR } from the skill-to-spec map. Do not edit by hand; re-run the spec build to regenerate. -->`,
        '',
        '## Coverage',
        '',
        sections,
        '',
        '## Related',
        '',
        relatedList,
        ''
    ].join( '\n' )
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
    const map = JSON.parse( await readFile( MAP_PATH, 'utf-8' ) )
    const skills = Array.isArray( map.skills ) === true ? map.skills : []
    const purposes = await loadPurposes( { skills } )

    const families = await Promise.all( FAMILIES.map( async ( family ) => {
        const specDirAbs = join( REPO, family.specDir )
        const nn = await resolveBridgeNN( { specDirAbs } )
        const pages = await collectPages( { specDirAbs, prefix: family.prefix } )

        const records = await Promise.all( pages.map( async ( { stem, id } ) => {
            const sourcePath = join( specDirAbs, `${ stem }.md` )
            const content = await readFile( sourcePath, 'utf-8' )
            const record = buildRecord( { family, stem, id, content, skills, purposes } )

            // per-page bridge → generated/bridge/<family>/<stem>.md
            const outDir = join( BRIDGE_OUT, family.key )
            await mkdir( outDir, { recursive: true } )
            await writeFile( join( outDir, `${ stem }.md` ), renderBridgePage( { record } ), 'utf-8' )

            // "## Implemented by" backlink → source chapter (idempotent)
            const block = renderBacklink( { implementers: record.implementers } )
            const nextContent = applyBacklink( { content, block } )
            const backlinkChanged = nextContent !== content
            if( backlinkChanged === true ) await writeFile( sourcePath, nextContent, 'utf-8' )

            return { record, backlinkChanged }
        } ) )

        const recordList = records.map( ( r ) => r.record )

        // reshape the NN-bridge.md hub
        const hubPath = join( specDirAbs, `${ nn }-bridge.md` )
        const hubContent = renderHubPage( { nn, family: family.key, records: recordList, relatedRefs: family.relatedRefs } )
        const prevHub = await readFile( hubPath, 'utf-8' ).catch( () => null )
        if( prevHub !== hubContent ) await writeFile( hubPath, hubContent, 'utf-8' )

        const readme = family.key === 'core'
            ? await updateReadmeCluster( { specDirAbs, records: recordList } )
            : { changed: false }

        return {
            key: family.key,
            specDir: family.specDir,
            nn,
            records: recordList,
            backlinkChanges: records.filter( ( r ) => r.backlinkChanged === true ).length,
            hubChanged: prevHub !== hubContent,
            readmeChanged: readme.changed
        }
    } ) )

    // publish the inverted map → generated/bridge/inverted-map.json
    const mapHash = createHash( 'sha256' ).update( JSON.stringify( map ) ).digest( 'hex' ).slice( 0, 12 )
    const inverted = {
        note: 'Inverted skill->spec projection (read-only): one entry per non-bridge spec page, listing its implementer skills with role + the eight projection fields. Generated from skill-spec-map.json.',
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
            gaps: r.gaps,
            outOfScope: r.outOfScope.map( ( o ) => o.skill ),
            clusters: r.clusters,
            provenance: r.provenance
        } ) )
    }
    await mkdir( BRIDGE_OUT, { recursive: true } )
    await writeFile( join( BRIDGE_OUT, 'inverted-map.json' ), `${ JSON.stringify( inverted, null, 4 ) }\n`, 'utf-8' )

    const totalPages = families.reduce( ( sum, f ) => sum + f.records.length, 0 )
    families.forEach( ( f ) => {
        const covered = f.records.filter( ( r ) => r.implementers.length > 0 ).length
        console.log( `  ✓ ${ f.key }: ${ f.records.length } per-page bridge(s) → generated/bridge/${ f.key }/ (${ covered } covered), hub ${ f.specDir }/${ f.nn }-bridge.md, ${ f.backlinkChanges } backlink change(s)${ f.readmeChanged === true ? ', README cluster updated' : '' }` )
    } )
    console.log( `generate-bridge: ${ totalPages } per-page bridges across ${ families.length } families; inverted-map.json published (mapHash ${ mapHash }).` )
}


const isEntrypoint = process.argv[ 1 ] === fileURLToPath( import.meta.url )
if( isEntrypoint === true ) {
    main().catch( ( err ) => {
        console.error( err )
        process.exit( 1 )
    } )
}
