# Cross-Repo Decisions

This file summarizes the key decisions that affect multiple repos. The full decision log lives in `workpads-basicsconform/system/logs/decisions.md`. Entries here are those with cross-repo impact — they are pointers, not replacements.

---

## Architecture Decisions

### R1-2 — Offline-Only in v0.1
v0.1 is offline-only by architectural decision. No sync, no server calls from the app, no network requests in the record or storage layer.

**Affects:** workpadskaios, workpadsdotme, workpads-cli  
**Defers:** Field tier requirements (BASICS-SC-042, SC-043, SW-020, SW-021) → v0.2

### R1-8 — Auto-Save on Screen Transition
Records are auto-saved to localStorage on every screen transition, not on keystroke. Acceptable loss window: at most one screen of changes.

**Affects:** workpadskaios, workpadsdotme

### R1-9 — No Sync in v0.1
Sync is not a v0.1 feature. Single-user, single-device model is the explicit v0.1 scope.

**Affects:** All implementations

### R3-9 — Both Repos Must Pass Dirty Test for Full Conformance Claim
The full BASICS Core conformance claim requires that both `workpads` (reference architecture) and `workpadskaios` (primary implementation) pass the dirty-test baseline. A claim against the reference architecture alone is not sufficient.

**Affects:** workpads-basicsconform, workpads, workpadskaios

---

## Codec Decisions

### Codec Version Flag is v=1
The bitpad-v1 encoding format is locked. Any change to the encoding is a new version (v=2) and must remain backwards-compatible at decode. New versions are introduced via the version flag in the payload.

**Affects:** workpads-codec, workpadskaios, workpadsdotme, workpads-cli

### Canonical URL Tag is `1ag/`
All new implementations must use the `1ag/` URL scheme tag. The `alg=bitpad-v1&v=1&d=...` format used by `workpadskaios` v0.1 is a registered open deviation (DEV-WP-URL-001) targeted for fix in v0.2.

**Affects:** workpadskaios (fix in v0.2), workpadsdotme (uses canonical tag), workpads-cli (v0.2 migration)

---

## Field/Schema Decisions

### DEV-WP-001 — Naming Surface Convention
Field names use short, plain English, role-neutral synonyms rather than BASICS descriptive precision. All names map exactly to BASICS concepts. Registered as a formal deviation.

**Affects:** All implementations, workpads-standard/naming-convention.md

### Compact Key Registry is Authoritative
The compact key table in `conformance-tests/deviation-registry.md` and `templates/runtime/svc-basic.v2.json` is the canonical mapping. Any new field must have a compact key assigned at definition time.

**Affects:** workpads-codec, workpads-standard, all implementations

---

## Financial Encoding Decisions

### Financial Block in Codebook b (bit 12, scheme tag 1bg/)
All financial data — scalars (`amount`, `currency`, `vat`, `record_type`) and line items (expenses, payments) — are encoded as a single structured binary block within the main pads-v1 frame. Bit 12 is the `FIN` flag; when set, a binary financial block follows the high scalar fields. Bits 13–15 are freed for future use.

The scheme tag changes from `1ag/` (codebook a) to `1bg/` (codebook b). Codebook-a URLs remain decodable for backwards compatibility.

**Financial block structure:**
```
[uint8 fin_flags]
  0x01: record_type  enum byte (255=custom string)
  0x02: currency     enum byte (255=custom string)
  0x04: vat          enum byte (255=custom string)
  0x08: amount       [uint16+UTF-8]
  0x10: expenses     [uint8 count] + per-item: [uint8 item_flags][amount][job?][date?][billing?][actionIdx?]
  0x20: payments     [uint8 count] + per-item: [uint8 item_flags][amount][job?][date?]
```
Item flag `0x10` = `is_viewer` (viewer-added expense).

**Rationale:** Integrating all financial data into a single deflate context allows LZ77 to deduplicate repeated strings (e.g., job labels appearing in both the main record and line items). Enum bytes compress high-cardinality strings (`currency`, `vat`, `record_type`) to a single byte. No separate `&f=` URL parameter needed.

**Status:** Implemented in `workpadsdotme/js/lib/codec.js`, `p/index.html`, `p/customer.html`. Not yet in `workpads-codec/` — pending v0.2 promotion.

**Affects:** workpadsdotme, workpads-codec (v0.2), workpads-standard/codec.md

### Share Types (job/quote/invoice) Are a Share Surface Extension, Not Record Variants
The template `svc-basic.v2.json` defines record variants as `plain` and `social`. The ShareScreen in `workpadsdotme` exposes `job`, `quote`, and `invoice` as share types — these are presentation modes that control what is included in the shared URL (fin block enabled for quote/invoice), not changes to the stored record variant. The stored `record_type` field is encoded as an enum byte in the financial block (fin_flags bit 0x01).

**Rationale:** The variant model (plain/social) governs record structure. Share type is an output presentation decision that doesn't change the record itself. Keeping them separate avoids polluting the record model with UI concerns.

**Affects:** workpadsdotme, workpads-standard/record-schema.md (clarification needed in v0.2)

---

## Chain Protocol Decisions

### Chain Protocol Implemented in workpadsdotme RecordService
`RecordService` generates a `chainRef` (3-byte crypto.getRandomValues → base64url) per record at creation. This ref is included in the share URL as `&c={chainRef}`. The `/p` receiver and `p/customer.html` use it for ACK/approval flow — a viewer who receives a record can encode a response URL referencing the same `chainRef`, allowing the owner to identify which job the response belongs to.

**Standard reference:** `workpads-standard/chain-protocol.md` (v0.2 scope).

**Implementation scope in workpadsdotme:** chainRef generation, storeReceived (import by chainRef), findByChainRef (lookup for approval), expense/payment child records with `parentId`.

**What is not implemented:** Multi-worker pre-seeding, full chain graph traversal — those remain v0.2 spec only.

**Affects:** workpadsdotme, workpads-standard/chain-protocol.md

---

## Participants Decisions

### Participants Array in Wizard — v0.2 Extension, Not in Core Frame
The wizard implements a `participants` array field not present in `svc-basic.v2.json` or the pads-v1 frame. In v0.1, participants are stored locally in the record object but are not encoded into the share URL (no frame bit is assigned). They are visible in the local view only.

**Standard reference:** `workpads-standard/participants-block.md` (v0.2 scope).

**Path to encoding:** v0.2 will assign frame bits or a separate blob for participants, analogous to fin encoding. A compact key will be registered at that time.

**Affects:** workpadsdotme, workpads-standard/participants-block.md

---

## Conformance Decisions

### `compatibility-policy.md` Deferred
The BASICS conformance evidence artifact `compatibility-policy.md` is deferred until after the first v0.1 build ships. It gains credibility when it can cite a real version history. Expected Q3 2026.

**Affects:** workpads-basicsconform, workpads/conformance-tests
