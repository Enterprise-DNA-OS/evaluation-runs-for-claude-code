# Target research

Checked 2 November 2026. Selected family: application-evaluation. No prior target in this family was found in the registry. It is distinct from model-governance risk and approval registers, software test case management, audit data analysis and technology cost allocation.

The [vendor AWS Marketplace offer](https://aws.amazon.com/marketplace/pp/prodview-42j3r4pt3dtns) lists an Annual Commitment for W&B Weave, 10GB at US$25,000 for 12 months. This is an offer, not a verified customer invoice or the minimum price for using Weave. Additional usage and infrastructure costs can apply. The [current vendor pricing page](https://coreweave.com/forge-pricing), reached from wandb.ai/site/pricing, has Free, Pro and Enterprise plans and still names Weave ingestion and evaluation. Do not claim every user pays the Marketplace amount.

| Candidate | Annual bill | Data-shaped | Our buyers | Search demand | One-session buildable | Import path | Total |
|---|---|---|---|---|---|---|---|
| Weights & Biases Weave | 3 | 5 | 1 | 3 | 5 | 5 | 22 |
| Comet | 3 | 5 | 1 | 3 | 5 | 4 | 21 |
| PackageX | 1 | 4 | 2 | 2 | 4 | 4 | 17 |
| Optimizely | 1 | 3 | 1 | 3 | 2 | 4 | 14 |

The annual-bill scores are evidence grades, not verified NZ or AU spend. The customer brain and local CRM-reference search did not confirm a buyer or invoice for these candidates. No live CRM access was used. Buyer confidence is deliberately low. Search scores reflect visible alternatives and pricing results, not keyword volumes.

Comet's [vendor listing](https://aws.amazon.com/marketplace/pp/prodview-4jv5hpch5czwe) lists its Advanced Package at US$4,500 for 12 months. Its per-user model needs multiple licences for a five-figure annual scenario; its [current pricing](https://www.comet.com/site/pricing/) also offers a cheap Pro tier. PackageX's [mailroom page](https://packagex.io/solutions/mailroom) confirms exported dashboard data but no five-figure public price was verified. Optimizely's [official feature matrix](https://world.optimizely.com/globalassets/products/pdf/webexperimentationfeaturematrixjuly2024.pdf) documents CSV export, but experiment delivery is wider than a records-only build and no public annual bill was verified. These candidates were not registered.

## Source-backed scope

- [Weave release v0.50.14](https://github.com/wandb/weave/releases/tag/v0.50.14) records export to JSON, JSONL and CSV.
- [Weave client source](https://github.com/wandb/weave/blob/master/weave/trace/weave_client.py) documents call IDs, project IDs, inputs, outputs, attributes, summaries and time fields.
- [Weave evaluation reference](https://docs.wandb.ai/weave/reference/python-sdk) describes datasets, scorers and saved evaluation results.
- [Weave's own repository](https://github.com/wandb/weave) is an existing open-source toolkit. Our claim is a focused owned review record, not unique availability of free source code.

The build supports deterministic evaluation of exported or manually captured outputs. It does not replicate hosted tracing, runtime model calls, media, arbitrary scorer execution or the wider development platform. It never asserts that Weave cannot answer a question that its configurable tools support.
