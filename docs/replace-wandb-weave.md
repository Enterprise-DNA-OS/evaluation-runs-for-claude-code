# Replace saved evaluation work from Weights & Biases Weave

This path moves exported call records into an owned acceptance review system. It does not migrate the full Weave service. Reviewed 2 November 2026.

## Export and check scope

In your authorised Weave project, select the call records for one model or prompt version and the case suite you intend to evaluate. Export JSON, JSONL or CSV. Include the call ID, project ID, output, case key and timings. Check the selected filters and the independent source row count before leaving the vendor. Retain the original export privately.

Weave's [official release notes](https://github.com/wandb/weave/releases/tag/v0.50.14) document JSON, JSONL and CSV exports. Its [client source](https://github.com/wandb/weave/blob/master/weave/trace/weave_client.py) documents call queries and fields. Menu labels and columns depend on your current Weave interface. The pricing address now redirects to CoreWeave Forge, which still names Weave.

If your calls refer to remote objects rather than containing their values, export the resolved values before import. This tool never fetches a reference. Restrict the export to the answer calls, not every nested scorer and evaluation call. One case needs one answer per run. Use separate runs for repeated trials.

## Prepare the destination

Register a project and a versioned suite. Add the cases with the agreed expected values and checks. Expectations are independent business requirements, not guessed from a successful output. Create one run using add-run and identify its model version and actual producer.

The fixture examples/weave-calls.jsonl uses attributes.case_key and attributes.latency_ms as user-defined attributes. They are not universal Weave fields. If your key lives elsewhere, pass --map with explicit field paths. The importer never matches a case by a similar question.

| Destination | Default export path | Contract |
|---|---|---|
| Call ID | id | Nonempty source identifier |
| Source project | project_id | All rows in one import must agree |
| Case key | attributes.case_key | Exact key in the selected suite |
| Answer | output | A complete JSON value, including null |
| Latency | attributes.latency_ms | Nonnegative integer milliseconds |
| Exception | exception | Any nonempty value fails the check |
| Original call | Entire row | Preserved with file fingerprint and mapping |

When explicit latency is absent, valid started_at and ended_at timestamps supply the elapsed milliseconds. A missing latency stays unknown and fails any configured latency limit. CSV exports must use JSON-encoded cells for inputs, output, attributes and summary. Flattened fields can be mapped by their literal header. For a mapped output column, use a JSON string such as `"Contact support"`, not unquoted text. JSON object-key order does not affect exact-match scoring.

## One-command import

After creating the destination run:

```bash
npm run eval -- import weave --run="Imported answers" --file=imports/weave-calls.jsonl --map=examples/mapping.json --expected-count=4 --source-ref="Support project, v3 answer calls, unfiltered suite" --actor="Your actual name" --dry-run
```

Review the count and mapped source project. Repeat without --dry-run to commit. Then run observations, evaluate and results for that run. Compare against your baseline and independently inspect a few source outputs, all exceptions and any missing cases.

The import is atomic. An unknown case, duplicate key or source ID, mixed source project, bad time or mismatched count rejects the whole file. Reimporting identical bytes with the same run and mapping does nothing. The same call cannot appear in a different run under the same source project and ID. Evaluated runs are sealed; corrected answers need a fresh run with real new source identifiers.

## What stays separate

The original records are retained, but existing vendor scores are not treated as verified scores in this system. This base reruns its own exact, substring, JSON and latency checks. Imported summary fields remain source evidence. Source feedback, nested traces, datasets, media attachments, arbitrary Python scorers, monitoring rules, integrations, vendor access controls and custom dashboards do not become executable features here. Enterprise DNA scopes the migration and required connections for the custom version.

Both systems should be checked side by side before cancelling a contract. Keep the vendor until the actual acceptance coverage, privacy controls and required integrations are accounted for. A prepared export is a one-command import, not a promise that every enterprise installation switches in a day.
