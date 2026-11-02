# Validation evidence

2 November 2026, Linux, Node 22.23.4, embedded PGlite.

- npm install: passed, zero reported dependency vulnerabilities.
- npm test: PASS, 71 assertions covering all 31 CLI verbs.
- npm run demo: passed. Baseline 4/4, candidate 1/4, three explicit regressions including one missing answer.
- npm run view: passed, one read-only weekly report.
- npm run docs: passed, two evaluation decision packets and one data handling review.
- Command count: 34 recipes under .claude/commands, including customise, new-view, documents and views.
- Demo capture: docs/demo-captures.json contains actual command stdout, not invented examples.
- Page gate: check-page.mjs wandb-weave PASS in the Command Centre, zero brand errors.

The manual GitHub workflow includes Node 20/22 on Windows and Linux and a PostgreSQL 17 job. Results are recorded below once those jobs run. No model API or customer system is part of validation.
