---
title: "Self-Describing Command Tree (Branch/Leaf)"
description: "The recommended way to expose tools to an agent is a **self-describing command tree**: a small tree of **branches** (\"bags of tools\") and **leaves** (tools that do something). Each leaf carries..."
spec_version: "0.1.0"
spec_file: "22-tree-cli-recommended-way.md"
order: 22
section: "Specification"
normative: true
generated_at: "2026-06-22T21:29:45.860Z"
generated_from: "spec/v0.1.0/22-tree-cli-recommended-way.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: spec/v0.1.0/22-tree-cli-recommended-way.md."
---


The recommended way to expose tools to an agent is a **self-describing command tree**: a small tree of **branches** ("bags of tools") and **leaves** (tools that do something). Each leaf carries strongly typed input and output whose field descriptions **encode behavior**, not just types. The tree compiles to a CLI, and a `describe()` rendering produces the help an agent reads. The design goal is that the help alone is a sufficient specification — robust enough that the code could be re-implemented from it. Code snippets follow the project Node style (4-space indentation, no semicolons, single quotes).

---

## Branch / Leaf Data Model

The tree has exactly two node kinds.

- A **branch** is a bag of tools: a `description` plus `children`. It groups related leaves (e.g. a `calendar` branch with `add`, `list`, `get` leaves).
- A **leaf** does something: a `description`, a Zod `input` **and** `output`, and an `execute` function. The Zod field `description`s MUST encode the behavior rules the agent should follow — not only the type.

> A leaf MUST define both `input` **and** `output` as Zod schemas — the `output` schema is mandatory, not optional decoration. The field `description`s on **both** schemas MUST carry the behavioral rules (what to do, what to avoid) via `.describe(...)`, so that the schema is itself part of the specification — not merely a type guard. Both the `input` and the `output` shape MUST be surfaced by `describe()` (see below), so the agent reads the behaviour-encoding docs for what it sends **and** what it gets back.

```javascript
// BRANCH: bag of tools. description + children.
const branch = {
    'description': 'What this domain/group is for (+ behaviour rules)',
    'children': { 'leafName': leaf }
}

// LEAF: does something. description + zod in/out (descriptions encode behaviour) + execute.
const leaf = {
    'description': 'What it does, how to call it, behaviour rules',
    'input': z.object( { 'id': z.string().describe( 'behaviour-encoding doc' ) } ),
    'output': z.object( { 'ok': z.boolean() } ),
    'execute': async ( { id } ) => ( { 'ok': true } )
}

const isBranch = ( node ) => node[ 'children' ] !== undefined
const isLeaf = ( node ) => node[ 'execute' ] !== undefined
```

The two predicates distinguish the node kinds structurally: a node with `children` is a branch; a node with `execute` is a leaf. The primitive also maps to the code structure — each domain is a folder.

---

## `describe()` and the Ancestor Path

`describe()` renders the **help tree** for a node — the output emitted for `--describe` and for re-injection. The help for a leaf is not read in isolation: the relevant context is the **ancestor path**, the help collected from the leaf back up to the root.

> `describe()` MUST emit **machine-readable structured output** (an object, not only prose), reachable via a stable `--describe` flag, so the same rendering serves the human reader, the CLI, and the re-injected agent context.

A leaf entry produced by `describe()` MUST carry `description`, the rendered `input` shape (field -> doc), the rendered `output` shape (field -> doc), and a call `example`. A branch entry MUST carry its `description` plus the `describe()` of each child.

```javascript
// describe( node ) renders the machine-readable help for a node.
const describe = ( node ) => {
    if( isBranch( node ) ) {
        const children = Object.entries( node[ 'children' ] )
            .map( ( [ name, child ] ) => ( { name, 'help': describe( child ) } ) )

        return { 'kind': 'branch', 'description': node[ 'description' ], children }
    }

    return {
        'kind': 'leaf',
        'description': node[ 'description' ],
        'input': describeShape( { 'schema': node[ 'input' ] } ),
        'output': describeShape( { 'schema': node[ 'output' ] } ),
        'example': node[ 'example' ]
    }
}

// describeShape renders a Zod schema as field -> behaviour-doc pairs,
// so the behaviour-encoding description() text reaches the help.
const describeShape = ( { schema } ) => {
    const shape = schema[ '_def' ][ 'shape' ]()

    return Object.fromEntries( Object.entries( shape )
        .map( ( [ key, field ] ) => ( [ key, field[ '_def' ][ 'description' ] ] ) ) )
}
```

> When help is rendered for re-injection, the system SHOULD collect the **ancestor path** — the help of the target leaf and of every branch from that leaf up to the root — so the agent reads the leaf in the context of the group and the tree it belongs to ("all the way back up").

---

## Help-as-Spec

The central design rule governs the quality bar for help text.

> The help text MUST be robust enough that the code could be **re-implemented from the help as a specification**. A leaf's `description`, its Zod field `description`s, and the branch help above it together MUST capture the full behavior — not just call syntax.

This rule is what makes the tree self-describing: because the help is a spec, the same text serves the human reader, the CLI `--describe` output, and the re-injected agent context.

---

## Shared Result Envelope

Every leaf returns the **same envelope shape**, so an agent can branch on the result without per-tool special-casing.

> Every leaf MUST return a result envelope `{ status, error, fix }`. `status` is a boolean. On failure (`status: false`), `error` MUST state what went wrong and `fix` MUST be a **separate machine-readable field** carrying the concrete repair step — the next action the agent can take. The repair hint MUST NOT be prose mixed into `error`. On success (`status: true`), the payload is spread alongside `status` and `error`/`fix` are omitted.

```javascript
// ok and fail produce the one envelope shape every leaf returns.
const ok = ( payload ) => ( { 'status': true, ...payload } )
const fail = ( { error, fix } ) => ( { 'status': false, error, fix } )

// On a missing required input the leaf returns a fix the agent can act on.
const example = fail( {
    'error': 'Missing required parameter: id',
    'fix': 'Call --describe on this leaf and resend with input.id set'
} )
```

The `fix` field is what lets the **self-correction** mechanism below act mechanically: an agent (or a hook) reads `fix` and resends, rather than re-deriving the repair from a free-text error.

---

## Self-Correction: Hook Re-injection and the Token Timer

The agent is kept grounded in the help by **re-injecting** it — and this is **not primarily error-driven**. Re-injection is triggered by a Claude-Code hook and by a token-usage timer, not (only) by a thrown error.

- **Hook re-injection** — a `PreToolUse` hook **intercepts** the tool call, **cancels** the full request, and **resends** it with the re-injected help (the ancestor path) added to the context.
- **Token-usage timer** — a timer measures tokens since the last use of a tool; on inactivity it forces re-injection of the **whole ancestor path** for that tool (not just the leaf's own help).

The corrected understanding (versus the first reconstruction) is summarized below.

| First assumption | Verified reality |
|------------------|------------------|
| Self-correction is "on error" in CLI code (an error throws, a path is collected) | The mechanism runs via **Claude-Code hooks + a token-usage timer** that **intercepts, cancels, and resends** the tool call with re-injected help — not primarily error-driven |
| Only `input` is a Zod schema | **Input and output** are Zod; field `description`s **encode behavior rules**, not just types |
| Ancestor-path re-injection happens only on error | Ancestor-path re-injection fires on **timer/interception** ("all the way back up") — confirmed, but triggered more broadly |

---

## Tool-Embedding Requirement

The help is only useful if it is in the agent's context when the agent acts.

> In **all** phases — research as well as implementation — the system MUST load the tool's help / `describe()` output into the agent's context. Tool embedding is a high-priority requirement: an agent MUST NOT be asked to use a tool without its help present in context.

This requirement is what binds the rest of the chapter together: the branch/leaf tree and its help-as-spec only deliver their value when the help is embedded in every phase the agent works through.

---

## Why This Is How Internal CLIs Are Built

This pattern is not only for exposing third-party tools — it is the **recommended way to build the project's own internal CLIs** (the `memo` command being the reference). The value is concrete:

- **The tree is its own documentation.** Because help-as-spec holds, `--describe` is the single source of truth for what the CLI can do; the capability inventory is *discovered from the tool*, not maintained as a second list elsewhere (this is what lets the tools registry, [24-tools-registry.md](/specification/tools-registry/), reference the command tree rather than re-enumerate it).
- **One envelope, no per-command glue.** Every leaf returns `{ status, error, fix }`, so an agent — or another command — consumes any leaf the same way, and the `fix` field makes failures self-correcting.
- **It scales by adding a row, not a branch of code.** A new capability is a new leaf in the right domain folder; the tree, the help, and the `--describe` rendering pick it up for free.

How to build one, in short: **one folder per domain**, a branch per domain with `children`, a leaf per action carrying behaviour-encoding Zod `input`/`output` descriptions and an `execute`; return the shared envelope; register the domain in the tree and let `describe()` render the help. A new internal CLI follows this shape so that, from day one, its help is a specification and its commands are discoverable the same way every other project tool is.

---

## Related

- [13-orchestration.md](/specification/orchestration/) — the orchestration and state layer the tool tree is invoked from.
- [14-agents-skills-tasks.md](/specification/agents-skills-tasks/) — the agents that consume the embedded tool help.
- [00-overview.md](/specification/overview/) — conformance language.
