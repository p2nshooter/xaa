"""
Build publishable demos from the owner's real election apps.

Three jobs, in order:
  1. strip every real person — names, national IDs, addresses, credentials;
  2. keep a small stratified sample so every feature still has data to work
     with (per-polling-station breakdowns need rows in each station);
  3. translate the interface to English and make the demo login self-service.
"""
import re, json, random, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from i18n_map import UI

random.seed(20260921)

SRC = pathlib.Path('/root/.claude/uploads/14f581bf-09e6-51da-ba86-4a96f13aa443')
OUT = pathlib.Path('/home/user/xaa/public/demos')
OUT.mkdir(parents=True, exist_ok=True)

PER_GROUP = 6          # rows kept per polling station — a sample, not a dataset
DEMO_PIN  = '12345'

# Invented names: nothing here exists in the source, so a generated identity
# can never collide with a real voter's.
DEPAN = ['ANDRO','BRAMA','CENDA','DIVARA','ELNAR','FIRZA','GANDRA','HELVIN','IRSANO','JEVARA',
         'KALUNA','LIMRA','MAVENDRA','NIRWAN','OKTARA','PRANAVI','QUENZA','RIVANDA','SELARA',
         'TARUNIA','ULVARA','VERINDA','WIRAJA','XANORA','YULVARA','ZEVANA']
BELAKANG = ['DEMOPUTRA','SIMULINDO','CONTOHSARI','UJICOBAWAN','SAMPELYANTO','DUMIYANA','PERCOBANI',
            'TESTAMIJAYA','FIKTIFIANI','RANCANGSA','MISALUDIN','UMPAMAWATI']
HAMLET = ['DEMO HAMLET ONE','DEMO HAMLET TWO','DEMO HAMLET THREE','SAMPLE HAMLET','TEST HAMLET']
PLACE  = ['DEMO CITY','SAMPLE REGION','TEST DISTRICT']

def nama(): return f'{random.choice(DEPAN)} {random.choice(BELAKANG)}'
def fake_id(i): return f'0000{i:012d}'          # never a valid NIK
def tanggal(): return f'{random.randint(1,28):02d}-{random.randint(1,12):02d}-{random.randint(1960,2006)}'
def alamat(): return f'{random.choice(HAMLET)} NO. {random.randint(1,120)}'

HTML_TEXT = re.compile(r'>([^<>]+)<')
# Inside a script the text must be preceded by a REAL tag. Requiring
# `<tagname ...>` excludes the arrow in `=>`, which otherwise let a match run
# across live code — that is how `getElementById('fAlamat')` became
# `getElementById('fAddress')` and the DPT app lost its event handlers.
# Require the text to END at a CLOSING tag. `</` is not valid JavaScript, so
# a run of `>text</` is markup with near-certainty, whereas `>text<` alone
# matched right across `=>` into code.
JS_MARKUP_TEXT = re.compile(r'>([^<>]{1,80})</')

def _swap(text: str) -> str:
    for src, dst in UI:
        text = text.replace(src, dst)
    return text

# Characters that mean the run is code, not a label. Markup here is built by
# string concatenation, so `<td>'+fmtNum(DPT_TOTALS[t])+'</td>` sits between a
# tag and a closing tag and looks exactly like text — that is how `DPT_TOTALS`
# became `Voter roll_TOTALS`.
CODEY = set('\'"`+${};=')

def _js_markup_text(m) -> str:
    body = m.group(1)
    if any(c in CODEY for c in body):
        return m.group(0)
    return '>' + _swap(body) + '</'

def _quoted(h: str) -> str:
    """Whole quoted literals only, so identifiers can never match."""
    for src, dst in UI:
        for q in ("'", '"', '`'):
            h = h.replace(f'{q}{src}{q}', f'{q}{dst}{q}')
    return h

def translate(h: str) -> str:
    """
    Translate only text that is unambiguously text.

    A blanket replace turned the identifier `perDusun` into `perSub-village`;
    a string-literal regex mispaired quotes on an apostrophe in a comment; and
    matching `>text<` everywhere ran straight through `=>` into live code.
    So: markup text in HTML, markup text behind a real tag inside scripts, and
    complete quoted literals. Nothing else is touched.
    """
    parts = re.split(r'(<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>)', h, flags=re.S | re.I)
    out = []
    for seg in parts:
        low = seg[:8].lower()
        if low.startswith('<style'):
            out.append(seg)                                   # class names stay
        elif low.startswith('<script'):
            seg = JS_MARKUP_TEXT.sub(_js_markup_text, seg)
            out.append(_quoted(seg))
        else:
            seg = HTML_TEXT.sub(lambda m: '>' + _swap(m.group(1)) + '<', seg)
            out.append(_quoted(seg))
    return ''.join(out).replace('<html lang="id"', '<html lang="en"')

STAMP_CSS = """
<style id="xaa-demo-stamp">
  .xaa-demo-banner{position:sticky;top:0;z-index:99999;background:#b91c1c;color:#fff;
    font:600 13px/1.45 system-ui,sans-serif;padding:9px 14px;text-align:center}
  .xaa-demo-banner a{color:#fff;text-decoration:underline}
  .xaa-demo-stamp{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-24deg);
    z-index:99998;pointer-events:none;font:900 clamp(56px,14vw,190px)/0.95 system-ui,sans-serif;
    color:rgba(185,28,28,.15);border:.14em solid rgba(185,28,28,.15);border-radius:.12em;
    padding:.06em .18em;white-space:nowrap;text-align:center}
  .xaa-demo-stamp small{display:block;font-size:.17em;letter-spacing:.22em;margin-top:.18em}
  .xaa-demo-hint{background:#fef3c7;border:1px solid #fcd34d;color:#92400e;border-radius:8px;
    padding:8px 10px;font:600 12px/1.45 system-ui,sans-serif;margin:0 0 10px}
  @media print{.xaa-demo-stamp{position:absolute}.xaa-demo-banner{position:static}}
</style>
"""

def stamp_html(title: str) -> str:
    return f"""
<div class="xaa-demo-banner">
  DEMO — SAMPLING ONLY, NOT REAL DATA. Every name, ID, address and account on this page is generated.
  {title} built by <a href="https://xaa.es" target="_blank" rel="noopener">xaa.es</a>
</div>
<div class="xaa-demo-stamp" aria-hidden="true">DEMO<small>SAMPLING ONLY · NOT REAL DATA</small></div>
"""

# Fills the PIN as soon as an account is chosen, so nobody has to be told a
# password out of band to try the demo.
AUTOFILL = f"""
<script id="xaa-demo-autofill">
(function () {{
  function wire() {{
    var sel = document.getElementById('m-username');
    var pin = document.getElementById('m-sandi');
    if (!sel || !pin) return false;
    function fill() {{
      if (!sel.value) {{
        var first = Array.prototype.find.call(sel.options, function (o) {{ return o.value; }});
        if (first) sel.value = first.value;
      }}
      pin.value = '{DEMO_PIN}';
    }}
    sel.addEventListener('change', fill);
    fill();
    if (!document.getElementById('xaa-demo-hint')) {{
      var h = document.createElement('div');
      h.id = 'xaa-demo-hint';
      h.className = 'xaa-demo-hint';
      h.textContent = 'Demo access — pick any account, the PIN ({DEMO_PIN}) fills in automatically.';
      (sel.closest('.tirai-isi') || sel.parentElement).prepend(h);
    }}
    return true;
  }}
  if (!wire()) {{
    var n = 0, t = setInterval(function () {{ if (wire() || ++n > 40) clearInterval(t); }}, 100);
  }}
}})();
</script>
"""

def inject(h: str, title: str, autofill: bool) -> str:
    k = h.find('</head>')
    h = (h[:k] + STAMP_CSS + h[k:]) if k != -1 else STAMP_CSS + h
    i = h.index('<body'); j = h.index('>', i) + 1
    h = h[:j] + stamp_html(title) + h[j:]
    if autofill:
        # The LAST </body>, not the first: this app builds a printable document
        # inside a template literal, so an earlier </body> lives in the middle
        # of its own JavaScript — injecting there cut the script in half.
        i = h.rfind('</body>')
        h = (h[:i] + AUTOFILL + h[i:]) if i != -1 else h + AUTOFILL
    return re.sub(r'<title>(.*?)</title>', lambda m: f'<title>[DEMO] {m.group(1)}</title>', h, count=1, flags=re.S)

def replace_script(h: str, sid: str, payload) -> str:
    dumped = json.dumps(payload, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return re.sub(rf'(<script[^>]*id="{sid}"[^>]*>)(.*?)(</script>)',
                  lambda m: m.group(1) + dumped + m.group(3), h, count=1, flags=re.S)

def stratify(rows, key, per):
    """Keep `per` rows from each group so every breakdown still has data."""
    seen, out = {}, []
    for r in rows:
        k = key(r)
        seen[k] = seen.get(k, 0)
        if seen[k] < per:
            seen[k] += 1
            out.append(r)
    return out

# ── 1. DPT verification ──────────────────────────────────────────────────
src = (SRC / 'a0aa1cd2-Aplikasi_Verifikasi_DPT_Sukakarya_2026.html').read_text(encoding='utf-8', errors='ignore')
data = json.loads(re.search(r'<script[^>]*id="dps-data"[^>]*>(.*?)</script>', src, re.S).group(1))
recs = stratify(data['records'], lambda r: r.get('tps'), PER_GROUP)
for i, r in enumerate(recs, 1):
    r['nama'] = nama(); r['nik'] = fake_id(i)
    if 'nkk' in r: r['nkk'] = fake_id(i)
    if 'ttl' in r: r['ttl'] = f'{random.choice(PLACE)}, {tanggal()}'
    if 'tgl' in r: r['tgl'] = tanggal()
    r['alamat'] = alamat()
    if r.get('flagNote'): r['flagNote'] = 'Simulated note'
data['records'] = recs
data['meta'].update({'desa': 'DEMO VILLAGE', 'kecamatan': 'SAMPLE DISTRICT', 'kabupaten': 'DEMO REGION'})
if isinstance(data['meta'].get('wilayahPerTps'), dict):
    data['meta']['wilayahPerTps'] = {k: ', '.join(random.sample(HAMLET, 2)) for k in data['meta']['wilayahPerTps']}
out = inject(translate(replace_script(src, 'dps-data', data)), 'Voter roll verification', False)
(OUT / 'dpt-verification-demo.html').write_text(out, encoding='utf-8')
print(f'dpt-verification-demo.html  {len(recs):4d} rows  {len(out)//1024:4d} KB')

# ── 2. Voter list (SAIRAN) ───────────────────────────────────────────────
src2 = (SRC / 'bef991bf-SAIRAN-2026-Mandiri.html').read_text(encoding='utf-8', errors='ignore')
d2 = json.loads(re.search(r'<script[^>]*id="data-sairan"[^>]*>(.*?)</script>', src2, re.S).group(1))
ix = {c: i for i, c in enumerate(d2['kolom'])}
rows = stratify(d2['pemilih'], lambda r: r[ix['tps']] if isinstance(r, list) else r.get('tps'), PER_GROUP)
for i, row in enumerate(rows, 1):
    if isinstance(row, list):
        for f, v in (('nama', nama()), ('nik', fake_id(i)), ('alamat', alamat()),
                     ('tempat_lahir', random.choice(PLACE)), ('tanggal_lahir', tanggal()),
                     ('kampung', random.choice(HAMLET))):
            if f in ix: row[ix[f]] = v
    elif isinstance(row, dict):
        row.update({'nama': nama(), 'nik': fake_id(i), 'alamat': alamat()})
d2['pemilih'] = rows
# One demo account per role, all on the same published PIN.
roles = sorted({a.get('peran') or a.get('role') or 'viewer' for a in d2.get('akun', []) if isinstance(a, dict)})
d2['akun'] = [{'username': f'demo-{r}', 'sandi': DEMO_PIN, 'password': DEMO_PIN,
               'pin': DEMO_PIN, 'nama': f'Demo {r}', 'peran': r, 'role': r, 'tps': '', 'dusun': ''}
              for r in (roles or ['admin'])]
out2 = replace_script(src2, 'data-sairan', d2)
for real, demo in [('superadmin', 'demo'), ('SUPERADMIN', 'DEMO'), ('Super Admin', 'Demo account'),
                   ('BIG BOS', 'DEMO ACCOUNT'), ('Big Bos', 'Demo account'),
                   ("'DESI'", "'CANDIDATE A'"), ('desi:', 'kandidat_a:'),
                   ("'OTONG'", "'CANDIDATE B'"), ('otong:', 'kandidat_b:')]:
    out2 = out2.replace(real, demo)
out2 = inject(translate(out2), 'Voter register', True)
(OUT / 'voter-list-demo.html').write_text(out2, encoding='utf-8')
print(f'voter-list-demo.html        {len(rows):4d} rows  {len(out2)//1024:4d} KB  roles: {roles or ["admin"]}')

# ── 3. Real count ────────────────────────────────────────────────────────
src3 = (SRC / '5e2fc4da-Aplikasi_Real_Count_Sukakarya_2026.html').read_text(encoding='utf-8', errors='ignore')
for real, demo in [('ADI SUMARDI', 'CANDIDATE DEMO A'), ('JONI FAHAMSYAH', 'CANDIDATE DEMO B'),
                   ('Adi Sumardi', 'Candidate Demo A'), ('Joni Fahamsyah', 'Candidate Demo B')]:
    src3 = src3.replace(real, demo)
out3 = inject(translate(src3), 'Live vote count', False)
(OUT / 'real-count-demo.html').write_text(out3, encoding='utf-8')
print(f'real-count-demo.html        tally app  {len(out3)//1024:4d} KB')
