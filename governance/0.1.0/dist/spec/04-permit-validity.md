---
title: "Permit Validity, Renewal and Expiry"
description: "This chapter specifies the life of a permit over time. A permit is renewed like a driving licence and is never valid forever, so that a context that degrades over a long session is met with a fresh..."
governance_version: "0.1.0"
spec_file: "04-permit-validity.md"
order: 4
section: "Governance"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "governance/0.1.0/draft/spec/04-permit-validity.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: governance/0.1.0/draft/spec/04-permit-validity.md."
---


This chapter specifies the life of a permit over time. A permit is renewed like a driving licence and is never valid forever, so that a context that degrades over a long session is met with a fresh reading of what matters. When and how a permit expires, and what an agent is told before it does, is the subject of this chapter.

---

## Scope

- The triggers of an expiry: a number of commands after which a renewal is required, and the events that end a permit at once.
- An advance warning before the expiry, so that an agent learns in time that a renewal is due — for example a fixed number of commands before the role has to be read again.
- Cascade revocation: when a role is reset, every SOP read under it is revoked as well and has to be read again if still needed; a compaction of the context resets all permissions but not the memory of having held them and why.
- Renewal like a driving licence, never valid forever.

---

## Two Triggers

A permit expires on **two** triggers, and on nothing else:

1. **Events.** A compaction of the holder's context and a role reset of the holder end every permit of that holder at once.
2. **A command count.** A permit **MUST** expire once its holder has issued a fixed number of commands since the grant — under a role, since the release of the role (*The Role Carries the Count*). The number is a value with a named source: the permit may carry its own, otherwise a default applies, and every answer about validity states which of the two was used.

A permit carries no overall cap: its validity is bounded by the two triggers alone. The fill level of the context is not a trigger; it cannot be measured from where expiry is computed. Time is not a trigger either.

Renewal is the regular acquisition: the required SOPs are read again and the closing SOP is run again. Renewal starts a new count; nothing extends a running one.

---

## Where Expiry Is Computed

Expiry **MUST** be computed outside the holder. It is computed at the gate that runs before each tool call anyway: the gate counts the holder's tool calls from the transcript the harness keeps of the holder — the holder's own transcript, for a sub-agent its own and not the session's — so no record of its own has to be kept and no call is ever left uncounted by a hook that did not run. Validity is recomputed on every call from the grant and that count; a recorded expiry is information, not the carrier of the state.

The harness writes the transcript asynchronously, so the count can lag behind the calls by a few; against a threshold of hundreds of commands that lag is acceptable. The hook after a call runs only on skill calls, where it records the release of a permit and a role reset; it does not count.

---

## Advance Warning

Before the count runs out, the holder **MUST** be warned on the channel that reaches the agent — not only the user — once a fixed number of commands remains. The warning is descriptive, not commanding: it names the permit, its location, the commands that remain and **every** SOP that expires with it — the SOPs the permit requires and the SOPs the holder read alongside since the grant. The gate gives it on every call inside the warning window, from the same transcript count it decides on, so that it survives a full context; it is recorded once per grant.

---

## The Role Carries the Count

Original wording (German):

> „Dieser Laufzeit angabe sollte aber gesammelt über die höchste ebene durchgeführt werden. Also dem rollen-sop.“

The command count is collected at the highest level, the role. When the holder has loaded a role start SOP, the release of the role after its closing SOP ([./05-roles.md](/governance/roles/), *Two SOPs Per Role*) is the start of the count — before a release, the role reset is — and every permit granted after it **MUST** count from the role reset, not from its own grant: the permits count onto the role. The role uses the default values of the permits.

- **Advance warning.** Once the fixed number of commands remains, the holder **MUST** be warned on the agent's channel that the role expires: the role, the commands that remain and every SOP the holder read since the role reset, together with the renewal — the start SOP again, the required SOPs, the closing SOP. The warning is given on every call inside the window and recorded once per role reset.
- **Expiry.** When the count is used up, the expiry of the role **MUST** revoke the release of the role, every reading and every permit of its holder, the role SOP itself included, with the same scope as a role reset. It is recorded once.

A holder without a role reset keeps the count of each permit from its grant, as above.

*Provenance: the input transcript of the memo that founded this family, line 203, a statement of the user. Origin: user (`author = user`). Evidence level: opinion (`grade = opinion`).*

---

## Cascade Revocation

A role reset — a successful load of a role start SOP; the closing SOP of a role is no reset — **MUST** revoke every reading and every permit of its holder, except the role SOP that triggered it. A reset of the main context revokes for the whole session; a reset of a sub-agent revokes for that sub-agent only. The SOP gates **MUST** honour the revocation: a reading recorded before it no longer counts, and a reading done again after it counts again. A reading in the same second as the revocation counts as revoked — the conservative side.

---

## Catch-Up Rule

A permit acquired long before the work is, at the moment of use, either inside its warning window — the use is allowed, with the warning — or expired. An expired permit **MUST NOT** be extended after the fact and has no grace period; the refusal names the regular way to acquire it as the next step. A call that has already started runs to its end: the gate decides before a call, never in the middle of one.

---

## The Compaction Bracket

A compaction is bracketed by two halves. The front half runs before the compaction: it **MUST** record, for the holder, every permit held at that moment — the permit, its location, the SOPs it requires and the grant it was held under — and mark each of them as expired, together with a revocation of the holder's readings. The front half never blocks the compaction.

The back half is the one path through which context is injected after a compaction. It **MUST** only describe: it names the expired permits, their locations, the SOPs to read and the way to acquire them again, and it grants nothing. A permit is granted again only through its closing SOP; restoring after a compaction means injecting the list again, never a silent re-grant, because the reading the permit stood on is no longer in the context.

If the second half of the bracket does not run, the permit stays expired; it is neither valid nor undetermined.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./03-permits.md](/governance/permits/) — the permit whose validity this chapter will govern.
- [./08-runtime-enforcement.md](/governance/runtime-enforcement/) — the hooks that check validity at runtime.
