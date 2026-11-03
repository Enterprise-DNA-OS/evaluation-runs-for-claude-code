# Evaluation Runs for Claude Code

Keep the answers, the checks and the evidence behind a release decision in your own database. A focused alternative for the saved evaluation work teams do in Weights & Biases Weave.

Built by **Enterprise DNA**. MIT licence. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Install the database and commands below. | Your acceptance checks, export mapping, reports and review process. | Installed, connected and operated through Omni by Enterprise DNA. Setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_medium=github&utm_campaign=wandb-weave) | [Book a call](https://enterprisedna.co/omni/book/?offer=replace-software&utm_medium=github&utm_campaign=wandb-weave) |

## Quick start

Node 20 or newer. The demo needs no hosted database, vendor account or model service.

```bash
git clone https://github.com/Enterprise-DNA-OS/evaluation-runs-for-claude-code.git
cd evaluation-runs-for-claude-code
npm install
npm run demo
npm run eval -- compare --baseline=Baseline --candidate=Candidate
npm run view
npm run docs
```

The fictional support demo has four acceptance cases. The baseline passes all four. The candidate passes one: it changes the return window, exceeds a latency limit and omits the fallback answer. The missing answer remains in the denominator. No model was called to produce these fixtures.

PGlite stores local records under .data/db. For shared PostgreSQL, set DATABASE_URL and run npm run migrate. Use a fresh database for the demo. The CLI is a trusted operator tool, not a sign-in service. Hosted business use needs access controls, backups and an agreed retention process.

## The working week

1. `/attention` finds incomplete runs, failed checks, overdue reviews and stale evidence.
2. `/import` brings prepared Weave exports into a named answer set, after a dry run and source-count reconciliation.
3. `/evaluate` saves the inputs and outcomes of exact-match, substring and valid-JSON checks, plus optional latency limits.
4. `/compare` shows regressions against an earlier run using the same cases. `/cohorts` counts failures by business group.
5. `/review` records a real person's decision. Approval requires a different person from the producer, evaluator and answer contributors, no failed cases and no open actions.
6. `/weekly-review` drafts the Monday review from attention, actions and data-handling checks. `/draft-review` prepares a run's decision packet. Nothing sends or deploys.

There are 34 slash commands in [.claude/commands](.claude/commands), and 31 CLI verbs including help. Run `npm run eval -- help` for the arguments. Read commands support `--json`. Names match without case, ID prefixes work, and ambiguous matches list candidates and exit 1. Unknown commands and flags fail.

## What it owns

Projects, versioned suites, expected answers, answer sets, imported call records, evaluation snapshots, reviews, actions and notes. Output, source records and evaluation evidence are append-only through the application. Corrections go into a new run. A changed case makes the old score stale. Comparison refuses different case definitions, and every rendered run summary labels evidence as current, stale or not evaluated.

The free base evaluates saved outputs. It does not call a model, stream live traces, run arbitrary scorer code, issue certifications or deploy a release. Weave has a broader tracing and evaluation platform and an existing open-source toolkit. This is a smaller operating record for teams that want their own acceptance checks and decision evidence. Enterprise DNA scopes live capture and more advanced scoring when building your version.

`exact` compares complete JSON values, ignoring object-key order but preserving array order and string case. `contains` checks a nonempty literal substring in a string. `valid-json` accepts a JSON object or array, or a string that parses as JSON. It does not validate a business schema or factual correctness. Missing answers, recorded exceptions and missing required latency fail. One answer per case per run keeps coverage explicit. Repeated trials need separate runs.

## Bring Weave history across

Export the selected call records as JSON, JSONL or CSV. Inspect the filters and columns. Each call must map to an existing case key. The example uses a user-defined attributes.case_key, not a field Weave supplies automatically. See [the switching guide](docs/replace-wandb-weave.md).

```bash
npm run eval -- add-run --suite="Support acceptance" --name="Imported answers" --model-version="your-version" --actor="Your actual name" --review-due=2026-12-01
npm run eval -- import weave --run="Imported answers" --file=examples/weave-calls.jsonl --expected-count=4 --source-ref="Fictional four-call example" --actor="Your actual name" --dry-run
```

Repeat the import without `--dry-run` after checking it. One command imports a prepared export. The importer rejects unknown cases, duplicate calls, mixed source projects, invalid timings and source-count mismatches. It writes the batch atomically, preserves the raw record, and records the file fingerprint and mapping. The same file into the same run does nothing on repetition. Source call IDs cannot be duplicated across runs.

Keep live exports in imports/, which is ignored by git. The committed example is entirely fictional. Model inputs can contain personal information. Minimise them before export and agree who can read them and when retention needs review.

## Ten questions to ask

These questions are answered by the shipped commands. Weave supports configurable analysis too. This list demonstrates the owned base, not an assertion that the incumbent cannot answer them.

1. Which cases passed before and now fail? `compare`
2. Did the candidate omit any expected answers? `score`
3. Which correct answers exceed our latency limits? `failures`
4. Which business group contains the most failed checks? `cohorts`
5. Which saved approvals refer to changed case definitions? `runs`
6. What exact inputs and rules supported an earlier result? `run`
7. Who reviewed the result and what evidence did they give? `reviews`
8. Which unresolved actions are overdue and who owns them? `actions`
9. Which data access or retention review dates have passed? `compliance`
10. What needs the team lead's attention this week? `weekly-review`

## Your first hour: ten things to ask for

1. Put our name, colours and logo in brand.json.
2. Create our project with a real owner and purpose.
3. Set our access and retention review dates.
4. Add a suite with its version and review date.
5. Add the expected answers our team has agreed.
6. Separate policy, formatting and fallback cases into business groups.
7. Map the case identifier in our Weave export.
8. Reconcile the call count and import an answer set.
9. Compare the candidate with a passing baseline.
10. Assign failures and draft a packet for a different reviewer.

`/customise` adds a field or changes a rule through a new tested migration. `/new-view` adds a read-only report. The database remains the product, whichever agent you use.

## Documents, controls and backups

`npm run docs` renders evaluation decision packets and data handling reviews as branded HTML in docs-out/. `npm run view` renders views/week.html. Both use brand.json and escape record values. The reports have no action buttons. Open them locally or print them to PDF. [Why no front end](docs/why-no-front-end.md).

`/compliance` checks local review dates against cited NZ privacy principles and Australian guidance. It is not a legal opinion or certification. [Rules and sources](docs/compliance.md). A typed actor name is attribution, not authentication, and a privileged database owner can bypass database controls. Human review of actual identities and external access controls remains necessary.

`npm run eval -- export --file=exports/backup-2026-11-02.json` writes every domain record and saved snapshot to a new private JSON file. It refuses to overwrite. Keep original exports and database backups independently. The JSON format is documented by its table names and migration; automated restore is not included.

## Validation and architecture

`npm test` uses an isolated temporary database and exercises all CLI verbs, repeat migrations and seed, missing-case denominators, regressions, stale evidence, review gates, import rollback and idempotency, CSV quoting, complete export and HTML escaping. A manual workflow covers Node 20/22 on Windows and Linux plus PostgreSQL 17. Actual execution evidence is in [docs/validation.md](docs/validation.md).

One CLI: scripts/evaluations.mjs. Shared scoring: scripts/lib/evaluate.mjs. Plain PostgreSQL migrations: supabase/migrations. Report declarations: views.json and documents.json. No model API dependency. [Research and candidate scores](docs/research.md).

MIT. Built and optionally operated through [Omni by Enterprise DNA](https://enterprisedna.co/omni/instead-of/wandb-weave?utm_source=github&utm_medium=readme&utm_campaign=wandb-weave).
