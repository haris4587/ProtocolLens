# Draft submission

Title: ProtocolLens — Version-Bound Research Protocol Reviews

ProtocolLens compares research reports with committed preregistration snapshots using a GenLayer Intelligent Contract. Validators independently retrieve SHA-256/byte-bound, commit-pinned documents, assess primary outcomes, planned analyses, populations and sample sizes, and check supporting excerpts. Deterministic rules derive ALIGNED, EXPLAINED_CHANGES, DEVIATIONS or INCONCLUSIVE and preserve a hash-linked, append-only review history. The public app reads finalized Studionet state, prepares document commitments locally, routes signed writes through Studio's built-in account and exports verified review bundles. Includes adversarial tests and deployment evidence. Snapshot integrity does not establish registry authority or preregistration chronology. The demonstration uses synthetic documents. The Full Consensus live demo finalized DEVIATIONS for an unexplained primary-outcome switch; source and receipt hashes are verified.

Evidence:
- Public app: https://protocollens.itzanza2.chatgpt.site
- Repository: https://github.com/haris4587/ProtocolLens
- Contract source: contracts/protocol_lens.py
- Live evidence: docs/LIVE_TEST.md and docs/evidence/live-review.json
- Validation: docs/VALIDATION.md


## Steward follow-up

Use [the updated reviewer workflow](REVIEWER_WORKFLOW.md) and [the steward response](STEWARD_RESPONSE.md). Reviewers can import the existing release by address, submit both methods with their own Studio built-in account, track transactions in ProtocolLens and export the finalized receipt. The recorded fresh run is record 2; reviewers creating their own run must use the newly returned ID.
