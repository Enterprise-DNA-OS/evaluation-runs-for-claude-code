# add-run

Create an answer set for a stated model or prompt version and actual producer.

Run:

```bash
npm run eval -- add-run --suite= --name= --model-version= --actor= --review-due=YYYY-MM-DD
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
