# BASICS Dirty Test Report

Run ID: 2026-04-26T07-49-14-802Z-workpads-core-dirty-test
Tool Version: 1.1.0
Target: `/Users/mp/Documents/Vaults/babb/repos/workpads`
Tier: core
Profiles: shared-core, software
Timestamp: 2026-04-26T07:49:14.877Z

## Verdict: BLOCKED

- Blocking failures: 1
- Pass: 4
- Fail: 1
- Partial: 2
- Error: 0

## Findings

### BASICS-TIER-010 - PARTIAL
- Severity: medium
- Mandatory: yes
- Observed: Core entry controls are incomplete (4/5).
- Evidence:
  - file: path=/Users/mp/Documents/Vaults/babb/repos/workpads/cli.md
  - file: path=/Users/mp/Documents/Vaults/babb/repos/workpads/conformance-tests/event-schema.md
  - file: path=/Users/mp/Documents/Vaults/babb/repos/workpads/conformance-tests/degraded-mode-matrix.md
  - code-scan: detail=Detected local create/edit signals.
- Remediation: Close missing controls: event schema, compatibility policy, degraded matrix, and local create/edit evidence.

### BASICS-EVID-002 - PASS
- Severity: info
- Mandatory: yes
- Observed: Event schema artifact found.
- Evidence:
  - file: path=/Users/mp/Documents/Vaults/babb/repos/workpads/conformance-tests/event-schema.md

### BASICS-EVID-004 - PARTIAL
- Severity: medium
- Mandatory: yes
- Observed: Only one required policy artifact found.
- Evidence:
  - file: path=/Users/mp/Documents/Vaults/babb/repos/workpads/conformance-tests/deviation-registry.md
- Remediation: Publish both compatibility-policy.md and deviation-registry.md.

### BASICS-EVID-005 - PASS
- Severity: info
- Mandatory: yes
- Observed: Degraded mode matrix and test evidence location found.
- Evidence:
  - file: path=/Users/mp/Documents/Vaults/babb/repos/workpads/conformance-tests/degraded-mode-matrix.md
  - path: path=/Users/mp/Documents/Vaults/babb/repos/workpads/conformance-tests

### BASICS-SC-041 - PASS
- Severity: info
- Mandatory: yes
- Observed: Local create/edit and local persistence signals detected.
- Evidence:
  - code-scan: detail=Detected create/edit and local storage patterns.

### BASICS-SC-050 - PASS
- Severity: info
- Mandatory: yes
- Observed: Command semantics and event schema baselines are published.
- Evidence:
  - file: path=/Users/mp/Documents/Vaults/babb/repos/workpads/cli.md
  - file: path=/Users/mp/Documents/Vaults/babb/repos/workpads/conformance-tests/event-schema.md

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
