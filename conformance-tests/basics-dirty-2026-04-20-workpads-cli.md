# BASICS Dirty Test Report: Workpads CLI

Date: 2026-04-20  
Target: `repos/workpads`  
Assessor stance: intentionally strict and conservative  
Scope: CLI implementation and repository evidence only

## Executive Verdict

`workpads` is **not yet Core-conformant** under BASICS v0.1.1.

Current state is best described as:

- **pre-Core with strong implementation momentum**
- **behavior ahead of formal conformance evidence**

This is a good engineering position, but it is not claim-ready.

## What Was Evaluated

Evidence reviewed:

- `workpads.js`
- `README.md`
- `cli.md`
- `protocol/cli.md`
- local command execution spot-checks (`help`, `list --json`, `storage:resolve`, unknown command behavior)

Referenced BASICS controls:

- `BASICS-TIER-010`
- `BASICS-EVID-002`
- `BASICS-EVID-004`
- `BASICS-EVID-005`
- `BASICS-SC-041`
- `BASICS-SC-050`
- `BASICS-SC-051`

## Hard Findings (Highest Severity First)

### 1) No explicit published event schema baseline (FAIL)

Impacted rules:

- `BASICS-EVID-002`
- `BASICS-SC-050`

Observed:

- record JSON shape exists in code and docs, but no standalone event/schema artifact with compatibility contract.

Why this is severe:

- interoperability claims remain interpretive, not contractually testable.

### 2) No formal compatibility + deviation policy artifact (FAIL)

Impacted rules:

- `BASICS-EVID-004`
- `BASICS-SC-051`

Observed:

- behavioral compatibility intent appears in prose, but no formal policy file and no deviation registry entries for known gaps.

Why this is severe:

- evolution risk is unmanaged; external implementers cannot reason about break risk.

### 3) No degraded-mode matrix or tier evidence bundle (FAIL)

Impacted rules:

- `BASICS-EVID-005`
- `BASICS-TIER-010` readiness chain

Observed:

- local-first behavior is present, but degraded scenarios are not captured as a formal matrix and test evidence set.

Why this is severe:

- constrained operation is a BASICS core value and currently under-evidenced.

### 4) Exit-code contract divergence between protocol doc and CLI runtime (FAIL)

Impacted rules:

- `BASICS-SC-001`
- `BASICS-SC-051`

Observed:

- `protocol/cli.md` specifies structured exit codes (`0,10,20,30,40,50`).
- runtime path currently exits `1` on generic errors.

Why this is severe:

- automation and integration cannot rely on documented failure semantics.

### 5) Global CLI surface mismatch against protocol declaration (PARTIAL FAIL)

Impacted rules:

- `BASICS-SC-001`
- `BASICS-SC-012`

Observed:

- protocol declares global options `--mode`, `--base-url`, `--strict-size`, `--json`.
- runtime supports `--base-url` in share flow and `--json` on selected commands; no true global parser behavior for all listed flags.

Why this matters:

- interface stability perception is stronger than actual implementation parity.

## Strong Signals (Real Progress, Not Excuses)

### A) CLI-first implementation is real and operational

Strength:

- create/edit/share/import/render/list/delete flows are implemented and executable.

Related rules:

- `BASICS-SC-001`
- `BASICS-SC-041`

### B) Local-first record behavior is concrete

Strength:

- record persistence exists in local store with no account dependency.

Related rules:

- `BASICS-SC-041`

### C) Policy semantics exist in command surface

Strength:

- `storage:*` and `policy:*` alias behavior is implemented with deterministic resolution.

Related rules:

- `BASICS-SC-012`

### D) Share payload discipline is measurable

Strength:

- dashboard and share bytes output provide practical payload observability.

Related rules:

- `BASICS-SC-060` (early signal)

## Core Tier Dirty Test Outcome

### `BASICS-TIER-010` checkpoint snapshot

- command contract published: **PASS (partial confidence)**
- local record create/edit baseline: **PASS**
- baseline interoperability docs: **PARTIAL**
- event schema evidence artifact: **FAIL**
- compatibility/deviation policy artifact: **FAIL**
- degraded evidence matrix: **FAIL**

Result:

- **Core claim blocked**

## Most Brutal Truth

`workpads` likely has more real capability than many “standards-compliant” repos, but BASICS conformance is evidence-driven.
Right now, the repo is implementation-strong and conformance-thin.

That is fixable quickly.

## 7-Day Remediation Plan (to reach credible Core-candidate)

1. Publish `event-schema.md` with explicit versioning and compatibility notes.
2. Publish `compatibility-policy.md` and first `deviation` entries for known CLI/protocol mismatches.
3. Add `degraded-mode-matrix.md` (network/storage/dependency/integrity).
4. Align runtime error codes with protocol contract or explicitly revise protocol and register deviation.
5. Add `conformance/BASICS-claim.yaml` as pre-claim draft (not public claim yet).

## Assessment Confidence

Confidence: medium-high for Core readiness determination.

Limits:

- this is a dirty test, not a full certification run
- no exhaustive command fuzzing performed
- no long-duration resilience testing performed

