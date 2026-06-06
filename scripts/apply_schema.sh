#!/usr/bin/env bash
set -euo pipefail

# Apply supabase/schema.sql to the database.
# Usage: SUPABASE_DB_URL=postgres://... bash scripts/apply_schema.sh

if [ -n "${SUPABASE_DB_URL:-}" ]; then
  echo "Applying schema via psql to SUPABASE_DB_URL"
  psql "$SUPABASE_DB_URL" -f supabase/schema.sql
else
  echo "SUPABASE_DB_URL not set — attempting to use supabase CLI (requires supabase logged in and project configured)"
  supabase db push --schema supabase/schema.sql || {
    echo "supabase db push failed. Install supabase CLI or set SUPABASE_DB_URL and try again.";
    exit 1;
  }
fi
