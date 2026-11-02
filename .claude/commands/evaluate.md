---
description: "Save the complete input snapshot and per-case outcomes under the actual evaluator name."
---

# evaluate

Save the complete input snapshot and per-case outcomes under the actual evaluator name.

Run:

```bash
npm run eval -- evaluate --run=<run> --actor=<actual-name>
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
