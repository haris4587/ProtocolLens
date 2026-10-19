# Deployment

- Network: stable Studionet, chain 61999, `https://studio.genlayer.com/api`.
- Contract: `0x2B8f909AC388a5b61400a0c94Ee6D4e4401FfBB8`.
- SDK: contract v0.2.16; browser `genlayer-js` 1.1.8 (locked in package-lock.json).
- Deployment transaction: `0xba8115d8fb76366f9cbb93a548c7b59c2eb17b255de2e553b922d9d6d286e44f`.
- Demo commitment transaction: `0x792d360c921ce9b71015fc8022e4846a5fe7ae97ea04e1530cc579964c1335e3`.
- Execution mode: Normal (Full Consensus), simulation off, Studio built-in account.

The deployed source is compared byte-for-byte by `scripts/verify-live.mjs`; its checksum is saved in deployment.json. The public app is a bundled static build. Sites source synchronization and deployment are separate from the public GitHub mirror; no source credentials or runtime secrets are tracked.

## Reproduce in Studio

1. Import `contracts/protocol_lens.py`, open Run and Debug, and attach the existing contract address via the address control next to Deployed at. To deploy a separate instance, use Deploy new instance and record its address.
2. Use the built-in account selector; keep Full Consensus and simulation disabled.
3. Call `commit_study` using the seven values in demo-arguments.json. Inspect the execution result and wait for FINALIZED.
4. Call `review` with the newly created record ID, then wait for successful execution and FINALIZED.
5. Read `get_review` or `list_reviews` with the state selector set to Finalized. The website requests LATEST_FINAL explicitly.

## Official references checked

- https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle
- https://docs.genlayer.com/developers/intelligent-contracts/features/web-access
- https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-studio
- https://docs.genlayer.com/developers/networks
- https://docs.genlayer.com/api-references/genlayer-linter

Independent evidence and custom validator design follow the official leader/validator guidance. Stable Studio and its SDK use chain 61999; Studio-dev is a different environment and is not substituted.

Semantic acceptance remains incomplete; see LIVE_TEST.md. The public app is deployed and displays the actual finalized result. Earlier development addresses are not the configured release.
