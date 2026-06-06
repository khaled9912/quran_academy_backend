#!/usr/bin/env bash
set -euo pipefail

# Create recommended Supabase storage buckets using supabase CLI.
# Requires: supabase CLI authenticated and project configured.

buckets=(avatars assignments submissions certificates "teacher-documents" recordings)

for b in "${buckets[@]}"; do
  echo "Creating bucket: $b"
  supabase storage create-bucket "$b" --public false || echo "Failed or bucket exists: $b"
done

echo "Buckets creation attempted. Verify in Supabase dashboard or via supabase storage list."
