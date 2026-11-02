---
description: "Read examples/observation.json. Record an actual output and measured latency. Never fabricate an answer or timing."
---

# record

Read examples/observation.json. Record an actual output and measured latency. Never fabricate an answer or timing.

Run:

```bash
npm run eval -- record --run= --case= --file=<observation.json> --actor=
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
