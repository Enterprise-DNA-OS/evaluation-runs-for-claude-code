---
description: "Append the actual decision or observation to the run history."
---

# log

Append the actual decision or observation to the run history.

Run:

```bash
npm run eval -- log --run= --actor= --text=
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
