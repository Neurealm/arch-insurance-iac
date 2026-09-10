# Terraform CI remediation agent

The capability-detail page starts this workflow when a platform administrator clicks **Synchronize CI**:

1. `terraform-ci-status-sync` reads the exact pull-request head and required GitHub Actions jobs.
2. If CI is incomplete, the browser checks again after 10 seconds.
3. If CI passes, watching stops. No capability is promoted.
4. If CI fails, `terraform-ci-remediation-agent` atomically claims one repair attempt.
5. The agent downloads only the failed job logs with the read-only GitHub token, removes common credential shapes, and sends the redacted log plus the current module source to the OpenAI Responses API.
6. The model must return complete replacements for only `main.tf`, `variables.tf`, and `outputs.tf` under the registered module directory.
7. The server regenerates the module version file and three pilot-root files from trusted templates, then parses and validates the complete seven-file archive against the action-specific policy. A rejected proposal never reaches GitHub.
8. A valid archive is committed, without force, to the existing `ai-draft/*` branch. The browser waits 10 seconds and observes CI again.

The total budget is three claimed attempts per engineering gap. Claims and completions are serialized in Postgres, so multiple open browser tabs cannot spend the same attempt or race branch updates. Stale claims may be recovered after eight minutes.

## Deliberate limits

The coding model can edit only the registered module's `main.tf`, `variables.tf`, and `outputs.tf`. The server may additionally replace that module's `versions.tf` and its three matching pilot-root files, but only with fixed trusted templates. No model output can control provider or OIDC configuration. The agent cannot edit workflows, policies, scripts, migrations, credentials, or any file outside that exact seven-file archive. It cannot create another branch or pull request, force-push, approve, merge, promote, plan, apply, destroy, or call Azure. Human GitHub review, merge, and platform promotion remain separate steps.

CI logs are treated as untrusted input. Raw logs are not stored in the engineering-gap audit table; only the attempt number, commit identities, selected model, bounded summary, and outcome are retained.

## Required server secrets

- `GITHUB_TERRAFORM_SOURCE_TOKEN`: repository Contents, Pull requests, and Actions read access.
- `GITHUB_TERRAFORM_DRAFT_TOKEN`: Contents write access limited to the Terraform repository.
- `OPENAI_API_KEY`: server-side OpenAI API key.
- `OPENAI_REMEDIATION_MODEL`: optional model override; defaults to `gpt-6-astra`.

If any required secret is missing, the endpoint returns a configuration error before claiming an attempt.
