# Workpads KaiOS — Command Surface

**BASICS rule:** BASICS-EVID-001, BASICS-SC-001, BASICS-SC-002, BASICS-SC-012
**Version:** v1 — 2026-04-26
**Spec version:** BASICS v0.1.1
**Applies to:** workpads KaiOS app (both v2.5 and v3.0 builds)

---

## Purpose

This document defines the stable command surface of the Workpads KaiOS application. BASICS-SC-001 requires that tools expose a documented command surface with stable semantics. For a GUI mobile application, the command surface is the set of user-facing actions with defined, stable behavior.

---

## Command Surface Overview

Workpads is a field record creation and sharing application. Its command surface is organized into five operation classes:

| Class | Commands | Soft Key / D-pad action |
|-------|----------|------------------------|
| **create** | Create new workpad | RSK on list screen |
| **view/render** | View saved workpad | CSK on list item |
| **edit** | Edit workpad fields | CSK on view/field |
| **share/export** | Generate QR code or copy share link | RSK on share screen |
| **import** | Decode a shared workpad link | Via URL or QR scan |
| **list/query** | Browse saved workpads | Default app state (list screen) |
| **delete** | Delete a workpad record | Menu option on view screen |
| **policy:get/set** | Manage app settings (worker default name, warmup toggle) | Management screen |
| **status/health** | Storage usage indicator | Visible in management screen |

---

## Command Definitions

### create
**Surface:** RSK soft key on the workpad list screen (label: "New")
**Semantics:** Opens the 4-screen PADS wizard beginning at Screen 1 (Process fields). Pre-fills worker name from `workerNameDefault` if set. Optionally runs warmup (2–3 guided questions) if `warmupEnabled` is true.
**Stable:** This is the primary creation path. Its existence and behavior will not change without a version bump.

### view/render
**Surface:** CSK soft key (label: "Open") on a list item, or direct navigation to a record
**Semantics:** Renders the workpad record as a read-only compiled view. Shows all fields with their labels. Does not modify the record.
**Stable:** Always read-only; transitions to edit mode require a separate action.

### edit
**Surface:** CSK soft key (label: "Edit") on view screen, or navigating back into the PADS wizard screens
**Semantics:** Reopens the PADS wizard at Screen 1 with existing values pre-filled. Auto-saves on each screen transition. All 13 fields are editable.
**Stable:** Full record edit is always available; no field is locked post-creation.

### share/export
**Surface:** RSK soft key (label: "Share") on view screen or wizard completion
**Semantics:** Encodes the record using the compact codec (fflate + base64url, schema version v2) into a share URL. Displays both a QR code and a "Copy link" option. User chooses method.
**Stable:** Two share methods (QR + clipboard) always present. Encoded format: schema version v2.

### import
**Surface:** Invoked by opening a workpads share URL (deep link) or via a "Scan QR" option
**Semantics:** Decodes the compact URL, validates the schema version, and creates a new local record from the decoded fields. User is shown a preview before save.
**Stable:** Always creates a new record; never overwrites an existing one silently.

### list/query
**Surface:** Default app screen after launch
**Semantics:** Shows all locally stored workpad records in reverse-chronological order. D-pad Up/Down navigates. No filter or search in v0.1.
**Stable:** List is always the default view. Search/filter deferred to v0.2.

### delete
**Surface:** Menu option accessible via LSK (label: "Options") on view screen → "Delete"
**Semantics:** Confirms deletion with a dialog (CSK = confirm, LSK = cancel). Removes record from localStorage. Irreversible.
**Stable:** Confirmation dialog is mandatory (BASICS-SC-022 — destructive operations are explicit).

### policy:get/set (management screen)
**Surface:** Management screen accessible from list screen via LSK → "Settings"
**Semantics:**
- `workerNameDefault` — get/set the default worker name that pre-fills all new records
- `workerNameHistory` — view and edit the list of all worker names used
- `warmupEnabled` — toggle the warmup guided-entry flow on/off
- `clear` — wipe all records (with double-confirmation)
**Stable:** These settings keys will remain across versions; values are user-controlled.

### status/health
**Surface:** Storage usage bar/count visible in management screen
**Semantics:** Shows number of records stored and approximate localStorage usage. Warns when approaching 80% of 5 MB limit.
**Stable:** Operator-visible storage status present from v0.1.

---

## Typologies (BASICS-SC-010)

Workpads implements the following universal typologies:
- **records** — workpad records (created, stored, edited, shared, imported)
- **actions** — the `actions[]` field within a record; also the action class above
- **times** — `start_time`, `end_time` fields; duration calculation
- **profiles** — worker name default + warmup settings
- **events** — see `event-schema.md`

---

## Stability Contract

This command surface is versioned. The semantics of all commands listed above are stable for the v0.1 release line. Changes to command names, removal of commands, or changes to stable semantics require a version bump and migration notes in `compatibility-policy.md` (see BASICS-SC-051).

---

## Conformance Notes

This document satisfies:
- `BASICS-EVID-001` — command surface artifact published
- `BASICS-SC-001` — documented command surface with stable semantics
- `BASICS-SC-002` — primary UI actions map to explicit command semantics
- `BASICS-SC-012` — canonical command classes covered: create, edit, view/render, list/query, share/export, import, delete, policy:get/set, status/health
