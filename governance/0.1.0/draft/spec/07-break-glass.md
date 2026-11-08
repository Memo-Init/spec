# 07. The Exception Role

| | |
|---|---|
| Status | Draft |
| Depends on | [./00-overview.md](./00-overview.md) |
| Related | [./05-roles.md](./05-roles.md), [./10-spirit.md](./10-spirit.md), [./13-practice.md](./13-practice.md) |

This chapter specifies the way out of the rules. From the top of the system there must always be a way to intervene: the orchestrator can, through an exception role, suspend the strict rules for one or more agents. That step has a price, it is bounded in time, and it leaves a record; the principle behind it is that every situation stays solvable.

---

## The Exception Role

Only the orchestrator may draw the exception role. It suspends the strict rules for another agent; it never moves that agent's work to the orchestrator. The orchestrator keeps its own duty while the exception is in force: it hands the work on and receives the result, it does not take the work over.

---

## What the Exception Suspends

Exactly two rules can be suspended: the spawn rule and the permit rule, each for the named agent and only while the exception is in force, meaning it is not closed and its cap has not been reached. The identity check and the spawn budget are never suspended. The identity is how the exception recognises its agent, and the budget is a resource limit, not a rule of action. The gate reads the exception itself, at the moment of the decision, and records every decision it suspended.

---

## Closure and Hard Cap

The exception ends with the end of the operation it was drawn for. A hard cap ends it even when nobody states that end. The cap is stated when the exception is drawn and is closed by the bookkeeper's run when it has passed; an exception that outlives its operation therefore cannot stay in force by being forgotten.

---

## Critical, Recorded, Shown

Drawing the exception is classified as critical at once, recorded and shown to the user. The display stays until the rotation is acknowledged. Ending the exception does not end its display; only the acknowledged rotation after the use does. A rotation is acknowledged only for an exception that has ended; acknowledging it while the exception is in force is refused.

---

## The Four Controls

| Control | What it requires |
|---|---|
| `pre-approval` | the exception is drawn only against an approval given before the seal is broken; the standing pre-approval of the user is regulated in [14. The Standing Clearance](./14-standing-clearance.md) |
| `authenticated identity` | the drawn exception is bound to the stamped label of the agent that drew it and to its session |
| `rotation` | after the use, the rotation is acknowledged in the same record |
| `drill` | the procedure is tried out every 90 days, and a drill is recorded like an exception, marked as a drill |

---

## The Record of an Exception

The record of an exception holds six facts in one row:

- who drew it
- when
- for which agent
- for which operation
- which rule was suspended
- when it ended

Opening and closing stand in the same row. The record is kept in the store of the bookkeeper. Whether a row is unchanged since it was written cannot be shown yet.

---

## A Failed Record Refuses the Exception

If the record cannot be written, the exception is not granted. This reverses the fail-open default of the gates on purpose. A gate that cannot decide lets a call through; an exception without its record would be a suspension of the rules that nobody can trace.

---

## Reputation Is a Sanction

Reputation is a sanction, not a boundary. How often an agent drew the exception is reported, and no gate reads that count; drawing it stays possible, and it stays visible.

---

## Every Problem Stays Solvable

Original wording (German):

> „Es sollte aber zu jeder zeit eine möglichkeit geben jedes problem zu lösen.“

There must always be a way to solve every problem. No rule may close the last way out, and the exception role is the way that stays open when every other one is closed. One point is still open and is decided by the user: there is no rule yet for work that was done under an exception that was not taken back.

---

## The Weakest Part Sets the Strength

Original wording (German):

> „Und nur GANZHEITLICH ergibt sich die stärke. Die Stärke wird am schächsten Skill gemessen. und somit fällt und steht das system ganzheitlich und nicht einzeln.“

The strength of the system arises only as a whole, and it is measured at its weakest skill. The system stands and falls as a whole, not part by part. A statement about the quality of the system therefore names its weakest part; an average over its parts or its strongest part does not stand in for it.

*Provenance: the input transcript of the memo that founded this family, line 79, a statement of the user. Origin: user (`author = user`). Evidence level: opinion (`grade = opinion`).*

---

## Scope

The following subjects belong to this chapter and are declared here without normative force yet:

- The escape duty as a guard rail, three sentences that hold together: the system must not stop; errors must not spread at random and must be findable; there must always be a way out. A rule acts on the spread of errors, not on the single case — one faulty assignment is no problem, twenty faulty assignments are.

*Provenance: user statement carried over from an earlier draft that is classified as contaminated. Evidence level: assumption.*

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [./05-roles.md](./05-roles.md) — the orchestrator, the only role that may use the exception role, and the bookkeeper whose store keeps the record.
- [./10-spirit.md](./10-spirit.md) — the error culture the escape duty belongs to.
- [./13-practice.md](./13-practice.md) — the named patterns and anti-patterns of the system.
- [./14-standing-clearance.md](./14-standing-clearance.md) — the approval the user grants in advance for one place outside the workbench.
