# Gateway Service

## Responsibility

Single façade for clients, orchestrating template, policy, record, codec, link, and comment services.

## Public API

- `POST /v1/workpads/create`
- `POST /v1/workpads/edit`
- `POST /v1/workpads/share`
- `POST /v1/workpads/import`
- `GET /v1/workpads/templates`
- `GET /v1/workpads/policies/{businessId}`

## Request/Response Pattern

- Input: client-friendly payloads with expanded keys.
- Output: normalized payloads plus optional compact link.

## Boundary Rules

- Does not store templates or records directly.
- Does not own compression implementation.
- Performs orchestration, validation sequencing, and response shaping.
