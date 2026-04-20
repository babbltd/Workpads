# BASICS Dirty Test Report

Run ID: 2026-04-20T09-41-53-665Z-workpads-core-dirty-test
Tool Version: 1.0.0
Target: `/Users/mp/Documents/Vaults/babb/repos/workpads`
Tier: core
Profiles: shared-core, software
Timestamp: 2026-04-20T09:41:53.717Z

## Verdict: BLOCKED

- Blocking failures: 3
- Pass: 1
- Fail: 3
- Partial: 3
- Error: 0

## Findings

### BASICS-TIER-010 - PARTIAL
- Severity: medium
- Mandatory: yes
- Observed: Core entry controls are incomplete (2/5).
- Evidence:
  - file: path=/Users/mp/Documents/Vaults/babb/repos/workpads/cli.md
  - code-scan: detail=Detected local create/edit signals.
- Remediation: Close missing controls: event schema, compatibility policy, degraded matrix, and local create/edit evidence.

### BASICS-EVID-002 - FAIL
- Severity: high
- Mandatory: yes
- Observed: No standalone event schema artifact found.
- Evidence:
  - search: detail=Checked common schema paths.
- Remediation: Publish event-schema.md or equivalent schema artifact with version and compatibility notes.

### BASICS-EVID-004 - FAIL
- Severity: high
- Mandatory: yes
- Observed: No compatibility policy and no deviation registry artifacts found.
- Evidence:
  - search: detail=Checked common policy artifact paths.
- Remediation: Add compatibility-policy.md and deviation-registry.md.

### BASICS-EVID-005 - PARTIAL
- Severity: medium
- Mandatory: yes
- Observed: Only one of degraded matrix / test evidence location found.
- Evidence:
  - path: path=/Users/mp/Documents/Vaults/babb/repos/workpads/conformance-tests
- Remediation: Publish degraded-mode-matrix.md and tier test evidence artifacts.

### BASICS-SC-041 - PASS
- Severity: info
- Mandatory: yes
- Observed: Local create/edit and local persistence signals detected.
- Evidence:
  - code-scan: detail=Detected create/edit and local storage patterns.

### BASICS-SC-050 - PARTIAL
- Severity: medium
- Mandatory: yes
- Observed: Only one interoperability baseline artifact found.
- Evidence:
  - file: path=/Users/mp/Documents/Vaults/babb/repos/workpads/cli.md
- Remediation: Publish both command and event schema baselines.

### BASICS-SC-051 - FAIL
- Severity: high
- Mandatory: yes
- Observed: No compatibility policy artifact found.
- Evidence:
  - search: detail=Checked common compatibility-policy paths.
- Remediation: Publish compatibility-policy.md with additive/breaking/migration signaling.

## Confidence

- Level: medium-high
- Rationale: Deterministic file/path checks plus heuristic code-signal checks.

## Limits

- No exhaustive command fuzzing in v1.
- Heuristic code-pattern checks can produce partial confidence.
