# Workpads Event Schema

**BASICS rule:** BASICS-EVID-002, BASICS-SC-050, BASICS-SW-002
**Version:** v1 — 2026-04-26
**Spec version:** BASICS v0.1.1
**Status:** Draft — aligned with svc-basic v2 field set

---

## Purpose

This document defines the event types produced and consumed by the Workpads application. Events are the observable state transitions of a workpad record. They form the interoperability baseline for any system that produces, consumes, or archives workpads records.

---

## Event Model

Workpads uses a simple, flat event model. Each event has:

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Event type identifier (see registry below) |
| `version` | string | Schema version this event conforms to (e.g. `"v2"`) |
| `recordId` | string | Stable identifier for the workpad record |
| `templateId` | string | Template in use (e.g. `"svc-basic"`) |
| `timestamp` | string | ISO 8601 timestamp of the event |
| `source` | string | System that produced the event (`"app"`, `"cli"`, `"import"`) |
| `payload` | object | Event-specific data (see per-event schema below) |

---

## Event Registry

### `record.created`

Emitted when a new workpad record is created.

```json
{
  "event": "record.created",
  "version": "v2",
  "recordId": "...",
  "templateId": "svc-basic",
  "timestamp": "2026-04-26T09:00:00Z",
  "source": "app",
  "payload": {
    "fields": { "job": "...", "customer": "..." }
  }
}
```

### `record.updated`

Emitted when one or more fields of a record are changed.

```json
{
  "event": "record.updated",
  "version": "v2",
  "recordId": "...",
  "templateId": "svc-basic",
  "timestamp": "2026-04-26T09:15:00Z",
  "source": "app",
  "payload": {
    "changes": { "end_time": "14:30", "story": "..." }
  }
}
```

### `record.deleted`

Emitted when a record is removed from local storage.

```json
{
  "event": "record.deleted",
  "version": "v2",
  "recordId": "...",
  "templateId": "svc-basic",
  "timestamp": "2026-04-26T09:20:00Z",
  "source": "app",
  "payload": {}
}
```

### `record.shared`

Emitted when a record is encoded into a share link or QR code.

```json
{
  "event": "record.shared",
  "version": "v2",
  "recordId": "...",
  "templateId": "svc-basic",
  "timestamp": "2026-04-26T09:25:00Z",
  "source": "app",
  "payload": {
    "method": "qr" | "clipboard",
    "codecVersion": "v2",
    "encodedLength": 3840
  }
}
```

### `record.imported`

Emitted when a record is decoded from a share link.

```json
{
  "event": "record.imported",
  "version": "v2",
  "recordId": "...",
  "templateId": "svc-basic",
  "timestamp": "2026-04-26T09:30:00Z",
  "source": "import",
  "payload": {
    "codecVersion": "v2",
    "origin": "share-link"
  }
}
```

---

## Versioning

Events carry a `version` field corresponding to the template schema version. The codec uses a `v=N` query parameter for the same purpose (see compatibility-policy.md when available). Unknown non-critical event fields are safely ignored per BASICS-SC-052.

---

## Field Tier Deferral Note

Sync-related event types (`record.sync_queued`, `record.conflict_detected`, `record.merged`) are deferred to v0.2 when sync infrastructure is introduced. These events correspond to Field tier requirements (BASICS-SC-042, BASICS-SC-043). They are defined here as reserved event names; implementations MUST NOT use these names for other purposes.

**Reserved for v0.2+:** `record.sync_queued`, `record.sync_completed`, `record.conflict_detected`, `record.conflict_resolved`, `record.merged`

---

## Conformance Notes

This schema satisfies:
- `BASICS-EVID-002` — standalone event schema artifact published
- `BASICS-SC-050` — event schema published as interoperability baseline
- `BASICS-SW-002` — event contracts versioned with compatibility notes
