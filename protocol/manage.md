---
layout:
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: false
---

# Manage

## Intent

Manage record lifecycle under least-trace policy controls while keeping defaults simple.

Detailed policy contract is defined in `protocol/storage-policy.md`.

## Policy Levels

- **Business default policy**: baseline behavior for all new workpads.
- **Per-workpad override**: optional override for specific records.

## Effective Storage Modes

- `ephemeral`: memory/session or short-lived local storage.
- `stored`: explicit persisted local storage.

## Policy Resolution

Effective mode resolution:

1. use per-workpad override if present,
2. otherwise use business default,
3. otherwise fallback to system default (`ephemeral`).

## Lifecycle Operations

- `archive`: hide from default list, keep recoverable state.
- `purge`: permanently remove local record and revisions.
- `expire`: auto-remove by TTL policy in ephemeral mode.

## Data Retention Baseline

- Ephemeral default TTL recommendation: `24h` to `72h`.
- Stored mode has no auto-expiry unless business policy enables it.
- Social comments follow same storage policy as parent workpad.

## Audit and Trace

- No mandatory account or identity profile.
- Local event log is optional and disabled by default in strict least-trace mode.
- If enabled, event logs should avoid storing full field values.

