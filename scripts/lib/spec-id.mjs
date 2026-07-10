// spec-id.mjs — the single composition site for the spec identifier (Memo 064 MI-S9, Kap 4 + Kap 17).
//
// The spec identifier `<namespaceToken>@<version>:<shortSha>` is ONE token format shared by two
// sinks: the reference-ID up front (Kap 4 — family head → refs.resolved.json → website) and the
// llms.txt `Source:` provenance stamp at the back (Kap 17, MI-S2). Both compose through this one
// function so the two are byte-identical by construction — one format, one composition site.
//
// `shortSha` is the 7-char prefix of the full fromCommit SHA. The sentinel `unknown` (no git, Kap 9)
// is exactly 7 chars, so `slice( 0, 7 )` passes it through visibly — the value is never dropped.
//
// Dependency-free by design so MI-S2 (the llms stamp) can reuse it without pulling in the refs
// generator. House style: 4-space, no semicolons, single quotes, object params.


// shortSha — the 7-char prefix of a commit SHA; `unknown` stays `unknown` (it is already 7 chars).
const shortSha = ( { fromCommit } ) => {
    return fromCommit.slice( 0, 7 )
}


// composeSpecId — the one composition site: `<namespaceToken>@<version>:<shortSha>`.
const composeSpecId = ( { namespaceToken, version, fromCommit } ) => {
    return `${ namespaceToken }@${ version }:${ shortSha( { fromCommit } ) }`
}


export {
    shortSha,
    composeSpecId
}
