// AdSense accounts of xaa.es (owner, 7 Nov 2026: „kode2 adsense ini di tumpuk aja di dusun yg rapih agar tidak saling
// bentrok dan tidak melanggar kebijakan adsense, maksudnya 1 website memakai beberapa kode adsense dari akun yg berbeda").
// The list is a copy of adsense-stack.json in the ulyah.com repository (docs/ADSENSE-BLUEPRINT.md §23 there), which
// scripts/site-audit.mjs checks against the live site.
//
// - SITE.adClient is the PRIMARY account: the only loader script on the page. Google ignores a second AdSense head tag
//   on the same page ("Only one AdSense head tag supported per page"), so there is never more than one loader.
// - AD_ACCOUNTS is every account the site authorises — the primary first, then the sixteen stacked accounts. Each gets
//   its own google-adsense-account meta tag (app/layout.tsx) and its own line in public/ads.txt, so each account can
//   verify the site. scripts/check-adsense.mjs fails the deploy when public/ads.txt and this list differ.
// - Auto ads only: no manual ad unit anywhere.
// 22 Nov 2026 (pemilik): „hapus seluruh kode adsense tumpuk dan meta tag nya … sisakan 3 adsense saja“ — tiga akun saja, akun lama dihapus semua.
// 24 Nov 2026 (pemilik): „setiap domain pasang 5 kode adsense ini aja + bikinin tag meta nya, hapus kode adsense yg lain“ —
// lima akun: 6560360898389273, 4906992051458194, 5928074389292014, 6701063918838796, 5092800160376210 (baru).
import { SITE } from './site';

export const ADSENSE_STACK = [
  'ca-pub-6560360898389273',
  'ca-pub-4906992051458194',
  'ca-pub-5928074389292014',
  'ca-pub-6701063918838796',
  'ca-pub-5092800160376210',
] as const;

export const AD_ACCOUNTS: readonly string[] = [...new Set<string>([SITE.adClient, ...ADSENSE_STACK])];
