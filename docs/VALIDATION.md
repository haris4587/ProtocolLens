# Validation results — 2026-10-21

- 33 Python tests pass: GenVM direct contract tests, captured SDK validator acceptance/disagreement/prose validation, and a separate host harness. Includes the outer-metadata regression.
- 9 Node tests pass: pinned URLs, address validation, canonical serialization, receipt tampering, Studio calldata decoding and bigint handling, pending versus finalized states, wrong destination/method/mode, execution failure, canceled transactions, wrong RPC chain and creator/history bindings.
- GenVM lint: 3 checks pass.
- SDK semantic validation: passes; 2 write and 2 view methods.
- Production browser bundle: builds successfully.
- Public HTTP smoke checks pass: HTML, JS, CSS, configured contract address and RPC CORS.
- Deployed release source is byte-identical to contracts/protocol_lens.py (checksum in deployment.json).
- Real Studio Full Consensus deployment, commitment and comparison finalized successfully, signed by Studio's built-in account.
- Finalized semantic outcome: DEVIATIONS; primary_outcome UNEXPLAINED. Exact excerpts, consensus votes and receipt hashes are recorded in docs/evidence/live-review.json.

`npm run verify:live` verifies the real release and expected semantic outcome. `npm run verify:site` checks the public HTML, JS, CSS, configured release address and RPC CORS. These network checks are separate from the offline tests.

Browser layout and interaction QA were not run because this managed environment does not expose the required control-browser skill. No mobile-interaction verification is claimed. Public-asset HTTP checks and direct SDK finalized-state reads complement the static build and Studio signing tests.

## Steward workflow follow-up

- A fresh Studio account imported the original release by address and created record 2, then initiated its consensus review without redeploying or upgrading the contract. Both writes finalized successfully.
- The frontend provides individually copyable method fields, exact import-existing instructions, both transaction trackers, pending/finalized states, retry/stop behavior, execution errors, hash verification and transaction-linked receipt export.
- `npm run verify:reviewer` verifies this fresh run and unchanged deployed source.
- `npm run verify:ui` exercises the built frontend's actual DOM handlers against real document URLs and real RPC: example verification, copying inputs, commitment ID recovery, finalized consensus result and JSON export.
- `npm run verify:ui:public` repeats that test against downloaded production HTML/JS and records their hashes in docs/evidence/reviewer-ui-live.json.
- These tests use a DOM implementation and do not claim browser rendering, mobile or extension-wallet QA. Signing was separately exercised through the live Studio browser UI.
