# Draft submission

Title: ProtocolLens — Version-Bound Research Protocol Reviews

ProtocolLens compares research reports with committed preregistration snapshots using a GenLayer Intelligent Contract. Validators independently retrieve SHA-256/byte-bound, commit-pinned documents, assess primary outcomes, planned analyses, populations and sample sizes, and check supporting excerpts. Deterministic rules derive ALIGNED, EXPLAINED_CHANGES, DEVIATIONS or INCONCLUSIVE and preserve a hash-linked, append-only review history. The public app reads finalized Studionet state, prepares document commitments locally, routes signed writes through Studio's built-in account and exports verified review bundles. Includes adversarial tests and deployment evidence. Snapshot integrity does not establish registry authority or preregistration chronology. The demonstration uses synthetic documents. Check LIVE_TEST.md before submission; an inconclusive live result must not be described as a successful deviation classification.

Evidence:
- Public app: https://protocollens.itzanza2.chatgpt.site
- Repository: https://github.com/haris4587/ProtocolLens
- Contract source: contracts/protocol_lens.py
- Live evidence: docs/LIVE_TEST.md and docs/evidence/live-review.json
- Validation: docs/VALIDATION.md
