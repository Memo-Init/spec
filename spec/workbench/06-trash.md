# 06. Trash

| Field | Value |
|-------|-------|
| Status | Draft |
| Depends on | [01-project-structure.md](./01-project-structure.md) |
| Related | [05-wiki.md](./05-wiki.md), [00-overview.md](./00-overview.md) |

> Normative language (MUST/SHOULD/MAY) follows BCP 14 [RFC2119] [RFC8174]. RFC 2119 keywords are used.

This chapter is **normative** for the no-deletion policy, the `.trash/` target, and the prohibition on destructive removal.

---

## Purpose

Work in a project is exploratory and often half-formed. Material that looks discardable today may be needed tomorrow, and an irreversible deletion in an autonomous loop is a class of mistake that cannot be undone. The workbench therefore replaces deletion with **recoverable trashing**.

---

## No Deletion — Only `.trash/`

Removing material from a project **MUST** route through the project-local `.trash/` folder (see [01-project-structure.md](./01-project-structure.md)).

- "Removing" a file or folder means **moving** it into `.trash/`, not erasing it. The material remains on disk, recoverable, until a human decides otherwise.
- `.trash/` is **manual**. It is emptied by a person, deliberately — never automatically by a script, a cleanup routine, or an autonomous loop. Automatic emptying would re-create the irreversible-loss risk the policy exists to remove.
- Because `.trash/` lives inside the local project (under the local guarantee of [01-project-structure.md](./01-project-structure.md)), trashed material never leaves the machine and is never pushed.

Superseded knowledge — for example, an outdated wiki page (see [05-wiki.md](./05-wiki.md)) — is trashed, not deleted, so its provenance can still be recovered if needed.

---

## `rm -rf` Is Forbidden

Destructive recursive removal is **forbidden**.

- `rm -rf` (and equivalent destructive, recursive, irreversible removals) **MUST NOT** be used on project material. Such a command erases without recovery and bypasses the `.trash/` safety net entirely.
- Tooling that needs to "delete" **MUST** instead move the target into `.trash/` (a timestamped move), preserving recoverability.
- This prohibition is absolute for project content: there is no scenario in normal project work that requires an irreversible recursive delete, because the recoverable move accomplishes the same intent safely.

---

## Related

- [01-project-structure.md](./01-project-structure.md) — the `.trash/` folder and the local guarantee that contains it.
- [05-wiki.md](./05-wiki.md) — superseded wiki pages are trashed, not deleted.
- [00-overview.md](./00-overview.md) — sub-spec scope.
