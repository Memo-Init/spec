// config.mjs — static configuration for the tool-contract workshop scripts (Memo 067, PRD-006/010).
//
// Paths are repo-root-relative (the scripts resolve them against <scripts>/.. so a globally invoked
// build still targets THIS workshop). Kept as DATA (not hardcoded in the code path) so a new harness
// registration or a renamed artifact is a one-line data edit.

const config = {
    // The registered harness whose toolContract branch the mirror is generated from. The registry
    // (data/harnesses.manual.json) maps this id to the descriptor path — not registered = not built.
    descriptorId: 'claude-code@2.1.206',
    paths: {
        harnessRegistry: 'data/harnesses.manual.json',
        toolInventory: 'data/tool-inventory.json',
        toolInventorySchema: 'data/tool-inventory.schema.json',
        toolUsageMap: 'data/tool-usage-map.json',
        toolContract: 'data/tool-contract.json'
    },
    // Non-inventory role-delta tokens the descriptor may legitimately carry: capability/gate markers
    // that are NOT rows of the 42-tool tools-reference (T038 taskCrud is time-variant; StructuredOutput
    // is a worker output-mode capability). Listed here so the reconcile FLAGS them as known markers
    // rather than mis-reporting them as missing tools (Ölstand-Prinzip: flag, do not silently drop).
    knownNonInventoryRoleTokens: [ 'StructuredOutput', 'TaskCRUD' ],
    generator: 'scripts/generate-tool-contract.mjs'
}


export { config }
