# Terraform VM governance workflow

1. Normalize and deduplicate the ServiceNow request.
2. Use AI to classify intent and extract facts.
3. Enrich technical facts from Azure and CMDB before asking the requester.
4. Apply deterministic completeness rules and separate customer-owned missing
   information from internal platform gaps.
5. Resolve an approved capability by provider, resource type, action, version,
   and environment. Similar text or an arbitrary `.tf` file is not a match.
6. If no approved capability exists, create an engineering gap. AI may draft a
   module, but the request pauses until tests and human approval finish.
7. Generate a plan with server-resolved inputs only.
8. Block destroy, replacement, extra targets, target mismatch, or version drift.
9. A different platform administrator approves the exact plan digest.
10. Apply once, validate Azure and telemetry, preserve evidence, and update
    ServiceNow.

## Initial rollout

- Start, stop and restart use the reusable AzAPI action module.
- Resize uses a narrowly scoped AzAPI update module and is initially restricted
  from production.
- OS disk expansion stays in `testing` until disk ownership and import/adoption
  are proven safely.
- Keep the current direct Start-VM executor during runner rollout. Retire it only
  after the self-hosted runner passes end-to-end tests.
