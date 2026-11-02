---
description: "Read examples/case.json and write the agreed test case to a private staging file. Never invent the expected answer."
---

# add-case

Read examples/case.json and write the agreed test case to a private staging file. Never invent the expected answer.

Run:

```bash
npm run eval -- add-case --suite= --file=<case.json>
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
