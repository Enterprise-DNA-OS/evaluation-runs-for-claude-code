# close-action

Record the actual resolution evidence and operator identity. Closing work does not change old scores.

Run:

```bash
npm run eval -- close-action --action= --actor= --evidence=
```

Replace placeholders with the operator's real values. Names match without case and IDs by prefix. If several records match, present the candidates and ask which one. Use --json when processing output. Read the records, explain the result, and link any draft in chat. No sends or deployments.
