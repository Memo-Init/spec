#!/usr/bin/env node
// check-skill-specs.mjs — skill->spec coverage lint, spec-repo-owned (Memo 058 PRD-003).
//
// Moved here from repos/core/scripts/ so the SPEC repo can self-verify skill-completeness
// without depending on the core repo to host the check logic. The core CLI (`memo spec doctor`)
// calls this script; core's own lint also points here.
//
// Reads skills cross-repo from ../core/skills (gracefully skips when that repo is absent,
// mirroring how the old core-side gate skipped when the spec repo was absent).
// Reads spec chapters locally from draft/<family>/<ver>/spec.
//
//   (c) COVERAGE [hard]   every SKILL.md carries a metadata.memo.specs block.
//   (w) WELL-FORMED [hard] primary (if non-null) is the first entry of `all`;
//                          a `scope` marker only on out-of-process skills (primary null).
//   (a) SPEC EXISTS [hard, when the spec repo is reachable] every referenced spec id
//                          resolves to a real chapter file.
//   (b) ORPHAN [report]    spec chapters referenced by zero skills are listed as a
//                          warning, never a failure (newly added chapters are expected
//                          to be unreferenced until a skill points at them).
//
// Exit 0 when clean, 1 on any hard violation.

import { readdir, readFile } from 'node:fs/promises'
import { existsSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isNamespaceFirst } from './lib/layout.mjs'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const REPO = resolve( __dirname, '..' )
// Skills live cross-repo: repos/spec/scripts → repos/spec → repos → repos/core/skills
const SKILLS_DIR = resolve( __dirname, '..', '..', 'core', 'skills' )


// Family root that holds the <version> dirs, per detected layout (Memo 064 MI-S6):
// namespace-first spec/<name>/ or legacy medium-first draft/<name>/.
const familyRootFor = ( { name } ) => {
    return isNamespaceFirst( { repoRoot: REPO, name } ) === true
        ? join( REPO, 'spec', name )
        : join( REPO, 'draft', name )
}


// Spec chapter dir inside a family <version> dir, per layout: namespace-first .../<ver>/draft/spec
// or legacy .../<ver>/spec.
const specSubdirFor = ( { name, versionDirAbs } ) => {
    return isNamespaceFirst( { repoRoot: REPO, name } ) === true
        ? join( versionDirAbs, 'draft', 'spec' )
        : join( versionDirAbs, 'spec' )
}


// latestSpecDir — locate a family's LATEST spec chapter directory. Returns null when the family
// tree is absent. Env override MEMO_SPEC_DIR (memo only) still honoured for CI.
const latestSpecDir = ( { name } ) => {
    if( name === 'memo' ) {
        const fromEnv = process.env.MEMO_SPEC_DIR
        if( fromEnv !== undefined && existsSync( fromEnv ) === true ) return fromEnv
    }
    const familyRoot = familyRootFor( { name } )
    if( existsSync( familyRoot ) === false ) return null
    const versions = readdirSync( familyRoot, { withFileTypes: true } )
        .filter( ( e ) => e.isDirectory() === true && /^v?\d/.test( e.name ) )
        .map( ( e ) => e.name )
        .sort()
    if( versions.length === 0 ) return null

    return specSubdirFor( { name, versionDirAbs: join( familyRoot, versions[ versions.length - 1 ] ) } )
}


// Parse the metadata.memo.specs block out of a SKILL.md (the exact shape write-skill-specs.mjs
// emits). Returns null when no specs block is present. The `all:` and `gaps:` lists share the
// same 8-space "- " indent, so list items are only collected while the current 6-space sub-key
// is `all` (otherwise gap strings leak in as spec ids).
const parseSpecs = ( { content } ) => {
    const lines = content.split( '\n' )
    const start = lines.findIndex( ( l ) => /^ {4}specs:\s*$/.test( l ) )
    if( start === -1 ) return null
    const body = []
    let i = start + 1
    while( i < lines.length && /^ {6,}/.test( lines[ i ] ) ) { body.push( lines[ i ] ); i += 1 }

    let primary = null
    const all = []
    let scope
    let key = null
    body.forEach( ( line ) => {
        const subKey = line.match( /^ {6}(\w+):(.*)$/ )
        if( subKey !== null ) {
            key = subKey[ 1 ]
            const inline = subKey[ 2 ].trim()
            if( key === 'primary' ) primary = inline === 'null' || inline === '' ? null : inline
            if( key === 'scope' ) scope = inline === '' ? undefined : inline

            return
        }
        const item = line.match( /^ {8}-\s+(.*)$/ )
        if( item !== null && key === 'all' ) all.push( item[ 1 ].trim() )
    } )

    return { primary, all, scope }
}


const specFileFor = ( { id } ) => `${ id }.md`


const main = async () => {
    // Graceful skip when the core repo (where SKILL.md files live) is not checked out.
    // Mirrors the old core-side gate's skip when the spec repo was absent.
    if( existsSync( SKILLS_DIR ) === false ) {
        console.log( 'check-skill-specs: core repo not reachable — skill-completeness check skipped.' )
        process.exit( 0 )
    }

    const entries = await readdir( SKILLS_DIR, { recursive: true } )
    const skillFiles = entries.filter( ( e ) => e.endsWith( 'SKILL.md' ) )
    const violations = []
    const referenced = new Set()

    const parsed = await Promise.all( skillFiles.map( async ( rel ) => {
        const content = await readFile( join( SKILLS_DIR, rel ), 'utf-8' )
        const specs = parseSpecs( { content } )

        return { rel, specs }
    } ) )

    parsed.forEach( ( { rel, specs } ) => {
        if( specs === null ) { violations.push( `${ rel }: missing metadata.memo.specs (coverage)` ); return }
        const { primary, all, scope } = specs
        if( primary !== null && all[ 0 ] !== primary ) {
            violations.push( `${ rel }: primary "${ primary }" is not the first entry of all` )
        }
        if( scope !== undefined && primary !== null ) {
            violations.push( `${ rel }: scope marker "${ scope }" set but primary is not null (scope is for out-of-process skills only)` )
        }
        if( primary !== null ) referenced.add( primary )
        all.forEach( ( id ) => referenced.add( id ) )
    } )

    const specDir = latestSpecDir( { name: 'memo' } )
    let orphans = []
    if( specDir === null ) {
        console.log( 'check-skill-specs: spec draft tree not found — spec-existence + orphan checks skipped.' )
    } else {
        // Memo family chapters are prefixed with 'memo/' to match the family-qualified id convention
        // (F8=B full symmetry: memo ids are now 'memo/NN-slug', mirroring 'workbench/' and 'session/').
        const specChapters = ( await readdir( specDir ) )
            .filter( ( f ) => /^\d{2}-.*\.md$/.test( f ) )
            .map( ( f ) => `memo/${ f }` )
        // Sibling families (workbench, session, spec) resolve via the same layout-aware helper. The
        // spec meta-family has no implementer skills, so its chapters only surface in the
        // (non-blocking) orphan report.
        const families = [ 'workbench', 'session', 'spec' ]
            .map( ( prefix ) => ( { prefix, dir: latestSpecDir( { name: prefix } ) } ) )
        const familyChapters = ( await Promise.all( families.map( async ( { prefix, dir } ) => {
            if( dir === null ) return []
            const files = ( await readdir( dir ) ).filter( ( f ) => /^\d{2}-.*\.md$/.test( f ) )

            return files.map( ( f ) => `${ prefix }/${ f }` )
        } ) ) ).flat()
        const allChapters = new Set( [ ...specChapters, ...familyChapters ] )
        // (a) every referenced spec exists
        ;[ ...referenced ].forEach( ( id ) => {
            if( allChapters.has( specFileFor( { id } ) ) === false ) {
                violations.push( `referenced spec "${ id }" has no chapter file under ${ specDir }` )
            }
        } )
        // (b) orphan report (warning only)
        orphans = [ ...allChapters ]
            .map( ( f ) => f.replace( /\.md$/, '' ) )
            .filter( ( id ) => referenced.has( id ) === false && /(^|\/)(00-overview|README)/.test( id ) === false )
    }

    if( violations.length > 0 ) {
        console.error( `check-skill-specs: ${ violations.length } violation(s) over ${ skillFiles.length } SKILL.md` )
        violations.forEach( ( v ) => console.error( `  ✗ ${ v }` ) )
        process.exit( 1 )
    }
    console.log( `check-skill-specs: 0 violations over ${ skillFiles.length } SKILL.md (${ referenced.size } specs referenced).` )
    if( orphans.length > 0 ) {
        console.log( `  ⚠ ${ orphans.length } orphan chapter(s) referenced by no skill: ${ orphans.join( ', ' ) }` )
    }
}


await main()
