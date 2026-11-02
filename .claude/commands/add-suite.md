---
description: "Register a named version of the acceptance suite. Resolve the project first."
---

# add-suite

Register a named version of the acceptance suite. Resolve the project first.

Run:

```bash
npm run eval -- add-suite --project= --name= --version= --review-due=YYYY-MM-DD
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
