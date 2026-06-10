# Conformance Tests

BASICS conformance evidence artifacts for the Workpads reference architecture. These artifacts support the Core tier claim in `BASICS-claim.yaml`.

## Assessment Rules

1. Assess current behavior, not intended behavior.
2. Evidence must point to executable behavior or committed docs.
3. Failures should be explicit and uncomfortable.
4. Passing a dirty test is not conformance certification.
5. Each run should include next actions with rule IDs.

## Artifacts

| File | BASICS Rules | Status |
|------|-------------|--------|
| `BASICS-claim.yaml` | — | Claim file — v0.1-draft |
| `command-surface.md` | BASICS-EVID-001, SC-001, SC-002, SC-012 | Present |
| `event-schema.md` | BASICS-EVID-002, SC-050, SW-002 | Present |
| `deviation-registry.md` | BASICS-EVID-004, SC-055 | Present — DEV-WP-001 registered |
| `degraded-mode-matrix.md` | BASICS-EVID-005, SC-040, SC-041 | Present |
| `compatibility-policy.md` | BASICS-EVID-004, SC-051, SW-003 | **Pending** — deferred to Q3 2026 |

## Dirty Tests

Dirty tests are high-friction, bias-resistant snapshots of actual implementation state. They are not conformance certification — they are evidence.

| File | Date | Subject |
|------|------|---------|
| `basics-dirty-2026-04-20-workpads-cli.md` | 2026-04-20 | workpads CLI (v0.x) |
| `basics-assess-v1.1-generated.md` | — | Generated assessment |
| `basics-dirty-v1.1-generated.md` | — | Generated dirty test |

## Conformance Posture

**Tier:** Core, BASICS v0.1.1  
**Field tier:** Explicitly deferred to v0.2 (SC-042, SC-043, SW-020, SW-021 — sync and conflict)  
**One registered deviation:** DEV-WP-001 (naming surface — see `deviation-registry.md`)  
**One open unregistered deviation:** DEV-WP-URL-001 (KaiOS URL scheme tag — see `../dev/deviations.md`)
