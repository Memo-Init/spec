# 47. Node.js Standards

| Field | Value |
|---|---|
| Status | Draft |
| Related | [./22-tree-cli-recommended-way.md](./22-tree-cli-recommended-way.md), [./23-requirements.md](./23-requirements.md), [./43-skill-authoring-and-quality.md](./43-skill-authoring-and-quality.md), [./44-repository-and-outward-docs.md](./44-repository-and-outward-docs.md), [./00-overview.md](./00-overview.md) |

> **Normative.** Conformance language (`MUST`, `MUST NOT`, `SHOULD`) is used as defined in [00-overview.md](./00-overview.md).

Every piece of Node.js code in this organisation is written to one house style. The style is not a matter of taste applied per file; it is a single, deterministic contract so that any module reads like every other module and so that an agent can both **generate** new code and **verify** existing code against the same rules. This chapter states that contract. It is the spec-side home for the *code-patterns* family of conformity rules: the prose below is the normative source, and the structured blocks under [Conformity Requirements](#conformity-requirements) are the machine-readable rules the requirement store is harvested from ([23-requirements.md](./23-requirements.md)).

The rules here apply to all Node.js source in every repo (`when.language: ["node"]`, [23-requirements.md](./23-requirements.md)). They do not apply to other languages, and they are intentionally strict: a deterministic style is what lets help-as-spec and the conformity gates ([22-tree-cli-recommended-way.md](./22-tree-cli-recommended-way.md)) work without a human in the loop.

## Module shape and language level

Source is written for **Node.js 22** using modern syntax, and modules are **ES modules** with the `.mjs` extension. CommonJS (`require`/`module.exports`) is not used for project source. Module code lives under `./src/`, and sub-classes live in sub-folders of `./src/`.

Imports are grouped: external (third-party) imports and internal (project-relative) imports go in **separate, alphabetically sorted sections**, external first, with a blank line between the two groups. This keeps the dependency surface of a file legible at a glance.

## Formatting

The mechanical rules are fixed:

- Indentation uses **4 spaces** — never tabs, never 2 spaces.
- **No semicolons** terminate statements.
- **Single quotes** for strings, or template literals where interpolation is needed. Double quotes are reserved for the *value* slots inside error-message template literals (see [Error codes](#error-codes)).
- Parentheses carry **spaces on the inside** in `if`-conditions, destructuring assignments, bracket access, static-method signatures, and function calls — `if ( ok )`, `const { a, b } = payload`, `arr[ 0 ]`, `static run( { a } )`, `fn( arg )` — and there is **no space before** an opening `if`-paren.
- A **blank line precedes every `return`** (a deliberate debugging aid), and **two blank lines** separate class methods, including after the constructor.

Code comments are written in **English** and are outward-facing — they explain intent, not gossip about the session that wrote them.

## Control flow

`for` and `while` loops are **not used**. Iteration is expressed with array methods (`map`, `filter`, `reduce`, `forEach`, `find`, `some`, `every`). When a method chain spans more than one transform, each link of the chain starts on its **own line**; multi-line callbacks introduce an **intermediate variable** rather than returning a large inline expression, and arrow-function parameters are **always parenthesised** (`( item ) => …`), even when there is a single parameter.

Asynchronous flow uses **`async`/`await`**, never `.then().catch()` chains. The forbidden-construct list is hard: `eval`, `for`, `while`, `process.argv`, and direct `fs` access in module logic MUST NOT appear in project source.

## Class architecture

Classes follow a fixed shape so that callers can treat any class the same way:

- Methods are **static by default**.
- A method's parameters are **always a single object**, destructured at the start of the method body, with all needed fields pulled up front.
- A method **returns an object**, never a bare primitive — the caller destructures a named field rather than guessing what a scalar means.
- Members are **private by default** (`#` prefix for methods and fields); only the deliberately public surface is exposed.
- **No silent defaults.** `||` and `??` MUST NOT supply a fallback value in a method body without an explicit, documented allowance — a missing value is surfaced, not papered over.
- The **spread operator is not used** to assemble new payloads; fields are named explicitly so the shape of every object is visible at its construction site.

## Validation methods

A public method that takes external input is paired with a validation method named `validation<MethodName>` (for example `validationCreatePayment`). Validation methods are **static**, initialise a result struct immediately, and run their checks in a strict order: **existence → breakpoint → detail**. Bulk field checks use the `[ key, value, type, list ]` `forEach` pattern; when validating array items, the **index is included in the error message** so a failure points at the exact element. Complex nested objects are split into sub-validation methods, and error messages use template literals with the offending value in double quotes.

## Error codes

Error identifiers follow the **`PREFIX-NUMBER`** format — a three-to-four-letter uppercase prefix, a hyphen, and a zero-padded number (for example `CFG-001`, `USAGE-PARSE-014`). Prefixes are organised by domain or layer; number ranges are organised by sub-category. Each error carries a **severity** classification — `ERROR`, `WARNING`, or `INFO` — and the severity mix **feeds a grade computation** (`A` / `B` / `C`) so the health of a module's error surface is scorable rather than anecdotal.

## Conformity Requirements

The normative rules above are authored here **prose-first** ([35-memo-authoring.md](./35-memo-authoring.md)): each rule's `statement` faces generation (it shapes the prompt that writes a Node module) and its `check` faces the finalization/push gate (it verifies written code, ternary `PASS` / `BLOCKED` / `INCONCLUSIVE`). Every block is scoped to the `code-patterns` category and carries the `node` tag so the requirement store can match it to Node source ([23-requirements.md](./23-requirements.md) anticipates `when.language: ["node"]`).

ES-module shape is a hard yes/no rule — a file either uses the `.mjs`/import-section contract or it does not, so its `grade` is `binary`:

```requirement
{
  "id": "REQ-910",
  "title": "Node source uses the .mjs ES-module shape",
  "statement": "Project Node.js source MUST be ES modules with the `.mjs` extension (no CommonJS `require`/`module.exports`), MUST live under `./src/` with sub-classes in sub-folders, and MUST group imports into separate, alphabetically sorted external and internal sections (external first, a blank line between).",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "modules"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Source files use the .mjs extension and ES-module import/export syntax (no require/module.exports)",
      "Module code resides under ./src/ with sub-classes in sub-folders",
      "Imports are split into external-then-internal sections, each alphabetically sorted, separated by a blank line"
    ]
  },
  "grade": "binary"
}
```

Indentation is mechanically checkable, so it is a binary assertion:

```requirement
{
  "id": "REQ-911",
  "title": "Indentation uses 4 spaces",
  "statement": "All Node.js source MUST indent with 4 spaces; tabs and 2-space indentation MUST NOT appear at the start of any line.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "formatting"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No line in a .mjs file begins with a tab character",
      "No line in a .mjs file begins with exactly 2 spaces of indentation",
      "Each indentation level is a multiple of 4 spaces"
    ]
  },
  "grade": "binary"
}
```

Semicolon termination is likewise a hard rule:

```requirement
{
  "id": "REQ-912",
  "title": "Statements are not terminated with semicolons",
  "statement": "Node.js statements MUST NOT be terminated with semicolons; the codebase relies on automatic semicolon insertion as a deliberate style choice.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "formatting"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No statement line in a .mjs file ends with a semicolon"
    ]
  },
  "grade": "binary"
}
```

Quote style is binary, with the documented exception for error-message values:

```requirement
{
  "id": "REQ-913",
  "title": "Strings use single quotes or template literals",
  "statement": "String literals MUST use single quotes, or template literals where interpolation is required; double quotes are reserved for value slots inside error-message template literals.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "formatting"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "String literals are written with single quotes or backticks",
      "Double quotes appear only inside template literals that build error messages"
    ]
  },
  "grade": "binary"
}
```

Inner-parenthesis spacing is a single consolidated rule across all the contexts where it applies:

```requirement
{
  "id": "REQ-914",
  "title": "Parentheses carry inner spacing",
  "statement": "`if`-conditions, destructuring assignments, bracket access, static-method signatures, and function calls MUST carry spaces inside their parentheses/braces/brackets, and there MUST be no space before an opening `if`-parenthesis.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "formatting"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "if-conditions are written `if ( cond )` with inner spaces and no space before the opening paren",
      "Destructuring uses inner-spaced braces: `const { a } = x`",
      "Static-method signatures and function calls carry inner-spaced parentheses"
    ]
  },
  "grade": "binary"
}
```

Vertical spacing around returns and between methods is mechanical:

```requirement
{
  "id": "REQ-915",
  "title": "Blank line before return and two blank lines between methods",
  "statement": "A blank line MUST precede every `return` statement, and two blank lines MUST separate class methods, including immediately after the constructor.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "formatting"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Every return statement is preceded by a blank line",
      "Two blank lines separate consecutive class methods, including after the constructor"
    ]
  },
  "grade": "binary"
}
```

The no-loop rule is the load-bearing control-flow constraint, so it is a blocker:

```requirement
{
  "id": "REQ-916",
  "title": "Iteration uses array methods, not for/while loops",
  "statement": "Node.js source MUST NOT use `for` or `while` loops; iteration MUST be expressed with array methods (`map`, `filter`, `reduce`, `forEach`, `find`, `some`, `every`).",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "control-flow"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No `for` loop appears in project source",
      "No `while` loop appears in project source",
      "Iteration is expressed via array methods"
    ]
  },
  "grade": "binary"
}
```

Chain layout and callback hygiene are style rules with a deterministic shape:

```requirement
{
  "id": "REQ-917",
  "title": "Array chains break per line; multi-line callbacks use intermediate variables",
  "statement": "When an array-method chain spans more than one transform, each chained call MUST start on its own line; multi-line callbacks MUST introduce an intermediate variable rather than returning a large inline expression.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "control-flow"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Each link of a multi-transform array chain begins on its own line",
      "Multi-line callbacks assign an intermediate variable before returning"
    ]
  },
  "grade": "binary"
}
```

Arrow-parameter parenthesisation is a small but uniform rule:

```requirement
{
  "id": "REQ-918",
  "title": "Arrow-function parameters are always parenthesised",
  "statement": "Arrow functions MUST parenthesise their parameter list even when there is a single parameter: `( item ) => …`.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "control-flow"] },
  "severity": "info",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Every arrow function wraps its parameters in parentheses, including single-parameter arrows"
    ]
  },
  "grade": "binary"
}
```

Asynchronous style is a binary preference:

```requirement
{
  "id": "REQ-919",
  "title": "Asynchronous flow uses async/await",
  "statement": "Asynchronous code MUST use `async`/`await`; `.then().catch()` promise chains MUST NOT be used for project control flow.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "control-flow"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Asynchronous functions await promises rather than chaining .then()/.catch()"
    ]
  },
  "grade": "binary"
}
```

The forbidden-construct list is a hard safety rule:

```requirement
{
  "id": "REQ-920",
  "title": "Forbidden constructs are absent",
  "statement": "Project Node.js source MUST NOT use `eval`, `for`, `while`, `process.argv`, or direct `fs` access in module logic.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "control-flow"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "No use of eval",
      "No use of process.argv in module logic",
      "No direct fs calls in module logic",
      "No for or while loops"
    ]
  },
  "grade": "binary"
}
```

Comment language is checkable and outward-facing:

```requirement
{
  "id": "REQ-921",
  "title": "Code comments are English and outward-facing",
  "statement": "Code comments MUST be written in English and describe intent for an outward reader, never session-internal commentary.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "formatting"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Comments are written in English",
      "Comments describe intent, not session-internal notes"
    ]
  },
  "grade": "binary"
}
```

Static-by-default is the first class-shape rule:

```requirement
{
  "id": "REQ-922",
  "title": "Class methods are static by default",
  "statement": "Class methods MUST be static by default; instance methods are used only where instance state is genuinely required.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "class-architecture"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Methods are declared static unless they require instance state"
    ]
  },
  "grade": "binary"
}
```

Object parameters are a blocker because the whole call convention depends on them:

```requirement
{
  "id": "REQ-923",
  "title": "Method parameters are a single destructured object",
  "statement": "Every method's parameters MUST be passed as a single object that is destructured at the start of the method body, with all needed fields pulled up front.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "class-architecture"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Methods accept one object parameter rather than positional scalars",
      "The object parameter is destructured at the start of the method body"
    ]
  },
  "grade": "binary"
}
```

Object returns are the matching half of the call convention:

```requirement
{
  "id": "REQ-924",
  "title": "Methods return objects, not bare primitives",
  "statement": "Methods MUST return an object with named fields rather than a bare primitive value, so callers destructure a named result.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "class-architecture"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Methods return an object with named fields rather than a raw scalar"
    ]
  },
  "grade": "binary"
}
```

Up-front destructuring is checkable:

```requirement
{
  "id": "REQ-925",
  "title": "Destructuring happens at method start",
  "statement": "All variables a method needs MUST be destructured at the very start of the method body, before any logic.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "class-architecture"] },
  "severity": "info",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Needed fields are destructured in the opening lines of the method, ahead of logic"
    ]
  },
  "grade": "binary"
}
```

Private-by-default is the encapsulation rule:

```requirement
{
  "id": "REQ-926",
  "title": "Members are private by default",
  "statement": "Class methods and fields MUST be private by default using the `#` prefix; only the deliberately public surface is exposed without it.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "class-architecture"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Non-public methods and fields carry the # private prefix",
      "Only the intended public surface is exposed without #"
    ]
  },
  "grade": "binary"
}
```

The no-silent-defaults rule needs judgment — whether a fallback is genuinely allowed depends on documented intent — so it is an evaluator with a scored grade:

```requirement
{
  "id": "REQ-927",
  "title": "No silent defaults via || or ??",
  "statement": "`||` and `??` MUST NOT supply a fallback value inside a method body without an explicit, documented allowance; a missing value MUST be surfaced rather than silently defaulted.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "class-architecture"] },
  "severity": "blocker",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer scans method bodies for `||` and `??` fallback assignments. PASS when no silent fallback exists, or each one has an explicit documented allowance; BLOCKED when a fallback hides a missing value without documented allowance; INCONCLUSIVE when the source could not be read.",
    "verify": [
      "Locate `||` and `??` uses in method bodies (not in signatures)",
      "For each, confirm an explicit documented allowance exists"
    ]
  },
  "grade": { "dimension": "silent-default avoidance", "weight": 100 }
}
```

The spread ban keeps payload shapes visible:

```requirement
{
  "id": "REQ-928",
  "title": "Spread operator is not used to assemble new payloads",
  "statement": "New payload objects MUST be assembled with explicitly named fields; the spread operator MUST NOT be used to build a new payload, so every object's shape is visible at its construction site.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "class-architecture"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "New payload objects list their fields explicitly",
      "The spread operator is not used to construct a new payload"
    ]
  },
  "grade": "binary"
}
```

The validation-method pattern is a multi-part shape best judged as a whole, so it earns an object grade:

```requirement
{
  "id": "REQ-929",
  "title": "Public methods are paired with a validation method",
  "statement": "A public method taking external input MUST be paired with a static validation method named `validation<MethodName>` that initialises a result struct immediately and runs its checks in the order existence -> breakpoint -> detail.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "validation"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer checks each input-taking public method for a paired static `validation<MethodName>`. PASS when the validation method exists, is static, initialises a struct first, and orders checks existence -> breakpoint -> detail; BLOCKED when the pairing or the check order is missing; INCONCLUSIVE when the source could not be read.",
    "verify": [
      "Find input-taking public methods",
      "Confirm a static validation<MethodName> exists with the prescribed struct-first, existence->breakpoint->detail order"
    ]
  },
  "grade": { "dimension": "validation-pattern completeness", "weight": 100 }
}
```

The bulk-field validation pattern is mechanical enough to assert directly:

```requirement
{
  "id": "REQ-930",
  "title": "Bulk field validation uses the [key, value, type, list] forEach pattern",
  "statement": "Bulk field checks inside a validation method MUST use the `[ key, value, type, list ]` `forEach` pattern, and array-item validation MUST include the item index in its error message.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "validation"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Bulk field checks iterate `[ key, value, type, list ]` tuples via forEach",
      "Array-item validation errors include the offending item index"
    ]
  },
  "grade": "binary"
}
```

Error-code format is a strict regex-shaped rule:

```requirement
{
  "id": "REQ-931",
  "title": "Error codes follow the PREFIX-NUMBER format",
  "statement": "Error identifiers MUST follow the `PREFIX-NUMBER` format: a 3-to-4-letter uppercase prefix, a hyphen, and a zero-padded number (for example `CFG-001`).",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "error-codes"] },
  "severity": "blocker",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Every error identifier matches /^[A-Z]{3,4}-\\d{3}/",
      "Prefixes are organised by domain/layer and number ranges by sub-category"
    ]
  },
  "grade": "binary"
}
```

Severity classification is a presence check:

```requirement
{
  "id": "REQ-932",
  "title": "Errors carry an ERROR/WARNING/INFO severity",
  "statement": "Each error MUST carry a severity classification of `ERROR`, `WARNING`, or `INFO`.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "error-codes"] },
  "severity": "warning",
  "check": {
    "kind": "assertion",
    "assertions": [
      "Every error declares a severity of ERROR, WARNING, or INFO"
    ]
  },
  "grade": "binary"
}
```

Whether the severity mix actually drives a sound A/B/C grade is a judgment about the scoring design, so this one is an evaluator with an object grade:

```requirement
{
  "id": "REQ-933",
  "title": "Severity mix feeds an A/B/C grade computation",
  "statement": "The severity mix of a module's error surface MUST feed a grade computation producing an `A` / `B` / `C` grade, so error-surface health is scorable rather than anecdotal.",
  "scope": { "repos": [], "categories": ["code-patterns"], "tags": ["node", "error-codes"] },
  "severity": "warning",
  "check": {
    "kind": "evaluator",
    "rubric": "A fresh-context reviewer confirms the error-code system maps its severity mix to an A/B/C grade. PASS when a documented computation yields A/B/C from the severity counts; BLOCKED when grades are absent or not derived from severity; INCONCLUSIVE when the system could not be inspected.",
    "verify": [
      "Locate the grade computation over error severities",
      "Confirm it yields an A/B/C grade derived from the severity mix"
    ]
  },
  "grade": { "dimension": "error-surface gradeability", "weight": 100 }
}
```


<!-- BRIDGE:IMPLEMENTED-BY START — generated, do not edit -->
## Implemented by

The skills below implement this chapter (primary owner first). The full per-page bridge with all eight projection fields is published under `generated/bridge/`.

- `node-class-architecture` — contributing
- `node-environment-manager` — contributing
- `node-error-codes` — contributing
- `node-formatting` — primary
- `node-server-design` — contributing
- `node-testing` — contributing
- `node-validation` — contributing

<!-- BRIDGE:IMPLEMENTED-BY END -->
## Related

- [22-tree-cli-recommended-way.md](./22-tree-cli-recommended-way.md) — the internal-CLI build pattern these standards apply to.
- [23-requirements.md](./23-requirements.md) — the requirement model, scope axes, and `when.language` matching that harvest these blocks.
- [43-skill-authoring-and-quality.md](./43-skill-authoring-and-quality.md) — the skills that implement and verify these coding rules.
- [44-repository-and-outward-docs.md](./44-repository-and-outward-docs.md) — repository structure and outward-facing documentation standards.
- [00-overview.md](./00-overview.md) — conformance language.
