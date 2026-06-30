---
title: "Release and Pinning"
description: "A system that ships nothing outward still does not need a version on every repository. The historical failure was the opposite of under-shipping: every repository was stamped with the same version..."
spec_version: "0.1.0"
spec_file: "39-release-and-pinning.md"
order: 39
section: "Specification"
normative: true
generated_at: "2026-06-30T22:47:32.159Z"
generated_from: "draft/memo/0.1.0/spec/39-release-and-pinning.md"
generator: "scripts/generate-docs-payload.mjs"
edit_warning: "This file is auto-generated. Source: draft/memo/0.1.0/spec/39-release-and-pinning.md."
---


A system that ships nothing outward still does not need a version on every repository. The historical failure was the opposite of under-shipping: every repository was stamped with the same version number, and formal releases were cut for artefacts that no consumer ever installed — vestigial releases that signalled "shipped" where nothing was. This chapter replaces that uniform over-release with a **two-stage policy**. The internal stage pins cross-repo dependencies by commit hash and bumps them through the maintenance re-bless flow; the external stage cuts a formal Release only for the named outward-facing artefacts. A version is the exception reserved for what actually leaves the system, not the default applied to everything inside it.

---

## Two Stages — Dev by Default, Release by Exception

The split is between how repositories depend on each other internally and how the system ships outward.

- **Internal stage — commit-hash pinning (the default).** Cross-repo dependencies are pinned by **git commit SHA**, not by version range. A repository that consumes another names the exact commit it was verified against — a site repository pins the specification repository by `#<sha>`, for example. This is the **default mode**: "dev mode is default." No version number is minted, no release is cut; the dependency is simply a frozen, named point in the source's history.
- **External stage — a Release (the exception).** A formal Release with a version is created **only** for the named outward-facing artefacts. A Release is an outward act ([19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/)): it exists for an audience outside the system and is therefore reserved for the artefacts that audience actually consumes.

The two stages are not two phases of the same artefact's life — most artefacts never leave the internal stage at all. The internal stage is the steady state; the external stage is entered only by the few repositories that ship.

---

## Which Repositories Release, and Which Are Pinned

Releasing is bound to the **outward/internal axis** ([19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/)), not to repository size or activity.

| Class | Artefacts | Distribution |
|-------|-----------|--------------|
| **Outward — gets a Release** | the CLI, the viewer, and the specification's site payload | a formal Release with a version, cut only when the artefact actually ships |
| **Internal — sha-pinned, no Release** | the organisation profile repository, the prompt-generator, and the core library | consumed only by other repositories in the system, pinned by commit SHA |

Internal-only repositories get **no releases at all**. A core library that is only ever imported by sibling repositories, an organisation profile, a prompt-generator that no outside party installs — none of these has an outside audience, so none earns a version. They are kept current by their pins, re-blessed through maintenance, and never tagged.

This is the same triage the rest of the system applies: an artefact that faces outward carries the outward apparatus (a Release), an artefact that faces inward carries the inward apparatus (a SHA pin).

---

## Bumping a Pin Through Maintenance, Not Through a Release

An internal SHA pin moves forward through the **maintenance re-bless flow** ([33-maintenance.md](/specification/maintenance/)), not through a version release. Every cross-repo edge carries a provenance pin — the commit of the source at which the edge was last verified — and advancing that pin is exactly the gated re-verification the maintenance chapter defines: a fresh-context check that the edge still holds at the source's current head, after which the pin is re-stamped.

Bumping a pin is therefore a **maintenance act, not a release act**. It produces no version, no tag, and no outward signal; it simply moves the consumer's frozen reference forward to a newer, re-verified commit of the source. Because the pin always follows a check, the consumer never silently advances onto an unverified head — re-blessing without re-checking would merely hide drift ([28-drift.md](/specification/drift/)). The internal stage thus has its own forward motion that is entirely independent of releasing.

---

## Vestigial Releases Fall

A release **exists only when an outward repository actually ships.** The pre-existing unused versions — cut for artefacts no consumer installed — are **retired**: they signalled a shipment that never happened, and keeping them around invites a consumer to depend on a tag that means nothing.

The governing rule is that a version is a claim about an outward shipment. Where no shipment occurred, the version is a false claim and is removed. Going forward a Release is minted at the moment an outward artefact ships and at no other moment; the count of live releases tracks the count of real shipments, not the count of repositories.

---

## Pinning Caveats — Age Guards and Private Access

Two operational caveats bound the SHA-pinning approach.

- **A registry age-guard does not cover git-SHA pins.** A registry `min-release-age` guard — the rule that delays consuming a freshly published registry version until it has aged — applies **only to registry installs**, not to git-SHA pins. A SHA pin resolves a commit directly from the source repository and bypasses the registry entirely, so the age guard never sees it. The mitigation is a discipline, not a tool: **pin only reviewed SHAs.** The reviewer is the age guard's stand-in — a pin advances to a commit that a fresh-context check has actually inspected, never to an arbitrary head.
- **Private sources need authenticated access.** A pin into a private repository resolves over an authenticated transport — SSH or a token — because the consuming build must be able to fetch the exact commit. A public-by-default posture does not change this: where a source is private, the pin only resolves for an actor holding the credential.

---

## The CLI Release Is Gated on a Decoupling Prerequisite

The CLI is named as an outward artefact, but it is **not yet releasable as a standalone install.** Its code imports across repository boundaries by **relative path** — it reaches into sibling repositories through the filesystem rather than through a declared, installable dependency. A standalone install has no sibling repositories beside it, so those relative imports would not resolve. A real CLI Release is therefore **gated on a prerequisite**: the CLI must first be **decoupled** so it depends on its siblings through declared, resolvable dependencies rather than relative paths.

This prerequisite is **explicitly deferred**, and the deferral is handled by the system's own rule for deferred scope: deferred work is **parked as a research note** (a research record under the project's context store), **never spun out as a follow-up artefact of its own**. The decoupling research is the parked note; the CLI Release stays gated behind it until the work is done. Naming the gate openly — rather than cutting a premature CLI Release that cannot actually be installed — is the honest position: the artefact is outward-classed in principle and release-blocked in practice, and the chapter says so rather than pretending the prerequisite away.

---


<!-- IMPLEMENTED-BY — rendered backlink lives in the dist (generated/bridge/<family>/<stem>.backlink.md); source stays authored-only (F2 Dist-Split) -->
## Related

- [16-git-security-versioning.md](/specification/git-security-versioning/) — the deterministic git flow, the commit-is-not-push rule, and the security gate that governs what leaves a repository.
- [33-maintenance.md](/specification/maintenance/) — the provenance pin and the gated re-bless flow that advances an internal SHA pin without a release.
- [17-git-workflow-and-ids.md](/specification/git-workflow-and-ids/) — git as backup and findability rather than a deployment trigger, and the work-package ID trail.
- [19-internal-vs-external-communication.md](/specification/internal-vs-external-communication/) — the inward/outward axis that decides which artefacts earn a Release and which stay SHA-pinned.
