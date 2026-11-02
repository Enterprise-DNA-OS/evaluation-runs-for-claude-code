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

The manual [GitHub verification run](https://github.com/Enterprise-DNA-OS/evaluation-runs-for-claude-code/actions/runs/41542577701) passed all five jobs: Node 20 and 22 on ubuntu-latest and windows-latest, plus PostgreSQL 17. These jobs tested code commit 7b61f74. No model API or customer system is part of validation.

The generated weekly report was checked in a headless browser at 1440 and 390 pixels. Neither viewport has document-level horizontal overflow; wide report sections scroll inside their own container.

The Landing Pages target was rendered using the unchanged shared Astro route and components in an isolated preview. Desktop (1440px) and mobile (390px) checks found no page-level horizontal overflow or browser errors. The page returned noindex,nofollow and eight booking links carrying this target's campaign value. The rendered-page quality gate passed. The evaluation decision packet was also opened and visually inspected. This is a focused route check, not a full marketing-site build.
