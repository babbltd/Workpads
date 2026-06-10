# Workpads Deviation Registry

**BASICS rule:** BASICS-EVID-004, BASICS-SC-055, BASICS-DEV-POL-001 through DEV-POL-004
**Version:** v1 — 2026-04-26
**Spec version:** BASICS v0.1.1

---

## Policy

All normative deviations from BASICS requirements are registered here. Each deviation has:
- A stable deviation ID (DEV-WP-NNN)
- The BASICS rule(s) being deviated from
- The enabling rule (if BASICS explicitly permits this deviation class)
- The semantic claim: what the implementation preserves despite the surface difference
- The mapping document or evidence artifact
- Lifecycle status

Deviations registered here are acknowledged, intentional, and documented — not gaps or oversights.

---

## DEV-WP-001 — Naming Surface Convention (Synonyms and Short Forms)

**Status:** Active
**BASICS rule(s):** BASICS-SC-001 (documented command surface with stable semantics)
**Enabling rule:** BASICS-SC-055 — "Naming deviations are permitted when semantics are preserved and deviation metadata is registered."
**Registered:** 2026-04-26

**Description:**
Workpads field names, method names, and identifiers use concise, role-neutral synonyms or short forms rather than the descriptive precision preferred in BASICS standard vocabulary. For example:
- `worker` instead of `technician_name` or `operator_identifier`
- `job` instead of `command` or `work_order_descriptor`
- `story` instead of `narrative_evidence_record`

**Semantic claim:**
All workpads names correspond exactly to BASICS standard concepts. Semantics are fully preserved. The deviation is naming surface only — any system that can map workpads names to their BASICS counterparts via the published table can consume workpads records with full semantic fidelity.

**Rationale:**
BASICS names tend toward descriptive precision appropriate for cross-domain standards documentation. Workpads serves field workers on constrained devices — names must be short, typeable, memorable, and free of role assumptions. A plumber, nurse, delivery driver, and HVAC technician all use workpads; none should see a field labelled "technician_name". Role-neutral, plain-English names reduce friction and cognitive load.

**Mapping document:**
`workpads-basicsconform/system/config/basics-naming-commentary.md` — full mapping table (13 fields), naming rationale, naming rules for future fields, and proposed BASICS amendment to BASICS-SC-001 to make this a first-class supported pattern.

**workpads-standard reference:**
`workpads-standard/naming-convention.md` — normative naming convention section (§3).

**Compact key registry — svc-basic core fields (v0.1, bits 0–11):**

| Workpads Field | Compact Key | Frame Bit | BASICS Concept |
|----------------|-------------|-----------|----------------|
| `job` | `j` | 0 | command / work-order descriptor |
| `customer` | `c` | 1 | operator-designated recipient |
| `date` | `d` | 2 | record timestamp / event date |
| `location` | `l` | 3 | deployment site / operator context |
| `meeting_time` | `mt` | 4 | scheduled activation time |
| `start_time` | `st` | 5 | work commencement timestamp |
| `end_time` | `et` | 6 | work completion timestamp |
| `customer_phone` | `cp` | 7 | operator contact reference |
| `worker` | `w` | 8 | assigned operator / executing agent |
| `actions[]` | — | 9 | command sequence (actions block, not scalar) |
| `actions[].title` | `at` | — | command sequence step |
| `actions[].notes` | `an` | — | command sequence step notes |
| `details` | `de` | 10 | field observation record |
| `story` | `sy` | 11 | narrative evidence record |

**Compact key registry — financial block (codebook b, bit 12):**

Implemented in `workpadsdotme/js/lib/codec.js` as codebook b (`1bg/` scheme tag). Bit 12 is a single `FIN` flag gating a structured binary financial block. Bits 13–15 are freed for future use (participants, etc.). Pending formal promotion to `workpads-codec/` and `workpads-standard/codec.md` in v0.2.

**Scheme tag:** `1bg/` (version 1, codebook b, deflate). Codebook a (`1ag/`) remains decodable for backwards compatibility.

**Financial block structure (when bit 12 set):**

```
[uint8 fin_flags]
  0x01: record_type  → uint8 enum (0=quote,1=invoice,2=expense,3=payment; 255=custom [uint16+UTF-8])
  0x02: currency     → uint8 enum (0=GBP,1=USD,2=EUR,3=CAD,4=AUD,5=NZD,6=ZAR; 255=custom [uint16+UTF-8])
  0x04: vat          → uint8 enum (0=0,1=5,2=7.5,3=10,4=12.5,5=15,6=20,7=23,8=25; 255=custom [uint16+UTF-8])
  0x08: amount       → [uint16 len][UTF-8 bytes]
  0x10: expenses     → [uint8 count] + per item: [uint8 item_flags][uint16+amount][job?][date?][billing_enum?][actionIdx?]
  0x20: payments     → [uint8 count] + per item: [uint8 item_flags][uint16+amount][job?][date?]
```

Item flags: `0x01`=has_job, `0x02`=has_date, `0x04`=has_billing, `0x08`=has_actionIdx, `0x10`=is_viewer.

Full URL: `workpads.me/p#1bg/{deflate+base64url}&c={chainRef}`

**Lifecycle:** DEV-WP-001 is expected to become unnecessary if BASICS-SC-001 is amended to include a "naming surface flexibility" provision (proposed in basics-naming-commentary.md). Until then, DEV-WP-001 is the formal registration of this convention. The financial block (codebook b) is implemented in `workpadsdotme` and will be promoted to `workpads-codec/` and `workpads-standard/codec.md` before the v0.2 release.

---

## Pending Deviations

None at this time. Future deviations (e.g., Field tier deferral of SC-042/SC-043 for v0.1) are documented in `degraded-mode-matrix.md` as intentional scope decisions but do not constitute normative deviations from claimed tier requirements (Core tier does not require sync).
