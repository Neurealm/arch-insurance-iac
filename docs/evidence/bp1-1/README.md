# BP1.1 Evidence Directory

Canonical storage location for BP1.1E release evidence. Populated by
maintainers executing `docs/bp1-1-external-execution-guide.md`. This
directory is intentionally empty until real evidence is executed —
**do not** create placeholder binary screenshots or synthetic logs.

## Layout

```
docs/evidence/bp1-1/
├── README.md          # this file
├── ci/                # GitHub Actions application-job logs
├── database/          # Migration replay + 5 SQL suite logs
├── security/          # Supabase security-scan snapshots
└── ux/                # Persona-driven UX screenshots
```

## Naming conventions

**Screenshots (UX):**

```
UX-###_<persona>_<short-description>_<YYYY-MM-DD>.png
```

Example: `UX-011_T-ADMIN-A_invite-member-success_2026-08-04.png`.

**Logs (CI / database / security):**

```
BP1.1E_<evidence-type>_<YYYY-MM-DD>.<extension>
```

Examples:

- `BP1.1E_app-job_2026-08-04.log`
- `BP1.1E_bp1_1a_regression_2026-08-04.log`
- `BP1.1E_bp1_1_platform_security_2026-08-04.log`
- `BP1.1E_bp1_1_tenant_isolation_2026-08-04.log`
- `BP1.1E_bp1_1_invitations_2026-08-04.log`
- `BP1.1E_bp1_1_last_admin_2026-08-04.log`
- `BP1.1E_security-scan_2026-08-04.md`

## Redaction requirements

Before committing any artefact:

- Redact passwords, session/access tokens, invitation `token_hash`
  values, service-role keys, and third-party PII.
- Redact any audit payload key matching
  `password|token|secret|invitation`.
- Screenshots must not include browser DevTools unless the evidence
  item explicitly requires it (e.g. UX-005 stale-data check).

## Provenance

Every artefact must be tied to the release-candidate SHA recorded in
`docs/bp1-1-test-evidence.md`. If any source file under `src/**`,
`supabase/**`, `.github/workflows/**`, or `package.json` /
`bun.lockb` changes between the validated code SHA and the evidence-
documentation SHA, the evidence set is invalid and must be re-
executed against a new release candidate.
