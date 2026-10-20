/**
 * Publishes a template's live demo and animated screenshots on xaa.es.
 *
 * The template source stays in the private xaa-templates repository; only the
 * compiled demo build and the clips come here:
 *
 *   (in xaa-templates/templates/<slug>)  npm run build:demo && npm run tour
 *   node tools/demos/import-template-demo.mjs ../xaa-templates waitlist
 *
 * Writes public/demos/<slug>/ (the demo), public/demos/<slug>/shots/ (clips,
 * posters, manifest) and src/content/demos/<slug>.json (what the product page
 * and the member portal show, including the demo account the demo fills in).
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const [repo, slug] = process.argv.slice(2);
if (!repo || !slug) {
  console.error('usage: node tools/demos/import-template-demo.mjs <path to xaa-templates> <slug>');
  process.exit(1);
}
const tpl = resolve(repo, 'templates', slug);
const demo = join(tpl, 'dist-demo');
const shots = join(tpl, 'shots');
for (const p of [demo, join(shots, 'manifest.json')]) {
  if (!existsSync(p)) {
    console.error(`missing ${p} — run "npm run build:demo && npm run tour" in the template first`);
    process.exit(1);
  }
}

const html = readFileSync(join(demo, 'index.html'), 'utf8');
if (!/<meta name="robots" content="noindex/.test(html)) throw new Error('the demo build must carry a noindex meta tag');
if (!html.includes(`/demos/${slug}/`)) throw new Error(`the demo build is not based at /demos/${slug}/`);

/* the demo */
const out = join(root, 'public', 'demos', slug);
rmSync(out, { recursive: true, force: true });
cpSync(demo, out, { recursive: true });

/* the clips */
mkdirSync(join(out, 'shots'), { recursive: true });
for (const f of readdirSync(shots)) if (/\.(webp|json)$/.test(f)) cpSync(join(shots, f), join(out, 'shots', f));
const manifest = JSON.parse(readFileSync(join(shots, 'manifest.json'), 'utf8'));

/* the demo account, read from the template so it can never disagree with what the demo fills in */
const cred = readFileSync(join(tpl, 'src', 'demo', 'credentials.ts'), 'utf8');
const email = /DEMO_EMAIL\s*=\s*"([^"]+)"/.exec(cred)?.[1];
const password = /DEMO_PASSWORD\s*=\s*"([^"]+)"/.exec(cred)?.[1];
if (!email || !password) throw new Error('could not read the demo account from src/demo/credentials.ts');

mkdirSync(join(root, 'src', 'content', 'demos'), { recursive: true });
writeFileSync(join(root, 'src', 'content', 'demos', `${slug}.json`), JSON.stringify({
  slug,
  url: `/demos/${slug}/`,
  login: `/demos/${slug}/#/login`,
  account: { email, password },
  updated: manifest.generated,
  shots: manifest.shots.map(({ id, device, title, caption, file, poster, width, height }) => ({
    id, device, title, caption, width, height,
    src: `/demos/${slug}/shots/${file}`,
    poster: `/demos/${slug}/shots/${poster}`,
  })),
}, null, 2) + '\n');

console.log(`published /demos/${slug}/ with ${manifest.shots.length} clips`);
