# Record Service

## Responsibility

Create, load, update, archive, and purge single workpad records using normalized templates.

## Public API

- `POST /v1/records`
- `GET /v1/records/{recordId}`
- `PATCH /v1/records/{recordId}`
- `POST /v1/records/{recordId}/archive`
- `DELETE /v1/records/{recordId}`

## Storage Adapter Boundary

- Works through adapter interface:
  - `memory`
  - `local-file` (CLI)
  - `local-storage` (browser/KaiOS)

## Boundary Rules

- Does not implement link encoding.
- Uses storage policy service to determine effective retention behavior.
