# Live test — incomplete semantic acceptance

Date: 2026-10-19. Network: stable Studionet (61999).

Contract: `0x2B8f909AC388a5b61400a0c94Ee6D4e4401FfBB8`.

Source SHA-256: `c592d3b67cffc2fa063a8d11dff55d863d3e0b31df23d18018a29714e7c5f140`.

The deployed source was downloaded through the SDK and compared byte-for-byte with `contracts/protocol_lens.py`. Transactions used Studio's built-in account `0x34491d9a9492Cd6213dAb2E541AEd796DaE1Bca8`, Normal (Full Consensus), simulation off. No external wallet or key export was used.

| Action | Transaction | Result |
| --- | --- | --- |
| Deploy exact final source | `0xba8115d8fb76366f9cbb93a548c7b59c2eb17b255de2e553b922d9d6d286e44f` | FINALIZED / SUCCESS |
| Commit version-pinned documents | `0x792d360c921ce9b71015fc8022e4846a5fe7ae97ea04e1530cc579964c1335e3` | FINALIZED / SUCCESS |
| Review attempt 1 | `0x0d656f50bb0e3c2e7d3a03adf1b97ff8308382545a3eac39ac885341caba558c` | FINALIZED / SUCCESS; INCONCLUSIVE |
| Review attempt 2 | `0x97357c29a57c3e5ead9f484f31b7cadfd92f984fa07fe595bbdc5ca3a30ac063` | FINALIZED / SUCCESS; INCONCLUSIVE |

Both semantic attempts returned `MODEL_OUTPUT_INVALID`. This is safe failure behavior, **not** a successful demonstration of deviation classification. The expected synthetic outcome switch has not been successfully demonstrated live. Do not submit this project as fully verified yet.

`docs/evidence/live-review.json` records the finalized state, individual consensus votes, source hash, original commitment and both hash-linked attempts. The first decision remains unchanged after retry. `npm run record:live` verifies infrastructure and saves actual evidence. `npm run verify:live` additionally requires the latest report to detect the expected UNEXPLAINED primary-outcome switch; that acceptance check currently fails.

## Remaining work

Trace the live model-output rejection, correct its root cause, rerun tests and deploy the final corrected source, then demonstrate the endpoint switch. A prepared variant in `diagnostics/protocol_lens_diagnostics.py` only adds bounded error-class/message logging to the existing model-output failure path. It has **not** been deployed. Automatic approval review rejected its separate persistent Studionet deployment as outside clearly authorized scope. Explicit user approval is needed before retrying that additional deployment.

Earlier development instances are not the release address and are not linked as success evidence. The public app points to the exact-source deployment above and displays its actual finalized INCONCLUSIVE state.
