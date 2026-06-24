# 02. SOP Instances and the Reference Model

| | |
|---|---|
| Status | Draft |
| Depends on | [00-overview.md](./00-overview.md), [01-common-denominator.md](./01-common-denominator.md) |
| Related | [The Workbench-SOP](/workbench/sop-entrypoint/), [The memo-init SOP entry point](/specification/memo-sop-entrypoint/) |

> **Informative.** This chapter records how the existing SOPs relate to the common denominator. It names instances; it does not restate their content, which lives in their own specs.

The SOP spec defines a shape; the concrete SOPs **are** that shape, filled in for their scope. This chapter records the existing instances and the lightweight reference model that ties them back to the standard.

---

## The Existing Instances

| SOP | Scope | Where it lives |
|-----|-------|----------------|
| **memo-init SOP** | a single memo's lifecycle | core specification — [entry point](/specification/memo-sop-entrypoint/) |
| **Workbench-SOP** | the workbench and its projects | Workbench spec — [entry point](/workbench/sop-entrypoint/) |

Each instance fills in the four parts of the common denominator for its own scope: its Setup creates that scope, its Health checks that scope, its Update keeps that scope current, and its extras cover what is unique to it. Future SOPs join the table by doing the same.

---

## The Reference Model

The tie between an instance and the standard is deliberately light:

- An SOP **references** this spec rather than copying it. It does not restate the definitions of Setup, Health, and Update; it points at them and then says how it realizes each.
- This spec **does not import** an SOP's content. It names the instance and links to it; the instance remains the authority on its own scope.

The result is a connecting layer with no duplication: the standard is stated once here, each SOP states only how it satisfies the standard, and a reader moves between them by following references rather than by reconciling repeated text.

---

## Related

- [00-overview.md](./00-overview.md) — the purpose of the SOP spec.
- [01-common-denominator.md](./01-common-denominator.md) — the four parts each instance fills in.
- [The Workbench-SOP](/workbench/sop-entrypoint/) — the workbench instance.
- [The memo-init SOP entry point](/specification/memo-sop-entrypoint/) — the memo-lifecycle instance.
