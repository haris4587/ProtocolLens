# Live test — passed

Date: 2026-10-19. Network: stable Studionet (61999).

Release contract: `0x6E1fE2A506e4aA6a86c3a4d64d741A2c5a6E7427`.

Source SHA-256: `bbdd7b352510f26c128ebcd3838f2419e1e1c7b9b303ae74027094758a00b6e7`.

The deployed source was downloaded through the SDK and compared byte-for-byte with `contracts/protocol_lens.py`. Transactions used Studio's built-in account `0x1C1cC1690F2dd6877d965c13F680D72eDF1FB440`, Normal (Full Consensus), simulation off. No external wallet or key export was used.

| Action | Transaction | Result |
| --- | --- | --- |
| Deploy release source | `0x2356d0e589e65aef6df512aaeb39a045ccb89670bb852141d66a1b44be00a880` | FINALIZED / SUCCESS |
| Commit pinned documents | `0xd7a882e5590efdd697073289c85f43650850e385b2b09696c4aa5a7423ae5548` | FINALIZED / SUCCESS |
| Semantic review | `0x500e2c45fd5ade323a303e0ca4435b646770990579fbde34a4df33c8328cf014` | FINALIZED / SUCCESS; DEVIATIONS |

The synthetic preregistration names sleep-quality change at week 4 as primary; the synthetic report switches primary status to mean daily step count without providing a reason. Finalized consensus marks primary_outcome UNEXPLAINED and planned_analyses, population and sample_size MATCH. Every quoted excerpt is an exact substring of its hash-verified snapshot. This is majority consensus, not a claim that every validator agreed.

`docs/evidence/live-review.json` records finalized state, consensus votes, source checksum, original commitment and the hash-linked decision. `npm run verify:live` verifies all three transactions, exact deployed source, the receipt hash chain, DEVIATIONS and the UNEXPLAINED primary-outcome finding. It passes. `npm run record:live` records infrastructure/state without asserting a particular semantic outcome.

## Failure recovery and regression

The earlier release safely returned INCONCLUSIVE / MODEL_OUTPUT_INVALID twice. Its original receipt and deployment are preserved in `docs/evidence/pre-fix-live-review.json` and `pre-fix-deployment.json`; they are not success evidence.

A diagnostic run on `0x8fd27E70e73AA85ab0e01D4ff63f04f9Af6B7A6B` logged `ValueError Invalid report`, identifying outer schema rejection before the category checks. The fix provides a literal four-check JSON skeleton and ignores unused outer metadata while preserving the exact bounded schema for each check, excerpt verification and independent semantic consensus. A regression test proves valid checks survive auxiliary outer metadata. Malformed/missing checks and invented excerpts still fail safely.

The diagnostic transaction is `0xcad2041e83a6089fbd36a5929f294e377289dec8fe73f076e78985cdefd63ed6`. The diagnostic source remains under diagnostics/ for historical reproducibility; it is not used by the public app. The public app points only to the release contract above.

## Scope

The demonstration is explicitly synthetic. Snapshot commitments authenticate submitted bytes, not official registry authority, publication dates or faithful extraction. No claim is made that this example establishes misconduct or validates scientific conclusions.
