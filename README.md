# ProtocolLens

**Research, held to its word.** Compare a published research report with its committed preregistration using a real GenLayer Intelligent Contract.

Public app: https://protocollens.itzanza2.chatgpt.site

Network: Studionet (61999). Contract: `0x6E1fE2A506e4aA6a86c3a4d64d741A2c5a6E7427`.

> Live verified: finalized Full Consensus returned DEVIATIONS for an unexplained primary-outcome switch. Source bytes, document hashes, transaction success and receipt hashes are verified. See docs/LIVE_TEST.md.

## Workflow

1. Open **Create & review** in the public app and load the synthetic example, or hash your own complete document snapshots.
2. In Studio use **Your Contracts → Import Contract** (document/down-arrow icon), paste the existing release address, then open **Run and Debug**. No redeployment is needed.
3. Call `commit_study` with the app's seven individually copyable fields using Studio's built-in account. Paste its transaction hash back into **Track commitment** to recover the finalized new record ID.
4. From the same Studio account call `review(new_id)` in **Normal (Full Consensus)** with simulation off. Paste its hash into **Track consensus review**.
5. Inspect the finalized decision, exact excerpts and append-only history; verify and export a transaction-linked JSON receipt.

**[Exact reviewer instructions, recovery steps and reproducible end-to-end evidence](docs/REVIEWER_WORKFLOW.md).** The **Verify recorded end-to-end example** button rechecks both real writes without sending a transaction. The frontend verifies Studionet 61999, the deployed source checksum, transaction destination/method/mode/execution, creator, committed arguments and receipt hashes. Signing remains in Studio; the app never stores keys.

## Milestone v1: reproducible evidence audits

The new read-only audit toolkit reauthenticates pinned source bytes, validates all receipt attempts, locates every exact excerpt by line and UTF-8 byte range, and exports printable HTML plus JSON. Run `npm run audit:evidence -- --live` against the **same deployment**, or audit a receipt offline with the original snapshots. Imported receipts are explicitly unanchored. The browser audit controls are implemented and integration tested; publication over the existing hosted app is pending Site access.

See [Milestone v1 changes, reproduction commands, evidence and limitations](docs/MILESTONE_V1.md).

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

`npm run record:live` checks the deployed source against the repository, finalized review state, successful transaction execution and receipt hashes. `npm run verify:live` additionally requires the expected live deviation classification and passes for the recorded demo. It requires network access to Studionet. `npm run verify:site` checks public assets, the configured contract address and RPC CORS. `npm run verify:reviewer` checks the fresh reviewer run on the existing deployment. `npm run verify:ui:public` exercises the actual published frontend handlers with live RPC and exports evidence. See [deployment](docs/DEPLOYMENT.md), [live evidence](docs/LIVE_TEST.md) and [demo arguments](docs/demo-arguments.json).

## Scope and limitations

This is a document-comparison tool, not a registry oracle or a scientific validity/misconduct assessment. GitHub commits and SHA-256 authenticate the submitted snapshot version; they do not prove the snapshot faithfully reproduces an official registry or journal. A stated registration date is document content, not cryptographically verified chronology. The demo is explicitly synthetic. Use complete public documents, not private participant data. Model agreement is useful evidence of reproducible judgment, not a guarantee of truth. Studionet is a development network and may reset.
