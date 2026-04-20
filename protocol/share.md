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

# Share

## Intent

Share a workpad as a compact URL that can be opened in browser or app and reconstructed offline.

## Share Modes

- `plain` workpad: fields only.
- `social` workpad: fields + comments.

## Export Contract

Input:

- normalized record,
- target mode (`legacy` or `modern`),
- optional `encrypt` flag and passphrase.

Output:

- final URL,
- payload size report,
- warning list.

## Import Contract

Input:

- URL or raw payload suffix.

Output:

- decoded record,
- template resolution status,
- data quality warnings.

## Payload Size Report

Required report fields:

- `urlLength`
- `payloadLength`
- `compressionRatio`
- `thresholdStatus` (`ok`, `warn`, `fail`)

## Security and Privacy

- Default is compression-only for broad compatibility.
- Optional encryption is capability-based and must advertise algorithm in payload metadata.
- Import path must fail closed on malformed or tampered encrypted payloads.

## Error Codes

- `SHARE_MODE_UNSUPPORTED`
- `PAYLOAD_TOO_LARGE`
- `ENCRYPTION_NOT_AVAILABLE`
- `DECRYPT_FAILED`
- `TEMPLATE_RESOLUTION_FALLBACK`

