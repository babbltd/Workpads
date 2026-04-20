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

# PADS Field Matrix

## Purpose

Define one canonical PADS structure that works first in CLI, then maps directly to local browser and KaiOS screens.

PADS dimensions:

- `P` Processes
- `A` Actions
- `D` Details
- `S` Story

## Canonical Runtime Shape

```json
{
  "v": 1,
  "t": "svc-basic",
  "r": "plain",
  "process": {},
  "actions": [],
  "details": "",
  "story": ""
}
```

## CLI-First Field Matrix

| PADS | Field ID | Type | Required | CLI Prompt | Browser/KaiOS UI | URL Compact Key |
| --- | --- | --- | --- | --- | --- | --- |
| Process | `job` | text | yes | `Job title` | single-line input | `j` |
| Process | `customer` | text | no | `Customer` | single-line input | `c` |
| Process | `date` | date | no | `Date (YYYY-MM-DD)` | date input | `d` |
| Process | `location` | text | no | `Location` | single-line input | `l` |
| Process | `meeting_time` | text | no | `Meeting time` | single-line input | `mt` |
| Actions | `actions[].title` | text | no | `Action title` | repeatable item title | `at` |
| Actions | `actions[].notes` | text | no | `Action notes` | repeatable item notes | `an` |
| Details | `details` | text | no | `Details` | short textarea | `de` |
| Story | `story` | text | no | `Story` | long textarea | `st` |

## Command Mapping

- `workpads create` initializes `process` fields and optional empty `actions`.
- `workpads edit --set details=...` mutates the `D` block.
- `workpads edit --add-action` appends one item to `A`.
- `workpads share` exports compact-key payload.

## Small-Screen Rules

- Process inputs appear first and must fit one vertical pass.
- Actions stay collapsed by default; open one action at a time.
- Details has small default height.
- Story has larger height and may span multiple screens.

## Social Variant Extension

Social mode adds comments outside PADS core:

```json
{
  "comments": [{ "n": "optional name", "x": "comment text", "ts": "2026-04-20T10:00:00Z" }]
}
```

This keeps PADS stable for both plain and social variants.
