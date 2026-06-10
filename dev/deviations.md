# Deviation Summary

Cross-repo view of all deviations from `workpads-standard/` and BASICS.

The canonical registration for BASICS deviations is `conformance-tests/deviation-registry.md` + `conformance-tests/BASICS-claim.yaml`. This file is the summary view — check the registry for full evidence and mapping documents.

---

## Registered Deviations

### DEV-WP-001 — Naming Surface Convention
**Status:** Active, registered  
**BASICS rule:** BASICS-SC-001  
**Enabling rule:** BASICS-SC-055  
**Registered:** 2026-04-26

Workpads uses short, role-neutral field names (`worker`, `job`, `story`, `details`) instead of the descriptive precision preferred in BASICS standard vocabulary. Semantics are fully preserved — every name maps exactly to a BASICS concept via the published compact key table.

**Rationale:** Field workers on constrained devices need names that are short, typeable, and role-neutral. A plumber, nurse, and HVAC technician all use workpads; none should see a field labelled "technician_name".

**Mapping:** `workpads-basicsconform/system/config/basics-naming-commentary.md` — full 13-field mapping table.  
**Standard reference:** `workpads-standard/naming-convention.md` — §3.

**Lifecycle:** Expected to become unnecessary if BASICS-SC-001 is amended to include a naming surface flexibility provision (proposed in basics-naming-commentary.md).

---

## Open Deviations (Not Yet Formally Registered)

### DEV-WP-URL-001 — URL Scheme Tag Mismatch
**Status:** Open, unregistered  
**Affects:** `workpadskaios` v0.1  
**Target:** Fix in workpadskaios v0.2

`workpadskaios` emits URLs with `alg=bitpad-v1&v=1&d=...` instead of the canonical `1ag/` scheme tag defined in `workpads-standard/codec.md`. URLs produced by the KaiOS app are not interoperable with `workpadsdotme` or any other conformant decoder.

**Rule:** Do not implement the legacy scheme in any new code. All new implementations must use `1ag/`.

**Path to registration:** When v0.2 scope is confirmed, register formally as a DEV-WP-002 with the enabling rule (BASICS-SC-055 if semantics are preserved during transition) and a migration path. Alternatively, the fix in v0.2 removes the need for registration.

---

## Explicitly Deferred (Not Deviations)

These are not deviations — they are features outside the v0.1 scope. No registration needed until v0.2 introduces them and any implementation gap must be registered.

| Feature | BASICS Rules | Deferred to |
|---------|-------------|-------------|
| Sync | SC-042, SC-043, SW-013, SW-020, SW-021 | v0.2 (Field tier) |
| Conflict detection | SW-020 | v0.2 |
| Conflict resolution UI | SW-021 | v0.2 |
| Compatibility policy doc | BASICS-EVID-004 | Q3 2026 |
