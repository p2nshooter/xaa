#!/usr/bin/env bash
#
# Makes sure the R2 buckets the client portal binds to exist (xaa-data for
# every record, xaa-uploads for files), and writes the legacy D1 database_id
# into wrangler.jsonc (D1 is only read once, by the D1 → R2 migration).
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
R2_BUCKETS=("xaa-data" "xaa-uploads" "xaa-backups")
PLACEHOLDER="REPLACE_WITH_D1_DATABASE_ID"

# Without credentials wrangler fails with a wall of text and the commands after
# it silently receive empty output. Checked up front so the reason is obvious.
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && ! npx wrangler whoami >/dev/null 2>&1; then
  cat >&2 <<'MSG'
No Cloudflare credentials.

  - In GitHub Actions : set the CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID secrets.
  - On your own machine: run `npx wrangler login` first.

The token needs D1:Read (legacy copy), Workers R2 Storage:Edit and Workers Scripts:Edit.
MSG
  exit 1
fi

uuid_from() {
  grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' <<<"$1" | head -1 || true
}

# ── D1 (legacy, read-only) ────────────────────────────────────────────────
# D1 is never created any more. If the old database exists, its id is written
# into wrangler.jsonc so the one-time D1 → R2 migration can read it; on an
# account that never had it, the binding is removed from this build and the
# portal starts on R2 directly (the migration records a "fresh" start).
if grep -q "$PLACEHOLDER" "$CONFIG"; then
  echo "==> Looking up legacy D1 database '$D1_NAME'"
  DB_ID="$(npx wrangler d1 list --json 2>/dev/null | node -e "
    let s='';
    process.stdin.on('data', (d) => (s += d)).on('end', () => {
      // Wrangler sometimes prints a banner before the JSON, so drop
      // everything before the first bracket.
      const start = s.indexOf('[');
      let list = [];
      try { list = start === -1 ? [] : JSON.parse(s.slice(start).trim() || '[]'); } catch {}
      const db = list.find((x) => x.name === '$D1_NAME');
      process.stdout.write(db ? db.uuid : '');
    });
  ")"

  if [ -n "$DB_ID" ]; then
    # Substitution rather than a JSON parser: the file is JSONC and its comments
    # are deliberate.
    node -e "
      const fs = require('fs');
      const file = '$CONFIG';
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('$PLACEHOLDER', '$DB_ID'));
    "
    echo "==> legacy D1 '$D1_NAME' → $DB_ID (read once by the migration)"
  else
    node -e "
      const fs = require('fs');
      const file = '$CONFIG';
      const text = fs.readFileSync(file, 'utf8');
      const stripped = text.replace(/,\s*\"d1_databases\"\s*:\s*\[[\s\S]*?\]/, '');
      if (stripped === text) { console.error('Could not strip the d1_databases binding.'); process.exit(1); }
      fs.writeFileSync(file, stripped);
    "
    echo "==> no legacy D1 database: binding removed, the portal starts on R2"
  fi
else
  echo "==> wrangler.jsonc already carries a database_id, leaving it alone"
fi

# ── R2 ────────────────────────────────────────────────────────────────────
# The buckets have no id to capture — the bindings name them directly — so all
# that matters is that they exist. R2 is where every portal record lives now,
# so it is required: if R2 were not enabled on the account (API code 10042)
# the deploy stops here with the reason, rather than shipping a site whose
# portal cannot store anything.
for R2_NAME in "${R2_BUCKETS[@]}"; do
  echo "==> Ensuring R2 bucket '$R2_NAME'"
  R2_OUTPUT="$(npx wrangler r2 bucket create "$R2_NAME" 2>&1 || true)"
  echo "$R2_OUTPUT"
  if grep -qiE 'already (exists|owned)|Created bucket' <<<"$R2_OUTPUT"; then
    echo "==> R2 bucket '$R2_NAME' ready"
  elif grep -qE 'code: 10042|enable R2' <<<"$R2_OUTPUT"; then
    echo "::error::R2 is not enabled on this Cloudflare account. Enable it once (Dashboard → R2 → Enable) and re-run the deploy." >&2
    exit 1
  else
    echo "Unexpected failure creating R2 bucket '$R2_NAME'." >&2
    exit 1
  fi
done

# Backups are kept 35 days, then R2 deletes them by itself. Adding the rule
# again when it exists fails harmlessly, so a failure here is only a warning.
if npx wrangler r2 bucket lifecycle list xaa-backups 2>/dev/null | grep -q "expire-backups-35d"; then
  echo "==> xaa-backups lifecycle rule present"
else
  npx wrangler r2 bucket lifecycle add xaa-backups expire-backups-35d backups/ --expire-days 35 --force \
    && echo "==> xaa-backups: backups expire after 35 days" \
    || echo "::warning::Could not add the 35-day lifecycle rule to xaa-backups; add it once in the dashboard (R2 → xaa-backups → Settings → Object lifecycle rules)."
fi

echo "==> Cloudflare resources ready"
