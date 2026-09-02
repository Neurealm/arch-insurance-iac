# Terraform environments

Environment directories contain backend and deployment configuration only. Reusable Azure operations belong in `terraform/modules`.

Rules:

- Never commit Terraform state, saved plans, credentials, access keys, or generated `.tfvars`.
- Supply backend values to `terraform init` from the controlled runner.
- Authenticate to Azure with the runner's managed identity.
- Use a different state key and access boundary for every customer environment.
- Do not place ticket-generated HCL in this directory.

The pilot configuration is in `pilot/`. It declares the Azure Blob backend contract without embedding customer-specific values.
