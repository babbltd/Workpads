# Workpads Degraded-Mode Behavior Matrix

**BASICS rule:** BASICS-EVID-005, BASICS-SC-040, BASICS-SC-041, BASICS-SC-044
**Version:** v1 — 2026-04-26
**Spec version:** BASICS v0.1.1
**Applies to:** workpads v0.1 (KaiOS 2.5 + 3.0, offline-only builds)

---

## Baseline Operating Mode

**v0.1 is offline-only by design.** There is no sync, no server dependency, no network calls during normal operation. The "degraded" mode for most field-deployed tools is the baseline mode here: local-only, self-contained, persistent to localStorage.

This means several BASICS degraded-mode requirements that assume an online baseline are trivially satisfied in v0.1 — the app always operates in what other tools would call "degraded" mode.

---

## Degraded-Mode Matrix

| Failure Condition | v0.1 Behavior | BASICS Rule | Notes |
|-------------------|--------------|-------------|-------|
| **Network loss** | No impact. App is offline-only; no network calls exist in v0.1. | SC-041 | ✓ Satisfied by design |
| **Low storage (localStorage approaching 5 MB)** | RecordService.save() fails with explicit `STORAGE_FULL` error. UI blocks screen transition and displays storage warning. User must delete records before continuing. | SC-040 | ✓ Explicit error surface required |
| **App terminated under memory pressure (KaiOS)** | Auto-save on every screen transition (R1-8) ensures at most one screen of unsaved changes is lost. RecordService writes to localStorage on transition, not on keystroke. | SC-041, SW-012 | ✓ Durable mutation handling |
| **App crash / unexpected exit** | localStorage is synchronous and crash-safe. Any record that was auto-saved is fully recoverable. Any changes made after the last screen transition (since last auto-save) may be lost. | SW-012 | Acceptable loss window: ≤1 screen of changes |
| **KaiOS device restart** | localStorage persists across restart. App resumes with last saved state. No special recovery flow needed. | SC-041, SW-012 | ✓ |
| **Corrupt localStorage entry** | RecordService.load() catches JSON.parse failures and returns null. UI treats null as "record not found" and does not crash. Corrupted entry is flagged but not silently deleted. | SC-040 | User must manually clear via management screen |
| **Template load failure (corrupt svc-basic JSON)** | TemplateRegistryService throws on schema parse failure. App surfaces explicit error on launch: "Template failed to load." This is a non-recoverable state without a reinstall. | SC-053 | Unknown critical extension fails explicitly |
| **Unknown fields in imported record** | CodecService ignores unrecognized compact keys during decode. Unknown fields are preserved as-is in a `_unknown` map, not silently dropped. | SC-052 | Non-critical extension handling |
| **Share link too long (> 6,000 bytes encoded)** | LinkService returns `LINK_TOO_LONG` error before encoding completes. UI surfaces the error and prompts user to shorten Details or Story fields. No partial link is generated. | SC-040 | Explicit, not silent |
| **QR code generation failure** | Falls back to copy-to-clipboard with notification. Does not crash. | SC-044 | Controlled degraded state with cause shown |
| **Dependency / service loss** | Not applicable in v0.1. All services are embedded in the app bundle. No external dependencies at runtime. | SC-040 | ✓ N/A — no runtime deps |
| **Integrity lock state** | Not implemented in v0.1. Records are always editable by the holder. | SC-040 | Deferred to v0.2+ |

---

## Read-Only Mode

v0.1 does not implement a read-only mode. All records are editable by any holder of the app. This is appropriate for v0.1's single-user, single-device model. If future versions support multi-user sync, read-only mode for conflict resolution would be introduced as a controlled degraded state (BASICS-SC-044).

---

## Field Tier Deferral (Sync and Conflict Behavior)

The following behaviors are **not implemented in v0.1** and are explicitly deferred to v0.2 (Field tier):

| Deferred Behavior | BASICS Rule | v0.2 Planned Approach |
|-------------------|-------------|----------------------|
| Deferred sync queue — durable outbox for accepted mutations | SC-042, SW-011 | Sync queue in IndexedDB; process when network available |
| Conflict detection — deterministic detection of concurrent edits | SC-043, SW-020 | Record-level vector clock or last-write-wins with timestamp comparison |
| Conflict comparison view — operator-visible compare for resolution | SW-021 | Side-by-side diff screen before merge |
| Operator-visible sync status | SW-013 | Sync status indicator in management screen |

**Design intent:** v0.1 is explicitly scoped to offline-only, single-user operation. The absence of sync is an intentional architectural decision (see `decisions.md` R1-2, R1-9), not a gap. Field tier claim is deferred until sync infrastructure is introduced.

---

## Conformance Notes

This matrix satisfies:
- `BASICS-EVID-005` — degraded-mode behavior matrix published
- `BASICS-SC-040` — degraded behavior defined for all applicable failure conditions
- `BASICS-SC-041` — core record create/edit works locally without network (baseline behavior)
- `BASICS-SC-044` — read-only mode as controlled degraded state (not applicable in v0.1; documented)
