# Anchor-Grounding Baseline (WI-09)

Fresh-context measurement of whether each anchor term's fixed meaning arrives from spec text alone.
Per term: meaningRecovered (0..2) + negationRecovered (0..2). Baseline = mean, as %.

**Baseline: 98%** (43/44 across 11 terms).

| id | label | meaning /2 | negation /2 | /4 | note |
|----|-------|-----------|-------------|----|------|
| `AT-memo` | Memo | 2 | 2 | 4 | not-uploadable + not-cross-memo both hit |
| `AT-revision` | Revision | 2 | 2 | 4 | excludes in-place edit |
| `AT-topic` | Topic | 2 | 2 | 4 | exhaustive + memo-scoped |
| `AT-goal` | Goal | 2 | 2 | 4 | not-surface + not-single-memo |
| `AT-block` | Block | 2 | 2 | 4 | matches not-a-context-block |
| `AT-prd` | PRD | 2 | 2 | 4 | second-thread=chunk signal |
| `AT-phase` | Phase | 2 | 2 | 4 | not-optional + not-parallel |
| `AT-strand` | Strand | 2 | 2 | 4 | not-authored, tag-not-ID |
| `AT-requirement` | Requirement | 2 | 1 | 3 | misses not-self-graded / doer-not-grader boundary |
| `AT-tool` | Tool | 2 | 2 | 4 | not-runtime, RECOMMENDATION |
| `AT-plan` | Plan | 2 | 2 | 4 | nests-not-replaces stage model |
