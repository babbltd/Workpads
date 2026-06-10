# Workpads — Repo Map

All repositories in the Workpads ecosystem. For a quick reference see `CLAUDE.md`. This file has the detail.

---

## Normative

### `workpads-standard`
The normative specification for all Workpads implementations. When implementation and standard conflict, the standard governs.

Eight numbered core sections (PADS model, record schema, naming convention, RecordService interface, codec, storage adapter, two-build strategy, BASICS conformance mapping) plus extended specs for chain protocol, financial block, participants block, activity profile, and panel access model. Extended specs cover features in implementation or scheduled for v0.2.

**Version:** v0.1 (2026-04-27)  
**Key files:** `codec.md` (§5), `record-schema.md` (§2), `record-service.md` (§4), `naming-convention.md` (§3), `ECOSYSTEM.md` (full ecosystem map), `codec-sync.md` (cross-repo codec sync protocol)

---

## Implementations

### `workpadskaios`
The primary v0.1 implementation. KaiOS 3.x feature phone app: 240×320px, D-pad navigation, ES5, no build step. Implements the full standard via a two-engine design (Exchange Engine: RecordService, ActivityService, BlockRegistry; Learning Engine: PersonalService, PersonalPanel).

**Known deviation:** DEV-WP-URL-001 — uses `alg=bitpad-v1&v=1&d=...` URL scheme tag instead of canonical `1ag/`. Fix targeted for v0.2.  
**State:** v0.1 — stable; no active build changes until URL fix scope is confirmed.

### `workpadsdotme`
The browser reference implementation at `workpads.me`. Same JS service layer as KaiOS, adapted for mouse and keyboard with a three-column desktop layout. The `/p` route decodes any conformant URL without requiring the app. **This is the active build priority.**

**State:** active build — `/p` receiver done; main app screens (list, wizard, view, share, management) in progress.  
**Key file:** `PLAN.md` — screen-by-screen build state.

### `workpads-cli`
CLI reference implementation. Implements the full §4 RecordService surface as shell commands. v0.x uses a legacy encoding (deflate-raw + base64url without bitpad-v1 framing). v0.2 will replace encoding with `@workpads/codec` for full interoperability.

**State:** v0.x — functional but not codec-interoperable with KaiOS or web.

---

## Codec

### `workpads-codec`
The `@workpads/codec` npm package. Canonical JavaScript implementation of the §5 bitpad-v1 codec. Node.js and browser builds are byte-for-byte compatible — a URL produced by either can be decoded by the other. Exports `encode`, `decode`, `validate`.

**State:** v0.1 — stable. Needs its own GitHub repo (`babbworks/workpads-codec`) before npm publish.  
**Depends on:** fflate (~8KB), no other runtime deps.

---

## Tooling

### `workpadsdev-cli`
Developer build toolchain for KaiOS apps. Four commands: `build:3.0` (packages KaiOS 3.x `.zip`), `build:2.5` (v0.2 stub), `set-keys` (validates `softkeys.yaml`), `conform` (runs WP-CONF-001–004 conformance checks). Exit codes follow BASICS-cli convention.

**State:** v0.1 — stable. Depends on `@workpads/codec` via local file path.

---

## Research & Process

### `workpads-basicsconform`
Internal research control plane. Quiz rounds, decision log (`system/logs/decisions.md`), deviation registry, and role/gate definitions drive design decisions. Decisions made here are promoted to `workpads-standard/` as normative spec sections. Contains `REFS/` directory with read-only copies of BASICS-standard and BASICS-cli for reference.

**Audience:** internal — external implementors do not need to consult this repo.  
**Key output:** decision entries feed `workpads-standard/`; deviation entries feed `workpads/conformance-tests/deviation-registry.md`.

---

## Web Presence

### `workpads-gh`
Jekyll site at `standard.workpads.org`. Public-facing home for the Workpads Standard. Links to `workpads.app` and `workpads.me`. Separate from the normative spec files — this is the human-readable presentation layer.

### `workpads.org`
Jekyll site at `workpads.org`. General public presence. Minor cleanup needed (placeholder GitHub URL in Jekyll config).

### `workpadsapp`
Jekyll site at `workpads.app`. App product landing page with blog-style update posts.

---

## Other

### `workpads` (this repo)
Orchestrator. Rules (`RULES.md`), agent orientation (`CLAUDE.md`), cross-repo status (`STATUS.md`), this repo map, and the original pre-2026 architecture and protocol design documents. The architecture and protocol directories are historical reference — they informed but do not supersede `workpads-standard/`.

Also contains the original `workpads.js` CLI implementation (v0.x, ~1800 lines) and BASICS conformance evidence artifacts in `conformance-tests/`.

### `workpads-pitch`
Investor and stakeholder pitch deck (GitBook structure). Covers problem, market, solution, product, advantage, vision, team, roadmap, and finances. Not under active technical development.
