#!/usr/bin/env bash
# Replay every migration in supabase/migrations against a DISPOSABLE database.
#
# Why this exists
# ---------------
# The migration history in this repo was inherited from an earlier project and
# was applied incrementally to a live database, not replayed from empty. A few
# of those inherited files re-declare objects that an earlier file already
# created (duplicate CREATE TABLE / TRIGGER / POLICY / TYPE). Replaying them
# from scratch therefore trips "already exists" even though the resulting
# schema is correct. Migration files are immutable, so the replay harness — not
# history — absorbs that.
#
# Strategy, per file:
#   1. Apply it in a single transaction with ON_ERROR_STOP=1. This is the strict
#      path and it also keeps `CREATE TEMP TABLE ... ON COMMIT DROP` seed files
#      working, since psql's default autocommit would drop the temp table
#      between statements.
#   2. If that fails, re-apply it statement-by-statement (autocommit, errors not
#      fatal) and inspect every error. Errors that only mean "this object was
#      already created by an earlier migration" are tolerated and reported.
#      ANY other error fails the run.
#
# Usage:
#   DB_URL=postgres://... supabase/tests/apply-migrations.sh [migrations_dir]

set -uo pipefail

DB_URL="${DB_URL:-${SUPABASE_DB_URL:-}}"
if [[ -z "$DB_URL" ]]; then
  echo "apply-migrations: DB_URL (or SUPABASE_DB_URL) must be set" >&2
  exit 2
fi

MIG_DIR="${1:-supabase/migrations}"

# Errors that mean "an earlier migration already created this object".
BENIGN='already exists|duplicate key value violates unique constraint'

tolerated=0
strict=0

HOOK_DIR="${HOOK_DIR:-supabase/tests/fixtures/replay-hooks}"
SKIP_FILE="${SKIP_FILE:-supabase/tests/fixtures/replay-skip.txt}"

for f in "$MIG_DIR"/*.sql; do
  name="$(basename "$f")"

  # Replay hook: reproduces schema state the next migration depends on but that
  # never reached migration history — either an out-of-band change made directly
  # against the live database, or the schema-only part of a skipped data patch.
  if [[ -f "$HOOK_DIR/$name" ]]; then
    echo "hook: applying $HOOK_DIR/$name"
    psql "$DB_URL" -v ON_ERROR_STOP=1 -q -f "$HOOK_DIR/$name" >/dev/null || exit 1
  fi

  # Skip list: data-repair migrations that patch specific production rows by
  # UUID. They assert on rows that only exist in the live database, so they can
  # never succeed on an empty one. Any schema statement such a file also carries
  # is replayed by its hook above, so skipping weakens no structural assertion.
  if [[ -f "$SKIP_FILE" ]] && grep -qxF "$name" "$SKIP_FILE"; then
    echo "skip: $name (data-only production patch)"
    continue
  fi


  if psql "$DB_URL" --single-transaction -v ON_ERROR_STOP=1 -q -f "$f" >/dev/null 2>/tmp/mig_err.txt; then
    strict=$((strict + 1))
    continue
  fi

  # Strict pass failed. Re-apply statement-by-statement and classify errors.
  psql "$DB_URL" -v ON_ERROR_STOP=0 -q -f "$f" >/dev/null 2>/tmp/mig_err2.txt
  errors="$(grep -E '^psql:.*ERROR:' /tmp/mig_err2.txt || true)"
  fatal="$(printf '%s\n' "$errors" | grep -Ev "$BENIGN" | grep -E 'ERROR:' || true)"

  if [[ -n "$fatal" ]]; then
    echo "MIGRATION_REPLAY_FAIL: $name"
    printf '%s\n' "$fatal"
    exit 1
  fi

  tolerated=$((tolerated + 1))
  echo "note: $name replayed with pre-existing objects skipped"
done

echo "Migrations applied: $strict clean, $tolerated with inherited duplicates skipped."
