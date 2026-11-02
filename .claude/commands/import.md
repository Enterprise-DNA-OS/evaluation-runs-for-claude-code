---
description: "Read docs/replace-wandb-weave.md. Inspect the export and explicit mapping. Get the independent source count. Dry-run, reconcile, then import. No credentials are required here."
---

# import

Read docs/replace-wandb-weave.md. Inspect the export and explicit mapping. Get the independent source count. Dry-run, reconcile, then import. No credentials are required here.

Run:

```bash
npm run eval -- import weave --run= --file=<calls.jsonl|json|csv> --expected-count=N --source-ref= --actor= [--map=mapping.json] [--dry-run]
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
