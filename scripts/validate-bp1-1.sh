#!/usr/bin/env bash
# BP1.1 Platform Foundation aggregate validator.
#
# Runs type-check, lint, unit tests, production build, and — when
# SUPABASE_DB_URL is set — the BP1.1 SQL regression suite. Exits non-zero
# on the first failure.
#
# Usage:
#   ./scripts/validate-bp1-1.sh
# Optional:
#   SUPABASE_DB_URL=postgres://... ./scripts/validate-bp1-1.sh

set -euo pipefail

step() { printf '\n\033[1;36m== %s ==\033[0m\n' "$*"; }

step "Type check (tsgo)"
if command -v tsgo >/dev/null 2>&1; then
  tsgo --noEmit
else
  npx --yes tsc --noEmit
fi

step "Lint"
bun run lint || npm run lint

step "Unit / component tests"
bun run test || npm test

step "Production build"
bun run build || npm run build

if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
  step "SQL regression: BP1.1A"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bp1_1a_regression.sql
  step "SQL regression: platform security"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bp1_1_platform_security.sql
  step "SQL regression: tenant isolation"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bp1_1_tenant_isolation.sql
  step "SQL regression: invitations"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bp1_1_invitations.sql
  step "SQL regression: last-administrator"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bp1_1_last_admin.sql
else
  echo ""
  echo "SUPABASE_DB_URL not set — SQL regression suite BLOCKED."
  echo "Provide a disposable DB URL to complete BP1.1 validation."
fi

echo ""
echo "BP1.1 validation completed."
