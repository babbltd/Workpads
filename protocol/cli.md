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

# CLI Surface

## Goal

Define a minimal command set that becomes the behavior baseline for local web and KaiOS clients.

## Global Shape

Binary name:

- `workpads`

Shared options:

- `--mode legacy|modern`
- `--base-url <url>`
- `--strict-size`
- `--json`

## Commands

### `template:list`

List available templates and variants.

### `template:validate`

Validate and normalize a KV or YAML template file.

Example:

- `workpads template:validate --file ./templates/install.kv --format kv`

### `create`

Create a new workpad from template and optionally emit share link.

Examples:

- `workpads create --template svc-install --variant plain`
- `workpads create --from-file ./job.kv --link`

### `edit`

Edit a stored workpad by record id.

Example:

- `workpads edit --record loc_01hxy2 --set job=\"Repair sump pump\"`

### `import`

Decode a share link and materialize a local record.

Example:

- `workpads import --url \"https://workpads.me/new#AbCd\"`

### `share`

Generate link from local record.

Examples:

- `workpads share --record loc_01hxy2`
- `workpads share --record loc_01hxy2 --encrypt --passphrase-env WP_PASS`

### `render`

Print human-readable or JSON view of a record.

### `policy:get`

Show effective business storage policy.

### `policy:set`

Set business default storage policy.

### `policy:resolve`

Resolve effective storage mode with optional per-workpad override.

## Client Reuse Contract

The browser and KaiOS clients should map direct UI actions to these command semantics:

- new form -> `create`
- open link -> `import`
- save edits -> `edit`
- share button -> `share`
- settings policy toggle -> `policy:set`

## Exit Codes

- `0` success
- `10` validation error
- `20` codec/link error
- `30` policy error
- `40` storage error
- `50` unknown runtime error
