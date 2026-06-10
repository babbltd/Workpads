# Workpads — Agent Orientation

This is the orchestrator repo for the Workpads project. Read this file before touching anything.

---

## What Workpads Is

A job-record system built around a single durable unit: the workpad. Records encode to compact URLs (`workpads.me/p#1ag/...`) using bitpad-v1 — fflate DEFLATE + base64url — and travel without a server. The data model is PADS (Processes, Actions, Details, Story). The product serves field workers on constrained devices. Simplicity is a hard requirement.

---

## Repo Map

| Repo | Role | State |
|------|------|-------|
| `workpads` (this) | Orchestrator. Rules, status, architecture docs, original design archive | active |
| `workpads-standard` | **Normative spec** — all implementations measured here. §1–§8 core, extended specs for chain/financial/participants | v0.1 live |
| `workpads-basicsconform` | Research control plane. Quiz rounds, decision log, deviation registry feed `workpads-standard` | internal |
| `workpads-codec` | `@workpads/codec` npm package. Canonical JS implementation of §5 (bitpad-v1). Node + browser builds are byte-for-byte compatible | v0.1 |
| `workpadskaios` | KaiOS 3.x app. Primary v0.1 implementation. D-pad nav, 240×320px, ES5, no build step | v0.1 |
| `workpadsdotme` | `workpads.me` browser app. **Active build priority.** Three-column layout, same service layer as KaiOS, `/p` receiver already live | active build |
| `workpads-cli` | CLI reference impl. v0.x uses legacy encoding; v0.2 will switch to `@workpads/codec` | v0.x |
| `workpadsdev-cli` | Build toolchain + conformance runner for KaiOS. Runs WP-CONF-001–004 | v0.1 |
| `workpads-gh` | `standard.workpads.org` Jekyll site — public web presence for the standard | live |
| `workpads.org` | `workpads.org` Jekyll site — general public presence | live |
| `workpadsapp` | `workpads.app` Jekyll site — app product landing page | live |
| `workpads-pitch` | Investor pitch deck (GitBook). Non-technical | static |

---

## Active Priority

**`workpadsdotme`** — browser web app build-out. Read `workpadsdotme/PLAN.md` first. The `/p` receiver is done; the main app (list, wizard, view, share, management screens) is in progress. Three-column desktop layout. Same JS service layer as KaiOS (RecordService, StorageAdapter, ActivityService, BlockRegistry, PersonalService).

---

## The Standard Governs

`workpads-standard/` is the source of truth. When implementation and standard conflict, the standard is right and the implementation needs to change — not the other way around. If the standard is silent, document the decision and feed it back.

Key standard files:
- `workpads-standard/codec.md` — §5, bitpad-v1 encoding. Canonical.
- `workpads-standard/record-schema.md` — §2, svc-basic field definitions
- `workpads-standard/record-service.md` — §4, RecordService interface
- `workpads-standard/naming-convention.md` — §3, field naming rules (see DEV-WP-001)

---

## Known Deviations

### DEV-WP-001 — Naming Surface (Active, Registered)
Workpads uses short, role-neutral field names (`worker`, `job`, `story`) instead of BASICS descriptive names. Semantics are fully preserved. Registered in `conformance-tests/deviation-registry.md`. Compact key table is the authoritative mapping.

### DEV-WP-URL-001 — URL Scheme Tag Mismatch (Open, Unregistered)
`workpadskaios` emits `alg=bitpad-v1&v=1&d=...` instead of the canonical `1ag/` tag specified in `workpads-standard/codec.md`. URLs are not interoperable between KaiOS and `workpadsdotme`. Targeted for fix in KaiOS v0.2. Do not implement the legacy scheme in new code.

---

## BASICS Conformance Claim

- **Tier:** Core, BASICS v0.1.1
- **Claim file:** `conformance-tests/BASICS-claim.yaml`
- **Evidence artifacts:** `conformance-tests/` — command-surface.md, event-schema.md, deviation-registry.md, degraded-mode-matrix.md
- **Pending:** `compatibility-policy.md` — deferred until after first v0.1 build ships (Q3 2026)
- **Field tier explicitly deferred:** Sync, conflict detection, conflict resolution → v0.2

---

## Architecture Constraints

- **Offline-only in v0.1.** No sync. No server calls from the app. Decision R1-2, R1-9 in `workpads-basicsconform/system/logs/decisions.md`.
- **No encryption in v0.1.** Intentionally paused.
- **Codec version flag is v=1.** Any encoding change must bump to v=2 and remain backwards-compatible at decode.
- **`/p` receiver must decode any conformant URL.** Do not break it.
- **Two-build strategy (§7):** KaiOS 3.x is build A, web is build B. Same service layer, different shells.

---

## Field Naming Rules

New fields follow §3 / DEV-WP-001:
- Short, plain English, role-neutral
- No underscores unless compound (`meeting_time`, `start_time`)
- Assign a compact single-letter or two-letter key at definition time
- Add to the compact key registry in `conformance-tests/deviation-registry.md`

---

## Where Things Go

| What | Where |
|------|-------|
| Normative spec changes | `workpads-standard/` |
| Research decisions | `workpads-basicsconform/system/logs/decisions.md` |
| Deviation registration | `conformance-tests/deviation-registry.md` + `BASICS-claim.yaml` |
| Cross-repo status / open issues | `workpads/STATUS.md` (once created) |
| Build tooling / conformance checks | `workpadsdev-cli/` |
| Codec changes | `workpads-codec/` → then sync to KaiOS and web app |

---

## What Is Deliberately Paused

Do not implement or re-open without an explicit decision:
- Legacy vs modern codec branching
- Encryption
- Strict URL size enforcement
- Sync / Field tier features (v0.2 scope)
- KaiOS 2.5 build target (v0.2 scope)
