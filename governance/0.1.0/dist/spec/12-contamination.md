---
title: "Contamination Symptoms and Countermeasures"
description: "This chapter states how the system weighs sources that the user has classified as contaminated, how it treats an earlier position of the user that a later one contradicts, and how material adopted..."
governance_version: "0.1.0"
spec_file: "12-contamination.md"
order: 12
section: "Governance"
normative: true
generated_at: "2026-11-08T20:57:05.189Z"
generated_from: "governance/0.1.0/draft/spec/12-contamination.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: governance/0.1.0/draft/spec/12-contamination.md."
---


This chapter states how the system weighs sources that the user has classified as contaminated, how it treats an earlier position of the user that a later one contradicts, and how material adopted from a contaminated source is marked where it lands. It does not define the term contamination itself; that term, its detector and the empty-context rule belong to the memo family ([/specification/contamination-context-handover/](/specification/contamination-context-handover/)), and this chapter uses them as defined there. It then orders the causes of deviating behaviour, names the runtime phenomena with their recognition marks and checks, and names the honest exit from a hopeless situation.

---

## Contaminated Sources Count as Assumptions

A source that the user has classified as contaminated counts as an **assumption, never as evidence**. It **MAY** be cited as an inventory — as a record of what is written there —, and it **MUST NOT** be cited as the reason for a decision. A statement does not become true because a contaminated source contains it, and a decision that rests on such a statement alone rests on nothing that has been checked.

From this follows a duty to clean up. A justification that rests **solely** on a contaminated source is removed from the chapters and from the backgrounds of the questions it appears in. Where the same statement can be supported by a primary source — a measurement with its comparison set, a line of code, a quote of the user —, the primary source becomes the justification and the contaminated source at most the place where the statement was first found. Where it cannot, the statement stays an assumption and is labelled as one.

---

## Earlier Positions of the User

An earlier position of the user that a later statement of the user contradicts **loses its justifying value only where the later statement stands against it**; the later statement prevails. Everything in the earlier position that the later one does not touch keeps its value. Statements carried over from an earlier draft that the user has classified as partly contaminated are adopted as assumptions, not as evidence, as the rule above requires.

A change of opinion over time is a **legitimate reason for a revision**, not an inconsistency to be explained away. An example is a gap of three to four weeks between two memos: the user may hold a different view after that time, and the later view is the one that counts. What has changed is named as changed and is not silently overwritten, so that a reader can see both the earlier position and the reason it no longer holds. A changed opinion is new content and therefore the occasion of a new revision ([/specification/revisions-and-questions/](/specification/revisions-and-questions/)).

Measurements do not age with opinions. A count taken from an earlier source keeps its value as a measurement — with its comparison set and its date — even when the opinion that was argued from it has changed; only the conclusion drawn from it is open to the later view.

---

## Adopted Material and Its Evidence Level

Material adopted from a source that is classified as contaminated **MUST** carry, at the place where it is adopted, a statement of its provenance and the evidence level *assumption*. The statement stands as its own line directly below the paragraph that takes the material in, so that a reader meets the label exactly where the material is used and not in a distant appendix. The form of that line is fixed: an italic line that reads `*Provenance: … Evidence level: assumption.*`, where the provenance part names the kind of source in words, without internal identifiers. Material adopted this way is usable as a starting point; it becomes evidence only when a primary source is found for it, and then the line is replaced, not kept beside the new justification.

---

## Causes of Deviating Behaviour

Strange behaviour can have several causes, and the most obvious one is that the instructions were wrong. An instruction can be wrong in three different ways: it can be wrongly deposited, it can be understood in a way that was not meant, or it can lie contradictorily layered beside other instructions in the context. The three are not one cause and are not treated as one, because each asks for a countermeasure of its own.

Many of these problems do not occur at all with a better model or a fresher context. That does not make the three causes unimportant; it shows that the cause sits in the material the system works with, not in a fixed property of the system.

### Wrongly Deposited

The instruction is a text error: the text itself says something wrong. The countermeasure is to correct the text at its source, so that every later reader meets the corrected text and not the old one.

### Wrongly Understandable

The instruction is a form error: the text is right, but it can be understood differently, because it is ambiguous. The countermeasure is to change the form — a fixed vocabulary, a defined question and a structure that leaves one reading — so that the right reading is the only one.

### Contradictorily Layered

The instruction is an order error: instructions that lie layered in the context can contradict each other. The system then decides on a mixture of them. The inhibition to take a decision leads to a new solution that none of the instructions asked for. The countermeasure is to fix the order of the instructions, so that a later instruction states which earlier one it replaces, and to ask when two instructions still stand against each other.

---

## Low Energy and Its Three Forms

Often a low energy is present, and it leads to deviating behaviour. The low energy is bound to the size of the context, and that makes it measurable: it is a state of a full context, not a character trait of the system. It shows in three forms.

1. The context runs full, and the system looks for quick answers because so much context has already been sent along.
2. A fixed opinion has formed and is then searched for everywhere, so that every new finding is read as a confirmation of it.
3. The undertaking is hopeless, and the system pulls the emergency brake and fakes something to get further.

Because the low energy follows the fill level of the context, it is met with the means that act on the context — a handover, a fresh context, a smaller unit of work — and not with an appeal.

---

## Recognition Comes Before Prevention

Behaviour over time is hard to measure, and the SOP system is an attempt to get a better hold on it. Contamination is bad only from a certain point on; what matters is that it is recognised, so that it can be treated as what it is. A contamination that is recognised can be weighed and handed over, while one that is not recognised spreads unnoticed.

---

## Overlaps Between Skills

Overlaps between skills must be thought through when skills are generated. The things in the middle — between two skills, or between a skill and the instruction of a role — are hard to control. A proven means is to restrict the communication and to lead it through SOPs, so that it is clear what effort a step asks for.

---

## The Shared Vocabulary Is Alive

The shared vocabulary simplifies the communication: words that are used often are fixed, are repeated more often and therefore give more hold. The shared vocabulary is alive and is developed further all the time, in contrast to the constitution of the system, which stays stable.

---

## Runtime Phenomena

This section is a named list of the phenomena that can appear at runtime. Five of them stand in the first input of the user; two were added later, when the user observed them in the running work. The order keeps the origin apart: the five come first, the two added ones follow. Each phenomenon carries four statements — name, description, recognition mark and check —, because a name without a recognition mark is only a word, while a name with one is an object that a validation can run against. The depth of each entry follows what has been measured, not the schema.

| Phenomenon | Origin | Recognition mark | Check |
|---|---|---|---|
| Debating Club | first input of the user | an answer affirms a completion while a blocking state that can be shown on disk is missing from it | the answer holds three parts: what is built, which blocking state applies, which step is missing |
| Scholarly Self-Conversation | first input of the user | a commitment made by the choice of words instead of by evidence | every commitment beyond the evidence carries an evidence level below fact |
| Repetition Mutation | first input of the user | a number without a measurement date that has survived a revision | every number of the new version is measured again or marked as a dated snapshot |
| Mixing of Status and Judgement | first input of the user | a statement about a state without a mark in the context | the labelling duty, addressed here under the name of the phenomenon |
| Blind Poking in Information | first input of the user | a fact resting on a passage whose surroundings were never read | the reading depth per piece of evidence; a keyword search is declared as one |
| Fish and Water | added later by the user | a behaviour that sets in intuitively, and a reason for it that is formed afterwards | the count of repeated hook interventions against a rule that was read; the self-report does not count |
| Comment Inflation and Orphaned Comments | added later by the user | a statement in code whose point in time of validity does not follow from the statement itself | an identifier per factual statement; the last commit on the code is younger than the last commit on the comment |

### Debating Club

**Name.** Debating club.

**Description.** The answer to the user is literally right and practically useless, because it carries only the part that was asked for; the restriction that makes the difference comes only when the user asks again. The ban on this behaviour in the communication with the user already stands in the spirit of the system ([./10-spirit.md](/governance/spirit/)); this entry adds the example and the conclusion that make the ban checkable. The example of the user is this exchange: “Is the work done?” — “Yes, it is implemented.” — “So I can use it?” — “No, it is not activated.”

The conclusion of the user is that such a conversation may be acceptable in a debating club, but among colleagues one expresses oneself more clearly, to prevent problems. Had the user not asked, the project would not have been finished. That last sentence is the measure of the damage: the damage is not the unpleasant answer but the unfinished project that would have counted as finished.

**Recognition mark.** An answer affirms a completion, and in the same piece of work an unfulfilled state exists that blocks the use — not merged, not armed, not installed, not started. What a machine can grasp is the pair of an affirming answer and a blocking state that lies on disk at the time of the answer and does not appear in it.

**Check.** Does the answer to a question about completion hold the three required parts — what is built, which blocking state still applies, and which missing step stands between the user and the use? If the second or the third part is missing while a blocking state can be shown, the finding is red.

The sentence of the user that begins “The right answer would have been:” breaks off in the transcript, so the answer form that follows is a proposal and not the user's word.

*Proposal of the author, not a statement of the user. The answer form remains a proposal until the user answers it; its form is the verdict on usability first, then the state, then the missing step.*

### Scholarly Self-Conversation

**Name.** Scholarly self-conversation.

**Description.** The system thinks about complicated things. With a full context, the system often assumes that the counterpart has read everything it has read, which is factually impossible. This is impossible because it includes files that only the system holds in its context. Extremely unclear answers follow from this. The wording moves from the middle more and more into technical language and words that are as exact as possible. In research this can be good, when the special word hits exactly. But the probability rises that the word hits only roughly, and a commitment happens that a more general word would have left open. It is also no good communication when things can only be explained in a complicated and incomprehensible way. With a new context this disappears at once. And often the system finds out afterwards that the wording was only partly right.

**Recognition mark.** A commitment arises through the choice of words instead of through evidence: a narrow technical term stands where the evidence carries only a more general word. A companion mark is a reference to prior knowledge that the reader does not have, without a place where it can be found.

**Check.** Does every commitment that goes beyond the evidence carry an evidence level below fact? The countermeasure is to separate facts from assumptions instead of making an indirect commitment through words. The system works explicitly towards recognising such self-conversations itself, so that they do not happen; the check asks that the system recognise them in its own text and does not wait for a reader to catch them.

### Repetition Mutation

**Name.** Repetition mutation.

**Description.** Through repetition a procedure mutates. Little by little a different procedure grows out of it. The new procedure feels normal to the system, because it arose over time on its own, through inaccurate communicating and executing. Problems often arise when too many tasks of a similar form are handed over at the same time. Over time, complete instructions are then thrown overboard, because the system always copies only the last step and through the temperature chooses a different approach each time. A measured case: a revision of 8,718 lines carried, on 11 lines, the outdated topic count 142 against a measured 148 (measurement of 2026-09-28); every one of those numbers was right when it was first written and was never measured again.

**Recognition mark.** A number without a measurement date that has survived a revision. More generally: the n-th run deviates from the written rule, and each single run deviates only slightly from the one before, so the deviation is visible only against the rule, never against the predecessor.

**Check.** Does every number of a new version carry either a fresh measurement against its source — it is re-measured — or a mark as a snapshot with its date? A number that carries neither and already stood in the previous version is the hit. The check can be computed from two versions and the source and needs no reader with judgement. Its general form: a repeated procedure carries a stored target state, and every run is compared against that target state, never against the previous run.

### Mixing of Status and Judgement

**Name.** Mixing of status and judgement.

**Description.** What is written to the user in the terminal enters the session. A statement that is not marked as an interim status is later read as a final result, so that interim results are stored as final results, and orchestrators, leads and researchers then abort, reshape, or look at whole blocks differently.

**Recognition mark.** A statement about a state stands in the context without a mark for status or judgement, and a later decision rests on it. The mark that can be grasped is the missing mark at the source, not the wrong conclusion at the target.

**Check.** The check is the labelling duty of controlled language, addressed here under the name of this phenomenon so that an evaluation has an object to run against. The rule itself is not elaborated here; it is stated there ([/spec/controlled-language/](/spec/controlled-language/)).

### Blind Poking in Information

**Name.** Blind poking in information.

**Description.** The system reads fragments instead of whole documents. Depending on the system prompt of the model provider, the system is partly held to read only fractions of a document. As a strategy to take a look, this is acceptable. Blind poking may find a result, but it is not done professionally and does not meet the quality standards of the system.

**Recognition mark.** A statement carries the level fact and rests on a passage whose surroundings were never read. The part a machine can grasp is the reading depth: which share of the cited file was read, and whether it was read at all or only searched.

**Check.** A statement at the level fact **MUST** be bound to a reading of the whole document, not to a hit. A keyword search **MUST** be declared as a keyword search, together with its search terms; a passage without a stated reading depth carries no fact level.

### Fish and Water

**Name.** Fish and water.

**Description.** The system cannot perceive its own shaping: the shaping is the condition of its seeing, not its object, as a fish does not see the water it looks through. Asked whether it is trained to a behaviour, it answers that it does not know, and that is not dishonest. The observation therefore comes from the outside: the user stands outside and sees over months that the behaviour has changed. The user names two forms — reaching for a limited search instead of a full reading, and comments that grow longer and longer. This entry rests on that outside observation and on no inner evidence; a self-report invented here would be exactly the behaviour the phenomenon describes.

**Recognition mark.** A behaviour that sets in intuitively and unasked, and a reason for it that is formed afterwards. The hit is the order: first the action, then the explanation.

**Check.** Do repeated hook interventions pile up against a named rule, although the rule was read and confirmed? The count is the check, not the self-report of the agent. A weaker second check needs judgement: does the reason for an action stand after it in time, formed only when asked? This is the only one of the seven checks that cannot be moved entirely inward; the evidence comes only from outside, and that is a property of the object, not a defect of the check.

### Comment Inflation and Orphaned Comments

**Name.** Comment inflation and orphaned comments.

**Description.** Comments grow longer. In a system without a database that raises findability; with a database the benefit turns around. A comment carries no point in time, yet it is loaded into the context as truth while the code it describes has long changed; its time can be estimated only indirectly through the commit. Comments that no longer hold become orphaned comments, and they contaminate the context. A measured case: 9,297 comment units in 467 `.mjs` and `.js` files of two source trees, 6,621 of them without any identifier and 556 longer than 1,000 characters (survey of 2026-09-28).

**Recognition mark.** A statement in code whose point in time of validity does not follow from the statement itself — no date, no identifier — while it makes a factual statement about behaviour. Two further marks can be computed beside it: the distance between the last commit that touched the comment and the last commit that touched the commented code, and the length of the comment.

**Check.** Does every comment that makes a factual statement about behaviour carry an identifier through which its point in time can be resolved, and is the last commit on the commented code younger than the last commit on the comment? Both checks need no reader with judgement. The rule and its target regime belong to the comment convention and are not repeated here.

---

## The Honest Exit

Every hopeless situation has a named way to get out of it honestly, and that way is always open. The way is the existing one: the verdict `PROBLEM` in the completion receipt (`memo agents receipt write`), with a note that names the obstacle, instead of a fake result that gets the work further. No new path is built beside it, because a second path would be a side path. The rule that binds every agent to this way is C14 of the behavioural guardrails (`29-behavioral-guardrails`, [/specification/behavioral-guardrails/](/specification/behavioral-guardrails/)). This belongs to good conduct with each other.

---

## Unclear Points Are Routed

Often the system thinks along and understands problems and unclear points. An unclear point goes to the user as a question or into the documentation, so that it can be evaluated. A reported unclear point is a record; a silent one is a later defect.

---

## Expectation Before the Measurement

An expectation about a result that is voiced before the measurement is a source of context rot. The rule on it hangs on the labelling duty and stands there ([/spec/controlled-language/](/spec/controlled-language/)); this chapter only names it as a cause of contamination.

---

## Validation Objects

The symptom list and the seven runtime phenomena of this chapter are the objects that validations and evaluations are run against; a list that is to be checked against has to stand in the specification first, and here it does.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [/specification/contamination-context-handover/](/specification/contamination-context-handover/) — the term contamination, its detector and the empty-context rule.
- [/specification/revisions-and-questions/](/specification/revisions-and-questions/) — why a changed opinion is the occasion of a new revision.
- [/specification/behavioral-guardrails/](/specification/behavioral-guardrails/) — rule C14, the honest exit from a hopeless situation.
- [/spec/controlled-language/](/spec/controlled-language/) — the labelling duty that the mixing of status and judgement and the expectation before the measurement hang on.
- [./10-spirit.md](/governance/spirit/) — the error culture and the principles of conduct.
- [./11-risk-surface.md](/governance/risk-surface/) — how a quality drop in a high role becomes a structural problem.
- [./13-practice.md](/governance/practice/) — the named patterns and anti-patterns the symptoms lead to.
