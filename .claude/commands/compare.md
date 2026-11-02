# compare

Compare two current evaluations with identical case definitions and show each regression.

Run:

```bash
npm run eval -- compare --baseline=<run> --candidate=<run>
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
