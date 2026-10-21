# Complete reviewer workflow — existing Studionet deployment

Public frontend: https://protocollens.itzanza2.chatgpt.site

Existing contract: [0x6E1fE2A506e4aA6a86c3a4d64d741A2c5a6E7427](https://explorer-studio.genlayer.com/address/0x6E1fE2A506e4aA6a86c3a4d64d741A2c5a6E7427)

Network: stable Studionet, chain 61999, RPC https://studio.genlayer.com/api. Signing uses Studio's built-in account; no extension, private-key export or contract redeployment is needed. Studio remains the signing interface. ProtocolLens prepares inputs, checks the release/network, tracks both writes and verifies finalized results.

## Create your own review

1. Open the public app, scroll to **Review workbench**, select **Create & review**. The release address is prefilled. The source/network status should confirm Studionet 61999 and the deployed source SHA-256.
2. Click **Copy release address**, then **Open Studio**. In Studio dismiss the welcome/tutorial if present. In **Your Contracts**, click **Import Contract**: the document/down-arrow icon beside the upload icon. This is distinct from uploading a Python file. Paste the address into **Contract Address**, optionally enter a name, and click **Import**. Studio fetches the existing deployed contract.
3. Open **Run and Debug** using the terminal icon on the left. Check **Deployed at** against the release address. Leave **Normal (Full Consensus)** selected and **Simulation Mode** unchecked. Do not click **Deploy new instance** or **Upgrade code**.
4. Return to ProtocolLens and click **Load synthetic example**. The app fetches both commit-pinned remote snapshots and checks their SHA-256 hashes and byte lengths before showing seven individually copyable argument fields. The example has a timestamped title, so your new record is recognizable. Alternatively select your own exact UTF-8 files and commit-pinned raw GitHub .txt URLs, then use **Hash files & prepare Studio arguments**.
5. In Studio expand **commit_study** under **Write Methods**. Copy all seven values from the app into identically named Studio fields: `title`, `registration_url`, `registration_hash`, `registration_bytes`, `study_url`, `study_hash`, `study_bytes`. Paste strings without JSON quotes; byte counts are integers. Click **Send Transaction** once.
6. Under Studio's **Transactions**, click the new `commit_study` row. Copy its full transaction hash from the dialog. Back in ProtocolLens, paste it into **Commitment transaction hash**, then click **Track commitment**. The app checks the RPC chain, destination, method, Full Consensus mode and execution result. It polls every five seconds until FINALIZED, then decodes the returned new `review_id`, reads the finalized record, checks its creator and arguments, and verifies its commitment hash. Use this ID, not demo ID 1 or 2.
7. Keep the same built-in Studio account used in step 5. Expand **review**, enter your new ID as `review_id`, and click its **Send Transaction** once. Copy this new transaction's hash from its Studio transaction dialog.
8. Paste the hash into ProtocolLens's **Consensus review transaction hash** and click **Track consensus review**. Pending consensus states remain visible. An ACCEPTED result is not shown as finalized. On FINALIZED/SUCCESS, the app reads `get_review(id)` using `LATEST_FINAL`, verifies the creator and all commitment/history hashes, and displays the latest finalized decision, four classifications, exact excerpts and every attempt.
9. Click **Verify & export review bundle** on the tracked result. The JSON includes chain ID, contract address, transaction hash/method/signer/status, finalized read marker, document commitment, report and linked history. The app checks the record and decision hashes before exporting. If subsequent reviews exist, the result is the latest finalized record, including all attempts, rather than a historical state snapshot at the transaction's timestamp.

The example should classify the primary outcome as **UNEXPLAINED** and overall **DEVIATIONS**: sleep-quality change was registered as primary, while daily step count became primary in the report without an explanation. Planned analyses, population and sample size match. Semantic consensus is nondeterministic; an INCONCLUSIVE report remains a valid completed attempt and includes its reason.

## Recheck the recorded end-to-end run

On **Create & review**, click **Verify recorded end-to-end example**. This performs live RPC checks of both recorded writes and renders their finalized record using the same tracking code. It does not send any transaction.

A fresh Studio browser account imported the existing release and executed these writes on 2026-10-21:

| Item | Verified value |
| --- | --- |
| Existing release | `0x6E1fE2A506e4aA6a86c3a4d64d741A2c5a6E7427` |
| Built-in signer | `0x3f10904B0A2bc1Aaaddfc4627Cb071476E03Df02` |
| Commitment transaction | `0x655b1dd508c849f94a273fbb9f1965b43d9f7f48123b96ea9778a3aa7fed0799` |
| Returned record ID | `2` |
| Consensus review transaction | `0xfd753bbf4162819f762f66eec498e0ef8537d152d8fb44fcbe163cd60237a744` |
| Both transaction states | FINALIZED / execution SUCCESS / Normal Full Consensus |
| Decision | DEVIATIONS; primary_outcome UNEXPLAINED; other three MATCH |
| Source | Original deployed source unchanged; SHA-256 `bbdd7b352510f26c128ebcd3838f2419e1e1c7b9b303ae74027094758a00b6e7` |

Evidence:

- [Finalized transaction bindings and complete verified record](evidence/reviewer-transactions.json)
- [Published frontend DOM handlers + live RPC + exported receipt](evidence/reviewer-ui-live.json)
- [Studio finalized receipt screenshot](evidence/reviewer-studio-finalized.jpg)
- [Shared frontend transaction validation code](../web/workflow.mjs)
- [Frontend integration verifier](../scripts/verify-ui-live.mjs)

Reproduce without submitting writes:

```sh
npm ci
npm run test:web
npm run build
npm run verify:reviewer
npm run verify:site
npm run verify:ui:public
```

`verify:reviewer` compares deployed source and validates the recorded commitment/review using the same transaction inspector as the frontend. `verify:ui:public` downloads the published HTML and JavaScript, executes their real handlers in a DOM implementation, fetches real pinned documents, performs real RPC reads, exercises field copying and both tracking flows, and verifies the downloaded JSON bundle. It records the published artifact hashes. This is reproducible interface-to-contract evidence, not visual, mobile, extension-wallet or cross-browser QA.

## Errors and transaction recovery

Wrong destination/method/network, leader-only execution, finalized failure, missing hashes, creator mismatch and broken receipt hashes stop with an explicit error. A Studio execution failure is different from an INCONCLUSIVE report. RPC errors or a ten-minute polling timeout do not imply transaction failure: retry **Track** with the same hash; do not send duplicate writes while status is unknown. **Stop** pauses local polling only. Transaction hashes survive a page reload where local storage is available; click Track again to resume. Only the creator can review a record, with at most three completed attempts. Use a new record afterward; previous history remains intact.

Snapshot commitments prove submitted bytes, not registry authority, chronological preregistration or scientific validity. The example is synthetic. Studionet is a development network and can reset.
