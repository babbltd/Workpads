# Workpads Development Rules

These rules apply to all work across all Workpads repos. They exist to keep implementations aligned with the standard, deviations visible, and decisions traceable.

---

## 1. The Standard Governs

`workpads-standard/` is the source of truth for all normative decisions. When implementation and standard conflict, change the implementation. When the standard is silent, document the decision and feed it back to the standard.

No implementation may claim conformance to a section it does not implement faithfully. If faithful implementation is not feasible, register a deviation.

---

## 2. Deviations Must Be Registered Before Shipping

If an implementation diverges from the standard:

1. Write a deviation entry in `workpads/conformance-tests/deviation-registry.md` with a stable ID (`DEV-WP-NNN`), the BASICS rule being deviated from, the enabling rule (if any), the semantic claim, and the rationale.
2. Add the deviation to `conformance-tests/BASICS-claim.yaml` under `deviations:`.
3. Do not ship the deviating behavior before the registration is committed.

Unregistered deviations are bugs, not features.

---

## 3. Decisions Must Be Logged

Any architectural, protocol, or design decision that is not already settled by the standard must be logged in `workpads-basicsconform/system/logs/decisions.md` before the decision is implemented. The log entry must include the decision, the rationale, and which repos are affected.

This applies to:
- New fields or compact key assignments
- Changes to the codec (including version bumps)
- Storage behavior changes
- Any choice that will affect interoperability across repos

---

## 4. Codec Is Versioned and Backwards-Compatible

The canonical codec is bitpad-v1 (fflate DEFLATE + base64url), implemented in `workpads-codec/`. The version flag in the encoded payload is `v=1`.

- Do not change the v=1 encoding format. Any change is a new version (`v=2`).
- All decoders must remain able to decode v=1 payloads.
- Codec changes originate in `workpads-codec/` and are then synchronized to KaiOS and web app implementations via `workpads-standard/codec-sync.md`.
- The canonical URL tag is `1ag/`. Do not introduce or propagate alternative URL scheme tags.

---

## 5. The `/p` Receiver Must Always Decode Conformant URLs

`workpads.me/p` is a public endpoint. Any URL that conforms to §5 of the standard must decode correctly on `/p`. Changes to the receiver or the codec that would break existing conformant URLs require an explicit decision entry and a migration path.

---

## 6. Field Names Follow §3 and DEV-WP-001

New fields must:
- Use short, plain English, role-neutral names
- Avoid role-specific terms (`technician`, `operator`, `client` — use `worker`, `customer`)
- Assign a compact key at definition time (one or two lowercase letters)
- Be added to the compact key registry in `conformance-tests/deviation-registry.md`
- Be added to `workpads-standard/record-schema.md` before use in production

---

## 7. Offline-Only in v0.1

No sync. No server calls from the app. No network requests in the record or storage layer. This is an architectural decision (decisions R1-2, R1-9), not a missing feature. Do not add sync behavior to v0.1 code. Sync is v0.2 scope.

---

## 8. Paused Work Stays Paused

The following are explicitly deferred. Do not implement or re-open without a new decision entry:

- Legacy vs modern codec branching
- Encryption at rest or in transit
- Strict URL size enforcement
- Sync, conflict detection, conflict resolution (Field tier — v0.2)
- KaiOS 2.5 build target (v0.2)
- `compatibility-policy.md` — deferred until after first v0.1 build ships

If you believe a paused item should be reopened, write a decision entry with the rationale and get it agreed before writing code.

---

## 9. Cross-Repo Changes Follow a Sequence

When a change affects more than one repo:

1. Update `workpads-standard/` first (if the change is normative).
2. Update `workpads-codec/` next (if the change affects encoding).
3. Update implementations (`workpadskaios/`, `workpadsdotme/`, `workpads-cli/`) after the spec and codec are settled.
4. Update evidence artifacts in `workpads/conformance-tests/` if the change affects conformance posture.
5. Update `workpads/STATUS.md` to reflect the new state.

Never implement in a client repo first and backfill the standard later.

---

## 10. Active Priority Is workpadsdotme

`workpadsdotme` is the current build priority. When allocating effort across repos, default to work that unblocks or advances `workpadsdotme`. Changes in other repos that are not required for `workpadsdotme` should be deferred unless they are standard corrections.

---

## 11. BASICS Conformance Posture

The project claims BASICS Core tier (v0.1.1). Any work that would weaken or contradict this claim must be reviewed against `conformance-tests/BASICS-claim.yaml` before merging. The evidence artifacts in `conformance-tests/` must be kept current with the actual implementation state.

Field tier requirements (BASICS-SC-042, SC-043, SW-020, SW-021) are explicitly deferred to v0.2. Do not add them to the v0.1 claim.
