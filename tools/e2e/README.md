# End-to-end checks

Drive a real browser against a locally running build. Start one first:

```bash
npm run cf:preview          # build + populate cache + wrangler dev
```

Then, against the port it prints (the scripts default to a fixed one — edit
`BASE` at the top of each, or export the port before running):

| Script | What it proves |
| --- | --- |
| `flow.mjs` | The client lifecycle: register, order, 10% deposit refused below the floor, concept upload gated on payment, delivery date issued, production at 50%, progress clamped at 80% while money is outstanding, settlement, handover at 100%, and that one client cannot open another's project. |
| `admin.mjs` | Payment-destination CRUD, encryption self-test, that a wallet address is masked in the admin list and shown in full only to a paying client, that a stored secret never returns to the browser, invoice numbering stability, and the enquiry inbox. |
| `crawl.mjs` | Every internal link reachable from the home page answers 200 (or an expected auth redirect). |
| `testdemos.mjs` | The published demos load, log in, render generated data, and raise no JavaScript errors. |

```bash
node tools/e2e/flow.mjs && node tools/e2e/admin.mjs \
  && node tools/e2e/crawl.mjs && node tools/e2e/testdemos.mjs
```

## Two things these scripts learned the hard way

**Order independence.** `flow.mjs` used to confirm whichever payment sat first
in the studio queue. Run it after `admin.mjs` and it confirmed the *other*
test's payment, then failed four steps later — looking exactly like a product
regression when nothing was wrong. It now finds the row carrying its own
project reference.

**Selector scope.** When the business-data upload shipped, `input[name=files]`
stopped being unique and the concept-upload step began failing. Scope to the
form, not the field.

Local state lives in `.wrangler/state` and is git-ignored. Delete it for a
clean database; the first account registered afterwards becomes the admin.
