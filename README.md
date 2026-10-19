# ProtocolLens

**Research, held to its word.** Compare a published research report with its committed preregistration using a real GenLayer Intelligent Contract.

Public app: https://protocollens.itzanza2.chatgpt.site

Network: Studionet (61999). Contract: `0x2B8f909AC388a5b61400a0c94Ee6D4e4401FfBB8`.

> Status: website and contract deployed; live semantic acceptance is incomplete. Both real review attempts safely returned INCONCLUSIVE / MODEL_OUTPUT_INVALID. See docs/LIVE_TEST.md.

## Workflow

1. Create complete UTF-8 plaintext snapshots of the preregistration and study. Include original public source links, study identifiers and version dates. Commit the snapshots to a public GitHub repository.
2. In **Prepare comparison**, select the exact files and their raw GitHub URLs pinned to a full 40-character commit. The browser computes SHA-256 hashes and byte lengths locally.
3. Open GenLayer Studio, import `contracts/protocol_lens.py` if needed, select the existing deployment address and call `commit_study` with the prepared arguments using Studio's built-in account. Do not redeploy to read the existing demo. No external wallet, MetaMask or private-key export is required.
4. Once the commitment transaction succeeds, call `review(review_id)` from the same Studio account. Confirm **Normal (Full Consensus)**, with simulation disabled.
5. Wait for successful execution and FINALIZED status. Load the contract in the public app to read `LATEST_FINAL` state. Inspect exact excerpts and every prior attempt; verify and export a JSON receipt.

The website deliberately sends signing actions to Studio. It never impersonates Studio's account and never stores keys. The public app itself reads real contract state using the pinned `genlayer-js` SDK.

## Intelligent Contract

The contract checks four decision-critical categories: primary outcome, planned analyses, population and sample size. Each is MATCH, EXPLAINED, UNEXPLAINED or UNCLEAR. Deterministic aggregation returns:

| Outcome | Rule |
| --- | --- |
| INCONCLUSIVE | Any UNCLEAR finding, failed evidence verification, or invalid model output |
| DEVIATIONS | At least one UNEXPLAINED finding, with no UNCLEAR findings |
| EXPLAINED_CHANGES | At least one EXPLAINED change; no unexplained or unclear findings |
| ALIGNED | All four findings MATCH |

Each validator independently downloads and authenticates both snapshots, runs its own comparison and requires exact agreement on all four classifications and the derived outcome/reason. It validates every proposed excerpt and separately grounds the leader's explanations against both documents. Disagreement cannot silently become a successful review. See [security](docs/SECURITY.md).

Each record permanently binds document URLs, hashes, byte lengths, creator, title and policy. Up to three completed review attempts append a hash-linked history. The first result stays intact; nothing overwrites prior decisions. A failed consensus transaction adds no history entry. After three attempts, create a separate record and reference the prior ID in its title/document metadata. There is no finite global candidate slot that another submitter can fill.

## Run locally

```sh
npm ci
npm run test:web
npm run build
python -m venv .venv
. .venv/bin/activate
pip install -r requirements-test.txt
pytest -q tests
genvm-lint check contracts/protocol_lens.py
```

Direct tests use the pinned official GenVM SDK v0.2.16. The first run downloads its official runtime. Tests distinguish mocked direct execution, actual SDK validator-closure checks, host-harness checks and the separate recorded live test. No mocked test is offered as live consensus evidence.

`npm run record:live` checks the deployed source against the repository, finalized review state, successful transaction execution and receipt hashes. `npm run verify:live` additionally requires the expected live deviation classification and currently fails. It requires network access to Studionet. See [deployment](docs/DEPLOYMENT.md), [live evidence](docs/LIVE_TEST.md) and [demo arguments](docs/demo-arguments.json).

## Scope and limitations

This is a document-comparison tool, not a registry oracle or a scientific validity/misconduct assessment. GitHub commits and SHA-256 authenticate the submitted snapshot version; they do not prove the snapshot faithfully reproduces an official registry or journal. A stated registration date is document content, not cryptographically verified chronology. The demo is explicitly synthetic. Use complete public documents, not private participant data. Model agreement is useful evidence of reproducible judgment, not a guarantee of truth. Studionet is a development network and may reset.
