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

# Storage Policy

## Objective

Support minimal traces by default while allowing businesses to opt into persistence.

## Policy Layers

1. **Business-level default** (required per business scope)
2. **Per-workpad override** (optional per record)

## Allowed Modes

- `ephemeral`
- `stored`

## Resolution Order

Effective mode is selected in this order:

1. per-workpad override (if present),
2. business default,
3. system fallback (`ephemeral`).

## TTL Rules

Recommended defaults:

- `ephemeral`: default TTL `24h`, configurable up to `72h`.
- `stored`: no expiry unless explicitly configured.

TTL applies equally to plain and social variants.

## Least-Trace Defaults

- No mandatory identity profile.
- No mandatory account auth for local usage.
- Optional event logging disabled by default.
- If logging is enabled, record metadata only, not full field values.

## Lifecycle Semantics

- `expire`: automatic cleanup by TTL.
- `archive`: user-hidden but recoverable.
- `purge`: permanent deletion of record and revisions.

## Policy Contract Example

```json
{
  "businessId": "biz_001",
  "defaultMode": "ephemeral",
  "defaultTtlHours": 24,
  "allowOverride": true,
  "allowStored": true
}
```

Per-workpad override example:

```json
{
  "recordId": "loc_01hxy2",
  "overrideMode": "stored",
  "overrideTtlHours": null
}
```

## Guardrails

- A client must show current effective policy when creating or editing a workpad.
- Policy changes do not silently rewrite existing records unless explicitly confirmed.
- Purge action must require clear confirmation in interactive clients.
