# Turning on the XAA client portal

The marketing site (`/`, `/services`, `/process`, `/care`, `/payments`, `/work`,
`/faq`, the `/insights` archive) runs with no extra infrastructure. The client
portal — accounts, projects, milestone payments, file uploads, the studio desk —
needs two Cloudflare resources and a handful of secrets.

Everything below is a one-time job. There is no migration step: the D1 schema
creates itself the first time the portal is used.

## 1. Create the database and the bucket

```bash
npx wrangler d1 create xaa-portal          # prints a database_id — copy it
npx wrangler r2 bucket create xaa-uploads
```

## 2. Bind them

Open `wrangler.jsonc`, uncomment the two commented blocks at the bottom and
paste the `database_id` you just got:

```jsonc
"d1_databases": [
  { "binding": "DB", "database_name": "xaa-portal", "database_id": "…" }
],
"r2_buckets": [
  { "binding": "UPLOADS", "bucket_name": "xaa-uploads" }
]
```

Add a comma after the `"vars"` line when you uncomment them.

They are shipped commented out on purpose: a binding that points at a database
which does not exist yet fails `wrangler deploy` outright, taking the pages that
were working down with it.

## 3. Set the secrets

```bash
npx wrangler secret put ADMIN_EMAIL          # the email you will sign in with
npx wrangler secret put USDT_TRC20_ADDRESS   # shown on the payment screen
npx wrangler secret put USDT_ERC20_ADDRESS   # optional
npx wrangler secret put USDT_BEP20_ADDRESS   # optional
npx wrangler secret put PAYPAL_EMAIL         # optional, one of these two
npx wrangler secret put PAYPAL_LINK          # optional, e.g. paypal.me/…
```

Only the networks you set an address for are offered to clients; the others say
so plainly on the payment screen rather than showing a blank box.

`ADMIN_EMAIL` is how you get the studio desk: register normally with that
address and the account is created as an admin. As a safety net, the very first
account registered on an empty database is also an admin — so if you deploy and
register before setting the secret, you still get in.

## 4. Deploy

```bash
npm run cf:deploy
```

## Running it locally

```bash
npm run cf:preview
```

Use this rather than `npm run cf:build` followed by `wrangler dev` on its own.
`cf:build` leaves the prerendered pages in `.open-next/cache`, and the worker
reads them through the `ASSETS` binding at `cdn-cgi/_next_cache` — so without
the `populateCache` step every page built from `generateStaticParams`
(`/services/[slug]`, `/articles/[slug]`, `/category/[slug]`) answers 404
locally. `cf:deploy` runs that step for you, so deployed builds are unaffected.

Local runs need the bindings uncommented in `wrangler.jsonc`; any string works
as the `database_id` in local mode, and state lands in `.wrangler/state`
(git-ignored).

## 5. First run

1. Register at `/register` with `ADMIN_EMAIL`. You land on the studio desk.
2. Register a second, ordinary account (or ask a client to) and open a project.
3. On the studio desk, confirm the deposit once the client submits it — that is
   what unlocks their concept upload and starts the schedule.

## How the rules are enforced

All of it lives in `src/server/projects.ts`, not in the UI:

| Rule | Where |
| --- | --- |
| 10% minimum booking deposit | `submitPaymentAction` rejects less |
| Concept upload opens only after the deposit | `ConceptUploadForm` locked + `reconcile` |
| Delivery date fixed when the concept lands | `reconcile` sets `started_at` / `due_at` |
| Production starts at cumulative 50% | `reconcile` → `in_production` |
| Settlement raised at 75% progress | `nextAction` + `SETTLEMENT_TRIGGER` |
| Progress capped at 80% until paid in full | `setProgress` and `reconcile` both clamp |
| Delivered only at 100% progress and 100% paid | `reconcile` |

`reconcile()` recomputes status from the facts on record after every payment,
upload and progress change, so status can never drift from what was actually
paid and delivered.

## Prices

`src/content/packages.ts` is the single source of truth for every package,
add-on, setup plan and care plan. Change a number there and it changes on the
marketing pages, in the order form, in the quote and in the milestone schedule
at the same time.

## Files

Uploads go to R2 under `projects/<project id>/<kind>/<file id>.<ext>` and are
never public. They are served by `/api/files/[id]`, which re-checks the session
on every request and serves only the project owner or an admin.
