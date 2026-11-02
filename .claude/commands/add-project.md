---
description: "Register the real owner, purpose and agreed access and retention review dates. These dates are local policy."
---

# add-project

Register the real owner, purpose and agreed access and retention review dates. These dates are local policy.

Run:

```bash
npm run eval -- add-project --name= --owner= --purpose= --access-review-due=YYYY-MM-DD --retention-review-due=YYYY-MM-DD
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
