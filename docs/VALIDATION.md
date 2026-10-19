# Validation results — 2026-10-19

- 33 Python tests pass: GenVM direct contract tests, captured SDK validator acceptance/disagreement/prose validation, and a separate host harness. Includes the outer-metadata regression.
- 4 Node tests pass: pinned URLs, address validation, canonical serialization, and receipt-tampering rejection.
- GenVM lint: 3 checks pass.
- SDK semantic validation: passes; 2 write and 2 view methods.
- Production browser bundle: builds successfully.
- Public HTTP smoke checks pass: HTML, JS, CSS, configured contract address and RPC CORS.
- Deployed release source is byte-identical to contracts/protocol_lens.py (checksum in deployment.json).
- Real Studio Full Consensus deployment, commitment and comparison finalized successfully, signed by Studio's built-in account.
- Finalized semantic outcome: DEVIATIONS; primary_outcome UNEXPLAINED. Exact excerpts, consensus votes and receipt hashes are recorded in docs/evidence/live-review.json.

`npm run verify:live` verifies the real release and expected semantic outcome. `npm run verify:site` checks the public HTML, JS, CSS, configured release address and RPC CORS. These network checks are separate from the offline tests.

Browser layout and interaction QA were not run because this managed environment does not expose the required control-browser skill. No mobile-interaction verification is claimed. Public-asset HTTP checks and direct SDK finalized-state reads complement the static build and Studio signing tests.
