---
description: "Read the failed checks, including missing answers and latency problems."
---

# failures

Read the failed checks, including missing answers and latency problems.

Run:

```bash
npm run eval -- failures --run=<run>
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
