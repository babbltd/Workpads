# Workpads — Status

**Updated:** 2026-05-04

This file tracks the live state of work across all Workpads repos. Update it when priorities shift, blockers are resolved, or new cross-repo issues are found.

---

## Active Priority

### `workpadsdotme` — Browser Web App
The main build focus. Architecture is settled; implementation of app screens is in progress.

- `/p` receiver: **done** — decodes any conformant `1ag/` URL
- List, wizard, view, share, management screens: **in progress**
- Three-column desktop layout: designed, being implemented
- Same JS service layer as KaiOS (RecordService, StorageAdapter, ActivityService, BlockRegistry, PersonalService)

Read `workpadsdotme/PLAN.md` for the current screen-by-screen build state.

---

## Open Issues

### DEV-WP-URL-001 — URL Scheme Tag Mismatch (KaiOS)
`workpadskaios` emits `alg=bitpad-v1&v=1&d=...` instead of the canonical `1ag/` tag.  
URLs produced by KaiOS are **not interoperable** with `workpadsdotme`.  
**Target:** Fix in `workpadskaios` v0.2.  
**Rule:** Do not implement the legacy scheme in any new code.  
**Not yet formally registered** as a BASICS deviation — pending v0.2 scope planning.

---

## BASICS Conformance Claim

| Item | State |
|------|-------|
| Tier | Core, BASICS v0.1.1 |
| Claim file | `conformance-tests/BASICS-claim.yaml` |
| command-surface.md | present |
| event-schema.md | present |
| deviation-registry.md | present — DEV-WP-001 registered |
| degraded-mode-matrix.md | present |
| compatibility-policy.md | **pending** — deferred until after first v0.1 build ships (Q3 2026) |
| Field tier | explicitly deferred to v0.2 (sync, conflict detection) |

---

## Per-Repo State

| Repo | State | Notes |
|------|-------|-------|
| `workpads-standard` | v0.1 live | Normative spec complete for Core tier |
| `workpads-codec` | v0.1 | `@workpads/codec` stable; needs own GitHub repo before npm publish |
| `workpadskaios` | v0.1 | DEV-WP-URL-001 open; v0.2 targeted for URL fix + codec upgrade |
| `workpadsdotme` | active build | Priority; see PLAN.md |
| `workpads-cli` | v0.x | Legacy encoding; v0.2 will adopt `@workpads/codec` |
| `workpadsdev-cli` | v0.1 | Build toolchain + WP-CONF-001–004 conformance runner stable |
| `workpads-gh` | live | `standard.workpads.org` — no active changes needed |
| `workpads.org` | live | Placeholder GitHub URL still in Jekyll config — minor cleanup needed |
| `workpadsapp` | live | `workpads.app` — no active changes needed |
| `workpads-pitch` | static | Not under active development |

---

## Deliberately Paused

These are not gaps — they are explicit deferrals. Do not reopen without a decision entry.

| Item | Deferred to |
|------|-------------|
| Sync / conflict detection / Field tier | v0.2 |
| KaiOS 2.5 build target | v0.2 |
| Encryption | post-v0.1 |
| Strict URL size enforcement | post-v0.1 |
| `compatibility-policy.md` | Q3 2026 (after first v0.1 build ships) |
| Legacy vs modern codec branching | paused indefinitely |
