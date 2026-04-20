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

# Template

## Goals

Templates define reusable field sets for single-document job records.
They must be:

- very easy to author,
- safe to parse on low-powered devices,
- stable across CLI, browser, and KaiOS clients.

## Canonical Model

Internal normalized model:

```json
{
  "templateId": "svc-install",
  "version": 1,
  "title": "Service Install",
  "variants": ["plain", "social"],
  "fields": [
    { "id": "job", "label": "Job", "type": "text", "required": true, "max": 120 },
    { "id": "addr", "label": "Address", "type": "text", "required": false, "max": 180 },
    { "id": "date", "label": "Date", "type": "date", "required": false, "max": 10 }
  ]
}
```

## Accepted Authoring Formats

### 1) Simple KV format (recommended baseline)

```txt
template_id: svc-install
version: 1
title: Service Install
variants: plain,social
field: job|Job|text|required|max=120
field: addr|Address|text|optional|max=180
field: date|Date|date|optional|max=10
```

### 2) YAML format (optional)

```yaml
template_id: svc-install
version: 1
title: Service Install
variants: [plain, social]
fields:
  - id: job
    label: Job
    type: text
    required: true
    max: 120
```

## Normalization Rules

- Input formats normalize to the same internal model.
- `id` values must be lower-case ASCII with dashes or underscores.
- Max field count for URL mode should stay low (default limit: `32`).
- Field order is preserved for rendering and signature generation.

## Template/Variant Resolution

Resolution order:

1. explicit `templateId` + `variant` in payload,
2. explicit `templateId` with default variant,
3. field-signature fallback.

Field signature algorithm baseline:

- sort field ids,
- join with `,`,
- hash using a lightweight deterministic function available in legacy runtime,
- compare against template registry signatures.

## Versioning Policy

- Template updates increment `version`.
- Decoders should support older template versions for at least one major protocol cycle.
- Unknown fields are retained under a passthrough bucket to avoid data loss.

## Starter Files

Initial starter assets for `svc-basic`:

- `templates/svc-basic.kv`
- `templates/svc-basic.yaml`
- `templates/runtime/svc-basic.v1.json`

These files define the same PADS-aligned template in authoring and runtime formats.

