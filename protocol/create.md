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

# Create

## Intent

Create a single job record from a template with minimal user friction.

## Input Contract

Required inputs:

- `templateId`
- `variant` (`plain` or `social`)
- `fields` dictionary

Optional:

- `businessPolicyId`
- `storageOverride`

## Create Flow

1. Load template from registry.
2. Validate fields against template limits/types.
3. Apply storage policy defaults and per-workpad override.
4. Build canonical compact record.
5. Return:
   - record object,
   - optional local storage key (if persisted),
   - generated share link (if requested).

## Validation Rules

- Unknown field ids are rejected in strict mode and preserved in permissive mode.
- Required fields missing -> `VALIDATION_REQUIRED_FIELD_MISSING`.
- Field values over max length -> `VALIDATION_MAX_LENGTH`.
- Unsupported type conversions -> `VALIDATION_TYPE`.

## Output Example

```json
{
  "recordId": "loc_01hxy2",
  "templateId": "svc-install",
  "variant": "plain",
  "fields": {
    "job": "Replace kitchen faucet"
  },
  "storage": {
    "effectiveMode": "ephemeral",
    "expiresAt": "2026-04-21T00:00:00Z"
  },
  "link": "https://workpads.me/new#AbCdEf"
}
```

## CLI Mapping

- `workpads create --template svc-install --variant plain`
- `workpads create --from-file ./job.kv --link`

