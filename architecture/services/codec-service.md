# Codec Service

## Responsibility

Serialize, compress, encode, decode, decompress, and deserialize workpad payloads.

## Public API

- `POST /v1/codec/encode`
- `POST /v1/codec/decode`
- `GET /v1/codec/algorithms`

## Algorithm Contract

- Legacy default: `lz-str+b64url`
- Modern optional: `deflate-raw+b64url`
- Modern optional encrypted: `deflate+aesgcm+b64url`

## Validation Outputs

Encode/decode responses include:

- `alg`
- `payloadLength`
- `warnings`
- error code on failure.

## Boundary Rules

- No direct URL assembly.
- No template resolution.
