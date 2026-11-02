---
description: "Preview every case against the recorded answers. Missing answers fail."
---

# score

Preview every case against the recorded answers. Missing answers fail.

Run:

```bash
npm run eval -- score --run=<run>
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
