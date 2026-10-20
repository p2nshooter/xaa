# Blueprint data R2 — xaa.es

Ditulis 20 Okt 2026 atas perintah pemilik. Bagian 1–6 sama dengan blueprint axto.io (repo guardian-ai,
`docs/R2-DATA-BLUEPRINT.md`); bagian 7–9 khusus xaa.es.

## 1. Perintah pemilik

> „Database semuanya ke R2 ya, jgn ada yg ke d1... Manfaatin R2, penuhin disana, baik xaa.es maupun axto.io.. Hemat
> D1 maximalin R2, sy siap bayar 100-1000GB buat xaa.es & axto.io" — 20 Okt 2026

> „Blue print setiap logika di axto & xaa wajib kuat, kumplit, komplex mudah di gunakan, termasuk animasi panduan untuk
> customer, jika bluprint sudah sangat kuat dan sudah 100% siap produksi bukan sampah langsung kerjakan dengan live
> payment, jgn ada sampah app" — 20 Okt 2026

Artinya: **tidak ada lagi data aplikasi di D1**. Semua data (akun, pesanan, pembayaran, lisensi, pengaturan, log,
dukungan, investor) dan semua file disimpan di **R2**. Kualitasnya tidak boleh turun: tidak boleh ada email terdaftar
dua kali, pembayaran terkonfirmasi dua kali, atau lisensi terbit dua kali.

## 2. Fakta yang mendasari (diperiksa 20 Okt 2026)

| Hal | Fakta |
|---|---|
| Masalah lama | Kuota baca D1 harian (paket gratis, **dibagi semua database dalam satu akun**) pernah habis dan mematikan login xaa.es. Di akun yang sama ada `ulyah-db` (484 MB) — pemakai kuota terbesar. Dengan pindah ke R2, xaa.es dan axto.io tidak lagi ikut mati bila kuota D1 habis |
| Ukuran data sekarang | xaa.es `xaa-portal` 266 KB; axto.io `axto-db` (akun Cloudflare axto.io sendiri) ±1 MB. Data akun & transaksi berukuran MB, bukan GB |
| R2 | Aktif. Bucket yang ada: `xaa-uploads`, `axto-assets`, `axto-build`, … (akun xaa/ulyah); axto.io memakai `axto-storage`, `axto-documents`, `axto-builds` di akunnya sendiri |
| Jaminan R2 (dokumentasi Cloudflare, „Consistency model", diperbarui 14 Okt 2026) | **Konsisten kuat secara global** untuk baca-setelah-tulis, metadata, hapus, **dan list**. Tulis bersyarat (`If-None-Match: *`, `If-Match: <etag>`) **dievaluasi atomik** saat commit: dari dua tulis yang bersaing, paling banyak satu yang berhasil (412 untuk yang lain) |
| Harga R2 (Standard) | Simpan $0,015/GB-bulan · Kelas A (tulis/list) $4,50 per juta · Kelas B (baca) $0,36 per juta · egress gratis · gratis per bulan: 10 GB, 1 juta Kelas A, 10 juta Kelas B |

Dengan jaminan di atas, R2 bisa dipakai sebagai database dokumen yang **benar** (tanpa data dobel atau saling timpa),
asalkan setiap tulisan mengikuti aturan di bagian 3. Anggaran 100–1000 GB pemilik terpakai terutama untuk **file**
(unggahan klien, bundle template, build Docker/EXE, video & animasi panduan, backup harian), bukan untuk data akun.

## 3. Desain penyimpanan: „R2 Store"

Satu pustaka kecil yang sama di kedua repo (`r2store`), dengan tes yang sama.

### 3.1 Bucket

| Situs | Bucket data (privat) | Bucket file (sudah ada / tetap) | Bucket backup (privat) |
|---|---|---|---|
| xaa.es | `xaa-data` | `xaa-uploads` | `xaa-backups` (aturan siklus hidup 35 hari) |
| axto.io | `axto-data` | `axto-storage`, `axto-documents`, `axto-builds` | `axto-backups` (35 hari) |

Bucket dibuat otomatis oleh CI sebelum deploy (xaa: `scripts/ensure-cloudflare-resources.sh`; axto: langkah
`wrangler r2 bucket create … || true` di workflow deploy). Tidak ada akses publik pada bucket data dan backup.

### 3.2 Bentuk kunci

```
c/<koleksi>/<id>.json                       satu dokumen = satu objek JSON (sumber kebenaran)
u/<koleksi>/<field>/<sha256(nilai)>         penjaga keunikan (isi: id dokumen) — dibuat dengan If-None-Match: *
i/<koleksi>/<index>/<nilai>/<urut>_<id>     entri index (badan kosong; customMetadata = ringkasan untuk daftar)
n/<nama>                                    penghitung / ringkasan (diperbarui dengan If-Match)
l/<koleksi>/<yyyy>/<mm>/<dd>/<urut>_<id>    log append-only (audit, event) — tulis sekali, tidak pernah diubah
k/<kunci>                                   pengaturan (satu objek per kunci; nilai rahasia terenkripsi AES-GCM)
```

- **ID** dibuat urut waktu (ULID: 48 bit milidetik + 80 bit acak, base32 Crockford) sehingga `list()` yang menurut
  urutan leksikografis sekaligus urut waktu. Untuk urutan terbaru-dulu, `<urut>` = `(9999999999999 − ms)` dengan lebar
  tetap.
- Nilai dalam kunci index dinormalisasi (huruf kecil, di-encode URI) dan dipotong; nilai bebas/panjang di-hash.
- `customMetadata` (maks. 2 KB per objek) menyimpan kolom yang ditampilkan di daftar, sehingga halaman daftar cukup
  memanggil `list({ prefix, include: ['customMetadata'] })` — **satu operasi untuk sampai 1000 baris**, tanpa
  membaca dokumen satu per satu.

### 3.3 Operasi dan aturan tulis

| Operasi | Cara di R2 | Jaminan |
|---|---|---|
| Baca | `get(c/…)` → JSON + etag | selalu data terbaru (konsisten kuat) |
| Buat | `put(c/…, { onlyIf: If-None-Match: * })` | tidak pernah menimpa dokumen yang ada |
| Ubah | baca etag → ubah di memori → `put(…, { onlyIf: { etagMatches } })`; bila `null` (412): baca ulang dan ulangi, maks. 6 kali dengan jeda acak | tidak ada perubahan yang hilang karena dua permintaan bersamaan |
| Unik (email, nomor faktur, kode, order PayPal) | `put(u/…, id, If-None-Match: *)` **sebelum** dokumen dibuat; bila 412 → „sudah dipakai" | dua pendaftaran bersamaan dengan email yang sama: tepat satu berhasil |
| Hapus | hapus entri index → dokumen → penjaga keunikan | — |
| Daftar & filter | `list` pada prefix index (+ `cursor` untuk halaman berikutnya) | konsisten kuat |
| Hitung / jumlah | dokumen ringkasan `n/…` diperbarui dengan If-Match pada setiap perubahan yang relevan; dihitung ulang penuh tiap malam | angka dasbor tepat dan murah dibaca |

**Urutan tulis untuk satu perubahan yang menyentuh beberapa objek:** penjaga keunikan → dokumen utama → entri index →
ringkasan. Dokumen utama selalu yang menentukan kebenaran:
- pembaca yang menemukan entri index tanpa dokumen (atau yang isinya tidak cocok) melewatinya dan menghapusnya
  (perbaikan malas);
- tugas **rekonsiliasi** terjadwal (cron) membangun ulang semua index & ringkasan dari dokumen utama, dan menghapus
  penjaga keunikan yatim yang berumur > 15 menit.

### 3.4 Uang dan lisensi: tidak boleh dobel

- Perubahan status pembayaran/pesanan adalah **transisi bersyarat pada satu dokumen** (`pending → paid` dengan
  If-Match). Webhook PayPal, tombol admin „Pembayaran diterima" dan pengecekan ulang otomatis bisa datang bersamaan —
  hanya satu yang menang; yang lain membaca status terbaru dan berhenti.
- Lisensi, faktur dan email konfirmasi memakai **ID deterministik** dari pesanan (mis. `lic_<orderId>_<produk>`,
  nomor faktur dari penghitung dengan If-Match) dan dibuat dengan If-None-Match: * → menjalankan ulang langkah yang
  sama tidak pernah menerbitkan dua lisensi/faktur.
- Setiap transisi juga menulis entri log audit append-only (`l/audit/…`) yang berantai hash (seperti sekarang).

### 3.5 Kinerja dan biaya

- Halaman publik tidak membaca data per permintaan (katalog, harga, teks = kode). Pengaturan yang sering dibaca (metode
  pembayaran aktif, konfigurasi platform) disimpan di memori isolate maks. 30 detik dan langsung dibuang saat ditulis.
  **Data uang tidak pernah di-cache.**
- Perkiraan biaya bulanan pada trafik 100.000 kunjungan/bulan: ±300 ribu baca + ±30 ribu tulis/list → masih di dalam
  kuota gratis R2. Biaya utama adalah penyimpanan file (100 GB ≈ $1,50/bulan; 1000 GB ≈ $15/bulan).
- Batas yang diperhitungkan: `list` 1000 kunci per panggilan (pakai cursor), `customMetadata` 2 KB, objek dokumen
  dijaga < 256 KB (riwayat panjang dipindah ke log/arsip).

### 3.6 Keamanan

- Bucket data dan backup privat; diakses hanya lewat binding Worker. Tidak ada URL publik, tidak ada token R2 di kode.
- Rahasia (kunci API pembayaran, kunci AI pengguna, rekening) dienkripsi AES-GCM di aplikasi sebelum disimpan
  (kunci dari secret Worker), sama seperti sekarang. Kata sandi: PBKDF2. Token reset/sesi: hanya hash yang disimpan.
- Data pribadi bisa diekspor dan dihapus per akun (hapus = dokumen + index + penjaga keunikan + file milik akun).

### 3.7 Backup dan pemulihan

- Cron harian menulis `backups/<yyyy-mm-dd>/<koleksi>.jsonl.gz` ke bucket backup (aturan siklus hidup 35 hari) +
  `manifest.json` (jumlah dokumen dan SHA-256 tiap file).
- Alat pemulihan (khusus admin) memuat ulang satu koleksi atau semuanya dari tanggal tertentu, lalu menjalankan
  rekonsiliasi. Pemulihan diuji di CI pada data contoh setiap rilis.

### 3.8 Pengujian (wajib lulus sebelum tayang)

1. **R2 palsu di memori** dengan semantik yang sama persis (If-None-Match, If-Match/etag, list urut + cursor +
   customMetadata, batas 2 KB). Tes: 50 tulis bersamaan ke satu dokumen → tidak ada yang hilang; 20 pendaftaran
   bersamaan dengan email sama → tepat 1 berhasil; 10 konfirmasi pembayaran bersamaan → tepat 1 transisi + 1 lisensi.
2. Tes modul per modul dengan R2 palsu (semua alur yang dulu memakai SQL).
3. E2E di runtime Cloudflare lokal (`wrangler dev`, R2 lokal Miniflare) — alur portal, pembayaran (sandbox),
   admin, dan migrasi.
4. Uji migrasi: salinan data D1 → R2, jumlah & checksum per tabel harus sama.

## 4. Migrasi D1 → R2 (per situs, tanpa kehilangan data atau pembayaran)

1. **Rilis A — kode baru, data lama.** Semua modul memakai R2 Store; rute admin `POST /api/admin/migrate-d1`
   (khusus pemilik, idempoten) membaca setiap tabel D1 dan menulis dokumen + index + penjaga keunikan ke R2 dengan
   ID yang sama. Laporan: jumlah baris D1 vs dokumen R2 per tabel + checksum.
2. **Jendela pindah (± 2 menit).** Spanduk „pemeliharaan singkat" di checkout; tulis ke D1 dihentikan; migrasi
   dijalankan sekali lagi (hanya selisih); laporan harus 100 % cocok; saklar `DATA_BACKEND=r2` aktif. Pembayaran
   yang datang lewat webhook selama jendela ditahan PayPal dan dikirim ulang (PayPal mengulang webhook yang gagal).
3. **Pengamatan 7 hari.** D1 tetap ada tetapi hanya-baca sebagai cadangan; ekspor D1 terakhir disimpan di bucket
   backup.
4. **Rilis B — D1 dilepas.** Binding D1 dihapus dari konfigurasi; kode SQL dihapus; database D1 lama dihapus pemilik
   (atau dibiarkan kosong). Mulai di sini **tidak ada yang ke D1**.

KV (axto.io: batas laju & cache kecil) **bukan D1** dan tetap dipakai untuk batas laju, karena menulis R2 pada setiap
permintaan untuk batas laju justru mahal (Kelas A). Bila pemilik ingin KV juga dipindah, batas laju dipindah ke
penghitung R2 per menit (lihat bagian 3.3).

## 5. Animasi panduan untuk pelanggan

Setiap alur penting punya **klip animasi pendek (WebP, 6–15 detik) + langkah tertulis**, direkam otomatis oleh
Playwright pada runtime lokal dengan data contoh (cara yang sama dengan galeri template Waitlist), dalam bahasa situs:

- ditampilkan di halaman **Panduan** (`/guides`) dengan SEO (HowTo JSON-LD, sitemap);
- tombol **„Lihat panduan"** di tempat alur itu dipakai (checkout, portal, admin) membuka klip dalam dialog;
- bila pengunjung meminta gerak minimal, hanya poster + langkah tertulis yang tampil;
- klip disimpan di R2 (bucket file) dan dibuat ulang setiap kali alurnya berubah (skrip `npm run guides`).

Klip pembayaran direkam pada **mode sandbox di lokal**, tidak pernah dengan uang sungguhan, dan diberi label
„ilustrasi". Daftar klip per situs ada di bagian 7.

## 6. Pembayaran live

Semua metode tetap bisa **Live** dari Admin → Pembayaran (kunci ditempel pemilik, disimpan terenkripsi — tidak pernah
di repo). Setelah migrasi R2, pengaturan pembayaran tersimpan di `k/…` R2 (terenkripsi). Daftar periksa sebelum
tayang: tombol uji per metode hijau, webhook PayPal Live terdaftar otomatis, satu transaksi kecil sungguhan per metode
oleh pemilik, dan alur lisensi/unduhan otomatis berjalan (zero-touch).

## 7. xaa.es — peta tabel D1 → koleksi R2

Sumber: skema `src/server/db.ts` dan ±118 query di `src/server/*.ts` (dibaca 20 Okt 2026). Tabel `sessions` tidak
dipakai lagi (sesi = cookie bertanda tangan, `src/server/session.ts`) dan tidak dipindah.

| Tabel D1 | Dokumen R2 | Penjaga keunikan | Index (untuk daftar/filter) | Ringkasan |
|---|---|---|---|---|
| `users` | `c/users/<id>` | `email` | `role` | jumlah akun |
| `projects` | `c/projects/<id>` | `ref` | per klien (terbaru dulu) · semua (admin) · per status | jumlah per status |
| `payments` | `c/payments/<id>` | `invoice_no` | per proyek · per status + tanggal konfirmasi (laporan pendapatan) · per metode (pengecekan PayPal) | pendapatan per bulan |
| `files` | `c/files/<id>` (berkasnya tetap di `xaa-uploads`) | — | per proyek | — |
| `updates` | `c/updates/<id>` | — | per proyek (terbaru dulu) | — |
| `enquiries` | `c/enquiries/<id>` | — | semua (terbaru) · per status | jumlah „baru" (lencana admin) |
| `app_secrets` | `k/secret/<key>` (terenkripsi bila rahasia) | — | — | — |
| `app_settings` | satu dokumen `k/settings` (peta kunci → nilai; nilai rahasia terenkripsi) | — | — | — |
| `payment_methods` | satu dokumen `k/payment-methods` (daftar terurut; alamat/rekening terenkripsi) | — | — | — |
| `project_ai` | `c/project_ai/<projectId>` | — | — | — |
| `recovery_events` | `c/recovery_events/<id>` | — | per proyek (terbaru) · per proyek + jenis | — |
| `template_orders` | `c/template_orders/<id>` | `ref` | per klien · semua (admin) · per klien + template (pesanan terbuka) · per status + tanggal konfirmasi | pendapatan per bulan |
| `paypal_checkouts` | `c/paypal_checkouts/<id>` | `paypal_order_id` | per proyek · per pembayaran · per pesanan template · „terbuka" (untuk pengecekan ulang otomatis) | — |
| `investors` | `c/investors/<id>` | — | per email · per status · semua | total modal terverifikasi |
| `investor_payouts` | `c/investor_payouts/<id>` | — | per investor (urut periode) · semua | total dibayar |
| `template_bundles` | `c/template_bundles/<slug>` (zip di `xaa-uploads`) | — | — | — |
| `support_threads` | `c/support_threads/<id>` | `token` | terbaru diperbarui · belum dibaca admin | jumlah belum dibaca |
| `support_messages` | log `l/support/<threadId>/<ulid>` (append-only) | — | (prefix log = urutan pesan; „pesan sesudah X" = `startAfter`) | — |

Transisi uang yang dijaga dengan If-Match (bagian 3.4) — nama status persis seperti di kode sekarang:
`payments.status` (pending → confirmed / rejected), `template_orders.status` (pending → submitted → paid /
cancelled), `paypal_checkouts.status` (created → capturing → pending / completed / cancelled / failed; „capturing"
sudah merupakan klaim atomik di D1 dan menjadi If-Match di R2), `investors.status` (applied → verified → returned /
declined). Nomor faktur: penghitung `n/invoice-seq` + penjaga `u/payments/invoice_no`.

## 8. xaa.es — animasi panduan

| # | Panduan | Tempat tombol „Lihat panduan" |
|---|---|---|
| 1 | Membeli template SaaS: pilih, coba demo + akun demo, beli | `/templates/<slug>`, portal → Live demos |
| 2 | Membayar dengan PayPal | panel bayar pesanan & milestone |
| 3 | Membayar dengan transfer bank BNI (EUR / USD) + unggah bukti | panel bayar |
| 4 | Membayar dengan USDT (TRC20 / ERC20 / BEP20) + kirim hash transaksi | panel bayar |
| 5 | Mengunduh bundle template setelah dibayar | portal → pesanan |
| 6 | Membuka proyek studio: pilih paket, unggah konsep, bayar uang muka | `/services`, portal → proyek baru |
| 7 | Melacak progres proyek, membayar milestone, menerima serah terima | portal → proyek |
| 8 | Menjadi investor: ajukan, kirim modal, lihat laporan bulanan | `/invest`, portal → investor |
| 9 | Memasang aplikasi xaa.es di HP (Android & iPhone) | bilah pasang |
| 10 | Chat dukungan | widget dukungan |
| A1–A6 | (admin) konfirmasi pembayaran · metode pembayaran Live · lampirkan bundle · progres proyek · prospek · investor | portal admin |

Bahasa: EN, ES, ID.

## 9. Status

| Butir | Status |
|---|---|
| Blueprint R2 (dokumen ini) | ✅ 20 Okt |
| Pustaka R2 Store + R2 palsu + tes konkurensi | ⏳ |
| Modul dipindah ke R2 (19 tabel) | ⏳ 0/19 |
| Rute migrasi D1 → R2 + laporan cocok 100 % | ⏳ |
| Jendela pindah + pengamatan 7 hari | ⏳ |
| D1 dilepas | ⏳ |
| Animasi panduan (10 + 6 admin) | ⏳ 0/16 |
