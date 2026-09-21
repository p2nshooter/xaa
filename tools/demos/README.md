# Demo builder

Turns the owner's real election applications into demos that are safe to
publish, and proves they are safe before they ship.

```bash
python3 tools/demos/build_demos.py    # writes public/demos/*.html
python3 tools/demos/verify_demos.py   # exits non-zero if anything real survives
```

The source files are NOT in this repository — they hold real voter records.
The builder reads them from the owner's upload directory and writes only the
sanitised output. Regenerating therefore needs the originals to hand; the
published demos in `public/demos/` are the deliverable.

## What the builder does

1. **Removes every real person.** Names, national ID numbers, family-card
   numbers, addresses, birthplaces and birth dates are replaced with generated
   values drawn from invented name lists — nothing in those lists exists in the
   source data, so a generated identity cannot collide with a real voter.
2. **Removes every credential.** Real usernames and PINs are dropped; each role
   gets one demo account on a published PIN, and the login screen fills that PIN
   in as soon as an account is chosen.
3. **Keeps a stratified sample.** Six rows per polling station rather than
   thousands, so per-station and per-hamlet breakdowns still have data to work
   with while the file stays small.
4. **Translates the interface to English.**
5. **Stamps every page** with a fixed DEMO watermark and a banner stating that
   the data is sampled and not real.

## Translating without breaking the app

Three approaches failed before the current one, and each failure is worth
remembering:

- A blanket find-and-replace turned the identifier `perDusun` into
  `perSub-village` — a syntax error that took the whole app down.
- A string-literal regex mispaired quotes on an apostrophe inside an
  Indonesian comment and swallowed live code.
- Matching `>text<` everywhere ran straight through the arrow in `=>` and
  renamed `getElementById('fAlamat')` to `'fAddress'`, silently detaching
  every event handler on the form.

So the rule now: stylesheets are never touched; inside scripts only complete
quoted literals and text that ends at a closing tag (`>text</`) are translated;
in HTML, text between tags. `verify_demos.py` enforces the result — including
an invariant that every element id the code looks up still exists.
