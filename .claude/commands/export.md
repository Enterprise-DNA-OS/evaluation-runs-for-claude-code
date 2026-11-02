---
description: "Write the full database contents to a new private JSON file. Keep source exports separately. Never overwrite an existing backup."
---

# export

Write the full database contents to a new private JSON file. Keep source exports separately. Never overwrite an existing backup.

Run:

```bash
npm run eval -- export --file=<new-file.json>
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
