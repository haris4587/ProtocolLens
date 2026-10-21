# Deployment

- Network: stable Studionet, chain 61999, `https://studio.genlayer.com/api`.
- Release contract: `0x6E1fE2A506e4aA6a86c3a4d64d741A2c5a6E7427`.
- SDK: contract v0.2.16; browser `genlayer-js` 1.1.8 (locked in package-lock.json).
- Deployment: `0x2356d0e589e65aef6df512aaeb39a045ccb89670bb852141d66a1b44be00a880`.
- Demo commitment: `0xd7a882e5590efdd697073289c85f43650850e385b2b09696c4aa5a7423ae5548`.
- Live comparison: `0x500e2c45fd5ade323a303e0ca4435b646770990579fbde34a4df33c8328cf014`.
- Execution mode: Normal (Full Consensus), simulation off, Studio built-in account.
- Demo outcome: FINALIZED / SUCCESS, DEVIATIONS, primary_outcome UNEXPLAINED.

The deployed source is compared byte-for-byte by `scripts/verify-live.mjs`; its checksum is saved in deployment.json. The public app is a bundled static build. Sites source synchronization and deployment are separate from the public GitHub mirror; no source credentials or runtime secrets are tracked.

## Reproduce with the existing contract

Follow [the exact reviewer workflow](REVIEWER_WORKFLOW.md). Import the existing release by address using Studio's **Import Contract** dialog beside Upload; uploading a Python file alone does not attach a fresh session to the deployment. No deployment or upgrade is required. Both commitment and consensus review have been repeated from a fresh Studio built-in account on 2026-10-21 (record 2). Their hashes are in deployment.json under workflow, and independently verifiable evidence is in docs/evidence/reviewer-transactions.json.

## Official references checked

- https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle
- https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms
- https://docs.genlayer.com/developers/intelligent-contracts/features/web-access
- https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-studio
- https://docs.genlayer.com/developers/networks
- https://docs.genlayer.com/api-references/genlayer-linter

Independent evidence and custom validator design follow the official leader/validator guidance. Stable Studio uses chain 61999; Studio-dev is a different environment and is not substituted. Earlier development and diagnostic instances are historical and are not the configured release.
