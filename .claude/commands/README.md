# Slash commands

34 recurring-job recipes. README.md is this index, not a command. Run npm run eval -- help for the 31 CLI verbs, including help.

- [projects](projects.md): Read the project owners, purpose and data-handling review dates.
- [suites](suites.md): Read versioned acceptance suites and their review dates.
- [cases](cases.md): Inspect the exact expected answers, assertions and latency limits.
- [runs](runs.md): Read coverage, saved outcomes, reviews and evidence freshness.
- [run](run.md): Read one run with its saved evidence and notes.
- [observations](observations.md): Inspect recorded answers and source call references.
- [score](score.md): Preview every case against the recorded answers. Missing answers fail.
- [evaluate](evaluate.md): Save the complete input snapshot and per-case outcomes under the actual evaluator name.
- [results](results.md): Read current saved results. Stop when the evidence is stale.
- [compare](compare.md): Compare two current evaluations with identical case definitions and show each regression.
- [cohorts](cohorts.md): Count passes and failures by the business group attached to each case.
- [failures](failures.md): Read the failed checks, including missing answers and latency problems.
- [attention](attention.md): Find incomplete, failed, stale or overdue runs.
- [compliance](compliance.md): Read data-handling and suite-review dates. These are review reminders, not legal certification.
- [reviews](reviews.md): Read the review history tied to each saved evaluation.
- [actions](actions.md): Read follow-up work, owners, due dates and resolution evidence.
- [add-project](add-project.md): Register the real owner, purpose and agreed access and retention review dates. These dates are local policy.
- [add-suite](add-suite.md): Register a named version of the acceptance suite. Resolve the project first.
- [add-case](add-case.md): Read examples/case.json and write the agreed test case to a private staging file. Never invent the expected answer.
- [add-run](add-run.md): Create an answer set for a stated model or prompt version and actual producer.
- [record](record.md): Read examples/observation.json. Record an actual output and measured latency. Never fabricate an answer or timing.
- [review](review.md): Read current results and open actions first. A real different reviewer approves only complete passing evaluations. Never invent a second identity.
- [add-action](add-action.md): Register a concrete failure to fix, an actual owner and an agreed due date.
- [close-action](close-action.md): Record the actual resolution evidence and operator identity. Closing work does not change old scores.
- [log](log.md): Append the actual decision or observation to the run history.
- [history](history.md): Read notes in order before preparing a review.
- [import](import.md): Read docs/replace-wandb-weave.md. Inspect the export and explicit mapping. Get the independent source count. Dry-run, reconcile, then import. No credentials are required here.
- [export](export.md): Write the full database contents to a new private JSON file. Keep source exports separately. Never overwrite an existing backup.
- [weekly-review](weekly-review.md): Draft the Monday review from attention, open actions and compliance. Return the generated file in chat. Never send it.
- [draft-review](draft-review.md): Draft a decision packet from current saved results and the actual review history. Return the generated file in chat. It does not authorise a deployment.
- [customise](customise.md): customise
- [new-view](new-view.md): new-view
- [views](views.md): views
- [documents](documents.md): documents
