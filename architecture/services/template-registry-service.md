# Template Registry Service

## Responsibility

Load, validate, normalize, and resolve templates/variants from simple KV or YAML sources.

## Public API

- `GET /v1/templates`
- `GET /v1/templates/{templateId}`
- `POST /v1/templates/validate`
- `POST /v1/templates/resolve`

## Input Notes

- Accepts source format marker: `kv` or `yaml`.
- Returns normalized internal schema for all consumers.

## Boundary Rules

- Owns signature generation and template fallback matching.
- Does not store job record values.
