# Workpads — Onboarding

Welcome. This is the guide for people joining the project.

---

## Read First

In order:

1. **`README.md`** — what Workpads is and why it exists. Product principles and the PADS model.
2. **`RULES.md`** — development rules that apply across all repos. Read before writing any code.
3. **`REPOS.md`** — what every repo does and how they connect.
4. **`STATUS.md`** — current priorities, open issues, and what's paused.
5. **`workpads-standard/README.md`** — the normative spec. This is the source of truth.

If you are working on a specific repo, read its own README and any PLAN.md before starting.

---

## The Mental Model

**The standard governs.** `workpads-standard/` defines what a workpad record is, how it encodes, and how it must behave. Implementations exist to prove the standard works. When they conflict, the standard is right.

**The codec is the contract.** Any URL of the form `workpads.me/p#1ag/...` must decode correctly on any conformant decoder. The bitpad-v1 codec in `workpads-codec/` is the canonical implementation. All apps use it (or must migrate to it).

**Decisions flow outward.** Research happens in `workpads-basicsconform/`. Decisions are logged there and promoted to `workpads-standard/`. Standard changes flow to implementations. Never implement in a client repo and backfill the standard later.

**Deviations are registered, not hidden.** If your implementation differs from the standard, register it in `conformance-tests/deviation-registry.md` with a stable ID before shipping.

---

## Running the CLI Locally

The original CLI (`workpads.js`) lives in this repo as a reference. It uses a legacy encoding, not the current bitpad-v1 codec, but it works for exploring the record model and protocol surface.

```bash
cd repos/workpads
npm install
node ./workpads.js help
```

Create a record:
```bash
node ./workpads.js create --template svc-basic --variant plain --set process.job="Replace faucet"
```

See the full command reference in `cheat-sheet.md` and `cli.md`.

For the current CLI (which will use `@workpads/codec` in v0.2), see `workpads-cli/`.

---

## Working on the Web App

`workpadsdotme/` is the active build priority. Read `workpadsdotme/PLAN.md` first. The app is plain HTML/CSS/JS — no build step, no framework. The service layer (RecordService, StorageAdapter, ActivityService, BlockRegistry, PersonalService) is shared with the KaiOS app.

The `/p` receiver at `workpads.me/p` is already live. The main app screens are in progress.

---

## Working on the KaiOS App

`workpadskaios/` is a self-contained HTML/CSS/ES5 app. No build step required. 240×320px, D-pad navigation, softkey bar (LSK/CSK/RSK). Run it directly in a KaiOS simulator or on-device.

Known open issue: DEV-WP-URL-001 — the URL scheme tag is not interoperable with `workpadsdotme`. Fix targeted for v0.2.

---

## Making a Decision

If you encounter a design question not settled by the standard:

1. Check `workpads-basicsconform/system/logs/decisions.md` — it may already be decided.
2. If not decided, write a decision entry with: the question, the options considered, the chosen approach, and the rationale.
3. Update `workpads-standard/` if the decision is normative.
4. Update `workpads/STATUS.md` if it affects cross-repo state.

Do not implement before the decision is written.

---

## Registering a Deviation

If your implementation cannot conform to a section of the standard:

1. Write an entry in `workpads/conformance-tests/deviation-registry.md` with a stable ID (`DEV-WP-NNN`), the BASICS rule being deviated from, the semantic claim, and the rationale.
2. Add it to `conformance-tests/BASICS-claim.yaml`.
3. Commit the registration before shipping the deviating behavior.

See `dev/deviations.md` for a summary of current registered and open deviations.

---

## What's Deliberately Out of Scope (v0.1)

Do not add these without an explicit decision and scope change:

- Sync, conflict detection, conflict resolution — v0.2
- Encryption — post-v0.1
- KaiOS 2.5 build — v0.2
- Strict URL size enforcement — paused
- Legacy vs modern codec branching — paused

---

## Architecture Docs (Historical)

The `architecture/` and `protocol/` directories in this repo contain the original pre-2026 design documents. They informed the current standard and are useful background reading, but they do not govern — `workpads-standard/` does. Where they conflict with the standard, the standard is right.
