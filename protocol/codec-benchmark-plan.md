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

# Codec Benchmark Plan

## Goal

Evaluate compression/encoding stacks that keep generated share links near the `1 KB` target while preserving legacy compatibility.

## Runtime Lanes

- `legacy lane`: KaiOS-safe baseline.
- `modern lane`: current browser engines with optional stronger codec and crypto.

## Candidate Algorithms

- `lz-str+b64url` (legacy baseline)
- `deflate-raw+b64url` (modern)
- `deflate+aesgcm+b64url` (modern encrypted optional)

## Test Corpus

Run each candidate against standardized record sets:

1. **tiny**: 5 fields, short strings, plain variant.
2. **standard**: 12 fields, typical job notes, plain variant.
3. **social-light**: standard + 3 short comments.
4. **social-heavy**: 20 fields + 10 comments.
5. **worst-case**: long text near field limits.

Each corpus case should have fixed deterministic fixtures in both compact and expanded-key forms.

## Metrics

- `payloadBytes`
- `urlBytes`
- `compressionRatio`
- `encodeMs`
- `decodeMs`
- `decodeSuccessRate`
- `peakMemoryKB` (best effort in constrained runtimes)

## Thresholds

- Pass target: `urlBytes <= 1024` for tiny, standard, and social-light.
- Warning: `1025..1400` for social-heavy.
- Fail: `>1400` for non-worst-case fixtures.
- Hard fail: any decode failure or data mismatch.

## Benchmark Procedure

1. Normalize fixture payload.
2. Encode with algorithm candidate.
3. Assemble final link with configured base URL.
4. Decode back and deep-compare payload.
5. Capture timings over `N=100` runs per case, per runtime lane.

## Decision Policy

- Keep one default algorithm per lane.
- Promote optional algorithms only if they improve size by `>=10%` without decode instability.
- Encryption path remains non-default until lane support is proven stable.

## Reporting Format

For each release cycle, publish:

- selected defaults per lane,
- regression deltas from previous run,
- top failing fixtures with remediation notes.
