# 08. Hooks, Runtime and Enforcement

| | |
|---|---|
| Status | Draft |
| Depends on | [./00-overview.md](./00-overview.md) |
| Related | [./02-sop-system.md](./02-sop-system.md), [./04-permit-validity.md](./04-permit-validity.md), [./09-progressive-disclosure.md](./09-progressive-disclosure.md) |

This chapter specifies the deterministic base under the permission system. Dependencies between SOPs, permits and roles only work when a deterministic layer manages the permissions and checks the commands; inside the workbench an agent starts without rights and gains them by reading the correct SOPs. How that layer is coupled to the SOPs is the subject of this chapter.

---

## Scope

- The coupling of hooks and SOPs: every behaviour a hook expects is also written in the skills, and every change to hook logic carries a change to the SOPs with it, so that an agent can always work in the expected way.
- The duty of transparency: an SOP that relies on a hook which can stop a command states that hook openly, so that the agent has a fair chance to apply the expected behaviour; a hook error is an error and never expected behaviour.
- Release only after the check: the closing SOP is checked by a hook, and only then are the permissions released.
- No rights by default inside the workbench, distinguished between the workbench root and a project; rights are acquired by reading and can fade over the runtime of a session.

---


## Coupling of Hooks and SOPs

Every behaviour a hook expects **MUST** also be written in the skills an agent reads, and every change to the logic of a hook **MUST** carry the change of the SOPs it concerns with it. The coupling is checked mechanically: every SOP a blocking hook asks for names that hook together with a hash prefix of the hook file it was written against, and a check derives the expected pairs from the declared data — the command matrix, the registry edges, the permits and the role SOPs — and fails while a named hash differs from the hook as it is. A changed hook therefore stays red until its SOPs have been read against the change and pulled along.

---

## Duty of Transparency

An SOP that relies on a hook which can stop a command **MUST** state that hook openly, so that the agent has a fair chance to meet the expected behaviour: which hook, what it is for, what it stops, which SOP it asks for, and the hash prefix of its file. A hook is named by its intent — before a skill runs, before a shell command or file write, before or after every tool call, before compaction, before a sub-agent is started — never only by the name of a harness event. An SOP that lives outside the repository that carries the check is reported as outside, not as missing, and keeps its table where it lives.

---

## A Hook Error Is a Misalignment

A hook that cannot decide — a missing tool it depends on, an unreadable record, a broken payload, an unreadable identity source — **MUST** say so as an error that is clearly not expected behaviour, and **MUST NOT** turn the failure into a block. An expected block and a hook error carry different, fixed prefixes and are never mixed in one message, so that a reader can always tell "the gate decided" from "the gate could not decide".

---

## No Rights by Default

Inside a project, a location that a permit declares carries no rights by default. A call there **MUST** be allowed only when a valid permit of the caller covers it; outside that set the call is refused as not granted or as expired. Locations no permit declares are governed by the zone rules of the command matrix. At the workbench root no permit is granted, and outside the workbench this layer decides nothing. Rights are acquired by reading and fade over the runtime of a session, as the validity chapter specifies.

---

## A Guard Acts on the Effect, Not on the Tool Name

A guard **MUST** act on the effect of a command, not on the tool name. A guard that rewrites a remove command into a move but allows a version-control tool wholesale lets a forced worktree removal, a forced clean or a forced checkout delete just as completely. The guard therefore classifies commands by what they destroy — recursive or forced deletion of tracked or untracked material — and applies the same rule whichever tool performs it.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./02-sop-system.md](./02-sop-system.md) — the start and closing SOPs the hooks check.
- [./04-permit-validity.md](./04-permit-validity.md) — expiry and renewal at runtime.
- [./09-progressive-disclosure.md](./09-progressive-disclosure.md) — capabilities acquired by loading skills.
