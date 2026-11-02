# Data-handling controls and review rules

Checked 2 November 2026. These are record checks, not certification or legal advice. The application tests saved outputs and keeps review evidence. It does not take responsibility for a regulated decision or certify a model for use.

| Rule | Application check | Source and scope |
|---|---|---|
| Protect personal information from unauthorised use and loss | Projects require an owner, purpose and access_review_due. The compliance command reports overdue access reviews. | [NZ Privacy Principle 5](https://www.privacy.org.nz/privacy-principles/5/). The reminder is evidence of a process, not proof that storage is secure. |
| Keep personal information only while required for a lawful purpose | Projects require retention_review_due. The compliance command flags overdue reviews. No fixed legal retention duration is invented. | [NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/). Review necessity and any applicable retention obligations. |
| Secure and appropriately dispose of personal information where APP 11 applies | Use the same access and retention review records, and document the decision. | [Australian APP 11 guidance](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information). Applicability and exceptions must be assessed for the entity and records. |
| Revisit acceptance cases | Suites require review_due. The compliance command flags overdue suites. | Local operating policy, not a legal deadline. The business chooses the date. |
| Preserve the basis of a review | Saved results carry the full case and observation snapshot. Changes mark them stale. | Local evidence policy. Fingerprints detect differences, not privileged tampering. |
| Keep independent review distinct from preparation | Approval requires a different actual actor from producer, evaluator and contributors, all checks passing, and no open actions. | Local review policy. Actor strings are attribution, not authenticated identity. |

Inputs and outputs can contain personal information. Minimise data before import. The import preserves the entire source row, so reviewing only the mapped answer is insufficient. Restrict the database, originals, generated reports and backups to authorised people. The local CLI uses an owner connection; row-level restrictions on public roles do not turn it into a secure hosted application.

Review dates are supplied by the operator. Neither NZ principle gives a universal 30-day or 90-day rule. This base reports the dates but does not delete records automatically. An authorised disposal plan must account for source exports, generated drafts, snapshots and backups, as well as the live database. The append-only controls are operational safeguards and can be bypassed by a privileged database owner.

Evaluation approval is not deployment authorisation. Substring checks do not prove factual correctness. JSON syntax checks do not prove that an answer meets a business schema. Do not use these checks as the sole basis for a consequential decision about a person.
