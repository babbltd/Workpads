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

# Edit

## Intent

Edit an existing workpad record locally or from a decoded link payload.

## Edit Sources

- Local stored record by `recordId`.
- Decoded record from incoming link suffix.

## Edit Flow

1. Load and normalize source record.
2. Re-validate against template and variant.
3. Merge user edits field-by-field.
4. Preserve unknown keys in passthrough area.
5. Recompute link payload when share output is requested.

## Concurrency Baseline

For offline-first local operations:

- last-write-wins using `updatedAt`.
- keep prior copy as a lightweight revision snapshot when persistence is on.

Future sync systems may override this strategy but should maintain protocol compatibility.

## Field Merge Rules

- Empty string may mean clear when field is optional.
- Required fields cannot be cleared in strict mode.
- Comments in `social` variant append-only by default.

## Output

Edits return the same shape as create output plus:

- `updatedAt`,
- `revision`.

