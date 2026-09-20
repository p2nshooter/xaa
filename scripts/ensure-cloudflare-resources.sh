#!/usr/bin/env bash
#
# Makes sure the D1 database and R2 bucket the client portal binds to actually
# exist, then writes the database_id into wrangler.jsonc.
#
# Run from two places:
#   - .github/workflows/deploy.yml  → bootstrap in CI, using CLOUDFLARE_API_TOKEN
#   - by hand, after `npx wrangler login`, to bootstrap from a laptop
#
# Safe to run repeatedly: existing resources are just read back. If
# wrangler.jsonc already carries a real id, the file is left alone.
set -euo pipefail

cd "$(dirname "$0")/.."

CONFIG="wrangler.jsonc"
D1_NAME="xaa-portal"
R2_NAME="xaa-uploads"
PLACEHOLDER="REPLACE_WITH_D1_DATABASE_ID"

# Without credentials wrangler fails with a wall of text and the commands after
# it silently receive empty output. Checked up front so the reason is obvious.
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && ! npx wrangler whoami >/dev/null 2>&1; then
  cat >&2 <<'MSG'
No Cloudflare credentials.

  - In GitHub Actions : set the CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID secrets.
  - On your own machine: run `npx wrangler login` first.

The token needs D1:Edit, Workers R2 Storage:Edit and Workers Scripts:Edit.
MSG
  exit 1
fi

uuid_from() {
  grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' <<<"$1" | head -1 || true
}

# ── D1 ────────────────────────────────────────────────────────────────────
if grep -q "$PLACEHOLDER" "$CONFIG"; then
  echo "==> Ensuring D1 database '$D1_NAME'"

  # A fresh database prints its id straight from `d1 create`, so there is no
  # need to call `d1 list` at all in the common case.
  D1_OUTPUT="$(npx wrangler d1 create "$D1_NAME" 2>&1 || true)"
  echo "$D1_OUTPUT"
  DB_ID="$(uuid_from "$D1_OUTPUT")"

  # An existing database makes `d1 create` refuse, so look the id up instead.
  if [ -z "$DB_ID" ]; then
    DB_ID="$(npx wrangler d1 list --json 2>/dev/null | node -e "
      let s='';
      process.stdin.on('data', (d) => (s += d)).on('end', () => {
        // Wrangler sometimes prints a banner before the JSON, so drop
        // everything before the first bracket.
        const start = s.indexOf('[');
        const list = start === -1 ? [] : JSON.parse(s.slice(start).trim() || '[]');
        const db = list.find((x) => x.name === '$D1_NAME');
        process.stdout.write(db ? db.uuid : '');
      });
    ")"
  fi

  if [ -z "$DB_ID" ]; then
    echo "Could not obtain a database_id for '$D1_NAME'." >&2
    exit 1
  fi

  # Substitution rather than a JSON parser: the file is JSONC and its comments
  # are deliberate.
  node -e "
    const fs = require('fs');
    const file = '$CONFIG';
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('$PLACEHOLDER', '$DB_ID'));
  "
  echo "==> D1 '$D1_NAME' → $DB_ID"
else
  echo "==> wrangler.jsonc already carries a database_id, leaving it alone"
fi

# ── R2 ────────────────────────────────────────────────────────────────────
# `r2 bucket create` on an existing bucket is an error we can ignore; there is
# no id to capture, the binding refers to the bucket by name.
echo "==> Ensuring R2 bucket '$R2_NAME'"
npx wrangler r2 bucket create "$R2_NAME" 2>&1 || echo "    (already exists)"

echo "==> Cloudflare resources ready"
