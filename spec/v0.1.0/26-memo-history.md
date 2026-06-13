# 26. Memo History

| Field | Value |
|-------|-------|
| Status | Draft |
| Depends on | [18-multidimensionality.md](./18-multidimensionality.md) |
| Related | [18-multidimensionality.md](./18-multidimensionality.md), [24-tools-registry.md](./24-tools-registry.md), [00-overview.md](./00-overview.md) |

Memos in a project do not stand alone. They accumulate into a **cumulative timeline**: memo 0 is followed by memo 1, then memo 2, and so on, and read in order they tell the story of how a project evolved. Each memo builds on the ones before it — a decision taken in an early memo becomes the ground a later memo stands on. The memo history is the chronological record of that story, and it is the artifact that gives an AI a sense of time across a project's lifetime.

A timeline that only ran straight would be a list, not a history. What makes it a history is that the story can turn. A **pivot** — a point at which the direction of the project changes, an earlier decision is reversed, or the approach is fundamentally redrawn — MUST be recorded on the timeline at the memo where it happens. If the project pivots at memo 23, the timeline carries that pivot at position 23; everything written before it was written under the old direction, everything after under the new one.

---

## Timeline with Pivots

The memo history is a sequence of memos ordered by their number, plus the pivots that mark where the story changed direction.

- The sequence is **cumulative**: each memo MAY assume the decisions and state established by the memos before it, and the chain `0 → 1 → 2 → …` is read as a continuous narrative of the project.
- A **pivot** is a recorded turn on that sequence. When a memo reverses, supersedes, or redirects a decision made earlier, that pivot MUST be marked on the timeline at the memo where it occurs, naming what changed. A pivot is not a deletion: the superseded memos remain (see *Coupling to State Preservation*); the pivot records that, from this point on, the project reads them differently.
- Reading the timeline, an AI can locate any memo relative to the pivots that surround it and so know which direction the project was facing when that memo was written.

---

## Why the Timeline Exists

An AI does not, on its own, understand time. Two memos placed in front of it look equally present; it cannot tell from their content alone which one was written first, which one superseded the other, or whether a statement made long ago still holds today. The timeline supplies that missing temporal grounding.

The purpose of the memo history is to let a reader **judge whether information from an earlier memo still holds at a later one**. Consider a statement made in memo 20. By the time the project reaches memo 130, is that statement still true? Without a history the question is unanswerable — the AI has no way to know what happened in between. With the timeline, the answer is mechanical: walk from memo 20 forward to memo 130 and check whether any pivot between them reversed or redirected the statement. If a pivot at memo 23 changed the direction the statement depended on, the information from memo 20 no longer holds; if nothing on the path touched it, it still stands.

This is the core value of the chapter. The timeline turns "does this old decision still apply?" from a guess into a traversal of recorded pivots.

---

## Coupling to State Preservation

The memo history works only because memos are kept. Memos are **time documents** — persistent records of the decisions, rationale, and open questions captured at the moment they were made (see [18-multidimensionality.md](./18-multidimensionality.md)). Because the system preserves that state rather than discarding superseded memos, the timeline has something to point at: every position on it resolves to a memo that still exists and can still be read in its original form.

A pivot therefore never erases the memos before it. The superseded decisions stay on the record, exactly as written; the pivot only records that the project turned away from them. State preservation is what makes the history honest — the old direction is still visible, so the turn can be understood — and the history is what makes state preservation useful, because it tells a reader how to interpret each preserved state relative to the turns that came after it.

---

## Distinction from the Project Wiki

The memo history is not the project wiki, and the two MUST NOT be conflated.

- The **wiki** is a *query tool* (registered in [24-tools-registry.md](./24-tools-registry.md)): a way to ask "how does the workbench do X right now?" and get the current, consolidated answer. It is organized by topic and reflects the present state.
- The memo **history** is a *chronological record of pivots*: it answers "when did the project decide X, and has that decision been turned since?" It is organized by time and reflects the sequence of change.

A topic in the wiki tells you the current answer; the memo history tells you how that answer came to be and whether an older form of it is still valid. The two are complementary: the wiki is consulted for the present, the history for the temporal validity of the past. Each refers to the other rather than duplicating it — the wiki does not carry the pivot timeline, and the history does not carry consolidated topic pages.

---

## Related

- [18-multidimensionality.md](./18-multidimensionality.md) — memos as time documents and the state-preservation model the timeline depends on.
- [24-tools-registry.md](./24-tools-registry.md) — the project wiki as a query tool, distinct from the chronological history.
- [00-overview.md](./00-overview.md) — conformance language.
