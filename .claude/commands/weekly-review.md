---
description: "Draft the Monday review from attention, open actions and compliance. Return the generated file in chat. Never send it."
---

# weekly-review

Draft the Monday review from attention, open actions and compliance. Return the generated file in chat. Never send it.

Run:

```bash
npm run eval -- weekly-review 
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
