// tool-inventory.test.mjs — self-test for the Werkzeug-Vertrag artefact (Memo 067, PRD-006).
//
// Verifies WI-2-05/14 acceptance: exactly 42 inventory tools, schema-valid inventory + usage-map,
// the four T026 deprecations represented, every usage-map key a subset of the inventory names, and
// the generated mirror (tool-contract.json) carries a non-empty required[]/roles{} + provenance.
// Runs with `node --test data/tool-inventory.test.mjs` (ajv from the workshop devDependencies).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'


const __dirname = dirname( fileURLToPath( import.meta.url ) )
const readJson = async ( { name } ) => JSON.parse( await readFile( join( __dirname, name ), 'utf-8' ) )


test( 'inventory has exactly 42 tools and is schema-valid', async () => {
    const schema = await readJson( { name: 'tool-inventory.schema.json' } )
    const inventory = await readJson( { name: 'tool-inventory.json' } )
    const validate = new Ajv( { allErrors: true } ).compile( schema )
    const valid = validate( inventory )

    assert.equal( valid, true, JSON.stringify( validate.errors ) )
    assert.equal( inventory.length, 42 )
} )


test( 'the four T026 deprecations are represented', async () => {
    const inventory = await readJson( { name: 'tool-inventory.json' } )
    const byName = Object.fromEntries( inventory.map( ( entry ) => [ entry.name, entry ] ) )

    assert.equal( byName.TaskOutput.status, 'deprecated' )
    assert.equal( byName.TaskOutput.replacedBy, 'Read' )
    assert.equal( byName.TodoWrite.status, 'deprecated' )
    assert.ok( byName.TodoWrite.replacedBy.includes( 'TaskCreate' ) )
    assert.equal( byName.Agent.renamedFrom, 'Task' )
    assert.ok( byName.Agent.note.includes( 'TeamCreate' ) )

    const nonActive = inventory.filter( ( entry ) => entry.status !== 'active' )
    nonActive.forEach( ( entry ) => assert.ok( typeof entry.replacedBy === 'string' && entry.replacedBy.length > 0 ) )
} )


test( 'usage-map is schema-valid and every key is an inventory tool', async () => {
    const schema = await readJson( { name: 'tool-usage-map.schema.json' } )
    const map = await readJson( { name: 'tool-usage-map.json' } )
    const inventory = await readJson( { name: 'tool-inventory.json' } )
    const validate = new Ajv( { allErrors: true } ).compile( schema )

    assert.equal( validate( map ), true, JSON.stringify( validate.errors ) )

    const names = new Set( inventory.map( ( entry ) => entry.name ) )
    Object.keys( map.tools ).forEach( ( key ) => assert.ok( names.has( key ), `orphan tool name: ${ key }` ) )
} )


test( 'generated mirror carries required[]/roles{} + provenance', async () => {
    const contract = await readJson( { name: 'tool-contract.json' } )

    assert.ok( Array.isArray( contract.required ) && contract.required.length > 0 )
    assert.ok( contract.roles !== null && typeof contract.roles === 'object' && Object.keys( contract.roles ).length > 0 )
    assert.match( contract.generatedFrom, /@[0-9a-f]{12}$/ )
    assert.equal( contract.reconcile.clean, true )
} )
