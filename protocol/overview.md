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

# Overview

## Purpose

Workpads protocol defines how a single job record (a "workpad") is:

- created from a template,
- encoded into a compact link suffix,
- loaded back into fields on another device,
- managed with least-trace storage rules.

The protocol is designed for:

- HTML/CSS/JS implementations only,
- KaiOS-safe baseline behavior,
- optional modern capabilities when supported,
- strict simplicity over feature depth.

## Protocol Layers

1. **Template layer**: defines fields and variants.
2. **Record layer**: stores values mapped to template fields.
3. **Codec layer**: serializes, compresses, and encodes payloads.
4. **Link layer**: attaches payload to a base URL.
5. **Policy layer**: controls ephemeral vs stored behavior.

## Compatibility Modes

- `legacy`: compatible with KaiOS 2.x constraints.
- `modern`: preferred when runtime supports stronger compression and optional crypto.

Each payload carries a compact `mode` marker so decoders can select the correct path.

## Core Payload Contract

Canonical decoded object (before compression):

```json
{
  "v": 1,
  "m": "legacy",
  "t": "svc-install",
  "r": "plain",
  "f": {
    "job": "Replace kitchen faucet",
    "addr": "11 River Rd",
    "date": "2026-04-20"
  },
  "c": []
}
```

- `v`: protocol version.
- `m`: runtime mode (`legacy` or `modern`).
- `t`: template id.
- `r`: variant id (`plain` or `social`).
- `f`: field-value dictionary keyed by template field ids.
- `c`: social comments list (empty for plain mode).

## Compact Key Dictionary

For URL byte minimization:

- `v` version
- `m` mode
- `t` template
- `r` variant
- `f` fields
- `c` comments
- `n` display name in comments
- `x` comment text
- `ts` comment timestamp

Implementations may use expanded keys in local storage, but URL payloads should use compact keys.

## Byte Budget Rules

- Primary target: total link length around `1024` bytes.
- Warning threshold: `900` bytes.
- Hard failure threshold: `>1024` bytes in strict mode.
- Fallback behavior on overflow:
  1. suggest shorter text fields,
  2. switch to export file/share text mode,
  3. keep local copy if storage policy allows.

## Required Behaviors

- A workpad link must decode without network calls.
- Decoding must not require account login.
- Unknown fields must be preserved when possible (forward compatibility).
- Unknown template ids must attempt field-signature fallback.

