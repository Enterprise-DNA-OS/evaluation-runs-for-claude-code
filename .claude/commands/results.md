---
description: "Read current saved results. Stop when the evidence is stale."
---

# results

Read current saved results. Stop when the evidence is stale.

Run:

```bash
npm run eval -- results --run=<run>
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
