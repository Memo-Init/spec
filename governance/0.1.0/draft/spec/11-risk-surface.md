# 11. Risks and Estimates

| | |
|---|---|
| Status | Draft |
| Depends on | [./00-overview.md](./00-overview.md) |
| Related | [./05-roles.md](./05-roles.md), [./06-subagents.md](./06-subagents.md), [./07-break-glass.md](./07-break-glass.md), [./12-contamination.md](./12-contamination.md) |

This chapter specifies the risk that remains in a closed system and how it is carried. A given workbench, prompts that point the direction and deterministic boundaries reduce risk, but a residue remains, and it enters by many routes — through careless reading of context, through documents of unknown origin, through behaviour that bypasses the intended structure. Which role carries how much of that risk, and which sources it may read, is the subject of this chapter.

---

## A Probabilistic System

The whole structure of the system rests on weighing risk. It is a probabilistic system and therefore unpredictable to a degree. Restrictions can still be made, and the chapters of this family are such restrictions; they narrow the space in which the unpredictable can happen, they do not remove it.

---

## The Risk Matrix of Context Sources

Context is a risk: an agent is filled with context carefully, because unconsidered reading can change its view lastingly. The matrix assigns one danger class per kind of source, not per tool — the same tool can fetch a harmless and a dangerous document, so the class follows what is read, not how. Unconsidered reading can also cause a drop in quality that the agent does not notice itself.

| Class | Sources | May read | Handled by |
| --- | --- | --- | --- |
| `low` | the memo database through its command line; the memo viewer and its interface | all roles | every role, in its own context |
| `elevated` | material of another perspective in the wrong context, such as coding problems in the orchestrator's context | only the role whose work it is | the role whose work it is, never a higher one |
| `high` | documents of unknown origin from the internet; frontend HTML analyses | only the researcher function, in its own context | the researcher function, which delivers a result file |
| `isolated` | testing with a high contamination risk | an area of its own | a worker of its own, in a worktree and a context of its own |

---

## Dangerous Queries Belong to the Researcher

Material of unknown origin belongs to the high class and is handled by trained researchers, not by the orchestrator. The tool contract removes the web tools from the orchestrator role. What the orchestrator needs from such material reaches it as a delivered result, read from the file the researcher wrote.

Unexpected documents from the internet are more dangerous still, because their origin is unknown and their content cannot be foreseen. A frontend HTML analysis tips kilobytes of information into the context at once and destroys the duty of purity with a single command.

---

## Testing With High Contamination Risk

Testing whose material could contaminate the one who runs it runs in an area of its own: a worker of its own, a worktree of its own and a context of its own. What comes back is a result document, not the material that was tested.

---

## The Influence Cascade

The ranking of the roles follows the damage a contamination in each of them can do.

| Role level | Affects | Cost of a contamination |
| --- | --- | --- |
| worker and evaluator | its own unit of work | small — the next gate catches it |
| unit generator | the two that follow it: the building worker and the evaluator | the unit is built and checked on a wrong basis |
| lead | many units of its phase, and more | a phase is cut, distributed and accepted on a wrong basis |
| orchestrator | many leads | the whole run carries the error into every phase |

---

## The Escalation Rule

A harmless quality drop at the top becomes a structural problem below, and that MUST NOT happen. The cascade turns a small deviation in a high role into a pattern that every role below repeats, because each of them takes the deviation as its instruction.

---

## Purity Grows With Power

The higher the role, the stricter its duty to keep its context clean. The duty grows with the reach of the role, because the cost of a contamination grows with it; the orchestrator, the most powerful role, carries the strictest duty.

---

## The Orchestrator Does Not Solve Coding Problems

The orchestrator does not solve coding problems itself. A coding problem brings the view of another perspective into its context, fills that context and lowers the quality of everything the orchestrator decides afterwards. Its way is to give the work to a worker and to receive the result.

---

## The Memo Viewer Exception

The orchestrator may query the memo viewer and its interface, because both belong to the low class: they show the record of the memo, not material of unknown origin.

---

## Communication Between Agents

Communication between agents is always defined, checked when a role is created, and off at runtime by default. Where communication is useful, it runs over a defined path — a handover document, an order sheet, a receipt — and a dynamic run is served only from outside ([./06-subagents.md](./06-subagents.md)). This is a design boundary, not a measured property of agent systems.

A dynamic workflow hands over defined documents or data, and reading those defined documents reduces the risk. Direct communication with an agent that carries a risk raises the risk and can lead to indirect effects. Where such contact cannot be avoided, its risk is mitigated through a recommendation instead of a direct instruction. Wild, free communication creates network effects that the system is not designed for.

---

## What the System Is Built For

The system is built to get work done that good to very good agents can do. It is planned for everyday demanding work, not for the exceptional case that only a single outstanding run could carry, and its boundaries are drawn for that kind of work.

---

## Misuse Is an Attack

Exploiting or misusing the structure is treated as an attack on the system. Such behaviour is classified as critical, recorded and shown to the user, in the same way as a drawn exception ([./07-break-glass.md](./07-break-glass.md)).

---

## Omission Is Not Intent

An agent that leaves out a step it did not see is not an agent that bypasses a rule on purpose, and the two are met with different means. Against intent a lock helps; against omission only a visible path helps.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./05-roles.md](./05-roles.md) — the roles whose ranking the damage radius explains.
- [./06-subagents.md](./06-subagents.md) — how rights shrink on the way down, and how a dynamic run is served from outside.
- [./07-break-glass.md](./07-break-glass.md) — the exception role, and the record that a critical event leaves.
- [./12-contamination.md](./12-contamination.md) — how contamination is recognised and weighed.
