# Blueprint proyek xaa.es — PT AXTO DIGITAL GLOBAL

Dokumen ini adalah catatan induk proyek: semua permintaan, apa yang sudah
dikerjakan, apa yang belum, dan apa yang belum diuji. **Setiap permintaan baru
atau perubahan wajib dicatat di sini dulu** (bagian 3 dan 8), lalu statusnya
diperbarui setelah diuji.

Terakhir diperbarui: 27 September 2026.

Arti tanda:

- ✅ selesai dan lulus uji
- 🟡 selesai tetapi belum diuji penuh di produksi, atau butuh tindakan manual
- ❌ belum dikerjakan
- ⏸️ ditunda atas permintaan pemilik

---

## 1. Gambaran sistem

| Bagian | Isi |
|---|---|
| Situs | https://xaa.es: studio pengembangan web (EN/ES/ID), katalog paket, template SaaS, profil perusahaan, arsip artikel sepak bola |
| Teknologi | Next.js 15 (App Router) di Cloudflare Workers via `@opennextjs/cloudflare` |
| Database | Cloudflare D1 (paket gratis, ada batas baca harian) |
| Penyimpanan file | R2 **belum aktif** di akun Cloudflare. Unggahan file dan bundle template belum bisa disimpan |
| Deploy | GitHub Actions `Deploy to Cloudflare` jalan otomatis setiap push ke `main`, lalu menjalankan smoke test produksi |
| Sesi login | Cookie bertanda tangan HMAC-SHA256 (`src/server/session.ts`); tidak butuh D1 atau R2 |
| Admin | Di-seed langsung (email di `src/server/auth.ts`, hash PBKDF2). Pendaftar pertama **tidak** otomatis menjadi admin |
| Rahasia | `SESSION_SECRET` dibuat sekali oleh workflow; password admin tidak pernah di-commit (tes membacanya dari env `ADMIN_PASS`) |

---

## 2. Aturan tetap (jangan dilanggar)

1. Repo **sairan** tidak boleh disentuh.
2. Data warga asli tidak pernah dipublikasikan; demo hanya pakai data simulasi.
3. Tautan `workers.dev` diverifikasi dulu sebelum dikirim.
4. NIK, NPWP, tanggal lahir, dan alamat rumah dari dokumen PT tidak boleh tampil di situs; dokumen legal yang tampil sudah disensor.
5. Asisten AI di chat hanya menjawab informasi publik situs. Ia tidak boleh membocorkan rahasia perusahaan, kunci API, alamat dompet, atau nomor rekening.
6. SEO hanya untuk **xaa.es**; SEO situs lain ⏸️ ditunda.
7. Password admin tidak pernah masuk ke repo, log, atau konteks AI.

---

## 3. Log permintaan (dari awal sampai sekarang)

| # | Permintaan | Status | Bukti / catatan |
|---|---|---|---|
| 1 | Artikel sepak bola diperluas menjadi 1.800+ kata, iklan Adsterra | ✅ | commit Juli–Agustus 2026 |
| 2 | Rebrand xaa.es menjadi studio web: layanan, proses, perawatan, pembayaran | ✅ | `d9b0650`, `3f2cea6` |
| 3 | Portal klien: daftar, pesan, bayar, unggah, lacak, serah terima | 🟡 | Alur berjalan dan lulus E2E. Unggah file butuh R2 (belum aktif) |
| 4 | Admin: kendali uang dan rahasia, invoice, kotak lead, demo sipil | ✅ | `7a3c5a3` |
| 5 | Admin di-seed, login tersembunyi, transfer BNI, tombol reveal | ✅ | `f7f0c9c` |
| 6 | Tiga bahasa (EN/ES/ID) di seluruh situs publik | ✅ | `3a24aa2`, `94b5a34` |
| 7 | Ganti SLA 24/7 dengan backup dan pemulihan AI; harga AXTO per aplikasi | ✅ | `499167d`, `c557301` |
| 8 | Toko template SaaS | 🟡 | Lihat bagian 5: katalog dan pembayaran jalan, tetapi produknya belum dibangun |
| 9 | Login admin gagal (D1 over quota, R2 tidak ada) | ✅ | `3601bfc`: sesi pindah ke cookie bertanda tangan. Produksi `signInReady: true` |
| 10 | Tampilkan/sembunyikan password dan simpan kredensial di browser | ✅ | `711ef4c` |
| 11 | Profil perusahaan: foto CEO/CTO, logo, sertifikat kemitraan tajam, pernyataan PT | ✅ | `37a2ebd`, halaman `/company` |
| 12 | SEO sesuai checklist (21 bagian), fokus xaa.es | ✅ 93% | `2203b2d`. Sisanya ada di bagian 6 |
| 13 | Alat audit SEO dan pelacak di admin | ✅ | `75f1fc7`: `/portal/admin/seo`, workflow mingguan |
| 14 | `/portal` admin error "This page could not load" | ✅ | `7fbb829`: penanda skema hanya ditulis bila semua migrasi sukses; `/api/portal/diagnose` menunjukkan loader yang gagal |
| 15 | Pengaturan pembayaran dari admin, terenkripsi | ✅ | Tujuan pembayaran dienkripsi AES-GCM di D1. R2 belum aktif, jadi datanya tidak di R2 |
| 16 | Metode bayar: crypto + rekening BNI dari repo ulyah.com | ✅ | Tombol "Import company accounts (crypto + BNI)": 5 crypto + 13 akun BNI, tanpa duplikat |
| 17 | Chat live dengan admin; AI ulyah.com menjawab bila admin tidak aktif | ✅ | Widget di semua halaman publik; desk admin `/portal/admin/support` |
| 18 | AI tidak boleh membocorkan rahasia | ✅ | Konteks AI hanya paket pengetahuan publik; balasan disaring (kunci, alamat, rekening → `[removed]`) |
| 19 | Email/kontak support lokal masuk ke chat support admin | ✅ | Form `/contact` otomatis membuka percakapan di desk Support |
| 20 | Dropdown pertanyaan: penawaran, nego harga, crypto, transfer bank, template, proyek, lainnya | ✅ | Pilihan topik di widget chat |
| 21 | Blueprint dari awal sampai akhir | ✅ | Dokumen ini |
| 22 | Judul halaman paket unik per bahasa (temuan audit SEO) | ✅ | ES: "…: precio y plazos", ID: "Jasa …" |
| 23 | Uji berulang sampai 100%, termasuk template SaaS | 🟡 | Tes otomatis ada di `tests/e2e/` (bagian 4). Template "super" belum punya produk untuk diuji |

---

## 4. Pengujian

Semua tes ada di `tests/e2e/` dan dijalankan terhadap Worker lokal
(`npm run cf:preview`, port 8799) atau produksi.

```bash
cd tests/e2e && npm ci
ADMIN_PASS='…' node portal.e2e.mjs  http://localhost:8799   # semua menu portal admin + member
ADMIN_PASS='…' node d1down.e2e.mjs  http://localhost:8799   # login tetap jalan saat D1 kena kuota
node mock-ai.mjs &                                            # AI tiruan di :8899 (SUPPORT_AI_URL di .dev.vars)
ADMIN_PASS='…' node support.e2e.mjs http://localhost:8799   # chat, AI, pembayaran, diagnosis
node seo-verify.mjs http://localhost:8799                     # 41 cek SEO
```

| Rangkaian | Hasil terakhir | Tanggal |
|---|---|---|
| Portal (admin + member, semua menu) | 41/41 lulus | 27 Sep 2026 |
| Login saat D1 over quota | lulus | 27 Sep 2026 |
| SEO (head metadata untuk browser/Googlebot/WhatsApp/ClaudeBot, hreflang, redirect, header keamanan) | 41/41 lulus | 27 Sep 2026 |
| Chat support + import pembayaran + diagnosis portal | 26/26 lulus | 27 Sep 2026 |
| Smoke test produksi setelah deploy | lulus (#125, #126) | 27 Sep 2026 |
| Audit SEO produksi (xaa.es) | 93% | 27 Sep 2026 |

---

## 5. Template SaaS: status sebenarnya

| Tier | Template | Harga | Katalog dan halaman | Pembayaran | Produk (source code) | Demo |
|---|---|---|---|---|---|---|
| Starter | waitlist, linkinbio, formbuilder | €390–€690 | ✅ | ✅ | ❌ belum dibangun | ❌ |
| Business | CRM, invoicing, booking, e-commerce, helpdesk, project management, LMS, restaurant, subscription box | €1.190–€1.990 | ✅ | ✅ | ❌ belum dibangun | ❌ |
| Enterprise/Super | multi-tenant SaaS kit, marketplace, ERP suite, AI SaaS platform | €40.000–€180.000 | ✅ | ✅ | ❌ belum dibangun | ❌ |

Setelah bayar, pembeli melihat status "bundle sedang disiapkan" sampai studio
melampirkan file zip. Melampirkan zip butuh R2 (belum aktif). **Template ini belum
bisa disebut "100% berfungsi"**: produknya sendiri harus dibangun satu per satu.
Template harga super perlu proyek tersendiri beserta demo yang benar-benar hidup.

---

## 6. Belum dikerjakan / tindakan berikutnya

| Prioritas | Pekerjaan | Siapa | Catatan |
|---|---|---|---|
| Tinggi | Aktifkan R2 di dashboard Cloudflare (R2 → Purchase/Enable, paket gratis 10 GB) | Pemilik | Setelah aktif, deploy berikutnya otomatis memasang binding `UPLOADS`; unggah file dan bundle template langsung jalan |
| Tinggi | Tekan "Import company accounts (crypto + BNI)" sekali di `/portal/admin/payments` | Pemilik | Tanpa ini klien belum melihat tujuan pembayaran perusahaan |
| Tinggi | Bangun produk template SaaS (mulai dari yang paling laku), lengkap dengan demo | Studio | Lihat bagian 5 |
| Sedang | Performa mobile: skor 47, LCP 4,9 dtk, TBT 3,7 dtk (lab) | Studio | Kurangi JavaScript di halaman depan; muat widget chat secara malas (lazy) |
| Sedang | Font: preload / `font-display: swap` | Studio | Temuan audit ⚠️ |
| Sedang | Waktu respons server 1,36 dtk dari runner GitHub | Studio | Cache halaman statis di edge |
| Rendah | Verifikasi Bing Webmaster Tools | Pemilik | Impor dari Google Search Console |
| Rendah | Sertifikat kemitraan: cek tanggal "Friday, 14 October 2026" dan ejaan "XAIA.ES" | Pemilik | Ditandai dan belum diubah; perlu konfirmasi |
| ⏸️ | SEO situs lain (ulyah.com, axto.us, dll.) | — | Ditunda atas permintaan pemilik |

---

## 7. Rincian fitur terbaru

### Chat support (permintaan 17–20)

- **Pengunjung:** tombol "💬 Chat with us" di semua halaman publik (EN/ES/ID), pilihan topik, nama, email, pesan.
- **Keamanan percakapan:** percakapan terikat cookie `xaa_support` (httpOnly, secure, 90 hari), jadi browser lain tidak bisa membacanya.
- **Admin online:** selama halaman `/portal/admin/support` terbuka, admin dianggap online (heartbeat 20 detik, jendela 90 detik) dan AI diam.
- **Admin offline:** AI ulyah.com (`https://api.ulyah.com/ai/reader`, bisa diganti lewat env `SUPPORT_AI_URL`) menjawab dari paket pengetahuan publik (`src/server/support-kb.ts`).
- **Batas:** maksimal 25 balasan AI per percakapan, 40 pesan per jam, dan honeypot anti-bot.
- **Penyaring:** kunci API, alamat 0x/BTC/TRX/DOGE/SOL, rangkaian hex panjang, dan angka 10+ digit diganti `[removed]`. Alamat pembayaran hanya muncul di invoice portal klien.
- **Form kontak:** masuk sebagai percakapan bersumber "contact form".

### Pembayaran (permintaan 15–16)

- **Sumber data:** `src/content/company-payments.ts`, diambil dari repo publik ulyah.com (alamat penerima saja, tidak bisa dipakai menarik dana).
- **Crypto:** USDT TRC20, USDT/BNB BEP20, BTC, SOL, DOGE.
- **BNI wondr:** 6 akun aktif (EUR, USD, IDR, GBP, AUD, SGD) dan 7 nonaktif (CNY, HKD, JPY, MYR, SAR, KRW, THB).
- **Penyimpanan:** tersimpan terenkripsi AES-GCM di D1 dan tampil tersamar di daftar admin (tombol reveal).

### Diagnosis portal (permintaan 14)

- `/api/portal/diagnose` (khusus admin) menjalankan setiap loader portal.
- Bila `/portal` gagal, kotak merah di halaman error menampilkan langkah mana yang gagal beserta pesannya.

---

## 8. Di luar repo: CV dan lamaran kerja (Yusron Efendi)

| Pekerjaan | Status | Catatan |
|---|---|---|
| CV PDF ramah ATS (2 halaman) | ✅ | Jujur soal pengembangan dibantu AI (Claude Code); Docker/CI/Cloudflare disetel dan diuji sendiri |
| Cover letter | ✅ | Komitmen belajar bahasa negara tujuan; status: paspor saja, belum punya izin kerja |
| Portofolio PDF (semua situs di GitHub) | ✅ | 13 domain, 4 sistem klien, sekitar 380 ribu baris |
| Paket lamaran (surat + CV + ijazah asli + terjemahan tersumpah) | ✅ | Tanpa screenshot, sesuai permintaan |
| Teks profil Indeed siap tempel | ✅ | File `Indeed_Profile_ID.md` |
| Daftar lowongan yang menerima pelamar dari Indonesia | ✅ | File `Job_Tracker.md` |
| Melamar via Indeed | 🟡 | Konektor Indeed hanya bisa mencari; tidak ada fungsi melamar atau mengubah profil. Pemilik menekan tombol Apply sendiri |
| Melamar via email (lowongan yang minta CV lewat email) | 🟡 | Gmail tersambung di akun tetapi dimatikan untuk chat ini; draf email sudah disiapkan |

---

## 9. Changelog blueprint

- **27 Sep 2026**: blueprint dibuat. Tercatat: chat support, pembayaran, diagnosis portal, judul SEO unik per bahasa, tes E2E masuk repo, status CV/Indeed.
