# Link Service

## Responsibility

Build and parse final share links by combining base URL and encoded payload suffix.

## Public API

- `POST /v1/links/build`
- `POST /v1/links/parse`
- `GET /v1/links/config`

## Base URL Rules

- Reads `WORKPADS_BASE_URL` first.
- Falls back to configured local value.
- Final fallback: `https://workpads.me/new`.

## Boundary Rules

- Does not compress or encrypt payloads.
- Does not validate field-level record values.
- Enforces URL length guardrails and returns `LINK_TOO_LONG` when needed.
