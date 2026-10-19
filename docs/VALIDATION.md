# Validation results — 2026-10-19

- 32 Python tests pass: GenVM direct contract tests, captured SDK validator acceptance/disagreement/prose validation, and a separate host harness.
- 4 Node tests pass: pinned URLs, address validation, canonical serialization, and receipt-tampering rejection.
- GenVM lint: 3 checks pass.
- SDK semantic validation: passes; 2 write and 2 view methods.
- Production browser bundle: builds successfully.
- Deployed source is byte-identical to contracts/protocol_lens.py (checksum in deployment.json).
- Real Studio Full Consensus deployment and commitment finalized successfully, signed by Studio's built-in account.
- The live semantic result is documented in LIVE_TEST.md and docs/evidence/live-review.json. Offline semantic mocks do not establish a successful live deviation classification.

Browser layout and interaction QA of the public app were not run: this managed environment does not expose the required control-browser skill. Static build checks and direct SDK finalized-state reads are available. No visual screenshot or mobile-interaction verification is claimed for the public website.
