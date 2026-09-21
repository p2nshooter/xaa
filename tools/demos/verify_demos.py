"""
Prove the published demos contain no real person. Run before every deploy.

Checks three things, precisely rather than by loose substring matching —
`dusunDariTps` is not the name SUNDARI, and `warna` is the word "colour":

  1. every string inside the demo's own data block, compared for EQUALITY
     against the real names (that block is the only place records live);
  2. any real national ID anywhere in the file (numeric, unambiguous);
  3. any real multi-word name as a contiguous phrase in the file.
"""
import re, json, pathlib, sys, subprocess, tempfile, os

SRC = pathlib.Path('/root/.claude/uploads/14f581bf-09e6-51da-ba86-4a96f13aa443')
OUT = pathlib.Path('/home/user/xaa/public/demos')

real_names, real_ids, secrets = set(), set(), set()

d = json.loads(re.search(r'id="dps-data"[^>]*>(.*?)</script>',
    (SRC / 'a0aa1cd2-Aplikasi_Verifikasi_DPT_Sukakarya_2026.html').read_text(encoding='utf-8', errors='ignore'), re.S).group(1))
for r in d['records']:
    if r.get('nama'): real_names.add(r['nama'].strip().upper())
    for k in ('nik', 'nkk'):
        if r.get(k): real_ids.add(str(r[k]).strip())

d2 = json.loads(re.search(r'id="data-sairan"[^>]*>(.*?)</script>',
    (SRC / 'bef991bf-SAIRAN-2026-Mandiri.html').read_text(encoding='utf-8', errors='ignore'), re.S).group(1))
ix = {c: i for i, c in enumerate(d2['kolom'])}
for row in d2['pemilih']:
    if isinstance(row, list):
        if 'nama' in ix and row[ix['nama']]: real_names.add(str(row[ix['nama']]).strip().upper())
        if 'nik' in ix and row[ix['nik']]: real_ids.add(str(row[ix['nik']]).strip())
for a in d2.get('akun', []):
    if isinstance(a, dict):
        for k, v in a.items():
            if isinstance(v, str) and len(v) > 3 and k in ('username', 'password', 'nama'):
                secrets.add(v.strip())

multiword = {n for n in real_names if ' ' in n and len(n) > 8}
ids_long = {i for i in real_ids if len(i) >= 10 and i.isdigit()}

def strings_in(obj, out):
    if isinstance(obj, str): out.append(obj)
    elif isinstance(obj, list):
        for v in obj: strings_in(v, out)
    elif isinstance(obj, dict):
        for v in obj.values(): strings_in(v, out)

problems = 0
for f in sorted(OUT.glob('*.html')):
    h = f.read_text(encoding='utf-8', errors='ignore')

    # 1. the demo's own data block
    payload_hits = []
    for m in re.finditer(r'<script[^>]*id="(dps-data|data-sairan)"[^>]*>(.*?)</script>', h, re.S):
        try:
            vals = []
            strings_in(json.loads(m.group(2).replace('<\\/', '</')), vals)
            payload_hits += [v for v in vals if v.strip().upper() in real_names]
        except Exception as e:
            payload_hits.append(f'UNPARSEABLE:{e}')

    # 2. real IDs anywhere
    id_hits = [i for i in ids_long if i in h]

    # 3. real full names as contiguous phrases
    up = h.upper()
    name_hits = [n for n in multiword if re.search(r'\b' + re.escape(n) + r'\b', up)]

    # 4. credentials
    cred_hits = [s for s in secrets if len(s) > 4 and re.search(r'\b' + re.escape(s) + r'\b', h)]

    # Translation must never rename an element reference: every id the code
    # asks for has to exist somewhere in the document.
    wanted = set(re.findall(r'getElementById\(\s*[\'"]([A-Za-z0-9_-]+)[\'"]', h))
    present = set(re.findall(r'id=[\'"]([A-Za-z0-9_-]+)[\'"]', h))
    # Ids the scripts create at runtime (`el.id = 'x'`) are legitimately
    # absent from the static markup.
    created = set(re.findall(r"\.id\s*=\s*['\"]([A-Za-z0-9_-]+)['\"]", h))
    missing = sorted(w for w in wanted if w not in present and w not in created)

    # Every script block must parse. A translation that corrupts code is
    # worse than one that leaves a label in Indonesian.
    broken = []
    for bi, blk in enumerate(re.findall(r'<script\b[^>]*>(.*?)</script>', h, re.S | re.I)):
        if not blk.strip() or blk.strip()[0] in '{[':
            continue
        tf = tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8')
        tf.write(blk); tf.close()
        rr = subprocess.run(['node', '--check', tf.name], capture_output=True, text=True)
        os.unlink(tf.name)
        if rr.returncode:
            broken.append((bi, rr.stderr.strip().splitlines()[1:3]))

    stamped = 'xaa-demo-stamp' in h and 'SAMPLING ONLY' in h
    ok = not payload_hits and not id_hits and not name_hits and not cred_hits and stamped and not missing and not broken
    print(f'  {f.name:30s} payload={len(payload_hits)} ids={len(id_hits)} names={len(name_hits)} '
          f'creds={len(cred_hits)} ids_missing={len(missing)} js_broken={len(broken)} '
          f'stamped={"yes" if stamped else "NO"}  {"OK" if ok else "FAIL"}')
    for bi, msg in broken: print(f'      script block {bi}: {msg}')
    if missing: print(f'      missing elements: {missing[:5]}')
    for label, hits in (('payload', payload_hits), ('ids', id_hits), ('names', name_hits), ('creds', cred_hits)):
        if hits: print(f'      {label}: {hits[:3]}')
    if not ok: problems += 1

print('RESULT:', 'CLEAN — no real person in any demo' if problems == 0 else f'{problems} FILE(S) FAILED')
sys.exit(1 if problems else 0)
