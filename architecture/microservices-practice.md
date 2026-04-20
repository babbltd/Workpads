# Microservices In Practice

## Goal

Keep CLI and browser app as 1:1 clients of the same service contracts.

## Service Boundary

- `gateway-service`: one client entry point.
- `template-registry-service`: parse/validate/compile template sources.
- `record-service`: CRUD for workpads.
- `storage-policy-service`: resolve business + override behavior.
- `comment-service`: comment add/list/delete for social mode.
- `codec-service`: encode/decode payloads.
- `link-service`: build/parse final share links.

## CLI 1:1 Mapping

Each CLI command maps to one gateway request shape:

- `create` -> `POST /v1/workpads/create`
- `edit` -> `POST /v1/workpads/edit`
- `share` -> `POST /v1/workpads/share`
- `import` -> `POST /v1/workpads/import`
- `storage:*` -> policy routes
- `comment:*` -> comment routes
- `template:*` -> template routes

CLI remains a thin adapter:

1. parse args,
2. call gateway route,
3. print response.

## Browser 1:1 Mapping

Browser uses same payloads:

1. form submit builds the same request body as CLI,
2. calls the same gateway route,
3. renders same response shape.

No browser-only protocol branch is allowed.

## Practical Rollout

### Stage 1 (now)

- Contracts are implemented in docs.
- CLI implements behavior directly with service-shaped logic.

### Stage 2

- Move existing CLI handlers into service modules.
- Add local gateway HTTP server that calls those modules.
- CLI switches from direct function calls to HTTP calls.

### Stage 3

- Browser app calls the same local gateway.
- KaiOS app uses same gateway payload contracts.

## Why This Works

- Shared request/response contracts keep parity.
- One codec/link implementation keeps URL behavior identical.
- Storage and comment semantics remain consistent across clients.
