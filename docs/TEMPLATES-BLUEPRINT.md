# Blueprint template SaaS xaa.es — logika dulu, lalu dibangun

Perintah pemilik, 18 Okt 2026 (dicatat apa adanya, permintaan **38** di `docs/BLUEPRINT.md` §3):

> "… xaa.es template apa saja yg belum di buat dengan fitur2 kelas tinggi, script high class sekala dunia super
> premium enterpeice... Seluruhnya wajib di catat dan di kembangkan dulu logikanya dalam blueprint dan tandai yg sudah
> di kerjakan, yg belum dan sedang di kerjakan, pastikan semua siap produksi bukan script sampah dan buatkan gambar
> animasi hasil screen shoot setiap menu & dashboard setiap script template agar client bisa melihat terlebih dahulu
> isi setiap script dan buatkan link demonya agar bisa di test oleh setiap client xaa.es"

Dokumen ini adalah rencana kerja untuk semua **18 template** di katalog (`src/content/templates.ts`). Statusnya
diperbarui setiap kali sebuah template dibangun atau diuji.

Terakhir diperbarui: 20 Oktober 2026.

Arti tanda: ✅ selesai dan lulus uji · 🔄 sedang dikerjakan · ❌ belum dikerjakan.

---

## 1. Keadaan sebenarnya hari ini (20 Okt 2026)

| | Jumlah | Keterangan |
|---|---|---|
| Template di katalog | 18 | 3 Starter, 9 Business, 3 Enterprise, 3 Super Enterprise |
| Halaman toko + pembayaran | 18 ✅ | `/templates`, `/templates/<slug>`, checkout PayPal / BNI / USDT |
| Produk (kode sumber) yang benar-benar ada | **0** ❌ | Pembeli hanya melihat "bundle sedang disiapkan" |
| Demo yang bisa dicoba | **0** ❌ | `demoUrl` kosong di semua template (halaman menulis "Demo on request") |
| Gambar animasi setiap menu & dashboard | **0** ❌ | — |

Demo yang sudah ada di `public/demos/` (`voter-list`, `dpt-verification`, `real-count`) adalah demo **portofolio**
sistem pemilu, bukan template toko.

---

## 2. Keputusan arsitektur

### 2.1 Kode sumber template di repo **privat**, bukan di repo xaa

Repo `p2nshooter/xaa` **publik**. Kode template yang dijual €390 sampai €1,2 juta tidak boleh ada di sana: siapa pun
bisa mengambilnya gratis. Kode sumber setiap template disimpan di repo privat **`p2nshooter/xaa-templates`**. Ke repo
xaa hanya masuk:

- **build demo** (JavaScript yang sudah dikompilasi dan diperkecil, seperti "live preview" di marketplace template mana pun),
  di `public/demos/<slug>/`, dan
- **gambar animasi** setiap menu di `public/demos/<slug>/shots/` + `manifest.json`.

Bundle zip untuk pembeli dibuat CI repo privat sebagai aset rilis privat (zip + SHA-256). Admin melampirkannya ke
template di Studio desk (alur yang sudah ada; butuh R2 aktif, lihat `BLUEPRINT.md` §6).

### 2.2 Satu kode, tiga tempat jalan

Setiap template adalah **satu aplikasi** dengan pembagian:

```
templates/<slug>/
  src/domain/     logika bisnis murni (tanpa I/O): aturan, perhitungan, validasi
  src/server/     API Hono (route → domain → database), auth, RBAC, audit, email, webhook
  src/web/        antarmuka React (SPA, Vite) — memanggil /api/*
  migrations/     SQL (SQLite dialect) — sama untuk D1, node:sqlite dan demo
  tests/          unit (domain) + API (node:sqlite di memori)
  e2e/            Playwright: semua menu, alur inti, desktop + mobile, a11y
  tour.ts         naskah tur untuk gambar animasi
  docs/           README, SETUP, REBRAND, ARCHITECTURE, API
```

Database dipakai lewat satu antarmuka berbentuk D1 (`prepare/bind/first/all/run/batch`) dengan tiga backend:

| Tempat | Database | Untuk |
|---|---|---|
| Cloudflare Workers | D1 | produksi pembeli (`wrangler deploy`) |
| Docker / Node 22 | `node:sqlite` (tanpa modul native) | produksi di server sendiri, dan semua tes |
| Browser | sql.js (SQLite WASM), disimpan di IndexedDB | **demo** di xaa.es |

Pada build demo, aplikasi Hono yang **sama** dijalankan di dalam browser: `fetch('/api/…')` dialihkan ke
`app.fetch()` lokal dengan database sql.js. Jadi demo menjalankan route, SQL, aturan dan perhitungan yang persis sama
dengan produk yang dibeli — bukan tiruan. Data demo hanya tersimpan di browser pengunjung, diisi data contoh, dan
bisa di-reset dengan satu tombol. Email di demo tidak terkirim: masuk ke "Kotak masuk demo" supaya klien bisa melihat
isi email verifikasi, undangan, dan lain-lain.

### 2.2a Penyimpanan template: R2, bukan D1 (aturan pemilik 20 Okt 2026)

Pemilik: „… semua yg membutuhkan penyimpanan, wajib ke R2, jgn pernah ke D1" (`CLAUDE.md`, `BLUEPRINT.md` 47). Aturan
ini juga berlaku untuk template yang dijual. Mulai template #2, data aplikasi memakai **R2 Store** yang sama dengan
xaa.es (`src/server/r2` di repo xaa: dokumen, penjaga keunikan create-once, compare-and-swap, index + ringkasan,
log append-only), dengan tiga backend berbentuk R2 yang semantiknya sama persis dan diuji dengan tes yang sama:

| Tempat | Backend | Untuk |
|---|---|---|
| Cloudflare Workers | **R2** (binding bucket pembeli) | produksi pembeli |
| Docker / Node 22 | R2 di disk lokal (file per objek + etag, tulis bersyarat atomik dengan kunci file) — atau bucket R2/S3 pembeli | produksi di server sendiri, tes |
| Browser | R2 di IndexedDB | **demo** di xaa.es |

Tabel di atas (§2.2) yang menyebut D1/SQLite berlaku untuk Waitlist & Landing yang sudah jadi; Waitlist dipindah ke
R2 Store yang sama (sebelum dirilis ulang), sehingga tidak ada template yang memakai D1.

### 2.3 Inti bersama (XAA Kit) — dipakai semua template

| Modul | Isi | Standar |
|---|---|---|
| Auth | email + kata sandi (PBKDF2-SHA256, WebCrypto), sesi acak 256-bit disimpan sebagai hash, cookie HttpOnly/Secure/SameSite=Lax, TOTP MFA opsional, reset kata sandi, batas percobaan | OWASP ASVS L2 |
| RBAC | peran bawaan Owner / Admin / Editor / Viewer + izin per template; setiap route diperiksa di server | tes otomatis "viewer tidak bisa mengubah" |
| Audit log | append-only, hash berantai (`prev_hash` → `hash`), terlihat di Admin → Audit, ekspor CSV | tamper-evident |
| Keamanan HTTP | CSP ketat, HSTS, cek Origin pada mutasi, batas laju per IP, validasi input di server | — |
| Email | adaptor Resend / Postmark / SMTP; log pengiriman; templat dengan variabel + pratinjau; demo = kotak masuk | — |
| Webhook | event bertanda tangan HMAC-SHA256, retry bertahap, log pengiriman | — |
| API key | berskop, hanya hash yang disimpan, terakhir dipakai | — |
| i18n | EN / ES / ID di seluruh UI (bahasa situs xaa.es), mudah ditambah | tidak ada teks tertanam |
| Merek | nama, logo, warna, mode gelap dari Settings → Branding + `brand.config.ts` | rebrand < 10 menit |
| UI premium | shell dengan sidebar, palet perintah (⌘K), tabel data (cari/filter/urut/kolom), grafik SVG ringan, toast, keadaan kosong yang membantu, animasi halus yang mati di `prefers-reduced-motion` | WCAG 2.2 AA |
| Privasi | ekspor & hapus data per orang (GDPR), IP disimpan sebagai hash harian, tanpa cookie pelacak | — |
| Deploy | `wrangler.jsonc` (Workers + D1 + aset statis), `Dockerfile` + `docker-compose.yml` (Node + volume SQLite), migrasi otomatis | satu perintah |

### 2.4 Gambar animasi setiap menu & dashboard

`npm run tour` menjalankan `tour.ts` dengan Playwright pada build demo: membuka setiap menu dan dashboard, melakukan
aksi yang menunjukkan fungsinya (mengisi, memfilter, menyeret, membuka detail), dan merekamnya. ffmpeg mengubah setiap
rekaman menjadi **WebP animasi** (desktop 1280×800, mobile 390×844, ±12 fps, ≤ 1,5 MB) + poster diam. Hasilnya +
`manifest.json` (judul dan keterangan EN/ES/ID per menu) masuk ke `public/demos/<slug>/shots/`.

Halaman `/templates/<slug>` menampilkan galeri **"Setiap menu & dashboard"** dari manifest itu (dimuat malas; bila
pengunjung meminta gerak minimal, hanya poster yang tampil) dan tombol **"Coba demo langsung"** yang membuka
`https://xaa.es/demos/<slug>/`. `demoUrl` hanya diisi setelah demo benar-benar tayang (aturan katalog yang sudah ada).

### 2.5 Syarat "siap produksi, bukan script sampah" (Definition of Done setiap template)

Sebuah template baru boleh ditandai ✅ bila **semua** ini terpenuhi:

1. Semua menu & fitur di bagian 4 untuk template itu ada dan bekerja — tidak ada tombol mati atau teks placeholder.
2. TypeScript strict tanpa error; logika domain diuji unit (cakupan baris ≥ 85 % pada `src/domain`).
3. Tes API pada `node:sqlite`: setiap route, termasuk penolakan izin dan validasi.
4. E2E Playwright pada build demo: setiap menu terbuka, alur inti lulus, desktop + mobile, **nol error konsol**,
   axe tanpa pelanggaran serius.
5. Deploy diuji di dua tempat: `wrangler dev` (Workers + D1 lokal) dan `docker compose up`.
6. Dokumentasi lengkap: SETUP (Workers & Docker), REBRAND, ARCHITECTURE, API.
7. Gambar animasi setiap menu & dashboard dibuat ulang oleh tur dan tayang di halaman template.
8. Demo tayang di `xaa.es/demos/<slug>/`, `demoUrl` diisi, `stack` di katalog sesuai teknologi yang sebenarnya.
9. Bundle zip dibuat CI repo privat dan bisa dilampirkan ke pesanan.

---

## 3. Urutan kerja & status

Urutan: inti bersama dulu, lalu template Starter (cepat, membuktikan seluruh jalur: kode → demo → gambar animasi →
bundle), lalu Business menurut kemungkinan laku, lalu Enterprise dan Super yang dibangun di atas template sebelumnya.

| # | Template | Tier | Harga | Logika (bagian 4) | Kode | Demo | Gambar animasi | Status |
|---|---|---|---|---|---|---|---|---|
| 0 | XAA Kit (inti bersama) | — | — | ✅ §2.3 | ✅ | — | — | ✅ 20 Okt |
| 1 | Waitlist & Landing | Starter | €390 | ✅ §4.1 | ✅ | ✅ | ✅ 15 klip | ✅ 20 Okt (§2.5 terpenuhi) |
| 2 | Link-in-Bio | Starter | €490 | ✅ §4.2 | ❌ | ❌ | ❌ | ❌ |
| 3 | Forms & Surveys | Starter | €690 | ✅ §4.3 | ❌ | ❌ | ❌ | ❌ |
| 4 | CRM & Sales Pipeline | Business | €1.490 | ✅ §4.4 | ❌ | ❌ | ❌ | ❌ |
| 5 | Invoicing & Billing | Business | €1.290 | ✅ §4.5 | ❌ | ❌ | ❌ | ❌ |
| 6 | Booking & Appointments | Business | €1.390 | ✅ §4.6 | ❌ | ❌ | ❌ | ❌ |
| 7 | Help Desk & Support | Business | €1.290 | ✅ §4.8 | ❌ | ❌ | ❌ | ❌ |
| 8 | Project & Task Management | Business | €1.590 | ✅ §4.9 | ❌ | ❌ | ❌ | ❌ |
| 9 | Restaurant Ordering & QR Menu | Business | €1.190 | ✅ §4.11 | ❌ | ❌ | ❌ | ❌ |
| 10 | Subscriptions & Memberships | Business | €1.690 | ✅ §4.12 | ❌ | ❌ | ❌ | ❌ |
| 11 | E-Commerce Storefront | Business | €1.990 | ✅ §4.7 | ❌ | ❌ | ❌ | ❌ |
| 12 | Online Courses (LMS) | Business | €1.790 | ✅ §4.10 | ❌ | ❌ | ❌ | ❌ |
| 13 | Multi-Tenant SaaS Platform Kit | Enterprise | €40.000–90.000 | ✅ §4.13 | ❌ | ❌ | ❌ | ❌ |
| 14 | AI SaaS Platform (BYOK) | Super | €180.000–600.000 | ✅ §4.16 | ❌ | ❌ | ❌ | ❌ |
| 15 | Marketplace Platform | Enterprise | €70.000–150.000 | ✅ §4.14 | ❌ | ❌ | ❌ | ❌ |
| 16 | ERP Suite | Enterprise | €90.000–180.000 | ✅ §4.15 | ❌ | ❌ | ❌ | ❌ |
| 17 | Fintech / Neobank Core | Super | €300.000–900.000 | ✅ §4.17 | ❌ | ❌ | ❌ | ❌ |
| 18 | Global Enterprise Ecosystem | Super | €500.000–1.200.000 | ✅ §4.18 | ❌ | ❌ | ❌ | ❌ |

**Progres keseluruhan: logika 18/18 tertulis · produk 1/18 · demo 1/18 · gambar animasi 1/18.**

---

## 4. Logika per template

Setiap template mengikuti format yang sama: pembanding kelas dunia, peran, **menu** (setiap menu = satu gambar
animasi), **dashboard**, data, logika inti, integrasi, dan "selesai bila".

### 4.1 Waitlist & Landing (Starter, €390)

- **Pembanding:** GetWaitlist, Viral Loops, Prefinery, LaunchList.
- **Peran:** Owner, Admin, Viewer (operator); pendaftar (publik, tanpa akun).
- **Halaman publik:** landing (judul, subjudul, logo, keunggulan, FAQ, penghitung pendaftar), formulir (email, nama,
  pertanyaan tambahan, persetujuan privasi), verifikasi email (double opt-in), halaman status `/s/<kode>`: posisi,
  jumlah orang di belakang, tautan referral, tombol bagikan, kemajuan milestone, papan peringkat (alias, opt-in).
- **Logika posisi:** `skor = nomor_urut_daftar − (lompatan × referral_terverifikasi)`; posisi = peringkat skor (seri →
  yang lebih dulu daftar). Lompatan per referral diatur admin (bawaan 5). Hanya referral yang **sudah verifikasi
  email** yang dihitung.
- **Anti-kecurangan:** blok domain email sekali pakai, batas laju per IP, referral dari IP-hash yang sama dengan pengajak
  dalam 24 jam ditandai, alamat dengan pola `nama+1@` dinormalisasi, pendaftar bisa ditandai dan dikeluarkan dari
  hitungan.
- **Milestone & hadiah:** daftar ambang (mis. 3 referral → akses awal, 10 → anggota pendiri), email otomatis saat
  tercapai.
- **Undangan bertahap:** "Undang N teratas" → status *invited*, email berisi tautan akses; terima → *joined*; tingkat
  penerimaan per gelombang.
- **Menu admin:** Ringkasan · Pendaftar · Referral & papan peringkat · Undangan · Milestone · Email (templat + log) ·
  Halaman landing (editor + pratinjau) · Formulir (pertanyaan tambahan) · Integrasi (webhook, API key, widget sematan) ·
  Tim · Audit · Pengaturan.
- **Dashboard:** pendaftar hari ini / 7 hari / total, % terverifikasi, % dari referral, koefisien viral
  (k = rata-rata referral terverifikasi per pendaftar), grafik harian langsung vs referral, sumber UTM teratas, pengajak
  teratas, corong daftar → verifikasi → diundang → bergabung.
- **Integrasi:** webhook `signup.created`, `signup.verified`, `referral.counted`, `milestone.reached`, `invite.sent`,
  `invite.accepted`; API REST; ekspor CSV; widget sematan (skrip satu baris).
- **Selesai bila:** referral terverifikasi menaikkan posisi tepat sebesar lompatan (tes unit), kecurangan contoh
  ditandai, undangan bertahap mengirim email ke N teratas, semua menu lulus §2.5.

### 4.2 Link-in-Bio (Starter, €490)

- **Pembanding:** Linktree, Beacons, Bento.
- **Peran:** operator (Owner/Admin/Moderator), pengguna (pemilik profil).
- **Profil publik `/@handle`:** blok tautan, judul, teks, gambar, sematan (YouTube, Spotify), ikon sosial, formulir
  email, tautan produk; jadwal tampil (dari/sampai); SEO per profil; kode QR.
- **Editor:** seret-lepas urutan blok, pratinjau ponsel langsung, tema (preset + warna/huruf/tombol/latar kustom).
- **Analitik tanpa cookie:** tayangan, klik, CTR per blok, perujuk, negara (header Cloudflare), perangkat; disimpan
  sebagai agregat harian (hemat database); IP tidak disimpan.
- **Domain kustom:** instruksi CNAME + verifikasi.
- **Menu pengguna:** Editor · Tampilan · Analitik · Pelanggan email · Pengaturan (handle, SEO, domain) · Akun.
- **Menu operator:** Ringkasan · Pengguna · Laporan & moderasi (blokir domain berbahaya) · Paket & batas · Audit ·
  Pengaturan.
- **Dashboard:** pengguna aktif, profil dibuat, total tayangan/klik, blok teratas, laporan menunggu moderasi.
- **Selesai bila:** klik tercatat sekali per kunjungan (tes), jadwal blok dihormati, handle unik & aman, moderasi bekerja.

### 4.3 Forms & Surveys (Starter, €690)

- **Pembanding:** Typeform, Tally, Jotform.
- **Jenis pertanyaan:** teks pendek/panjang, email, angka, telepon, tanggal, pilihan tunggal/ganda, dropdown, rating,
  NPS, skala, ya/tidak, unggah file, tanda tangan, field tersembunyi dari parameter URL, pernyataan.
- **Logika:** tampilkan-jika, lompat-ke, halaman, skor/kuis, layar terima kasih bersyarat + redirect.
- **Pengaturan:** tutup pada tanggal / setelah N jawaban, kata sandi, satu-pertanyaan-per-layar atau klasik, tema.
- **Jawaban:** tabel, tampilan per jawaban, filter, ekspor CSV, grafik per pertanyaan (batang, pai, rincian NPS, rata-
  rata), corong (dilihat → mulai → kirim), jawaban parsial.
- **Notifikasi:** email saat ada jawaban, autoresponder ke responden, webhook.
- **Menu:** Formulir · Builder (Susun · Logika · Desain · Pengaturan · Bagikan) · Hasil (Ringkasan · Jawaban · Insight) ·
  Integrasi · Tim · Audit · Pengaturan.
- **Dashboard:** formulir aktif, jawaban 7 hari, tingkat penyelesaian, waktu isi rata-rata.
- **Selesai bila:** logika diuji pada graf pertanyaan bersiklus (ditolak) dan bercabang, validasi server = klien, sematan
  iframe & popup bekerja.

### 4.4 CRM & Sales Pipeline (Business, €1.490)

- **Pembanding:** Pipedrive, HubSpot CRM, Attio.
- **Peran:** Owner, Admin, Manager, Sales (opsi: hanya melihat deal sendiri), Viewer. Multi-tenant (organisasi).
- **Data:** kontak, perusahaan, deal (pipeline, tahap, nilai, mata uang, probabilitas, perkiraan tutup, pemilik),
  pipeline + tahap yang bisa diatur, aktivitas (telepon/rapat/tugas/email, jatuh tempo, selesai), catatan, timeline,
  tag, field kustom, produk + baris produk per deal, alasan kalah.
- **Logika:** forecast tertimbang = Σ nilai × probabilitas tahap; deal "membusuk" bila terlalu lama di satu tahap;
  deteksi duplikat (email/domain); impor CSV dengan pemetaan kolom; pengingat aktivitas.
- **Menu:** Dashboard · Pipeline (Kanban seret-lepas) · Deal · Kontak · Perusahaan · Aktivitas (kalender/daftar) ·
  Produk · Laporan · Impor/Ekspor · Pengaturan (pipeline, tahap, field kustom, alasan kalah, tim & peran, merek) · Audit.
- **Dashboard:** nilai pipeline per tahap, forecast bulan/kuartal, win rate, nilai deal rata-rata, lama siklus,
  aktivitas selesai vs jatuh tempo, peringkat per sales.
- **Selesai bila:** perhitungan forecast & win rate diuji, isolasi tenant diuji (organisasi A tidak melihat B), seret
  deal antar tahap tercatat di timeline.

### 4.5 Invoicing & Billing (Business, €1.290)

- **Pembanding:** FreshBooks, Zoho Invoice, Invoice Ninja.
- **Data & alur:** klien, item, tarif pajak (ganda, majemuk, termasuk/tidak termasuk), mata uang dengan kurs;
  penawaran → diterima online → faktur; penomoran per tahun/prefiks; pembayaran sebagian; nota kredit; faktur berulang
  (jadwal, kirim otomatis); pengingat (sebelum/saat/sesudah jatuh tempo); tautan bayar online (Stripe / PayPal) dengan
  webhook yang menandai lunas; pembayaran manual; kuitansi; PDF bermerek; portal klien (lihat, bayar, unduh).
- **Logika uang:** semua dalam satuan terkecil (sen), pembulatan per baris atau per total sesuai setelan — diuji.
- **Menu:** Dashboard · Faktur · Penawaran · Berulang · Pembayaran · Nota kredit · Klien · Item · Laporan · Pengaturan
  (perusahaan, pajak, penomoran, templat, gateway, pengingat, email) · Tim · Audit.
- **Dashboard:** piutang berjalan, umur piutang 0-30-60-90+, pendapatan per bulan, laporan pajak per tarif, klien
  teratas, DSO.
- **Selesai bila:** semua kasus pajak & pembulatan diuji, webhook pembayaran idempoten, PDF sesuai merek.

### 4.6 Booking & Appointments (Business, €1.390)

- **Pembanding:** Calendly, Acuity, SimplyBook.me, Fresha.
- **Data:** layanan (durasi, harga, buffer sebelum/sesudah, kapasitas kelas), staf (jam kerja, istirahat, cuti), sumber
  daya (ruang), lokasi, pelanggan, formulir intake.
- **Mesin ketersediaan:** slot = jam kerja ∩ tidak terpesan ∩ buffer ∩ pemberitahuan minimum ∩ batas hari ke depan;
  zona waktu IANA dengan DST benar (diuji pada tanggal pergantian DST).
- **Halaman pesan publik:** layanan → staf/siapa saja → tanggal → slot → data → DP opsional → konfirmasi; tautan ubah
  jadwal/batal dengan aturan batas waktu; pengingat email/SMS; lampiran .ics + feed iCal; daftar tunggu untuk slot
  penuh; tandai no-show (DP hangus sesuai kebijakan).
- **Menu:** Kalender (hari/minggu per staf) · Pemesanan · Pelanggan · Layanan · Staf · Sumber daya · Ketersediaan ·
  Pembayaran · Notifikasi · Halaman pemesanan · Laporan · Pengaturan · Tim · Audit.
- **Dashboard:** pemesanan hari ini/minggu ini, utilisasi per staf, pendapatan, tingkat no-show, layanan terpopuler.
- **Selesai bila:** tidak ada pemesanan ganda pada beban bersamaan (tes), DST benar, kebijakan batal ditegakkan.

### 4.7 E-Commerce Storefront (Business, €1.990)

- **Pembanding:** Shopify, WooCommerce, Medusa.
- **Katalog:** produk, varian (matriks opsi), SKU, stok per lokasi, gambar, koleksi, tag, SEO + JSON-LD Product.
- **Keranjang & checkout:** tamu + akun; alamat; ongkir per zona/berat/harga; pajak per wilayah; diskon (kode, otomatis,
  %, nominal, gratis ongkir, beli-X-dapat-Y, batas pakai, minimum belanja); pembayaran Stripe/PayPal; email konfirmasi.
- **Pesanan:** status (menunggu, lunas, dikirim sebagian/penuh, dikembalikan, batal), nomor resi, refund sebagian,
  retur (RMA); email keranjang terbengkalai; ulasan dimoderasi; pencarian dengan filter.
- **Menu:** Dashboard · Pesanan · Produk · Koleksi · Stok · Pelanggan · Diskon · Ulasan · Pengiriman · Pajak ·
  Pembayaran · Toko (tema, halaman, navigasi) · Laporan · Pengaturan · Tim · Audit.
- **Dashboard:** penjualan, pesanan, AOV, corong (kunjungan → keranjang → checkout → pesanan), produk teratas, stok
  menipis.
- **Selesai bila:** stok tidak bisa minus pada checkout bersamaan, perhitungan diskon + pajak + ongkir diuji, webhook
  pembayaran idempoten.

### 4.8 Help Desk & Support (Business, €1.290)

- **Pembanding:** Zendesk, Freshdesk, Help Scout.
- **Kanal:** email masuk (webhook Postmark/Mailgun/Cloudflare Email Routing), formulir web, widget chat dasar, API.
- **Tiket:** status (baru, terbuka, menunggu, ditahan, selesai, ditutup), prioritas, jenis, tag, penanggung jawab/grup,
  field kustom, balasan publik vs catatan internal, gabung/pisah tiket, deteksi tabrakan (siapa sedang membuka),
  lampiran.
- **SLA:** target respons pertama & penyelesaian per prioritas, kalender jam kerja, peringatan sebelum dilanggar.
- **Otomasi:** pemicu (jika … maka …), makro / balasan siap pakai dengan variabel, tampilan tersimpan, survei CSAT.
- **Basis pengetahuan:** kategori, artikel berversi, pencarian, multi-bahasa, portal publik, umpan balik artikel, saran
  artikel saat pelanggan menulis tiket.
- **Menu:** Kotak masuk & tampilan · Tiket · Pelanggan · Organisasi · Basis pengetahuan · Makro · Otomasi · SLA ·
  Laporan · Kanal · Pengaturan · Tim · Audit.
- **Dashboard:** tiket per status, median respons pertama, waktu selesai, kepatuhan SLA, CSAT, tren backlog, peringkat
  agen.
- **Selesai bila:** jam SLA dihitung dengan kalender jam kerja (tes), email balasan masuk ke tiket yang benar.

### 4.9 Project & Task Management (Business, €1.590)

- **Pembanding:** Linear, Jira, Asana.
- **Struktur:** workspace → proyek → papan Kanban (batas WIP), daftar, kalender, timeline/Gantt (dependensi selesai-ke-
  mulai, jalur kritis).
- **Tugas:** judul, deskripsi markdown, penanggung jawab, label, prioritas, estimasi, tenggat, subtugas/checklist,
  lampiran, field kustom, berulang.
- **Sprint:** perencanaan, kapasitas, burndown, velocity, backlog; komentar dengan @mention, notifikasi in-app + ringkasan
  email; pelacakan waktu; milestone; templat proyek; pembaruan realtime; pintasan keyboard + palet perintah.
- **Menu:** Beranda (tugas saya) · Notifikasi · Proyek · Papan · Daftar · Timeline · Kalender · Sprint · Backlog ·
  Laporan · Waktu · Pengaturan · Anggota · Audit.
- **Dashboard:** kesehatan proyek, burndown, velocity, beban kerja per anggota, terlambat.
- **Selesai bila:** dependensi siklik ditolak, jalur kritis diuji, burndown sesuai data.

### 4.10 Online Courses — LMS (Business, €1.790)

- **Pembanding:** Teachable, Thinkific, Kajabi.
- **Kursus:** bagian → pelajaran (video, teks, PDF, kuis, tugas), drip, prasyarat, kohort.
- **Pendaftaran:** gratis / bayar sekali / langganan, kupon, bundel.
- **Kemajuan:** pelajaran selesai, % video ditonton; kuis (bank soal, pilihan ganda/jamak, benar-salah, isian, acak,
  nilai lulus, batas percobaan, timer); tugas dinilai instruktur; sertifikat PDF dengan kode/QR + halaman verifikasi
  publik; diskusi per pelajaran; pengumuman.
- **Menu admin:** Dashboard · Kursus · Siswa · Pendaftaran · Kuis · Tugas · Sertifikat · Kupon · Pembayaran · Laporan ·
  Pengaturan · Tim · Audit. **Menu siswa:** Kursus saya · Pemutar kursus · Sertifikat · Akun.
- **Dashboard:** pendaftaran, pendapatan, tingkat penyelesaian, analitik kuis per soal, siswa berisiko berhenti.
- **Selesai bila:** penilaian kuis diuji, drip & prasyarat ditegakkan di server, sertifikat bisa diverifikasi.

### 4.11 Restaurant Ordering & QR Menu (Business, €1.190)

- **Pembanding:** Toast Online Ordering, Square for Restaurants, me&u.
- **Menu makanan:** kategori, item, grup modifier (wajib/opsional, min/maks), alergen & label diet, foto, jadwal
  ketersediaan, tombol "habis", multi-bahasa.
- **Pemesanan:** QR per meja (token meja), sesi meja dengan beberapa pesanan, takeaway dengan slot waktu, bayar online
  atau di kasir, tip, service charge, pajak; panggil pelayan / minta tagihan.
- **Layar dapur (KDS):** per stasiun, timer tiket, warna menurut umur tiket, bump & recall; status pesanan realtime untuk
  tamu.
- **Menu admin:** Pesanan live · Layar dapur · Meja & QR · Menu (kategori, item, modifier) · Ketersediaan · Pembayaran ·
  Laporan · Pengaturan · Tim (pemilik, manajer, pelayan, dapur) · Audit.
- **Dashboard:** penjualan per jam/hari, item teratas, waktu siap rata-rata, perputaran meja.
- **Selesai bila:** aturan modifier diuji, token meja tidak bisa dipakai untuk meja lain, KDS diperbarui tanpa muat ulang.

### 4.12 Subscriptions & Memberships (Business, €1.690)

- **Pembanding:** Memberful, Chargebee, Recurly.
- **Paket:** bulanan/tahunan, trial, biaya awal, tier, add-on, kuantitas per kursi.
- **Siklus:** checkout (Stripe Billing / PayPal), portal anggota (naik/turun paket dengan prorata, jeda, batal dengan
  survei alasan + tawaran bertahan, ganti metode bayar, unduh faktur), dunning (jadwal coba ulang, email, masa tenggang,
  cabut akses), kupon (sekali/berulang/selamanya), kredit referral, area anggota (konten, unduhan).
- **Mesin status:** trialing → active → past_due → paused → canceled → expired, digerakkan webhook secara idempoten.
- **Metrik:** MRR, ARR, MRR baru/ekspansi/kontraksi/churn/reaktivasi, churn logo & pendapatan, LTV, ARPU, tabel retensi
  kohort, konversi trial.
- **Menu:** Dashboard · Pelanggan · Langganan · Paket · Kupon · Faktur · Dunning · Konten anggota · Email · Laporan
  (kohort) · Integrasi · Pengaturan · Tim · Audit.
- **Selesai bila:** prorata & metrik MRR diuji dengan kasus naik/turun/batal/reaktivasi, webhook ganda tidak mengubah
  status dua kali.

### 4.13 Multi-Tenant SaaS Platform Kit (Enterprise, €40.000–90.000)

- **Pembanding:** WorkOS + Clerk + Stripe Billing (kedalaman enterprise), BoxyHQ.
- **Identitas:** organisasi, keanggotaan, undangan, peran & izin halus + peran kustom; kata sandi, magic link, passkey
  (WebAuthn), TOTP MFA, OAuth sosial, **SSO SAML 2.0 & OIDC per organisasi**, verifikasi domain + gabung otomatis,
  **SCIM 2.0**, manajemen sesi & perangkat.
- **Billing:** matriks paket, kursi, pemakaian terukur, faktur, entitlements/feature flag per paket.
- **Platform:** API REST + OpenAPI 3.1, API key per organisasi, batas laju per paket, webhook dengan retry & tanda
  tangan, idempotency key; audit log per organisasi (ekspor SIEM, retensi); ekspor/hapus data; white-label & domain per
  tenant; job latar (Queues); OpenTelemetry; IaC (Terraform Cloudflare + Helm/Docker).
- **Menu:** Dashboard contoh · Organisasi (Umum, Anggota, Peran, SSO, SCIM, Domain, Billing, Pemakaian, API key,
  Webhook, Audit, Keamanan) · Pengguna (Profil, Keamanan/MFA/passkey, Sesi) · Super-admin (Tenant, Pengguna, Paket,
  Feature flag, Log impersonasi, Job, Kesehatan sistem).
- **Selesai bila:** login SAML & OIDC diuji dengan IdP uji, SCIM lulus suite kepatuhan, isolasi tenant diuji di setiap
  route, impersonasi tercatat dan terlihat oleh tenant.

### 4.14 Marketplace Platform (Enterprise, €70.000–150.000)

- **Pembanding:** Sharetribe, Mirakl, CS-Cart Multi-Vendor.
- **Aplikasi pembeli:** pencarian dengan faset & peringkat, listing, keranjang multi-penjual, checkout dipecah per
  penjual, pesanan, pesan pembeli ↔ penjual, ulasan, sengketa.
- **Aplikasi penjual:** onboarding + KYC (adaptor Stripe Connect / Onfido), profil toko, listing + stok, pemenuhan
  pesanan, saldo (tertahan/tersedia) & payout, rincian biaya, analitik.
- **Back office operator:** persetujuan penjual, antrean moderasi, kategori & atribut, **mesin komisi** (global /
  kategori / penjual, % + tetap, bertingkat), **ledger double-entry** (pembayaran → escrow → utang ke penjual → payout;
  pendapatan platform), jadwal payout, penahanan & cadangan, refund & chargeback, alur sengketa dengan bukti & SLA,
  promosi, laporan (GMV, take rate, pendapatan bersih, penjual/kategori teratas), audit.
- **Selesai bila:** setiap transaksi seimbang di ledger (tes properti), komisi bertingkat diuji, payout tidak melebihi
  saldo tersedia.

### 4.15 ERP Suite (Enterprise, €90.000–180.000)

- **Pembanding:** Odoo, ERPNext, NetSuite (bagian inti).
- **Modul:** Persediaan (item, satuan, varian, gudang/rak, mutasi, lot/serial, valuasi FIFO/rata-rata, titik pesan
  ulang, transfer, stock opname); Pembelian (RFQ → PO → penerimaan → tagihan, 3-way match); Penjualan (penawaran → SO →
  pengiriman → faktur, daftar harga); Akuntansi (bagan akun, jurnal, buku besar double-entry, AR/AP, pembayaran,
  rekonsiliasi bank dari CSV/OFX, pajak, multi-mata uang + revaluasi, tutup periode, laba rugi, neraca, neraca saldo,
  arus kas); multi-perusahaan + antar-perusahaan; persetujuan bertingkat; jejak audit; impor data; API.
- **Dashboard:** nilai persediaan, perputaran, penjualan per periode, belanja pembelian, umur AR/AP, margin.
- **Selesai bila:** neraca selalu seimbang (tes properti), valuasi FIFO & rata-rata diuji, tutup periode mengunci jurnal.

### 4.16 AI SaaS Platform — BYOK (Super, €180.000–600.000)

- **Pembanding:** Dust, TypingMind Teams, Stack AI.
- **Isi:** workspace multi-tenant + SSO; asisten (instruksi, alat, pengetahuan); sumber pengetahuan (unggah file, URL,
  konektor OAuth tahap 2); pipeline ingest (parse, potong, embed dengan kunci tenant, Vectorize / pgvector); jawaban
  dengan sitasi; chat streaming, thread, berbagi, umpan balik; **router model** (Anthropic, OpenAI, Google, Mistral,
  endpoint kompatibel OpenAI/lokal; fallback, routing sadar biaya); **brankas kunci BYOK** (enkripsi amplop per tenant,
  kunci tidak pernah ditulis ke log); metering token per pengguna/asisten/model + biaya; anggaran & batas; billing kursi
  + pemakaian; **harness evaluasi** (dataset, jawaban emas, penilai model + tinjauan manusia, regresi per versi prompt);
  guardrail (redaksi PII sebelum dikirim, heuristik prompt injection, filter keluaran); pustaka prompt berversi; audit;
  analitik.
- **Selesai bila:** jawaban RAG menyertakan sitasi yang benar pada dataset uji, kunci BYOK tidak pernah muncul di log
  (tes), evaluasi regresi berjalan di CI.

### 4.17 Fintech / Neobank Core (Super, €300.000–900.000)

- **Pembanding:** Mambu, Apache Fineract, ledger Modern Treasury.
- **Isi:** ledger double-entry **tidak bisa diubah** (posting wajib seimbang, idempotency key, pending vs posted,
  hold/otorisasi, koreksi lewat jurnal balik — tidak pernah dihapus); onboarding & KYC/KYB (adaptor penyedia, unggah
  dokumen, skor risiko, adaptor screening sanksi/PEP); rekening & dompet multi-mata uang dengan batas; transfer internal,
  payout lewat adaptor rel pembayaran, adaptor penerbitan kartu; FX dengan kuotasi & spread; aturan pemantauan transaksi
  (kecepatan, nominal, geografi) + manajemen kasus + ekspor laporan; laporan rekening bulanan (PDF); mesin bunga/biaya
  (akrual harian); rekonsiliasi dengan laporan penyedia; **maker-checker** untuk aksi back office; RBAC; audit tamper-
  evident; aplikasi nasabah web + back office + API mitra.
- **Batas kejujuran:** ini perangkat lunak; izin e-money/perbankan tetap tanggung jawab pembeli.
- **Selesai bila:** semua saldo dapat direkonstruksi dari posting (tes properti), maker-checker tidak bisa dilewati,
  akrual bunga diuji per hari.

### 4.18 Global Enterprise Ecosystem (Super, €500.000–1.200.000)

- **Isi:** portal pelanggan, portal mitra, konsol internal yang berbagi satu identitas & lapisan API (dari §4.13),
  lapisan AI (dari §4.16), API gateway, event bus, backup & pemulihan terjadwal dengan latihan restore, IaC multi-region,
  observabilitas, baseline keamanan.
- **Ketergantungan:** dibangun setelah §4.13 dan §4.16 selesai.
- **Selesai bila:** latihan restore terdokumentasi lulus, deploy multi-region dari IaC lulus di lingkungan uji.

---

## 5. Yang berubah di xaa.es saat sebuah template selesai

1. `src/content/templates.ts`: `demoUrl` = `https://xaa.es/demos/<slug>/`, `stack` = teknologi sebenarnya.
2. `public/demos/<slug>/` (build demo) dan `public/demos/<slug>/shots/` (gambar animasi + `manifest.json`).
3. `/templates/<slug>`: galeri "Setiap menu & dashboard" + tombol demo; JSON-LD `SoftwareApplication` dengan
   `screenshot`.
4. Sitemap tetap memuat `/templates/<slug>`; halaman demo diberi `noindex` (konten demo bukan konten untuk mesin
   pencari).
5. Baris status di bagian 3 diperbarui, dan `docs/BLUEPRINT.md` §3 permintaan 38.

## 6. Changelog

- **20 Okt 2026 (2)**: §2.2a — template menyimpan data di R2 (Workers), R2 di disk (Docker) dan R2 di IndexedDB (demo),
  tidak lagi D1/SQLite; Waitlist dipindah juga. Urutan pembangunan setelah data xaa.es ke R2 tayang: dari termurah
  (Link-in-Bio €490) ke termahal.
- **20 Okt 2026**: blueprint dibuat dari perintah pemilik 18 Okt — keadaan sebenarnya (0/18 produk), keputusan repo
  privat, arsitektur satu-kode-tiga-tempat, inti bersama, jalur gambar animasi, syarat siap produksi, logika 18 template,
  urutan kerja.
