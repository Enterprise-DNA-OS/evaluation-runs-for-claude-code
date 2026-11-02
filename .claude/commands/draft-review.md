---
description: "Draft a decision packet from current saved results and the actual review history. Return the generated file in chat. It does not authorise a deployment."
---

# draft-review

Draft a decision packet from current saved results and the actual review history. Return the generated file in chat. It does not authorise a deployment.

Run:

```bash
npm run eval -- draft-review --run=<run>
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
