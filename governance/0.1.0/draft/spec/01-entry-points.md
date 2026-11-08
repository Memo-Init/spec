# 01. Entry Points and Controlled Prompt Injection

| | |
|---|---|
| Status | Draft |
| Depends on | [./00-overview.md](./00-overview.md) |
| Related | [./02-sop-system.md](./02-sop-system.md), [./09-progressive-disclosure.md](./09-progressive-disclosure.md) |

This chapter specifies how work enters the system. The user is the only entry point from outside: a small number of user-facing commands open the system, and inside it every command hands over to the SOPs that carry the actual procedure, the way a public method of a class forwards to the right internal place. The chapter also holds the place for controlled prompt injection, a subject the user named and whose content is still open.

---

## Public Entry Points

A skill is a **public entry point** exactly when its frontmatter carries `metadata.memo.visibility: public`; every other skill carries `metadata.memo.visibility: private` and is a step inside the system. There is no second place that classifies a skill — no list in an overview page and no table in a hook. The set of public entry points stays very small: it covers what the user does from outside, and nothing an agent does inside.

The classification has a reader at runtime. When the user calls a private skill as a command, a hook says so before the work starts and names the public entry points instead; it does not block the call, because the possibility space of the user belongs to the user. A check in the build holds the set of public skills against the declared set, so a change to the classification never happens by accident.

Only the user may change the classification. An agent **MUST NOT** set `metadata.memo.visibility: public` on a skill on its own initiative; a change follows a question the user has answered, and the declared set of the check changes in the same commit as the frontmatter.

---

## Forwarding to an SOP

A public entry point **MUST** forward to an SOP before it works: it carries at least one `when: pre` edge in the registry from the entry point to a skill whose name ends in `-sop`. The entry point is the public method of the system; it validates and routes, and it never carries the procedure itself — the procedure lives in the SOP and in the skills the SOP names. A public entry point without such an edge is a reported defect of the registry, not a variant.

---

## Naming of Command and SOP

An SOP is named `<namespace>-sop`; a command that forwards to it is named `<namespace>-<action>`. The two share the namespace, so a text search for the namespace finds the command and its SOP together. A public entry point **MUST** forward to at least one SOP of its own namespace; an SOP of another namespace, such as the session SOP every entry point also requires, does not satisfy this rule on its own.

---

## Scope

- The user as the only entry point of the system: very few user-facing commands, each a door from outside that is forwarded to the SOPs inside.
- Entry point versus SOP: user-facing commands are for the user, SOPs are for agents, and the two are kept apart when a command is defined; a command and its SOP share their namespace (see Naming of Command and SOP).
- Controlled prompt injection — the subject is assigned to this chapter, its content is not yet specified. The user named it as a heading without text; until the user states its content, this chapter does not interpret it.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./02-sop-system.md](./02-sop-system.md) — the SOPs an entry point hands over to.
- [./09-progressive-disclosure.md](./09-progressive-disclosure.md) — how capabilities are acquired on demand after entry.
- [./00-overview.md](./00-overview.md) — where this subject sits in the ownership map.
