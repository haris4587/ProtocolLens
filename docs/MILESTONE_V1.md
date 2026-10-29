# Milestone v1 — Reproducible Evidence Audit Toolkit

Contribution date: 2026-10-29. Baseline: `cf1387ea94775a424282cde930d8f85370e356f5` (repository head before this update; the portal's accepted revision is not available here).

## What changed

Previously ProtocolLens read consensus findings, displayed quotes and exported a hash-linked receipt. Reviewers still had to manually download documents and find the quoted passages. The new audit engine independently reauthenticates both committed snapshots and audits every stored attempt. It validates history sequence, exact quote membership and the deterministic four-category outcome rule, then produces reproducible JSON and a printable, self-contained HTML report.

Each exact quote has every matching occurrence, 1-based start/end lines and zero-based UTF-8 byte ranges with an exclusive end. Repeated quotes remain explicit. Empty quotes are marked NOT_SUPPLIED and are never represented as proof that content was absent. Source downloads have a 15-second timeout, reject redirects and are bounded to 50,000 bytes. Invalid UTF-8, changed bytes, fabricated quotes, malformed findings and inconsistent outcomes fail the audit.

- `web/audit.mjs`: shared browser/Node audit engine and escaped printable report.
- `scripts/audit-evidence.mjs`: read-only CLI for finalized RPC checks or imported receipts, including fully offline verification with local source files.
- `web/app.mjs`: Audit source evidence on every review card, per-attempt source locators and HTML/JSON downloads.
- `tests/audit.test.mjs`: 10 regression tests; included in CI through `npm run test:web`.
- `scripts/verify-ui-live.mjs`: integration checks execute the new audit and download handlers against the existing finalized record.

## Reproduce

```sh
npm ci
npm run test:web
npm run build
# Existing deployment, no signing and no new transaction:
npm run audit:evidence -- --live --out /tmp/protocollens-live-audit
# Fully offline, using the existing recorded receipt and exact snapshots:
npm run audit:evidence -- --receipt docs/evidence/reviewer-ui-live.json --registration examples/registration.txt --study examples/study.txt --out /tmp/protocollens-offline-audit
# Built frontend handlers + real RPC (DOM harness, not visual/browser QA):
npm run verify:ui
```

The live command checks the configured deployment's source checksum, chain 61999, finalized successful Normal review transaction, destination, signer, record ID, finalized record hashes and both source snapshots. See [captured live audit JSON](evidence/milestone-v1-audit.json) and [printable report](evidence/milestone-v1-audit.html). These use the original synthetic endpoint-switch example, not new adoption or a new consensus transaction.

Imported receipts use `UNANCHORED_IMPORT`: anyone can construct a self-consistent hash chain. Hash agreement alone does not establish on-chain provenance. The CLI's `FINALIZED_RPC` mode checks the deployment and finalized RPC state; browser audit exports say `BROWSER_RECORD_RECHECK` and rely on the app's existing finalized reads. `audit_sha256` covers only the canonical `audit` payload excluding its own hash; provenance, timestamp and anchor metadata are not signed. Re-run live mode to verify their claims. A source/quote audit does not rerun AI reasoning or independently establish whether a finding is scientifically sound.

## Deployment continuity and publication status

No changes to `contracts/protocol_lens.py`, `deployment.json`, contract address, source checksum, existing evidence, contract links or Studio signing workflow. Existing address remains `0x6E1fE2A506e4aA6a86c3a4d64d741A2c5a6E7427`.

The CLI is usable directly from this repository. The browser feature is implemented and build/integration tested, but **not yet published to the existing public app**: that Site is absent from the connected account's owned and editable Sites. Do not describe this milestone as a hosted frontend rollout. Once the existing Site is accessible, publish this build over that Site while preserving its URL and public audience. No replacement Site was created.

## Validation

- 19 JavaScript tests pass, including tamper rejection, rehashed fabricated quotes, deterministic aggregation, missing required evidence, UNCLEAR precedence, invalid UTF-8, repeated Unicode/CRLF locators, multi-attempt history, bounded downloads and HTML escaping.
- 33 existing Python tests pass.
- Production bundle builds successfully.
- CLI offline fixture audit and live finalized-RPC audit pass.
- Built frontend DOM handlers pass with live RPC, including source audit and JSON download. No visual/browser QA was performed.

## Submission text (under 1,000 characters)

Added a reproducible evidence-audit toolkit to ProtocolLens. Reviewers can now reauthenticate both commit-pinned source snapshots, verify every receipt-history link and attempt sequence, check exact excerpts against the original bytes, and independently recalculate the deterministic outcome from all four findings. Reports include every matching excerpt's line numbers and UTF-8 byte ranges, with printable HTML and JSON exports. A new read-only CLI supports finalized-RPC verification against the existing deployment and fully offline audits of exported receipts plus local snapshots; imported receipts are explicitly labelled unanchored. Added 10 audit regression tests (19 JS tests total); all 33 Python tests pass. Live audit and built-frontend handlers were checked against the existing finalized review. Contract, address and links are unchanged. Browser controls are implemented in source; hosted rollout is pending access to the existing Site.
