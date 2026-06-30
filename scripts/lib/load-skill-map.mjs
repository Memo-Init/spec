// load-skill-map.mjs — Canonical per-family skill-spec-map loader (Memo 058 PRD-002).
//
// The skill-to-spec map is now split into three per-family files living alongside the spec:
//   draft/<family>/0.1.0/data/skill-spec-map.json
// This module merges all three into a single { note, totals, skills: [] } object, preserving
// the family order memo → workbench → session (stable, matches original file order).
// House style: 4-space, no semicolons, single quotes, array methods, object returns.

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'


const FAMILIES = [ 'memo', 'workbench', 'session' ]


const computeTotals = ( { skills } ) => ( {
    skills: skills.length,
    register: skills.filter( ( s ) => s.roleHint !== undefined ).length,
    withGaps: skills.filter( ( s ) => Array.isArray( s.gaps ) && s.gaps.length > 0 ).length,
    withPrimary: skills.filter( ( s ) => s.primary !== null && s.primary !== undefined ).length
} )


// loadSkillMap — read the three per-family maps and return a merged object.
// `repoRoot` must be the absolute path to the spec repo root (where `draft/` lives).
export const loadSkillMap = async ( { repoRoot } ) => {
    const parts = await Promise.all(
        FAMILIES.map( async ( family ) => {
            const path = join( repoRoot, 'draft', family, '0.1.0', 'data', 'skill-spec-map.json' )
            const raw = await readFile( path, 'utf-8' )

            return JSON.parse( raw )
        } )
    )
    const skills = parts.flatMap( ( p ) => Array.isArray( p.skills ) === true ? p.skills : [] )
    const note = typeof parts[ 0 ].note === 'string' ? parts[ 0 ].note : ''

    return { note, totals: computeTotals( { skills } ), skills }
}
