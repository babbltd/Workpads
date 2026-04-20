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

# Link

## Link Shape

Default base URL (configurable):

- `https://workpads.me/new`

Suffix format:

- `https://workpads.me/new#<payload>`

Hash suffix is preferred so payload is client-side and not sent to server logs by default.

## Base URL Configuration

All clients read from one source:

- `WORKPADS_BASE_URL` environment variable (CLI/services),
- local config key `baseUrl` (browser/KaiOS),
- fallback to `https://workpads.me/new`.

No hardcoded base URL should exist outside the link service.

## Payload Envelope

The decoded payload starts with:

```json
{
  "v": 1,
  "m": "legacy",
  "alg": "lz-str+b64url",
  "t": "svc-install",
  "r": "plain",
  "f": {}
}
```

- `alg` declares codec stack used.
- `f` stores compact field values.

## Encoding Pipeline

1. Normalize record object and remove empty optional keys.
2. Serialize JSON with stable key ordering.
3. Compress using selected algorithm.
4. Encode using URL-safe Base64 alphabet (`-` and `_`, no padding by default).
5. Append to hash suffix.

## Algorithm Options

- Legacy-safe default: `lz-str+b64url`.
- Modern optional: `deflate-raw+b64url` or newer validated option.
- Optional encryption (modern capable):
  - `alg`: `deflate+aesgcm+b64url`,
  - payload includes nonce and tag fields.

## Limits and Validation

- Fail link generation when resulting URL exceeds strict byte budget mode.
- Return deterministic error codes:
  - `LINK_TOO_LONG`,
  - `UNSUPPORTED_ALG`,
  - `DECODE_FAILED`,
  - `TEMPLATE_NOT_FOUND`.

