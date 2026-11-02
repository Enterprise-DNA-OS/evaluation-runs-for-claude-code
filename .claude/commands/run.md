---
description: "Read one run with its saved evidence and notes."
---

# run

Read one run with its saved evidence and notes.

Run:

```bash
npm run eval -- run --run=<name-or-id>
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
