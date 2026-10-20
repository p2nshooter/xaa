# xaa.es — standing rules

These rules come from the owner and apply to every change in this repository. Record each new owner command in
`docs/BLUEPRINT.md` before building it.

## Storage: R2 only — never D1

Owner, 20 Oct 2026: „Catat ya baik di axto.io maupun di xaa.es, ulyah.com  xad.es 1fr.fr tilawa.de dan semua yg
membutuhkan penyimpanan, wajib ke R2, jgn pernah ke D1".

- Every record lives in the private R2 bucket `DATA` (`xaa-data`) through `src/server/data.ts` and the collections in
  `src/server/r2/schema.ts`; files live in `UPLOADS`; daily backups in `BACKUPS` (35 days). Never add a D1 database,
  table, binding or query. The legacy `DB` binding is read only by the one-time move (`src/server/migrate.ts`) and is
  removed seven days after it.
- Writes follow `docs/R2-DATA-BLUEPRINT.md` §3: create-once guards for unique values, compare-and-swap updates, money
  and order changes as conditional transitions with deterministic ids, no hot keys (one write per second per key).
- `npm test` (R2 store, races, migration, backups) and the e2e suites in `tests/e2e/` must pass before merging.
